import Link from 'next/link';
import { Icons } from './Icons';
import ReferenceCard from './ReferenceCard';
import { allReferences } from '@/lib/references';

const HOMEPAGE_COUNT = 3;

export default function References() {
  const content = {
    h2: "Naše reference.",
    h3: "Desítky suchých domů",
    sub: "Podívejte se na detaily našich realizací. Od historických sklepů po moderní rodinné domy.",
    cta_more: "Zobrazit další reference",
  };

  // Na homepage jen nejnovější výběr – kompletní archiv (se stránkováním a
  // členěním po letech) žije na /reference. Dřív se sem renderovaly všechny
  // reference a přebytek se jen schovával přes CSS.
  const featured = allReferences.slice(0, HOMEPAGE_COUNT);

  return (
    <section id="reference" className="py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-neutral-dark mb-2 uppercase tracking-tighter italic">
            {content.h2}
          </h2>
          <h3 className="text-2xl md:text-3xl font-black text-primary-ink uppercase tracking-tight italic mb-6">
            {content.h3}
          </h3>
          <p className="text-lg text-neutral-dark/70 font-medium">
            {content.sub}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {featured.map((project) => (
            <ReferenceCard key={project.id} project={project} />
          ))}
        </div>

        {allReferences.length > HOMEPAGE_COUNT && (
          <div className="mt-16">
            <Link
              href="/reference"
              className="btn-outline py-4 px-10 text-lg uppercase tracking-widest inline-flex items-center gap-3 mx-auto group border-neutral-dark/10 text-neutral-dark/70 hover:border-primary hover:text-primary transition-all"
            >
              {content.cta_more}
              <span className="text-neutral-dark/40 group-hover:text-primary transition-colors">
                ({allReferences.length})
              </span>
              <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
