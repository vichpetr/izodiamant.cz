export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  AI: Ai;
  BROWSER: Fetcher;

  ENVIRONMENT: string;
  AI_TEXT_MODEL: string;
  AI_VISION_MODEL: string;

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
