'use client';

import { motion } from 'framer-motion';
import { Star, Quote, ChevronRight } from 'lucide-react';
import reviewsData from '@/data/reviews.json';
import Link from 'next/link';

export default function HomeReviews() {
  // Show only top 3 reviews on homepage
  const topReviews = reviewsData.slice(0, 3);

  return (
    <section className="py-24 bg-neutral-dark text-white overflow-hidden relative">
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
          <Link 
            href="/hodnoceni" 
            className="group inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:text-white transition-colors shrink-0 mb-2"
          >
            Zobrazit všechna hodnocení
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {topReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
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
        </div>
      </div>
    </section>
  );
}
