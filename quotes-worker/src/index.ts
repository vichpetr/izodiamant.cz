// izodiamant-quotes – interní API pro cenové nabídky.
//
// Není na internetu (workers_dev = false, žádné routy): volá ho jen admin webu
// /sprava přes service binding QUOTES (autorizaci řeší web – Google login +
// ADMIN_EMAILS) a cron. Kdo akci spustil, posílá web v hlavičce X-Admin-Email.

import { SPREADSHEET_TYPES, attachedVykazFiles, isSpreadsheet, versionFilename, vykazFilename, type QuoteFile } from '../../src/lib/quotes/model';
import { maybeAutoGenerate, queueAttachment, runAttachmentJob } from './attachments';
import { getFile, getItems, getQuote, getState, logQuoteMessage, updateQuote } from './db';
import { flag, mailboxConfigured, nowIso, type Env, type Job } from './env';
import { UserError, draftEmailText, emailVersion, generateQuote } from './generate';
import { pollInbox } from './inbox';
import { saveDraft, sendMail, type OutgoingMail } from './mailbox';
import { pdfToImages } from './plans';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOADS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

/** Typ nahraného souboru, nebo null = nepodporovaný. Tabulky i podle přípony (prohlížeče je hlásí různě). */
function uploadType(file: File): string | null {
  if (ALLOWED_UPLOADS.includes(file.type)) return file.type;
  const ext = /\.(xlsx|xls|csv)$/i.exec(file.name)?.[1]?.toLowerCase();
  return ext ? SPREADSHEET_TYPES[ext] : null;
}

const json = (data: unknown, status = 200) => Response.json(data, { status });

