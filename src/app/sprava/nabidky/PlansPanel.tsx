'use client';

// Plánky k nabídce: nahrání (obrázky se v prohlížeči zmenší), přečtení AI a
// návrh rozměrů s tlačítkem „Použít“. AI jen navrhuje – nic se nepropíše samo.

import { useRef, useState } from 'react';
import { formatArea, formatNumber } from '@/lib/quotes/calc';
import { materialLabel, type PlanAnalysis, type QuoteFile } from '@/lib/quotes/model';
import { cardCls, fileUrl, ghostBtn, headingCls, inputCls, labelCls } from './ui';
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
      <p className="text-sm text-neutral-dark/50 mb-4">AI z plánku navrhne délku řezu, tloušťku a m². Návrh vždy zkontrolujte – do nabídky se propíše až tlačítkem „Použít“.</p>

      {files.length > 0 && (
        <ul className="space-y-3 mb-5">
          {files.map((file) => {
            const a = parseAnalysis(file.analysis);
            return (
              <li key={file.id} className="rounded-2xl border border-neutral-light p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a href={fileUrl(file.r2_key)} target="_blank" rel="noopener" className="font-bold text-sm hover:text-primary-ink break-all">
                    {file.filename}
                  </a>
                  <form action={reanalyzeFormAction} className="flex items-center gap-2">
                    <input type="hidden" name="file_id" value={file.id} />
                    <input name="hint" placeholder="Pokyn pro AI (volitelné)" className="border-2 border-neutral-light rounded-lg px-2 py-1 text-xs w-48 outline-none focus:border-primary" />
                    <button type="submit" disabled={reanalyzing} className={ghostBtn}>{reanalyzing ? 'Čtu…' : a ? 'Přečíst znovu' : 'Přečíst (AI)'}</button>
                  </form>
                </div>
                {a?.error ? (
                  <p className="mt-2 text-sm text-red-700">Plánek se nepodařilo přečíst: {a.error}</p>
                ) : a ? (
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                    <div className="text-sm">
                      <div className="flex flex-wrap gap-x-5 gap-y-1">
                        <span>Délka: <strong>{a.lengthM !== null ? `${formatNumber(a.lengthM)} m` : '—'}</strong></span>
                        <span>Tloušťka: <strong>{a.thicknessCm !== null ? `${formatNumber(a.thicknessCm)} cm` : '—'}</strong></span>
                        <span>Plocha: <strong>{a.areaM2 !== null ? formatArea(a.areaM2) : '—'}</strong></span>
                        {a.material && <span>Zdivo: <strong>{materialLabel(a.material)}</strong></span>}
                        <span className="text-neutral-dark/50">jistota: {CONFIDENCE[a.confidence] ?? a.confidence}</span>
                      </div>
                      {a.reasoning && <p className="text-neutral-dark/60 mt-1">{a.reasoning}</p>}
                    </div>
                    {(a.lengthM !== null || a.thicknessCm !== null || a.areaM2 !== null) && (
                      <button type="button" onClick={() => onApply(a)} className="text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-primary/15 text-primary-ink hover:bg-primary/25">
                        Použít
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-neutral-dark/50">Bez rozboru.</p>
                )}
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
          <input name="hint" placeholder="např. řezat jen obvodové zdi" className={inputCls} />
        </label>
        <button type="submit" disabled={uploading || preparing} className="btn-primary py-2.5 px-6 uppercase tracking-widest text-xs disabled:opacity-60">
          {uploading ? 'Čtu plánek…' : 'Nahrát a přečíst'}
        </button>
      </form>
      {uploading && <p className="text-[11px] text-neutral-dark/50 mt-2">Čtení plánku trvá obvykle 20–60 s.</p>}
    </section>
  );
}
