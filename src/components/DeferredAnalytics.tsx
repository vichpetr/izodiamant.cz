'use client';

import { useEffect, useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { hasAnalyticsConsent } from '@/lib/analytics';

export default function DeferredAnalytics({ gaId }: { gaId: string }) {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const sync = () => {
      const allowed = hasAnalyticsConsent();
      Object.assign(window, { [`ga-disable-${gaId}`]: !allowed });
      setConsent(allowed);
    };
    sync();
    window.addEventListener('cookie-consent-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('cookie-consent-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, [gaId]);

  return consent && /^G-[A-Z0-9]+$/.test(gaId) ? <GoogleAnalytics gaId={gaId} /> : null;
}
