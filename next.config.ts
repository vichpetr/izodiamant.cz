import type { NextConfig } from "next";

// Vlastní image loader přes /cdn-cgi/image (viz src/lib/cfImageLoader.ts) zapneme
// jen pro PRODUKČNÍ nasazení na custom doméně izodiamant.cz, kde jsou Cloudflare
// Transformations aktivní. Na preview (*.pages.dev) /cdn-cgi/image NEfunguje –
// transformace tam nejdou zapnout – takže tam i lokálně/v CI zůstává loader vypnutý
// a obrázky se servírují přímo. CF Pages nastavuje CF_PAGES_BRANCH; produkční větev
// je 'master'. Ruční přepis přes NEXT_PUBLIC_CF_IMAGES má přednost (např. lze zapnout
// nastavením NEXT_PUBLIC_CF_IMAGES=true jen v Production env varech projektu).
const isCfProd = Boolean(process.env.CF_PAGES) && process.env.CF_PAGES_BRANCH === 'master';
const cfImages = process.env.NEXT_PUBLIC_CF_IMAGES ?? (isCfProd ? 'true' : '');

const nextConfig: NextConfig = {
  images: {
    loaderFile: './src/lib/cfImageLoader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  env: {
    NEXT_PUBLIC_CF_IMAGES: cfImages,
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  // This helps with modern JS output
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Link',
            value: '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog", </.well-known/openid-configuration>; rel="openid-configuration", </.well-known/oauth-protected-resource>; rel="oauth-protected-resource", </.well-known/agent-card.json>; rel="agent-card"',
          },
        ],
      },
      {
        source: '/llms.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/markdown; charset=utf-8',
          },
        ],
      },
      {
        source: '/.well-known/api-catalog',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/linkset+json',
          },
        ],
      },
      {
        source: '/.well-known/openid-configuration',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
      {
        source: '/.well-known/oauth-protected-resource',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
      {
        source: '/.well-known/agent-card.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Pozn.: /reference už NENÍ přesměrování – je to skutečná stránka archivu
      // referencí (se stránkováním a členěním po letech). Stránka 1 archivu je
      // jen na /reference, proto sem míří i /reference/strana/1.
      {
        source: '/reference/strana/1',
        destination: '/reference',
        permanent: true,
      },
      {
        source: '/sluzby',
        destination: '/#sluzby',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/#services',
        permanent: true,
      },
      {
        source: '/sluzby/sanace-pilou-s-diamantovym-lanem',
        destination: '/sluzby/diamantove-lano',
        permanent: true,
      },
      {
        source: '/sluzby/sluzby-podrezani-retezovou-pilou',
        destination: '/sluzby/retezova-pila',
        permanent: true,
      },
      {
        source: '/kontakt',
        destination: '/#contact',
        permanent: true,
      },
      {
        source: '/category/reference',
        destination: '/reference',
        permanent: true,
      },
      // Staré URL z předchozí verze webu (WordPress), stále v indexu vyhledávačů.
      // Bez 301 vzniká duplicitní obsah a Google/Seznam si sám vybírá, kterou verzi zobrazí.
      // Pozor: žádný catch-all na /sluzby/:slug* – přepsal by skutečné stránky služeb.
      // /clanky je teď reálný přehled článků (ne redirect). Staré jednotlivé
      // články 301 na homepage – KROMĚ obnoveného článku o sklepích, který stále
      // rankuje (~4. pozice v GSC) a má vlastní stránku. Negativní lookahead ten
      // jeden slug z catch-all vyjme, ostatní /clanky/* dál míří na /.
      {
        source: '/clanky/:slug((?!skvele-vyuziti-sklepnich-prostor$).*)',
        destination: '/',
        permanent: true,
      },
      {
        source: '/category/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/reference/ref-:id',
        destination: '/reference',
        permanent: true,
      },
      // Zrušené landing pages měst (byly krátce živé a v sitemapě) → homepage.
      {
        source: '/mesta',
        destination: '/',
        permanent: true,
      },
      {
        source: '/mesta/:slug*',
        destination: '/',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
