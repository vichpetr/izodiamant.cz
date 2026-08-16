'use client';

import { useState } from 'react';
import CopyBox from './CopyBox';

export interface AdminReference {
  id: string;
  title: string;
  location: string;
  date: string;
  technology: string;
  fbPost: string;
}

const PAGE_SIZE = 8;

/** Výpis referencí v adminu s FB postem ke zkopírování a stránkováním. */
export default function ReferencesAdminList({ items }: { items: AdminReference[] }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        {pageItems.map((r) => (
          <section key={r.id} className="bg-white rounded-3xl border border-neutral-dark/5 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <h2 className="font-black uppercase italic text-neutral-dark tracking-tight leading-tight">{r.title}</h2>
                <p className="text-sm text-neutral-dark/60 mt-1">
                  {r.location} · {r.date}
                </p>
              </div>
              <span className="shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-neutral-dark/5 text-neutral-dark/60">
                {r.technology}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <a
                href={`/reference/${r.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-ink hover:underline"
              >
                Otevřít referenci ↗
              </a>
              <span className="text-[11px] text-neutral-dark/40 font-mono">/reference/{r.id}</span>
            </div>

            <CopyBox text={r.fbPost} />
          </section>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg bg-white border border-neutral-dark/10 text-neutral-dark disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:border-primary/40 transition-colors"
          >
            ← Předchozí
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-neutral-dark/50">
            Strana {currentPage} z {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg bg-white border border-neutral-dark/10 text-neutral-dark disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:border-primary/40 transition-colors"
          >
            Další →
          </button>
        </div>
      )}
    </div>
  );
}
