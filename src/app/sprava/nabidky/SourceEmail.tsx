'use client';

// Zdrojová poptávka u nabídky z e-mailu: odesílatel, předmět a shrnutí od AI.
// Celý text zprávy je za tlačítkem v modálním okně – shrnutí může něco vynechat,
// tohle je to, co klient opravdu napsal.

import { useEffect, useState } from 'react';
import type { InboxRow } from '@/lib/quotesDb';
import { cardCls, fmtDateTime, ghostBtn, headingCls } from './ui';

export default function SourceEmail({ source, summary }: { source: InboxRow; summary: string | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const from = source.from_name ? `${source.from_name} <${source.from_email}>` : source.from_email;

  return (
    <section className={`${cardCls} text-sm`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <h2 className={headingCls}>Zdrojový e-mail</h2>
        <button type="button" onClick={() => setOpen(true)} disabled={!source.body_text} className={ghostBtn}>
          {source.body_text ? 'Zobrazit celý e-mail' : 'Text zprávy není uložený'}
        </button>
      </div>
      <p>
        <strong>{from}</strong> · {fmtDateTime(source.received_at)}
      </p>
      <p className="text-neutral-dark/60">{source.subject}</p>
      {summary && <p className="mt-2 text-neutral-dark/80">{summary}</p>}

      {open && source.body_text && (
        <div className="fixed inset-0 z-[120] bg-black/60 p-4 flex items-start justify-center overflow-auto" onClick={() => setOpen(false)} role="presentation">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Celý text e-mailu"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-black uppercase italic text-neutral-dark">{source.subject || 'E-mail bez předmětu'}</h3>
                <p className="text-xs text-neutral-dark/50 mt-1">
                  {from} · {fmtDateTime(source.received_at)}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Zavřít" className="text-neutral-dark/40 hover:text-neutral-dark text-2xl leading-none px-2">
                ×
              </button>
            </div>
            {/* Text zprávy zobrazujeme jako prostý text – HTML z cizího e-mailu se nikdy nevykresluje. */}
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-neutral-dark/80 bg-neutral-light rounded-2xl p-4 max-h-[60vh] overflow-auto">
              {source.body_text}
            </pre>
            <p className="text-[11px] text-neutral-dark/40 mt-3">Přílohy najdete v sekci Plánky a výkresy.</p>
          </div>
        </div>
      )}
    </section>
  );
}
