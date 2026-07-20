'use client';

import { useEffect } from 'react';
import { trackPhoneClick } from '@/lib/analytics';

/**
 * Měří kliknutí na telefonní čísla napříč celým webem.
 *
 * Delegovaný posluchač na dokumentu místo `onClick` u každého odkazu – `tel:`
 * odkazy jsou v hlavičce, patičce, kontaktním formuláři i na stránce programu
 * doporučení a snadno by se na některý zapomnělo. Takhle se měří i odkazy
 * přidané později.
 */
export default function ConversionTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.('a[href^="tel:"]') as HTMLAnchorElement | null;
      if (!link) return;
      trackPhoneClick(link.getAttribute('href')!.replace('tel:', ''));
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
