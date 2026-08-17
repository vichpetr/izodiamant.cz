// Odešle URL webu do IndexNow – jedním requestem uvědomí Bing, Seznam, Yandex
// i další zapojené vyhledávače, že se obsah změnil (okamžitá indexace nových
// článků a referencí místo čekání týdny na crawl).
//
// Spuštění: `npm run indexnow` ručně, nebo automaticky přes
// .github/workflows/indexnow.yml (push obsahu do master + denně po rebuildu).
//
// Klíč je veřejný soubor public/<KEY>.txt – IndexNow si přes něj ověří, že web
// opravdu patří odesílateli.
//
// Seznam URL bereme z ŽIVÉ sitemapy, ne z ručního seznamu cest. Ruční seznam se
// rozešel: chyběly v něm všechny články i /clanky a /reference, takže se do
// IndexNow nikdy neohlásily. Sitemapa se generuje ze stejných dat jako web
// (src/app/sitemap.ts), takže tímhle je shoda strukturální, ne hlídaná okem.
//
// Env:
//   INDEXNOW_TODAY_ONLY=1 – odešle jen články, které se zveřejňují dnes (denní
//                           běh po rebuildu; ať se pořád dokola neposílají
//                           nezměněné URL). Když dnes nic nevychází, skončí bez
//                           odeslání.
//   INDEXNOW_DRY_RUN=1    – jen vypíše, co by odeslal.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HOST = 'izodiamant.cz';
const KEY = '5a7b7dac7ea6b06b7a750e65bcce0206';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;

const TODAY_ONLY = process.env.INDEXNOW_TODAY_ONLY === '1';
const DRY = process.env.INDEXNOW_DRY_RUN === '1';

const here = dirname(fileURLToPath(import.meta.url));

/** URL článků, které mají dnešní datum zveřejnění (stejný filtr jako fb-schedule). */
function todaysArticleUrls() {
  const articles = JSON.parse(
    readFileSync(join(here, '../src/data/articles.json'), 'utf8'),
  );
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  return articles
    .filter((a) => a.date === today)
    .map((a) => `https://${HOST}/clanky/${a.slug}`);
}

/** Všechny URL z živé sitemapy (statické stránky, služby, články, reference). */
async function sitemapUrls() {
  const res = await fetch(SITEMAP_URL, { headers: { 'User-Agent': 'izodiamant-indexnow' } });
  if (!res.ok) {
    console.error(`Sitemapu se nepodařilo načíst: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim().replace(/&amp;/g, '&'))
    .filter((u) => u.startsWith(`https://${HOST}`));

  // Pojistka proti odeslání prázdna, když sitemapa vrátí chybovou stránku nebo
  // se nasazení ještě nedokončilo – radši ať CI spadne, než tiché „0 URL“.
  if (urls.length < 10) {
    console.error(`Sitemapa vrátila jen ${urls.length} URL – vypadá to na rozbité nasazení.`);
    process.exit(1);
  }

  return urls;
}

const urlList = [...new Set(TODAY_ONLY ? todaysArticleUrls() : await sitemapUrls())];

if (urlList.length === 0) {
  console.log('Dnes se nezveřejňuje žádný článek – IndexNow nemá co ohlásit.');
  process.exit(0);
}

if (DRY) {
  console.log(`IndexNow (dry run) · ${urlList.length} URL:`);
  urlList.forEach((u) => console.log('  ' + u));
  process.exit(0);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});

console.log(`IndexNow: ${res.status} ${res.statusText} · odesláno ${urlList.length} URL`);

// 200 OK i 202 Accepted jsou úspěch. Ostatní kódy (403 špatný klíč, 422 nesedící
// host, 429 příliš mnoho requestů) považujeme za chybu, ať to CI nahlásí.
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text().catch(() => ''));
  process.exit(1);
}
