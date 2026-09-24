// Datová vrstva cenových nabídek pro admin /sprava/nabidky (stejná D1 jako
// zákazníci). Zápisy PDF / e-mailu / schránky dělá quotes-worker, tady je jen
// čtení a ruční úpravy formuláře.

import { getDB } from './db';
import { fingerprintHash, missingInputs } from './quotes/calc';
import {
  DEFAULT_CONDITIONS,
  includedVykazIds,
  type Quote,
  type QuoteFile,
  type QuoteItem,
  type QuoteMessage,
  type QuoteVersion,
  type Relevance,
} from './quotes/model';

export interface QuoteListRow extends Quote {
  items_count: number;
  /** Plocha celkem – u variant největší z nich (varianty se nesčítají). */
  total_area: number | null;
  work_total: number | null;
}

export interface InboxRow {
  id: number;
  from_email: string | null;
  from_name: string | null;
  subject: string | null;
  received_at: string | null;
  status: string;
  body_text: string | null;
  /** Shrnutí od AI (z inbox_messages.extracted). */
  summary: string | null;
  quote_id: number | null;
  error: string | null;
  processed_at: string;
}

function requireDB() {
  const db = getDB();
  if (!db) throw new Error('Databáze není dostupná (chybí binding DB).');
  return db;
}

export async function listQuotes(): Promise<QuoteListRow[]> {
  const db = getDB();
  if (!db) return [];
  const { results } = await db
    .prepare(
      `SELECT q.*,
              (SELECT COUNT(*) FROM quote_items i WHERE i.quote_id = q.id) AS items_count,
              (SELECT CASE WHEN q.mode = 'varianty' THEN MAX(area_m2) ELSE SUM(area_m2) END FROM quote_items i WHERE i.quote_id = q.id) AS total_area,
              (SELECT SUM(ROUND(area_m2 * price_per_m2)) FROM quote_items i WHERE i.quote_id = q.id) AS work_total
       FROM quotes q
       ORDER BY q.created_at DESC
       LIMIT 300`,
    )
    .all<QuoteListRow>();
  return results;
}

export async function getQuoteBundle(id: number): Promise<{
  quote: Quote;
  items: QuoteItem[];
  files: QuoteFile[];
  messages: QuoteMessage[];
  versions: QuoteVersion[];
  source: InboxRow | null;
} | null> {
  const db = getDB();
  if (!db) return null;
  const quote = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first<Quote>();
  if (!quote) return null;
  const [items, files, messages, versions] = await Promise.all([
    db.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY position, id').bind(id).all<QuoteItem>(),
    db.prepare('SELECT * FROM quote_files WHERE quote_id = ? ORDER BY created_at').bind(id).all<QuoteFile>(),
    db.prepare('SELECT * FROM quote_messages WHERE quote_id = ? ORDER BY created_at DESC').bind(id).all<QuoteMessage>(),
    db.prepare('SELECT * FROM quote_versions WHERE quote_id = ? ORDER BY version DESC').bind(id).all<QuoteVersion>(),
  ]);
  const source = quote.inbox_message_id
    ? await db
        .prepare(`SELECT *, json_extract(extracted, '$.summary') AS summary FROM inbox_messages WHERE id = ?`)
        .bind(quote.inbox_message_id)
        .first<InboxRow>()
    : null;
  return { quote, items: items.results, files: files.results, messages: messages.results, versions: versions.results, source };
}

export async function createQuote(input: {
  customerId: number | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  createdBy: string;
}): Promise<number> {
  const db = requireDB();
  const now = new Date().toISOString();
  const res = await db
    .prepare(
      `INSERT INTO quotes (customer_id, client_name, client_email, client_phone, mode, transport_price, conditions, status, source, created_at, created_by, updated_at)
       VALUES (?, ?, ?, ?, 'kombinace', 0, ?, 'koncept', 'manual', ?, ?, ?)`,
    )
    .bind(input.customerId, input.clientName, input.clientEmail, input.clientPhone, JSON.stringify(DEFAULT_CONDITIONS), now, input.createdBy, now)
    .run();
  return Number(res.meta.last_row_id);
}

