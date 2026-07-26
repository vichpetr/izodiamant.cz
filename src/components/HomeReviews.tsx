'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Icons } from './Icons';
import ExpandableText from './ExpandableText';

/** Logo zdroje recenze na bílém chipu – čitelné na tmavé kartě. */
function SourceLogo({ source }: { source: ReviewSource }) {
  const label = SOURCE_LABEL[source];
  return (
    <span
      className="inline-flex items-center justify-center bg-white rounded-md px-2 h-6 shrink-0"
      title={`Zdroj: ${label}`}
      aria-label={`Zdroj: ${label}`}
    >
      {source === 'google' ? (
        <svg viewBox="0 0 48 48" className="h-3.5 w-3.5" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
      ) : (
        <Image src="/images/mapy-com.jpeg" alt="Mapy.com" width={70} height={13} className="h-3 w-auto object-contain" />
      )}
    </span>
  );
}

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
  // 'empty' = worker nedostupný nebo bez recenzí → sekci schováme (žádný fallback).
  const [status, setStatus] = useState<'loading' | 'live' | 'empty'>('loading');
  const sectionRef = useRef<HTMLDivElement>(null);

  const profileUrl = process.env.NEXT_PUBLIC_FIRMY_PROFILE_URL;
  const workerUrl = process.env.NEXT_PUBLIC_REVIEWS_API_URL;
  // Profil na Google Mapách (přehled recenzí). Override přes env, fallback CID firmy.
  const googleUrl =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || 'https://www.google.com/maps?cid=11693549259963803968';

  useEffect(() => {
    let cancelled = false;

    async function fetchLiveReviews() {
      // Žádný statický fallback: bez živých recenzí z workeru se sekce nezobrazí.
      // Raději nic než neaktuální/nereálná záložní data.
      if (!workerUrl || workerUrl.includes('vás-účet')) {
        if (!cancelled) {
          setReviews([]);
          setStatus('empty');
        }
        return;
      }

      try {
        const res = await fetch(workerUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data?.reviews) ? data.reviews : [];
        const mapped = list.map(normalizeReview).filter((r: Review | null): r is Review => r !== null);
        if (!cancelled) {
          setReviews(mapped);
          setStatus(mapped.length > 0 ? 'live' : 'empty');
        }
      } catch {
        if (!cancelled) {
          setReviews([]);
          setStatus('empty');
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
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0 mb-2">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:text-white transition-colors"
            >
              Recenze na Google
              <Icons.ExternalLink className="w-4 h-4" />
            </a>
            {profileUrl && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:text-white transition-colors"
              >
                Recenze na Mapy.com
                <Icons.ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
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
                {visibleReviews.map((review, index) => (
                  <div
                    key={review.id}
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
                          className="hover:opacity-80 transition-opacity"
                        >
                          <SourceLogo source={review.source} />
                        </a>
                      ) : (
                        <SourceLogo source={review.source} />
                      )}
                    </div>

                    <div className="mb-10 flex-grow">
                      {/* Hvězdičkové recenze bez textu (časté u Google) by jinak
                          vykreslily prázdné uvozovky „“. Zobrazíme jen když text je. */}
                      {review.text.trim() && (
                        <ExpandableText
                          text={`„${review.text}“`}
                          clampLines={8}
                          className="text-white/80 font-medium italic leading-relaxed"
                          buttonClassName="text-[11px] text-primary hover:text-white"
                        />
                      )}
                    </div>

                    <div className="pt-6 border-t border-white/10 mt-auto">
                      <div className="font-black uppercase tracking-tight italic text-white">{review.author}</div>
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">
                        {formatDate(review.date)}
                      </div>
                    </div>
                  </div>
                ))}
              
            </div>

            {reviews.length > 3 && (
              <div
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
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
