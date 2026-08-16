/**
 * URL review workeru, nebo `null`, když se na něj nemá sahat.
 *
 * Přeskočíme dva případy:
 * - placeholder z README (`…vas-ucet…` / `…vás-účet…`) – lokálně a v CI se recenze
 *   nemají tahat vůbec (raději prázdno než cizí data),
 * - adresu bez schématu (`izodiamant-reviews-api…workers.dev`). Ta se v prohlížeči
 *   přeloží relativně proti aktuální stránce, takže by se místo workeru stáhla
 *   náhodná URL vlastního webu – v CI to byla /reference/izodiamant-…workers.dev
 *   a 404 z ní padala do konzole. Chybějící `https://` je vždycky překlep v konfiguraci.
 */
export function reviewsApiUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_REVIEWS_API_URL;
  if (!url) return null;
  if (url.includes('vás-účet') || url.includes('vas-ucet')) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  return url;
}
