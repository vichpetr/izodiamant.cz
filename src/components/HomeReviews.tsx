'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  const profileUrl = process.env.NEXT_PUBLIC_FIRMY_PROFILE_URL;
  const workerUrl = process.env.NEXT_PUBLIC_REVIEWS_API_URL;

  if (!profileUrl) {
    throw new Error("Kritická chyba: NEXT_PUBLIC_FIRMY_PROFILE_URL není definována v .env");
  }

  if (!workerUrl) {
    throw new Error("Kritická chyba: NEXT_PUBLIC_REVIEWS_API_URL není definována v .env");
  }

  useEffect(() => {
    async function fetchLiveReviews() {
      try {
        const res = await fetch(workerUrl!);
        const data = await res.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error('Kritická chyba: Nelze načíst živá data recenzí a fallback je zakázán.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLiveReviews();
  }, [workerUrl]);

  if (isLoading) return null; // Or a loading skeleton
  if (reviews.length === 0) return null; // Don't show the section if no reviews could be loaded

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {visibleReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: showAll ? 0 : index * 0.1 }}
                layout
                className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 flex flex-col h-full relative group hover:bg-white/10 transition-all"
              >
                <Quote className="absolute top-6 right-8 w-10 h-10 text-primary/10 group-hover:text-primary/20 transition-colors" />
                
                <div className="flex items-center gap-1 text-primary mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-white/80 font-medium italic leading-relaxed mb-10 flex-grow">
                  "{review.text}"
                </p>

                <div className="pt-6 border-t border-white/10">
                  <div className="font-black uppercase tracking-tight italic text-white">{review.author}</div>
                  <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">{review.date}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {sortedReviews.length > 3 && (
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
      </div>
    </section>
  );
}
