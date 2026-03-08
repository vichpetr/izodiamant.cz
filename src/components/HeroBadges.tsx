'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import firmyFallback from '@/data/firmy.json';

export default function HeroBadges() {
  const [firmyData, setFirmyData] = useState<{ rating: number, count: number }>(firmyFallback);
  const profileUrl = process.env.NEXT_PUBLIC_FIRMY_PROFILE_URL || '#';
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
    <div className="flex flex-col items-center justify-center mt-16 gap-4">
      <motion.a
        id="hero-badge"
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="group flex flex-col items-center justify-center w-32 h-32 rounded-full border border-neutral-dark/10 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500"
      >
        <span className="text-4xl font-black text-neutral-dark tracking-tighter mb-1 group-hover:scale-110 transition-transform duration-500">
          {firmyData.rating.toFixed(1)}
        </span>
        <div className="flex flex-col items-center">
          <div className="relative">
            <Image 
              src="/images/mapy-com.png" 
              alt="Mapy.com" 
              width={96}
              height={24}
              priority
              className="object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
            />
          </div>
        </div>
      </motion.a>
      
      <motion.a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-dark/40 italic hover:text-primary transition-colors group"
      >
        Ohodnoťte nás na <span className="text-neutral-dark/60 group-hover:text-primary">Mapy.com</span>
        <span className="ml-2 opacity-50">({firmyData.count} hodnocení)</span>
      </motion.a>
    </div>
  );
}
