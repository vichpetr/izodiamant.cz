import { MetadataRoute } from 'next';
import referencesData from '@/data/references.json';
import mestaData from '@/data/mesta.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://izodiamant.cz';

  // Base pages
  const routes = [
    '',
    '/cookies',
    '/ochrana-udaju',
    '/doporuc-a-ziskej-odmenu',
    '/sluzby/diamantove-lano',
    '/sluzby/retezova-pila',
    '/sluzby/chemicka-injektaz',
    '/mesta',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // City pages
  const cityRoutes = (mestaData as Array<{ slug: string }>).map((mesto) => ({
    url: `${baseUrl}/mesta/${mesto.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Reference pages
  const referenceRoutes = referencesData.map((project) => ({
    url: `${baseUrl}/reference/${project.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...cityRoutes, ...referenceRoutes];
}
