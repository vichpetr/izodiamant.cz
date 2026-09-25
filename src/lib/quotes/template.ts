// HTML šablona PDF cenové nabídky (vzhled podle ručně připravené nabídky
// „Polička, ul. 1. máje“). Worker ji vyrenderuje přes Browser Rendering do A4.
// Všechna čísla pocházejí z computeTotals() – šablona nic nepočítá sama.

import { computeTotals, formatArea, formatCzk, formatDateCz, formatNumber } from './calc';
import {
  COMPANY,
  DEFAULT_CONDITIONS,
  QUOTE_AUTHOR,
  TECHNOLOGIES,
  materialLabel,
  parseJsonArray,
  technologyLabel,
  type Quote,
  type QuoteItem,
} from './model';

function esc(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** „16 m × 45 cm = 7,2 m²“ */
function dimsLabel(l: { length_m?: number | null; thickness_cm?: number | null; area_m2: number }): string {
  return `${formatNumber(l.length_m ?? 0)} m × ${formatNumber(l.thickness_cm ?? 0)} cm = ${formatArea(l.area_m2)}`;
}

function tagline(technology: string): string {
  return TECHNOLOGIES.find((t) => t.id === technology)?.tagline ?? '';
}

function defaultIntro(quote: Quote, items: QuoteItem[]): string {
  const names = items.map((i) => technologyLabel(i.technology).toLowerCase());
  if (quote.mode === 'varianty') {
    return `Práce lze provést více technologiemi – ${names.join(', nebo ')}. Níže proto uvádíme cenu pro každou variantu zvlášť.`;
  }
  return 'Rozsah prací je rozdělen podle technologie, kterou bude na jednotlivých úsecích zdiva potřeba použít. Celková cena je součtem všech položek a dopravy.';
}

export function renderQuoteHtml(quote: Quote, items: QuoteItem[], issuedAt: Date): string {
  const totals = computeTotals(quote, items);
  const hasCutting = items.some((i) => i.technology !== 'chemicka-injektaz');
  const subtitle = [quote.site_name, quote.site_address].filter(Boolean).join(', ');
  const conditions = quote.conditions !== null ? parseJsonArray(quote.conditions) : DEFAULT_CONDITIONS;
  const intro = quote.intro?.trim() || defaultIntro(quote, items);

  const areas = [...new Set(totals.lines.map((l) => l.area_m2))];
  const specRows: [string, string][] = [];
  if (quote.material) specRows.push(['Zdivo', materialLabel(quote.material)]);
  // Rozměry z položek (každá má svou délku a tloušťku); pole nabídky jen jako záloha.
  const dimLines = totals.lines.filter((l) => l.length_m && l.thickness_cm);
  if (dimLines.length === totals.lines.length && dimLines.length > 0) {
    const thicknesses = [...new Set(dimLines.map((l) => l.thickness_cm!))].sort((a, b) => a - b);
    const length = quote.mode === 'kombinace' ? dimLines.reduce((s, l) => s + l.length_m!, 0) : Math.max(...dimLines.map((l) => l.length_m!));
    specRows.push(['Tloušťka zdiva', thicknesses.length === 1 ? `${formatNumber(thicknesses[0])} cm` : `${formatNumber(thicknesses[0])}–${formatNumber(thicknesses[thicknesses.length - 1])} cm`]);
    specRows.push(['Délka řezu', `${formatNumber(length)} m`]);
  } else {
    if (quote.thickness_cm) specRows.push(['Tloušťka zdiva', `${formatNumber(quote.thickness_cm)} cm`]);
    if (quote.length_m) specRows.push(['Délka řezu', `${formatNumber(quote.length_m)} m`]);
  }
  if (quote.mode === 'kombinace' && items.length > 1) {
    specRows.push(['Řezná plocha celkem', formatArea(totals.lines.reduce((s, l) => s + l.area_m2, 0))]);
  } else if (areas.length === 1) {
    specRows.push([hasCutting ? 'Řezná plocha' : 'Plocha', formatArea(areas[0])]);
  }

  const transportRow = `<div class="row"><span>Doprava</span><strong>${formatCzk(quote.transport_price)}</strong></div>`;

  const pricing =
    quote.mode === 'varianty'
      ? `<div class="variants cols-${Math.min(items.length, 3)}">
          ${totals.lines
            .map(
              (l, idx) => `<div class="card">
                <h3>${esc(technologyLabel(l.technology))}</h3>
                <p class="tag">${esc(tagline(l.technology))}</p>
                ${l.length_m && l.thickness_cm ? `<div class="row"><span>Rozsah</span><strong>${esc(dimsLabel(l))}</strong></div>` : ''}
                <div class="row"><span>Cena za m² řezné plochy</span><strong>${formatCzk(l.price_per_m2)}</strong></div>
                <div class="row"><span>Cena za práce (${formatArea(l.area_m2)} × ${formatCzk(l.price_per_m2)})</span><strong>${formatCzk(l.workPrice)}</strong></div>
                ${transportRow}
                <div class="total"><span>Cena celkem</span><strong>${formatCzk(totals.variantTotals[idx])}</strong></div>
              </div>`,
            )
            .join('')}
        </div>
        <div class="callout"><strong>Výsledná cena bude odpovídat jedné z uvedených variant, případně jejich kombinaci</strong> podle toho, kterou technologii bude možné na místě reálně použít. Cena za m² zůstává v obou případech neměnná. <strong>Výsledná cena bude potvrzena po osobní prohlídce objektu</strong> a konečná částka se stanoví po dokončení prací podle skutečně provedeného rozsahu.</div>`
      : `<div class="card wide">
          <table class="items">
            <thead><tr><th>Technologie</th><th>Řezná plocha</th><th>Cena za m²</th><th>Cena za práce</th></tr></thead>
            <tbody>
              ${totals.lines
                .map(
                  (l) => `<tr>
                    <td><strong>${esc(technologyLabel(l.technology))}</strong><span class="tag">${esc(tagline(l.technology))}</span></td>
                    <td>${l.length_m && l.thickness_cm ? `${esc(dimsLabel(l))}` : formatArea(l.area_m2)}</td>
                    <td>${formatCzk(l.price_per_m2)}</td>
                    <td><strong>${formatCzk(l.workPrice)}</strong></td>
                  </tr>`,
                )
                .join('')}
              <tr><td colspan="4" class="tag">Řezná plocha = délka zdi × tloušťka zdi.</td></tr>
              <tr><td colspan="3">Doprava</td><td><strong>${formatCzk(quote.transport_price)}</strong></td></tr>
            </tbody>
          </table>
          <div class="total"><span>Cena celkem</span><strong>${formatCzk(totals.total)}</strong></div>
        </div>
        <div class="callout"><strong>Výsledná cena bude potvrzena po osobní prohlídce objektu</strong> – rozměry v této nabídce vycházejí z dosud dodaných podkladů. Konečná částka se stanoví po dokončení prací podle skutečně provedeného rozsahu; cena za m² u jednotlivých technologií zůstává neměnná.</div>`;

  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<title>Cenová nabídka ${esc(quote.number)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=block" rel="stylesheet">
<style>
  @page { size: A4; margin: 11mm 13mm 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, Arial, sans-serif; color: #1a1a1a; font-size: 10.5px; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { padding: 0; }
  header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 3px solid #c4d600; }
  .logo { font-weight: 900; font-size: 22px; letter-spacing: -0.5px; line-height: 1; }
  .logo span { color: #a3b200; }
  .logo small { display: block; font-size: 7.5px; letter-spacing: 2.5px; font-weight: 700; color: #6b6b6b; margin-top: 7px; }
  .meta { text-align: right; font-size: 9px; color: #444; }
  .pill { display: inline-block; background: #c4d600; color: #1a1a1a; font-weight: 800; font-size: 8.5px; letter-spacing: 1px; padding: 4px 12px; border-radius: 999px; margin-bottom: 6px; }
  h1 { font-size: 25px; font-weight: 900; line-height: 1.05; margin: 16px 0 5px; letter-spacing: -0.5px; text-transform: uppercase; }
  h1 span { display: block; color: #a3b200; }
  .subtitle { font-weight: 600; color: #444; margin: 0 0 12px; font-size: 11px; }
  .boxes { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid #e3e3e3; border-radius: 6px; }
  .boxes > div { padding: 9px 12px; }
  .boxes > div + div { border-left: 1px solid #e3e3e3; }
  .label { font-size: 7.5px; font-weight: 800; letter-spacing: 1.2px; color: #8a9600; text-transform: uppercase; }
  .boxes strong { display: block; margin-top: 3px; }
  .boxes .muted { color: #666; }
  h2 { font-size: 13px; font-weight: 900; text-transform: uppercase; margin: 16px 0 7px; letter-spacing: -0.2px; }
  .spec { background: #f7f8f9; border-radius: 6px; }
  .spec .row { padding: 5px 12px; }
  .spec .row + .row { border-top: 1px solid #fff; }
  .row { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; color: #444; }
  .row strong { color: #1a1a1a; white-space: nowrap; }
  .intro { color: #333; margin: 0 0 12px; }
  .variants { display: grid; gap: 10px; }
  .cols-1 { grid-template-columns: 1fr; } .cols-2 { grid-template-columns: 1fr 1fr; } .cols-3 { grid-template-columns: 1fr 1fr 1fr; }
  .card { border: 1px solid #e3e3e3; border-radius: 8px; padding: 12px 13px; }
  .card h3 { margin: 0; font-size: 12.5px; font-weight: 900; text-transform: uppercase; }
  .tag { display: block; color: #777; font-size: 8.5px; margin-bottom: 8px; font-weight: 400; }
  .total { display: flex; justify-content: space-between; align-items: center; background: #f1f6cf; border: 1px solid #d7e27a; border-radius: 6px; padding: 9px 12px; margin-top: 10px; }
  .total span { font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; }
  .total strong { font-size: 17px; font-weight: 900; white-space: nowrap; }
  table.items { width: 100%; border-collapse: collapse; }
  table.items th { text-align: left; font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; color: #777; font-weight: 700; padding: 0 6px 6px; border-bottom: 1px solid #e3e3e3; }
  table.items td { padding: 5px 6px; border-bottom: 1px solid #f0f0f0; vertical-align: top; white-space: nowrap; }
  table.items td:first-child { white-space: normal; }
  table.items td .tag { margin: 1px 0 0; }
  table.items th:not(:first-child), table.items td:not(:first-child) { text-align: right; }
  .callout { border-left: 3px solid #c4d600; background: #fafafa; padding: 9px 12px; margin-top: 12px; color: #333; font-size: 9.5px; }
  ul.conditions { list-style: none; padding: 0; margin: 0 0 10px; }
  ul.conditions li { padding-left: 16px; position: relative; margin: 4px 0; }
  ul.conditions li::before { content: '–'; position: absolute; left: 0; color: #a3b200; font-weight: 800; }
  .vat { font-weight: 800; }
  footer { margin-top: 14px; background: #1a1a1a; color: #fff; border-radius: 8px; padding: 13px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; }
  footer .who strong { display: block; font-size: 12px; font-weight: 800; }
  footer .who span { color: #c4d600; font-size: 8px; font-weight: 800; letter-spacing: 1.2px; }
  footer .contact { text-align: right; color: #ddd; }
  footer .contact b { color: #fff; }
  .avoid-break { break-inside: avoid; }
</style>
</head>
<body>
<div class="page">
  <header>
    <div class="logo">IZO<span>DIAMANT</span><small>SANACE ZDIVA</small></div>
    <div class="meta">
      <div class="pill">CENOVÁ NABÍDKA</div>
      <div>Číslo nabídky: <strong>${esc(quote.number)}</strong></div>
      <div>Datum vystavení: <strong>${formatDateCz(issuedAt)}</strong></div>
    </div>
  </header>

  <h1>Cenová nabídka<span>${hasCutting ? 'na řezání zdiva' : 'na sanaci zdiva'}</span></h1>
  ${subtitle ? `<p class="subtitle">${esc(subtitle)}</p>` : ''}

  <div class="boxes">
    <div><div class="label">Pro</div><strong>${esc(quote.client_name)}</strong><div class="muted">${esc([quote.client_email, quote.client_phone].filter(Boolean).join(' · '))}</div></div>
    <div><div class="label">Místo realizace</div><strong>${esc(quote.site_name || quote.city || '')}</strong><div class="muted">${esc(quote.site_address || '')}</div></div>
    <div><div class="label">Zpracoval</div><strong>${esc(QUOTE_AUTHOR.name)}</strong><div class="muted">${esc(QUOTE_AUTHOR.company)}</div></div>
  </div>

  ${specRows.length ? `<h2>Specifikace zakázky</h2><div class="spec">${specRows.map(([k, v]) => `<div class="row"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div>` : ''}

  <div class="avoid-break">
    <h2>Cena podle technologie</h2>
    <p class="intro">${esc(intro)}</p>
    ${pricing}
  </div>

  <div class="avoid-break">
    ${conditions.length ? `<h2>Technické podmínky</h2><ul class="conditions">${conditions.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
    <p class="vat">Nejsme plátci DPH, uvedená cena je konečná.</p>
    <p>V případě zájmu o spolupráci mi prosím dejte vědět, rád zodpovím případné dotazy nebo nabídku upřesním.</p>

    <footer>
      <div class="who"><strong>${esc(QUOTE_AUTHOR.name)}</strong><span>IZODIAMANT</span></div>
      <div class="contact">
        <div><b>IČO:</b> ${COMPANY.ico} · ${esc(COMPANY.address)}</div>
        <div><b>${COMPANY.phone}</b> · ${COMPANY.email} · ${COMPANY.web}</div>
      </div>
    </footer>
  </div>
</div>
</body>
</html>`;
}
