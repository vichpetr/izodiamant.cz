// Vrstva nad jazykovými modely. Model se volí podle ÚLOHY (wrangler.toml):
//   AI_TRIAGE_MODEL      třídění pošty a vytažení údajů z textu poptávky
//   AI_ATTACHMENT_MODEL  hodnocení relevance příloh (levný model s viděním)
//   AI_EXTRACT_MODEL     čtení plánků a výkazů výměr (silný model)
//   AI_TEXT_MODEL        texty e-mailů klientům
// ve tvaru "<ovladač>:<model>":
//   zen:claude-sonnet-5               OpenCode Zen – hlavní brána (secret OPENCODE_API_KEY)
//   anthropic:claude-opus-5           Claude API přímo (secret ANTHROPIC_API_KEY)
//   cf:@cf/google/gemma-4-26b-a4b-it  Workers AI
// Když komerční volání selže (výpadek, došel kredit, chybí klíč), úloha se zopakuje
// na AI_FALLBACK_MODEL. Každé volání se zapíše do ai_usage kvůli nákladům.
//
// Výstup AI je vždy jen NÁVRH: volající ho validuje a člověk potvrzuje.

import type { Env } from './env';
import { nowIso } from './env';
import { toBase64 } from './util';

export type AiTask = 'triage' | 'attachment' | 'extract' | 'text';

export interface AiImage {
  mediaType: string;
  data: ArrayBuffer;
}

interface CallOpts {
  task: AiTask;
  system: string;
  user: string;
  images?: AiImage[];
  maxTokens?: number;
  /** Jen Workers AI (Gemma 4): zapnout „přemýšlení“ – pomalejší, ale přesnější. */
  think?: boolean;
  quoteId?: number | null;
}

interface CallResult {
  text: string;
  inputTokens: number | null;
  outputTokens: number | null;
}

type Provider = 'zen' | 'anthropic' | 'cf';

const ZEN_BASE = 'https://opencode.ai/zen/v1';
const ANTHROPIC_BASE = 'https://api.anthropic.com/v1';
const TIMEOUT_MS = 240_000;

const TASK_VARS: Record<AiTask, keyof Env> = {
  triage: 'AI_TRIAGE_MODEL',
  attachment: 'AI_ATTACHMENT_MODEL',
  extract: 'AI_EXTRACT_MODEL',
  text: 'AI_TEXT_MODEL',
};

function parseSpec(spec: string): { provider: Provider; model: string } {
  const i = spec.indexOf(':');
  const provider = spec.slice(0, i) as Provider;
  if (i < 1 || !['zen', 'anthropic', 'cf'].includes(provider)) {
    throw new Error(`Neplatné nastavení modelu „${spec}“ – čekám tvar zen:…, anthropic:… nebo cf:…`);
  }
  return { provider, model: spec.slice(i + 1) };
}

// ─── Ovladače ────────────────────────────────────────────────────────────────

/** Tvar Anthropic Messages API – Claude přímo i Claude modely v OpenCode Zen. */
async function callMessages(url: string, headers: Record<string, string>, model: string, o: CallOpts): Promise<CallResult> {
  const content = [
    ...(o.images ?? []).map((img) => ({
      type: 'image',
      source: { type: 'base64', media_type: img.mediaType, data: toBase64(img.data) },
    })),
    { type: 'text', text: o.user },
  ];
  // Pozor: temperature/top_p nový Claude (Opus 5, Sonnet 5) odmítá s chybou 400 – neposílat.
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'anthropic-version': '2023-06-01', ...headers },
    body: JSON.stringify({ model, max_tokens: o.maxTokens ?? 16_000, system: o.system, messages: [{ role: 'user', content }] }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = (await res.json().catch(() => null)) as {
    content?: { type: string; text?: string }[];
    stop_reason?: string;
    usage?: { input_tokens?: number; output_tokens?: number };
    error?: { message?: string };
  } | null;
  if (!res.ok) throw new Error(`${res.status}: ${data?.error?.message ?? 'chyba modelu'}`);
  if (data?.stop_reason === 'refusal') throw new Error('Model požadavek odmítl.');
  const text = (data?.content ?? [])
    .filter((b) => b.type === 'text' && b.text)
    .map((b) => b.text)
    .join('\n')
    .trim();
  if (!text) throw new Error(data?.stop_reason === 'max_tokens' ? 'Model nestihl odpovědět (limit tokenů).' : 'Model nevrátil text.');
  return { text, inputTokens: data?.usage?.input_tokens ?? null, outputTokens: data?.usage?.output_tokens ?? null };
}

