'use client';

// Krok 2, pravý sloupec: co AI vyčetla z podkladů (krok 1), aby šlo návrh převzít
// i tady – bez přepínání zpět. „Náhled“ otevře přílohu v okně i s rozborem.

import { useEffect, useState } from 'react';
import { formatArea, formatNumber, recommendedTechnology } from '@/lib/quotes/calc';
import {
  DOC_KIND_LABELS,
  isSpreadsheet,
  isVykaz,
  parseFileAnalysis,
  technologyLabel,
  vykazSegments,
  type PlanAnalysis,
  type QuoteFile,
  type VykazAnalysis,
} from '@/lib/quotes/model';
import { Dimensions, Sources, VykazRows, whyLano } from './AttachmentsPanel';
import type { Dims } from './QuoteWizard';
import { cardCls, fileUrl, ghostBtn, headingCls, previewUrl } from './ui';

type Readable = PlanAnalysis | VykazAnalysis;

/** Rozbor souboru, pokud z něj AI něco vyčetla (ne rozpracovaný, ne chyba). */
function readable(file: QuoteFile): Readable | null {
  const a = parseFileAnalysis(file.analysis);
  if (!a || a.pending || a.error || !('lengthM' in a)) return null;
  return a;
}

function dimsOf(file: QuoteFile, a: Readable): Dims {
  return isVykaz(a)
    ? { ...a, label: `výkaz: ${file.filename}`, technology: a.rows.find((r) => r.technology)?.technology ?? null, segments: vykazSegments(a) }
    : { ...a, label: `příloha: ${file.filename}` };
}

function hasDims(a: Readable): boolean {
  return a.lengthM !== null || a.thicknessCm !== null || a.areaM2 !== null;
}

