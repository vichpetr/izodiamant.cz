// Volání quotes-workeru (PDF, AI, schránka) přes service binding `QUOTES`.
// Binding je ve `wrangler.toml` (produkce → izodiamant-quotes, env preview →
// izodiamant-quotes-preview), viz deployment.MD.
// Worker není na internetu, autorizaci řeší volající (admin).

import { getCfEnv } from './cfEnv';

interface Fetcher {
  fetch(input: string, init?: RequestInit): Promise<Response>;
}

export interface WorkerStatus {
  environment: string;
  mailbox: string | null;
  mailboxConfigured: boolean;
  inboxEnabled: boolean;
  sendEnabled: boolean;
  archiveFolder: string;
  /** Model pro každou úlohu („zen:…“, „cf:…“) – viz quotes-worker/wrangler.toml. */
  models?: { triage: string; attachment: string; extract: string; text: string; fallback: string };
  aiKeyConfigured?: boolean;
  lastPoll: {
    at: string;
    manual: boolean;
    skipped?: string;
    checked: number;
    created: number;
    questions?: number;
    replies: number;
    ignored: number;
    errors: number;
  } | null;
}

function getService(): Fetcher | null {
  const binding = getCfEnv()?.QUOTES;
  // Pozor: `QUOTES` musí být **service binding**, ne obyčejná proměnná prostředí –
  // jako text by sem přišel řetězec a volání .fetch() by spadlo na TypeError.
  if (!binding || typeof (binding as Fetcher).fetch !== 'function') return null;
  return binding as Fetcher;
}

export function isQuotesWorkerAvailable(): boolean {
  return getService() !== null;
}

/** Zavolá worker; chyba z workeru (`{ error }`) se vyhodí jako Error s českou hláškou. */
export async function callQuotesWorker<T = Record<string, unknown>>(
  path: string,
  init: RequestInit & { admin?: string } = {},
): Promise<T> {
  const response = await rawQuotesWorker(path, init);
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || `Služba nabídek vrátila chybu ${response.status}.`);
  return data;
}

export async function rawQuotesWorker(path: string, init: RequestInit & { admin?: string } = {}): Promise<Response> {
  const service = getService();
  if (!service) {
    throw new Error(
      'Služba nabídek není připojená. QUOTES musí být Service binding (ne proměnná prostředí) na izodiamant-quotes, resp. izodiamant-quotes-preview – viz wrangler.toml.',
    );
  }
  const { admin, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (admin) headers.set('X-Admin-Email', admin);
  // Host je u service bindingu jen formalita – požadavek jde přímo do workeru.
  return service.fetch(`https://quotes.internal${path}`, { ...rest, headers });
}

export async function getWorkerStatus(): Promise<WorkerStatus | null> {
  if (!getService()) return null;
  try {
    return await callQuotesWorker<WorkerStatus>('/status');
  } catch {
    return null;
  }
}
