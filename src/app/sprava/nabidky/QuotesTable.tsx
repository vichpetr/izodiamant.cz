'use client';

// Seznam nabídek s filtrem podle stavu a hledáním. Klik na řádek = editor.

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { QuoteListRow } from '@/lib/quotesDb';
import { formatArea, formatCzk } from '@/lib/quotes/calc';
import { QUOTE_STATUSES, type QuoteStatus } from '@/lib/quotes/model';
import { StatusBadge, fileUrl, fmtDateTime } from './ui';

function priceLabel(q: QuoteListRow): string {
  if (!q.items_count) return '—';
  if (q.mode === 'varianty') return `${q.items_count} varianty`;
  return formatCzk((q.work_total ?? 0) + q.transport_price);
}

export default function QuotesTable({ quotes }: { quotes: QuoteListRow[] }) {
  const [status, setStatus] = useState<'all' | QuoteStatus>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotes.filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      if (!q) return true;
      return [row.number, row.client_name, row.client_email, row.city, row.site_address, row.site_name].some((v) => v?.toLowerCase().includes(q));
    });
  }, [quotes, status, query]);

  const counts = useMemo(() => {
    const c: Partial<Record<QuoteStatus, number>> = {};
    quotes.forEach((q) => (c[q.status] = (c[q.status] ?? 0) + 1));
    return c;
  }, [quotes]);

  return (
    <div className="bg-white rounded-3xl border border-neutral-dark/5 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-4 border-b border-neutral-light">
        <button
          type="button"
          onClick={() => setStatus('all')}
          className={`text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${status === 'all' ? 'bg-neutral-dark text-white' : 'bg-neutral-light text-neutral-dark/60'}`}
        >
          Vše ({quotes.length})
        </button>
        {(Object.keys(QUOTE_STATUSES) as QuoteStatus[]).map((s) =>
          counts[s] ? (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${status === s ? 'bg-neutral-dark text-white' : 'bg-neutral-light text-neutral-dark/60'}`}
            >
              {QUOTE_STATUSES[s]} ({counts[s]})
            </button>
          ) : null,
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hledat…"
          aria-label="Hledat v nabídkách"
          className="ml-auto border-2 border-neutral-light rounded-xl px-3 py-1.5 text-sm outline-none focus:border-primary"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="p-8 text-center text-neutral-dark/50 text-sm">Žádné nabídky.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-neutral-dark/40">
                <th className="px-4 py-3">Nabídka</th>
                <th className="px-4 py-3">Klient</th>
                <th className="px-4 py-3">Místo</th>
                <th className="px-4 py-3 text-right">Plocha</th>
                <th className="px-4 py-3 text-right">Cena</th>
                <th className="px-4 py-3">Stav</th>
                <th className="px-4 py-3">PDF</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id} className="border-t border-neutral-light hover:bg-neutral-light/50">
                  <td className="px-4 py-3">
                    <Link href={`/sprava/nabidky?id=${q.id}`} className="font-bold text-neutral-dark hover:text-primary-ink">
                      {q.number ?? `Koncept #${q.id}`}
                    </Link>
                    <div className="text-[11px] text-neutral-dark/40">
                      {fmtDateTime(q.created_at)}
                      {q.source === 'email' && ' · z e-mailu'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{q.client_name}</div>
                    <div className="text-[11px] text-neutral-dark/40">{q.client_email ?? q.client_phone ?? ''}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-dark/70">{[q.site_name, q.city].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{q.total_area ? formatArea(q.total_area) : '—'}</td>
                  <td className="px-4 py-3 text-right font-bold whitespace-nowrap">{priceLabel(q)}</td>
                  <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                  <td className="px-4 py-3">
                    {q.pdf_key ? (
                      <a href={fileUrl(q.pdf_key)} target="_blank" rel="noopener" className="text-[11px] font-black uppercase tracking-widest text-primary-ink hover:underline">
                        Otevřít
                      </a>
                    ) : (
                      <span className="text-neutral-dark/30">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
