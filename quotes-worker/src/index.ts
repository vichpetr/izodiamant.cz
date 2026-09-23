// izodiamant-quotes – interní API pro cenové nabídky.
//
// Není na internetu (workers_dev = false, žádné routy): volá ho jen Pages admin
// /sprava přes service binding QUOTES (autorizaci řeší Pages – Google login +
// ADMIN_EMAILS) a cron. Kdo akci spustil, posílá Pages v hlavičce X-Admin-Email.

import type { QuoteFile } from '../../src/lib/quotes/model';
import { getFile, getItems, getQuote, getState, logQuoteMessage, updateQuote } from './db';
import { flag, mailboxConfigured, nowIso, type Env } from './env';
import { UserError, draftEmailText, generateQuote } from './generate';
import { pollInbox } from './inbox';
import { saveDraft, sendMail, type OutgoingMail } from './mailbox';
import { analyzePlan } from './plans';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOADS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

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
      textModel: env.AI_TEXT_MODEL,
      visionModel: env.AI_VISION_MODEL,
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

  // POST /files/:id/analyze – znovu přečíst uložený plánek (volitelně s pokynem).
  if (method === 'POST' && parts[0] === 'files' && parts[2] === 'analyze') {
    const file = await getFile(env, Number(parts[1]));
    if (!file) return json({ error: 'Soubor neexistuje.' }, 404);
    const body = (await request.json().catch(() => ({}))) as { hint?: string };
    const object = await env.BUCKET.get(file.r2_key);
    if (!object) return json({ error: 'Soubor v úložišti chybí.' }, 404);
    const analysis = await analyzePlan(env, { name: file.filename, type: file.content_type, data: await object.arrayBuffer() }, body.hint?.slice(0, 500) || null);
    await env.DB.prepare('UPDATE quote_files SET analysis = ? WHERE id = ?').bind(JSON.stringify(analysis), file.id).run();
    return json({ ok: true, analysis });
  }

  if (parts[0] !== 'quotes' || !parts[1]) return json({ error: 'Nenalezeno.' }, 404);
  const quoteId = Number(parts[1]);
  if (!Number.isInteger(quoteId)) return json({ error: 'Neplatné id.' }, 400);
  const action = parts[2];

  if (method === 'POST' && action === 'generate') {
    return json({ ok: true, ...(await generateQuote(env, quoteId)) });
  }

  if (method === 'POST' && action === 'email-text') {
    const quote = await getQuote(env, quoteId);
    if (!quote) return json({ error: 'Nabídka neexistuje.' }, 404);
    const text = await draftEmailText(env, quote, await getItems(env, quoteId));
    await updateQuote(env, quoteId, text);
    return json({ ok: true, ...text });
  }

  // POST /quotes/:id/plans – multipart `files` (+ volitelně `hint`): uloží do R2 a přečte AI.
  if (method === 'POST' && action === 'plans') {
    const quote = await getQuote(env, quoteId);
    if (!quote) return json({ error: 'Nabídka neexistuje.' }, 404);
    const form = await request.formData();
    const hint = String(form.get('hint') ?? '').slice(0, 500) || null;
    const uploads = form.getAll('files').filter((f): f is File => typeof f !== 'string');
    if (uploads.length === 0) return json({ error: 'Nevybrali jste žádný soubor.' }, 400);
    const saved: Pick<QuoteFile, 'id' | 'filename' | 'analysis'>[] = [];
    for (const upload of uploads.slice(0, 5)) {
      if (!ALLOWED_UPLOADS.includes(upload.type)) throw new UserError(`${upload.name}: podporované jsou JPG, PNG, WEBP a PDF.`);
      if (upload.size > MAX_UPLOAD_BYTES) throw new UserError(`${upload.name}: soubor je větší než 10 MB.`);
      const data = await upload.arrayBuffer();
      const filename = upload.name.replace(/[/\\]/g, '_').slice(0, 120);
      const key = `prilohy/${quoteId}/${crypto.randomUUID()}-${filename}`;
      await env.BUCKET.put(key, data, { httpMetadata: { contentType: upload.type } });
      let analysis: string | null = null;
      let analysisError: string | null = null;
      try {
        analysis = JSON.stringify(await analyzePlan(env, { name: filename, type: upload.type, data }, hint));
      } catch (err) {
        analysisError = err instanceof Error ? err.message : String(err);
      }
      const res = await env.DB.prepare(
        `INSERT INTO quote_files (quote_id, r2_key, filename, content_type, size, kind, analysis, created_at) VALUES (?, ?, ?, ?, ?, 'plan', ?, ?)`,
      )
        .bind(quoteId, key, filename, upload.type, data.byteLength, analysis, nowIso())
        .run();
      saved.push({ id: Number(res.meta.last_row_id), filename, analysis: analysis ?? JSON.stringify({ error: analysisError }) });
    }
    return json({ ok: true, files: saved });
  }

  // POST /quotes/:id/draft | /send – fáze 3 (koncept do schránky / přímé odeslání).
  if (method === 'POST' && (action === 'draft' || action === 'send')) {
    const quote = await getQuote(env, quoteId);
    if (!quote) return json({ error: 'Nabídka neexistuje.' }, 404);
    if (!quote.client_email) throw new UserError('Nabídka nemá e-mail klienta.');
    if (!quote.pdf_key || !quote.number) throw new UserError('Nejdřív vygenerujte PDF.');
    if (!quote.email_subject || !quote.email_body) throw new UserError('Chybí předmět nebo text e-mailu.');
    const pdf = await env.BUCKET.get(quote.pdf_key);
    if (!pdf) throw new UserError('PDF v úložišti chybí – vygenerujte ho znovu.');

    let inReplyTo: string | null = null;
    if (quote.inbox_message_id) {
      const src = await env.DB.prepare('SELECT message_id FROM inbox_messages WHERE id = ?').bind(quote.inbox_message_id).first<{ message_id: string }>();
      inReplyTo = src?.message_id ?? null;
    }
    const mail: OutgoingMail = {
      to: quote.client_email,
      subject: quote.email_subject,
      text: quote.email_body,
      inReplyTo,
      attachment: { filename: `${quote.number}.pdf`, data: await pdf.arrayBuffer() },
    };
    const log = { quoteId, direction: 'out' as const, subject: quote.email_subject, counterpart: quote.client_email, createdBy: admin };
    try {
      if (action === 'draft') {
        const { messageId, folder } = await saveDraft(env, mail);
        await logQuoteMessage(env, { ...log, kind: 'draft', messageId, status: 'ok' });
        return json({ ok: true, folder });
      }
      const { messageId } = await sendMail(env, mail);
      await logQuoteMessage(env, { ...log, kind: 'sent', messageId, status: 'ok' });
      await updateQuote(env, quoteId, { status: 'odeslano' });
      return json({ ok: true });
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

  async scheduled(_event, env, ctx): Promise<void> {
    ctx.waitUntil(
      pollInbox(env, { manual: false }).then(
        (r) => console.log('Čtení schránky:', JSON.stringify(r)),
        (err) => console.error('Čtení schránky selhalo:', err),
      ),
    );
  },
} satisfies ExportedHandler<Env>;
