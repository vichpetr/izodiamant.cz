import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/cdn-cgi/',
    },
    sitemap: 'https://izodiamant.cz/sitemap.xml',
  };
}
