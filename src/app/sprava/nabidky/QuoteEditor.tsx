'use client';

// Krok 2 – editor nabídky: klient, místo, specifikace zdiva, opakovatelné položky
// (technologie × m² × cena/m²), doprava a texty do PDF. Nahoře pruh se souhrnem
// ceny a tlačítkem „Vygenerovat přílohy“; formulář se ukládá sám po každé změně.
//
// Cena za m² se předvyplní středem ceníku (calculator.json), ale poslední slovo
// má uživatel – přepsanou cenu nic automaticky nemění. Návrhy z příloh (krok 1)
// se do formuláře propíšou po kliknutí na „Použít“. U údajů, které doplnila AI,
// je štítek s původem; po ruční změně a uložení zmizí.

import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import {
  computeTotals,
  cutArea,
  duplicateVariantTechnologies,
  missingInputs,
  formatArea,
  formatCzk,
  formatNumber,
  pricePerMeter,
  recommendedTechnology,
  suggestedPricePerM2,
  variantsError,
} from '@/lib/quotes/calc';
import {
  DEFAULT_CONDITIONS,
  MATERIALS,
  TECHNOLOGIES,
  isTechnology,
  parseJsonArray,
  technologyLabel,
  type Quote,
  type QuoteFile,
  type QuoteItem,
  type QuoteMode,
  type TechnologyId,
} from '@/lib/quotes/model';
import { toast } from '../toast';
import { useWizard, type Dims } from './QuoteWizard';
import SuggestionsPanel from './SuggestionsPanel';
import Working from './Working';
import { cardCls, headingCls, inputCls, labelCls } from './ui';
import { submitWithoutReset, useToastAction, type Action } from './useToastAction';

interface ItemDraft {
  key: number;
  technology: TechnologyId;
  /** Délka úseku zdi (m) a tloušťka (cm) – z nich se počítá řezná plocha. */
  length: string;
  thickness: string;
  /** Ručně zadaná řezná plocha – jen když délka nebo tloušťka chybí. */
  area: string;
  price: string;
}

const toNum = (v: string) => {
  const n = Number(v.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};
const toStr = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v).replace('.', ','));

let nextKey = 1;

