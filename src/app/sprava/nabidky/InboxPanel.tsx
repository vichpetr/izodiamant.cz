'use client';

// Fáze 2: stav čtení schránky + posledně zpracované e-maily. Tlačítko spustí
// kontrolu hned (jinak běží cron každých 15 min, pokud je INBOX_ENABLED).

import Link from 'next/link';
import type { InboxRow } from '@/lib/quotesDb';
import type { WorkerStatus } from '@/lib/quotesWorker';
import { cardCls, fmtDateTime, ghostBtn, headingCls } from './ui';
import { useToastAction, type Action } from './useToastAction';

const STATUS_LABEL: Record<string, string> = {
  nabidka: 'Poptávka → nabídka',
  odpoved: 'Odpověď k nabídce',
  ignorovano: 'Ostatní',
  chyba: 'Chyba',
};

export default function InboxPanel({
  status,
  inbox,
  pollAction,
  retryAction,
}: {
  status: WorkerStatus | null;
  inbox: InboxRow[];
  pollAction: Action;
  retryAction: Action;
}) {
  const [pollFormAction, polling] = useToastAction(pollAction);
  const [retryFormAction] = useToastAction(retryAction);

  if (!status) {
    return (
      <section className={`${cardCls} text-sm text-neutral-dark/60`}>
        <strong className="text-neutral-dark">Služba nabídek není připojená.</strong> Chybí service binding <code>QUOTES</code> v Pages projektu (viz deployment.MD). PDF, AI ani schránka bez ní nefungují.
      </section>
    );
  }

  const last = status.lastPoll;
  return (
    <section className={cardCls}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={headingCls}>Schránka {status.mailbox ?? '(nenastavena)'}</h2>
          <p className="text-sm text-neutral-dark/50 mt-1">
            {status.environment !== 'production' && <span className="font-black text-amber-700 uppercase mr-2">{status.environment}</span>}
            Automatické čtení: <strong>{status.inboxEnabled ? 'zapnuto (každých 15 min)' : 'vypnuto'}</strong>
            {' · '}Přímé odesílání: <strong>{status.sendEnabled ? 'zapnuto' : 'vypnuto (jen koncepty)'}</strong>
            {last && (
              <>
                {' · '}Poslední kontrola {fmtDateTime(last.at)}
                {last.skipped ? ` – ${last.skipped}` : ` – ${last.checked} nových, ${last.created} poptávek${last.errors ? `, ${last.errors} chyb` : ''}`}
              </>
            )}
          </p>
        </div>
        <form action={pollFormAction}>
          <button type="submit" disabled={polling || !status.mailboxConfigured} className={ghostBtn}>
            {polling ? 'Kontroluji…' : 'Zkontrolovat schránku'}
          </button>
        </form>
      </div>

      {inbox.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-[11px] font-black uppercase tracking-widest text-neutral-dark/50">Zpracované e-maily ({inbox.length})</summary>
          <ul className="mt-3 divide-y divide-neutral-light text-sm">
            {inbox.map((m) => (
              <li key={m.id} className="py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-neutral-dark/40 text-xs w-28">{fmtDateTime(m.received_at ?? m.processed_at)}</span>
                <span className="font-medium">{m.from_name || m.from_email || '—'}</span>
                <span className="text-neutral-dark/60 flex-1 min-w-[12rem] truncate">{m.subject}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${m.status === 'chyba' ? 'text-red-700' : 'text-neutral-dark/40'}`}>
                  {STATUS_LABEL[m.status] ?? m.status}
                </span>
                {m.quote_id && (
                  <Link href={`/sprava/nabidky?id=${m.quote_id}`} className="text-[11px] font-black uppercase tracking-widest text-primary-ink hover:underline">
                    Nabídka
                  </Link>
                )}
                {m.status === 'chyba' && (
                  <form action={retryFormAction} className="flex items-center gap-2">
                    <input type="hidden" name="inbox_id" value={m.id} />
                    <span className="text-xs text-red-700" title={m.error ?? ''}>{m.error?.slice(0, 60)}</span>
                    <button type="submit" className="text-[11px] font-black uppercase tracking-widest text-neutral-dark/60 hover:text-neutral-dark">Zkusit znovu</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
