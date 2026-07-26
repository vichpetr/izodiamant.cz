'use client';

// Buňka „Zakázka / poznámka" – krátký náhled v řádku, dlouhý text otevře modal.
// Drží tabulku kompaktní i u dlouhých poznámek.

import { useEffect, useState } from 'react';

const PREVIEW = 60; // znaků náhledu

export default function ProjectCell({ text }: { text: string | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!text) return <span className="text-neutral-dark/40">—</span>;

  const isLong = text.length > PREVIEW;
  const preview = isLong ? `${text.slice(0, PREVIEW).trimEnd()}…` : text;

  return (
    <>
      <span className="whitespace-pre-wrap">{preview}</span>
      {isLong && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-1 text-[10px] font-black uppercase tracking-widest text-primary-ink hover:text-neutral-dark whitespace-nowrap"
        >
          Zobrazit
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Zakázka / poznámka"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase italic text-neutral-dark">Zakázka / poznámka</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zavřít"
                className="text-neutral-dark/40 hover:text-neutral-dark text-2xl leading-none px-2"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-neutral-dark/80 whitespace-pre-wrap leading-relaxed">{text}</p>
          </div>
        </div>
      )}
    </>
  );
}
