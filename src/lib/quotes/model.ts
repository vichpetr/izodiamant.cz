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
  pripraveno: 'Připraveno k odeslání',
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
  /** Verze PDF, která se přiloží k e-mailu; null = vždy poslední. */
  email_version: number | null;
  /** JSON {pole: "odkud"} – u údajů, které doplnila AI (z e-mailu, z plánku…). */
  field_sources: string | null;
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
  relevance: Relevance | null;
  relevance_override: Relevance | null;
  relevance_reason: string | null;
  doc_kind: DocKind | null;
  include_in_email: number;
  created_at: string;
}

/** Jak moc příloha pomůže k nabídce – rozhoduje, jestli ji čte silný model. */
export type Relevance = 'vysoka' | 'stredni' | 'nizka' | 'zadna';
export const RELEVANCE_LABELS: Record<Relevance, string> = {
  vysoka: 'Vysoká',
  stredni: 'Střední',
  nizka: 'Nízká',
  zadna: 'Nerelevantní',
};
export const RELEVANCE_ORDER: Relevance[] = ['vysoka', 'stredni', 'nizka', 'zadna'];
/** Co se čte silným modelem automaticky. */
export const RELEVANT: Relevance[] = ['vysoka', 'stredni'];

export type DocKind = 'pudorys' | 'rez' | 'pohled' | 'situace' | 'foto' | 'vykaz' | 'logo' | 'jine';
export const DOC_KIND_LABELS: Record<DocKind, string> = {
  pudorys: 'Půdorys',
  rez: 'Řez',
  pohled: 'Pohled',
  situace: 'Situace',
  foto: 'Fotografie',
  vykaz: 'Výkaz výměr',
  logo: 'Logo / podpis',
  jine: 'Jiné',
};

/** Platná relevance souboru – ruční rozhodnutí má přednost před AI. */
export function effectiveRelevance(f: Pick<QuoteFile, 'relevance' | 'relevance_override'>): Relevance | null {
  return f.relevance_override ?? f.relevance;
}

export interface QuoteVersion {
  id: number;
  quote_id: number;
  version: number;
  pdf_key: string;
  /** Starší tvar: jeden vyplněný výkaz. Nově `vykaz_files`. */
  vykaz_key: string | null;
  /** JSON [{key, technology}] – u variant jeden vyplněný výkaz za každou technologii. */
  vykaz_files: string | null;
  input_hash: string;
  total_label: string | null;
  sent_at: string | null;
  created_at: string;
  created_by: string | null;
}

/** Rozbor výkazu výměr: které řádky jsou naše práce a kam patří cena. */
export interface VykazAnalysis {
  kind: 'vykaz';
  /** Jde vyplnit (xlsx). Starší .xls a .csv se jen čtou. */
  fillable: boolean;
  rows: {
    sheet: string;
    row: number;
    description: string;
    unit: string | null;
    quantity: number | null;
    technology: TechnologyId | null;
    /** Buňka pro jednotkovou cenu (např. "I113") – sem se zapíše naše cena. */
    unitPriceCell: string | null;
    /** Buňka s cenou celkem (vzorec zadavatele, jen pro informaci). */
    totalCell: string | null;
  }[];
  /** Pole „Vyplň údaj“ u zhotovitele (název, IČ, DIČ). */
  contractorCells: { sheet: string; cell: string; field: 'nazev' | 'ic' | 'dic' }[];
  lengthM: number | null;
  thicknessCm: number | null;
  areaM2: number | null;
  material: string | null;
  confidence: 'nizka' | 'stredni' | 'vysoka';
  reasoning: string;
  sources?: string[];
  /** Na co upozornit (DPH, nevyplnitelné řádky…). */
  warnings: string[];
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
  kind?: 'plan';
  lengthM: number | null;
  thicknessCm: number | null;
  areaM2: number | null;
  material: string | null;
  confidence: 'nizka' | 'stredni' | 'vysoka';
  reasoning: string;
  /** Stručně odkud se co vyčetlo – ať si uživatel návrh snadno ověří v náhledu. */
  sources?: string[];
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

/** Uložený výsledek práce AI nad souborem (quote_files.analysis). */
export type FileAnalysis = (PlanAnalysis | VykazAnalysis) & { error?: string; pending?: boolean; startedAt?: string };

export function parseFileAnalysis(raw: string | null): FileAnalysis | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FileAnalysis;
  } catch {
    return null;
  }
}

