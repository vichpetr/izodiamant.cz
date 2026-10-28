// Přepisy AI promptů (tabulka ai_prompts). Čte je i quotes-worker – viz quotes-worker/src/prompts.ts.

import { getDB } from './db';

export interface PromptOverride {
  content: string;
  updated_at: string;
  updated_by: string | null;
}

/** Přepisy podle klíče; bez DB nebo bez tabulky (neaplikovaná migrace) prázdná mapa. */
export async function listPromptOverrides(): Promise<Record<string, PromptOverride>> {
  const db = getDB();
  if (!db) return {};
  try {
    const { results } = await db.prepare('SELECT key, content, updated_at, updated_by FROM ai_prompts').all<PromptOverride & { key: string }>();
    return Object.fromEntries(results.map((r) => [r.key, r]));
  } catch {
    return {};
  }
}

export async function savePromptOverride(key: string, content: string, by: string): Promise<void> {
  const db = getDB();
  if (!db) throw new Error('Databáze není dostupná.');
  await db
    .prepare(
      `INSERT INTO ai_prompts (key, content, updated_at, updated_by) VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
    )
    .bind(key, content, new Date().toISOString(), by)
    .run();
}

export async function resetPromptOverride(key: string): Promise<void> {
  const db = getDB();
  if (!db) throw new Error('Databáze není dostupná.');
  await db.prepare('DELETE FROM ai_prompts WHERE key = ?').bind(key).run();
}
