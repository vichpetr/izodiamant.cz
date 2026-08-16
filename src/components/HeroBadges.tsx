'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useReviewSummary } from '@/lib/useReviewSummary';
import { allReferences } from '@/lib/references';

export default function HeroBadges() {
  const summary = useReviewSummary();
  const referenceCount = allReferences.length;

  // Přímé odkazy na NAPSÁNÍ recenze (stejné jako v patičce) – „Ohodnoťte nás“
  // k tomu vybízí. Kolečka výše vedou na profil (zobrazení), tyto na hodnocení.
  const googleReviewUrl =
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || 'https://g.page/r/CUCprMsY1UeiEBM/review';
  const firmyReviewUrl =
    process.env.NEXT_PUBLIC_FIRMY_REVIEW_URL ||
    'https://www.firmy.cz/detail/13505805-izodiamant-nove-hrady.html#hodnoceni';

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
    <div className="flex flex-col items-center justify-center mt-8 sm:mt-10 desktop:mt-16 gap-4 sm:gap-5">
      {/* Všude mimo velké a vysoké okno kompaktní pruh: kolečka 128 px níže by
          na nižším displeji (tablet na šířku, 13" notebook) spadla pod ohyb,
          takže by hodnocení ani počet referencí nikdo neviděl. */}
      <div className="desktop:hidden w-full max-w-sm sm:max-w-md flex divide-x divide-neutral-dark/10 rounded-2xl border border-neutral-dark/10 bg-white/60 backdrop-blur-sm shadow-sm">
        {badges.map((b) => (
          <a
            key={b.key}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${b.rating.toFixed(1)} z 5 – ${b.count} hodnocení na ${b.label}`}
            className="flex-1 flex flex-col items-center justify-center py-3 sm:py-4 px-1"
          >
            <span className="text-xl sm:text-2xl font-black text-neutral-dark tracking-tighter leading-none">
              {b.rating.toFixed(1)}
            </span>
            <span className="mt-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-neutral-dark/50">
              {b.label}
            </span>
          </a>
        ))}
        {/* Na sekci s referencemi, ne rovnou do archivu – ten je až za odkazem
            uvnitř sekce (nejdřív ukázka, pak kompletní výpis). */}
        <Link
          href="/#reference"
          title={`${referenceCount} zveřejněných referencí`}
          className="flex-1 flex flex-col items-center justify-center py-3 sm:py-4 px-1"
        >
          <span className="text-xl sm:text-2xl font-black text-neutral-dark tracking-tighter leading-none">
            {referenceCount}
          </span>
          <span className="mt-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-neutral-dark/50">
            Referencí
          </span>
        </Link>
      </div>

      <div className="hidden desktop:flex items-center justify-center gap-6">
        {badges.map((b) => (
          <a
            key={b.key}
            id={b.key === 'firmy' ? 'hero-badge' : undefined}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
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
                loading="lazy"
                quality={60}
                className="object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
              />
            ) : (
              // Lockup „G + Google“ – 4-barevné „G“ (inline SVG) + text. Ve výchozím
              // stavu grayscale, na hover barevně – stejný efekt jako logo Mapy.com vedle.
              <span
                className="inline-flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
                title="Google"
              >
                <svg viewBox="0 0 48 48" width={18} height={18} aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span className="text-base font-medium text-neutral-dark/80 tracking-tight">Google</span>
              </span>
            )}
          </a>
        ))}

        {/* Třetí kolečko: počet zveřejněných referencí – vedle hodnocení je to
            druhý důkaz „máme co ukázat“. Vede na sekci s ukázkou, kompletní
            archiv je až za odkazem uvnitř té sekce. */}
        <Link
          href="/#reference"
          title={`${referenceCount} zveřejněných referencí`}
          className="group flex flex-col items-center justify-center w-32 h-32 rounded-full border border-neutral-dark/10 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500"
        >
          <span className="text-4xl font-black text-neutral-dark tracking-tighter mb-1 group-hover:scale-110 transition-transform duration-500">
            {referenceCount}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-dark/50 group-hover:text-primary-ink transition-colors">
            Referencí
          </span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-[0.2em] italic">
        <span className="text-neutral-dark/40">Ohodnoťte nás</span>
        <a
          href={googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-dark/60 hover:text-primary transition-colors"
        >
          Google
        </a>
        <span className="text-neutral-dark/20" aria-hidden="true">·</span>
        <a
          href={firmyReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-dark/60 hover:text-primary transition-colors"
        >
          Mapy.com
        </a>
        <span className="text-neutral-dark/30">
          ({badges.reduce((sum, b) => sum + b.count, 0)} hodnocení)
        </span>
      </div>
    </div>
  );
}