function shortDims(a: Readable): string {
  return [
    a.lengthM !== null ? `${formatNumber(a.lengthM)} m` : null,
    a.thicknessCm !== null ? `${formatNumber(a.thicknessCm)} cm` : null,
    a.areaM2 !== null ? formatArea(a.areaM2) : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

export default function SuggestionsPanel({ files, onApply }: { files: QuoteFile[]; onApply: (dims: Dims) => void }) {
  const [open, setOpen] = useState<QuoteFile | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (files.length === 0) return null;
  // Návrh = příloha, ze které AI vyčetla aspoň nějaký rozměr; zbytek jen k náhledu.
  const suggestions = files
    .map((f) => ({ file: f, a: readable(f) }))
    .filter((s): s is { file: QuoteFile; a: Readable } => s.a !== null && hasDims(s.a));
  const others = files.filter((f) => !suggestions.some((s) => s.file.id === f.id));
  const pending = files.filter((f) => parseFileAnalysis(f.analysis)?.pending).length;
  const openAnalysis = open ? readable(open) : null;

  const apply = (file: QuoteFile, a: Readable) => {
    onApply(dimsOf(file, a));
    setOpen(null);
  };

  return (
    <section className={cardCls}>
      <h2 className={`${headingCls} mb-1`}>Návrhy z podkladů</h2>
      <p className="text-[11px] text-neutral-dark/50 mb-3">Co AI vyčetla z příloh (krok 1). „Použít“ propíše rozměry do formuláře.</p>
      {pending > 0 && <p className="text-xs text-neutral-dark/60 mb-3">AI ještě čte {pending === 1 ? '1 přílohu' : `${pending} přílohy`} – výsledek se objeví v kroku 1.</p>}

      {suggestions.length === 0 ? (
        <p className="text-sm text-neutral-dark/50">Z příloh zatím není žádný návrh.</p>
      ) : (
        <ul className="space-y-2">
          {suggestions.map(({ file, a }) => (
            <li key={file.id} className="rounded-xl bg-neutral-light/60 p-3 text-sm">
              <div className="font-bold truncate" title={file.filename}>{file.filename}</div>
              <div className="text-[11px] text-neutral-dark/50">
                {isVykaz(a) ? 'Výkaz výměr' : file.doc_kind ? DOC_KIND_LABELS[file.doc_kind] : 'Příloha'} · jistota{' '}
                {a.confidence === 'vysoka' ? 'vysoká' : a.confidence === 'stredni' ? 'střední' : 'nízká'}
              </div>
              <div className="mt-1 font-medium">{shortDims(a)}</div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => apply(file, a)}
                  className="text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-primary/15 text-primary-ink hover:bg-primary/25"
                >
                  Použít
                </button>
                <button type="button" onClick={() => setOpen(file)} className={ghostBtn}>
                  Náhled
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {others.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-[11px] font-black uppercase tracking-widest text-neutral-dark/50">Ostatní přílohy ({others.length})</summary>
          <ul className="mt-2 space-y-1 text-sm">
            {others.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-2">
                <span className="truncate" title={f.filename}>{f.filename}</span>
                <button type="button" onClick={() => setOpen(f)} className="text-[11px] font-black uppercase tracking-widest text-primary-ink hover:underline shrink-0">
                  Náhled
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}

      {open && (
        <div className="fixed inset-0 z-[120] bg-black/70 p-4 flex items-start justify-center overflow-auto" onClick={() => setOpen(null)} role="presentation">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full my-6 p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Náhled přílohy ${open.filename}`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <h3 className="font-black text-neutral-dark break-all">{open.filename}</h3>
                {open.relevance_reason && <p className="text-xs text-neutral-dark/50 mt-0.5">{open.relevance_reason}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a href={fileUrl(open.r2_key)} className="text-[11px] font-black uppercase tracking-widest text-primary-ink hover:underline">
                  Stáhnout originál
                </a>
                <button type="button" onClick={() => setOpen(null)} aria-label="Zavřít" className="text-neutral-dark/40 hover:text-neutral-dark text-2xl leading-none px-2">
                  ×
                </button>
              </div>
            </div>

            <div className={openAnalysis ? 'grid lg:grid-cols-[3fr_2fr] gap-6 items-start' : ''}>
              {isSpreadsheet(open) ? (
                <div className="rounded-2xl bg-emerald-50 text-emerald-900 p-6 text-sm">
                  Tabulka se v prohlížeči nezobrazí – otevřete ji přes „Stáhnout originál“. Níže jsou řádky, které AI přiřadila k naší práci.
                </div>
              ) : (
                <div>
                  {/* Privátní soubor za přihlášením – běžný <img>, ne next/image. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl(open.id)} alt={`Náhled přílohy ${open.filename}`} className="w-full h-auto rounded-xl border border-neutral-light" />
                  {open.content_type === 'application/pdf' && (
                    <p className="text-[11px] text-neutral-dark/40 mt-2">Náhled ukazuje první stránku PDF. Celý soubor otevřete přes „Stáhnout originál“.</p>
                  )}
                </div>
              )}

              {openAnalysis && (
                <div className="text-sm">
                  <Dimensions a={openAnalysis} />
                  {openAnalysis.reasoning && <p className="text-neutral-dark/60 mt-2">{openAnalysis.reasoning}</p>}
                  {!isVykaz(openAnalysis) && (openAnalysis.material || openAnalysis.thicknessCm !== null) && (
                    <p className="text-neutral-dark/60 mt-1">
                      Vychází z toho{' '}
                      <strong className="text-neutral-dark">{technologyLabel(recommendedTechnology(openAnalysis.material, openAnalysis.thicknessCm))}</strong>
                      {whyLano(openAnalysis)}.
                    </p>
                  )}
                  {isVykaz(openAnalysis) && <VykazRows rows={openAnalysis.rows} />}
                  <Sources sources={openAnalysis.sources} />
                  {isVykaz(openAnalysis) && openAnalysis.warnings.length > 0 && (
                    <ul className="mt-2 space-y-1 text-amber-900 bg-amber-50 rounded-xl px-3 py-2 text-xs">
                      {openAnalysis.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                  {hasDims(openAnalysis) && (
                    <button
                      type="button"
                      onClick={() => apply(open, openAnalysis)}
                      className="mt-4 btn-primary py-2.5 px-5 uppercase tracking-widest text-xs"
                    >
                      Použít v nabídce
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
