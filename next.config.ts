import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
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
            value: '</llms.txt>; rel="service-doc", </.well-known/api-catalog.json>; rel="api-catalog", </.well-known/openid-configuration.json>; rel="openid-configuration", </.well-known/oauth-protected-resource.json>; rel="oauth-protected-resource", </.well-known/agent-card.json>; rel="agent-card"',
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
        source: '/.well-known/api-catalog.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/linkset+json',
          },
        ],
      },
      {
        source: '/.well-known/openid-configuration.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
      {
        source: '/.well-known/oauth-protected-resource.json',
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
      {
        source: '/reference',
        destination: '/#reference',
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
        destination: '/#reference',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
