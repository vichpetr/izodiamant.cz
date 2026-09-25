'use client';

// Krok 2 – editor nabídky: klient, místo, specifikace zdiva, opakovatelné položky
// (technologie × m² × cena/m²), doprava a texty do PDF. Vpravo živý souhrn ceny.
//
// Cena za m² se předvyplní středem ceníku (calculator.json), ale poslední slovo
// má uživatel – přepsanou cenu nic automaticky nemění. Návrhy z příloh (krok 1)
// se do formuláře propíšou po kliknutí na „Použít“. U údajů, které doplnila AI,
// je štítek s původem; po ruční změně a uložení zmizí.

import { useEffect, useRef, useState } from 'react';
import {
  computeTotals,
  cutArea,
  duplicateVariantTechnologies,
  formatArea,
  formatCzk,
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
  type Quote,
  type QuoteItem,
  type QuoteMode,
  type TechnologyId,
} from '@/lib/quotes/model';
import { useWizard, type Dims } from './QuoteWizard';
import Working from './Working';
import { cardCls, headingCls, inputCls, labelCls } from './ui';
import { submitWithoutReset, useToastAction, type Action } from './useToastAction';

interface ItemDraft {
  key: number;
  technology: TechnologyId;
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
  saveAction,
}: {
  quote: Quote;
  items: QuoteItem[];
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
    initialItems.map((i) => ({ key: nextKey++, technology: i.technology, area: toStr(i.area_m2), price: String(i.price_per_m2) })),
  );
  // Po úspěšném „Uložit a vygenerovat přílohy“ pokračujeme na krok 3 (odeslání).
  const intentRef = useRef<string | null>(null);
  const [formAction, pending] = useToastAction(saveAction, () => {
    if (intentRef.current === 'generate') wizard?.goTo(3);
  });
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
  const parsedItems: QuoteItem[] = items.map((i, position) => ({
    position,
    technology: i.technology,
    area_m2: toNum(i.area),
    price_per_m2: Math.round(toNum(i.price)),
  }));
  const totals = computeTotals({ mode, transport_price: Math.round(toNum(f.transport_price)) }, parsedItems);

  // Varianty: každá technologie jen jednou (u kombinace se opakovat může).
  const duplicates = duplicateVariantTechnologies(mode, parsedItems);
  const variantsProblem = variantsError(mode, parsedItems);
  const usedTechnologies = new Set(items.map((i) => i.technology));
  const canAddItem = mode !== 'varianty' || usedTechnologies.size < TECHNOLOGIES.length;

  const addItem = () => {
    const recommended = recommendedTechnology(f.material || null, toNum(f.thickness_cm) || null);
    // U variant nabídneme technologii, která tam ještě není.
    const technology =
      mode === 'varianty' && usedTechnologies.has(recommended)
        ? (TECHNOLOGIES.find((t) => !usedTechnologies.has(t.id))?.id ?? recommended)
        : recommended;
    setItems((prev) => [
      ...prev,
      { key: nextKey++, technology, area: toStr(computedArea), price: String(suggestedPricePerM2(technology, f.material || null)) },
    ]);
  };
  const updateItem = (key: number, patch: Partial<ItemDraft>) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
    if (patch.area !== undefined || patch.technology !== undefined) dropSource('items');
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
      ...(a.areaM2 !== null ? { items: a.label } : {}),
    }));
    if (a.areaM2 !== null) {
      const area = toStr(a.areaM2);
      setItems((prev) => {
        // Kombinace s víc položkami má plochy rozdělené (20 m² pila + 30 m² lano) –
        // tu nepřepisujeme; délka/tloušťka se propíše a plochu lze převzít ručně.
        if (prev.length > 1 && mode === 'kombinace') return prev;
        if (prev.length) return prev.map((i) => ({ ...i, area }));
        const material = f.material || a.material || '';
        const technology = isTechnology(a.technology)
          ? a.technology
          : recommendedTechnology(material || null, a.thicknessCm ?? (toNum(f.thickness_cm) || null));
        return [{ key: nextKey++, technology, area, price: String(suggestedPricePerM2(technology, material || null)) }];
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

  return (
    <div className="grid lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 space-y-6">
        <form
          id="quote-form"
          onSubmit={(e) => {
            intentRef.current = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value ?? null;
            submitWithoutReset(formAction)(e);
          }}
          className="space-y-6"
        >
          <input type="hidden" name="id" value={quote.id} />
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
              <Field label="Délka řezu (m)" source={src('length_m')}>
                <input name="length_m" inputMode="decimal" value={f.length_m} onChange={set('length_m')} className={inputCls} />
              </Field>
            </div>
            {computedArea !== null && (
              <p className="mt-3 text-sm text-neutral-dark/60">
                Řezná plocha z délky × tloušťky: <strong className="text-neutral-dark">{formatArea(computedArea)}</strong>
                {items.length > 0 && (
                  <button type="button" onClick={() => setItems((prev) => prev.map((i) => ({ ...i, area: toStr(computedArea) })))} className="ml-3 text-[11px] font-black uppercase tracking-widest text-primary-ink hover:underline">
                    Použít u všech položek
                  </button>
                )}
              </p>
            )}
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
                    <Field label="Technologie" className="col-span-12 sm:col-span-4">
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
                    <Field label="Plocha (m²)" className="col-span-4 sm:col-span-2">
                      <input inputMode="decimal" value={item.area} onChange={(e) => updateItem(item.key, { area: e.target.value })} className={inputCls} aria-label={`Plocha položky ${idx + 1}`} />
                    </Field>
                    <Field label="Cena za m² (Kč)" className="col-span-4 sm:col-span-3">
                      <input inputMode="numeric" value={item.price} onChange={(e) => updateItem(item.key, { price: e.target.value })} className={inputCls} aria-label={`Cena za m² položky ${idx + 1}`} />
                    </Field>
                    <div className="col-span-4 sm:col-span-3 flex items-center justify-between gap-2 pb-2">
                      <strong className="whitespace-nowrap">{formatCzk(line?.workPrice ?? 0)}</strong>
                      <button type="button" onClick={() => setItems((prev) => prev.filter((i) => i.key !== item.key))} className="text-neutral-dark/30 hover:text-red-600 text-xl leading-none px-1" aria-label={`Odebrat položku ${idx + 1}`}>
                        ×
                      </button>
                    </div>
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

      <aside className="lg:sticky lg:top-6 space-y-4">
        <section className={cardCls}>
          <h2 className={`${headingCls} mb-4`}>Souhrn</h2>
          {parsedItems.length === 0 ? (
            <p className="text-sm text-neutral-dark/50">Přidejte alespoň jednu technologii.</p>
          ) : mode === 'kombinace' ? (
            <dl className="text-sm space-y-1.5">
              {totals.lines.map((l, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <dt className="text-neutral-dark/60">{TECHNOLOGIES.find((t) => t.id === l.technology)?.label} ({formatArea(l.area_m2)})</dt>
                  <dd className="whitespace-nowrap">{formatCzk(l.workPrice)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-2">
                <dt className="text-neutral-dark/60">Doprava</dt>
                <dd className="whitespace-nowrap">{formatCzk(toNum(f.transport_price))}</dd>
              </div>
              <div className="flex justify-between gap-2 pt-3 mt-2 border-t border-neutral-light text-lg font-black">
                <dt>Celkem</dt>
                <dd className="whitespace-nowrap">{formatCzk(totals.total)}</dd>
              </div>
            </dl>
          ) : (
            <dl className="text-sm space-y-2">
              {totals.lines.map((l, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <dt className="text-neutral-dark/60">Varianta {TECHNOLOGIES.find((t) => t.id === l.technology)?.label}</dt>
                  <dd className="font-black whitespace-nowrap">{formatCzk(totals.variantTotals[i])}</dd>
                </div>
              ))}
              <p className="text-[11px] text-neutral-dark/40 pt-1">Každá varianta včetně dopravy {formatCzk(toNum(f.transport_price))}.</p>
            </dl>
          )}
          <p className="text-[11px] text-neutral-dark/40 mt-3">Nejsme plátci DPH – ceny jsou konečné.</p>
        </section>

        <div className="flex flex-col gap-2">
          <button type="submit" form="quote-form" name="intent" value="generate" disabled={pending || Boolean(variantsProblem)} className="btn-primary py-3 px-6 uppercase tracking-widest disabled:opacity-60">
            {pending ? 'Pracuji…' : 'Uložit a vygenerovat přílohy'}
          </button>
          <button type="submit" form="quote-form" name="intent" value="save" disabled={pending || Boolean(variantsProblem)} className="py-3 px-6 rounded-xl border-2 border-neutral-dark/10 text-xs font-black uppercase tracking-widest text-neutral-dark/70 hover:border-primary/40 disabled:opacity-60">
            Jen uložit
          </button>
          {variantsProblem && <p className="text-[11px] text-red-800">Nejde uložit – u variant je některá technologie víckrát (viz Technologie a ceny).</p>}
          {pending && <Working label="Generuji přílohy…" hint="PDF nabídky a vyplněný výkaz (je-li v podkladech). Obvykle 5–20 s; poprvé i s návrhem textu e-mailu." />}
        </div>
      </aside>
    </div>
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
