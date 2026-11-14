'use client';

import { useEffect, useRef } from 'react';
import { hasAnalyticsConsent } from '@/lib/analytics';

export default function DeferredAnalytics({ gaId }: { gaId: string }) {
  const initialized = useRef<string | null>(null);

  useEffect(() => {
    if (!/^G-[A-Z0-9]+$/.test(gaId)) return;
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = window.gtag ?? function () {
      // eslint-disable-next-line prefer-rest-params -- gtag consumes Arguments commands.
      window.dataLayer!.push(arguments);
    };
    const sync = () => {
      const allowed = hasAnalyticsConsent();
      Object.assign(window, { [`ga-disable-${gaId}`]: !allowed });
      const settings = {
        analytics_storage: allowed ? 'granted' : 'denied',
        ad_storage: allowed ? 'granted' : 'denied',
        ad_user_data: allowed ? 'granted' : 'denied',
        ad_personalization: allowed ? 'granted' : 'denied',
      };
      window.gtag!('consent', initialized.current ? 'update' : 'default', settings);
      if (!allowed || initialized.current === gaId) return;
      initialized.current = gaId;
      window.gtag!('js', new Date());
      window.gtag!('config', gaId);
      if (!document.getElementById('_next-ga')) {
        const script = document.createElement('script');
        script.id = '_next-ga';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
        document.head.appendChild(script);
      }
    };
    sync();
    window.addEventListener('cookie-consent-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('cookie-consent-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, [gaId]);

  return null;
}
