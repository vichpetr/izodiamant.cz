#!/usr/bin/env node
// FB auto-poster – týdenní kadence:
//   pondělí  → naplánuje FB post k další REFERENCI,
//   čtvrtek  → naplánuje FB post k dalšímu ČLÁNKU,
// oba na dnešek v 11:30 (Europe/Prague). Text bere z pole `fbPost`
// (v references.json, resp. articles.json), odkaz z URL detailu.
//
// „Další" = první v pořadí, jehož odkaz ještě není mezi FB posty stránky
// (naplánovanými i zveřejněnými) – fronta se tak drží stateless přes samotný FB.
// Reference jdou od nejnovější, články v pořadí zveřejnění (jen už zveřejněné).
//
// Spouští se denně z GitHub Actions (.github/workflows/fb-schedule.yml); skript
// sám rozhodne podle dne v týdnu. Naplánování 3–4 dny/týden dopředu obchází
// 4týdenní limit ručního plánování a přesný čas 11:30 pohlídá Facebook.
//
// Env:
//   FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN – stránka + token s pages_manage_posts
//   TZ=Europe/Prague – nastaveno ve workflow (kvůli dni v týdnu i času 11:30)
//   FB_DRY_RUN=1     – jen vypíše, co by naplánoval, nic neodešle (token netřeba)
//   FB_FORCE_KIND=reference|article – vynutí typ bez ohledu na den (pro test)

import { readFileSync } from 'node:fs';

const GRAPH = 'https://graph.facebook.com/v21.0';
const BASE_URL = 'https://izodiamant.cz';
const HOUR = 11;
const MINUTE = 30;
const MIN_LEAD_MS = 15 * 60 * 1000;

const PAGE_ID = process.env.FB_PAGE_ID;
const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const DRY = process.env.FB_DRY_RUN === '1';
const FORCE_KIND = process.env.FB_FORCE_KIND;

if (!DRY && (!PAGE_ID || !TOKEN)) {
  console.log('FB_PAGE_ID / FB_PAGE_ACCESS_TOKEN nejsou nastavené – přeskakuji plánování FB postů.');
  process.exit(0);
}

const articles = JSON.parse(readFileSync(new URL('../src/data/articles.json', import.meta.url), 'utf8'));
const references = JSON.parse(readFileSync(new URL('../src/data/references.json', import.meta.url), 'utf8'));

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();
const d = now.getDate();
const dow = now.getDay(); // 0=Ne … 1=Po … 4=Čt
const pad = (n) => String(n).padStart(2, '0');
const todayStr = `${y}-${pad(m + 1)}-${pad(d)}`;
const dayNames = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];

// Co dnes řešíme: pondělí = reference, čtvrtek = článek (nebo vynuceno přes env).
let kind = null;
if (FORCE_KIND === 'reference' || FORCE_KIND === 'article') kind = FORCE_KIND;
else if (dow === 1) kind = 'reference';
else if (dow === 4) kind = 'article';

if (!kind) {
  console.log(`Dnes je ${dayNames[dow]} – neplánuje se (posty jen v pondělí = reference, ve čtvrtek = článek).`);
  process.exit(0);
}

// Sestav frontu kandidátů v kanonickém pořadí.
let queue;
if (kind === 'reference') {
  queue = [...references]
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))) // od nejnovější
    .map((r) => ({ marker: `/reference/${r.id}`, url: `${BASE_URL}/reference/${r.id}`, message: r.fbPost, label: r.id }));
} else {
  queue = articles
    .filter((a) => a.date <= todayStr) // jen už zveřejněné články
    .sort((a, b) => a.date.localeCompare(b.date)) // v pořadí zveřejnění
    .map((a) => ({ marker: `/clanky/${a.slug}`, url: `${BASE_URL}/clanky/${a.slug}`, message: a.fbPost, label: a.slug }));
}
queue = queue.filter((x) => x.message && x.message.trim());

if (queue.length === 0) {
  console.log(`Fronta (${kind}) je prázdná (chybí fbPost) – nic k naplánování.`);
  process.exit(0);
}

// Cílový čas = dnešek 11:30 místního času; když už minul (pozdní běh), publikuje ihned.
const target = new Date(y, m, d, HOUR, MINUTE, 0, 0);
const immediate = target.getTime() < now.getTime() + MIN_LEAD_MS;
const scheduledUnix = Math.floor(target.getTime() / 1000);

// --- Dry-run: bez tokenu vybere prvního v pořadí a vypíše ho ---
if (DRY) {
  const pick = queue[0];
  console.log(`[DRY-RUN] ${kind} → ${pick.label} @ ${immediate ? 'ihned' : target.toString()}\n---\n${pick.message}\n---`);
  console.log('(Pozn.: dry-run nezná stav FB, bere prvního ve frontě; ostrý běh přeskočí už zveřejněné.)');
  process.exit(0);
}

// Page access token (naplánovaný post musí jít jménem stránky).
let pageToken = TOKEN;
try {
  const res = await fetch(`${GRAPH}/${PAGE_ID}?fields=access_token&access_token=${encodeURIComponent(TOKEN)}`);
  const json = await res.json();
  if (json.access_token) pageToken = json.access_token;
  else console.log('Varování: nezískán Page token (', JSON.stringify(json.error || json), '), zkouším zadaný token přímo.');
} catch (e) {
  console.log('Varování: chyba při získávání Page tokenu (pokračuji se zadaným):', e.message);
}

// Otisk už existujících postů (naplánované + zveřejněné), ať frontu držíme přes FB
// a nevytvoříme duplicitu k ručně vytvořeným postům.
async function fetchHaystacks(edge) {
  try {
    const res = await fetch(
      `${GRAPH}/${PAGE_ID}/${edge}?fields=message,attachments{unshimmed_url,target}&limit=200&access_token=${encodeURIComponent(pageToken)}`,
    );
    const json = await res.json();
    if (Array.isArray(json.data)) return json.data.map((p) => `${p.message || ''} ${JSON.stringify(p.attachments || '')}`);
    if (json.error) console.log(`Varování: čtení ${edge}:`, JSON.stringify(json.error));
  } catch (e) {
    console.log(`Varování: čtení ${edge} selhalo (pokračuji):`, e.message);
  }
  return [];
}
const haystacks = [...(await fetchHaystacks('scheduled_posts')), ...(await fetchHaystacks('feed'))];

// Vyber prvního z fronty, který ještě na FB není.
const next = queue.find((x) => !haystacks.some((h) => h.includes(x.marker)));
if (!next) {
  console.log(`Není co naplánovat (${kind}) – všechny položky už jsou na FB (naplánované nebo zveřejněné).`);
  process.exit(0);
}

const body = new URLSearchParams({ message: next.message, link: next.url, access_token: pageToken });
if (immediate) {
  body.set('published', 'true');
} else {
  body.set('published', 'false');
  body.set('scheduled_publish_time', String(scheduledUnix));
}

const res = await fetch(`${GRAPH}/${PAGE_ID}/feed`, { method: 'POST', body });
const json = await res.json();
if (!res.ok || json.error) {
  console.error(`CHYBA při plánování (${kind}) ${next.label}:`, JSON.stringify(json.error || json));
  process.exit(1);
}
console.log(
  immediate
    ? `Publikováno ihned (cílový čas už minul): ${kind} ${next.label} (post id ${json.id})`
    : `Naplánováno: ${kind} ${next.label} → ${target.toISOString()} (post id ${json.id})`,
);
