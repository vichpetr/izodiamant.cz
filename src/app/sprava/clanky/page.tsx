import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { safeAuth, isAllowed } from '@/auth';
import { allArticles, isArticlePublished, formatArticleDate } from '@/lib/articles';
import referencesData from '@/data/references.json';
import SpravaNav from '../SpravaNav';
import { type AdminArticle } from '../ArticlesAdminList';
import { type AdminReference } from '../ReferencesAdminList';
import SpravaContentTabs from '../SpravaContentTabs';

export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Obsah pro FB',
  robots: { index: false, follow: false },
};

export default async function SpravaClankyPage() {
  const session = await safeAuth();
  if (!session?.user || !isAllowed(session.user.email)) redirect('/sprava/prihlaseni');

  // Řazení článků: nejdřív naplánované, pak zveřejněné; uvnitř každé skupiny podle
  // data publikace vzestupně (nejbližší termín nahoře). Až se článek zveřejní,
  // propadne do zveřejněných a v čele naplánovaných zůstane další v pořadí.
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

  // Reference chronologicky (od nejstarší) – ve stejném pořadí je posílá i auto-poster.
  const references: AdminReference[] = (referencesData as AdminReference[])
    .map((r) => ({
      id: r.id,
      title: r.title,
      location: r.location,
      date: r.date,
      technology: r.technology,
      fbPost: r.fbPost,
    }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  return (
    <main className="min-h-screen bg-neutral-light">
      <SpravaNav active="/sprava/clanky" email={session.user.email} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-black uppercase italic text-neutral-dark tracking-tight">Obsah pro Facebook</h1>
          <p className="text-sm text-neutral-dark/60 mt-2 max-w-2xl">
            Texty pro Facebook ke zkopírování. Auto-poster je posílá automaticky:{' '}
            <strong>ve čtvrtek článek</strong>, <strong>v pondělí referenci</strong> (v 11:30). U článků funguje
            náhled i před zveřejněním (naplánované jsou <code className="text-xs">noindex</code> a nejsou v sitemapě).
          </p>
        </div>

        <SpravaContentTabs articles={articles} references={references} />
      </div>
    </main>
  );
}
