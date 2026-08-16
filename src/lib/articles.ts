import articlesData from '@/data/articles.json';

export interface Article {
  /** URL slug – stránka žije na /clanky/<slug>. */
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  /** „RRRR-MM-DD“ */
  date: string;
}

/** Všechny články seřazené od nejnovějšího. */
export const allArticles: Article[] = [...(articlesData as Article[])].sort(
  (a, b) => b.date.localeCompare(a.date),
);

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
