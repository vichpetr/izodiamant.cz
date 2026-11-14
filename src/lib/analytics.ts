type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('cookie-consent') === 'true';
  } catch {
    return false;
  }
}

export function trackEvent(name: string, params: EventParams = {}): void {
  if (!hasAnalyticsConsent()) return;
  const eventParams = { ...params, page_path: window.location.pathname };
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, eventParams);
    return;
  }
  window.dataLayer = window.dataLayer ?? [];
  const queue = function (...args: unknown[]) {
    void args;
    // eslint-disable-next-line prefer-rest-params -- gtag consumes Arguments commands.
    window.dataLayer!.push(arguments);
  };
  queue('event', name, eventParams);
}

export function trackLead(
  source: 'kontaktni-formular' | 'kalkulacka',
  params: EventParams = {},
): void {
  trackEvent('generate_lead', { ...params, form_source: source });
}

export function trackPhoneClick(): void {
  trackEvent('click_to_call', { contact_method: 'phone' });
}

export function trackEmailClick(): void {
  trackEvent('click_to_email', { contact_method: 'email' });
}
