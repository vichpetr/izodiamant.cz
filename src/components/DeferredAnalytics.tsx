'use client';

import { useEffect, useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

const hasConsent = () => {
  try {
    return localStorage.getItem('cookie-consent') === 'true';
  } catch {
    return false;
  }
};

/**
 * Načte Google Analytics (gtag, ~180 KB) až po udělení souhlasu s analytickými cookies
 * a po první interakci uživatele. Bez souhlasu se gtag.js vůbec nestahuje, takže se do
 * Googlu neodesílá nic (ani cookieless pingy). Souhlas se čte z localStorage
 * (`cookie-consent`) a změnu hlásí `CookieConsent` událostí `cookie-consent-change`.
 *
 * Interakce (scroll/klik/klávesa/dotyk) navíc drží GA mimo kritickou cestu a měřicí boti
 * (Lighthouse/PSI) ho nenačtou. Consent Mode je inicializován inline v layoutu.
 */
export default function DeferredAnalytics({ gaId }: { gaId: string }) {
  const [consent, setConsent] = useState(false);
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    const sync = () => setConsent(hasConsent());
    sync();
    window.addEventListener('cookie-consent-change', sync);
    return () => window.removeEventListener('cookie-consent-change', sync);
  }, []);

  useEffect(() => {
    if (interacted) return;
    const trigger = () => setInteracted(true);
    const opts: AddEventListenerOptions = { once: true, passive: true };
    const events: (keyof WindowEventMap)[] = ['scroll', 'pointerdown', 'keydown', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, trigger, opts));
    return () => {
      events.forEach((e) => window.removeEventListener(e, trigger));
    };
  }, [interacted]);

  return consent && interacted ? <GoogleAnalytics gaId={gaId} /> : null;
}