export function isVykaz(a: FileAnalysis | null): a is VykazAnalysis & { error?: string; pending?: boolean } {
  return a?.kind === 'vykaz';
}

/** Tabulky (výkaz výměr) poznáme podle typu i přípony – pošta je často posílá jako octet-stream. */
export const SPREADSHEET_TYPES: Record<string, string> = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  csv: 'text/csv',
};

export function isSpreadsheet(f: { content_type: string; filename: string }): boolean {
  return Object.values(SPREADSHEET_TYPES).includes(f.content_type) || /\.(xlsx|xls|csv)$/i.test(f.filename);
}

/**
 * Výkazy, které se vyplní spolu s PDF (xlsx s aspoň jedním nalezeným řádkem).
 * Vyplňují se vždy; jestli jdou k e-mailu, řídí až `include_in_email` (viz attachedVykazFiles).
 */
export function fillableVykazIds(files: Pick<QuoteFile, 'id' | 'analysis'>[]): number[] {
  return files
    .filter((f) => {
      const a = parseFileAnalysis(f.analysis);
      return isVykaz(a) && a.fillable && a.rows.length > 0;
    })
    .map((f) => f.id);
}

/** Název PDF v příloze e-mailu: první verze bez přípony, další s „-v2“ atd. */
export function versionFilename(number: string, version: number, ext = 'pdf'): string {
  return `${number}${version > 1 ? `-v${version}` : ''}.${ext}`;
}

export interface VersionVykaz {
  key: string;
  /** Technologie, jejíž ceny jsou ve výkazu (u variant); null = ceny všech položek. */
  technology: TechnologyId | null;
  /** Zdrojový výkaz (quote_files.id); null u starších verzí. */
  fileId: number | null;
}

/** Vyplněné výkazy k verzi (nový i starší tvar záznamu). */
export function versionVykazFiles(v: Pick<QuoteVersion, 'vykaz_key' | 'vykaz_files'>): VersionVykaz[] {
  if (v.vykaz_files) {
    try {
      const parsed: unknown = JSON.parse(v.vykaz_files);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((f): f is { key: string; technology?: unknown; fileId?: unknown } => typeof f?.key === 'string')
          .map((f) => ({
            key: f.key,
            technology: isTechnology(f.technology) ? f.technology : null,
            fileId: typeof f.fileId === 'number' ? f.fileId : null,
          }));
      }
    } catch {
      /* spadne na vykaz_key */
    }
  }
  return v.vykaz_key ? [{ key: v.vykaz_key, technology: null, fileId: null }] : [];
}

/** Vyplněné výkazy verze, které jdou k e-mailu – u zdrojového výkazu je zaškrtnuté „přiložit“. */
export function attachedVykazFiles(
  v: Pick<QuoteVersion, 'vykaz_key' | 'vykaz_files'>,
  files: Pick<QuoteFile, 'id' | 'include_in_email' | 'analysis'>[],
): VersionVykaz[] {
  // Starší verze nevědí, ze kterého výkazu vznikly – řídí se kterýmkoli zaškrtnutým výkazem.
  const anyIncluded = files.some((file) => file.include_in_email === 1 && fillableVykazIds([file]).length > 0);
  return versionVykazFiles(v).filter((f) =>
    f.fileId === null ? anyIncluded : files.find((file) => file.id === f.fileId)?.include_in_email === 1,
  );
}

const TECH_SLUG: Record<TechnologyId, string> = { 'retezova-pila': 'pila', 'diamantove-lano': 'lano', 'chemicka-injektaz': 'injektaz' };

/** Název vyplněného výkazu v e-mailu, např. vykaz-vymer-NAB-20260925-01-lano-v2.xlsx. */
export function vykazFilename(number: string, version: number, technology: TechnologyId | null): string {
  return versionFilename(`vykaz-vymer-${number}${technology ? `-${TECH_SLUG[technology]}` : ''}`, version, 'xlsx');
}
