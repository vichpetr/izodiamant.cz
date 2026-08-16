import Link from 'next/link';
import { Icons } from './Icons';
import HeroBadges from './HeroBadges';

export default function Hero() {
  const content = {
    h1: "Sanace a podřezávání zdiva. Váš dům si zaslouží suché základy.",
    desc: "Vás i váš dům trvale zbavíme vzlínající vlhkosti a plísní. Odborně podřezáváme a izolujeme vlhké zdivo pro suché základy a zdravé bydlení po celé ČR. Vracíme zdraví vaší stavbě.",
    cta_calc: "Nezávazná kalkulace zdarma",
  };

  // Hero je stavěný tak, aby se hodnocení i počet referencí vešly nad ohyb i na
  // tabletu na šířku nebo na 13" notebooku (~700 px výšky). Plná desktopová
  // podoba (nadpis 8xl, větší odsazení, kolečka v HeroBadges) proto nabíhá až
  // ve variantě `desktop:` = široké A vysoké okno, viz tailwind.config.ts.
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-10 sm:pt-28 sm:pb-8 desktop:pt-32 desktop:pb-0 overflow-hidden bg-neutral-light">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-light z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="w-full h-full opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px), radial-gradient(#000 0.5px, #f8f9fa 0.5px)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl desktop:text-8xl font-black text-neutral-dark tracking-tight sm:tracking-tighter mb-5 sm:mb-6 desktop:mb-8 text-balance uppercase italic leading-[1.1] sm:leading-[0.95] px-4">
            {content.h1.split('. ')[0]}. <br className="hidden sm:block" />
            <span className="text-primary-ink">{content.h1.split('. ')[1]}</span>
          </h1>
          
          {/* Bez vstupní framer-motion animace: tento blok obsahuje LCP prvek (popisek).
              Gating přes opacity:0 do hydratace posouval LCP na mobilu na ~10 s. */}
          <div>
            <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-neutral-dark/70 mb-7 sm:mb-8 desktop:mb-12 text-balance font-medium leading-relaxed">
              {content.desc}
            </p>

            {/* Jediné CTA. Odkaz „Naše reference“ tu byl zbytečně dvakrát – hned
                pod ním na reference vede i kolečko s jejich počtem. */}
            <div className="flex justify-center">
              <Link
                href="/#calculator"
                className="w-full sm:w-auto btn-primary py-3.5 sm:py-4 px-6 sm:px-10 text-base sm:text-lg uppercase tracking-widest shadow-xl shadow-primary/20 inline-flex items-center justify-center gap-3 group"
              >
                {content.cta_calc}
                <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <HeroBadges />
        </div>
      </div>
    </section>
  );
}
