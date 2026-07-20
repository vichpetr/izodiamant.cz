'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const CookieConsent = dynamic(() => import("./CookieConsent"), { ssr: false });
const ConversionTracking = dynamic(() => import("./ConversionTracking"), { ssr: false });

// framer-motion odstraněn kvůli výkonu (mobil). Provider už jen mountuje
// CookieConsent a měření konverzí (klientsky, bez SSR). Animace řeší CSS.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CookieConsent />
      <ConversionTracking />
    </>
  );
}
