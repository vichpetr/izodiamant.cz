'use client';

import { useState } from 'react';
import ArticlesAdminList, { type AdminArticle } from './ArticlesAdminList';
import ReferencesAdminList, { type AdminReference } from './ReferencesAdminList';
import { cn } from '@/lib/utils';

/** Přepínač obsahu pro FB posty: Články (naplánované/zveřejněné) a Reference. */
export default function SpravaContentTabs({
  articles,
  references,
}: {
  articles: AdminArticle[];
  references: AdminReference[];
}) {
  const [view, setView] = useState<'clanky' | 'reference'>('clanky');

  const tabs = [
    { key: 'clanky' as const, label: 'Články', count: articles.length },
    { key: 'reference' as const, label: 'Reference', count: references.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-dark/10 pb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setView(t.key)}
            className={cn(
              'inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest px-5 py-2.5 rounded-full transition-colors',
              view === t.key
                ? 'bg-neutral-dark text-white'
                : 'bg-white text-neutral-dark/60 border border-neutral-dark/10 hover:text-neutral-dark',
            )}
          >
            {t.label}
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px]',
                view === t.key ? 'bg-white/20 text-white' : 'bg-neutral-dark/5 text-neutral-dark/50',
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {view === 'clanky' ? (
        <ArticlesAdminList articles={articles} />
      ) : (
        <ReferencesAdminList items={references} />
      )}
    </div>
  );
}
