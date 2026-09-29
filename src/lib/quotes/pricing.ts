// Ceník služeb po krajích a výpočet dopravy. Sdílí ho admin (/sprava/nabidky),
// quotes-worker i web (kalkulačka, rozmezí cen) – proto bez aliasů `@/` a bez
// Next.js / Cloudflare runtime (viz model.ts).
//
// Zdroj pravdy je nastavení v D1 (tabulka settings, klíč PRICING_KEY), které se
// edituje v adminu – včetně „výchozího nastavení“ pro nepoznaný kraj.
// src/data/pricing.json je jen dočasná záloha, dokud v D1 nic není (lokálně, nová
// DB); po doladění ceníku se má odstranit. Veřejný web ceny odsud nebere (drží se
// calculator.json).

import defaults from '../../data/pricing.json';
import { TECHNOLOGIES, type TechnologyId } from './model';

export const PRICING_KEY = 'pricing';

export const REGIONS = [
  { id: 'praha', name: 'Hlavní město Praha' },
  { id: 'stredocesky', name: 'Středočeský kraj' },
  { id: 'jihocesky', name: 'Jihočeský kraj' },
  { id: 'plzensky', name: 'Plzeňský kraj' },
  { id: 'karlovarsky', name: 'Karlovarský kraj' },
  { id: 'ustecky', name: 'Ústecký kraj' },
  { id: 'liberecky', name: 'Liberecký kraj' },
  { id: 'kralovehradecky', name: 'Královéhradecký kraj' },
  { id: 'pardubicky', name: 'Pardubický kraj' },
  { id: 'vysocina', name: 'Kraj Vysočina' },
  { id: 'jihomoravsky', name: 'Jihomoravský kraj' },
  { id: 'olomoucky', name: 'Olomoucký kraj' },
  { id: 'zlinsky', name: 'Zlínský kraj' },
  { id: 'moravskoslezsky', name: 'Moravskoslezský kraj' },
] as const;

export type RegionId = (typeof REGIONS)[number]['id'];

/** Popisek „výchozího nastavení“ – platí, když se kraj z adresy nepozná. */
export const DEFAULT_REGION_LABEL = 'Výchozí nastavení';

export type Power = '230' | '400' | null;

export interface ServiceSettings {
  /** Výchozí cena za m² řezné plochy (kraj ji může přepsat). */
  price: number;
  /** Kolik m² řezné plochy se touto technologií udělá za jeden pracovní den. */
  m2PerDay: number;
  /** Potřebuje na místě vodu. */
  water: boolean;
  /** Potřebná elektřina. */
  power: Power;
}

export interface TransportSettings {
  /** Kč za km jízdy (počítá se tam i zpět). */
  kmRate: number;
  /** Výchozí cestovné na jeden pracovní den (ubytování, stravné). */
  dayRate: number;
  /** Vzdálenost pro výchozí nastavení (kraj nepoznaný); null = zadat ručně. */
  distanceKm: number | null;
}

export interface RegionSettings {
  /** Ceny, které kraj přepisuje; chybějící technologie = výchozí cena služby. */
  prices: Partial<Record<TechnologyId, number>>;
  /** Orientační vzdálenost z Mokré Lhoty (jedna cesta, km). */
  distanceKm: number | null;
  /** Vlastní cestovné na den; null = výchozí. */
  dayRate: number | null;
}

export interface Pricing {
  services: Record<TechnologyId, ServiceSettings>;
  transport: TransportSettings;
  regions: Record<RegionId, RegionSettings>;
}

/**
 * Sazby dopravy uložené u nabídky v okamžiku výpočtu (quotes.transport_calc).
 * Pozdější změna ceníku tak nepřepíše cenu už vystavené nabídky.
 */
export interface TransportCalc {
  kmRate: number;
  dayRate: number;
  m2PerDay: Record<TechnologyId, number>;
}

export function isRegion(id: unknown): id is RegionId {
  return REGIONS.some((r) => r.id === id);
}

export function regionName(id: string | null | undefined): string {
  return REGIONS.find((r) => r.id === id)?.name ?? DEFAULT_REGION_LABEL;
}

function num(v: unknown, min: number, max: number): number | null {
  if (typeof v === 'string' && !v.trim()) return null;
  const n = typeof v === 'string' ? Number(v.replace(/\s/g, '').replace(',', '.')) : v;
  return typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max ? n : null;
}

