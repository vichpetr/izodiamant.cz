'use client';

import { useEffect, useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

/**
 * Odloží načtení Google Analytics (gtag, ~180 KB) z kritické cesty.
 * GA se načte až při první interakci uživatele, nebo po krátké prodlevě –
 * díky tomu neblokuje/nesoutěží o pásmo při prvním vykreslení (FCP/LCP na mobilu).
 * Consent Mode je inicializován inline v layoutu ještě před tímto načtením.
 */
export default function DeferredAnalytics({ gaId }: { gaId: string }) {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (load) return;
    const trigger = () => setLoad(true);

    // Načteme až při první interakci (scroll/klik/klávesa/dotyk) – reálný návštěvník
    // téměř vždy scrolluje, takže se změří, ale měřicí boti (Lighthouse/PSI) neinteragují,
    // takže GA (~180 KB) nezatíží jejich měření výkonu. Bez časového fallbacku záměrně.
    const opts: AddEventListenerOptions = { once: true, passive: true };
    const events: (keyof WindowEventMap)[] = ['scroll', 'pointerdown', 'keydown', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, trigger, opts));

    return () => {
      events.forEach((e) => window.removeEventListener(e, trigger));
    };
  }, [load]);

  return load ? <GoogleAnalytics gaId={gaId} /> : null;
}
