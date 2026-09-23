// Čtení plánku: AI navrhne délku řezu, tloušťku zdiva a řeznou plochu.
// Výsledek je jen návrh – v adminu se zobrazí s tlačítkem „Použít“ a člověk ho
// může upravit. Ceny se z něj nikdy nepočítají automaticky bez potvrzení.
//
// PDF se NEČTE jako text: z CAD exportu vypadne jen seznam čísel a názvů
// místností bez vazby na konkrétní stěnu. Místo toho se stránky vykreslí přes
// Browser Rendering na obrázky a ty jdou do modelu s viděním (kóty i geometrie).
// Textový výpis zůstává jen jako nouzová varianta.

import puppeteer from '@cloudflare/puppeteer';
import type { PlanAnalysis } from '../../src/lib/quotes/model';
import { cutArea } from '../../src/lib/quotes/calc';
import { num, pdfToText, runJson, str, type AiImage } from './ai';
import type { Env } from './env';
import { toBase64 } from './util';

const MAX_PDF_PAGES = 3;
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';

const SYSTEM = `Jsi rozpočtář firmy IZODIAMANT, která dělá sanaci vlhkého zdiva – podřezání zdiva (řetězová pila, diamantové lano) a chemickou injektáž.
Z podkladu (výkres, půdorys, náčrt) zjisti rozměry pro cenovou nabídku.
Zajímají nás OBVODOVÉ zdi nejnižšího podlaží (suterén / 1.PP, jinak přízemí) – ty se podřezávají.
- "lengthM" = délka obvodu, tedy součet délek obvodových zdí dokola. U obdélníkového půdorysu 2 × (šířka + hloubka). Kóty v mm převeď na m.
- Vnitřní příčky a nosné zdi NEPOČÍTEJ, pokud si o ně rozpočtář výslovně neřekne v pokynu.
- "thicknessCm" = tloušťka obvodového zdiva v cm. Stačí přibližně; když ji z podkladu nepoznáš, vrať null.
- "material" vyplň jen když je z podkladu zřejmý (popisky, legenda, šrafy): cihla, kámen nebo smíšené zdivo, beton.
- Když délku obvodu nejde spolehlivě určit, vrať null – nevymýšlej čísla.
JSON schéma:
{"lengthM": number|null, "thicknessCm": number|null, "areaM2": number|null, "material": "cihla"|"kamen"|"beton"|"jine"|null, "confidence": "nizka"|"stredni"|"vysoka", "reasoning": "stručně česky: ze kterých kót obvod vyšel"}`;

/** Vykreslí první stránky PDF na obrázky (pdf.js běží v Browser Rendering). */
export async function pdfToImages(env: Env, data: ArrayBuffer, maxPages = MAX_PDF_PAGES): Promise<AiImage[]> {
  const browser = await puppeteer.launch(env.BROWSER);
  try {
    const page = await browser.newPage();
    await page.setContent(
      `<!doctype html><html><head>
         <script src="${PDFJS}/pdf.min.js"></script>
         <script src="${PDFJS}/pdf.worker.min.js"></script>
       </head><body></body></html>`,
      { waitUntil: 'networkidle0', timeout: 30_000 },
    );
    const images = await page.evaluate(
      async (base64: string, limit: number) => {
        // Tahle funkce běží v prohlížeči (Browser Rendering), ne ve workeru –
        // proto se `document` i `pdfjsLib` berou přes globalThis.
        const g = globalThis as unknown as {
          pdfjsLib?: { getDocument: (o: unknown) => { promise: Promise<PdfDoc> } };
          document: { createElement(tag: string): PdfCanvas };
        };
        const lib = g.pdfjsLib;
        if (!lib) throw new Error('pdf.js se nenačetl');
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const pdf = await lib.getDocument({ data: bytes }).promise;
        const out: string[] = [];
        for (let i = 1; i <= Math.min(pdf.numPages, limit); i++) {
          const pdfPage = await pdf.getPage(i);
          const base = pdfPage.getViewport({ scale: 1 });
          // Výkresy bývají A3/A4 – cílíme na ~2000 px delší strany, ať jsou kóty čitelné.
          const viewport = pdfPage.getViewport({ scale: Math.min(4, 2000 / Math.max(base.width, base.height)) });
          const canvas = g.document.createElement('canvas');
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);
          const ctx = canvas.getContext('2d');
          // Výkresy mívají průhledné pozadí – bez podkladu by kresba zčernala.
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await pdfPage.render({ canvasContext: ctx, viewport }).promise;
          out.push(canvas.toDataURL('image/jpeg', 0.9).split(',')[1]);
        }
        return out;
      },
      toBase64(data),
      maxPages,
    );
    return images.map((b64: string) => ({
      mediaType: 'image/jpeg',
      data: Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer as ArrayBuffer,
    }));
  } finally {
    await browser.close();
  }
}

interface PdfCanvas {
  width: number;
  height: number;
  getContext(type: '2d'): { fillStyle: string; fillRect(x: number, y: number, w: number, h: number): void };
  toDataURL(type: string, quality: number): string;
}

interface PdfDoc {
  numPages: number;
  getPage(n: number): Promise<{
    getViewport(o: { scale: number }): { width: number; height: number };
    render(o: unknown): { promise: Promise<void> };
  }>;
}

export async function analyzePlan(
  env: Env,
  file: { name: string; type: string; data: ArrayBuffer },
  hint: string | null,
): Promise<PlanAnalysis> {
  const userText = `Podklad: ${file.name}.${hint ? `\nPokyn od rozpočtáře: ${hint}` : ''}`;

  let raw: Record<string, unknown>;
  if (file.type === 'application/pdf') {
    let images: AiImage[] = [];
    try {
      images = await pdfToImages(env, file.data);
    } catch (err) {
      console.warn('Vykreslení PDF selhalo, zkusím textový výpis:', err instanceof Error ? err.message : err);
    }
    if (images.length > 0) {
      raw = await runJson(env, { system: SYSTEM, user: `${userText}\n(Stránky PDF jako obrázky.)`, images, think: true });
    } else {
      const text = (await pdfToText(env, file.name, file.data)).slice(0, 30_000);
      if (!text.trim()) return empty('PDF se nepodařilo vykreslit ani z něj přečíst text. Zkuste plánek nahrát jako obrázek (JPG/PNG).');
      raw = await runJson(env, { system: SYSTEM, user: `${userText}\n\nText vytažený z PDF:\n${text}`, think: true });
    }
  } else {
    const image: AiImage = { mediaType: file.type, data: file.data };
    raw = await runJson(env, { system: SYSTEM, user: userText, images: [image], think: true });
  }

  const lengthM = num(raw.lengthM, 0.1, 2000);
  const thicknessCm = num(raw.thicknessCm, 5, 250);
  // Plochu přepočítáme sami, když máme oba rozměry – AI se v násobení plete častěji než v kótách.
  const areaM2 = cutArea(lengthM, thicknessCm) ?? num(raw.areaM2, 0.1, 5000);
  const material = typeof raw.material === 'string' && ['cihla', 'kamen', 'beton', 'jine'].includes(raw.material) ? raw.material : null;
  const confidence = raw.confidence === 'vysoka' || raw.confidence === 'stredni' ? raw.confidence : 'nizka';
  return { lengthM, thicknessCm, areaM2, material, confidence, reasoning: str(raw.reasoning, 1200) ?? '' };
}

function empty(reasoning: string): PlanAnalysis {
  return { lengthM: null, thicknessCm: null, areaM2: null, material: null, confidence: 'nizka', reasoning };
}