/** Přečte (a ověří) nastavení; co chybí nebo je neplatné, doplní z výchozího. */
export function parsePricing(raw: unknown, base: Pricing = DEFAULT_PRICING): Pricing {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const services = (src.services ?? {}) as Record<string, Record<string, unknown> | undefined>;
  const transport = (src.transport ?? {}) as Record<string, unknown>;
  const regions = (src.regions ?? {}) as Record<string, Record<string, unknown> | undefined>;

  const out = {
    services: {},
    transport: {
      kmRate: num(transport.kmRate, 0, 1000) ?? base.transport.kmRate,
      dayRate: num(transport.dayRate, 0, 1_000_000) ?? base.transport.dayRate,
      distanceKm: 'distanceKm' in transport ? num(transport.distanceKm, 0, 3000) : base.transport.distanceKm,
    },
    regions: {},
  } as Pricing;

  for (const { id } of TECHNOLOGIES) {
    const s = services[id] ?? {};
    const b = base.services[id];
    out.services[id] = {
      price: Math.round(num(s.price, 0, 1_000_000) ?? b.price),
      m2PerDay: num(s.m2PerDay, 0.1, 1000) ?? b.m2PerDay,
      water: typeof s.water === 'boolean' ? s.water : b.water,
      power: s.power === '230' || s.power === '400' || s.power === null ? s.power : b.power,
    };
  }
  for (const { id } of REGIONS) {
    const r = regions[id];
    const b = base.regions[id];
    const prices: Partial<Record<TechnologyId, number>> = {};
    const rawPrices = (r ? r.prices : b.prices) as Record<string, unknown> | undefined;
    for (const { id: tech } of TECHNOLOGIES) {
      const p = num(rawPrices?.[tech], 0, 1_000_000);
      if (p !== null) prices[tech] = Math.round(p);
    }
    out.regions[id] = {
      prices,
      distanceKm: r ? num(r.distanceKm, 0, 3000) : b.distanceKm,
      dayRate: r ? num(r.dayRate, 0, 1_000_000) : b.dayRate,
    };
  }
  return out;
}

// Výchozí stav z JSON (base = sám sebe: JSON je úplný, parse ho jen otypuje).
export const DEFAULT_PRICING: Pricing = parsePricing(defaults, defaults as unknown as Pricing);

/** Minimální rozhraní D1, ať se dá použít v adminu i ve workeru. */
interface SettingsDb {
  prepare(query: string): { bind(...values: unknown[]): { first<T>(): Promise<T | null> } };
}

/** Ceník z D1; bez DB, bez záznamu nebo při chybě výchozí stav z pricing.json. */
export async function loadPricing(db: SettingsDb | null | undefined): Promise<Pricing> {
  if (!db) return DEFAULT_PRICING;
  try {
    const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind(PRICING_KEY).first<{ value: string }>();
    return row ? parsePricing(JSON.parse(row.value)) : DEFAULT_PRICING;
  } catch {
    // Tabulka settings ještě neexistuje (neaplikované schéma) – ceník z repozitáře.
    return DEFAULT_PRICING;
  }
}

/** Cena za m² pro technologii v kraji (kraj bez vlastní ceny → výchozí cena služby). */
export function regionalPrice(pricing: Pricing, technology: TechnologyId, region: string | null | undefined): number {
  const override = isRegion(region) ? pricing.regions[region].prices[technology] : undefined;
  return override ?? pricing.services[technology].price;
}

/** Rozmezí cen služby napříč kraji i výchozím nastavením – to ukazuje web. */
export function priceRanges(pricing: Pricing): Record<TechnologyId, { min: number; max: number }> {
  const out = {} as Record<TechnologyId, { min: number; max: number }>;
  for (const { id } of TECHNOLOGIES) {
    const prices = [pricing.services[id].price, ...REGIONS.map((r) => pricing.regions[r.id].prices[id]).filter((p): p is number => p !== undefined)];
    out[id] = { min: Math.min(...prices), max: Math.max(...prices) };
  }
  return out;
}

/** Orientační vzdálenost pro kraj (jedna cesta), jinak z výchozího nastavení; null = zadat ručně. */
export function regionDistance(pricing: Pricing, region: string | null | undefined): number | null {
  return (isRegion(region) ? pricing.regions[region].distanceKm : null) ?? pricing.transport.distanceKm;
}

/** Sazby dopravy pro kraj – ukládají se k nabídce jako snímek. */
export function transportCalcFor(pricing: Pricing, region: string | null | undefined): TransportCalc {
  const dayRate = isRegion(region) ? pricing.regions[region].dayRate : null;
  return {
    kmRate: pricing.transport.kmRate,
    dayRate: dayRate ?? pricing.transport.dayRate,
    m2PerDay: Object.fromEntries(TECHNOLOGIES.map((t) => [t.id, pricing.services[t.id].m2PerDay])) as Record<TechnologyId, number>,
  };
}

