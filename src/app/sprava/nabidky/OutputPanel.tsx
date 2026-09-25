'use client';

// Krok 3 – průvodní e-mail. Text navrhne AI při prvním vygenerování PDF, dá se
// upravit, zkopírovat, uložit jako koncept do schránky nebo – když je
// SEND_ENABLED – rovnou odeslat. Přílohy = vybraná verze PDF (+ vyplněný výkaz).

import { useState } from 'react';
import type { Quote } from '@/lib/quotes/model';
import { cardCls, ghostBtn, headingCls, inputCls, labelCls, primarySmall } from './ui';
import { submitWithoutReset, useToastAction, type Action } from './useToastAction';
import Working from './Working';

export default function OutputPanel({
  quote,
  attachments,
  versionCount,
  mailbox,
  mailboxReady,
  sendEnabled,
  saveEmailAction,
  regenerateEmailAction,
  draftEmailAction,
  sendEmailAction,
}: {
  quote: Quote;
  /** Názvy souborů, které půjdou s e-mailem (PDF vybrané verze, případně výkaz). */
  attachments: string[];
  versionCount: number;
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

  const hasPdf = attachments.length > 0;
  const dirty = subject !== (quote.email_subject ?? '') || body !== (quote.email_body ?? '');
  const canMail = Boolean(hasPdf && quote.client_email && quote.email_subject && quote.email_body) && !dirty;

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
      <h2 className={`${headingCls} mb-4`}>E-mail klientovi</h2>

      {hasPdf ? (
        <p className="text-sm mb-2">
          <span className={`${labelCls} ml-0 mr-2`}>Přílohy</span>
          {attachments.join(' · ')}
        </p>
      ) : (
        <p className="text-sm text-neutral-dark/50 mb-2">E-mail půjde připravit, až bude PDF nabídky (krok 2 → „Uložit a vygenerovat přílohy“).</p>
      )}
      {versionCount > 1 && (
        <p className="text-xs text-neutral-dark/50 mb-2">Nabídka má víc verzí – ceny v textu e-mailu se samy nemění. Zkontrolujte je, případně „Navrhnout znovu (AI)“.</p>
      )}

      {(quote.email_body || hasPdf) && (
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

      {hasPdf && (
        <div className="mt-6 pt-5 border-t border-neutral-light">
          {!mailboxReady ? (
            <p className="text-sm text-neutral-dark/50">Schránka pro koncepty není nastavená (quotes-worker: MAILBOX_USER + MAILBOX_PASSWORD).</p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <form action={draftFormAction}>
                <input type="hidden" name="id" value={quote.id} />
                <button type="submit" disabled={!canMail || drafting} className={primarySmall} title={`Uloží e-mail s přílohami do Konceptů schránky ${mailbox ?? ''} – odešlete ho sami ze Seznamu`}>
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