async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const admin = request.headers.get('X-Admin-Email');
  const parts = url.pathname.split('/').filter(Boolean);
  const method = request.method;

  if (method === 'GET' && url.pathname === '/status') {
    const last = await getState(env, 'inbox_last');
    return json({
      environment: env.ENVIRONMENT,
      mailbox: env.MAILBOX_USER || null,
      mailboxConfigured: mailboxConfigured(env),
      inboxEnabled: flag(env.INBOX_ENABLED),
      sendEnabled: flag(env.SEND_ENABLED),
      archiveFolder: env.INBOX_ARCHIVE_FOLDER,
      models: {
        triage: env.AI_TRIAGE_MODEL,
        attachment: env.AI_ATTACHMENT_MODEL,
        extract: env.AI_EXTRACT_MODEL,
        text: env.AI_TEXT_MODEL,
        fallback: env.AI_FALLBACK_MODEL,
      },
      // Jen jestli klíč je – hodnota secretu nikdy neopustí worker.
      aiKeyConfigured: Boolean(env.OPENCODE_API_KEY || env.ANTHROPIC_API_KEY),
      lastPoll: last ? JSON.parse(last) : null,
    });
  }

  if (method === 'POST' && url.pathname === '/inbox/poll') {
    return json({ ok: true, result: await pollInbox(env, { manual: true }) });
  }

  // POST /inbox/:id/retry – smaže záznam o chybném zpracování, příští běh zprávu zpracuje znovu.
  if (method === 'POST' && parts[0] === 'inbox' && parts[2] === 'retry') {
    await env.DB.prepare(`DELETE FROM inbox_messages WHERE id = ? AND status = 'chyba'`).bind(Number(parts[1])).run();
    return json({ ok: true });
  }

  // GET /files?key=… – stažení PDF / přílohy z R2 (jen klíče nabídek a příloh).
  if (method === 'GET' && url.pathname === '/files') {
    const key = url.searchParams.get('key') ?? '';
    if (!/^(nabidky|prilohy)\//.test(key) || key.includes('..')) return json({ error: 'Neplatný klíč.' }, 400);
    const object = await env.BUCKET.get(key);
    if (!object) return json({ error: 'Soubor neexistuje.' }, 404);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'private, no-store');
    return new Response(object.body, { headers });
  }

  // POST /files/delete { keys } – úklid R2 po smazání nabídky.
  if (method === 'POST' && url.pathname === '/files/delete') {
    const { keys } = (await request.json().catch(() => ({ keys: [] }))) as { keys?: unknown };
    const valid = (Array.isArray(keys) ? keys : []).filter((k): k is string => typeof k === 'string' && /^(nabidky|prilohy)\//.test(k));
    if (valid.length) await env.BUCKET.delete(valid);
    return json({ ok: true, deleted: valid.length });
  }

  // GET /files/:id/preview – náhled přílohy k rychlé kontrole v adminu.
  // Obrázek se vrátí rovnou, u PDF se vykreslí první stránka a uloží do R2,
  // takže druhé otevření už je okamžité.
  if (method === 'GET' && parts[0] === 'files' && parts[2] === 'preview') {
    const file = await getFile(env, Number(parts[1]));
    if (!file) return json({ error: 'Soubor neexistuje.' }, 404);

    if (file.content_type.startsWith('image/')) {
      const object = await env.BUCKET.get(file.r2_key);
      if (!object) return json({ error: 'Soubor v úložišti chybí.' }, 404);
      return new Response(object.body, { headers: { 'Content-Type': file.content_type } });
    }
    if (file.content_type !== 'application/pdf' || isSpreadsheet(file)) return json({ error: 'Náhled není k dispozici.' }, 415);

    const previewKey = `${file.r2_key}.nahled.jpg`;
    const cached = await env.BUCKET.get(previewKey);
    if (cached) return new Response(cached.body, { headers: { 'Content-Type': 'image/jpeg' } });

    const source = await env.BUCKET.get(file.r2_key);
    if (!source) return json({ error: 'Soubor v úložišti chybí.' }, 404);
    const [firstPage] = await pdfToImages(env, await source.arrayBuffer(), 1);
    if (!firstPage) throw new UserError('Náhled PDF se nepodařilo vykreslit.');
    await env.BUCKET.put(previewKey, firstPage.data, { httpMetadata: { contentType: 'image/jpeg' } });
    return new Response(firstPage.data, { headers: { 'Content-Type': 'image/jpeg' } });
  }

  // POST /files/:id/analyze { hint?, force? } – zařadí zpracování přílohy do fronty a hned se vrátí.
  // Ruční „Přečíst“ je force (čte i to, co AI označila za nerelevantní).
  if (method === 'POST' && parts[0] === 'files' && parts[2] === 'analyze') {
    const file = await getFile(env, Number(parts[1]));
    if (!file) return json({ error: 'Soubor neexistuje.' }, 404);
    const body = (await request.json().catch(() => ({}))) as { hint?: string; force?: boolean };
    await queueAttachment(env, file.id, body.hint?.slice(0, 500) || null, body.force !== false);
    return json({ ok: true, pending: true }, 202);
  }

  if (parts[0] !== 'quotes' || !parts[1]) return json({ error: 'Nenalezeno.' }, 404);
  const quoteId = Number(parts[1]);
  if (!Number.isInteger(quoteId)) return json({ error: 'Neplatné id.' }, 400);
  const action = parts[2];

  if (method === 'POST' && action === 'generate') {
    const body = (await request.json().catch(() => ({}))) as { force?: boolean };
    return json({ ok: true, ...(await generateQuote(env, quoteId, { createdBy: admin, force: body.force === true })) });
  }

  if (method === 'POST' && action === 'email-text') {
    const quote = await getQuote(env, quoteId);
    if (!quote) return json({ error: 'Nabídka neexistuje.' }, 404);
    const text = await draftEmailText(env, quote, await getItems(env, quoteId));
    await updateQuote(env, quoteId, text);
    return json({ ok: true, ...text });
  }

  // POST /quotes/:id/plans – multipart `files` (+ volitelně `hint`): uloží do R2 a zařadí ke čtení.
  if (method === 'POST' && action === 'plans') {
    const quote = await getQuote(env, quoteId);
    if (!quote) return json({ error: 'Nabídka neexistuje.' }, 404);
    const form = await request.formData();
    const hint = String(form.get('hint') ?? '').slice(0, 500) || null;
    const uploads = form.getAll('files').filter((f): f is File => typeof f !== 'string');
    if (uploads.length === 0) return json({ error: 'Nevybrali jste žádný soubor.' }, 400);
    const saved: Pick<QuoteFile, 'id' | 'filename' | 'analysis'>[] = [];
    for (const upload of uploads.slice(0, 5)) {
      const type = uploadType(upload);
      if (!type) throw new UserError(`${upload.name}: podporované jsou JPG, PNG, WEBP, PDF a výkazy XLSX/XLS/CSV.`);
      if (upload.size > MAX_UPLOAD_BYTES) throw new UserError(`${upload.name}: soubor je větší než 10 MB.`);
      const data = await upload.arrayBuffer();
      const filename = upload.name.replace(/[/\\]/g, '_').slice(0, 120);
      const key = `prilohy/${quoteId}/${crypto.randomUUID()}-${filename}`;
      await env.BUCKET.put(key, data, { httpMetadata: { contentType: type } });
      const res = await env.DB.prepare(
        `INSERT INTO quote_files (quote_id, r2_key, filename, content_type, size, kind, analysis, created_at) VALUES (?, ?, ?, ?, ?, 'plan', NULL, ?)`,
      )
        .bind(quoteId, key, filename, type, data.byteLength, nowIso())
        .run();
      const fileId = Number(res.meta.last_row_id);
      // I ručně nahraný soubor se nejdřív ohodnotí – silný model čte jen relevantní
      // (nerelevantní jde v adminu přečíst tlačítkem „Přečíst“).
      await queueAttachment(env, fileId, hint, false);
      saved.push({ id: fileId, filename, analysis: null });
    }
    return json({ ok: true, files: saved });
  }

  // POST /quotes/:id/draft | /send – koncept do schránky / přímé odeslání.
  // Příloha = zvolená verze (email_version), jinak poslední; k ní vyplněný výkaz.
  if (method === 'POST' && (action === 'draft' || action === 'send')) {
    const quote = await getQuote(env, quoteId);
    if (!quote) return json({ error: 'Nabídka neexistuje.' }, 404);
    if (!quote.client_email) throw new UserError('Nabídka nemá e-mail klienta.');
    if (!quote.number) throw new UserError('Nejdřív vygenerujte PDF.');
    if (!quote.email_subject || !quote.email_body) throw new UserError('Chybí předmět nebo text e-mailu.');
    const version = await emailVersion(env, quote);
    const pdfKey = version?.pdf_key ?? quote.pdf_key;
    if (!pdfKey) throw new UserError('Nejdřív vygenerujte PDF.');
    const pdf = await env.BUCKET.get(pdfKey);
    if (!pdf) throw new UserError('PDF v úložišti chybí – vygenerujte ho znovu.');

    const attachments: NonNullable<OutgoingMail['attachments']> = [
      { filename: versionFilename(quote.number, version?.version ?? 1), data: await pdf.arrayBuffer(), mimeType: 'application/pdf' },
    ];
    // Vyplněné výkazy jen ty, u jejichž zdroje je zaškrtnuté „přiložit k e-mailu“.
    const quoteFiles = version
      ? (await env.DB.prepare('SELECT id, include_in_email, analysis FROM quote_files WHERE quote_id = ?').bind(quoteId).all<Pick<QuoteFile, 'id' | 'include_in_email' | 'analysis'>>()).results
      : [];
    for (const file of version ? attachedVykazFiles(version, quoteFiles) : []) {
      const vykaz = await env.BUCKET.get(file.key);
      if (vykaz) {
        attachments.push({
          filename: vykazFilename(quote.number, version!.version, file.technology),
          data: await vykaz.arrayBuffer(),
          mimeType: SPREADSHEET_TYPES.xlsx,
        });
      }
    }

    let inReplyTo: string | null = null;
    if (quote.inbox_message_id) {
      const src = await env.DB.prepare('SELECT message_id FROM inbox_messages WHERE id = ?').bind(quote.inbox_message_id).first<{ message_id: string }>();
      inReplyTo = src?.message_id ?? null;
    }
    const mail: OutgoingMail = { to: quote.client_email, subject: quote.email_subject, text: quote.email_body, inReplyTo, attachments };
    const label = version ? ` (verze ${version.version})` : '';
    const log = { quoteId, direction: 'out' as const, subject: `${quote.email_subject}${label}`, counterpart: quote.client_email, createdBy: admin };
    try {
      if (action === 'draft') {
        const { messageId, folder } = await saveDraft(env, mail);
        await logQuoteMessage(env, { ...log, kind: 'draft', messageId, status: 'ok' });
        return json({ ok: true, folder, version: version?.version ?? null, attachments: attachments.map((a) => a.filename) });
      }
      const { messageId } = await sendMail(env, mail);
      await logQuoteMessage(env, { ...log, kind: 'sent', messageId, status: 'ok' });
      await updateQuote(env, quoteId, { status: 'odeslano' });
      if (version) await env.DB.prepare('UPDATE quote_versions SET sent_at = ? WHERE id = ?').bind(nowIso(), version.id).run();
      return json({ ok: true, version: version?.version ?? null });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await logQuoteMessage(env, { ...log, kind: action === 'draft' ? 'draft' : 'sent', messageId: null, status: 'error', error: message });
      throw new UserError(message);
    }
  }

  return json({ error: 'Nenalezeno.' }, 404);
}

export default {
  async fetch(request, env): Promise<Response> {
    try {
      return await handle(request, env);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!(err instanceof UserError)) console.error('quotes-worker:', err);
      return json({ error: message }, err instanceof UserError ? 400 : 500);
    }
  },

  // Consumer fronty: hodnocení a čtení příloh, automatické PDF (limit 15 min na dávku).
  async queue(batch, env): Promise<void> {
    for (const message of batch.messages) {
      try {
        const job = message.body;
        if (job?.type === 'attachment' || job?.type === 'plan') await runAttachmentJob(env, job);
        else if (job?.type === 'autogen') await maybeAutoGenerate(env, job.quoteId);
        message.ack();
      } catch (err) {
        console.error('Úloha z fronty selhala:', err);
        message.retry();
      }
    }
  },

  async scheduled(_event, env, ctx): Promise<void> {
    ctx.waitUntil(
      pollInbox(env, { manual: false }).then(
        (r) => console.log('Čtení schránky:', JSON.stringify(r)),
        (err) => console.error('Čtení schránky selhalo:', err),
      ),
    );
  },
} satisfies ExportedHandler<Env, Job>;
