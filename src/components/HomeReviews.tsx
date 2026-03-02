'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronDown, ChevronUp, ExternalLink, StarHalf } from 'lucide-react';
import staticReviews from '@/data/reviews.json';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export default function HomeReviews() {
  const [showAll, setShowAll] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'fallback'>('loading');
  const sectionRef = useRef<HTMLDivElement>(null);

  const profileUrl = process.env.NEXT_PUBLIC_FIRMY_PROFILE_URL;
  const workerUrl = process.env.NEXT_PUBLIC_REVIEWS_API_URL;

  if (!profileUrl) {
    throw new Error("Kritická chyba: NEXT_PUBLIC_FIRMY_PROFILE_URL není definována v .env");
  }

  useEffect(() => {
    async function fetchLiveReviews() {
      if (!workerUrl || workerUrl.includes('vás-účet')) {
        setReviews(staticReviews);
        setStatus('fallback');
        return;
      }

      try {
        const res = await fetch(workerUrl);
        const data = await res.json();
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          setStatus('live');
        } else {
          throw new Error('No reviews in data');
        }
      } catch (err) {
        console.warn('Nepodařilo se načíst živé recenze, používám statická data.');
        setReviews(staticReviews);
        setStatus('fallback');
      }
    }

    fetchLiveReviews();
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
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 fill-current" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-4 h-4 fill-current" />);
    }
    return stars;
  };

  return (
    <section id="reviews" ref={sectionRef} className="py-24 bg-neutral-dark text-white overflow-hidden relative scroll-mt-20">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic mb-6 leading-none">
              Hodnocení <br /><span className="text-primary">našich zákazníků</span>
            </h2>
            <p className="text-white/60 font-medium text-lg">
              Přečtěte si zkušenosti lidí, kterým jsme pomohli k suchému a zdravému domovu.
            </p>
          </div>
          <a 
            href={profileUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:text-white transition-colors shrink-0 mb-2"
          >
            Všechny recenze na Seznamu
            <ExternalLink className="w-4 h-4" />
          </a>
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
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: showAll ? 0 : index * 0.1 }}
                    layout
                    className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 flex flex-col h-full relative group hover:bg-white/10 transition-all"
                  >
                    <Quote className="absolute top-6 right-8 w-10 h-10 text-primary/10 group-hover:text-primary/20 transition-colors" />
                    
                    <div className="flex items-center gap-1 text-primary mb-6">
                      {renderStars(review.rating)}
                    </div>

                    <p className="text-white/80 font-medium italic leading-relaxed mb-10 flex-grow">
                      "{review.text}"
                    </p>

                    <div className="pt-6 border-t border-white/10 mt-auto">
                      <div className="font-black uppercase tracking-tight italic text-white">{review.author}</div>
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">
                        {formatDate(review.date)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {reviews.length > 3 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-16"
              >
                <button
                  onClick={handleToggle}
                  className="btn-outline py-4 px-10 text-lg uppercase tracking-widest flex items-center gap-3 mx-auto group border-white/10 text-white/60 hover:border-primary hover:text-primary transition-all"
                >
                  {showAll ? "Zobrazit méně" : "Zobrazit další hodnocení"}
                  {showAll ? (
                    <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  ) : (
                    <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                  )}
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
