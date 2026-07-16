'use client';

import { useState, useEffect } from 'react';
import { Icons } from './Icons';

/** Oficiální čtyřbarevné Google „G" logo (inline SVG, bez externího assetu). */
export function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

interface GoogleSummary {
  rating: number;
  count: number;
}

/**
 * Souhrnný odznak hodnocení z Google (Places API přes worker).
 * Čte `sources.google` z workeru a odkazuje na profil (`NEXT_PUBLIC_GOOGLE_MAPS_URL`).
 * Dokud firma nemá ověřený Google profil s recenzemi, komponenta se nevykreslí.
 */
export default function GoogleBadge() {
  const [data, setData] = useState<GoogleSummary | null>(null);
  const profileUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL;
  const workerUrl = process.env.NEXT_PUBLIC_REVIEWS_API_URL;

  useEffect(() => {
    if (!workerUrl || workerUrl.includes('vás-účet')) return;

    let cancelled = false;
    async function fetchLiveSummary() {
      try {
        const res = await fetch(workerUrl!);
        if (!res.ok) return;

        const json = await res.json();
        const g = json?.sources?.google;
        if (g && typeof g.rating === 'number' && g.rating > 0 && g.count > 0) {
          if (!cancelled) setData({ rating: g.rating, count: g.count });
        }
      } catch {
        console.warn('Chyba při načítání živých dat hodnocení Google');
      }
    }

    fetchLiveSummary();
    return () => {
      cancelled = true;
    };
  }, [workerUrl]);

  // Dormantní: profil na Googlu zatím neexistuje / nemá recenze.
  if (!data || !profileUrl) return null;

  const { rating, count } = data;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-dark/5 hover:border-primary transition-all group"
    >
      <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
        <GoogleG className="w-8 h-8" />
      </div>
      <div>
        <div className="flex items-center gap-1 text-primary mb-0.5">
          {[...Array(5)].map((_, i) => (
            <Icons.Star
              key={i}
              className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-current' : 'text-neutral-200'}`}
            />
          ))}
          <span className="ml-1 text-neutral-dark font-black text-sm italic">{rating.toFixed(1)}</span>
        </div>
        <div className="text-[10px] font-black text-neutral-dark/40 uppercase tracking-widest group-hover:text-neutral-dark transition-colors">
          {count} hodnocení na Googlu
        </div>
      </div>
    </a>
  );
}
