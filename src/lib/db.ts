// Datová vrstva pro admin sekci /sprava nad Cloudflare D1.
//
// D1 je nabindovaná jako `DB` v nastavení Cloudflare Pages projektu (viz
// deployment.MD). Přístup přes getRequestContext() z @cloudflare/next-on-pages,
// který funguje jen v Cloudflare runtime – lokálně s `next dev` vyhodí chybu,
// proto getDB() vrací null a čtecí funkce degradují (prázdný seznam), aby web
// nespadl. Zápisy (insertLead) jsou best-effort.

import { getRequestContext } from '@cloudflare/next-on-pages';

// Minimální typ D1, ať nemusíme přidávat @cloudflare/workers-types.
interface D1Result<T> {
  results: T[];
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<{ success: boolean; meta: { last_row_id?: number } }>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  project: string | null;
  job_size: string | null;       // velikost / hodnota zakázky (Kč nebo bm)
  source: string;
  realized_at: string | null;    // datum realizace zakázky
  created_at: string;
  created_by: string | null;
  last_email_at?: string | null;
  last_email_status?: string | null;
}

export interface EmailLogRow {
  id: number;
  customer_id: number | null;
  to_email: string;
  subject: string;
  status: string;
  resend_id: string | null;
  error: string | null;
  sent_by: string;
  sent_at: string;
}

/** Vrátí D1 binding, nebo null když nejsme v Cloudflare runtime (lokální dev). */
function getDB(): D1Database | null {
  try {
    return (getRequestContext().env as { DB?: D1Database }).DB ?? null;
  } catch {
    return null;
  }
}

/** Je databáze dostupná? (Pro UI hlášku, když binding chybí.) */
export function isDbAvailable(): boolean {
  return getDB() !== null;
}

/** Best-effort zápis poptávky z webu (kontaktní formulář / kalkulačka). Nikdy nevyhodí. */
export async function insertLead(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  project?: string | null;
  jobSize?: string | null;
  source: 'kontakt' | 'kalkulacka';
}): Promise<void> {
  const db = getDB();
  if (!db) return;
  try {
    await db
      .prepare(
        `INSERT INTO customers (name, email, phone, project, job_size, source, created_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'system')`,
      )
      .bind(
        input.name,
        input.email || null,
        input.phone || null,
        input.project || null,
        input.jobSize || null,
        input.source,
        new Date().toISOString(),
      )
      .run();
  } catch (err) {
    console.warn('insertLead selhal (D1):', err instanceof Error ? err.message : String(err));
  }
}

/** Ruční přidání zákazníka z admin UI. */
export async function addCustomer(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  project?: string | null;
  jobSize?: string | null;
  realized_at?: string | null;
  createdBy: string;
}): Promise<void> {
  const db = getDB();
  if (!db) throw new Error('Databáze není dostupná (chybí binding DB).');
  await db
    .prepare(
      `INSERT INTO customers (name, email, phone, project, job_size, source, realized_at, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, 'manual', ?, ?, ?)`,
    )
    .bind(
      input.name,
      input.email || null,
      input.phone || null,
      input.project || null,
      input.jobSize || null,
      input.realized_at || null,
      new Date().toISOString(),
      input.createdBy,
    )
    .run();
}

/** Seznam zákazníků + stav posledního odeslaného e-mailu. */
export async function listCustomers(): Promise<Customer[]> {
  const db = getDB();
  if (!db) return [];
  const { results } = await db
    .prepare(
      `SELECT c.*,
              (SELECT sent_at FROM email_log e WHERE e.customer_id = c.id ORDER BY e.sent_at DESC LIMIT 1) AS last_email_at,
              (SELECT status  FROM email_log e WHERE e.customer_id = c.id ORDER BY e.sent_at DESC LIMIT 1) AS last_email_status
       FROM customers c
       ORDER BY c.created_at DESC
       LIMIT 500`,
    )
    .all<Customer>();
  return results;
}

export async function getCustomer(id: number): Promise<Customer | null> {
  const db = getDB();
  if (!db) return null;
  return db.prepare(`SELECT * FROM customers WHERE id = ?`).bind(id).first<Customer>();
}

export async function deleteCustomer(id: number): Promise<void> {
  const db = getDB();
  if (!db) throw new Error('Databáze není dostupná.');
  await db.prepare(`DELETE FROM customers WHERE id = ?`).bind(id).run();
}

/** Doplnění/změna data realizace u existujícího zákazníka (lead → hotová zakázka). */
export async function updateRealizedAt(id: number, realizedAt: string | null): Promise<void> {
  const db = getDB();
  if (!db) throw new Error('Databáze není dostupná.');
  await db.prepare(`UPDATE customers SET realized_at = ? WHERE id = ?`).bind(realizedAt, id).run();
}

/** Bylo už tomuto zákazníkovi úspěšně odesláno poděkování? (Z admin sekce se
 *  posílá jen poděkování, takže status='sent' v email_log = poděkování odesláno.) */
export async function thankYouAlreadySent(customerId: number): Promise<boolean> {
  const db = getDB();
  if (!db) return false;
  const row = await db
    .prepare(`SELECT 1 AS x FROM email_log WHERE customer_id = ? AND status = 'sent' LIMIT 1`)
    .bind(customerId)
    .first<{ x: number }>();
  return !!row;
}

/** Zápis do audit logu odeslaných e-mailů. */
export async function logEmail(input: {
  customerId: number | null;
  toEmail: string;
  subject: string;
  status: 'sent' | 'error';
  resendId?: string | null;
  error?: string | null;
  sentBy: string;
}): Promise<void> {
  const db = getDB();
  if (!db) return;
  try {
    await db
      .prepare(
        `INSERT INTO email_log (customer_id, to_email, subject, status, resend_id, error, sent_by, sent_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.customerId,
        input.toEmail,
        input.subject,
        input.status,
        input.resendId || null,
        input.error || null,
        input.sentBy,
        new Date().toISOString(),
      )
      .run();
  } catch (err) {
    console.warn('logEmail selhal (D1):', err instanceof Error ? err.message : String(err));
  }
}

export async function listEmailLog(): Promise<EmailLogRow[]> {
  const db = getDB();
  if (!db) return [];
  const { results } = await db
    .prepare(`SELECT * FROM email_log ORDER BY sent_at DESC LIMIT 500`)
    .all<EmailLogRow>();
  return results;
}
