import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { allArticles } from '@/lib/articles';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';

const Footer = dynamic(() => import('@/components/Footer'));

export const metadata: Metadata = {
  ...pageMetadata({
    path: '/clanky',
    title: 'Články a rádce k sanaci zdiva',
    description:
      'Praktické tipy a návody kolem vlhkého zdiva, sklepů a sanace. Jak poznat vzlínající vlhkost a jak z vlhkého prostoru udělat suchý. Vracíme zdraví vaší stavbě.',
  }),
  keywords: ['sanace zdiva rádce', 'vlhké zdivo tipy', 'využití sklepa', 'vzlínající vlhkost', 'IZODIAMANT články'],
};

export default function ArticlesArchivePage() {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: allArticles.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://izodiamant.cz/clanky/${a.slug}`,
      name: a.title,
    })),
  };
  const breadcrumb = breadcrumbSchema([
    { name: 'Domů', path: '/' },
    { name: 'Články', path: '/clanky' },
  ]);

  return (
    <main className="min-h-screen bg-neutral-light">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Header />

      <section className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-4">Rádce · Sanace zdiva</div>
            <h1 className="text-4xl md:text-6xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.9] mb-6">
              Články a rádce
            </h1>
            <p className="text-lg text-neutral-dark/70 font-medium">
              Praktické tipy a návody kolem vlhkého zdiva, sklepů a sanace – ať se rozhodujete líp a víte, do čeho jdete.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
