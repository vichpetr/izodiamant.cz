'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HeroBadges() {
  const [firmyData, setFirmyData] = useState<{ rating: number, count: number }>({ rating: 5.0, count: 12 });
  const workerUrl = process.env.NEXT_PUBLIC_REVIEWS_API_URL;

  useEffect(() => {
    if (!workerUrl || workerUrl.includes('vás-účet')) return;

    async function fetchLiveSummary() {
      try {
        const res = await fetch(workerUrl!);
        const json = await res.json();
        if (json.rating) {
          setFirmyData({ rating: json.rating, count: json.count });
        }
      } catch (err) {
        console.error('Chyba při načítání živých dat hodnocení');
      }
    }

    fetchLiveSummary();
  }, [workerUrl]);

  return (
    <div className="flex items-center justify-center mt-16">
      <motion.a
        href={process.env.NEXT_PUBLIC_FIRMY_PROFILE_URL || '#'}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="group flex flex-col items-center justify-center w-32 h-32 rounded-full border border-neutral-dark/10 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500"
      >
        <span className="text-4xl font-black text-neutral-dark tracking-tighter mb-1 group-hover:scale-110 transition-transform duration-500">
          {firmyData.rating.toFixed(1).replace('.', ',')}
        </span>
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-4 mb-1">
            <Image 
              src="https://mapy.cz/firm-badge.svg" 
              alt="Firmy.cz" 
              fill
              className="object-contain grayscale group-hover:grayscale-0 transition-all"
            />
          </div>
          <span className="text-[9px] font-bold text-neutral-dark/40 uppercase tracking-tight group-hover:text-neutral-dark transition-colors">
            {firmyData.count} hodnocení
          </span>
        </div>
      </motion.a>
    </div>
  );
}
