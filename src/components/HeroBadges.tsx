'use client';

import { m } from 'framer-motion';
import Image from 'next/image';
import { useReviewSummary } from '@/lib/useReviewSummary';

export default function HeroBadges() {
  const summary = useReviewSummary();

  const badges = [
    summary.firmy.count > 0 && {
      key: 'firmy',
      label: 'Mapy.com',
      rating: summary.firmy.rating,
      count: summary.firmy.count,
      url: summary.firmy.url,
    },
    summary.google && {
      key: 'google',
      label: 'Google',
      rating: summary.google.rating,
      count: summary.google.count,
      url: summary.google.url,
    },
  ].filter(Boolean) as { key: string; label: string; rating: number; count: number; url: string }[];

  return (
    <div className="flex flex-col items-center justify-center mt-16 gap-5">
      <div className="flex items-center justify-center gap-6">
        {badges.map((b, i) => (
          <m.a
            key={b.key}
            id={b.key === 'firmy' ? 'hero-badge' : undefined}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.15 }}
            title={`${b.rating.toFixed(1)} z 5 – ${b.count} hodnocení na ${b.label}`}
            className="group flex flex-col items-center justify-center w-32 h-32 rounded-full border border-neutral-dark/10 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500"
          >
            <span className="text-4xl font-black text-neutral-dark tracking-tighter mb-1 group-hover:scale-110 transition-transform duration-500">
              {b.rating.toFixed(1)}
            </span>
            {b.key === 'firmy' ? (
              <Image
                src="/images/mapy-com.jpeg"
                alt="Mapy.com"
                width={96}
                height={24}
                priority
                quality={60}
                className="object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
              />
            ) : (
              <span className="text-sm font-black uppercase tracking-widest text-neutral-dark/70 group-hover:text-primary transition-colors">
                Google
              </span>
            )}
          </m.a>
        ))}
      </div>

      <m.a
        href={badges[0]?.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-dark/40 italic hover:text-primary transition-colors group"
      >
        Ohodnoťte nás
        <span className="ml-2 opacity-50">
          ({badges.reduce((sum, b) => sum + b.count, 0)} hodnocení)
        </span>
      </m.a>
    </div>
  );
}
