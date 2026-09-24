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
- "thicknessCm" = tloušťka obvodového zdiva v cm. Když je tlouštěk víc, vezmi NEJVĚTŠÍ (neprůměruj).
- "material" vyplň jen když je z podkladu zřejmý (popisky, legenda, šrafy): cihla, kámen nebo smíšené zdivo, beton.
DŮLEŽITÉ – vždy se pokus číslo dát:
- Když si kóty odporují (součet dílčích kót ≠ celková kóta, levá strana ≠ pravá), použij VĚTŠÍ hodnotu, sniž "confidence" a rozpor popiš v "sources". Nevracej kvůli tomu null.
- Když některé úseky nejsou okótované, odhadni je podle měřítka a napiš to do poznámek.
- null vrať jen tehdy, když z podkladu nejdou přečíst vůbec žádné použitelné rozměry.
- Nabídka se stejně potvrzuje až po osobní prohlídce, takže raději mírně nadhodnoť než ať chybí číslo.
- "sources" = 2 až 5 krátkých poznámek (každá do 100 znaků), odkud jsi který údaj vzal a kde byl případný rozpor,
  např. "kóta 10 500 mm nahoře", "spodní kóta 9 650 mm vs. součet 11 150 mm – použito 11 150", "popis: cihla tl. 450 mm".
JSON schéma:
{"lengthM": number|null, "thicknessCm": number|null, "areaM2": number|null, "material": "cihla"|"kamen"|"beton"|"jine"|null, "confidence": "nizka"|"stredni"|"vysoka", "reasoning": "stručně česky: jak obvod vyšel", "sources": ["…", "…"]}`;

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

// Claude bere obrázky do ~5 MB; fotky z mobilu v příloze e-mailu bývají větší.
const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024;

/** Velký obrázek zmenší v Browser Rendering na JPEG (delší strana 2400 px); malý vrátí beze změny. */
export async function fitImage(env: Env, image: AiImage): Promise<AiImage> {
  if (image.data.byteLength <= MAX_IMAGE_BYTES) return image;
  const browser = await puppeteer.launch(env.BROWSER);
  try {
    const page = await browser.newPage();
    const b64 = await page.evaluate(
      async (src: string) => {
        const g = globalThis as unknown as {
          document: { createElement(tag: 'img'): ImgEl; createElement(tag: 'canvas'): PdfCanvas };
        };
        const img = g.document.createElement('img');
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Obrázek se nepodařilo načíst.'));
          img.src = src;
        });
        const scale = Math.min(1, 2400 / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = g.document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
      },
      `data:${image.mediaType};base64,${toBase64(image.data)}`,
    );
    return { mediaType: 'image/jpeg', data: Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer as ArrayBuffer };
  } finally {
    await browser.close();
  }
}

interface ImgEl {
  naturalWidth: number;
  naturalHeight: number;
  src: string;
  onload: () => void;
  onerror: () => void;
}

interface PdfCanvas {
  width: number;
  height: number;
  getContext(type: '2d'): {
    fillStyle: string;
    fillRect(x: number, y: number, w: number, h: number): void;
    drawImage(image: unknown, x: number, y: number, w: number, h: number): void;
  };
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
  quoteId: number,
): Promise<PlanAnalysis> {
  // `think` platí jen pro zálohu na Workers AI (Gemma) – komerční modely ho ignorují.
  const call = { task: 'extract' as const, system: SYSTEM, think: true, quoteId };
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
      raw = await runJson(env, { ...call, user: `${userText}\n(Stránky PDF jako obrázky.)`, images });
    } else {
      const text = (await pdfToText(env, file.name, file.data)).slice(0, 30_000);
      if (!text.trim()) return empty('PDF se nepodařilo vykreslit ani z něj přečíst text. Zkuste plánek nahrát jako obrázek (JPG/PNG).');
      raw = await runJson(env, { ...call, user: `${userText}\n\nText vytažený z PDF:\n${text}` });
    }
  } else {
    raw = await runJson(env, { ...call, user: userText, images: [await fitImage(env, { mediaType: file.type, data: file.data })] });
  }

  const lengthM = num(raw.lengthM, 0.1, 2000);
  const thicknessCm = num(raw.thicknessCm, 5, 250);
  // Plochu přepočítáme sami, když máme oba rozměry – AI se v násobení plete častěji než v kótách.
  const areaM2 = cutArea(lengthM, thicknessCm) ?? num(raw.areaM2, 0.1, 5000);
  const material = typeof raw.material === 'string' && ['cihla', 'kamen', 'beton', 'jine'].includes(raw.material) ? raw.material : null;
  const confidence = raw.confidence === 'vysoka' || raw.confidence === 'stredni' ? raw.confidence : 'nizka';
  const sources = (Array.isArray(raw.sources) ? raw.sources : [])
    .map((v) => str(v, 120))
    .filter((v): v is string => Boolean(v))
    .slice(0, 5);
  return { kind: 'plan', lengthM, thicknessCm, areaM2, material, confidence, reasoning: str(raw.reasoning, 1200) ?? '', sources };
}

function empty(reasoning: string): PlanAnalysis {
  return { kind: 'plan', lengthM: null, thicknessCm: null, areaM2: null, material: null, confidence: 'nizka', reasoning, sources: [] };
}
