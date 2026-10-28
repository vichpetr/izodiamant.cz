// Odesílání e-mailů z webu přes quotes-worker (SMTP schránky Seznam, stejná jako
// u nabídek). Odesílatel je vždy ta schránka (MAILBOX_USER ve quotes-worker/wrangler.toml).

import { callQuotesWorker, isQuotesWorkerAvailable } from './quotesWorker';

export interface WebMail {
  to: string;
  subject: string;
  html: string;
  replyTo?: string | null;
  /** Kopie do Odeslaných; vypnout u zpráv do vlastní schránky. */
  saveToSent?: boolean;
}

export const isMailerAvailable = isQuotesWorkerAvailable;

export async function sendWebMail(mail: WebMail): Promise<{ messageId: string }> {
  return callQuotesWorker<{ messageId: string }>('/mail/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mail),
  });
}
