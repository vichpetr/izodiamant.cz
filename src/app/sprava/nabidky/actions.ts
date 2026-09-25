'use server';

// Server actions sekce Cenové nabídky. Stejně jako ../actions.ts: každá akce
// NEJDŘÍV ověří admina (Google login + ADMIN_EMAILS). Teprve pak sahá na D1
// nebo volá quotes-worker (PDF, AI, schránka).

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { safeAuth, isAllowed } from '@/auth';
import { addCustomer, getCustomer, getDB } from '@/lib/db';
import {
  createQuote,
  deleteQuote,
  saveQuote,
  setEmailVersion,
  setFileIncluded,
  setFileRelevance,
  setQuoteStatus,
  type QuoteFormFields,
} from '@/lib/quotesDb';
import { callQuotesWorker } from '@/lib/quotesWorker';
import {
  RELEVANCE_ORDER,
  RELEVANT,
  effectiveRelevance,
  isTechnology,
  MATERIALS,
  QUOTE_STATUSES,
  type QuoteItem,
  type QuoteStatus,
  type Relevance,
} from '@/lib/quotes/model';
import { cutArea, variantsError } from '@/lib/quotes/calc';
import { isValidEmail } from '@/lib/validators';
import type { ActionState } from '../ActionForm';

const PATH = '/sprava/nabidky';

async function requireAdmin(): Promise<string> {
  const session = await safeAuth();
  const email = session?.user?.email;
  if (!email || !isAllowed(email)) throw new Error('Nemáte oprávnění.');
  return email;
}

function fail(err: unknown): ActionState {
  return { ok: false, message: err instanceof Error ? err.message : 'Došlo k chybě.' };
}

function text(formData: FormData, key: string, max = 300): string | null {
  const v = String(formData.get(key) ?? '').trim();
  return v ? v.slice(0, max) : null;
}

