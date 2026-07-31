import type { Metadata } from 'next';

export const SITE_URL = 'https://izodiamant.cz';

/**
 * Next.js nesluje `openGraph` hluboce – jakmile ho stránka nastaví, přepíše
 * celý objekt z layoutu včetně siteName, locale a type. Tento helper proto
 * skládá kompletní openGraph pro každou podstránku, aby og:url ukazovalo na
 * konkrétní URL a zbylá pole se neztratila.
 */
export function pageMetadata({
  path,
  title,
  description,
  images = ['/og-image.jpg'],
}: {
  path: string;
  title: string;
  description: string;
  images?: string[];
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'cs_CZ',
      siteName: 'IZODIAMANT',
      url,
      title: `${title} | IZODIAMANT`,
      description,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | IZODIAMANT`,
      description,
      images,
    },
  };
}

/**
 * Sestaví BreadcrumbList JSON-LD z dvojic [název, cesta].
 * Renderuj výsledek jako plain <script type="application/ld+json"> (viz skill
 * site-invariants, pravidlo 3), aby byl v serverovém HTML i pro crawlery bez JS.
 */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
