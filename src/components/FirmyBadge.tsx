'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

export default function FirmyBadge() {
  const [data, setData] = useState({ rating: 5.0, count: 12 }); // Fallback data

  useEffect(() => {
    // Replace with your actual Cloudflare Worker URL later
    // fetch('https://api.izodiamant.cz/reviews')
    //   .then(res => res.json())
    //   .then(json => setData({ rating: json.rating, count: json.reviewCount }))
    //   .catch(() => {});
  }, []);

  return (
    <a 
      href="https://www.firmy.cz/detail/13505805-izodiamant-nove-hrady-mokra-lhota.html" 
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
            <Star 
              key={i} 
              className={`w-3 h-3 ${i < Math.floor(data.rating) ? 'fill-current' : 'text-neutral-200'}`} 
            />
          ))}
          <span className="ml-1 text-neutral-dark font-black text-sm italic">{data.rating.toFixed(1)}</span>
        </div>
        <div className="text-[10px] font-black text-neutral-dark/40 uppercase tracking-widest group-hover:text-neutral-dark transition-colors">
          {data.count} hodnocení na Firmy.cz
        </div>
      </div>
    </a>
  );
}
