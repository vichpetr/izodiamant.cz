import articlesData from '@/data/articles.json';

export interface Article {
  /** URL slug – stránka žije na /clanky/<slug>. */
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  /** „RRRR-MM-DD“ – datum zveřejnění. Do té doby je článek jen jako náhled. */
  date: string;
  /** Text připraveného Facebook postu (k překopírování ve /sprava). */
  fbPost: string;
}

/** Všechny články seřazené od nejnovějšího (i nezveřejněné – pro /sprava a náhled). */
export const allArticles: Article[] = [...(articlesData as Article[])].sort(
  (a, b) => b.date.localeCompare(a.date),
);

/**
 * Je článek k datu buildu zveřejněný? Datum se vyhodnocuje při buildu (SSG),
 * takže naplánovaný článek „naskočí“ až po rebuildu v den zveřejnění – o ten se
 * stará týdenní automatický rebuild (viz .github/workflows/scheduled-rebuild.yml).
 */
export function isArticlePublished(article: Pick<Article, 'date'>): boolean {
  return new Date(article.date + 'T00:00:00') <= new Date();
}

export function isSlugPublished(slug: string): boolean {
  const a = allArticles.find((x) => x.slug === slug);
  return !!a && isArticlePublished(a);
}

/** Veřejně zveřejněné články (pro homepage, přehled /clanky a sitemapu). */
export const publishedArticles: Article[] = allArticles.filter(isArticlePublished);

const MONTHS = [
  'ledna', 'února', 'března', 'dubna', 'května', 'června',
  'července', 'srpna', 'září', 'října', 'listopadu', 'prosince',
];

/** „16. srpna 2026“; při neúplném datu spadne na rok. */
export function formatArticleDate(date: string): string {
  const [y, m, d] = date.split('-');
  const mi = parseInt(m ?? '', 10) - 1;
  if (!d || Number.isNaN(mi) || mi < 0 || mi > 11) return y ?? date;
  return `${parseInt(d, 10)}. ${MONTHS[mi]} ${y}`;
}
