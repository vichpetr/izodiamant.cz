import Link from 'next/link';
import { Icons } from './Icons';
import ReferenceCard from './ReferenceCard';
import { cn } from '@/lib/utils';
import { breadcrumbSchema, SITE_URL } from '@/lib/seo';
import {
  allReferences,
  groupByYear,
  pageOfYear,
  REFERENCES_PER_PAGE,
  referencePageCount,
  referencePagePath,
  referenceYears,
  referencesForPage,
} from '@/lib/references';

/** 1 realizace / 2–4 realizace / 5+ realizací */
const realizace = (n: number) => (n < 5 ? 'realizace' : 'realizací');

/**
 * Archiv referencí – jedna stránka výpisu, členěná po letech.
 * Používají ho /reference (strana 1) i /reference/strana/[cislo], takže obě
 * URL mají stejný layout a liší se jen výřezem dat.
 */
export default function ReferenceArchive({ page }: { page: number }) {
  const items = referencesForPage(page);
  const groups = groupByYear(items);
  const yearsOnPage = new Set(groups.map((g) => g.year));

  const breadcrumb = breadcrumbSchema([
    { name: 'Domů', path: '/' },
    { name: 'Reference', path: '/reference' },
    ...(page > 1 ? [{ name: `Strana ${page}`, path: referencePagePath(page) }] : []),
  ]);

  // ItemList = strojově čitelný výpis realizací na této straně. Žádné hodnocení
  // ani Review (self-serving markup je zakázaný – viz skill site-invariants).
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Reference sanace zdiva – IZODIAMANT',
    numberOfItems: allReferences.length,
    itemListElement: items.map((project, i) => ({
      '@type': 'ListItem',
      position: (page - 1) * REFERENCES_PER_PAGE + i + 1,
      url: `${SITE_URL}/reference/${project.id}`,
      name: project.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <section className="pt-32 pb-12 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/#reference"
            className="inline-flex items-center gap-2 text-neutral-dark/70 hover:text-primary font-bold uppercase tracking-widest text-xs mb-10 transition-colors group"
          >
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Zpět na úvodní stránku
          </Link>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.95] mb-4">
              Reference sanace zdiva.
            </h1>
            <p className="text-lg text-neutral-dark/70 font-medium leading-relaxed mb-8">
              Přehled našich realizací – podřezání diamantovým lanem, řetězovou pilou i chemická
              injektáž. U každé zakázky najdete technologii, rozsah prací a fotografie z průběhu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-dark/40">
              Celkem {allReferences.length} {realizace(allReferences.length)}
            </span>
            <span className="text-neutral-dark/20" aria-hidden="true">·</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-dark/40">
              Přejít na rok
            </span>
            {referenceYears.map((year) => (
              <Link
                key={year}
                href={`${referencePagePath(pageOfYear(year))}#rok-${year}`}
                className={cn(
                  'px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all',
                  yearsOnPage.has(year)
                    ? 'bg-primary/15 border-primary/30 text-primary-ink'
                    : 'bg-white border-neutral-dark/10 text-neutral-dark/60 hover:border-primary/40 hover:text-primary-ink',
                )}
              >
                {year}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {groups.map((group) => (
            <div key={group.year} className="pt-16 first:pt-8">
              <h2
                id={`rok-${group.year}`}
                className="scroll-mt-32 text-3xl md:text-4xl font-black text-neutral-dark uppercase tracking-tighter italic mb-8 flex items-baseline gap-4"
              >
                {group.year}
                <span className="text-xs font-black text-neutral-dark/40 tracking-[0.2em] not-italic">
                  {group.items.length} {realizace(group.items.length)}
                </span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {group.items.map((project) => (
                  <ReferenceCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          ))}

          {referencePageCount > 1 && (
            <nav
              aria-label="Stránkování referencí"
              className="mt-20 flex flex-wrap items-center justify-center gap-3"
            >
              {page > 1 && (
                <Link
                  href={referencePagePath(page - 1)}
                  rel="prev"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-neutral-dark/10 text-xs font-black uppercase tracking-widest text-neutral-dark/70 hover:border-primary/40 hover:text-primary-ink transition-all"
                >
                  <Icons.ArrowLeft className="w-4 h-4" />
                  Předchozí
                </Link>
              )}

              {Array.from({ length: referencePageCount }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={referencePagePath(n)}
                  aria-current={n === page ? 'page' : undefined}
                  className={cn(
                    'w-12 h-12 inline-flex items-center justify-center rounded-xl border text-sm font-black transition-all',
                    n === page
                      ? 'bg-primary border-primary text-neutral-dark shadow-lg shadow-primary/20'
                      : 'bg-white border-neutral-dark/10 text-neutral-dark/70 hover:border-primary/40 hover:text-primary-ink',
                  )}
                >
                  {n}
                </Link>
              ))}

              {page < referencePageCount && (
                <Link
                  href={referencePagePath(page + 1)}
                  rel="next"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-neutral-dark/10 text-xs font-black uppercase tracking-widest text-neutral-dark/70 hover:border-primary/40 hover:text-primary-ink transition-all"
                >
                  Další
                  <Icons.ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </nav>
          )}

          <div className="mt-20 bg-neutral-dark rounded-3xl p-10 md:p-14 text-white text-center">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight mb-4">
              Máte podobný projekt?
            </h2>
            <p className="text-white/60 font-medium max-w-2xl mx-auto mb-8">
              Prohlídka objektu a nezávazná cenová nabídka jsou zdarma. Spočítejte si orientační
              cenu podřezání, nebo nám rovnou zavolejte.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#calculator"
                className="w-full sm:w-auto btn-primary py-4 px-10 uppercase tracking-widest inline-flex items-center justify-center gap-3"
              >
                Nezávazná kalkulace
                <Icons.Calculator className="w-5 h-5" />
              </Link>
              <a
                href="tel:+420737017012"
                className="w-full sm:w-auto btn-outline py-4 px-10 uppercase tracking-widest inline-flex items-center justify-center gap-3 border-white/20 text-white hover:bg-white hover:text-neutral-dark"
              >
                <Icons.Phone className="w-5 h-5 text-primary" />
                +420 737 017 012
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
