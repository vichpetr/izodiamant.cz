'use client';

import { useEffect } from 'react';
import { trackEmailClick, trackPhoneClick } from '@/lib/analytics';

export default function ConversionTracking() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a');
      const href = link?.getAttribute('href')?.toLowerCase();
      if (href?.startsWith('tel:')) trackPhoneClick();
      if (href?.startsWith('mailto:')) trackEmailClick();
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
