'use client';

import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import Image from 'next/image';
import firmyFallback from '@/data/firmy.json';
import { GoogleG } from './GoogleBadge';

type Summary = { rating: number; count: number };

export default function HeroBadges() {
  const [firmyData, setFirmyData] = useState<Summary>(firmyFallback);
  const [googleData, setGoogleData] = useState<Summary | null>(null);
  const firmyUrl = process.env.NEXT_PUBLIC_FIRMY_PROFILE_URL || '#';
  const googleUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL;
  const workerUrl = process.env.NEXT_PUBLIC_REVIEWS_API_URL;

  useEffect(() => {
    if (!workerUrl || workerUrl.includes('vás-účet')) return;

    let cancelled = false;
    async function fetchLiveSummary() {
      try {
        const res = await fetch(workerUrl!);
        const json = await res.json();
        if (cancelled) return;

        const f = json?.sources?.firmy;
        if (f && typeof f.rating === 'number') {
          setFirmyData({ rating: f.rating, count: f.count });
        } else if (json.rating) {
          setFirmyData({ rating: json.rating, count: json.count });
        }

        const g = json?.sources?.google;
        if (g && typeof g.rating === 'number' && g.rating > 0 && g.count > 0) {
          setGoogleData({ rating: g.rating, count: g.count });
        }
      } catch {
        console.error('Chyba při načítání živých dat hodnocení');
      }
    }

    fetchLiveSummary();
    return () => {
      cancelled = true;
    };
  }, [workerUrl]);

  return (
    <div className="flex flex-col items-center justify-center mt-16 gap-4">
      <div className="flex items-center justify-center gap-6">
        {/* Mapy.com */}
        <m.a
          id="hero-badge"
          href={firmyUrl}
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
            <Image
              src="/images/mapy-com.jpeg"
              alt="Mapy.com"
              width={96}
              height={24}
              priority
              quality={60}
              className="object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
            />
          </div>
        </m.a>

        {/* Google – vykreslí se, jakmile worker vrátí Google hodnocení */}
        {googleData && googleUrl && (
          <m.a
            id="hero-badge-google"
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="group flex flex-col items-center justify-center w-32 h-32 rounded-full border border-neutral-dark/10 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500"
          >
            <span className="text-4xl font-black text-neutral-dark tracking-tighter mb-1 group-hover:scale-110 transition-transform duration-500">
              {googleData.rating.toFixed(1)}
            </span>
            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <GoogleG className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" />
              <span className="text-[11px] font-black uppercase tracking-widest text-neutral-dark/60">Google</span>
            </div>
          </m.a>
        )}
      </div>

      <m.a
        href={firmyUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-dark/40 italic hover:text-primary transition-colors group"
      >
        Ohodnoťte nás na <span className="text-neutral-dark/60 group-hover:text-primary">Mapy.com</span>
        <span className="ml-2 opacity-50">({firmyData.count} hodnocení)</span>
      </m.a>
    </div>
  );
}
