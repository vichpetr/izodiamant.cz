'use client';

// Krok 1: přílohy nabídky a co z nich AI vyčetla.
//
// Každou přílohu nejdřív levný model ohodnotí (půdorys / řez / logo / výkaz…).
// Relevantní přečte silný model – z výkresu rozměry obvodových zdí, z výkazu
// výměr řádky s naší prací. Nerelevantní jsou sbalené na konci a dají se ručně
// přehlasovat. Návrh se do formuláře propíše tlačítkem „Použít“ (u nabídek
// z e-mailu se do prázdných polí propíše sám).

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LANO_THICKNESS_CM, formatArea, formatNumber, recommendedTechnology } from '@/lib/quotes/calc';
import {
  DOC_KIND_LABELS,
  RELEVANCE_LABELS,
  RELEVANCE_ORDER,
  RELEVANT,
  effectiveRelevance,
  isSpreadsheet,
  isVykaz,
  materialLabel,
  parseFileAnalysis,
  technologyLabel,
  type FileAnalysis,
  type PlanAnalysis,
  type QuoteFile,
  type Relevance,
  type VykazAnalysis,
} from '@/lib/quotes/model';
import { cn } from '@/lib/utils';
import { cardCls, fileUrl, ghostBtn, headingCls, inputCls, labelCls, previewUrl } from './ui';
import Working from './Working';
import { useToastAction, type Action } from './useToastAction';
import { useWizard } from './QuoteWizard';

const MAX_SIDE = 2400;

/** Zmenší velké fotky/skeny plánků – server action má limit velikosti a AI stačí ~2400 px. */
async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.size < 1.5 * 1024 * 1024) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  return blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file;
}

const CONFIDENCE: Record<PlanAnalysis['confidence'], string> = { nizka: 'nízká', stredni: 'střední', vysoka: 'vysoká' };

const RELEVANCE_STYLE: Record<Relevance, string> = {
  vysoka: 'bg-emerald-100 text-emerald-900',
  stredni: 'bg-primary/20 text-primary-ink',
  nizka: 'bg-neutral-light text-neutral-dark/60',
  zadna: 'bg-neutral-light text-neutral-dark/40',
};

/** Proč z rozboru vychází lano – ať uživatel vidí, co o tom rozhodlo. */
export function whyLano(a: Pick<PlanAnalysis, 'material' | 'thicknessCm'>): string {
  if (a.material === 'kamen' || a.material === 'beton') return ' (podle materiálu)';
  if (a.thicknessCm !== null && a.thicknessCm >= LANO_THICKNESS_CM) return ` (zeď od ${LANO_THICKNESS_CM} cm)`;
  return '';
}

/** Pořadí v seznamu: relevantní nahoře, rozpracované hned za nimi, nerelevantní na konec. */
function rank(f: QuoteFile): number {
  const r = effectiveRelevance(f);
  return r ? RELEVANCE_ORDER.indexOf(r) : 1.5;
}

