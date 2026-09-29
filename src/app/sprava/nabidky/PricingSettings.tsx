'use client';

// Nastavení ceníku (/sprava/nabidky?nastaveni=cenik): denní výkon služeb a
// požadavky na staveniště, ceny / vzdálenosti / cestovné po krajích včetně
// „výchozího nastavení“ (nepoznaný kraj, prázdná pole krajů) a Kč/km.
// Z tohoto nastavení počítá editor nabídek; veřejný web se zatím drží calculator.json.

import { useState } from 'react';
import { formatCzk, formatNumber } from '@/lib/quotes/calc';
import calculatorData from '@/data/calculator.json';
import { TECHNOLOGIES, type TechnologyId } from '@/lib/quotes/model';
import {
  DEFAULT_REGION_LABEL,
  REGIONS,
  computeTransport,
  parsePricing,
  priceRanges,
  siteConditions,
  transportCalcFor,
  type Power,
  type Pricing,
  type RegionId,
} from '@/lib/quotes/pricing';
import { cardCls, headingCls, inputCls, labelCls } from './ui';
import { submitWithoutReset, useToastAction, type Action } from './useToastAction';

const str = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v).replace('.', ','));

type ServiceDraft = { price: string; m2PerDay: string; water: boolean; power: Power };
type RegionDraft = { prices: Record<TechnologyId, string>; distanceKm: string; dayRate: string };

function toDraft(p: Pricing) {
  return {
    services: Object.fromEntries(
      TECHNOLOGIES.map((t) => [t.id, { price: str(p.services[t.id].price), m2PerDay: str(p.services[t.id].m2PerDay), water: p.services[t.id].water, power: p.services[t.id].power }]),
    ) as Record<TechnologyId, ServiceDraft>,
    transport: { kmRate: str(p.transport.kmRate), dayRate: str(p.transport.dayRate), distanceKm: str(p.transport.distanceKm) },
    regions: Object.fromEntries(
      REGIONS.map((r) => [
        r.id,
        {
          prices: Object.fromEntries(TECHNOLOGIES.map((t) => [t.id, str(p.regions[r.id].prices[t.id])])) as Record<TechnologyId, string>,
          distanceKm: str(p.regions[r.id].distanceKm),
          dayRate: str(p.regions[r.id].dayRate),
        },
      ]),
    ) as Record<RegionId, RegionDraft>,
  };
}

type Draft = ReturnType<typeof toDraft>;

/** Koncept formuláře → ceník (prázdná pole krajů = výchozí, neplatná čísla doplní parsePricing). */
function fromDraft(d: Draft): Pricing {
  return parsePricing({
    services: d.services,
    transport: d.transport,
    regions: Object.fromEntries(REGIONS.map((r) => [r.id, d.regions[r.id]])),
  });
}

const smallInput = `${inputCls} !px-2 !py-1.5 text-sm text-right`;

/** Rozmezí, které teď ukazuje veřejný web (calculator.json) – pro porovnání. */
function webRange(id: TechnologyId): { min: number; max: number } | null {
  const rows = calculatorData.flatMap((m) => m.availableServices).filter((s) => s.id === id);
  return rows.length ? { min: Math.min(...rows.map((s) => s.minPrice)), max: Math.max(...rows.map((s) => s.maxPrice)) } : null;
}

const fmtRange = (r: { min: number; max: number }) => (r.min === r.max ? formatCzk(r.min) : `${formatCzk(r.min)} – ${formatCzk(r.max)}`);