function parseSources(raw: string | null): Record<string, string> {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export default function QuoteEditor({
  quote,
  items: initialItems,
  files,
  saveAction,
}: {
  quote: Quote;
  items: QuoteItem[];
  /** Přílohy s rozborem z kroku 1 – vpravo jako „Návrhy z podkladů“. */
  files: QuoteFile[];
  saveAction: Action;
}) {
  const wizard = useWizard();
  const [f, setF] = useState({
    client_name: quote.client_name,
    client_email: quote.client_email ?? '',
    client_phone: quote.client_phone ?? '',
    site_name: quote.site_name ?? '',
    site_address: quote.site_address ?? '',
    city: quote.city ?? '',
    material: quote.material ?? '',
    thickness_cm: toStr(quote.thickness_cm),
    length_m: toStr(quote.length_m),
    transport_price: quote.transport_price ? String(quote.transport_price) : '',
    intro: quote.intro ?? '',
    conditions: (quote.conditions !== null ? parseJsonArray(quote.conditions) : DEFAULT_CONDITIONS).join('\n'),
    note: quote.note ?? '',
  });
  const [mode, setMode] = useState<QuoteMode>(quote.mode);
  const [items, setItems] = useState<ItemDraft[]>(() =>
    initialItems.map((i) => ({
      key: nextKey++,
      technology: i.technology,
      length: toStr(i.length_m),
      thickness: toStr(i.thickness_cm),
      area: toStr(i.area_m2),
      price: String(i.price_per_m2),
    })),
  );
  // „Vygenerovat přílohy“ uloží formulář, vytvoří PDF (+ výkaz) a pokračuje na krok 3.
  const [formAction, pending] = useToastAction(saveAction, () => wizard?.goTo(3));
  // Štítky „od AI“: uložené z DB + ty, které se právě převzaly z přílohy (do uložení).
  const [sources, setSources] = useState<Record<string, string>>(() => parseSources(quote.field_sources));

  const dropSource = (key: string) =>
    setSources((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  // Ruční přepsání údaje ruší štítek „od AI“.
  const set = (key: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setF((prev) => ({ ...prev, [key]: e.target.value }));
    dropSource(key);
  };

  const computedArea = cutArea(toNum(f.length_m), toNum(f.thickness_cm));
  const parsedItems: QuoteItem[] = items.map((i, position) => {
    const length_m = toNum(i.length) || null;
    const thickness_cm = toNum(i.thickness) || null;
    return {
      position,
      technology: i.technology,
      length_m,
      thickness_cm,
      area_m2: cutArea(length_m, thickness_cm) ?? toNum(i.area),
      price_per_m2: Math.round(toNum(i.price)),
    };
  });
  const totals = computeTotals({ mode, transport_price: Math.round(toNum(f.transport_price)) }, parsedItems);

  // Varianty: každá technologie jen jednou (u kombinace se opakovat může).
  const duplicates = duplicateVariantTechnologies(mode, parsedItems);
  const variantsProblem = variantsError(mode, parsedItems);
  const usedTechnologies = new Set(items.map((i) => i.technology));
  // Co chybí k vygenerování příloh – kontroluje se až při kliknutí na „Vygenerovat přílohy“.
  const missing = missingInputs(
    { ...f, transport_price: Math.round(toNum(f.transport_price)) },
    parsedItems,
  );
  const [triedGenerate, setTriedGenerate] = useState(false);

  // ─── Automatické ukládání ───────────────────────────────────────────────────
  // Otisk formuláře: když se liší od posledního uloženého, za chvíli se uloží sám.
  const formRef = useRef<HTMLFormElement>(null);
  const snapshot = JSON.stringify([f, mode, parsedItems, sources]);
  const [baseline] = useState(snapshot);
  const [autoState, autoAction, autoSaving] = useActionState<AutoSaveState, FormData>(async (prev, fd) => {
    const snap = String(fd.get('__snapshot') ?? '');
    const res = await saveAction(null, fd);
    const ok = Boolean(res?.ok);
    return { ok, message: res?.message ?? '', lastOk: ok ? snap : (prev?.lastOk ?? baseline), failed: ok ? null : snap };
  }, null);
  const savedSnapshot = autoState?.lastOk ?? baseline;
  const dirty = snapshot !== savedSnapshot;
  const failedHere = autoState?.failed === snapshot;

  useEffect(() => {
    // Neukládat: beze změny, během ukládání, s chybou, kterou server už vrátil
    // (čeká se na opravu), a s neplatnými variantami nebo bez jména klienta.
    if (!dirty || autoSaving || pending || failedHere || variantsProblem || !f.client_name.trim()) return;
    const timer = setTimeout(() => {
      if (!formRef.current) return;
      const fd = new FormData(formRef.current);
      fd.set('intent', 'save');
      startTransition(() => autoAction(fd));
    }, 1000);
    return () => clearTimeout(timer);
  }, [snapshot, dirty, autoSaving, pending, failedHere, variantsProblem, f.client_name, autoAction]);

  // Neuložené změny při zavírání stránky – prohlížeč se zeptá.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);
  const canAddItem = mode !== 'varianty' || usedTechnologies.size < TECHNOLOGIES.length;

  const addItem = () => {
    const recommended = recommendedTechnology(f.material || null, toNum(f.thickness_cm) || null);
    // U variant nabídneme technologii, která tam ještě není.
    const technology =
      mode === 'varianty' && usedTechnologies.has(recommended)
        ? (TECHNOLOGIES.find((t) => !usedTechnologies.has(t.id))?.id ?? recommended)
        : recommended;
    // Varianta pokrývá celou zeď (plná délka); u kombinace je každá položka jen úsek –
    // délku doplní uživatel, tloušťka se předvyplní.
    const fullLength = mode === 'varianty' || items.length === 0;
    setItems((prev) => [
      ...prev,
      {
        key: nextKey++,
        technology,
        length: fullLength ? f.length_m : '',
        thickness: f.thickness_cm,
        area: '',
        price: String(suggestedPricePerM2(technology, f.material || null)),
      },
    ]);
  };
  const updateItem = (key: number, patch: Partial<ItemDraft>) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;
        // Změna technologie: cenu z ceníku přepneme, jen když ji uživatel neupravil.
        const repriced =
          patch.technology && toNum(i.price) === suggestedPricePerM2(i.technology, f.material || null)
            ? { price: String(suggestedPricePerM2(patch.technology, f.material || null)) }
            : {};
        return { ...i, ...repriced, ...patch };
      }),
    );
    if (patch.area !== undefined || patch.length !== undefined || patch.thickness !== undefined || patch.technology !== undefined) dropSource('items');
  };

  const applyDims = (a: Dims) => {
    setF((prev) => ({
      ...prev,
      length_m: a.lengthM !== null ? toStr(a.lengthM) : prev.length_m,
      thickness_cm: a.thicknessCm !== null ? toStr(a.thicknessCm) : prev.thickness_cm,
      material: a.material && !prev.material ? a.material : prev.material,
    }));
    setSources((prev) => ({
      ...prev,
      ...(a.lengthM !== null ? { length_m: a.label } : {}),
      ...(a.thicknessCm !== null ? { thickness_cm: a.label } : {}),
      ...(a.material && !f.material ? { material: a.label } : {}),
      ...((a.lengthM !== null && a.thicknessCm !== null) || a.areaM2 !== null ? { items: a.label } : {}),
    }));
    const segments = a.segments ?? [];
    if (segments.length > 1) {
      // Víc úseků s různou tloušťkou (řádky výkazu) → položka za každý úsek, sčítají se.
      const material = f.material || a.material || '';
      setMode('kombinace');
      setItems((prev) =>
        segments.map((seg) => {
          const technology = isTechnology(seg.technology) ? seg.technology : recommendedTechnology(material || null, seg.thicknessCm);
          const same = prev.find((i) => i.technology === technology);
          const byDims = seg.lengthM !== null && seg.thicknessCm !== null;
          return {
            key: nextKey++,
            technology,
            length: byDims ? toStr(seg.lengthM) : '',
            thickness: byDims ? toStr(seg.thicknessCm) : '',
            area: byDims ? '' : toStr(seg.areaM2),
            // Ručně upravenou cenu stejné technologie zachováme, jinak ceník.
            price: same?.price ?? String(suggestedPricePerM2(technology, material || null)),
          };
        }),
      );
      return;
    }
    const hasDims = a.lengthM !== null && a.thicknessCm !== null;
    if (hasDims || a.areaM2 !== null) {
      // Rozměry, ze kterých se spočítá řezná plocha; samotná m² jen z výkazu bez VV.
      const dims = hasDims
        ? { length: toStr(a.lengthM), thickness: toStr(a.thicknessCm), area: '' }
        : { length: '', thickness: '', area: toStr(a.areaM2) };
      setItems((prev) => {
        // Kombinace s víc položkami má zeď rozdělenou na úseky (20 m pila + 30 m lano) –
        // tu nepřepisujeme; rozměry se propíšou do specifikace a úseky upraví člověk.
        if (prev.length > 1 && mode === 'kombinace') return prev;
        if (prev.length) return prev.map((i) => ({ ...i, ...dims }));
        const material = f.material || a.material || '';
        const technology = isTechnology(a.technology)
          ? a.technology
          : recommendedTechnology(material || null, a.thicknessCm ?? (toNum(f.thickness_cm) || null));
        return [{ key: nextKey++, technology, ...dims, price: String(suggestedPricePerM2(technology, material || null)) }];
      });
    }
  };

  // Tlačítko „Použít“ je v kroku 1 – průvodce mu předá tuhle funkci.
  const applyRef = useRef(applyDims);
  applyRef.current = applyDims;
  useEffect(() => {
    wizard?.registerApply((a) => applyRef.current(a));
  }, [wizard]);

  const src = (key: string) => sources[key];

  const noVat = 'Nejsme plátci DPH – ceny jsou konečné.';
  return (
    <div className="space-y-4">
      {/* Souhrn ceny a uložení v kompaktním pruhu nahoře – zůstává vidět při posouvání. */}
      <div className="sticky top-2 z-30 rounded-2xl border border-neutral-dark/5 bg-white/95 backdrop-blur px-4 py-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm flex-1 min-w-0" title={noVat}>
            {parsedItems.length === 0 ? (
              <span className="text-neutral-dark/50">Přidejte alespoň jednu technologii.</span>
            ) : mode === 'kombinace' ? (
              <>
                {totals.lines.map((l, i) => (
                  <span key={i} className="text-neutral-dark/60 whitespace-nowrap">
                    {technologyLabel(l.technology)} {formatArea(l.area_m2)} · <span className="text-neutral-dark">{formatCzk(l.workPrice)}</span>
                  </span>
                ))}
                <span className="text-neutral-dark/60 whitespace-nowrap">
                  Doprava <span className="text-neutral-dark">{formatCzk(toNum(f.transport_price))}</span>
                </span>
                <span className="whitespace-nowrap font-black">
                  Celkem <span className="text-lg">{formatCzk(totals.total)}</span>
                </span>
              </>
            ) : (
              <>
                {totals.lines.map((l, i) => (
                  <span key={i} className="whitespace-nowrap">
                    <span className="text-neutral-dark/60">Varianta {technologyLabel(l.technology)}</span>{' '}
                    <strong>{formatCzk(totals.variantTotals[i])}</strong>
                  </span>
                ))}
                <span className="text-[11px] text-neutral-dark/40 whitespace-nowrap">vč. dopravy {formatCzk(toNum(f.transport_price))}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <SaveStatus saving={autoSaving} dirty={dirty} state={autoState} failedHere={failedHere} />
            <button
              type="submit"
              form="quote-form"
              name="intent"
              value="generate"
              disabled={pending || autoSaving || Boolean(variantsProblem)}
              onClick={(e) => {
                if (missing.length === 0) return;
                e.preventDefault();
                setTriedGenerate(true);
              }}
              title="Uloží změny a vytvoří PDF nabídky, případně i vyplněný výkaz výměr"
              className="btn-primary text-[11px] py-2 px-4 uppercase tracking-widest disabled:opacity-60"
            >
              {pending ? 'Generuji…' : 'Vygenerovat přílohy'}
            </button>
          </div>
        </div>
        {failedHere && autoState?.message && <p className="text-[11px] text-red-800 mt-1">Neuloženo: {autoState.message}</p>}
        {triedGenerate && missing.length > 0 && (
          <p role="alert" className="text-[11px] text-red-800 mt-1">
            Přílohy zatím nejde vygenerovat – doplňte: {missing.join(', ')}.
          </p>
        )}
        {variantsProblem && <p className="text-[11px] text-red-800 mt-1">Nejde uložit – u variant je některá technologie víckrát (viz Technologie a ceny).</p>}
        {pending && (
          <Working
            label="Generuji přílohy…"
            hint="PDF nabídky a vyplněný výkaz (je-li v podkladech). Obvykle 5–20 s; poprvé i s návrhem textu e-mailu."
            className="mt-2"
          />
        )}
      </div>

      <div className={files.length > 0 ? 'grid lg:grid-cols-3 gap-6 items-start' : ''}>
        <div className={files.length > 0 ? 'lg:col-span-2 space-y-6' : 'space-y-6'}>
          <form
            id="quote-form"
            ref={formRef}
            onSubmit={submitWithoutReset(formAction)}
            className="space-y-6"
          >
            <input type="hidden" name="id" value={quote.id} />
            <input type="hidden" name="__snapshot" value={snapshot} />
            <input type="hidden" name="mode" value={mode} />
            <input type="hidden" name="items" value={JSON.stringify(parsedItems)} />
            <input type="hidden" name="field_sources" value={JSON.stringify(sources)} />

            <section className={cardCls}>
              <h2 className={`${headingCls} mb-4`}>Klient a místo realizace</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Klient *" className="sm:col-span-3" source={src('client_name')}>
                  <input name="client_name" required value={f.client_name} onChange={set('client_name')} className={inputCls} />
                </Field>
                <Field label="E-mail">
                  <input name="client_email" type="email" value={f.client_email} onChange={set('client_email')} className={inputCls} />
                </Field>
                <Field label="Telefon" source={src('client_phone')}>
                  <input name="client_phone" value={f.client_phone} onChange={set('client_phone')} className={inputCls} />
                </Field>
                <Field label="Obec" source={src('city')}>
                  <input name="city" value={f.city} onChange={set('city')} placeholder="např. Polička" className={inputCls} />
                </Field>
                <Field label="Objekt" className="sm:col-span-1" source={src('site_name')}>
                  <input name="site_name" value={f.site_name} onChange={set('site_name')} placeholder="Bytový dům č.p. 575" className={inputCls} />
                </Field>
                <Field label="Adresa" className="sm:col-span-2" source={src('site_address')}>
                  <input name="site_address" value={f.site_address} onChange={set('site_address')} placeholder="Ulice 1. máje, Polička" className={inputCls} />
                </Field>
              </div>
            </section>

            <section className={cardCls}>
              <h2 className={`${headingCls} mb-4`}>Specifikace zdiva</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Zdivo" source={src('material')}>
                  <select name="material" value={f.material} onChange={set('material')} className={inputCls}>
                    <option value="">—</option>
                    {MATERIALS.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Tloušťka (cm)" source={src('thickness_cm')}>
                  <input name="thickness_cm" inputMode="decimal" value={f.thickness_cm} onChange={set('thickness_cm')} className={inputCls} />
                </Field>
                <Field label="Délka zdí k řezu (m)" source={src('length_m')}>
                  <input name="length_m" inputMode="decimal" value={f.length_m} onChange={set('length_m')} className={inputCls} />
                </Field>
              </div>
              <p className="mt-3 text-sm text-neutral-dark/60">
                Cena je za m² <strong className="text-neutral-dark">řezné plochy</strong> = délka zdi (m) × tloušťka (m)
                {computedArea !== null && (
                  <>
                    {' '}– tady <strong className="text-neutral-dark">{formatArea(computedArea)}</strong>
                  </>
                )}
                . Ne plocha podlahy ani běžné metry.
                {items.length > 0 && (f.length_m || f.thickness_cm) && (
                  <button
                    type="button"
                    onClick={() => {
                      // U kombinace s úseky jen tloušťka (délky úseků se liší), jinak obojí.
                      const onlyThickness = mode === 'kombinace' && items.length > 1;
                      setItems((prev) =>
                        prev.map((i) => ({
                          ...i,
                          thickness: f.thickness_cm || i.thickness,
                          length: onlyThickness ? i.length : f.length_m || i.length,
                        })),
                      );
                    }}
                    className="ml-3 text-[11px] font-black uppercase tracking-widest text-primary-ink hover:underline"
                  >
                    {mode === 'kombinace' && items.length > 1 ? 'Tloušťku do všech položek' : 'Rozměry do všech položek'}
                  </button>
                )}
              </p>
            </section>

            <section className={cardCls}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className={headingCls}>Technologie a ceny</h2>
                  <p className="text-[11px] text-neutral-dark/50 mt-1">
                    Cena za m² je předvyplněná středem ceníku – zkontrolujte ji.
                    {src('items') && <SourceBadge source={src('items')!} prefix="plocha" />}
                  </p>
                </div>
                <div className="flex rounded-xl border-2 border-neutral-light overflow-hidden text-[11px] font-black uppercase tracking-widest">
                  {(['kombinace', 'varianty'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`px-3 py-1.5 ${mode === m ? 'bg-neutral-dark text-white' : 'text-neutral-dark/50'}`}
                      title={m === 'kombinace' ? 'Položky se sčítají (např. 20 m² pila + 30 m² lano)' : 'Každá položka je samostatná varianta včetně dopravy'}
                    >
                      {m === 'kombinace' ? 'Kombinace (součet)' : 'Varianty (jedna z nich)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => {
                  const suggested = suggestedPricePerM2(item.technology, f.material || null);
                  const line = totals.lines[idx];
                  return (
                    <div
                      key={item.key}
                      className={`grid grid-cols-12 gap-3 items-end rounded-2xl p-3 ${duplicates.includes(item.technology) ? 'bg-red-50 ring-2 ring-red-200' : 'bg-neutral-light/60'}`}
                    >
                      <Field label="Technologie" className="col-span-12 sm:col-span-3">
                        <select
                          value={item.technology}
                          onChange={(e) => updateItem(item.key, { technology: e.target.value as TechnologyId })}
                          className={inputCls}
                          aria-label={`Technologie položky ${idx + 1}`}
                        >
                          {TECHNOLOGIES.map((t) => (
                            <option
                              key={t.id}
                              value={t.id}
                              // U variant nejde vybrat technologii, kterou má už jiná položka.
                              disabled={mode === 'varianty' && t.id !== item.technology && usedTechnologies.has(t.id)}
                            >
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Délka zdi (m)" className="col-span-4 sm:col-span-2">
                        <input inputMode="decimal" value={item.length} onChange={(e) => updateItem(item.key, { length: e.target.value })} className={inputCls} aria-label={`Délka zdi položky ${idx + 1}`} />
                      </Field>
                      <Field label="Tloušťka (cm)" className="col-span-4 sm:col-span-2">
                        <input inputMode="decimal" value={item.thickness} onChange={(e) => updateItem(item.key, { thickness: e.target.value })} className={inputCls} aria-label={`Tloušťka zdi položky ${idx + 1}`} />
                      </Field>
                      <Field label="Řezná plocha (m²)" className="col-span-4 sm:col-span-2">
                        {cutArea(toNum(item.length), toNum(item.thickness)) !== null ? (
                          // Plocha se počítá – ručně ji zadat nejde, ať se nepromíchají m a m².
                          <div className={`${inputCls} bg-neutral-light/60 text-neutral-dark/70`} aria-label={`Řezná plocha položky ${idx + 1}`}>
                            {formatNumber(line?.area_m2 ?? 0)}
                          </div>
                        ) : (
                          <input
                            inputMode="decimal"
                            value={item.area}
                            onChange={(e) => updateItem(item.key, { area: e.target.value })}
                            placeholder="nebo délka × tl."
                            className={inputCls}
                            aria-label={`Řezná plocha položky ${idx + 1}`}
                          />
                        )}
                      </Field>
                      <Field label="Cena za m² (Kč)" className="col-span-6 sm:col-span-2">
                        <input inputMode="numeric" value={item.price} onChange={(e) => updateItem(item.key, { price: e.target.value })} className={inputCls} aria-label={`Cena za m² položky ${idx + 1}`} />
                      </Field>
                      <div className="col-span-6 sm:col-span-1 flex items-center justify-end pb-2">
                        <button type="button" onClick={() => setItems((prev) => prev.filter((i) => i.key !== item.key))} className="text-neutral-dark/30 hover:text-red-600 text-xl leading-none px-1" aria-label={`Odebrat položku ${idx + 1}`}>
                          ×
                        </button>
                      </div>
                      <p className="col-span-12 -mt-1 text-xs text-neutral-dark/60">
                        {line && line.area_m2 > 0 ? (
                          <>
                            {line.length_m && line.thickness_cm
                              ? `${formatNumber(line.length_m)} m × ${formatNumber(line.thickness_cm)} cm = ${formatArea(line.area_m2)}`
                              : `${formatArea(line.area_m2)} (zadáno ručně – ověřte, že jde o řeznou plochu, ne o plochu podlahy)`}
                            {' × '}
                            {formatCzk(line.price_per_m2)} = <strong className="text-neutral-dark">{formatCzk(line.workPrice)}</strong>
                            {pricePerMeter(line.price_per_m2, line.thickness_cm) !== null && (
                              <span className="text-neutral-dark/40"> · odpovídá {formatCzk(pricePerMeter(line.price_per_m2, line.thickness_cm)!)} za běžný metr zdi</span>
                            )}
                          </>
                        ) : (
                          <span className="text-amber-800">Doplňte délku a tloušťku zdi – řezná plocha se z nich spočítá.</span>
                        )}
                      </p>
                      {toNum(item.price) !== suggested && suggested > 0 && (
                        <p className="col-span-12 -mt-1 text-[11px] text-neutral-dark/50">
                          Ceník (střed): {formatCzk(suggested)}/m²{' '}
                          <button type="button" onClick={() => updateItem(item.key, { price: String(suggested) })} className="font-black uppercase tracking-widest text-primary-ink hover:underline">
                            Použít
                          </button>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              {variantsProblem && (
                <p role="alert" className="mt-3 text-sm text-red-800 bg-red-50 rounded-xl px-3 py-2">
                  {variantsProblem}
                </p>
              )}
              <button
                type="button"
                onClick={addItem}
                disabled={!canAddItem}
                title={canAddItem ? undefined : 'U variant je každá technologie jen jednou – všechny už v nabídce jsou.'}
                className="mt-3 text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-primary/15 text-primary-ink hover:bg-primary/25 disabled:opacity-50"
              >
                + Přidat technologii
              </button>

              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                <Field label="Doprava (Kč)">
                  <input name="transport_price" inputMode="numeric" value={f.transport_price} onChange={set('transport_price')} className={inputCls} />
                </Field>
              </div>
            </section>

            <section className={cardCls}>
              <h2 className={`${headingCls} mb-4`}>Texty do PDF</h2>
              <div className="space-y-4">
                <Field label="Úvodní odstavec (prázdné = výchozí text)">
                  <textarea name="intro" rows={3} value={f.intro} onChange={set('intro')} className={`${inputCls} resize-y`} />
                </Field>
                <Field label="Technické podmínky (každá na nový řádek)">
                  <textarea name="conditions" rows={4} value={f.conditions} onChange={set('conditions')} className={`${inputCls} resize-y`} />
                </Field>
                <Field label="Interní poznámka (do PDF nejde)">
                  <textarea name="note" rows={2} value={f.note} onChange={set('note')} className={`${inputCls} resize-y`} />
                </Field>
              </div>
            </section>
          </form>
        </div>

        {/* Sticky jen když se vejde – s návrhy z podkladů může být sloupec delší než okno. */}
        {files.length > 0 && (
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <SuggestionsPanel
              files={files}
              onApply={(dims) => {
                applyDims(dims);
                toast(`Převzato z „${dims.label}“ – zkontrolujte a uložte.`);
              }}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

type AutoSaveState = { ok: boolean; message: string; lastOk: string; failed: string | null } | null;

/** Stav automatického ukládání v pruhu nahoře. */
function SaveStatus({ saving, dirty, state, failedHere }: { saving: boolean; dirty: boolean; state: AutoSaveState; failedHere: boolean }) {
  const [text, cls] = saving
    ? ['Ukládám…', 'text-neutral-dark/50']
    : failedHere
      ? ['Neuloženo', 'text-red-700']
      : dirty
        ? ['Neuložené změny…', 'text-neutral-dark/50']
        : state
          ? ['✓ Uloženo', 'text-emerald-700']
          : ['Ukládá se automaticky', 'text-neutral-dark/40'];
  return (
    <span className={`text-[11px] font-bold whitespace-nowrap ${cls}`} role="status" aria-live="polite">
      {text}
    </span>
  );
}

function Field({ label, className, source, children }: { label: string; className?: string; source?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className={`${labelCls} flex items-center gap-2`}>
        {label}
        {source && <SourceBadge source={source} />}
      </span>
      {children}
    </label>
  );
}

/** Štítek „doplnila AI“ – odkud údaj je, ať ho člověk ověří. */
function SourceBadge({ source, prefix }: { source: string; prefix?: string }) {
  return (
    <span
      title={`Doplnila AI – ${source}. Po ruční úpravě a uložení štítek zmizí.`}
      className="ml-1 inline-block max-w-[14rem] truncate align-middle normal-case tracking-normal font-bold text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-900"
    >
      AI{prefix ? ` ${prefix}` : ''} · {source}
    </span>
  );
}
