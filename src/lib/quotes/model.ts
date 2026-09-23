// Doménový model cenových nabídek – sdílí ho admin (/sprava/nabidky) i
// quotes-worker (PDF, AI, schránka). Proto tu nesmí být importy přes alias `@/`
// ani nic z Next.js / Cloudflare runtime: worker tenhle soubor bundluje přes
// relativní cestu.

import calculatorData from '../../data/calculator.json';

export const TECHNOLOGIES = [
  { id: 'retezova-pila', label: 'Řetězová pila', tagline: 'Rychlá a úsporná varianta pro zdivo s průběžnou spárou' },
  { id: 'diamantove-lano', label: 'Diamantové lano', tagline: 'Pro kámen, smíšené zdivo a beton, kde pila nestačí' },
  { id: 'chemicka-injektaz', label: 'Chemická injektáž', tagline: 'Bez řezání – vhodná i tam, kde zdivo nelze podřezat' },
] as const;

export type TechnologyId = (typeof TECHNOLOGIES)[number]['id'];

export const MATERIALS = [
  ...calculatorData.map((m) => ({ id: m.id, label: m.label })),
  { id: 'jine', label: 'Jiné' },
];

export const QUOTE_STATUSES = {
  koncept: 'Koncept',
  ceka_na_udaje: 'Čeká na údaje',
  vygenerovano: 'PDF hotové',
  odeslano: 'Odesláno',
  prijato: 'Přijato',
  odmitnuto: 'Odmítnuto',
} as const;

export type QuoteStatus = keyof typeof QUOTE_STATUSES;
export type QuoteMode = 'kombinace' | 'varianty';

export const DEFAULT_CONDITIONS = [
  'Přístup ke zdivu z obou stran (dle zvolené technologie) zajistí zákazník.',
  'Zdroj vody v místě realizace zajistí zákazník.',
  'Zdroj elektrické energie 400 V v místě realizace zajistí zákazník.',
];

/** Kdo nabídku „zpracoval“ – zatím pevně (rozhodnutí majitele). */
export const QUOTE_AUTHOR = { name: 'Václav Ropek', company: 'IZODIAMANT – sanace zdiva' };

export const COMPANY = {
  ico: '74650726',
  address: 'Mokrá Lhota 26, 539 44 Nové Hrady',
  phone: '+420 737 017 012',
  email: 'info@izodiamant.cz',
  web: 'izodiamant.cz',
};

export interface Quote {
  id: number;
  number: string | null;
  customer_id: number | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  site_name: string | null;
  site_address: string | null;
  city: string | null;
  material: string | null;
  thickness_cm: number | null;
  length_m: number | null;
  mode: QuoteMode;
  transport_price: number;
  intro: string | null;
  conditions: string | null;
  note: string | null;
  status: QuoteStatus;
  missing: string | null;
  source: 'manual' | 'email';
  inbox_message_id: number | null;
  pdf_key: string | null;
  pdf_generated_at: string | null;
  email_subject: string | null;
  email_body: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export interface QuoteItem {
  id?: number;
  quote_id?: number;
  position: number;
  technology: TechnologyId;
  area_m2: number;
  price_per_m2: number;
}

export interface QuoteFile {
  id: number;
  quote_id: number;
  r2_key: string;
  filename: string;
  content_type: string;
  size: number;
  kind: 'plan' | 'priloha';
  analysis: string | null;
  created_at: string;
}

export interface QuoteMessage {
  id: number;
  quote_id: number;
  direction: 'out' | 'in';
  kind: 'draft' | 'sent' | 'reply';
  subject: string | null;
  counterpart: string | null;
  message_id: string | null;
  status: 'ok' | 'error';
  error: string | null;
  created_at: string;
  created_by: string | null;
}

/** Návrh rozměrů z AI (plánek nebo text e-mailu). Vždy jen návrh – potvrzuje člověk. */
export interface PlanAnalysis {
  lengthM: number | null;
  thicknessCm: number | null;
  areaM2: number | null;
  material: string | null;
  confidence: 'nizka' | 'stredni' | 'vysoka';
  reasoning: string;
}

export function technologyLabel(id: string): string {
  return TECHNOLOGIES.find((t) => t.id === id)?.label ?? id;
}

export function materialLabel(id: string | null): string {
  if (!id) return '';
  return MATERIALS.find((m) => m.id === id)?.label ?? id;
}

export function isTechnology(id: unknown): id is TechnologyId {
  return TECHNOLOGIES.some((t) => t.id === id);
}

export function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}
