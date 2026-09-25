// Výpočty a formátování nabídek. Ceny počítá výhradně tenhle kód – AI do čísel
// nesahá (jen navrhuje rozměry, které člověk potvrdí).

import calculatorData from '../../data/calculator.json';
import { technologyLabel, type Quote, type QuoteItem, type TechnologyId } from './model';

/** Tloušťka zdiva, od které řetězová pila nestačí a nasazuje se diamantové lano. */
export const LANO_THICKNESS_CM = 50;

/**
 * Navržená technologie podle materiálu a tloušťky: kámen, smíšené zdivo a beton
 * jdou vždy lanem, cihla pilou – ale od {@link LANO_THICKNESS_CM} i u cihly na
 * lano (pila tak silnou zeď neprořízne). Jen návrh, uživatel ho může přepsat.
 */
export function recommendedTechnology(material: string | null, thicknessCm: number | null): TechnologyId {
  if (material === 'kamen' || material === 'beton') return 'diamantove-lano';
  if (thicknessCm !== null && thicknessCm >= LANO_THICKNESS_CM) return 'diamantove-lano';
  return 'retezova-pila';
}

/**
 * Předvyplněná cena za m²: střed ceníkového rozpětí z calculator.json (stejná data
 * jako kalkulačka na webu), zaokrouhlený na stovky. Když technologie pro daný
 * materiál v ceníku není, vezme se rozpětí napříč všemi materiály.
 */
export function suggestedPricePerM2(technology: TechnologyId, material: string | null): number {
  const forMaterial = calculatorData
    .find((m) => m.id === material)
    ?.availableServices.find((s) => s.id === technology);
  const all = calculatorData.flatMap((m) => m.availableServices).filter((s) => s.id === technology);
  const min = forMaterial?.minPrice ?? Math.min(...all.map((s) => s.minPrice));
  const max = forMaterial?.maxPrice ?? Math.max(...all.map((s) => s.maxPrice));
  if (!Number.isFinite(min) || !Number.isFinite(max)) return 0;
  return Math.round((min + max) / 2 / 100) * 100;
}

export interface QuoteLine extends QuoteItem {
  workPrice: number;
}

export interface QuoteTotals {
  lines: QuoteLine[];
  /** Režim „kombinace“: práce všech položek + doprava. */
  workTotal: number;
  total: number;
  /** Režim „varianty“: každá položka je samostatná varianta včetně dopravy. */
  variantTotals: number[];
}

export function computeTotals(quote: Pick<Quote, 'mode' | 'transport_price'>, items: QuoteItem[]): QuoteTotals {
  const transport = Math.max(0, Math.round(quote.transport_price || 0));
  const lines = items.map((item) => {
    const area_m2 = itemArea(item);
    return { ...item, area_m2, workPrice: Math.round(area_m2 * item.price_per_m2) };
  });
  const workTotal = lines.reduce((sum, l) => sum + l.workPrice, 0);
  return {
    lines,
    workTotal,
    total: workTotal + transport,
    variantTotals: lines.map((l) => l.workPrice + transport),
  };
}

/**
 * U variant si klient vybírá jednu technologii – každá tam smí být jen jednou
 * (dvakrát pila s různou cenou nedává smysl). U kombinace se opakovat může:
 * po obvodu bývá různé zdivo, a tak i různá cena téže technologie.
 */
export function duplicateVariantTechnologies(mode: Quote['mode'], items: Pick<QuoteItem, 'technology'>[]): TechnologyId[] {
  if (mode !== 'varianty') return [];
  const seen = new Set<TechnologyId>();
  const dupes = new Set<TechnologyId>();
  for (const { technology } of items) (seen.has(technology) ? dupes : seen).add(technology);
  return [...dupes];
}

/** Chybová hláška pro opakovanou technologii ve variantách, jinak null. */
export function variantsError(mode: Quote['mode'], items: Pick<QuoteItem, 'technology'>[]): string | null {
  const dupes = duplicateVariantTechnologies(mode, items);
  if (dupes.length === 0) return null;
  return `U variant může být každá technologie jen jednou (${dupes.map(technologyLabel).join(', ')} je tam víckrát). Nechte jednu položku, nebo přepněte na Kombinaci.`;
}

/** Řezná plocha = délka × tloušťka (stejně jako kalkulačka, viz src/lib/pricing.ts). */
export function cutArea(lengthM: number | null | undefined, thicknessCm: number | null | undefined): number | null {
  if (!lengthM || !thicknessCm) return null;
  return Math.round(lengthM * (thicknessCm / 100) * 100) / 100;
}

/**
 * Plocha položky pro cenu. Ceník je za m² ŘEZNÉ plochy (délka zdi × tloušťka),
 * ne za běžný metr ani za plochu podlahy – proto se plocha z délky a tloušťky
 * vždy dopočítá a ručně zadaná m² platí jen tam, kde rozměry chybí.
 */
export function itemArea(item: Pick<QuoteItem, 'length_m' | 'thickness_cm' | 'area_m2'>): number {
  return cutArea(item.length_m, item.thickness_cm) ?? item.area_m2;
}

/** Cena za běžný metr zdi (pro kontrolu – ceníkem je cena za m² řezné plochy). */
export function pricePerMeter(pricePerM2: number, thicknessCm: number | null | undefined): number | null {
  return thicknessCm ? Math.round(pricePerM2 * (thicknessCm / 100)) : null;
}

