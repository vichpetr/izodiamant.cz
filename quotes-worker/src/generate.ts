// Vygenerování PDF nabídky (HTML šablona → Browser Rendering → R2) a návrh
// průvodního e-mailu. Čísla v PDF počítá computeTotals(), AI píše jen text e-mailu.
//
// Verze: každé vygenerování se změněnými vstupy (otisk v quote_versions.input_hash)
// založí novou verzi s vlastním PDF (nabidky/<číslo>-v<n>.pdf) a případně
// vyplněným výkazem výměr. Beze změny se nová verze nezakládá. K e-mailu se
// přikládá quotes.email_version, a když není zvolená, poslední verze.

import puppeteer from '@cloudflare/puppeteer';
import { computeTotals, variantsError, fingerprintHash, formatArea, formatCzk, nextDaySequence, quoteDayPrefix, quoteNumber } from '../../src/lib/quotes/calc';
import {
  QUOTE_AUTHOR,
  fillableVykazIds,
  isVykaz,
  parseFileAnalysis,
  technologyLabel,
  type Quote,
  type QuoteFile,
  type QuoteItem,
  type QuoteVersion,
  type TechnologyId,
  type VersionVykaz,
  versionVykazFiles,
} from '../../src/lib/quotes/model';
import { renderQuoteHtml } from '../../src/lib/quotes/template';
import { runJson, str } from './ai';
import { getItems, getQuote, updateQuote } from './db';
import { nowIso, type Env } from './env';
import { fillVykaz } from './vykaz';

export class UserError extends Error {}

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Číslo nabídky se přidělí při prvním PDF a hned se zapíše (UNIQUE) – dvě
 * souběžná generování tak nedostanou stejné pořadí dne.
 */
async function assignNumber(env: Env, quote: Quote): Promise<string> {
  if (quote.number) return quote.number;
  const now = new Date();
  const prefix = quoteDayPrefix(now);
  for (let attempt = 0; attempt < 5; attempt++) {
    const { results } = await env.DB.prepare('SELECT number FROM quotes WHERE number LIKE ?').bind(`${prefix}-%`).all<{ number: string }>();
    const number = quoteNumber(now, nextDaySequence(prefix, results.map((r) => r.number)) + attempt, quote.city);
    try {
      const res = await env.DB.prepare('UPDATE quotes SET number = ? WHERE id = ? AND number IS NULL').bind(number, quote.id).run();
      if ((res.meta.changes ?? 0) > 0) return number;
      const current = await getQuote(env, quote.id);
      if (current?.number) return current.number;
    } catch (err) {
      if (!/UNIQUE/i.test(err instanceof Error ? err.message : String(err))) throw err;
    }
  }
  throw new Error('Nepodařilo se přidělit číslo nabídky.');
}

export async function renderPdf(env: Env, html: string): Promise<ArrayBuffer> {
  const browser = await puppeteer.launch(env.BROWSER);
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30_000 });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
    return pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
  } finally {
    await browser.close();
  }
}

export async function getVersions(env: Env, quoteId: number): Promise<QuoteVersion[]> {
  const { results } = await env.DB.prepare('SELECT * FROM quote_versions WHERE quote_id = ? ORDER BY version DESC').bind(quoteId).all<QuoteVersion>();
  return results;
}

async function getFiles(env: Env, quoteId: number): Promise<QuoteFile[]> {
  const { results } = await env.DB.prepare('SELECT * FROM quote_files WHERE quote_id = ? ORDER BY created_at').bind(quoteId).all<QuoteFile>();
  return results;
}

function totalLabel(quote: Quote, items: QuoteItem[]): string {
  const totals = computeTotals(quote, items);
  return quote.mode === 'varianty' ? totals.variantTotals.map((t) => formatCzk(t)).join(' / ') : formatCzk(totals.total);
}

export interface GenerateResult {
  number: string;
  version: number;
  pdfKey: string;
  /** Vstupy se od poslední verze nezměnily – nová verze nevznikla. */
  unchanged: boolean;
  /** Kolik vyplněných výkazů vzniklo spolu s PDF. */
  vykazCount?: number;
}

