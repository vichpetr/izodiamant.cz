import Link from 'next/link';
import Image from 'next/image';
import { Icons } from './Icons';
import { formatArticleDate, type Article } from '@/lib/articles';

/**
 * Dlaždice článku. Sdílí ji výběr na homepage (#clanky) i archiv (/clanky),
 * aby se obě mřížky nemohly rozejít vzhledem – stejný vzor jako ReferenceCard.
 */
export default function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="group">
      <Link
        href={`/clanky/${article.slug}`}
        className="block relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-dark text-foreground"
      >
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark via-transparent to-transparent opacity-80" />

        <div className="absolute top-6 left-6">
          <div className="bg-primary/90 backdrop-blur-md text-neutral-dark px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 w-fit shadow-lg">
            <Icons.Calendar className="w-3 h-3" />
            {formatArticleDate(article.date)}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-4">
            <Icons.FileText className="w-3 h-3" />
            Rádce
          </div>
          <div className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-3 group-hover:text-primary transition-colors">
            {article.title}
          </div>
          <p className="text-white/60 text-sm font-medium leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        </div>

        <div className="absolute top-8 right-8 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-neutral-dark transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-xl">
          <Icons.ArrowUpRight className="w-6 h-6" />
        </div>
      </Link>
    </div>
  );
}
