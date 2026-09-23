'use client';

// PDF + průvodní e-mail. Text e-mailu navrhne AI při prvním vygenerování PDF,
// dá se upravit, zkopírovat, uložit jako koncept do schránky (fáze 3a) nebo –
// když je SEND_ENABLED – rovnou odeslat (fáze 3b).

import { useState } from 'react';
import type { Quote } from '@/lib/quotes/model';
import { Icons } from '@/components/Icons';
import { cardCls, fileUrl, fmtDateTime, ghostBtn, headingCls, inputCls, labelCls, primarySmall } from './ui';
import { submitWithoutReset, useToastAction, type Action } from './useToastAction';
import Working from './Working';

export default function OutputPanel({
  quote,
  mailbox,
  mailboxReady,
  sendEnabled,
  saveEmailAction,
  regenerateEmailAction,
  draftEmailAction,
  sendEmailAction,
}: {
  quote: Quote;
  mailbox: string | null;
  mailboxReady: boolean;
  sendEnabled: boolean;
  saveEmailAction: Action;
  regenerateEmailAction: Action;
  draftEmailAction: Action;
  sendEmailAction: Action;
}) {
  const [subject, setSubject] = useState(quote.email_subject ?? '');
  const [body, setBody] = useState(quote.email_body ?? '');
  const [copied, setCopied] = useState(false);
  const [saveFormAction, saving] = useToastAction(saveEmailAction);
  const [regenFormAction, regenerating] = useToastAction(regenerateEmailAction);
  const [draftFormAction, drafting] = useToastAction(draftEmailAction);
  const [sendFormAction, sending] = useToastAction(sendEmailAction);

  const stale = Boolean(quote.pdf_key) && quote.status === 'koncept';
  const dirty = subject !== (quote.email_subject ?? '') || body !== (quote.email_body ?? '');
  const canMail = Boolean(quote.pdf_key && quote.client_email && quote.email_subject && quote.email_body) && !dirty;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* schránka nedostupná */
    }
  };

  return (
    <section className={cardCls}>
      <h2 className={`${headingCls} mb-4`}>PDF a e-mail klientovi</h2>

      {quote.pdf_key ? (
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <a href={fileUrl(quote.pdf_key)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 btn-primary py-2.5 px-5 uppercase tracking-widest text-xs">
            <Icons.FileText className="w-4 h-4" /> {quote.number}.pdf
          </a>
          <span className="text-xs text-neutral-dark/50">vygenerováno {fmtDateTime(quote.pdf_generated_at)}</span>
        </div>
      ) : (
        <p className="text-sm text-neutral-dark/50 mb-2">PDF zatím není – vyplňte nabídku a klikněte na „Uložit a vygenerovat PDF“.</p>
      )}
      {stale && <p className="text-sm text-amber-800 bg-amber-50 rounded-xl px-3 py-2 mb-2">Nabídka se od vygenerování změnila – PDF vygenerujte znovu.</p>}

      {(quote.email_body || quote.pdf_key) && (
        <form onSubmit={submitWithoutReset((fd) => (fd.get('intent') === 'regenerate' ? regenFormAction(fd) : saveFormAction(fd)))} className="space-y-3 mt-5">
          <input type="hidden" name="id" value={quote.id} />
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Předmět</span>
            <input name="email_subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Text e-mailu {quote.client_email ? `(pro ${quote.client_email})` : ''}</span>
            <textarea name="email_body" rows={12} value={body} onChange={(e) => setBody(e.target.value)} className={`${inputCls} resize-y text-sm leading-relaxed`} />
          </label>
          {regenerating && <Working label="AI píše návrh e-mailu…" hint="Obvykle do 15 s." />}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={saving || !dirty} className={primarySmall}>{saving ? 'Ukládám…' : 'Uložit text'}</button>
            <button type="button" onClick={copy} className={ghostBtn}>{copied ? 'Zkopírováno' : 'Kopírovat'}</button>
            <button type="submit" name="intent" value="regenerate" disabled={regenerating} className={ghostBtn} title="Přepíše text novým návrhem od AI">
              {regenerating ? 'Navrhuji…' : 'Navrhnout znovu (AI)'}
            </button>
          </div>
        </form>
      )}

      {quote.pdf_key && (
        <div className="mt-6 pt-5 border-t border-neutral-light">
          {!mailboxReady ? (
            <p className="text-sm text-neutral-dark/50">Schránka pro koncepty není nastavená (quotes-worker: MAILBOX_USER + MAILBOX_PASSWORD).</p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <form action={draftFormAction}>
                <input type="hidden" name="id" value={quote.id} />
                <button type="submit" disabled={!canMail || drafting} className={primarySmall} title={`Uloží e-mail s PDF do Konceptů schránky ${mailbox ?? ''}`}>
                  {drafting ? 'Ukládám…' : 'Uložit jako koncept do schránky'}
                </button>
              </form>
              {sendEnabled && (
                <form
                  action={sendFormAction}
                  onSubmit={(e) => {
                    if (!confirm(`Opravdu odeslat nabídku na ${quote.client_email}?`)) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={quote.id} />
                  <button type="submit" disabled={!canMail || sending} className="text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-neutral-dark text-white hover:bg-neutral-dark/80 disabled:opacity-50">
                    {sending ? 'Odesílám…' : 'Odeslat klientovi'}
                  </button>
                </form>
              )}
              {(drafting || sending) && <Working label={drafting ? 'Ukládám koncept do schránky…' : 'Odesílám e-mail…'} hint="Připojuji se k poštovnímu serveru." className="w-full" />}
              {!canMail && (
                <span className="text-[11px] text-neutral-dark/40">
                  {!quote.client_email ? 'Chybí e-mail klienta.' : dirty ? 'Nejdřív uložte text.' : 'Chybí PDF nebo text e-mailu.'}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