export default function AttachmentsPanel({
  quoteId,
  files,
  uploadAction,
  reanalyzeAction,
  relevanceAction,
  includeAction,
}: {
  quoteId: number;
  files: QuoteFile[];
  uploadAction: Action;
  reanalyzeAction: Action;
  relevanceAction: Action;
  includeAction: Action;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [uploadFormAction, uploading] = useToastAction(uploadAction, () => formRef.current?.reset());
  const [preparing, setPreparing] = useState(false);
  const [zoom, setZoom] = useState<QuoteFile | null>(null);
  const router = useRouter();

  // Hodnocení a čtení běží ve frontě na pozadí – dokud není hotové, obnovujeme
  // data, aby se výsledek objevil sám, bez ručního refreshe.
  const pending = files.some((f) => parseFileAnalysis(f.analysis)?.pending);
  useEffect(() => {
    if (!pending) return;
    const id = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(id);
  }, [pending, router]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (!input.files?.length) return;
    setPreparing(true);
    try {
      const shrunk = await Promise.all(Array.from(input.files).map(shrinkImage));
      const dt = new DataTransfer();
      shrunk.forEach((f) => dt.items.add(f));
      input.files = dt.files;
    } finally {
      setPreparing(false);
    }
  };

  const sorted = [...files].sort((a, b) => rank(a) - rank(b));
  const isIrrelevant = (f: QuoteFile) => {
    const r = effectiveRelevance(f);
    return r !== null && !RELEVANT.includes(r) && !parseFileAnalysis(f.analysis)?.pending && !parseFileAnalysis(f.analysis)?.kind;
  };
  const relevant = sorted.filter((f) => !isIrrelevant(f));
  const irrelevant = sorted.filter(isIrrelevant);

  const card = (file: QuoteFile) => (
    <FileCard
      key={file.id}
      file={file}
      reanalyzeAction={reanalyzeAction}
      relevanceAction={relevanceAction}
      includeAction={includeAction}
      onZoom={() => setZoom(file)}
    />
  );

  return (
    <section className={cardCls}>
      <h2 className={`${headingCls} mb-1`}>Přílohy a podklady</h2>
      <p className="text-sm text-neutral-dark/50 mb-4">
        AI přílohy roztřídí a relevantní přečte: z výkresu délku obvodových zdí, tloušťku a m², z výkazu výměr řádky s naší prací.
        Návrh zkontrolujte podle náhledu a tlačítkem „Použít“ ho převezměte do nabídky. Čtení běží na pozadí – u PDF to trvá déle.
      </p>

      {files.length === 0 && <p className="text-sm text-neutral-dark/50 mb-5">Zatím žádné přílohy.</p>}
      {relevant.length > 0 && <ul className="space-y-3 mb-5">{relevant.map(card)}</ul>}
      {irrelevant.length > 0 && (
        <details className="mb-5 rounded-2xl bg-neutral-light/50 px-4 py-3">
          <summary className="cursor-pointer text-[11px] font-black uppercase tracking-widest text-neutral-dark/50">
            Nerelevantní přílohy ({irrelevant.length}) – AI je nečetla
          </summary>
          <ul className="space-y-3 mt-3">{irrelevant.map(card)}</ul>
        </details>
      )}

      <form ref={formRef} action={uploadFormAction} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <input type="hidden" name="id" value={quoteId} />
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Přidat soubor (JPG, PNG, PDF, výkaz XLSX · max 10 MB)</span>
          <input
            type="file"
            name="files"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf,.xlsx,.xls,.csv"
            onChange={onFiles}
            className="text-sm"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Pokyn pro AI (volitelné)</span>
          <input name="hint" placeholder="např. započítej i vnitřní nosné zdi" className={inputCls} />
        </label>
        <button type="submit" disabled={uploading || preparing} className="btn-primary py-2.5 px-6 uppercase tracking-widest text-xs disabled:opacity-60">
          {preparing ? 'Připravuji soubor…' : uploading ? 'Nahrávám…' : 'Nahrát a přečíst'}
        </button>
      </form>
      {uploading && <Working label="Nahrávám soubor…" hint="Po nahrání se čtení spustí na pozadí." className="mt-3" />}

      {zoom && (
        <div className="fixed inset-0 z-[120] bg-black/80 p-4 flex items-center justify-center" onClick={() => setZoom(null)} role="presentation">
          <div
            className="max-w-6xl w-full max-h-full overflow-auto bg-white rounded-2xl p-3"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Náhled souboru ${zoom.filename}`}
          >
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-sm font-bold break-all">{zoom.filename}</span>
              <div className="flex items-center gap-3">
                <a href={fileUrl(zoom.r2_key)} className="text-[11px] font-black uppercase tracking-widest text-primary-ink hover:underline">Stáhnout originál</a>
                <button type="button" onClick={() => setZoom(null)} aria-label="Zavřít" className="text-neutral-dark/40 hover:text-neutral-dark text-2xl leading-none px-2">×</button>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl(zoom.id)} alt={`Náhled souboru ${zoom.filename}`} className="w-full h-auto" />
            {zoom.content_type === 'application/pdf' && (
              <p className="text-[11px] text-neutral-dark/40 mt-2">Náhled ukazuje první stránku PDF. Celý soubor otevřete přes „Stáhnout originál“.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function FileCard({
  file,
  reanalyzeAction,
  relevanceAction,
  includeAction,
  onZoom,
}: {
  file: QuoteFile;
  reanalyzeAction: Action;
  relevanceAction: Action;
  includeAction: Action;
  onZoom: () => void;
}) {
  const [reanalyzeFormAction, reanalyzing] = useToastAction(reanalyzeAction);
  const [relevanceFormAction, changingRelevance] = useToastAction(relevanceAction);
  const a = parseFileAnalysis(file.analysis);
  const relevance = effectiveRelevance(file);
  const spreadsheet = isSpreadsheet(file);

  return (
    <li className="rounded-2xl border border-neutral-light bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <a href={fileUrl(file.r2_key)} className="font-bold text-sm hover:text-primary-ink break-all" title="Stáhnout původní soubor">
            {file.filename}
          </a>
          {file.doc_kind && (
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/50">{DOC_KIND_LABELS[file.doc_kind] ?? file.doc_kind}</span>
          )}
          {relevance && (
            <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full', RELEVANCE_STYLE[relevance])}>
              {RELEVANCE_LABELS[relevance]}
              {file.relevance_override && ' · ručně'}
            </span>
          )}
        </div>
        <form action={relevanceFormAction} className="flex items-center gap-2">
          <input type="hidden" name="file_id" value={file.id} />
          <select
            name="relevance"
            defaultValue={file.relevance_override ?? ''}
            disabled={changingRelevance}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            aria-label={`Relevance souboru ${file.filename}`}
            className="border-2 border-neutral-light rounded-lg px-2 py-1 text-xs bg-white"
          >
            <option value="">Podle AI{file.relevance ? ` (${RELEVANCE_LABELS[file.relevance].toLowerCase()})` : ''}</option>
            <option value="vysoka">Relevantní – číst</option>
            <option value="zadna">Nerelevantní – nečíst</option>
          </select>
        </form>
      </div>
      {file.relevance_reason && <p className="text-xs text-neutral-dark/50 -mt-2 mb-3">{file.relevance_reason}</p>}

      <div className="flex flex-wrap gap-4">
        {spreadsheet ? (
          <a
            href={fileUrl(file.r2_key)}
            className="shrink-0 h-24 w-24 rounded-xl border border-neutral-light flex flex-col items-center justify-center text-emerald-800 bg-emerald-50 hover:border-primary"
            title="Stáhnout tabulku"
          >
            <span className="text-2xl font-black">XLS</span>
            <span className="text-[10px] font-black uppercase tracking-widest">tabulka</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={onZoom}
            className="shrink-0 rounded-xl border border-neutral-light overflow-hidden hover:border-primary transition-colors"
            title="Zvětšit náhled"
          >
            {/* Náhled servíruje worker (u PDF vykreslenou první stránku). Běžný <img>,
                ne next/image – jde o privátní soubor za přihlášením. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl(file.id)} alt={`Náhled souboru ${file.filename}`} className="h-36 w-auto max-w-[14rem] object-contain bg-white" loading="lazy" />
          </button>
        )}

        <div className="flex-1 min-w-[16rem] text-sm">
          {a?.pending ? (
            <Working
              label={file.relevance ? 'AI čte přílohu…' : 'AI hodnotí přílohu…'}
              hint="Obvykle do minuty, u vícestránkového PDF i déle. Výsledek se objeví sám."
              since={a.startedAt}
            />
          ) : a?.error ? (
            <p className="text-red-700">Soubor se nepodařilo přečíst: {a.error}</p>
          ) : isVykaz(a) ? (
            <VykazResult file={file} a={a} includeAction={includeAction} />
          ) : a?.kind === 'plan' || (a && 'lengthM' in a) ? (
            <PlanResult a={a as PlanAnalysis} label={`příloha: ${file.filename}`} />
          ) : (
            <p className="text-neutral-dark/50">
              {relevance && !RELEVANT.includes(relevance) ? 'AI přílohu nečetla – podle hodnocení nepomůže k nabídce.' : 'Bez rozboru – klikněte na „Přečíst (AI)“.'}
            </p>
          )}

          <form action={reanalyzeFormAction} className="flex flex-wrap items-center gap-2 mt-3">
            <input type="hidden" name="file_id" value={file.id} />
            <input name="hint" placeholder="Pokyn pro AI (volitelné)" className="border-2 border-neutral-light rounded-lg px-2 py-1 text-xs w-48 outline-none focus:border-primary" />
            <button type="submit" disabled={reanalyzing || Boolean(a?.pending)} className={ghostBtn}>
              {a?.pending ? 'Zpracovává se…' : reanalyzing ? 'Zařazuji…' : a && 'lengthM' in a ? 'Přečíst znovu' : 'Přečíst (AI)'}
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}

export function Sources({ sources }: { sources?: string[] }) {
  if (!sources?.length) return null;
  return (
    <div className="mt-2">
      <div className={`${labelCls} ml-0`}>Odkud to AI vzala</div>
      <ul className="mt-1 space-y-0.5 text-neutral-dark/70">
        {sources.map((src, i) => (
          <li key={i} className="pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-primary-ink">
            {src}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ApplyButton({ dims }: { dims: Parameters<NonNullable<ReturnType<typeof useWizard>>['applyDims']>[0] }) {
  const wizard = useWizard();
  if (!wizard || (dims.lengthM === null && dims.thicknessCm === null && dims.areaM2 === null)) return null;
  return (
    <button
      type="button"
      onClick={() => wizard.applyDims(dims)}
      className="mt-3 text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-primary/15 text-primary-ink hover:bg-primary/25"
      title="Propíše rozměry do formuláře v kroku 2 (před uložením je můžete upravit)"
    >
      Použít v nabídce →
    </button>
  );
}

export function Dimensions({ a }: { a: Pick<PlanAnalysis, 'lengthM' | 'thicknessCm' | 'areaM2' | 'material' | 'confidence'> }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1">
      <span>Obvodové zdi: <strong>{a.lengthM !== null ? `${formatNumber(a.lengthM)} m` : '—'}</strong></span>
      <span>Tloušťka: <strong>{a.thicknessCm !== null ? `${formatNumber(a.thicknessCm)} cm` : '—'}</strong></span>
      <span title="Délka × tloušťka – za tuto plochu je cena z ceníku">Řezná plocha: <strong>{a.areaM2 !== null ? formatArea(a.areaM2) : '—'}</strong></span>
      {a.material && <span>Zdivo: <strong>{materialLabel(a.material)}</strong></span>}
      <span className="text-neutral-dark/50">jistota: {CONFIDENCE[a.confidence] ?? a.confidence}</span>
    </div>
  );
}

function PlanResult({ a, label }: { a: PlanAnalysis; label: string }) {
  return (
    <>
      <Dimensions a={a} />
      {a.reasoning && <p className="text-neutral-dark/60 mt-1">{a.reasoning}</p>}
      {(a.material || a.thicknessCm !== null) && (
        <p className="text-neutral-dark/60 mt-1">
          Vychází z toho <strong className="text-neutral-dark">{technologyLabel(recommendedTechnology(a.material, a.thicknessCm))}</strong>
          {whyLano(a)}.
        </p>
      )}
      <Sources sources={a.sources} />
      <ApplyButton dims={{ ...a, label }} />
    </>
  );
}

function VykazResult({ file, a, includeAction }: { file: QuoteFile; a: VykazAnalysis & FileAnalysis; includeAction: Action }) {
  const [includeFormAction, saving] = useToastAction(includeAction);
  return (
    <>
      <Dimensions a={a} />
      <VykazRows rows={a.rows} />
      {a.reasoning && <p className="text-neutral-dark/60 mt-2">{a.reasoning}</p>}
      <Sources sources={a.sources} />
      {a.warnings.length > 0 && (
        <ul className="mt-2 space-y-1 text-amber-900 bg-amber-50 rounded-xl px-3 py-2 text-xs">
          {a.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
      {a.fillable && a.rows.length > 0 && (
        <form action={includeFormAction} className="mt-3">
          <input type="hidden" name="file_id" value={file.id} />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="include"
              value="1"
              defaultChecked={file.include_in_email === 1}
              disabled={saving}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className="h-4 w-4 accent-primary"
            />
            Přiložit vyplněný výkaz k e-mailu{' '}
            <span className="text-neutral-dark/40">(vyplní se našimi cenami spolu s PDF; u variant zvlášť za každou technologii – návrh ke kontrole)</span>
          </label>
        </form>
      )}
      <ApplyButton
        dims={{ ...a, label: `výkaz: ${file.filename}`, technology: a.rows.find((r) => r.technology)?.technology ?? null }}
      />
    </>
  );
}

/** Řádky výkazu, které AI přiřadila k naší práci. */
export function VykazRows({ rows }: { rows: VykazAnalysis['rows'] }) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[10px] font-black uppercase tracking-widest text-neutral-dark/40">
            <th className="pr-3 py-1">Řádek</th>
            <th className="pr-3 py-1">Položka výkazu</th>
            <th className="pr-3 py-1 text-right">Množství</th>
            <th className="pr-3 py-1">Naše technologie</th>
            <th className="py-1">Cena do</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.sheet}-${r.row}`} className="border-t border-neutral-light align-top">
              <td className="pr-3 py-1.5 whitespace-nowrap text-neutral-dark/50">{r.row}</td>
              <td className="pr-3 py-1.5">{r.description}</td>
              <td className="pr-3 py-1.5 text-right whitespace-nowrap">
                {r.quantity !== null ? formatNumber(r.quantity) : '—'} {r.unit}
              </td>
              <td className="pr-3 py-1.5 whitespace-nowrap">{r.technology ? technologyLabel(r.technology) : '—'}</td>
              <td className="py-1.5 whitespace-nowrap text-neutral-dark/50">{r.unitPriceCell ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
