// IMAP/SMTP nad schránkou z konfigurace (MAILBOX_USER + secret MAILBOX_PASSWORD).
// Seznam Email Profi nemá API – jen standardní IMAP (imap.seznam.cz:993) a SMTP
// (smtp.seznam.cz:465). Oboje běží přímo ve Workers přes TCP sockety
// (imapflow přes nodejs_compat, worker-mailer přes cloudflare:sockets).
// Stejnou cestou odchází i e-maily z webu (formulář, kalkulačka, poděkování) – viz sendTransactional.

import { ImapFlow } from 'imapflow';
import { Email, WorkerMailer, type EmailOptions } from 'worker-mailer';
import { flag, mailboxConfigured, type Env } from './env';
import { htmlToText, toBase64 } from './util';

export async function withImap<T>(env: Env, fn: (client: ImapFlow) => Promise<T>): Promise<T> {
  if (!mailboxConfigured(env)) throw new Error('Schránka není nastavená (MAILBOX_USER / secret MAILBOX_PASSWORD).');
  const client = new ImapFlow({
    host: env.IMAP_HOST,
    port: Number(env.IMAP_PORT) || 993,
    secure: true,
    auth: { user: env.MAILBOX_USER.trim(), pass: env.MAILBOX_PASSWORD! },
    logger: false,
    disableAutoIdle: true,
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.logout().catch(() => undefined);
  }
}

/** Složka podle konfigurace, jinak podle IMAP special-use příznaku (\Drafts, \Sent). */
export async function resolveFolder(client: ImapFlow, override: string, specialUse: '\\Drafts' | '\\Sent', fallback: string): Promise<string> {
  if (override.trim()) return override.trim();
  const folders = await client.list();
  return folders.find((f) => f.specialUse === specialUse)?.path ?? fallback;
}

export async function ensureFolder(client: ImapFlow, path: string): Promise<void> {
  const folders = await client.list();
  if (folders.some((f) => f.path === path || f.name === path)) return;
  await client.mailboxCreate(path);
}

/**
 * worker-mailer umí sestavit MIME, ale rovnou pro SMTP DATA (dot-stuffing +
 * ukončovací „.“). Pro IMAP APPEND potřebujeme čistou RFC 5322 zprávu.
 */
export function buildRfc822(options: EmailOptions): string {
  const data = new Email(options).getEmailData();
  return data.replace(/\r\n\.\r\n$/, '\r\n').replace(/\r\n\.\./g, '\r\n.').replace(/^\.\./, '.');
}

export function newMessageId(env: Env): string {
  const domain = env.MAILBOX_USER.split('@')[1] || 'izodiamant.cz';
  return `<${crypto.randomUUID()}@${domain}>`;
}

export interface OutgoingMail {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string | null;
  inReplyTo?: string | null;
  /** PDF nabídky, případně vyplněný výkaz výměr. */
  attachments?: { filename: string; data: ArrayBuffer; mimeType: string }[];
}

function mailOptions(env: Env, mail: OutgoingMail, messageId: string): EmailOptions {
  const headers: Record<string, string> = { 'Message-ID': messageId };
  if (mail.inReplyTo) {
    headers['In-Reply-To'] = mail.inReplyTo;
    headers.References = mail.inReplyTo;
  }
  return {
    from: { name: env.MAILBOX_SENDER_NAME, email: env.MAILBOX_USER.trim() },
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    reply: mail.replyTo || undefined,
    headers,
    attachments: mail.attachments?.length
      ? mail.attachments.map((a) => ({ filename: a.filename, content: toBase64(a.data), mimeType: a.mimeType }))
      : undefined,
  };
}

/** Fáze 3a: uloží koncept do složky Koncepty – uživatel ho odešle sám ze Seznamu. */
export async function saveDraft(env: Env, mail: OutgoingMail): Promise<{ messageId: string; folder: string }> {
  const messageId = newMessageId(env);
  const raw = buildRfc822(mailOptions(env, mail, messageId));
  const folder = await withImap(env, async (client) => {
    const drafts = await resolveFolder(client, env.DRAFTS_FOLDER, '\\Drafts', 'Drafts');
    await client.append(drafts, raw, ['\\Draft', '\\Seen']);
    return drafts;
  });
  return { messageId, folder };
}

async function smtpSend(env: Env, options: EmailOptions): Promise<void> {
  if (!mailboxConfigured(env)) throw new Error('Schránka není nastavená (MAILBOX_USER / secret MAILBOX_PASSWORD).');
  await WorkerMailer.send(
    {
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 465,
      secure: true,
      credentials: { username: env.MAILBOX_USER.trim(), password: env.MAILBOX_PASSWORD! },
      authType: ['plain', 'login'],
    },
    options,
  );
}

async function copyToSent(env: Env, options: EmailOptions): Promise<void> {
  try {
    await withImap(env, async (client) => {
      const sent = await resolveFolder(client, env.SENT_FOLDER, '\\Sent', 'Sent');
      await client.append(sent, buildRfc822(options), ['\\Seen']);
    });
  } catch (err) {
    // E-mail už odešel – chybějící kopie v Odeslaných nesmí akci shodit.
    console.warn('Uložení do Odeslaných selhalo:', err instanceof Error ? err.message : err);
  }
}

/** Fáze 3b: odeslání přes SMTP + kopie do Odeslaných (Seznam ji sám neukládá). */
export async function sendMail(env: Env, mail: OutgoingMail): Promise<{ messageId: string }> {
  if (!flag(env.SEND_ENABLED)) throw new Error('Přímé odesílání je vypnuté (SEND_ENABLED=false). Použijte koncept.');
  const messageId = newMessageId(env);
  const options = mailOptions(env, mail, messageId);
  await smtpSend(env, options);
  await copyToSent(env, options);
  return { messageId };
}

/**
 * E-maily z webu (upozornění na poptávku, potvrzení zákazníkovi, poděkování).
 * SEND_ENABLED se na ně nevztahuje – ten hlídá jen odesílání nabídek.
 * `saveToSent: false` pro zprávy do vlastní schránky (upozornění na poptávku).
 */
export async function sendTransactional(
  env: Env,
  mail: { to: string; subject: string; html: string; replyTo?: string | null; saveToSent?: boolean },
): Promise<{ messageId: string }> {
  const messageId = newMessageId(env);
  const options = mailOptions(env, { ...mail, text: htmlToText(mail.html) }, messageId);
  await smtpSend(env, options);
  if (mail.saveToSent !== false) await copyToSent(env, options);
  return { messageId };
}
