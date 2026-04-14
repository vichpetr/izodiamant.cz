import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/cdn-cgi/',
      },
      {
        userAgent: ['GPTBot', 'CCBot', 'Google-Extended', 'Claude-Web', 'anthropic-ai', 'ClaudeBot', 'Omgilibot', 'Omgili', 'FacebookBot', 'Diffbot', 'Bytespider', 'ImagesiftBot', 'PerplexityBot'],
        disallow: '/',
      }
    ],
    sitemap: 'https://izodiamant.cz/sitemap.xml',
  };
}