export function parseTransportCalc(raw: string | null | undefined): TransportCalc | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    const kmRate = num(v.kmRate, 0, 1000);
    const dayRate = num(v.dayRate, 0, 1_000_000);
    const rates = (v.m2PerDay ?? {}) as Record<string, unknown>;
    if (kmRate === null || dayRate === null) return null;
    const m2PerDay = {} as Record<TechnologyId, number>;
    for (const { id } of TECHNOLOGIES) m2PerDay[id] = num(rates[id], 0.1, 1000) ?? DEFAULT_PRICING.services[id].m2PerDay;
    return { kmRate, dayRate, m2PerDay };
  } catch {
    return null;
  }
}

export interface TransportBreakdown {
  /** Pracovní dny potřebné na zakázku (plocha / denní výkon, zaokrouhleno nahoru). */
  days: number;
  /** Jízda tam a zpět. */
  travel: number;
  /** Cestovné za všechny pracovní dny. */
  stay: number;
  total: number;
}

/**
 * Doprava = 2 × km × Kč/km (jedna cesta tam a zpět) + pracovní dny × cestovné
 * na den. Dny: každá technologie má svůj denní výkon (m²/den); u kombinace se
 * časy sčítají, výsledek se zaokrouhlí nahoru na celé dny. Celkem na stokoruny nahoru.
 */
export function computeTransport(calc: TransportCalc, distanceKm: number, work: { technology: TechnologyId; area_m2: number }[]): TransportBreakdown {
  const rawDays = work.reduce((sum, w) => sum + (w.area_m2 > 0 ? w.area_m2 / calc.m2PerDay[w.technology] : 0), 0);
  // Drobné zaokrouhlovací zbytky (3,0000001 dne) nesmí přidat celý den.
  const days = rawDays > 0 ? Math.max(1, Math.ceil(rawDays - 1e-6)) : 0;
  const travel = days > 0 ? 2 * distanceKm * calc.kmRate : 0;
  const stay = days * calc.dayRate;
  return { days, travel, stay, total: Math.ceil((travel + stay) / 100) * 100 };
}

// ─── Podmínky na staveništi podle technologií ────────────────────────────────

export const ACCESS_CONDITION = 'Přístup ke zdivu z obou stran (dle zvolené technologie) zajistí zákazník.';

/** Technické podmínky do PDF: přístup + voda a elektřina podle použitých technologií. */
export function siteConditions(pricing: Pricing, technologies: TechnologyId[]): string[] {
  const used = [...new Set(technologies)].map((t) => pricing.services[t]);
  const lines = [ACCESS_CONDITION];
  if (used.some((s) => s.water)) lines.push('Zdroj vody v místě realizace zajistí zákazník.');
  const volts = [...new Set(used.map((s) => s.power).filter((p): p is '230' | '400' => p !== null))].sort();
  if (volts.length) lines.push(`Zdroj elektrické energie ${volts.map((v) => `${v} V`).join(' a ')} v místě realizace zajistí zákazník.`);
  return lines;
}

// ─── Kraj podle adresy ───────────────────────────────────────────────────────

/** PSČ (první tři číslice, rozsahy včetně) → kraj. Odhad – člověk ho v editoru potvrdí. */
const PSC_RANGES: [number, number, RegionId][] = [
  [100, 199, 'praha'],
  [250, 299, 'stredocesky'],
  [300, 349, 'plzensky'],
  [350, 364, 'karlovarsky'],
  [393, 396, 'vysocina'], // Pelhřimovsko
  [370, 399, 'jihocesky'],
  [400, 441, 'ustecky'],
  [460, 473, 'liberecky'],
  [511, 514, 'liberecky'], // Semilsko, Turnov
  [500, 519, 'kralovehradecky'],
  [530, 539, 'pardubicky'],
  [541, 552, 'kralovehradecky'],
  [560, 572, 'pardubicky'],
  [580, 595, 'vysocina'],
  [674, 676, 'vysocina'], // Třebíčsko
  [686, 688, 'zlinsky'], // Uherskohradišťsko
  [600, 699, 'jihomoravsky'],
  [700, 749, 'moravskoslezsky'],
  [750, 754, 'olomoucky'],
  [755, 769, 'zlinsky'],
  [791, 795, 'moravskoslezsky'], // Bruntálsko
  [770, 799, 'olomoucky'],
];

