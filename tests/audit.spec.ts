import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

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

test.describe('Audit: párování recenzí k referenci', () => {
  // reviewId v referencích je prefixovaný (firmy-…); porovnání musí být odolné
  // vůči prefixu, jinak se spárovaná recenze nezobrazí (bug z auditu).
  test('/reference/zleby zobrazí spárovanou recenzi se zdrojem', async ({ page }) => {
    await page.goto('/reference/zleby');
    // ProjectReview načítá klientsky; bez workeru padá na statický fallback.
    await expect(page.getByText('Tomáš Bludička')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Recenze z (Mapy\.com|Google)/)).toBeVisible();
  });
});

test.describe('Audit: titulky značky', () => {
  test('každá stránka má „| IZODIAMANT" právě jednou (žádný zdvojený suffix)', async ({ request }) => {
    for (const path of PAGES) {
      const html = await (await request.get(path)).text();
      const title = html.match(/<title>(.*?)<\/title>/s)?.[1] ?? '';
      const count = (title.match(/IZODIAMANT/g) || []).length;
      expect(count, `${path} má chybný počet značky v titulku: "${title}"`).toBe(1);
    }
  });

  test('homepage má v titulku značku (kořenový segment – šablona se neaplikuje)', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1] ?? '';
    expect(title).toContain('| IZODIAMANT');
  });
});

