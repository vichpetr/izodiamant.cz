'use client';

import { LazyMotion, domMax } from 'framer-motion';
import dynamic from 'next/dynamic';
import React from 'react';

const CookieConsent = dynamic(() => import("./CookieConsent"), { ssr: false });

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
      <CookieConsent />
    </LazyMotion>
  );
}