/** Okresní a větší města → kraj (když v adrese chybí PSČ). */
const TOWNS: Record<RegionId, string[]> = {
  praha: ['Praha'],
  stredocesky: ['Benešov', 'Beroun', 'Kladno', 'Kolín', 'Kutná Hora', 'Mělník', 'Mladá Boleslav', 'Nymburk', 'Poděbrady', 'Příbram', 'Rakovník', 'Slaný', 'Čáslav', 'Brandýs nad Labem', 'Říčany', 'Černošice'],
  jihocesky: ['České Budějovice', 'Český Krumlov', 'Jindřichův Hradec', 'Písek', 'Prachatice', 'Strakonice', 'Tábor', 'Třeboň'],
  plzensky: ['Plzeň', 'Domažlice', 'Klatovy', 'Rokycany', 'Tachov', 'Sušice'],
  karlovarsky: ['Karlovy Vary', 'Cheb', 'Sokolov', 'Mariánské Lázně', 'Ostrov'],
  ustecky: ['Ústí nad Labem', 'Děčín', 'Chomutov', 'Litoměřice', 'Louny', 'Most', 'Teplice', 'Žatec', 'Roudnice nad Labem'],
  liberecky: ['Liberec', 'Česká Lípa', 'Jablonec nad Nisou', 'Semily', 'Turnov'],
  kralovehradecky: ['Hradec Králové', 'Jičín', 'Náchod', 'Rychnov nad Kněžnou', 'Trutnov', 'Dvůr Králové nad Labem', 'Jaroměř', 'Nové Město nad Metují'],
  pardubicky: ['Pardubice', 'Chrudim', 'Svitavy', 'Ústí nad Orlicí', 'Polička', 'Litomyšl', 'Vysoké Mýto', 'Hlinsko', 'Skuteč', 'Česká Třebová', 'Lanškroun', 'Moravská Třebová', 'Nové Hrady', 'Holice', 'Přelouč'],
  vysocina: ['Jihlava', 'Havlíčkův Brod', 'Pelhřimov', 'Třebíč', 'Žďár nad Sázavou', 'Humpolec', 'Chotěboř', 'Nové Město na Moravě', 'Velké Meziříčí'],
  jihomoravsky: ['Brno', 'Blansko', 'Břeclav', 'Hodonín', 'Vyškov', 'Znojmo', 'Boskovice', 'Kyjov', 'Mikulov'],
  olomoucky: ['Olomouc', 'Jeseník', 'Prostějov', 'Přerov', 'Šumperk', 'Zábřeh', 'Hranice', 'Litovel', 'Uničov', 'Šternberk'],
  zlinsky: ['Zlín', 'Kroměříž', 'Uherské Hradiště', 'Vsetín', 'Uherský Brod', 'Rožnov pod Radhoštěm', 'Valašské Meziříčí', 'Otrokovice', 'Holešov'],
  moravskoslezsky: ['Ostrava', 'Bruntál', 'Frýdek-Místek', 'Karviná', 'Nový Jičín', 'Opava', 'Havířov', 'Třinec', 'Krnov', 'Kopřivnice', 'Český Těšín'],
};

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// Delší názvy první, ať „Nový Jičín“ nevyhraje „Jičín“ a „Ústí nad Orlicí“ „Ústí nad Labem“.
const TOWN_INDEX = (Object.entries(TOWNS) as [RegionId, string[]][])
  .flatMap(([region, towns]) => towns.map((t) => ({ region, town: norm(t) })))
  .sort((a, b) => b.town.length - a.town.length);

function regionFromPsc(text: string): RegionId | null {
  for (const m of text.matchAll(/(?<!\d)(\d{3})\s?(\d{2})(?!\d)/g)) {
    const prefix = Number(m[1]);
    const hit = PSC_RANGES.find(([from, to]) => prefix >= from && prefix <= to);
    if (hit) return hit[2];
  }
  return null;
}

/**
 * Kraj zakázky z adresy a obce: 1) PSČ, 2) obec je známé město, 3) známé město
 * nebo název kraje v adrese. null = nepoznáno → výchozí nastavení.
 */
export function detectRegion(address: string | null | undefined, city: string | null | undefined): RegionId | null {
  const text = [address, city].filter(Boolean).join(', ');
  if (!text.trim()) return null;
  const byPsc = regionFromPsc(text);
  if (byPsc) return byPsc;

  const cityNorm = norm(city ?? '');
  const exact = cityNorm ? TOWN_INDEX.find((t) => t.town === cityNorm) : undefined;
  if (exact) return exact.region;

  const padded = ` ${norm(text)} `;
  const inText = TOWN_INDEX.find((t) => padded.includes(` ${t.town} `));
  if (inText) return inText.region;
  const byName = REGIONS.find((r) => padded.includes(` ${norm(r.name.replace(/ kraj$|^Kraj |^Hlavní město /g, ''))} `));
  return byName?.id ?? null;
}
