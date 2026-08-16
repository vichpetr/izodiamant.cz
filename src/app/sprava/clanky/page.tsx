import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { safeAuth, isAllowed } from '@/auth';
import { allArticles, isArticlePublished, formatArticleDate } from '@/lib/articles';
import SpravaNav from '../SpravaNav';
import ArticlesAdminList, { type AdminArticle } from '../ArticlesAdminList';

export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Náhled článků',
  robots: { index: false, follow: false },
};

export default async function SpravaClankyPage() {
  const session = await safeAuth();
  if (!session?.user || !isAllowed(session.user.email)) redirect('/sprava/prihlaseni');

  // Řazení pro admin přehled: nejdřív naplánované, pak zveřejněné; uvnitř každé
  // skupiny podle data publikace vzestupně (nejbližší termín nahoře). Až se
  // článek zveřejní, propadne do skupiny zveřejněných a v čele naplánovaných
  // zůstane další v pořadí.
  const articles: AdminArticle[] = [...allArticles]
    .sort((a, b) => {
      const pa = isArticlePublished(a) ? 1 : 0;
      const pb = isArticlePublished(b) ? 1 : 0;
      if (pa !== pb) return pa - pb;
      return a.date.localeCompare(b.date);
    })
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      fbPost: a.fbPost,
      published: isArticlePublished(a),
      formattedDate: formatArticleDate(a.date),
    }));

  return (
    <main className="min-h-screen bg-neutral-light">
      <SpravaNav active="/sprava/clanky" email={session.user.email} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-black uppercase italic text-neutral-dark tracking-tight">Články</h1>
          <p className="text-sm text-neutral-dark/60 mt-2 max-w-2xl">
            Náhled všech článků – zveřejněných i naplánovaných. Odkaz na náhled funguje i před zveřejněním
            (naplánované články jsou pro vyhledávače skryté <code className="text-xs">noindex</code> a nejsou v sitemapě).
            U každého článku je připravený text pro Facebook ke zkopírování.
          </p>
        </div>

        <ArticlesAdminList articles={articles} />
      </div>
    </main>
  );
}
