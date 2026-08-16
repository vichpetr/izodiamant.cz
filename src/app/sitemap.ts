import { MetadataRoute } from 'next';
import referencesData from '@/data/references.json';
import { referencePageCount, referencePagePath } from '@/lib/references';
import { publishedArticles } from '@/lib/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://izodiamant.cz';

  // Base pages
  const routes = [
    '',
    '/reference',
    '/clanky',
    '/cookies',
    '/ochrana-udaju',
    '/doporuc-a-ziskej-odmenu',
    '/sluzby/diamantove-lano',
    '/sluzby/retezova-pila',
    '/sluzby/chemicka-injektaz',
    '/sluzby/zednicke-a-obkladacske-prace',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Články – jen zveřejněné (naplánované do sitemapy naskočí až po rebuildu
  // v den zveřejnění). Zdroj je publishedArticles (filtr podle data v lib/articles).
  const articleRoutes = publishedArticles.map((a) => ({
    url: `${baseUrl}/clanky/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Další strany archivu referencí (strana 1 = /reference, viz routes výše).
  const archiveRoutes = Array.from({ length: referencePageCount - 1 }, (_, i) => ({
    url: `${baseUrl}${referencePagePath(i + 2)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // Reference pages
  const referenceRoutes = referencesData.map((project) => ({
    url: `${baseUrl}/reference/${project.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...articleRoutes, ...archiveRoutes, ...referenceRoutes];
}
