'use client';

import { LazyMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import React from 'react';

const CookieConsent = dynamic(() => import("./CookieConsent"), { ssr: false });

// domMax (největší část framer-motion) načítáme až po prvním vykreslení –
// vypadne z initial JS a neblokuje FCP/LCP na mobilu. Komponenty se `m` se
// vykreslí ve výchozím stavu a rozanimují, jakmile se featury doloadují.
const loadFeatures = () => import('framer-motion').then((mod) => mod.domMax);

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
      <CookieConsent />
    </LazyMotion>
  );
}