const NBSP = ' ';

/** 67500 → „67 500“ (nezlomitelná mezera, desetinná čárka). Bez Intl, ať sedí i ve workeru. */
export function formatNumber(value: number, maxDecimals = 2): string {
  const factor = 10 ** maxDecimals;
  const rounded = Math.round(value * factor) / factor;
  const [int, dec] = Math.abs(rounded).toString().split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${rounded < 0 ? '-' : ''}${grouped}${dec ? `,${dec}` : ''}`;
}

export function formatCzk(value: number): string {
  return `${formatNumber(Math.round(value), 0)}${NBSP}Kč`;
}

export function formatArea(value: number): string {
  return `${formatNumber(value)}${NBSP}m²`;
}

/** Datum ve formátu „6. 9. 2026“ (časová zóna Praha). */
export function formatDateCz(date: Date): string {
  const [y, m, d] = pragueDateParts(date);
  return `${d}. ${m}. ${y}`;
}

function pragueDateParts(date: Date): [number, number, number] {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Prague',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return [get('year'), get('month'), get('day')];
}

/** Prefix čísla nabídek jednoho dne: NAB-20260924 (datum v pražském čase). */
export function quoteDayPrefix(date: Date): string {
  const [y, m, d] = pragueDateParts(date);
  return `NAB-${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
}

/**
 * Číslo nabídky: NAB-20260924-02-POL = druhá nabídka dne, obec Polička.
 * Přípona obce jen když je obec vyplněná (dřív se doplňovalo „XXX“).
 */
export function quoteNumber(date: Date, seq: number, city: string | null): string {
  const letters = (city || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 3)
    .toUpperCase();
  const base = `${quoteDayPrefix(date)}-${String(seq).padStart(2, '0')}`;
  return letters ? `${base}-${letters}` : base;
}

/**
 * Pořadí nabídky v rámci dne podle čísel, která už ten den existují. Počítá i
 * se starým formátem (NAB-20260922-POL, NAB-20260922-POL-2), který pořadí neměl.
 */
export function nextDaySequence(prefix: string, existing: string[]): number {
  let max = 0;
  for (const number of existing) {
    if (!number.startsWith(`${prefix}-`)) continue;
    const seq = /^\d{2}$/.test(number.slice(prefix.length + 1, prefix.length + 3)) ? Number(number.slice(prefix.length + 1, prefix.length + 3)) : 0;
    max = Math.max(max, seq);
  }
  return Math.max(max, existing.filter((n) => n.startsWith(`${prefix}-`)).length) + 1;
}

/**
 * Otisk vstupů, ze kterých vzniká PDF (a vyplněný výkaz). Když se od poslední
 * verze nezměnil, nová verze nevznikne. `attachments` = id výkazů, které se
 * přikládají k e-mailu. Pořadí klíčů je pevné, ať se otisk nemění náhodou.
 */
export type FingerprintFields = Pick<
  Quote,
  'client_name' | 'client_email' | 'client_phone' | 'site_name' | 'site_address' | 'city' | 'material' | 'thickness_cm' | 'length_m' | 'mode' | 'transport_price' | 'intro' | 'conditions'
>;

/** Zvýšit, když se změní, co z týchž údajů vzniká (např. výkaz po variantách) – vznikne nová verze. */
const FINGERPRINT_VERSION = 3;

export function quoteFingerprint(quote: FingerprintFields, items: QuoteItem[], attachments: number[] = []): string {
  return JSON.stringify([
    FINGERPRINT_VERSION,
    quote.client_name,
    quote.client_email,
    quote.client_phone,
    quote.site_name,
    quote.site_address,
    quote.city,
    quote.material,
    quote.thickness_cm,
    quote.length_m,
    quote.mode,
    quote.transport_price,
    quote.intro,
    quote.conditions,
    items.map((i) => [i.technology, i.length_m ?? null, i.thickness_cm ?? null, itemArea(i), i.price_per_m2]),
    [...attachments].sort((a, b) => a - b),
  ]);
}

/** SHA-256 otisku (hex) – ukládá se k verzi PDF. Web Crypto je v prohlížeči, edge i workeru. */
export async function fingerprintHash(quote: FingerprintFields, items: QuoteItem[], attachments: number[] = []): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(quoteFingerprint(quote, items, attachments)));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Co ještě chybí k vystavení nabídky (u nabídek z e-mailu). Jen informativní –
 * řídí stav „čeká na údaje“, generování PDF to neblokuje (to hlídá worker).
 */
export function missingInputs(
  quote: Pick<Quote, 'client_name' | 'client_email' | 'client_phone' | 'site_address' | 'city' | 'transport_price'>,
  items: QuoteItem[],
): string[] {
  const missing: string[] = [];
  if (!quote.client_name?.trim()) missing.push('jméno klienta');
  if (!quote.client_email && !quote.client_phone) missing.push('kontakt (e-mail nebo telefon)');
  if (!quote.site_address && !quote.city) missing.push('místo realizace');
  if (items.length === 0) missing.push('technologie a plocha (m²)');
  else if (items.some((i) => !(itemArea(i) > 0))) missing.push('délka a tloušťka u všech položek');
  if (!(quote.transport_price > 0)) missing.push('cena dopravy');
  return missing;
}
