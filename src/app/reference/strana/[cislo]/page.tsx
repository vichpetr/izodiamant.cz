import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ReferenceArchive from '@/components/ReferenceArchive';
import { pageMetadata } from '@/lib/seo';
import { referencePageCount, referencePagePath } from '@/lib/references';

const Footer = dynamic(() => import('@/components/Footer'));

/**
 * Další strany archivu referencí. Strana 1 žije na /reference (kanonická URL),
 * proto se tady generují až strany od dvojky – /reference/strana/1 má v
 * next.config.ts trvalé přesměrování na /reference.
 */
export async function generateStaticParams() {
  return Array.from({ length: Math.max(0, referencePageCount - 1) }, (_, i) => ({
    cislo: String(i + 2),
  }));
}

function parsePage(cislo: string): number | null {
  if (!/^\d+$/.test(cislo)) return null;
  const page = parseInt(cislo, 10);
  if (page < 2 || page > referencePageCount) return null;
  return page;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cislo: string }>;
}): Promise<Metadata> {
  const { cislo } = await params;
  const page = parsePage(cislo);
  if (!page) return { title: 'Stránka nenalezena' };

  return pageMetadata({
    path: referencePagePath(page),
    title: `Reference sanace zdiva – strana ${page}`,
    description: `Realizace sanace vlhkého zdiva – strana ${page} přehledu našich zakázek. Podřezání diamantovým lanem, řetězovou pilou i chemická injektáž. Vracíme zdraví vaší stavbě.`,
  });
}

export default async function ReferenceArchivePagedPage({
  params,
}: {
  params: Promise<{ cislo: string }>;
}) {
  const { cislo } = await params;
  const page = parsePage(cislo);
  if (!page) notFound();

  return (
    <main className="min-h-screen bg-neutral-light">
      <Header />
      <ReferenceArchive page={page} />
      <Footer />
    </main>
  );
}
