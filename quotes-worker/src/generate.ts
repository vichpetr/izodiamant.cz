// Vygenerování PDF nabídky (HTML šablona → Browser Rendering → R2) a návrh
// průvodního e-mailu. Čísla v PDF počítá computeTotals(), AI píše jen text e-mailu.

import puppeteer from '@cloudflare/puppeteer';
import { computeTotals, formatArea, formatCzk, quoteNumberBase } from '../../src/lib/quotes/calc';
import { QUOTE_AUTHOR, technologyLabel, type Quote, type QuoteItem } from '../../src/lib/quotes/model';
import { renderQuoteHtml } from '../../src/lib/quotes/template';
import { runJson, str } from './ai';
import { getItems, getQuote, updateQuote } from './db';
import { nowIso, type Env } from './env';

export class UserError extends Error {}

async function assignNumber(env: Env, quote: Quote): Promise<string> {
  if (quote.number) return quote.number;
  const base = quoteNumberBase(new Date(), quote.city);
  const { results } = await env.DB.prepare('SELECT number FROM quotes WHERE number = ? OR number LIKE ?')
    .bind(base, `${base}-%`)
    .all<{ number: string }>();
  const taken = new Set(results.map((r) => r.number));
  let number = base;
  for (let n = 2; taken.has(number); n++) number = `${base}-${n}`;
  return number;
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

export async function generateQuote(env: Env, id: number): Promise<{ number: string; pdfKey: string }> {
  const quote = await getQuote(env, id);
  if (!quote) throw new UserError('Nabídka neexistuje.');
  const items = await getItems(env, id);
  if (!quote.client_name.trim()) throw new UserError('Chybí jméno klienta.');
  if (items.length === 0) throw new UserError('Nabídka nemá žádnou položku (technologie + m²).');
  if (items.some((i) => !(i.area_m2 > 0) || !(i.price_per_m2 > 0))) {
    throw new UserError('Každá položka musí mít plochu i cenu za m² větší než 0.');
  }

  const number = await assignNumber(env, quote);
  const numbered = { ...quote, number };
  const pdf = await renderPdf(env, renderQuoteHtml(numbered, items, new Date()));
  const pdfKey = `nabidky/${number}.pdf`;
  await env.BUCKET.put(pdfKey, pdf, {
    httpMetadata: { contentType: 'application/pdf', contentDisposition: `inline; filename="${number}.pdf"` },
  });

  const fields: Partial<Record<keyof Quote, unknown>> = {
    number,
    pdf_key: pdfKey,
    pdf_generated_at: nowIso(),
    status: quote.status === 'odeslano' || quote.status === 'prijato' ? quote.status : 'vygenerovano',
  };
  // Text e-mailu navrhujeme jen poprvé – ruční úpravy nepřepisujeme. Předmět u nabídky
  // z e-mailu („Re: …“) zůstává, aby odpověď zůstala ve vlákně.
  if (!quote.email_body) {
    const text = await draftEmailText(env, numbered, items);
    fields.email_body = text.email_body;
    fields.email_subject = quote.email_subject || text.email_subject;
  }
  await updateQuote(env, id, fields);
  return { number, pdfKey };
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
      'Nejsme plátci DPH, uvedené ceny jsou konečné. Konečná cena se stanoví podle skutečně provedeného rozsahu prací.',
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
      system: `Píšeš e-maily za firmu IZODIAMANT (sanace vlhkého zdiva). Jménem Václava Ropka napiš krátký, věcný a zdvořilý průvodní e-mail k cenové nabídce, která je v příloze jako PDF.
Pravidla:
- Česky, vykání, bez zbytečných frází, max. ~120 slov.
- Oslovení vždy neutrálně „Dobrý den,“ (klient může být i firma nebo SVJ).
- Nevymýšlej nic, co v podkladu není (schůzky, prohlídky, termíny, předchozí jednání).
- Ceny přepiš PŘESNĚ z podkladu, nic nepřepočítávej a nepřidávej jiná čísla.
- Zmiň, že nejsme plátci DPH a konečná cena se stanoví podle skutečného rozsahu.
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
