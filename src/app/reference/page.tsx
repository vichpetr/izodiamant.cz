import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import ReferenceArchive from '@/components/ReferenceArchive';
import { pageMetadata } from '@/lib/seo';

const Footer = dynamic(() => import('@/components/Footer'));

export const metadata: Metadata = {
  ...pageMetadata({
    path: '/reference',
    title: 'Reference sanace zdiva',
    description:
      'Realizace sanace vlhkého zdiva – diamantové lano, řetězová pila i chemická injektáž. Fotky, rozsah prací a lokality. Vracíme zdraví vaší stavbě.',
  }),
  keywords: [
    'reference sanace zdiva',
    'realizace podřezání zdiva',
    'podřezání zdiva fotografie',
    'sanace vlhkého zdiva reference',
    'IZODIAMANT reference',
  ],
};

export default function ReferenceArchivePage() {
  return (
    <main className="min-h-screen bg-neutral-light">
      <Header />
      <ReferenceArchive page={1} />
      <Footer />
    </main>
  );
}
