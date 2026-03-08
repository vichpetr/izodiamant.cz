'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Star } from 'lucide-react';
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

  const badges = [
    {
      id: 'google',
      value: '4.9',
      label: (
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-dark/40 group-hover:text-neutral-dark transition-colors">Google</span>
          <div className="flex gap-0.5 mt-0.5">
             {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-2 h-2 fill-primary text-primary" />
            ))}
          </div>
        </div>
      ),
      link: '#'
    },
    {
      id: 'firmy',
      value: firmyData.rating.toFixed(1).replace('.', ','),
      label: (
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-3 mb-0.5">
            <Image 
              src="https://mapy.cz/firm-badge.svg" 
              alt="Firmy.cz" 
              fill
              className="object-contain grayscale group-hover:grayscale-0 transition-all"
            />
          </div>
          <span className="text-[8px] font-bold text-neutral-dark/40 uppercase tracking-tight">{firmyData.count} hodnocení</span>
        </div>
      ),
      link: process.env.NEXT_PUBLIC_FIRMY_PROFILE_URL || '#'
    },
    {
      id: 'realizations',
      value: '350+',
      label: (
        <div className="flex flex-col items-center">
          <CheckCircle2 className="w-4 h-4 text-primary mb-0.5" />
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-dark/40 group-hover:text-neutral-dark transition-colors text-center leading-tight">realizací</span>
        </div>
      ),
      link: '/#reference'
    }
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mt-16">
      {badges.map((badge, index) => (
        <motion.a
          key={badge.id}
          href={badge.link}
          target={badge.link.startsWith('http') ? "_blank" : undefined}
          rel={badge.link.startsWith('http') ? "noopener noreferrer" : undefined}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className="group flex flex-col items-center justify-center w-28 h-28 rounded-full border border-neutral-dark/10 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500"
        >
          <span className="text-3xl font-black text-neutral-dark tracking-tighter mb-1 group-hover:scale-110 transition-transform duration-500">
            {badge.value}
          </span>
          {badge.label}
        </motion.a>
      ))}
    </div>
  );
}