export default function PricingSettings({
  pricing,
  updated,
  saveAction,
}: {
  pricing: Pricing;
  updated: { updated_at: string; updated_by: string | null } | null;
  saveAction: Action;
}) {
  const [d, setD] = useState<Draft>(() => toDraft(pricing));
  const [formAction, pending] = useToastAction(saveAction);
  const parsed = fromDraft(d);
  const ranges = priceRanges(parsed);

  const setService = (id: TechnologyId, patch: Partial<ServiceDraft>) =>
    setD((prev) => ({ ...prev, services: { ...prev.services, [id]: { ...prev.services[id], ...patch } } }));
  const setRegion = (id: RegionId, patch: Partial<RegionDraft>) =>
    setD((prev) => ({ ...prev, regions: { ...prev.regions, [id]: { ...prev.regions[id], ...patch } } }));
  const setTransport = (key: keyof Draft['transport'], value: string) => setD((prev) => ({ ...prev, transport: { ...prev.transport, [key]: value } }));

  // Ukázkový výpočet dopravy: 20 m² pilou, výchozí nastavení, 150 km.
  const example = computeTransport(transportCalcFor(parsed, null), 150, [{ technology: 'retezova-pila', area_m2: 20 }]);

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="space-y-6">
      <input type="hidden" name="pricing" value={JSON.stringify(parsed)} />

      <section className={cardCls}>
        <h2 className={`${headingCls} mb-1`}>Služby</h2>
        <p className="text-xs text-neutral-dark/50 mb-4">
          Výkon za den určuje počet pracovních dní na zakázce, a tím cestovné. Voda a elektřina se propíšou do technických podmínek
          nabídky. Ceny jsou v tabulce krajů níže.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={labelCls}>
                <th className="text-left py-2 pr-3">Služba</th>
                <th className="text-right py-2 px-2">Výkon (m²/den)</th>
                <th className="py-2 px-2">Voda</th>
                <th className="py-2 px-2">Elektřina</th>
                <th className="text-right py-2 px-2">Rozmezí v ceníku</th>
                <th className="text-right py-2 pl-2">Na webu teď</th>
              </tr>
            </thead>
            <tbody>
              {TECHNOLOGIES.map((t) => {
                const s = d.services[t.id];
                const web = webRange(t.id);
                const differs = web !== null && (web.min !== ranges[t.id].min || web.max !== ranges[t.id].max);
                return (
                  <tr key={t.id} className="border-t border-neutral-light">
                    <td className="py-2 pr-3 font-bold whitespace-nowrap">{t.label}</td>
                    <td className="py-2 px-2 w-32">
                      <input inputMode="decimal" value={s.m2PerDay} onChange={(e) => setService(t.id, { m2PerDay: e.target.value })} className={smallInput} aria-label={`Výkon za den – ${t.label}`} />
                      <span className="block text-right text-[11px] text-neutral-dark/40 mt-0.5">≈ {formatNumber(parsed.services[t.id].m2PerDay * 5, 1)} m²/týden</span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input type="checkbox" checked={s.water} onChange={(e) => setService(t.id, { water: e.target.checked })} aria-label={`Potřebuje vodu – ${t.label}`} />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={s.power ?? ''}
                        onChange={(e) => setService(t.id, { power: (e.target.value || null) as Power })}
                        className={`${inputCls} !px-2 !py-1.5 text-sm`}
                        aria-label={`Elektřina – ${t.label}`}
                      >
                        <option value="">není potřeba</option>
                        <option value="230">230 V</option>
                        <option value="400">400 V</option>
                      </select>
                    </td>
                    <td className="py-2 px-2 text-right whitespace-nowrap font-bold">{fmtRange(ranges[t.id])}</td>
                    <td className={`py-2 pl-2 text-right whitespace-nowrap ${differs ? 'text-amber-800' : 'text-neutral-dark/50'}`}>{web ? fmtRange(web) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-neutral-dark/40 mt-3">
          Veřejný web zatím ceny z tohoto nastavení nebere – zobrazuje rozmezí z <code>calculator.json</code> a pevné texty („od … Kč/m²“).
          Když se liší (oranžově), dejte vědět, ať se web upraví.
        </p>
      </section>

      <section className={cardCls}>
        <h2 className={`${headingCls} mb-1`}>Ceny a vzdálenosti po krajích</h2>
        <p className="text-xs text-neutral-dark/50 mb-4">
          Prázdné pole kraje = hodnota z řádku <strong>{DEFAULT_REGION_LABEL}</strong> (ten platí i tam, kde se kraj z adresy nepozná).
          Vzdálenost je orientační (jedna cesta z Mokré Lhoty) a v nabídce jde přepsat.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={labelCls}>
                <th className="text-left py-2 pr-3">Kraj</th>
                {TECHNOLOGIES.map((t) => (
                  <th key={t.id} className="text-right py-2 px-2">{t.label} (Kč/m²)</th>
                ))}
                <th className="text-right py-2 px-2">Vzdálenost (km)</th>
                <th className="text-right py-2 pl-2">Cestovné / den (Kč)</th>
              </tr>
            </thead>
            <tbody>
              {REGIONS.map((r) => {
                const row = d.regions[r.id];
                return (
                  <tr key={r.id} className="border-t border-neutral-light">
                    <td className="py-1.5 pr-3 font-bold whitespace-nowrap">{r.name}</td>
                    {TECHNOLOGIES.map((t) => (
                      <td key={t.id} className="py-1.5 px-2 w-32">
                        <input
                          inputMode="numeric"
                          value={row.prices[t.id]}
                          placeholder={str(parsed.services[t.id].price)}
                          onChange={(e) => setRegion(r.id, { prices: { ...row.prices, [t.id]: e.target.value } })}
                          className={smallInput}
                          aria-label={`${t.label} – ${r.name}`}
                        />
                      </td>
                    ))}
                    <td className="py-1.5 px-2 w-28">
                      <input
                        inputMode="numeric"
                        value={row.distanceKm}
                        placeholder={str(parsed.transport.distanceKm)}
                        onChange={(e) => setRegion(r.id, { distanceKm: e.target.value })}
                        className={smallInput}
                        aria-label={`Vzdálenost – ${r.name}`}
                      />
                    </td>
                    <td className="py-1.5 pl-2 w-32">
                      <input
                        inputMode="numeric"
                        value={row.dayRate}
                        placeholder={str(parsed.transport.dayRate)}
                        onChange={(e) => setRegion(r.id, { dayRate: e.target.value })}
                        className={smallInput}
                        aria-label={`Cestovné na den – ${r.name}`}
                      />
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-neutral-dark/10 bg-neutral-light/60">
                <td className="py-2 pr-3 font-black whitespace-nowrap">
                  {DEFAULT_REGION_LABEL}
                  <span className="block text-[11px] font-normal text-neutral-dark/50">nepoznaný kraj a prázdná pole</span>
                </td>
                {TECHNOLOGIES.map((t) => (
                  <td key={t.id} className="py-2 px-2 w-32">
                    <input
                      inputMode="numeric"
                      value={d.services[t.id].price}
                      onChange={(e) => setService(t.id, { price: e.target.value })}
                      className={smallInput}
                      aria-label={`${t.label} – ${DEFAULT_REGION_LABEL}`}
                    />
                  </td>
                ))}
                <td className="py-2 px-2 w-28">
                  <input
                    inputMode="numeric"
                    value={d.transport.distanceKm}
                    placeholder="zadat"
                    onChange={(e) => setTransport('distanceKm', e.target.value)}
                    className={smallInput}
                    aria-label={`Vzdálenost – ${DEFAULT_REGION_LABEL}`}
                  />
                </td>
                <td className="py-2 pl-2 w-32">
                  <input
                    inputMode="numeric"
                    value={d.transport.dayRate}
                    onChange={(e) => setTransport('dayRate', e.target.value)}
                    className={smallInput}
                    aria-label={`Cestovné na den – ${DEFAULT_REGION_LABEL}`}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={cardCls}>
        <h2 className={`${headingCls} mb-1`}>Doprava</h2>
        <p className="text-xs text-neutral-dark/50 mb-4">
          Doprava = 2 × vzdálenost × Kč/km (cesta tam a zpět) + pracovní dny × cestovné na den (kraje / výchozí nastavení). Pracovní dny =
          řezná plocha / výkon technologie za den, nahoru na celé dny.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Kč za km</span>
            <input inputMode="decimal" value={d.transport.kmRate} onChange={(e) => setTransport('kmRate', e.target.value)} className={inputCls} />
          </label>
        </div>
        <p className="text-xs text-neutral-dark/60 mt-3">
          Příklad ({DEFAULT_REGION_LABEL.toLowerCase()}): 20 m² pilou, 150 km → {example.days} {example.days === 1 ? 'den' : example.days < 5 ? 'dny' : 'dní'}{' '}
          práce · cesta {formatCzk(example.travel)} + cestovné {formatCzk(example.stay)} = <strong>{formatCzk(example.total)}</strong>
        </p>
        <p className="text-xs text-neutral-dark/60 mt-1">
          Podmínky např. pro pilu + lano: {siteConditions(parsed, ['retezova-pila', 'diamantove-lano']).slice(1).join(' ')}
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-4">
        <span className="text-[11px] text-neutral-dark/40">
          {updated
            ? `Naposledy uloženo ${new Date(updated.updated_at).toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Prague' })}${updated.updated_by ? ` · ${updated.updated_by}` : ''}`
            : 'Ceník zatím není uložený – zobrazené hodnoty jsou záloha z pricing.json. Uložením se přenesou do databáze.'}
        </span>
        <button type="submit" disabled={pending} className="btn-primary text-[11px] py-2.5 px-5 uppercase tracking-widest disabled:opacity-60">
          {pending ? 'Ukládám…' : 'Uložit ceník'}
        </button>
      </div>
    </form>
  );
}
