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
    ]
  },
};

export default nextConfig;