test.describe('Audit: JSON-LD musí být v serverovém HTML', () => {
  // Přes next/script se JSON-LD vloží až po hydrataci – crawleři bez JS ho neuvidí.
  // Proto testujeme surové HTML z requestu, ne vyrenderovaný DOM.
  test('homepage obsahuje LocalBusiness (bez self-serving aggregateRating)', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
      .map((m) => JSON.parse(m[1]));

    const business = blocks.find((b) => b['@type'] === 'LocalBusiness');
    expect(business, 'LocalBusiness JSON-LD chybí v serverovém HTML').toBeTruthy();
    expect(business.address.streetAddress).toBe('Mokrá Lhota 26');
    expect(business.telephone).toBe('+420737017012');
    expect(business.identifier).toBe('74650726');
    // Google zakazuje self-serving hodnocení na vlastní LocalBusiness – nesmí se vrátit.
    expect(business.aggregateRating, 'self-serving aggregateRating na LocalBusiness (zakázáno Googlem)').toBeUndefined();
  });

  test('nikde není self-serving Review/AggregateRating markup', async ({ request }) => {
    for (const path of ['/', '/sluzby/retezova-pila', '/reference/zleby']) {
      const html = await (await request.get(path)).text();
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
        .map((m) => JSON.parse(m[1]));
      const hasReview = blocks.some((b) => b['@type'] === 'Review');
      const hasAgg = blocks.some((b) => JSON.stringify(b).includes('AggregateRating'));
      expect(hasReview, `${path} má Review JSON-LD (self-serving, zakázáno)`).toBe(false);
      expect(hasAgg, `${path} má AggregateRating JSON-LD (self-serving, zakázáno)`).toBe(false);
    }
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
    ['/mesta', '/'],
    ['/mesta/pardubice', '/'],
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

test.describe('Audit: robots.txt a AI crawleři', () => {
  // Pozn.: testuje se repo verze (lokální server). Na produkci Cloudflare navíc
  // injektuje vlastní „Managed content“ blok – ten se spravuje v CF dashboardu.
  test('Content-Signal povoluje ai-input (jinak se web nedostane do AI odpovědí)', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    const signal = txt.match(/^Content-Signal:\s*(.+)$/m)?.[1] ?? '';
    expect(signal, 'Content-Signal chybí v robots.txt').toBeTruthy();
    // ai-input=no by popřelo celou agent-discovery vrstvu (llms.txt, agent-card, auth.md).
    expect(signal, 'ai-input=no blokuje použití obsahu v AI odpovědích').toContain('ai-input=yes');
    expect(signal).toContain('search=yes');
  });

  test('robots.txt odkazuje na sitemapu a nezakazuje obsah', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    expect(txt).toContain('Sitemap: https://izodiamant.cz/sitemap.xml');
    const disallows = [...txt.matchAll(/^Disallow:\s*(.+)$/gm)].map((m) => m[1].trim());
    const contentBlocked = disallows.filter((d) => d !== '/cdn-cgi/' && d !== '');
    expect(contentBlocked, `robots.txt blokuje obsah: ${contentBlocked.join(', ')}`).toEqual([]);
  });
});

test.describe('Audit: nenabízíme vysoušení (konzistence napříč zdroji)', () => {
  // Majitel potvrdil: vysoušení/elektroosmózu firma NEDĚLÁ. FAQ i llms.txt to
  // uvádějí správně – agent-facing soubory to dřív tvrdily opačně („dewatering“).
  const AGENT_FILES = [
    '/.well-known/agent-card.json',
    '/.well-known/agent-skills/index.json',
    '/.well-known/agent-skills/get-services/SKILL.md',
  ];

  for (const path of AGENT_FILES) {
    test(`${path} nenabízí vysoušení`, async ({ request }) => {
      const body = (await (await request.get(path)).text()).toLowerCase();
      expect(body, `${path} nabízí dewatering/vysoušení, které firma neposkytuje`)
        .not.toMatch(/dewater|vysouš|vysuš/);
    });
  }

  test('digest v agent-skills/index.json odpovídá skutečnému SKILL.md', () => {
    // Vymyšlený digest = agent ověřující integritu skill odmítne. Hlídáme, aby
    // se hash nerozešel s obsahem při každé úpravě SKILL.md.
    const root = join(__dirname, '..');
    const index = JSON.parse(
      readFileSync(join(root, 'public/.well-known/agent-skills/index.json'), 'utf-8'),
    );
    const skill = readFileSync(
      join(root, 'public/.well-known/agent-skills/get-services/SKILL.md'),
    );
    const real = `sha256:${createHash('sha256').update(skill).digest('hex')}`;
    expect(index.skills[0].digest, 'digest se rozešel s obsahem SKILL.md').toBe(real);
  });
});

test.describe('Audit: agent-discovery auth.md', () => {
  test('/auth.md se servíruje s H1 „auth.md"', async ({ request }) => {
    const res = await request.get('/auth.md');
    expect(res.ok(), '/auth.md není dostupný').toBeTruthy();
    const body = await res.text();
    // Audit isitagentready vyžaduje H1 obsahující „auth.md".
    expect(body).toMatch(/^#\s*auth\.md/m);
  });

  test('/auth.md není přebit markdown-negociací (nevrací llms summary)', async ({ request }) => {
    // Middleware negociuje Accept: text/markdown na běžných stránkách a vrací LLMS_MD.
    // Reálný statický .md soubor se ale musí servírovat sám za sebe – jinak by
    // /auth.md ztratilo svůj heading a audit by spadl.
    const res = await request.get('/auth.md', { headers: { Accept: 'text/markdown' } });
    const body = await res.text();
    expect(body).toMatch(/^#\s*auth\.md/m);
    expect(body, '/auth.md vrací obsah llms.txt místo sebe').not.toContain('Sanace a podřezávání zdiva');
  });

  test('markdown-negociace stále funguje na běžných stránkách', async ({ request }) => {
    const res = await request.get('/sluzby/diamantove-lano', { headers: { Accept: 'text/markdown' } });
    expect(await res.text()).toContain('IZODIAMANT - Sanace a podřezávání zdiva');
  });

  test('oauth-protected-resource má povinná pole', async ({ request }) => {
    const res = await request.get('/.well-known/oauth-protected-resource');
    const json = await res.json();
    expect(json.resource).toBe('https://izodiamant.cz');
    expect(json).toHaveProperty('authorization_servers');
    expect(json).toHaveProperty('scopes_supported');
    expect(json.bearer_methods_supported).toContain('header');
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

  test('nikde neslibujeme dopravu zdarma (cestovné si platí zákazník)', async ({ page }) => {
    // Majitel potvrdil: cestovné se účtuje. Web dřív tvrdil „Doprava a prohlídka
    // objektu … jsou zdarma“ – zdarma je jen prohlídka a cenová nabídka.
    for (const path of PAGES) {
      await page.goto(path);
      const body = await page.locator('body').innerText();
      expect(body, `${path} slibuje dopravu zdarma`).not.toMatch(/doprav\w*[^.!?]{0,60}zdarma/i);
    }
  });

  test('nikde neslibujeme prodlouženou záruku nad rámec zákona', async ({ page }) => {
    // Majitel potvrdil: poskytuje jen zákonnou záruku. Web dřív tvrdil
    // „prodloužená záruka nad rámec zákonné lhůty“ – nepravdivý slib.
    for (const path of PAGES) {
      await page.goto(path);
      const body = (await page.locator('body').innerText()).toLowerCase();
      expect(body, `${path} slibuje prodlouženou záruku`).not.toContain('prodloužen');
      expect(body, `${path} slibuje záruku nad rámec zákona`).not.toContain('nad rámec zákon');
    }
  });

  test('slogan se v těle stránky služby neopakuje', async ({ page }) => {
    await page.goto('/sluzby/diamantove-lano');
    const body = await page.locator('body').innerText();
    const occurrences = (body.match(/vracíme zdraví vaší stavbě/gi) || []).length;
    // Slogan patří do hlavičky/patičky, ne do technických kolonek a odstavců.
    expect(occurrences, 'slogan se v těle stránky opakuje').toBeLessThanOrEqual(1);
  });
});
