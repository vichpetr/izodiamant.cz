// Tenká vrstva nad Workers AI. Modely se vybírají v wrangler.toml (AI_TEXT_MODEL,
// AI_VISION_MODEL), takže přechod na jiný model – případně později na Claude –
// znamená změnit jen tenhle soubor, ne volající kód.
//
// Výstup AI je vždy jen NÁVRH: volající ho validuje a člověk potvrzuje.

import type { Env } from './env';
import { toBase64 } from './util';

export interface AiImage {
  mediaType: string;
  data: ArrayBuffer;
}

type ChatContent = string | ({ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } })[];

/** Workers AI modely vrací buď `{ response }`, nebo OpenAI tvar `{ choices[].message.content }`. */
function extractText(result: unknown): string {
  if (typeof result === 'string') return result;
  const r = result as {
    response?: unknown;
    choices?: { finish_reason?: string; message?: { content?: unknown } }[];
  };
  if (typeof r?.response === 'string' && r.response.trim()) return r.response;
  if (r?.response && typeof r.response === 'object') return JSON.stringify(r.response);
  const choice = r?.choices?.[0];
  if (typeof choice?.message?.content === 'string' && choice.message.content.trim()) return choice.message.content;
  // Reasoning modely (Gemma 4) umí vyčerpat max_tokens na uvažování a odpověď pak chybí.
  if (choice?.finish_reason === 'length') throw new Error('AI nestihla odpovědět (limit tokenů).');
  throw new Error('AI nevrátila žádný text.');
}

export async function runText(
  env: Env,
  opts: { system: string; user: string; images?: AiImage[]; maxTokens?: number; think?: boolean },
): Promise<string> {
  const model = opts.images?.length ? env.AI_VISION_MODEL : env.AI_TEXT_MODEL;
  const content: ChatContent = opts.images?.length
    ? [
        { type: 'text', text: opts.user },
        ...opts.images.map((img) => ({
          type: 'image_url' as const,
          image_url: { url: `data:${img.mediaType};base64,${toBase64(img.data)}` },
        })),
      ]
    : opts.user;

  const result = await env.AI.run(model as keyof AiModels, {
    messages: [
      { role: 'system', content: opts.system },
      { role: 'user', content },
    ],
    max_tokens: opts.maxTokens ?? 8192,
    temperature: 0.2,
    // Gemma 4 standardně „přemýšlí“ (desítky sekund). Pro běžný text to vypínáme
    // (~5 s místo ~35 s); zapnuté zůstává jen tam, kde se počítá (plánek).
    ...(model.includes('gemma-4') && !opts.think ? { chat_template_kwargs: { enable_thinking: false } } : {}),
  } as never);
  return extractText(result).trim();
}

/** Zavolá model a z odpovědi vytáhne první JSON objekt (modely občas přidají ```json nebo text okolo). */
export async function runJson<T>(
  env: Env,
  opts: { system: string; user: string; images?: AiImage[]; maxTokens?: number; think?: boolean },
): Promise<T> {
  const text = await runText(env, {
    ...opts,
    system: `${opts.system}\n\nOdpověz VÝHRADNĚ jedním platným JSON objektem, bez dalšího textu a bez markdownu.`,
  });
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error(`AI nevrátila JSON: ${text.slice(0, 200)}`);
  return JSON.parse(text.slice(start, end + 1)) as T;
}

/** PDF (např. plánek z e-mailu) → text přes Workers AI toMarkdown. */
export async function pdfToText(env: Env, name: string, data: ArrayBuffer): Promise<string> {
  const [result] = await env.AI.toMarkdown([{ name, blob: new Blob([data], { type: 'application/pdf' }) }]);
  if (!result || result.format === 'error') return '';
  return result.data ?? '';
}

// ─── Validace čísel z AI ─────────────────────────────────────────────────────

export function num(value: unknown, min: number, max: number): number | null {
  const n = typeof value === 'string' ? Number(value.replace(',', '.').replace(/[^\d.]/g, '')) : Number(value);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return Math.round(n * 100) / 100;
}

export function str(value: unknown, maxLen = 300): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  return t ? t.slice(0, maxLen) : null;
}