export type QuoteFormFields = Pick<
  Quote,
  | 'client_name'
  | 'client_email'
  | 'client_phone'
  | 'site_name'
  | 'site_address'
  | 'city'
  | 'material'
  | 'thickness_cm'
  | 'length_m'
  | 'mode'
  | 'transport_price'
  | 'intro'
  | 'conditions'
  | 'note'
>;

/** Pole formuláře, u kterých se eviduje, že je doplnila AI (štítek „z e-mailu“ apod.). */
const SOURCED_FIELDS = ['client_name', 'client_phone', 'site_name', 'site_address', 'city', 'material', 'thickness_cm', 'length_m'] as const;

/**
 * Uloží formulář i položky najednou (D1 batch = jedna transakce). Stav se
 * přepočítá: z „čeká na údaje“ se po doplnění všeho stane koncept; hotové PDF
 * („PDF hotové“ / „připraveno“) se vrátí na koncept jen když se změnil obsah
 * oproti poslední verzi. Údaje, které člověk přepsal, ztratí štítek „od AI“.
 */
export async function saveQuote(
  id: number,
  fields: QuoteFormFields,
  items: QuoteItem[],
  clientSources: Record<string, string> | null = null,
): Promise<{ missing: string[] }> {
  const db = requireDB();
  const current = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first<Quote>();
  if (!current) throw new Error('Nabídka neexistuje.');
  const [latest, files, oldItems] = await Promise.all([
    db.prepare('SELECT input_hash FROM quote_versions WHERE quote_id = ? ORDER BY version DESC LIMIT 1').bind(id).first<{ input_hash: string }>(),
    db.prepare('SELECT id, include_in_email, analysis FROM quote_files WHERE quote_id = ?').bind(id).all<Pick<QuoteFile, 'id' | 'include_in_email' | 'analysis'>>(),
    db.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY position, id').bind(id).all<QuoteItem>(),
  ]);

  const missing = missingInputs(fields, items);
  let status = current.status;
  if (status === 'ceka_na_udaje' && missing.length === 0) status = 'koncept';
  if (status === 'vygenerovano' || status === 'pripraveno') {
    const hash = await fingerprintHash(fields, items, includedVykazIds(files.results));
    if (hash !== latest?.input_hash) status = 'koncept';
  }

  // Štítky „od AI“: formulář posílá svůj stav (převzaté rozměry, smazané po ruční
  // úpravě). Pro jistotu je ještě porovnáme s tím, co se opravdu změnilo.
  const sources = clientSources ?? parseSources(current.field_sources);
  for (const key of Object.keys(sources)) {
    if (![...SOURCED_FIELDS, 'items'].includes(key) || typeof sources[key] !== 'string') delete sources[key];
    else sources[key] = sources[key].slice(0, 200);
  }
  for (const key of SOURCED_FIELDS) {
    if (clientSources && clientSources[key] !== parseSources(current.field_sources)[key]) continue; // právě převzato z přílohy
    if (sources[key] && String(current[key] ?? '') !== String(fields[key] ?? '')) delete sources[key];
  }
  const areas = (list: QuoteItem[]) => JSON.stringify(list.map((i) => [i.technology, i.area_m2]));
  const itemsJustApplied = clientSources && clientSources.items !== parseSources(current.field_sources).items;
  if (sources.items && !itemsJustApplied && areas(oldItems.results) !== areas(items)) delete sources.items;

  const entries = Object.entries(fields);
  await db.batch([
    db
      .prepare(`UPDATE quotes SET ${entries.map(([k]) => `${k} = ?`).join(', ')}, status = ?, missing = ?, field_sources = ?, updated_at = ? WHERE id = ?`)
      .bind(...entries.map(([, v]) => v ?? null), status, JSON.stringify(missing), JSON.stringify(sources), new Date().toISOString(), id),
    db.prepare('DELETE FROM quote_items WHERE quote_id = ?').bind(id),
    ...items.map((item, position) =>
      db
        .prepare('INSERT INTO quote_items (quote_id, position, technology, area_m2, price_per_m2) VALUES (?, ?, ?, ?, ?)')
        .bind(id, position, item.technology, item.area_m2, item.price_per_m2),
    ),
  ]);
  return { missing };
}

