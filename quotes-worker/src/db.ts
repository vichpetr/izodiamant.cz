import type { Quote, QuoteFile, QuoteItem, QuoteStatus } from '../../src/lib/quotes/model';
import { nowIso, type Env } from './env';

export async function getQuote(env: Env, id: number): Promise<Quote | null> {
  return env.DB.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first<Quote>();
}

export async function getItems(env: Env, quoteId: number): Promise<QuoteItem[]> {
  const { results } = await env.DB.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY position, id')
    .bind(quoteId)
    .all<QuoteItem>();
  return results;
}

export async function getFile(env: Env, id: number): Promise<QuoteFile | null> {
  return env.DB.prepare('SELECT * FROM quote_files WHERE id = ?').bind(id).first<QuoteFile>();
}

export async function updateQuote(env: Env, id: number, fields: Partial<Record<keyof Quote, unknown>>): Promise<void> {
  const entries = Object.entries({ ...fields, updated_at: nowIso() });
  await env.DB.prepare(`UPDATE quotes SET ${entries.map(([k]) => `${k} = ?`).join(', ')} WHERE id = ?`)
    .bind(...entries.map(([, v]) => v ?? null), id)
    .run();
}

export async function setStatus(env: Env, id: number, status: QuoteStatus): Promise<void> {
  await updateQuote(env, id, { status });
}

export async function logQuoteMessage(
  env: Env,
  input: {
    quoteId: number;
    direction: 'out' | 'in';
    kind: 'draft' | 'sent' | 'reply';
    subject: string | null;
    counterpart: string | null;
    messageId: string | null;
    status: 'ok' | 'error';
    error?: string | null;
    createdBy: string | null;
  },
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO quote_messages (quote_id, direction, kind, subject, counterpart, message_id, status, error, created_at, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      input.quoteId,
      input.direction,
      input.kind,
      input.subject,
      input.counterpart,
      input.messageId,
      input.status,
      input.error ?? null,
      nowIso(),
      input.createdBy,
    )
    .run();
}

export async function getState(env: Env, key: string): Promise<string | null> {
  const row = await env.DB.prepare('SELECT value FROM app_state WHERE key = ?').bind(key).first<{ value: string }>();
  return row?.value ?? null;
}

export async function setState(env: Env, key: string, value: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
  )
    .bind(key, value, nowIso())
    .run();
}

/** Zámek proti souběhu cronu a ručního spuštění. Prošlý zámek (starší než ttl) se převezme. */
export async function acquireLock(env: Env, key: string, ttlMs: number): Promise<boolean> {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - ttlMs).toISOString();
  const res = await env.DB.prepare(
    `INSERT INTO app_state (key, value, updated_at) VALUES (?, 'locked', ?)
     ON CONFLICT(key) DO UPDATE SET value = 'locked', updated_at = excluded.updated_at
     WHERE app_state.value <> 'locked' OR app_state.updated_at < ?`,
  )
    .bind(key, now.toISOString(), staleBefore)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function releaseLock(env: Env, key: string): Promise<void> {
  await setState(env, key, 'free');
}
