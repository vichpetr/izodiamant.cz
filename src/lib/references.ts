import referencesData from '@/data/references.json';

export interface ReferenceProject {
  id: string;
  title: string;
  location: string;
  /** „RRRR-MM“ */
  date: string;
  technology: string;
  scope: string;
  duration: string;
  description: string;
  features: string[];
  image: string;
  gallery?: string[];
  reviewId?: string;
}

/** Kolik referencí je na jedné stránce archivu (/reference, /reference/strana/N). */
export const REFERENCES_PER_PAGE = 6;

/** Všechny reference seřazené od nejnovější. */
export const allReferences: ReferenceProject[] = [...(referencesData as ReferenceProject[])].sort(
  (a, b) => b.date.localeCompare(a.date),
);

export const referencePageCount = Math.max(
  1,
  Math.ceil(allReferences.length / REFERENCES_PER_PAGE),
);

export function referencesForPage(page: number): ReferenceProject[] {
  const start = (page - 1) * REFERENCES_PER_PAGE;
  return allReferences.slice(start, start + REFERENCES_PER_PAGE);
}

/**
 * Stránka 1 žije na /reference (ne /reference/strana/1), aby existovala jediná
 * kanonická URL přehledu. `referencePagePath` je jediné místo, kde se to řeší –
 * odkazy, sitemap i generateStaticParams z něj vycházejí.
 */
export function referencePagePath(page: number): string {
  return page <= 1 ? '/reference' : `/reference/strana/${page}`;
}

/** Reference rozdělené do skupin po letech (pořadí zachováno = od nejnovější). */
export function groupByYear(items: ReferenceProject[]): { year: string; items: ReferenceProject[] }[] {
  const groups: { year: string; items: ReferenceProject[] }[] = [];
  for (const item of items) {
    const year = item.date.slice(0, 4);
    const last = groups[groups.length - 1];
    if (last && last.year === year) last.items.push(item);
    else groups.push({ year, items: [item] });
  }
  return groups;
}

/** Na které stránce archivu daný rok začíná (pro rychlou navigaci po letech). */
export function pageOfYear(year: string): number {
  const index = allReferences.findIndex((r) => r.date.startsWith(year));
  if (index < 0) return 1;
  return Math.floor(index / REFERENCES_PER_PAGE) + 1;
}

/** Roky, ve kterých máme realizace – od nejnovějšího. */
export const referenceYears: string[] = [...new Set(allReferences.map((r) => r.date.slice(0, 4)))];

const MONTHS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
];

/** „2025-04“ → „Duben 2025“ (bez tečky – hlídá test formátu datumů). */
export function formatReferenceDate(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  const name = MONTHS[parseInt(month, 10) - 1];
  return name ? `${name} ${year}` : dateStr;
}
