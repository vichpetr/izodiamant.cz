// Čtení plánku: AI navrhne délku řezu, tloušťku zdiva a řeznou plochu.
// Výsledek je jen návrh – v adminu se zobrazí s tlačítkem „Použít“ a člověk ho
// může upravit. Ceny se z něj nikdy nepočítají automaticky bez potvrzení.

import type { PlanAnalysis } from '../../src/lib/quotes/model';
import { cutArea } from '../../src/lib/quotes/calc';
import { num, pdfToText, runJson, str, type AiImage } from './ai';
import type { Env } from './env';

const SYSTEM = `Jsi rozpočtář firmy IZODIAMANT, která dělá sanaci vlhkého zdiva – podřezání zdiva (řetězová pila, diamantové lano) a chemickou injektáž.
Z podkladu (výkres, půdorys, náčrt nebo jeho text) zjisti rozměry pro cenovou nabídku.
Cena se počítá z řezné plochy: řezná plocha [m²] = celková délka zdí, které se budou podřezávat [m] × tloušťka zdiva [m].
Postup:
- Najdi zdi, které se mají sanovat (typicky obvodové a nosné zdi v nejnižším podlaží / suterénu, pokud podklad neříká jinak).
- Sečti jejich délky v metrech (kóty v mm převeď na m). Otvory (dveře) se u podřezání obvykle NEodečítají.
- Urči tloušťku zdiva v cm (z kót nebo měřítka). Když se tloušťky liší, použij vážený průměr a uveď to ve zdůvodnění.
- Když údaj z podkladu nejde spolehlivě zjistit, vrať null – nevymýšlej čísla.
JSON schéma:
{"lengthM": number|null, "thicknessCm": number|null, "areaM2": number|null, "material": "cihla"|"kamen"|"beton"|"jine"|null, "confidence": "nizka"|"stredni"|"vysoka", "reasoning": "stručné zdůvodnění česky (které zdi, jaké kóty)"}`;

export async function analyzePlan(
  env: Env,
  file: { name: string; type: string; data: ArrayBuffer },
  hint: string | null,
): Promise<PlanAnalysis> {
  const userText = `Podklad: ${file.name}.${hint ? `\nPokyn od rozpočtáře: ${hint}` : ''}`;

  let raw: Record<string, unknown>;
  if (file.type === 'application/pdf') {
    const text = (await pdfToText(env, file.name, file.data)).slice(0, 30_000);
    if (!text.trim()) {
      return empty('PDF neobsahuje čitelný text (nejspíš sken). Nahrajte plánek jako obrázek (JPG/PNG).');
    }
    raw = await runJson(env, { system: SYSTEM, user: `${userText}\n\nText vytažený z PDF:\n${text}`, think: true });
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
