/**
 * Měření konverzí (GA4 → import do Google Ads).
 *
 * Volat lze kdykoli. GA se načítá až při první interakci (`DeferredAnalytics`)
 * a jen se souhlasem, takže `gtag` v okamžiku události **nemusí existovat** –
 * událost se pak zařadí do `dataLayer` a gtag.js ji po načtení přehraje.
 * Bez souhlasu ji Consent Mode zahodí, takže se nikdy neměří bez svolení.
 *
 * Názvy `generate_lead` a `click_to_call` jsou doporučené události GA4 –
 * GA je rozpozná samo a jdou přímo označit jako klíčové a importovat do Ads.
 */

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === 'undefined') return;

  // gtag je definován inline v layoutu (Consent Mode) – pokud tam z jakéhokoli
  // důvodu ještě není, zapíšeme událost do fronty ve stejném tvaru, jaký gtag
  // používá (`dataLayer.push(arguments)`), aby ji gtag.js po načtení zpracoval.
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(['event', name, params]);
}

/** Odeslaná poptávka. `source` rozliší kontaktní formulář od kalkulačky. */
export function trackLead(
  source: 'kontaktni-formular' | 'kalkulacka',
  params: EventParams = {},
): void {
  trackEvent('generate_lead', { form_source: source, ...params });
}

/** Kliknutí na telefonní číslo – u řemesla nejčastější cesta k poptávce. */
export function trackPhoneClick(phone: string): void {
  trackEvent('click_to_call', { phone_number: phone });
}
