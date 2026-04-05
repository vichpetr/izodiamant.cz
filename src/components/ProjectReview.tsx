'use client';

import { useState, useEffect } from 'react';
import { Icons } from './Icons';
import staticReviews from '@/data/reviews.json';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export default function ProjectReview({ reviewId }: { reviewId: string }) {
  const [review, setReview] = useState<Review | null>(null);
  const workerUrl = process.env.NEXT_PUBLIC_REVIEWS_API_URL;

  useEffect(() => {
    async function fetchReview() {
      // 1. Try Live API if configured
      if (workerUrl && !workerUrl.includes('vás-účet')) {
        try {
          const res = await fetch(workerUrl, { 
            headers: { 'Accept': 'application/json' }
          });
          
          if (!res.ok) return;
          
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Expected JSON but received ${contentType}`);
          }

          const text = await res.text();
          if (!text) throw new Error('Empty response from review API');
          
          const data = JSON.parse(text);
          if (data && data.reviews) {
            const found = data.reviews.find((r: any) => r.id === reviewId);
            if (found) {
              setReview({ ...found, rating: Number(found.rating) });
              return;
            }
          }
        } catch (err) {
          console.warn('Review API fetch failed on project page:', err instanceof Error ? err.message : String(err));
        }
      }

      // 2. Fallback to static
      try {
        const fallback = (staticReviews as any[]).find(r => r.id === reviewId);
        if (fallback) {
          setReview({ ...fallback, rating: Number(fallback.rating) });
        }
      } catch (err) {
        console.warn('Static review lookup failed');
      }
    }

    fetchReview();
  }, [reviewId, workerUrl]);

  if (!review) return null;

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

  const reviewSchema = {
    "@context": "https://schema.org/",
    "@type": "Review",
    "itemReviewed": {
      "@type": "LocalBusiness",
      "name": "IZODIAMANT"
    },
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5"
    },
    "reviewBody": review.text,
    "datePublished": review.date
  };

  return (
    <div className="bg-white rounded-3xl p-8 border-2 border-primary/10 relative overflow-hidden group shadow-sm mt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      <Icons.Quote className="absolute top-6 right-8 w-12 h-12 text-primary/5 group-hover:text-primary/10 transition-colors" />
      
      <div className="mb-6">
        {renderStars(review.rating)}
      </div>

      <p className="text-lg text-neutral-dark/80 font-medium italic leading-relaxed mb-8 relative z-10">
        "{review.text}"
      </p>

      <div className="pt-6 border-t border-neutral-light flex justify-between items-center">
        <div>
          <div className="font-black text-neutral-dark uppercase tracking-tight italic">{review.author}</div>
          <div className="text-[10px] font-bold text-neutral-dark/40 uppercase tracking-widest mt-1">Zákazník IZODIAMANT</div>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest">
          Ověřená recenze
        </div>
      </div>
    </div>
  );
}
