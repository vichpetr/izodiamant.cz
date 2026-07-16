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
  images = ['/logo.png'],
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