export function parseSources(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** Ruční přehlasování relevance přílohy (null = zpět na hodnocení AI). Vrací soubor po změně. */
export async function setFileRelevance(fileId: number, relevance: Relevance | null): Promise<QuoteFile | null> {
  const db = requireDB();
  await db.prepare('UPDATE quote_files SET relevance_override = ? WHERE id = ?').bind(relevance, fileId).run();
  return db.prepare('SELECT * FROM quote_files WHERE id = ?').bind(fileId).first<QuoteFile>();
}

export async function setFileIncluded(fileId: number, include: boolean): Promise<void> {
  await requireDB().prepare('UPDATE quote_files SET include_in_email = ? WHERE id = ?').bind(include ? 1 : 0, fileId).run();
}

/** Verze PDF pro e-mail (null = vždy poslední). */
export async function setEmailVersion(id: number, version: number | null): Promise<void> {
  await requireDB()
    .prepare('UPDATE quotes SET email_version = ?, updated_at = ? WHERE id = ?')
    .bind(version, new Date().toISOString(), id)
    .run();
}

export async function setQuoteStatus(id: number, status: Quote['status']): Promise<void> {
  await requireDB()
    .prepare('UPDATE quotes SET status = ?, updated_at = ? WHERE id = ?')
    .bind(status, new Date().toISOString(), id)
    .run();
}

export async function deleteQuote(id: number): Promise<string[]> {
  const db = requireDB();
  const keys = await db
    .prepare(
      `SELECT r2_key AS k FROM quote_files WHERE quote_id = ?
       UNION SELECT pdf_key FROM quotes WHERE id = ? AND pdf_key IS NOT NULL
       UNION SELECT pdf_key FROM quote_versions WHERE quote_id = ?
       UNION SELECT vykaz_key FROM quote_versions WHERE quote_id = ? AND vykaz_key IS NOT NULL`,
    )
    .bind(id, id, id, id)
    .all<{ k: string }>();
  await db.batch([
    db.prepare('DELETE FROM quote_versions WHERE quote_id = ?').bind(id),
    db.prepare('UPDATE ai_usage SET quote_id = NULL WHERE quote_id = ?').bind(id),
    db.prepare('DELETE FROM quote_items WHERE quote_id = ?').bind(id),
    db.prepare('DELETE FROM quote_files WHERE quote_id = ?').bind(id),
    db.prepare('DELETE FROM quote_messages WHERE quote_id = ?').bind(id),
    db.prepare('UPDATE inbox_messages SET quote_id = NULL WHERE quote_id = ?').bind(id),
    db.prepare('DELETE FROM quotes WHERE id = ?').bind(id),
  ]);
  // K přílohám patří i vygenerovaný náhled (stejný klíč + .nahled.jpg).
  return keys.results.flatMap((r) => (r.k.startsWith('prilohy/') ? [r.k, `${r.k}.nahled.jpg`] : [r.k]));
}

export async function listInbox(limit = 30): Promise<InboxRow[]> {
  const db = getDB();
  if (!db) return [];
  const { results } = await db
    .prepare(
      `SELECT id, from_email, from_name, subject, received_at, status, quote_id, error, processed_at, NULL AS body_text,
              json_extract(extracted, '$.summary') AS summary
       FROM inbox_messages ORDER BY processed_at DESC LIMIT ?`,
    )
    .bind(limit)
    .all<InboxRow>();
  return results;
}

/** Zákazníci pro výběr klienta (jméno + kontakt). */
export async function listCustomerOptions(): Promise<{ id: number; name: string; email: string | null; phone: string | null }[]> {
  const db = getDB();
  if (!db) return [];
  const { results } = await db
    .prepare('SELECT id, name, email, phone FROM customers ORDER BY created_at DESC LIMIT 500')
    .all<{ id: number; name: string; email: string | null; phone: string | null }>();
  return results;
}