/** Tvar OpenAI Chat Completions – ostatní modely v OpenCode Zen. */
async function callChat(url: string, key: string, model: string, o: CallOpts): Promise<CallResult> {
  const content = o.images?.length
    ? [
        { type: 'text', text: o.user },
        ...o.images.map((img) => ({ type: 'image_url', image_url: { url: `data:${img.mediaType};base64,${toBase64(img.data)}` } })),
      ]
    : o.user;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      max_tokens: o.maxTokens ?? 16_000,
      messages: [
        { role: 'system', content: o.system },
        { role: 'user', content },
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = (await res.json().catch(() => null)) as {
    choices?: { message?: { content?: string }; finish_reason?: string }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
    error?: { message?: string };
  } | null;
  if (!res.ok) throw new Error(`${res.status}: ${data?.error?.message ?? 'chyba modelu'}`);
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Model nevrátil text.');
  return { text, inputTokens: data?.usage?.prompt_tokens ?? null, outputTokens: data?.usage?.completion_tokens ?? null };
}

/** Workers AI modely vrací buď `{ response }`, nebo OpenAI tvar `{ choices[].message.content }`. */
async function callCf(env: Env, model: string, o: CallOpts): Promise<CallResult> {
  const content = o.images?.length
    ? [
        { type: 'text', text: o.user },
        ...o.images.map((img) => ({ type: 'image_url', image_url: { url: `data:${img.mediaType};base64,${toBase64(img.data)}` } })),
      ]
    : o.user;
  const result = (await env.AI.run(model as keyof AiModels, {
    messages: [
      { role: 'system', content: o.system },
      { role: 'user', content },
    ],
    max_tokens: o.maxTokens ?? 8192,
    temperature: 0.2,
    // Gemma 4 standardně „přemýšlí“ (desítky sekund) – pro běžný text vypnuto.
    ...(model.includes('gemma-4') && !o.think ? { chat_template_kwargs: { enable_thinking: false } } : {}),
  } as never)) as {
    response?: unknown;
    choices?: { finish_reason?: string; message?: { content?: unknown } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  let text = '';
  if (typeof result?.response === 'string') text = result.response;
  else if (result?.response && typeof result.response === 'object') text = JSON.stringify(result.response);
  else if (typeof result?.choices?.[0]?.message?.content === 'string') text = result.choices[0].message.content as string;
  if (!text.trim()) {
    throw new Error(result?.choices?.[0]?.finish_reason === 'length' ? 'AI nestihla odpovědět (limit tokenů).' : 'AI nevrátila žádný text.');
  }
  return { text: text.trim(), inputTokens: result?.usage?.prompt_tokens ?? null, outputTokens: result?.usage?.completion_tokens ?? null };
}

async function dispatch(env: Env, spec: string, o: CallOpts): Promise<CallResult> {
  const { provider, model } = parseSpec(spec);
  if (provider === 'cf') return callCf(env, model, o);
  if (provider === 'anthropic') {
    if (!env.ANTHROPIC_API_KEY) throw new Error('Chybí secret ANTHROPIC_API_KEY.');
    return callMessages(`${ANTHROPIC_BASE}/messages`, { 'x-api-key': env.ANTHROPIC_API_KEY }, model, o);
  }
  if (!env.OPENCODE_API_KEY) throw new Error('Chybí secret OPENCODE_API_KEY.');
  // Claude modely má Zen v Anthropic tvaru (/messages), ostatní v OpenAI tvaru.
  return model.startsWith('claude-')
    ? callMessages(`${ZEN_BASE}/messages`, { authorization: `Bearer ${env.OPENCODE_API_KEY}` }, model, o)
    : callChat(`${ZEN_BASE}/chat/completions`, env.OPENCODE_API_KEY, model, o);
}

async function logUsage(env: Env, o: CallOpts, spec: string, started: number, result: CallResult | null, error: string | null) {
  try {
    const { provider, model } = parseSpec(spec);
    await env.DB.prepare(
      `INSERT INTO ai_usage (task, provider, model, input_tokens, output_tokens, ms, ok, error, quote_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(o.task, provider, model, result?.inputTokens ?? null, result?.outputTokens ?? null, Date.now() - started, result ? 1 : 0, error?.slice(0, 500) ?? null, o.quoteId ?? null, nowIso())
      .run();
  } catch {
    // záznam spotřeby je jen evidence – nesmí shodit samotnou úlohu
  }
}

/** Zavolá model pro danou úlohu; při selhání komerčního modelu zkusí zálohu (Workers AI). */
export async function runText(env: Env, o: CallOpts): Promise<string> {
  const primary = (env[TASK_VARS[o.task]] as string | undefined)?.trim() || env.AI_FALLBACK_MODEL;
  const fallback = env.AI_FALLBACK_MODEL?.trim();
  const attempts = fallback && fallback !== primary ? [primary, fallback] : [primary];

  let lastError: unknown;
  for (const spec of attempts) {
    const started = Date.now();
    try {
      const result = await dispatch(env, spec, o);
      await logUsage(env, o, spec, started, result, null);
      return result.text;
    } catch (err) {
      lastError = err;
      await logUsage(env, o, spec, started, null, err instanceof Error ? err.message : String(err));
      console.warn(`AI (${o.task}) přes ${spec} selhala:`, err instanceof Error ? err.message : err);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('AI selhala.');
}

/** Zavolá model a z odpovědi vytáhne první JSON objekt (modely občas přidají ```json nebo text okolo). */
export async function runJson<T>(env: Env, o: CallOpts): Promise<T> {
  const text = await runText(env, {
    ...o,
    system: `${o.system}\n\nOdpověz VÝHRADNĚ jedním platným JSON objektem, bez dalšího textu a bez markdownu.`,
  });
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error(`AI nevrátila JSON: ${text.slice(0, 200)}`);
  return JSON.parse(text.slice(start, end + 1)) as T;
}

/** PDF → text přes Workers AI toMarkdown (záloha, když se PDF nepodaří vykreslit). */
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
