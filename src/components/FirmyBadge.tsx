'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icons } from './Icons';

export default function FirmyBadge() {
  const [data, setData] = useState<{ rating: number, count: number } | null>(null);
  const profileUrl = process.env.NEXT_PUBLIC_FIRMY_PROFILE_URL;
  const workerUrl = process.env.NEXT_PUBLIC_REVIEWS_API_URL;

  if (!profileUrl) {
    throw new Error("Kritická chyba: NEXT_PUBLIC_FIRMY_PROFILE_URL není definována v .env");
  }

  useEffect(() => {
    if (!workerUrl || workerUrl.includes('vás-účet')) return;

    async function fetchLiveSummary() {
      try {
        const res = await fetch(workerUrl!); // Using non-null assertion since we check it above
        if (!res.ok) return;
        
        const json = await res.json();
        if (json.rating) {
          setData({ rating: json.rating, count: json.count });
        }
      } catch (err) {
        console.warn('Chyba při načítání živých dat hodnocení');
      }
    }

    fetchLiveSummary();
  }, [workerUrl]);

  // If no live data yet, show default based on known good state, but only if we have the profile URL
  const rating = data?.rating || 5.0;
  const count = data?.count || 12;

  return (
    <a 
      href={profileUrl} 
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-dark/5 hover:border-primary transition-all group"
    >
      <div className="relative w-10 h-10 shrink-0">
        <Image 
          src="/images/mapy-com.jpeg"
          alt="Mapy.cz" 
          fill
          sizes="40px"
          className="object-contain"
        />
      </div>
      <div>
        <div className="flex items-center gap-1 text-primary mb-0.5">
          {[...Array(5)].map((_, i) => (
            <Icons.Star 
              key={i} 
              className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-current' : 'text-neutral-200'}`} 
            />
          ))}
          <span className="ml-1 text-neutral-dark font-black text-sm italic">{rating.toFixed(1)}</span>
        </div>
        <div className="text-[10px] font-black text-neutral-dark/40 uppercase tracking-widest group-hover:text-neutral-dark transition-colors">
          {count} hodnocení na Firmy.cz
        </div>
      </div>
    </a>
  );
}