/** Číslo z formuláře – bere i desetinnou čárku („4,5“). */
function number(formData: FormData, key: string, min: number, max: number, label: string): number | null {
  const raw = String(formData.get(key) ?? '').trim().replace(/\s/g, '').replace(',', '.');
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${label}: zadejte číslo mezi ${min} a ${max}.`);
  return n;
}

function quoteId(formData: FormData): number {
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id <= 0) throw new Error('Neplatné id nabídky.');
  return id;
}

// ─── Založení ────────────────────────────────────────────────────────────────

export async function createQuoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let id: number;
  try {
    const admin = await requireAdmin();
    const customerId = Number(formData.get('customer_id')) || null;
    let name: string | null;
    let email: string | null;
    let phone: string | null;
    let linkedCustomer = customerId;

    if (customerId) {
      const customer = await getCustomer(customerId);
      if (!customer) return { ok: false, message: 'Zákazník nenalezen.' };
      ({ name, email, phone } = customer);
    } else {
      name = text(formData, 'client_name', 120);
      email = text(formData, 'client_email', 120);
      phone = text(formData, 'client_phone', 40);
      if (!name) return { ok: false, message: 'Vyplňte jméno klienta nebo vyberte zákazníka.' };
      if (email && !isValidEmail(email)) return { ok: false, message: 'E-mail nemá platný formát.' };
      // Nový klient rovnou i do evidence zákazníků, ať je nabídka svázaná s CRM.
      if (formData.get('add_to_crm') === 'on') {
        linkedCustomer = await addCustomer({ name, email, phone, project: 'Cenová nabídka', createdBy: admin });
      }
    }

    if (!linkedCustomer && email) {
      const row = await getDB()
        ?.prepare('SELECT id FROM customers WHERE lower(email) = lower(?) ORDER BY created_at DESC LIMIT 1')
        .bind(email)
        .first<{ id: number }>();
      linkedCustomer = row?.id ?? null;
    }

    id = await createQuote({ customerId: linkedCustomer, clientName: name!, clientEmail: email, clientPhone: phone, createdBy: admin });
    revalidatePath(PATH);
  } catch (err) {
    return fail(err);
  }
  // redirect() vyhazuje řídicí výjimku – musí být mimo try/catch.
  redirect(`${PATH}?id=${id}`);
}

// ─── Uložení formuláře (+ volitelně vygenerování PDF) ────────────────────────

function parseItems(formData: FormData): QuoteItem[] {
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get('items') ?? '[]'));
  } catch {
    throw new Error('Položky nabídky se nepodařilo přečíst.');
  }
  if (!Array.isArray(raw)) throw new Error('Položky nabídky se nepodařilo přečíst.');
  if (raw.length > 10) throw new Error('Nabídka může mít nejvýš 10 položek.');
  return raw.map((r: Record<string, unknown>, position) => {
    if (!isTechnology(r.technology)) throw new Error(`Položka ${position + 1}: vyberte technologii.`);
    const optional = (v: unknown, min: number, max: number, label: string): number | null => {
      if (v === null || v === undefined || v === '' || v === 0) return null;
      const n = Number(v);
      if (!Number.isFinite(n) || n < min || n > max) throw new Error(`Položka ${position + 1}: ${label}`);
      return Math.round(n * 100) / 100;
    };
    const length = optional(r.length_m, 0.1, 5000, 'délka musí být 0,1–5000 m.');
    const thickness = optional(r.thickness_cm, 1, 300, 'tloušťka musí být 1–300 cm.');
    const price = Number(r.price_per_m2);
    if (!Number.isFinite(price) || price < 0 || price > 100_000) throw new Error(`Položka ${position + 1}: cena za m² musí být 0–100 000 Kč.`);
    // Řezná plocha = délka × tloušťka; ručně zadaná m² jen když rozměry chybí.
    const area = cutArea(length, thickness) ?? Number(r.area_m2);
    if (!Number.isFinite(area) || area < 0 || area > 5000) throw new Error(`Položka ${position + 1}: řezná plocha musí být 0–5000 m².`);
    return { position, technology: r.technology, length_m: length, thickness_cm: thickness, area_m2: Math.round(area * 100) / 100, price_per_m2: Math.round(price) };
  });
}

export async function saveQuoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const id = quoteId(formData);
    const clientName = text(formData, 'client_name', 120);
    if (!clientName) return { ok: false, message: 'Jméno klienta je povinné.' };
    const clientEmail = text(formData, 'client_email', 120);
    if (clientEmail && !isValidEmail(clientEmail)) return { ok: false, message: 'E-mail klienta nemá platný formát.' };
    const material = text(formData, 'material', 20);
    if (material && !MATERIALS.some((m) => m.id === material)) return { ok: false, message: 'Neznámý materiál zdiva.' };
    const conditions = String(formData.get('conditions') ?? '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 12);

    const fields: QuoteFormFields = {
      client_name: clientName,
      client_email: clientEmail,
      client_phone: text(formData, 'client_phone', 40),
      site_name: text(formData, 'site_name', 200),
      site_address: text(formData, 'site_address', 200),
      city: text(formData, 'city', 80),
      material,
      thickness_cm: number(formData, 'thickness_cm', 1, 300, 'Tloušťka zdiva'),
      length_m: number(formData, 'length_m', 0.1, 5000, 'Délka řezu'),
      mode: formData.get('mode') === 'varianty' ? 'varianty' : 'kombinace',
      transport_price: Math.round(number(formData, 'transport_price', 0, 1_000_000, 'Doprava') ?? 0),
      intro: text(formData, 'intro', 1500),
      conditions: JSON.stringify(conditions),
      note: text(formData, 'note', 2000),
    };
    const items = parseItems(formData);
    const variants = variantsError(fields.mode, items);
    if (variants) return { ok: false, message: variants };
    let sources: Record<string, string> | null = null;
    try {
      const raw: unknown = JSON.parse(String(formData.get('field_sources') ?? 'null'));
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) sources = raw as Record<string, string>;
    } catch {
      /* bez štítků se nic nerozbije */
    }
    const { missing } = await saveQuote(id, fields, items, sources);

    if (formData.get('intent') === 'generate') {
      if (missing.length) {
        revalidatePath(PATH);
        return { ok: false, message: `Uloženo, ale přílohy zatím nejde vygenerovat – doplňte: ${missing.join(', ')}.` };
      }
      const res = await callQuotesWorker<{ number: string; version: number; unchanged: boolean; vykazCount?: number }>(`/quotes/${id}/generate`, {
        method: 'POST',
        admin,
      });
      revalidatePath(PATH);
      const what = res.vykazCount ? `PDF + ${res.vykazCount === 1 ? 'vyplněný výkaz' : `${res.vykazCount} vyplněné výkazy`}` : 'PDF';
      return {
        ok: true,
        message: res.unchanged
          ? `Beze změny – platí přílohy verze ${res.version} (${what}).`
          : `Přílohy ${res.number} vygenerovány (verze ${res.version}): ${what}.`,
      };
    }
    revalidatePath(PATH);
    return { ok: true, message: missing.length ? `Uloženo. Ještě chybí: ${missing.join(', ')}.` : 'Nabídka uložena.' };
  } catch (err) {
    revalidatePath(PATH);
    return fail(err);
  }
}

export async function saveEmailAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = quoteId(formData);
    await getDB()
      ?.prepare('UPDATE quotes SET email_subject = ?, email_body = ?, updated_at = ? WHERE id = ?')
      .bind(text(formData, 'email_subject', 200), text(formData, 'email_body', 5000), new Date().toISOString(), id)
      .run();
    revalidatePath(PATH);
    return { ok: true, message: 'Text e-mailu uložen.' };
  } catch (err) {
    return fail(err);
  }
}

// ─── Volání workeru ──────────────────────────────────────────────────────────

export async function uploadPlansAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const id = quoteId(formData);
    const files = formData.getAll('files').filter((f): f is File => typeof f !== 'string' && f.size > 0);
    if (files.length === 0) return { ok: false, message: 'Vyberte soubor (plánek JPG/PNG/PDF nebo výkaz XLSX).' };
    const body = new FormData();
    files.forEach((f) => body.append('files', f, f.name));
    body.append('hint', text(formData, 'hint', 500) ?? '');
    await callQuotesWorker(`/quotes/${id}/plans`, { method: 'POST', body, admin });
    revalidatePath(PATH);
    return { ok: true, message: 'Nahráno – AI soubor na pozadí ohodnotí a relevantní přečte, výsledek se objeví sám.' };
  } catch (err) {
    revalidatePath(PATH);
    return fail(err);
  }
}

export async function reanalyzeFileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const fileId = Number(formData.get('file_id'));
    await callQuotesWorker(`/files/${fileId}/analyze`, {
      method: 'POST',
      admin,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hint: text(formData, 'hint', 500), force: true }),
    });
    revalidatePath(PATH);
    return { ok: true, message: 'Zařazeno ke čtení – výsledek se objeví sám.' };
  } catch (err) {
    return fail(err);
  }
}

/** Ruční relevance přílohy. Označení za relevantní rovnou spustí čtení, pokud ještě neproběhlo. */
export async function setRelevanceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const fileId = Number(formData.get('file_id'));
    const raw = String(formData.get('relevance') ?? '');
    const relevance = RELEVANCE_ORDER.includes(raw as Relevance) ? (raw as Relevance) : null;
    const file = await setFileRelevance(fileId, relevance);
    if (!file) return { ok: false, message: 'Soubor nenalezen.' };
    const effective = effectiveRelevance(file);
    let message = relevance ? 'Relevance změněna.' : 'Vráceno na hodnocení AI.';
    if (!file.analysis && effective && RELEVANT.includes(effective)) {
      await callQuotesWorker(`/files/${fileId}/analyze`, {
        method: 'POST',
        admin,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      });
      message = 'Označeno jako relevantní – AI soubor čte.';
    }
    revalidatePath(PATH);
    return { ok: true, message };
  } catch (err) {
    return fail(err);
  }
}

export async function setIncludeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const include = formData.get('include') === '1';
    await setFileIncluded(Number(formData.get('file_id')), include);
    revalidatePath(PATH);
    return {
      ok: true,
      message: include ? 'Vyplněný výkaz se přiloží k e-mailu.' : 'Vyplněný výkaz se k e-mailu nepřiloží (vygeneruje se ale dál spolu s PDF).',
    };
  } catch (err) {
    return fail(err);
  }
}

export async function setEmailVersionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const raw = Number(formData.get('version'));
    const version = Number.isInteger(raw) && raw > 0 ? raw : null;
    await setEmailVersion(quoteId(formData), version);
    revalidatePath(PATH);
    return { ok: true, message: version ? `K e-mailu se přiloží verze ${version}.` : 'K e-mailu se přiloží vždy poslední verze.' };
  } catch (err) {
    return fail(err);
  }
}

export async function regenerateEmailAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    await callQuotesWorker(`/quotes/${quoteId(formData)}/email-text`, { method: 'POST', admin });
    revalidatePath(PATH);
    return { ok: true, message: 'Navržen nový text e-mailu.' };
  } catch (err) {
    return fail(err);
  }
}

export async function draftEmailAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const res = await callQuotesWorker<{ folder: string; attachments?: string[] }>(`/quotes/${quoteId(formData)}/draft`, { method: 'POST', admin });
    revalidatePath(PATH);
    return {
      ok: true,
      message: `Koncept uložen do schránky (složka „${res.folder}“)${res.attachments?.length ? `, přílohy: ${res.attachments.join(', ')}` : ''}.`,
    };
  } catch (err) {
    revalidatePath(PATH);
    return fail(err);
  }
}

export async function sendEmailAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    await callQuotesWorker(`/quotes/${quoteId(formData)}/send`, { method: 'POST', admin });
    revalidatePath(PATH);
    return { ok: true, message: 'E-mail s nabídkou odeslán.' };
  } catch (err) {
    revalidatePath(PATH);
    return fail(err);
  }
}

export async function setStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const status = String(formData.get('status')) as QuoteStatus;
    if (!(status in QUOTE_STATUSES)) return { ok: false, message: 'Neplatný stav.' };
    await setQuoteStatus(quoteId(formData), status);
    revalidatePath(PATH);
    return { ok: true, message: `Stav změněn na „${QUOTE_STATUSES[status]}“.` };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteQuoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const keys = await deleteQuote(quoteId(formData));
    if (keys.length) {
      await callQuotesWorker('/files/delete', {
        method: 'POST',
        admin,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys }),
      }).catch(() => undefined); // soubory v R2 jsou jen úklid – nabídka už je smazaná
    }
    revalidatePath(PATH);
  } catch (err) {
    return fail(err);
  }
  redirect(PATH);
}

export async function pollInboxAction(): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const { result } = await callQuotesWorker<{
      result: { skipped?: string; checked: number; created: number; questions?: number; replies: number; ignored: number; errors: number };
    }>('/inbox/poll', { method: 'POST', admin });
    revalidatePath(PATH);
    if (result.skipped) return { ok: false, message: result.skipped };
    return {
      ok: result.errors === 0,
      message: `Zkontrolováno ${result.checked} nových zpráv: ${result.created} poptávek, ${result.questions ?? 0} dotazů (zůstaly ve schránce), ${result.replies} odpovědí, ${result.ignored} ostatních${result.errors ? `, ${result.errors} chyb` : ''}.`,
    };
  } catch (err) {
    return fail(err);
  }
}

export async function retryInboxAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    await callQuotesWorker(`/inbox/${Number(formData.get('inbox_id'))}/retry`, { method: 'POST', admin });
    revalidatePath(PATH);
    return { ok: true, message: 'Zpráva se zpracuje při příští kontrole schránky.' };
  } catch (err) {
    return fail(err);
  }
}
