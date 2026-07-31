// Odešle URL webu do IndexNow – jedním requestem uvědomí Bing, Seznam, Yandex
// i další zapojené vyhledávače, že se obsah změnil (okamžitá indexace nových
// referencí místo čekání týdny na crawl).
//
// Spuštění: `npm run indexnow` ručně, nebo automaticky přes
// .github/workflows/indexnow.yml po pushi obsahu do master.
//
// Klíč je veřejný soubor public/<KEY>.txt – IndexNow si přes něj ověří, že web
// opravdu patří odesílateli. Seznam URL musí odpovídat src/app/sitemap.ts.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HOST = 'izodiamant.cz';
const KEY = '5a7b7dac7ea6b06b7a750e65bcce0206';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const here = dirname(fileURLToPath(import.meta.url));
const references = JSON.parse(readFileSync(join(here, '../src/data/references.json'), 'utf8'));

// Stejné cesty jako sitemap.ts (statické + detaily referencí).
const staticRoutes = [
  '',
  '/cookies',
  '/ochrana-udaju',
  '/doporuc-a-ziskej-odmenu',
  '/sluzby/diamantove-lano',
  '/sluzby/retezova-pila',
  '/sluzby/chemicka-injektaz',
];

const urlList = [
  ...staticRoutes.map((r) => `https://${HOST}${r || '/'}`),
  ...references.map((p) => `https://${HOST}/reference/${p.id}`),
];

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
