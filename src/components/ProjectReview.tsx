'use client';

import { useState, useEffect } from 'react';
import { Icons } from './Icons';
import ExpandableText from './ExpandableText';

type ReviewSource = 'firmy' | 'google';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  source?: ReviewSource;
  sourceUrl?: string;
}

const SOURCE_LABEL: Record<ReviewSource, string> = {
  firmy: 'Mapy.com',
  google: 'Google',
};

// Sjednotí id napříč zdroji dat: statická data i nový worker používají prefix
// (firmy-/google-), starý worker a reviewId v referencích ho nemají.
const normId = (id: string) => id.replace(/^(firmy|google)-/, '');

// Zdroj recenze primárně z prefixu reviewId (spolehlivé „kam reference patří“),
// jinak z nalezené recenze, jinak Mapy.com.
function resolveSource(reviewId: string, found?: Review): ReviewSource {
  if (reviewId.startsWith('google-')) return 'google';
  if (reviewId.startsWith('firmy-')) return 'firmy';
  return found?.source ?? 'firmy';
}

export default function ProjectReview({ reviewId }: { reviewId: string }) {
  const [review, setReview] = useState<Review | null>(null);
  const workerUrl = process.env.NEXT_PUBLIC_REVIEWS_API_URL;

  useEffect(() => {
    async function fetchReview() {
      const target = normId(reviewId);

      // 1. Živé API, pokud je nastaveno
      if (workerUrl && !workerUrl.includes('vás-účet')) {
        try {
          const res = await fetch(workerUrl, { headers: { Accept: 'application/json' } });
          if (res.ok) {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const text = await res.text();
              if (text) {
                const data = JSON.parse(text);
                if (data && Array.isArray(data.reviews)) {
                  const found = (data.reviews as Review[]).find((r) => normId(r.id) === target);
                  if (found) {
                    setReview({
                      ...found,
                      rating: Number(found.rating),
                      source: resolveSource(reviewId, found),
                    });
                    return;
                  }
                }
              }
            }
          }
        } catch (err) {
          console.warn('Review API fetch failed on project page:', err instanceof Error ? err.message : String(err));
        }
      }

      // Žádný statický fallback: recenzi zobrazujeme jen tehdy, když ji vrátí
      // živý worker. Raději nic než neaktuální/nereálnou záložní recenzi.
      // (Bez workeru – např. lokálně s placeholder URL – zůstane review null.)
    }

    fetchReview();
  }, [reviewId, workerUrl]);

  if (!review) return null;

  const source = review.source ?? 'firmy';

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1 text-primary">
        {[...Array(5)].map((_, i) => {
          const fillAmount = Math.max(0, Math.min(1, rating - i));
          if (fillAmount >= 1) return <Icons.Star key={i} className="w-4 h-4 fill-current" />;
          if (fillAmount > 0) return (
            <div key={i} className="relative w-4 h-4">
              <Icons.Star className="absolute inset-0 w-4 h-4 text-neutral-dark/10" />
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillAmount * 100}%` }}>
                <Icons.Star className="w-4 h-4 fill-current" />
              </div>
            </div>
          );
          return <Icons.Star key={i} className="w-4 h-4 text-neutral-dark/10" />;
        })}
      </div>
    );
  };

  // Žádné Review JSON-LD: recenze o vlastní firmě na vlastním webu je self-serving
  // a Google ji označuje za neplatnou (viz layout.tsx). Recenzi zobrazujeme jen jako
  // viditelný obsah, ne ve strukturovaných datech.

  const sourceBadge = (
    <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest">
      Recenze z {SOURCE_LABEL[source]}
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-8 border-2 border-primary/10 relative overflow-hidden group shadow-sm mt-12">
      <Icons.Quote className="absolute top-6 right-8 w-12 h-12 text-primary/5 group-hover:text-primary/10 transition-colors" />

      <div className="mb-6">
        {renderStars(review.rating)}
      </div>

      {/* Recenze bez textu (jen hvězdičky) by vykreslila prázdné „“. */}
      {review.text.trim() && (
        <ExpandableText
          text={`„${review.text}“`}
          clampLines={10}
          charThreshold={450}
          className="text-lg text-neutral-dark/80 font-medium italic leading-relaxed relative z-10"
          buttonClassName="text-[11px] text-primary hover:text-neutral-dark"
        />
      )}

      <div className="pt-6 mt-8 border-t border-neutral-light flex justify-between items-center">
        <div>
          <div className="font-black text-neutral-dark uppercase tracking-tight italic">{review.author}</div>
          <div className="text-[10px] font-bold text-neutral-dark/40 uppercase tracking-widest mt-1">Zákazník IZODIAMANT</div>
        </div>
        {review.sourceUrl ? (
          <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer" title={`Zdroj: ${SOURCE_LABEL[source]}`}>
            {sourceBadge}
          </a>
        ) : (
          sourceBadge
        )}
      </div>
    </div>
  );
}
