'use client';

import { useState, useEffect } from 'react';
import { reviewsApiUrl } from './reviewsApi';

export interface SourceSummary {
  rating: number;
  count: number;
  url: string;
}

export interface ReviewSummary {
  firmy: SourceSummary | null;
  google: SourceSummary | null;
}

// Kanonická URL Google profilu (shodná s sameAs v layout.tsx). Lze přepsat env proměnnou.
const GOOGLE_URL =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || 'https://www.google.com/maps?cid=11693549259963803968';

export function useReviewSummary(): ReviewSummary {
  const firmyUrl = process.env.NEXT_PUBLIC_FIRMY_PROFILE_URL || 'https://www.firmy.cz/detail/13505805-izodiamant-nove-hrady-mokra-lhota.html';
  const workerUrl = reviewsApiUrl();

  const [summary, setSummary] = useState<ReviewSummary>({
    firmy: null,
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

        const sourceSummary = (source: { rating?: unknown; count?: unknown; error?: unknown } | undefined, url: string): SourceSummary | null =>
          source && !source.error && typeof source.rating === 'number' &&
          Number.isFinite(source.rating) && source.rating >= 1 && source.rating <= 5 &&
          typeof source.count === 'number' && Number.isInteger(source.count) && source.count > 0
            ? { rating: source.rating, count: source.count, url }
            : null;

        setSummary({
          firmy: sourceSummary(json.sources ? json.sources.firmy : json, firmyUrl),
          google: sourceSummary(json.sources?.google, GOOGLE_URL),
        });
      } catch {
        if (!cancelled) setSummary({ firmy: null, google: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workerUrl, firmyUrl]);

  return summary;
}
