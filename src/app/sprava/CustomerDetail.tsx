'use client';

// Detail zákazníka v modalu – kompletní údaje včetně celého textu
// „Zakázka / poznámka" (v tabulce se sloupec kvůli místu neukazuje).

import { useEffect, useState } from 'react';
import type { Customer } from '@/lib/db';
import { Icons } from '@/components/Icons';

function fmt(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('cs-CZ');
}

// Kdo záznam vytvořil: 'system' = automaticky z webu, jinak e-mail admina.
function createdByLabel(v?: string | null): string {
  if (!v) return '—';
  return v === 'system' ? 'Automaticky (web)' : v;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-neutral-light/70 last:border-0">
      <dt className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 mb-1">{label}</dt>
      <dd className="text-sm text-neutral-dark/80 whitespace-pre-wrap break-words">{children}</dd>
    </div>
  );
}

export default function CustomerDetail({ customer: c }: { customer: Customer }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Detail"
        aria-label="Detail zákazníka"
        className="p-2 rounded-lg text-neutral-dark/40 hover:text-primary-ink hover:bg-neutral-light transition-colors"
      >
        <Icons.Info className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center bg-black/50 p-4 overflow-auto" onClick={() => setOpen(false)} role="presentation">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 my-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Detail zákazníka ${c.name}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black uppercase italic text-neutral-dark">{c.name}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Zavřít" className="text-neutral-dark/40 hover:text-neutral-dark text-2xl leading-none px-2">×</button>
            </div>

            <dl>
              <Row label="E-mail">{c.email || '—'}</Row>
              <Row label="Telefon">{c.phone || '—'}</Row>
              <Row label="Velikost / hodnota zakázky">{c.job_size || '—'}</Row>
              <Row label="Zakázka / poznámka">{c.project || '—'}</Row>
              <Row label="Datum zadání">{fmt(c.created_at)}</Row>
              <Row label="Datum realizace">{fmt(c.realized_at)}</Row>
              <Row label="Zdroj">{c.source}</Row>
              <Row label="Zadal">{createdByLabel(c.created_by)}</Row>
              <Row label="Poděkování">
                {c.last_email_at
                  ? `${c.last_email_status === 'sent' ? 'Odesláno' : 'Chyba'} · ${fmt(c.last_email_at)}${c.last_email_by ? ` · ${c.last_email_by}` : ''}`
                  : 'Neodesláno'}
              </Row>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
