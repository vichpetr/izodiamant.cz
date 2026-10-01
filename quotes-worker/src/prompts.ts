import { composePrompt, MAX_PROMPT_LENGTH, type PromptKey } from '../../src/lib/quotes/prompts';
import type { Env } from './env';

/**
 * Systémový prompt pro danou úlohu: pokyny upravené v adminu (/sprava/prompty),
 * jinak výchozí z kódu. Čte se při každém volání, takže úprava platí hned.
 * Když se čtení z DB nepovede (chybí tabulka, výpadek), AI běží na výchozím textu.
 */
export async function getSystemPrompt(env: Env, key: PromptKey): Promise<string> {
  try {
    const row = await env.DB.prepare('SELECT content FROM ai_prompts WHERE key = ?').bind(key).first<{ content: string }>();
    return composePrompt(key, row?.content?.slice(0, MAX_PROMPT_LENGTH));
  } catch (err) {
    console.warn(`Prompt "${key}" se nepodařilo načíst z DB, použit výchozí:`, err instanceof Error ? err.message : err);
    return composePrompt(key);
  }
}
