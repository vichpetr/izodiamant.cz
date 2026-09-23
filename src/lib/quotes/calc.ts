// Výpočty a formátování nabídek. Ceny počítá výhradně tenhle kód – AI do čísel
// nesahá (jen navrhuje rozměry, které člověk potvrdí).

import calculatorData from '../../data/calculator.json';
import type { Quote, QuoteItem, TechnologyId } from './model';

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
  const lines = items.map((item) => ({ ...item, workPrice: Math.round(item.area_m2 * item.price_per_m2) }));
  const workTotal = lines.reduce((sum, l) => sum + l.workPrice, 0);
  return {
    lines,
    workTotal,
    total: workTotal + transport,
    variantTotals: lines.map((l) => l.workPrice + transport),
  };
}

/** Řezná plocha = délka × tloušťka (stejně jako kalkulačka, viz src/lib/pricing.ts). */
export function cutArea(lengthM: number | null, thicknessCm: number | null): number | null {
  if (!lengthM || !thicknessCm) return null;
  return Math.round(lengthM * (thicknessCm / 100) * 100) / 100;
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

/** Základ čísla nabídky: NAB-20260906-POL (3 písmena obce bez diakritiky). */
export function quoteNumberBase(date: Date, city: string | null): string {
  const [y, m, d] = pragueDateParts(date);
  const ymd = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
  const letters = (city || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 3)
    .toUpperCase();
  return `NAB-${ymd}-${letters.padEnd(3, 'X')}`;
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
  else if (items.some((i) => !(i.area_m2 > 0))) missing.push('plocha (m²) u všech položek');
  if (!(quote.transport_price > 0)) missing.push('cena dopravy');
  return missing;
}
