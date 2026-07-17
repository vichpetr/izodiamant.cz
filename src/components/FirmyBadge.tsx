'use client';

import Image from 'next/image';
import { Icons } from './Icons';
import { useReviewSummary } from '@/lib/useReviewSummary';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-primary mb-0.5">
      {[...Array(5)].map((_, i) => (
        <Icons.Star
          key={i}
          className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-current' : 'text-neutral-200'}`}
        />
      ))}
      <span className="ml-1 text-neutral-dark font-black text-sm italic">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function FirmyBadge() {
  const summary = useReviewSummary();

  return (
    <div className="flex flex-col gap-3">
      <a
        href={summary.firmy.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-dark/5 hover:border-primary transition-all group"
      >
        <div className="relative w-10 h-10 shrink-0">
          <Image src="/images/mapy-com.jpeg" alt="Mapy.com" fill sizes="40px" className="object-contain" />
        </div>
        <div>
          <Stars rating={summary.firmy.rating} />
          <div className="text-[10px] font-black text-neutral-dark/60 uppercase tracking-widest group-hover:text-neutral-dark transition-colors">
            {summary.firmy.count} hodnocení na Mapy.com
          </div>
        </div>
      </a>

      {summary.google && (
        <a
          href={summary.google.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-dark/5 hover:border-primary transition-all group"
        >
          <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-neutral-light font-black text-neutral-dark">
            G
          </div>
          <div>
            <Stars rating={summary.google.rating} />
            <div className="text-[10px] font-black text-neutral-dark/60 uppercase tracking-widest group-hover:text-neutral-dark transition-colors">
              {summary.google.count} hodnocení na Google
            </div>
          </div>
        </a>
      )}
    </div>
  );
}
