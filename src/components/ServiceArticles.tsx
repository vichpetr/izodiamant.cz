import Link from 'next/link';
import { Icons } from './Icons';
import { allArticles, publishedArticles, isArticlePublished, type Article } from '@/lib/articles';

/**
 * Články k dané službě. Prolinkování chybělo jen jedním směrem – články na
 * služby odkazují, opačně nic, takže stránky služeb nepředávaly váhu rádci
 * a návštěvník neměl kam pokračovat.
 *
 * `slugs` je ruční výběr tematicky navázaných článků. Nezveřejněné (naplánované
 * na budoucí datum) se vyfiltrují, takže sekce roste, jak backlog vychází;
 * do plného počtu se doplní nejnovějšími články, ať sekce není poloprázdná.
 * Když není zveřejněný vůbec žádný článek, nevykreslí se nic.
 */
export default function ServiceArticles({
  slugs,
  limit = 3,
  title = 'K tématu čtěte',
}: {
  slugs: string[];
  limit?: number;
  title?: string;
}) {
  const curated = slugs
    .map((slug) => allArticles.find((a) => a.slug === slug))
    .filter((a): a is Article => !!a && isArticlePublished(a));

  const filler = publishedArticles.filter((a) => !curated.some((c) => c.slug === a.slug));
  const articles = [...curated, ...filler].slice(0, limit);

  if (articles.length === 0) return null;

  return (
    <section className="py-20 bg-neutral-light border-t border-neutral-dark/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-black uppercase italic text-neutral-dark mb-8 text-center">
          {title}
        </h2>
        <div className="grid gap-4">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/clanky/${article.slug}`}
              className="group flex items-start justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-dark/5 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all"
            >
              <div>
                <span className="block font-black uppercase italic text-neutral-dark group-hover:text-primary transition-colors mb-1">
                  {article.title}
                </span>
                <span className="block text-sm text-neutral-dark/70 font-medium leading-relaxed">
                  {article.excerpt}
                </span>
              </div>
              <Icons.ArrowRight className="w-5 h-5 text-primary shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/clanky"
            className="inline-flex items-center gap-2 text-primary-ink font-black uppercase tracking-widest text-xs hover:text-neutral-dark transition-colors group"
          >
            Všechny články
            <Icons.ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
