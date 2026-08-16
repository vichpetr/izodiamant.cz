#!/usr/bin/env node
// FB auto-poster: pro článek, který se dnes zveřejňuje (date === dnešek v Praze),
// vytvoří na firemní Facebook stránce NAPLÁNOVANÝ příspěvek na `dnešek + 3 dny`
// v 11:30 (Europe/Prague). Text bere z pole `fbPost`, odkaz z URL článku.
//
// Spouští se denně z GitHub Actions (.github/workflows/fb-schedule.yml).
// Naplánování 3 dny dopředu obchází 4týdenní limit ručního plánování a přesný
// čas 11:30 pohlídá sám Facebook. Naplánovaný post je vidět (a jde upravit/zrušit)
// v Meta Business Suite.
//
// Env:
//   FB_PAGE_ID            – ID firemní FB stránky
//   FB_PAGE_ACCESS_TOKEN  – Page/System User token s pages_manage_posts
//   TZ=Europe/Prague      – nastaveno ve workflow, kvůli výpočtu 11:30 a "dneška"
//   FB_DRY_RUN=1          – jen vypíše, co by naplánoval, nic neodešle (token netřeba)

import { readFileSync } from 'node:fs';

const GRAPH = 'https://graph.facebook.com/v21.0';
const BASE_URL = 'https://izodiamant.cz';
const OFFSET_DAYS = 3;
const HOUR = 11;
const MINUTE = 30;

const PAGE_ID = process.env.FB_PAGE_ID;
const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const DRY = process.env.FB_DRY_RUN === '1';

if (!DRY && (!PAGE_ID || !TOKEN)) {
  console.log('FB_PAGE_ID / FB_PAGE_ACCESS_TOKEN nejsou nastavené – přeskakuji plánování FB postů.');
  process.exit(0);
}

const articles = JSON.parse(
  readFileSync(new URL('../src/data/articles.json', import.meta.url), 'utf8'),
);

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();
const d = now.getDate();
const pad = (n) => String(n).padStart(2, '0');
const todayStr = `${y}-${pad(m + 1)}-${pad(d)}`;

const due = articles.filter((a) => a.date === todayStr);
if (due.length === 0) {
  console.log(`Dnes (${todayStr}) se nezveřejňuje žádný článek – nic k naplánování.`);
  process.exit(0);
}

// Cílový čas = dnešek + OFFSET_DAYS v 11:30 místního času (TZ=Europe/Prague).
// new Date(y, m, d+3, 11, 30) se interpretuje v místní TZ, getTime() dá správný
// UTC epoch i přes letní/zimní čas.
const sched = new Date(y, m, d + OFFSET_DAYS, HOUR, MINUTE, 0, 0);
const scheduledUnix = Math.floor(sched.getTime() / 1000);

// Dedup: načteme už naplánované posty a přeskočíme ty, které daný odkaz už mají
// (aby opakované spuštění workflow nevytvořilo duplicitu).
let existingMessages = [];
if (!DRY) {
  try {
    const res = await fetch(
      `${GRAPH}/${PAGE_ID}/scheduled_posts?fields=message&limit=100&access_token=${encodeURIComponent(TOKEN)}`,
    );
    const json = await res.json();
    if (Array.isArray(json.data)) existingMessages = json.data.map((p) => p.message || '');
    else if (json.error) console.log('Varování: čtení scheduled_posts:', JSON.stringify(json.error));
  } catch (e) {
    console.log('Varování: nepodařilo se načíst existující naplánované posty (pokračuji):', e.message);
  }
}

let failed = 0;
let scheduled = 0;
for (const a of due) {
  const url = `${BASE_URL}/clanky/${a.slug}`;

  if (existingMessages.some((msg) => msg.includes(url))) {
    console.log(`Přeskakuji ${a.slug} – naplánovaný post s tímto odkazem už existuje.`);
    continue;
  }

  if (DRY) {
    console.log(`[DRY-RUN] ${a.slug} → ${sched.toString()}\n---\n${a.fbPost}\n---`);
    scheduled++;
    continue;
  }

  const body = new URLSearchParams({
    message: a.fbPost,
    link: url,
    published: 'false',
    scheduled_publish_time: String(scheduledUnix),
    access_token: TOKEN,
  });

  const res = await fetch(`${GRAPH}/${PAGE_ID}/feed`, { method: 'POST', body });
  const json = await res.json();
  if (!res.ok || json.error) {
    console.error(`CHYBA při plánování ${a.slug}:`, JSON.stringify(json.error || json));
    failed++;
  } else {
    console.log(`Naplánováno: ${a.slug} → ${sched.toISOString()} (post id ${json.id})`);
    scheduled++;
  }
}

console.log(`Hotovo: naplánováno ${scheduled}, chyb ${failed}.`);
process.exit(failed ? 1 : 0);
