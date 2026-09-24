/**
 * Úlohy ve frontě (dlouhé AI operace mimo požadavek z adminu):
 * - attachment: ohodnotit relevanci přílohy a relevantní přečíst silným modelem.
 *   `force` = přečíst i to, co AI vyhodnotí jako nerelevantní (ruční nahrání,
 *   tlačítko „Přečíst“). Typ "plan" je starší tvar téže úlohy (bere se jako force).
 * - autogen: nabídka z e-mailu má všechny údaje → vygenerovat PDF (stav „připraveno“).
 */
export type Job =
  | { type: 'attachment' | 'plan'; fileId: number; hint: string | null; force?: boolean }
  | { type: 'autogen'; quoteId: number };

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  AI: Ai;
  BROWSER: Fetcher;
  /** Fronta úloh, které se nevejdou do HTTP požadavku (čtení plánků). */
  JOBS: Queue<Job>;

  ENVIRONMENT: string;
  /** Model pro každou úlohu ve tvaru "zen:…", "anthropic:…" nebo "cf:…" (viz ai.ts). */
  AI_TRIAGE_MODEL: string;
  AI_ATTACHMENT_MODEL: string;
  AI_EXTRACT_MODEL: string;
  AI_TEXT_MODEL: string;
  /** Záloha, když komerční model selže (typicky Workers AI). */
  AI_FALLBACK_MODEL: string;
  /** Secret – klíč k OpenCode Zen (hlavní brána). */
  OPENCODE_API_KEY?: string;
  /** Secret – volitelně Claude API přímo. */
  ANTHROPIC_API_KEY?: string;

  MAILBOX_USER: string;
  MAILBOX_PASSWORD?: string;
  MAILBOX_SENDER_NAME: string;
  IMAP_HOST: string;
  IMAP_PORT: string;
  SMTP_HOST: string;
  SMTP_PORT: string;

  INBOX_ENABLED: string;
  INBOX_FOLDER: string;
  INBOX_ARCHIVE_FOLDER: string;
  INBOX_LABEL: string;
  INBOX_LOOKBACK_DAYS: string;
  INBOX_MAX_PER_RUN: string;
  DRAFTS_FOLDER: string;
  SENT_FOLDER: string;
  SEND_ENABLED: string;
}

export const flag = (value: string | undefined) => value?.trim().toLowerCase() === 'true';

export const mailboxConfigured = (env: Env) => Boolean(env.MAILBOX_USER?.trim() && env.MAILBOX_PASSWORD);

export const nowIso = () => new Date().toISOString();