export async function generateQuote(
  env: Env,
  id: number,
  opts: { auto?: boolean; createdBy?: string | null; force?: boolean } = {},
): Promise<GenerateResult> {
  const quote = await getQuote(env, id);
  if (!quote) throw new UserError('Nabídka neexistuje.');
  const items = await getItems(env, id);
  if (!quote.client_name.trim()) throw new UserError('Chybí jméno klienta.');
  if (items.length === 0) throw new UserError('Nabídka nemá žádnou položku (technologie + m²).');
  if (items.some((i) => !(i.area_m2 > 0) || !(i.price_per_m2 > 0))) {
    throw new UserError('Každá položka musí mít plochu i cenu za m² větší než 0.');
  }
  const variants = variantsError(quote.mode, items);
  if (variants) throw new UserError(variants);

  const files = await getFiles(env, id);
  const vykazIds = fillableVykazIds(files);
  const hash = await fingerprintHash(quote, items, vykazIds);
  let [latest] = await getVersions(env, id);

  if (latest && latest.input_hash === hash && !opts.force && (await env.BUCKET.head(latest.pdf_key))) {
    return { number: quote.number ?? '', version: latest.version, pdfKey: latest.pdf_key, unchanged: true, vykazCount: versionVykazFiles(latest).length };
  }

  // Nabídka z doby před verzováním: dosavadní PDF zapíšeme jako verzi 1.
  if (!latest && quote.pdf_key && quote.number) {
    await env.DB.prepare(
      `INSERT INTO quote_versions (quote_id, version, pdf_key, vykaz_key, input_hash, total_label, created_at, created_by) VALUES (?, 1, ?, NULL, '', NULL, ?, NULL)`,
    )
      .bind(id, quote.pdf_key, quote.pdf_generated_at ?? nowIso())
      .run();
    [latest] = await getVersions(env, id);
  }

  const version = (latest?.version ?? 0) + 1;
  const number = await assignNumber(env, quote);
  const numbered = { ...quote, number };
  // Na PDF je vidět i verze, ať se při telefonátu s klientem ví, o které se mluví.
  const shown = { ...numbered, number: version > 1 ? `${number} (verze ${version})` : number };
  const pdf = await renderPdf(env, renderQuoteHtml(shown, items, new Date()));
  const pdfKey = `nabidky/${number}-v${version}.pdf`;
  await env.BUCKET.put(pdfKey, pdf, {
    httpMetadata: { contentType: 'application/pdf', contentDisposition: `inline; filename="${number}-v${version}.pdf"` },
  });

  // Přílohy vznikají společně: k PDF i vyplněný výkaz výměr (je-li na vstupu), ceny
  // z téže verze nabídky. Jestli jde k e-mailu, rozhoduje až odeslání. U variant
  // (klient si vybere jednu technologii) vznikne samostatný výkaz za každou variantu;
  // u kombinace jeden, kde má každý řádek cenu své technologie.
  const vykazFiles: VersionVykaz[] = [];
  // Víc výkazů v jedné poptávce je vzácné – vyplní se ten zaškrtnutý, jinak první.
  const vykazFile = files.find((f) => vykazIds.includes(f.id) && f.include_in_email === 1) ?? files.find((f) => vykazIds.includes(f.id));
  const vykazAnalysis = vykazFile ? parseFileAnalysis(vykazFile.analysis) : null;
  if (vykazFile && isVykaz(vykazAnalysis)) {
    const original = await env.BUCKET.get(vykazFile.r2_key);
    const data = original ? await original.arrayBuffer() : null;
    const thickness = quote.thickness_cm ?? vykazAnalysis.thicknessCm;
    const groups =
      quote.mode === 'varianty' && items.length > 1
        ? items.map((item) => ({ technology: item.technology as TechnologyId | null, items: [item] }))
        : [{ technology: null, items }];
    for (const [i, group] of groups.entries()) {
      const filled = data ? fillVykaz(data, vykazAnalysis, group.items, thickness) : null;
      if (!filled) continue;
      const key = `nabidky/${number}-v${version}-vykaz${groups.length > 1 ? `-${i + 1}` : ''}.xlsx`;
      await env.BUCKET.put(key, filled.data, { httpMetadata: { contentType: XLSX_TYPE } });
      vykazFiles.push({ key, technology: group.technology, fileId: vykazFile.id });
    }
  }

  await env.DB.prepare(
    `INSERT INTO quote_versions (quote_id, version, pdf_key, vykaz_key, vykaz_files, input_hash, total_label, created_at, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      version,
      pdfKey,
      vykazFiles[0]?.key ?? null,
      vykazFiles.length ? JSON.stringify(vykazFiles) : null,
      hash,
      totalLabel(quote, items),
      nowIso(),
      opts.createdBy ?? null,
    )
    .run();

  const fields: Partial<Record<keyof Quote, unknown>> = {
    number,
    pdf_key: pdfKey,
    pdf_generated_at: nowIso(),
    status: quote.status === 'odeslano' || quote.status === 'prijato' ? quote.status : opts.auto ? 'pripraveno' : 'vygenerovano',
    missing: '[]',
  };
  // Text e-mailu navrhujeme jen poprvé – ruční úpravy nepřepisujeme. Předmět u nabídky
  // z e-mailu („Re: …“) zůstává, aby odpověď zůstala ve vlákně.
  if (!quote.email_body) {
    const text = await draftEmailText(env, numbered, items);
    fields.email_body = text.email_body;
    fields.email_subject = quote.email_subject || text.email_subject;
  }
  await updateQuote(env, id, fields);
  return { number, version, pdfKey, unchanged: false, vykazCount: vykazFiles.length };
}

/** Verze, která jde k e-mailu: zvolená (email_version), jinak poslední. */
export async function emailVersion(env: Env, quote: Quote): Promise<QuoteVersion | null> {
  const versions = await getVersions(env, quote.id);
  return versions.find((v) => v.version === quote.email_version) ?? versions[0] ?? null;
}

// ─── Průvodní e-mail ─────────────────────────────────────────────────────────

function priceSummary(quote: Quote, items: QuoteItem[]): string {
  const totals = computeTotals(quote, items);
  if (quote.mode === 'varianty') {
    return totals.lines
      .map((l, i) => `- ${technologyLabel(l.technology)}: ${formatArea(l.area_m2)} × ${formatCzk(l.price_per_m2)}, celkem ${formatCzk(totals.variantTotals[i])} včetně dopravy`)
      .join('\n');
  }
  const lines = totals.lines.map((l) => `- ${technologyLabel(l.technology)}: ${formatArea(l.area_m2)} × ${formatCzk(l.price_per_m2)} = ${formatCzk(l.workPrice)}`);
  return [...lines, `- Doprava: ${formatCzk(quote.transport_price)}`, `Celkem: ${formatCzk(totals.total)}`].join('\n');
}

export function fallbackEmail(quote: Quote, items: QuoteItem[]): { email_subject: string; email_body: string } {
  const place = quote.site_name || quote.site_address || quote.city;
  return {
    email_subject: `Cenová nabídka ${quote.number ?? ''}${place ? ` – ${place}` : ''}`.trim(),
    email_body: [
      'Dobrý den,',
      '',
      `v příloze Vám posílám cenovou nabídku${place ? ` na sanaci zdiva – ${place}` : ' na sanaci zdiva'}.`,
      '',
      priceSummary(quote, items),
      '',
      'Nejsme plátci DPH, uvedené ceny jsou konečné. Výslednou cenu potvrdíme po osobní prohlídce objektu; konečná částka se stanoví podle skutečně provedeného rozsahu prací.',
      '',
      'V případě zájmu nebo jakýchkoli dotazů se mi prosím ozvěte.',
      '',
      'S pozdravem',
      QUOTE_AUTHOR.name,
      'IZODIAMANT – sanace zdiva',
      '+420 737 017 012 · info@izodiamant.cz · izodiamant.cz',
    ].join('\n'),
  };
}

export async function draftEmailText(
  env: Env,
  quote: Quote,
  items: QuoteItem[],
): Promise<{ email_subject: string; email_body: string }> {
  const fallback = fallbackEmail(quote, items);
  try {
    const raw = await runJson<{ subject?: unknown; body?: unknown }>(env, {
      task: 'text',
      quoteId: quote.id,
      system: `Píšeš e-maily za firmu IZODIAMANT (sanace vlhkého zdiva). Jménem Václava Ropka napiš krátký, věcný a zdvořilý průvodní e-mail k cenové nabídce, která je v příloze jako PDF.
Pravidla:
- Česky, vykání, bez zbytečných frází, max. ~120 slov.
- Oslovení vždy neutrálně „Dobrý den,“ (klient může být i firma nebo SVJ).
- Nevymýšlej nic, co v podkladu není (schůzky, prohlídky, termíny, předchozí jednání).
- Ceny přepiš PŘESNĚ z podkladu, nic nepřepočítávej a nepřidávej jiná čísla.
- Zmiň, že nejsme plátci DPH, že výslednou cenu potvrdíme po osobní prohlídce objektu a že konečná částka se stanoví podle skutečného rozsahu.
- Podpis: ${QUOTE_AUTHOR.name}, IZODIAMANT – sanace zdiva, +420 737 017 012, info@izodiamant.cz.
JSON schéma: {"subject": "předmět", "body": "text e-mailu s \\n pro nové řádky"}`,
      user: `Klient: ${quote.client_name}
Místo: ${[quote.site_name, quote.site_address, quote.city].filter(Boolean).join(', ') || 'neuvedeno'}
Číslo nabídky: ${quote.number}
Režim: ${quote.mode === 'varianty' ? 'varianty (klient platí jen jednu z nich)' : 'kombinace technologií (položky se sčítají)'}
Ceny:
${priceSummary(quote, items)}`,
    });
    const subject = str(raw.subject, 200);
    const body = str(raw.body, 5000);
    if (!subject || !body) return fallback;
    return { email_subject: subject, email_body: body };
  } catch (err) {
    console.warn('Návrh e-mailu přes AI selhal, použije se šablona:', err instanceof Error ? err.message : err);
    return fallback;
  }
}
