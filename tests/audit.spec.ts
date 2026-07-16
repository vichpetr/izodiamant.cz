import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Regresní testy k auditu webu (2026-07).
 * Hlídají body, které se snadno rozbijí zpět: jednotky cen, duplicitní obsah
 * ze staré verze webu, JSON-LD v serverovém HTML a og:url na podstránkách.
 */

const PAGES = [
  '/',
  '/sluzby/diamantove-lano',
  '/sluzby/retezova-pila',
  '/sluzby/chemicka-injektaz',
  '/cookies',
  '/ochrana-udaju',
  '/doporuc-a-ziskej-odmenu',
  '/reference/zleby',
];

test.describe('Audit: og:url na podstránkách', () => {
  for (const path of PAGES) {
    test(`${path} má vlastní og:url i canonical`, async ({ page }) => {
      await page.goto(path);
      const expected = `https://izodiamant.cz${path === '/' ? '' : path}`;

      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', expected);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', expected);
    });
  }
});

test.describe('Audit: JSON-LD musí být v serverovém HTML', () => {
  // Přes next/script se JSON-LD vloží až po hydrataci – crawleři bez JS ho neuvidí.
  // Proto testujeme surové HTML z requestu, ne vyrenderovaný DOM.
  test('homepage obsahuje LocalBusiness s hodnocením', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
      .map((m) => JSON.parse(m[1]));

    const business = blocks.find((b) => b['@type'] === 'LocalBusiness');
    expect(business, 'LocalBusiness JSON-LD chybí v serverovém HTML').toBeTruthy();
    expect(business.address.streetAddress).toBe('Mokrá Lhota 26');
    expect(business.telephone).toBe('+420737017012');
    expect(business.identifier).toBe('74650726');
    expect(business.aggregateRating.ratingValue).toBeGreaterThan(0);
    expect(business.aggregateRating.reviewCount).toBeGreaterThan(0);
  });

  test('homepage obsahuje FAQPage', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
      .map((m) => JSON.parse(m[1]));

    const faq = blocks.find((b) => b['@type'] === 'FAQPage');
    expect(faq, 'FAQPage JSON-LD chybí v serverovém HTML').toBeTruthy();
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(5);
  });

  for (const path of ['/sluzby/diamantove-lano', '/sluzby/retezova-pila', '/sluzby/chemicka-injektaz']) {
    test(`${path} obsahuje Service JSON-LD`, async ({ request }) => {
      const html = await (await request.get(path)).text();
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
        .map((m) => JSON.parse(m[1]));

      const service = blocks.find((b) => b['@type'] === 'Service');
      expect(service, 'Service JSON-LD chybí v serverovém HTML').toBeTruthy();
      expect(service.offers.priceSpecification.description).toContain('bm');
    });
  }
});

test.describe('Audit: jednotky cen jsou všude bm', () => {
  test('nikde se neobjeví cena za m²', async ({ request }) => {
    for (const path of PAGES) {
      const html = await (await request.get(path)).text();
      // Plocha řezu v referencích (např. "32 m² řezné plochy") je v pořádku;
      // zakázaná je jen cena za m².
      expect(html, `${path} uvádí cenu za m²`).not.toMatch(/Kč\s*\/\s*m²/);
    }
  });

  test('ceníkové stránky uvádějí Kč / bm', async ({ request }) => {
    for (const path of ['/sluzby/diamantove-lano', '/sluzby/retezova-pila', '/sluzby/chemicka-injektaz']) {
      const html = await (await request.get(path)).text();
      expect(html, `${path} neuvádí cenu za bm`).toMatch(/Kč\s*\/\s*bm/);
    }
  });
});

test.describe('Audit: staré URL se přesměrovávají (duplicitní obsah)', () => {
  const OLD_URLS: [string, string][] = [
    ['/sluzby/sanace-pilou-s-diamantovym-lanem', '/sluzby/diamantove-lano'],
    ['/sluzby/sluzby-podrezani-retezovou-pilou', '/sluzby/retezova-pila'],
    ['/kontakt', '/'],
    ['/sluzby', '/'],
    ['/reference', '/'],
    ['/clanky', '/'],
    ['/clanky/vyuziti-sklepa', '/'],
    ['/reference/ref-1', '/'],
    ['/category/reference', '/'],
  ];

  for (const [oldUrl, expectedPath] of OLD_URLS) {
    test(`${oldUrl} → ${expectedPath}`, async ({ request }) => {
      const res = await request.get(oldUrl, { maxRedirects: 0 });
      expect([301, 308], `${oldUrl} nevrací trvalé přesměrování`).toContain(res.status());

      const location = res.headers()['location'];
      expect(location).toBeTruthy();
      // Cíl může být hash odkaz na homepage (/#sluzby) i konkrétní stránka.
      expect(location.split('#')[0] || '/').toBe(expectedPath);
    });
  }

  test('skutečné stránky služeb zůstávají dostupné (žádný catch-all)', async ({ request }) => {
    for (const path of ['/sluzby/diamantove-lano', '/sluzby/retezova-pila', '/sluzby/chemicka-injektaz']) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), `${path} je omylem přesměrována`).toBe(200);
    }
  });
});

test.describe('Audit: llms.txt', () => {
  test('public/llms.txt je shodný s konstantou pro middleware', () => {
    const root = join(__dirname, '..');
    const staticFile = readFileSync(join(root, 'public/llms.txt'), 'utf-8');
    const tsSource = readFileSync(join(root, 'src/lib/llms.ts'), 'utf-8');

    const match = tsSource.match(/export const LLMS_MD = `([\s\S]*)`;\s*$/);
    expect(match, 'LLMS_MD konstanta nenalezena').toBeTruthy();
    const fromTs = match![1].replace(/\\`/g, '`').replace(/\\\$\{/g, '${').replace(/\\\\/g, '\\');

    expect(fromTs, 'public/llms.txt a src/lib/llms.ts se rozešly').toBe(staticFile);
  });

  test('llms.txt je dostupný a uvádí ceny za bm', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toContain('Kč/bm');
    expect(text).not.toContain('100% ochranu');
  });
});

test.describe('Audit: nedoložitelná tvrzení', () => {
  const BANNED = [
    'vydrží navždy',
    'nikdy nevrátí',
    'neprostupnou bariéru',
    'nepřekonatelnou bariéru',
    'absolutní špičku',
  ];

  for (const path of PAGES) {
    test(`${path} neobsahuje přehnaná tvrzení`, async ({ page }) => {
      await page.goto(path);
      const body = (await page.locator('body').innerText()).toLowerCase();
      for (const phrase of BANNED) {
        expect(body, `${path} obsahuje "${phrase}"`).not.toContain(phrase.toLowerCase());
      }
    });
  }

  test('slogan se v těle stránky služby neopakuje', async ({ page }) => {
    await page.goto('/sluzby/diamantove-lano');
    const body = await page.locator('body').innerText();
    const occurrences = (body.match(/vracíme zdraví vaší stavbě/gi) || []).length;
    // Slogan patří do hlavičky/patičky, ne do technických kolonek a odstavců.
    expect(occurrences, 'slogan se v těle stránky opakuje').toBeLessThanOrEqual(1);
  });
});
