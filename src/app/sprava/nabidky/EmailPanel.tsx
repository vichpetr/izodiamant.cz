'use client';

// Krok 1: zdrojová poptávka – odesílatel, shrnutí od AI a hlavně celý text,
// který klient opravdu napsal (shrnutí může něco vynechat). Dlouhý text je
// zkrácený a rozbalí se tlačítkem.

import { useState } from 'react';
import type { InboxRow } from '@/lib/quotesDb';
import { cardCls, fmtDateTime, ghostBtn, headingCls } from './ui';

const LONG = 1200;

export default function EmailPanel({ source }: { source: InboxRow }) {
  const [expanded, setExpanded] = useState(false);
  const from = source.from_name ? `${source.from_name} <${source.from_email}>` : source.from_email;
  const body = source.body_text ?? '';
  const long = body.length > LONG;

  return (
    <section className={`${cardCls} text-sm`}>
      <h2 className={`${headingCls} mb-3`}>E-mail od klienta</h2>
      <p>
        <strong>{from}</strong> · {fmtDateTime(source.received_at)}
      </p>
      <p className="text-neutral-dark/60">{source.subject || 'Bez předmětu'}</p>
      {source.summary && (
        <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-neutral-dark/80">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-ink mr-2">Shrnutí AI</span>
          {source.summary}
        </p>
      )}
      {body ? (
        <>
          {/* Prostý text – HTML z cizího e-mailu se nikdy nevykresluje. */}
          <pre
            className={`mt-4 whitespace-pre-wrap break-words font-sans leading-relaxed text-neutral-dark/80 bg-neutral-light rounded-2xl p-4 ${
              expanded ? '' : 'max-h-72 overflow-hidden'
            }`}
          >
            {expanded || !long ? body : `${body.slice(0, LONG)}…`}
          </pre>
          {long && (
            <button type="button" onClick={() => setExpanded((v) => !v)} className={`${ghostBtn} mt-2`}>
              {expanded ? 'Sbalit' : 'Zobrazit celý e-mail'}
            </button>
          )}
        </>
      ) : (
        <p className="mt-3 text-neutral-dark/50">Text zprávy není uložený (starší poptávka).</p>
      )}
    </section>
  );
}
