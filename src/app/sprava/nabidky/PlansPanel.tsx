'use client';

// Plánky k nabídce: nahrání (obrázky se v prohlížeči zmenší), přečtení AI a
// návrh rozměrů s tlačítkem „Použít“. AI jen navrhuje – nic se nepropíše samo.
//
// U každého souboru je náhled (u PDF první vykreslená stránka) a poznámky, odkud
// AI který údaj vzala, ať se návrh dá rychle ověřit proti výkresu.

import { useEffect, useRef, useState } from 'react';
import { LANO_THICKNESS_CM, formatArea, formatNumber, recommendedTechnology } from '@/lib/quotes/calc';
import { materialLabel, technologyLabel, type PlanAnalysis, type QuoteFile } from '@/lib/quotes/model';
import { cardCls, fileUrl, ghostBtn, headingCls, inputCls, labelCls, previewUrl } from './ui';
import { useToastAction, type Action } from './useToastAction';

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

function parseAnalysis(raw: string | null): (PlanAnalysis & { error?: string }) | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Proč z rozboru vychází lano – ať uživatel vidí, co o tom rozhodlo. */
function whyLano(a: PlanAnalysis): string {
  if (a.material === 'kamen' || a.material === 'beton') return ' (podle materiálu)';
  if (a.thicknessCm !== null && a.thicknessCm >= LANO_THICKNESS_CM) return ` (zeď od ${LANO_THICKNESS_CM} cm)`;
  return '';
}

export default function PlansPanel({
  quoteId,
  files,
  uploadAction,
  reanalyzeAction,
  onApply,
}: {
  quoteId: number;
  files: QuoteFile[];
  uploadAction: Action;
  reanalyzeAction: Action;
  onApply: (a: PlanAnalysis) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [uploadFormAction, uploading] = useToastAction(uploadAction, () => formRef.current?.reset());
  const [reanalyzeFormAction, reanalyzing] = useToastAction(reanalyzeAction);
  const [preparing, setPreparing] = useState(false);
  const [zoom, setZoom] = useState<QuoteFile | null>(null);

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

  return (
    <section className={cardCls}>
      <h2 className={`${headingCls} mb-1`}>Plánky a výkresy</h2>
      <p className="text-sm text-neutral-dark/50 mb-4">
        AI z plánku navrhne délku obvodových zdí, tloušťku a m². Návrh zkontrolujte podle náhledu – do nabídky se propíše až tlačítkem „Použít“.
        U PDF se stránky nejdřív vykreslí na obrázky, proto to trvá déle než u fotky.
      </p>

      {files.length > 0 && (
        <ul className="space-y-3 mb-5">
          {files.map((file) => {
            const a = parseAnalysis(file.analysis);
            return (
              <li key={file.id} className="rounded-2xl border border-neutral-light p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <a href={fileUrl(file.r2_key)} className="font-bold text-sm hover:text-primary-ink break-all" title="Stáhnout původní soubor">
                    {file.filename}
                  </a>
                  <form action={reanalyzeFormAction} className="flex items-center gap-2">
                    <input type="hidden" name="file_id" value={file.id} />
                    <input name="hint" placeholder="Pokyn pro AI (volitelné)" className="border-2 border-neutral-light rounded-lg px-2 py-1 text-xs w-48 outline-none focus:border-primary" />
                    <button type="submit" disabled={reanalyzing} className={ghostBtn}>{reanalyzing ? 'Čtu…' : a ? 'Přečíst znovu' : 'Přečíst (AI)'}</button>
                  </form>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => setZoom(file)}
                    className="shrink-0 rounded-xl border border-neutral-light overflow-hidden hover:border-primary transition-colors"
                    title="Zvětšit náhled"
                  >
                    {/* Náhled servíruje worker (u PDF vykreslenou první stránku). Běžný <img>,
                        ne next/image – jde o privátní soubor za přihlášením. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl(file.id)} alt={`Náhled souboru ${file.filename}`} className="h-36 w-auto max-w-[14rem] object-contain bg-white" loading="lazy" />
                  </button>

                  <div className="flex-1 min-w-[16rem] text-sm">
                    {a?.error ? (
                      <p className="text-red-700">Plánek se nepodařilo přečíst: {a.error}</p>
                    ) : a ? (
                      <>
                        <div className="flex flex-wrap gap-x-5 gap-y-1">
                          <span>Obvodové zdi: <strong>{a.lengthM !== null ? `${formatNumber(a.lengthM)} m` : '—'}</strong></span>
                          <span>Tloušťka: <strong>{a.thicknessCm !== null ? `${formatNumber(a.thicknessCm)} cm` : '—'}</strong></span>
                          <span>Plocha: <strong>{a.areaM2 !== null ? formatArea(a.areaM2) : '—'}</strong></span>
                          {a.material && <span>Zdivo: <strong>{materialLabel(a.material)}</strong></span>}
                          <span className="text-neutral-dark/50">jistota: {CONFIDENCE[a.confidence] ?? a.confidence}</span>
                        </div>
                        {a.reasoning && <p className="text-neutral-dark/60 mt-1">{a.reasoning}</p>}
                        {(a.material || a.thicknessCm !== null) && (
                          <p className="text-neutral-dark/60 mt-1">
                            Vychází z toho <strong className="text-neutral-dark">{technologyLabel(recommendedTechnology(a.material, a.thicknessCm))}</strong>
                            {whyLano(a)}.
                          </p>
                        )}
                        {a.sources && a.sources.length > 0 && (
                          <div className="mt-2">
                            <div className={`${labelCls} ml-0`}>Odkud to AI vzala</div>
                            <ul className="mt-1 space-y-0.5 text-neutral-dark/70">
                              {a.sources.map((src, i) => (
                                <li key={i} className="pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-primary-ink">
                                  {src}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {(a.lengthM !== null || a.thicknessCm !== null || a.areaM2 !== null) && (
                          <button type="button" onClick={() => onApply(a)} className="mt-3 text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-primary/15 text-primary-ink hover:bg-primary/25">
                            Použít
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-neutral-dark/50">Bez rozboru – klikněte na „Přečíst (AI)“.</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form ref={formRef} action={uploadFormAction} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <input type="hidden" name="id" value={quoteId} />
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Soubor (JPG, PNG, PDF · max 10 MB)</span>
          <input type="file" name="files" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={onFiles} className="text-sm" required />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Pokyn pro AI (volitelné)</span>
          <input name="hint" placeholder="např. započítej i vnitřní nosné zdi" className={inputCls} />
        </label>
        <button type="submit" disabled={uploading || preparing} className="btn-primary py-2.5 px-6 uppercase tracking-widest text-xs disabled:opacity-60">
          {uploading ? 'Čtu plánek…' : 'Nahrát a přečíst'}
        </button>
      </form>
      {uploading && <p className="text-[11px] text-neutral-dark/50 mt-2">Čtení plánku trvá obvykle 30 s (obrázek) až 90 s (PDF).</p>}

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
