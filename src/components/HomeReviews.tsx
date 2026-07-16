'use client';

import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Icons } from './Icons';
import staticReviews from '@/data/reviews.json';
import ExpandableText from './ExpandableText';

type ReviewSource = 'firmy' | 'google';

interface Review {
  id: string;
  source: ReviewSource;
  author: string;
  rating: number;
  text: string;
  date: string;
  sourceUrl?: string;
  authorUrl?: string;
  profilePhoto?: string;
}

const SOURCE_LABEL: Record<ReviewSource, string> = {
  firmy: 'Mapy.com',
  google: 'Google',
};

function normalizeReview(r: unknown): Review | null {
  if (!r || typeof r !== 'object') return null;
  const o = r as Record<string, unknown>;
  if (typeof o.author !== 'string' || typeof o.text !== 'string' || typeof o.date !== 'string') return null;
  const ratingNum = Number(o.rating);
  if (!Number.isFinite(ratingNum)) return null;
  const source: ReviewSource = o.source === 'google' ? 'google' : 'firmy';
  return {
    id: typeof o.id === 'string' ? o.id : `${source}-${o.date}-${o.author}`,
    source,
    author: o.author,
    text: o.text,
    date: o.date,
    rating: ratingNum,
    sourceUrl: typeof o.sourceUrl === 'string' ? o.sourceUrl : undefined,
    authorUrl: typeof o.authorUrl === 'string' ? o.authorUrl : undefined,
    profilePhoto: typeof o.profilePhoto === 'string' ? o.profilePhoto : undefined,
  };
}

export default function HomeReviews() {
  const [showAll, setShowAll] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'fallback'>('loading');
  const sectionRef = useRef<HTMLDivElement>(null);

  const profileUrl = process.env.NEXT_PUBLIC_FIRMY_PROFILE_URL;
  const workerUrl = process.env.NEXT_PUBLIC_REVIEWS_API_URL;

  useEffect(() => {
    let cancelled = false;

    async function fetchLiveReviews() {
      const fallback = (staticReviews as unknown[])
        .map(normalizeReview)
        .filter((r): r is Review => r !== null);

      if (!workerUrl || workerUrl.includes('vás-účet')) {
        if (!cancelled) {
          setReviews(fallback);
          setStatus('fallback');
        }
        return;
      }

      try {
        const res = await fetch(workerUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data?.reviews) ? data.reviews : [];
        const mapped = list.map(normalizeReview).filter((r: Review | null): r is Review => r !== null);
        if (mapped.length === 0) throw new Error('No reviews in data');
        if (!cancelled) {
          setReviews(mapped);
          setStatus('live');
        }
      } catch {
        if (!cancelled) {
          setReviews(fallback);
          setStatus('fallback');
        }
      }
    }

    fetchLiveReviews();
    return () => {
      cancelled = true;
    };
  }, [workerUrl]);

  if (reviews.length === 0 && status !== 'loading') return null;

  const sortedReviews = [...reviews].sort((a, b) => b.date.localeCompare(a.date));
  const visibleReviews = showAll ? sortedReviews : sortedReviews.slice(0, 3);

  const handleToggle = () => {
    if (showAll) {
      setShowAll(false);
      sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowAll(true);
    }
  };

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 2) return dateStr;
    const months = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
    const monthIndex = parseInt(parts[1]) - 1;
    return `${months[monthIndex]} ${parts[0]}`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1 text-primary">
        {[...Array(5)].map((_, i) => {
          const fillAmount = Math.max(0, Math.min(1, rating - i));

          if (fillAmount >= 1) {
            return <Icons.Star key={i} className="w-4 h-4 fill-current" />;
          } else if (fillAmount > 0) {
            return (
              <div key={i} className="relative w-4 h-4">
                <Icons.Star className="absolute inset-0 w-4 h-4 text-white/10" />
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillAmount * 100}%` }}>
                  <Icons.Star className="w-4 h-4 fill-current" />
                </div>
              </div>
            );
          } else {
            return <Icons.Star key={i} className="w-4 h-4 text-white/10" />;
          }
        })}
      </div>
    );
  };

  return (
    <section id="reviews" ref={sectionRef} className="py-24 bg-neutral-dark text-white overflow-hidden relative scroll-mt-20">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36z4SVAeLSEBvBDmYECQJUA3IDIn4AOisSAn8qnN0AAAAASUVORK5CYII=')] bg-repeat" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight md:tracking-tighter italic mb-6 leading-none px-2">
              Hodnocení <br /><span className="text-primary">našich zákazníků</span>
            </h2>
            <p className="text-white/60 font-medium text-lg">
              Přečtěte si zkušenosti lidí, kterým jsme pomohli k suchému a zdravému domovu.
            </p>
          </div>
          {profileUrl && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:text-white transition-colors shrink-0 mb-2"
            >
              Všechny recenze na Mapy.com
              <Icons.ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {status === 'loading' ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl h-64 animate-pulse relative">
                <div className="w-24 h-4 bg-white/10 rounded-full mb-6" />
                <div className="space-y-3">
                  <div className="w-full h-3 bg-white/10 rounded-full" />
                  <div className="w-full h-3 bg-white/10 rounded-full" />
                  <div className="w-2/3 h-3 bg-white/10 rounded-full" />
                </div>
                <div className="absolute bottom-8 left-8 w-32 h-4 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {visibleReviews.map((review, index) => (
                  <m.div
                    key={review.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: showAll ? 0 : index * 0.1 }}
                    layout
                    className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 flex flex-col h-full relative group hover:bg-white/10 transition-all"
                  >
                    <Icons.Quote className="absolute top-6 right-8 w-10 h-10 text-primary/10 group-hover:text-primary/20 transition-colors" />

                    <div className="flex items-center justify-between mb-6">
                      {renderStars(review.rating)}
                      {review.sourceUrl ? (
                        <a
                          href={review.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors"
                          title={`Zdroj: ${SOURCE_LABEL[review.source]}`}
                        >
                          {SOURCE_LABEL[review.source]}
                        </a>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                          {SOURCE_LABEL[review.source]}
                        </span>
                      )}
                    </div>

                    <div className="mb-10 flex-grow">
                      <ExpandableText
                        text={`„${review.text}“`}
                        clampLines={8}
                        className="text-white/80 font-medium italic leading-relaxed"
                        buttonClassName="text-[11px] text-primary hover:text-white"
                      />
                    </div>

                    <div className="pt-6 border-t border-white/10 mt-auto">
                      <div className="font-black uppercase tracking-tight italic text-white">{review.author}</div>
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">
                        {formatDate(review.date)}
                      </div>
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>

            {reviews.length > 3 && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-16"
              >
                <button
                  onClick={handleToggle}
                  className="btn-outline py-4 px-10 text-lg uppercase tracking-widest flex items-center gap-3 mx-auto group border-white/10 text-white/60 hover:border-primary hover:text-primary transition-all"
                >
                  {showAll ? 'Zobrazit méně' : 'Zobrazit další hodnocení'}
                  {showAll ? (
                    <Icons.ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  ) : (
                    <Icons.ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                  )}
                </button>
              </m.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
