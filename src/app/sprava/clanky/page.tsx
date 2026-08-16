import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { safeAuth, isAllowed } from '@/auth';
import { allArticles, isArticlePublished, formatArticleDate } from '@/lib/articles';
import SpravaNav from '../SpravaNav';
import CopyBox from '../CopyBox';

export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Náhled článků',
  robots: { index: false, follow: false },
};

export default async function SpravaClankyPage() {
  const session = await safeAuth();
  if (!session?.user || !isAllowed(session.user.email)) redirect('/sprava/prihlaseni');

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

        <div className="space-y-5">
          {allArticles.map((a) => {
            const published = isArticlePublished(a);
            return (
              <section key={a.slug} className="bg-white rounded-3xl border border-neutral-dark/5 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <h2 className="font-black uppercase italic text-neutral-dark tracking-tight leading-tight">{a.title}</h2>
                    <p className="text-sm text-neutral-dark/60 mt-1">{a.excerpt}</p>
                  </div>
                  <span
                    className={
                      'shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ' +
                      (published ? 'bg-primary/15 text-primary-ink' : 'bg-amber-100 text-amber-800')
                    }
                  >
                    {published ? 'Zveřejněno' : 'Naplánováno'} · {formatArticleDate(a.date)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`/clanky/${a.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-ink hover:underline"
                  >
                    Náhled článku ↗
                  </a>
                  <span className="text-[11px] text-neutral-dark/40 font-mono">/clanky/{a.slug}</span>
                </div>

                <CopyBox text={a.fbPost} />
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
