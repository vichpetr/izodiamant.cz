'use client';

import { useState } from 'react';
import CopyBox from './CopyBox';
import { cn } from '@/lib/utils';

export interface AdminArticle {
  slug: string;
  title: string;
  excerpt: string;
  fbPost: string;
  published: boolean;
  formattedDate: string;
}

type Filter = 'all' | 'scheduled' | 'published';

/** Výpis článků v adminu se záložkami Vše / Naplánované / Zveřejněné. */
export default function ArticlesAdminList({ articles }: { articles: AdminArticle[] }) {
  const [filter, setFilter] = useState<Filter>('all');

  const scheduledCount = articles.filter((a) => !a.published).length;
  const publishedCount = articles.length - scheduledCount;

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Vše', count: articles.length },
    { key: 'scheduled', label: 'Naplánované', count: scheduledCount },
    { key: 'published', label: 'Zveřejněné', count: publishedCount },
  ];

  const visible = articles.filter((a) =>
    filter === 'all' ? true : filter === 'scheduled' ? !a.published : a.published,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={cn(
              'inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full transition-colors',
              filter === t.key
                ? 'bg-neutral-dark text-white'
                : 'bg-white text-neutral-dark/60 border border-neutral-dark/10 hover:text-neutral-dark',
            )}
          >
            {t.label}
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px]',
                filter === t.key ? 'bg-white/20 text-white' : 'bg-neutral-dark/5 text-neutral-dark/50',
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {visible.length === 0 && (
          <p className="text-sm text-neutral-dark/50 italic">V této kategorii nejsou žádné články.</p>
        )}
        {visible.map((a) => (
          <section key={a.slug} className="bg-white rounded-3xl border border-neutral-dark/5 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <h2 className="font-black uppercase italic text-neutral-dark tracking-tight leading-tight">{a.title}</h2>
                <p className="text-sm text-neutral-dark/60 mt-1">{a.excerpt}</p>
              </div>
              <span
                className={cn(
                  'shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full',
                  a.published ? 'bg-primary/15 text-primary-ink' : 'bg-amber-100 text-amber-800',
                )}
              >
                {a.published ? 'Zveřejněno' : 'Naplánováno'} · {a.formattedDate}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <a
                href={`/clanky/${a.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-ink hover:underline"
              >
                Náhled článku ↗
              </a>
              <span className="text-[11px] text-neutral-dark/40 font-mono">/clanky/{a.slug}</span>
            </div>

            <CopyBox text={a.fbPost} />
          </section>
        ))}
      </div>
    </div>
  );
}
