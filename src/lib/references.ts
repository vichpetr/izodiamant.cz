import referencesData from '@/data/references.json';

export interface ReferenceProject {
  id: string;
  title: string;
  location: string;
  /** „RRRR-MM“ */
  date: string;
  /**
   * „stavba“ = obecná stavební zakázka (plot, dlažba, fasáda),
   * „rezani“ = řezání betonu a konstrukcí (skruže, podstavce, prostupy).
   * Ani jedno není sanace zdiva; bez pole = „sanace“.
   */
  category?: 'sanace' | 'stavba' | 'rezani';
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

/**
 * Meta description detailu reference.
 *
 * Bing Webmaster Tools hlásil „Meta descriptions on many of your pages are too
 * short“ – původní vzorec „Sanace zdiva: [Titulek]. [Lokalita]. [slogan]“ dával
 * jen ~60–80 znaků. Skládáme proto ještě technologii, rozsah a délku realizace
 * a cílíme na 130–160 znaků, aby se popis nezkracoval ve výsledcích hledání.
 *
 * Vzorec z GEMINI.md zůstává zachovaný: prefix „Sanace zdiva: “, titulek,
 * lokalita a povinná brand promise na konci (viz CLAUDE.md → SEO conventions).
 */
const META_DESCRIPTION_MAX = 160;
const BRAND_PROMISE = 'Vracíme zdraví vaší stavbě.';

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export function referenceMetaDescription(project: ReferenceProject): string {
  const isStavba = project.category === 'stavba';
  const isRezani = project.category === 'rezani';
  const isSanace = !isStavba && !isRezani;
  // U nesanačních zakázek (stavba, řezání betonu) by prefix „Sanace zdiva“ byl
  // zavádějící; u titulků, které už slovem „Sanace“ začínají, by se zdvojil
  // („Sanace zdiva: Sanace zdiva, Dalečín“).
  const prefix = isSanace && !/^sanace/i.test(project.title) ? 'Sanace zdiva: ' : '';
  const location = project.title.includes(project.location) ? '' : `. ${project.location}`;
  let description = `${prefix}${project.title}${location}.`;

  const tech = project.technology;
  const scope = lowerFirst(project.scope);
  const duration = lowerFirst(project.duration);
  // Varianty od nejdelší po nejkratší – vezmeme první, která se vejde do limitu.
  const details = [
    `${tech}: ${scope}, ${duration}.`,
    `${tech}: ${scope}.`,
    `${tech}, ${duration}.`,
    `${tech}.`,
  ];
  const tails = isStavba
    ? ['Stavební a zednické práce na klíč.', 'Zednické práce na klíč.']
    : isRezani
    ? ['Řezání betonu bez otřesů a bez prachu.', 'Řezání betonu diamantovým lanem.']
    : [
        'Dodatečná izolace proti vzlínající vlhkosti.',
        'Izolace proti vzlínající vlhkosti.',
        'Sanace vlhkého zdiva na klíč.',
      ];

  const fits = (part: string) =>
    `${description} ${part} ${BRAND_PROMISE}`.length <= META_DESCRIPTION_MAX;

  const detail = details.find(fits);
  if (detail) description += ` ${detail}`;
  const tail = tails.find(fits);
  if (tail) description += ` ${tail}`;

  return `${description} ${BRAND_PROMISE}`;
}
