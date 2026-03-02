'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

export default function FirmyBadge() {
  return (
    <Link 
      href="https://www.firmy.cz/detail/12911303-izodiamant-nove-hrady-mokra-lhota.html" 
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-dark/5 hover:border-primary transition-all group"
    >
      <div className="relative w-10 h-10 shrink-0">
        <Image 
          src="https://mapy.cz/firm-badge.svg" 
          alt="Mapy.cz" 
          fill
          className="object-contain"
        />
      </div>
      <div>
        <div className="flex items-center gap-1 text-primary mb-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-current" />
          ))}
          <span className="ml-1 text-neutral-dark font-black text-sm italic">5.0</span>
        </div>
        <div className="text-[10px] font-black text-neutral-dark/40 uppercase tracking-widest group-hover:text-neutral-dark transition-colors">
          Hodnocení na Firmy.cz
        </div>
      </div>
    </Link>
  );
}
