'use client';

import { useState, useEffect } from 'react';
import firmyFallback from '@/data/firmy.json';
import { reviewsApiUrl } from './reviewsApi';

export interface SourceSummary {
  rating: number;
  count: number;
  url: string;
}

export interface ReviewSummary {
  firmy: SourceSummary;
  google: SourceSummary | null;
}

// Kanonická URL Google profilu (shodná s sameAs v layout.tsx). Lze přepsat env proměnnou.
const GOOGLE_URL =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || 'https://www.google.com/maps?cid=11693549259963803968';

/**
 * Souhrnné hodnocení podle zdroje z review workeru.
 *
 * - Nový worker vrací `sources: { firmy, google }` – použijeme je přímo, Google
 *   ukážeme jen když má nějaká hodnocení.
 * - Starý worker vrací jen top-level `rating`/`count` (vše = Firmy.cz/Mapy.com) –
 *   degradujeme na jediný zdroj Mapy.com.
 * - Bez workeru zůstává statický fallback z firmy.json.
 */
export function useReviewSummary(): ReviewSummary {
  const firmyUrl = process.env.NEXT_PUBLIC_FIRMY_PROFILE_URL || '#';
  const workerUrl = reviewsApiUrl();

  const [summary, setSummary] = useState<ReviewSummary>({
    firmy: { rating: firmyFallback.rating, count: firmyFallback.count, url: firmyUrl },
    google: null,
  });

  useEffect(() => {
    if (!workerUrl) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(workerUrl);
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;

        if (json.sources) {
          const f = json.sources.firmy || {};
          const g = json.sources.google || {};
          setSummary({
            firmy: {
              rating: typeof f.rating === 'number' ? f.rating : firmyFallback.rating,
              count: typeof f.count === 'number' ? f.count : firmyFallback.count,
              url: firmyUrl,
            },
            google:
              typeof g.rating === 'number' && g.count > 0
                ? { rating: g.rating, count: g.count, url: g.sourceUrl || GOOGLE_URL }
                : null,
          });
        } else {
          // Starý worker: top-level rating/count = Firmy.cz/Mapy.com.
          setSummary({
            firmy: {
              rating: typeof json.rating === 'number' ? json.rating : firmyFallback.rating,
              count: typeof json.count === 'number' ? json.count : firmyFallback.count,
              url: firmyUrl,
            },
            google: null,
          });
        }
      } catch {
        // ponecháme fallback
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workerUrl, firmyUrl]);

  return summary;
}
