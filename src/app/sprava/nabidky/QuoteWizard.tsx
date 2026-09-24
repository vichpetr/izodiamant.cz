'use client';

// Detail nabídky jako průvodce ve třech krocích:
//   1. Podklady – text e-mailu, přílohy a co z nich AI vyčetla
//   2. Údaje a ceny – formulář nabídky (tady člověk doplní a zkontroluje ceny)
//   3. Odeslání – verze PDF, text e-mailu a přílohy
//
// Všechny kroky zůstávají vykreslené (jen skryté), takže rozpracovaný formulář
// se přepnutím kroku neztratí. Krok je i v URL (?krok=), ať jde odkaz poslat.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PlanAnalysis } from '@/lib/quotes/model';

export type Step = 1 | 2 | 3;
export type Dims = Pick<PlanAnalysis, 'lengthM' | 'thicknessCm' | 'areaM2' | 'material'> & { technology?: string | null; label: string };

interface WizardApi {
  step: Step;
  goTo: (step: Step) => void;
  /** Převezme rozměry z přílohy do formuláře (krok 2) a přepne na něj. */
  applyDims: (dims: Dims) => void;
  registerApply: (fn: (dims: Dims) => void) => void;
}

const WizardContext = createContext<WizardApi | null>(null);

export function useWizard(): WizardApi | null {
  return useContext(WizardContext);
}

const STEPS: { step: Step; label: string }[] = [
  { step: 1, label: 'Podklady' },
  { step: 2, label: 'Údaje a ceny' },
  { step: 3, label: 'Odeslání' },
];

export default function QuoteWizard({
  initialStep,
  hints,
  step1,
  step2,
  step3,
}: {
  initialStep: Step;
  /** Krátký stav pod názvem kroku, např. „3 přílohy“, „verze 2“. */
  hints: Partial<Record<Step, string>>;
  step1: React.ReactNode;
  step2: React.ReactNode;
  step3: React.ReactNode;
}) {
  const [step, setStep] = useState<Step>(initialStep);
  const applyRef = useRef<((dims: Dims) => void) | null>(null);

  const goTo = useCallback((next: Step) => {
    setStep(next);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('krok', String(next));
      window.history.replaceState(window.history.state, '', url);
    } catch {
      /* URL je jen pohodlí */
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const api = useMemo<WizardApi>(
    () => ({
      step,
      goTo,
      applyDims: (dims) => {
        applyRef.current?.(dims);
        goTo(2);
      },
      registerApply: (fn) => {
        applyRef.current = fn;
      },
    }),
    [step, goTo],
  );

  // Zpět/vpřed v prohlížeči přepne krok podle URL.
  useEffect(() => {
    const onPop = () => {
      const k = Number(new URL(window.location.href).searchParams.get('krok'));
      if (k === 1 || k === 2 || k === 3) setStep(k);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <WizardContext.Provider value={api}>
      <nav aria-label="Kroky nabídky" className="grid grid-cols-3 gap-2">
        {STEPS.map(({ step: s, label }) => (
          <button
            key={s}
            type="button"
            onClick={() => goTo(s)}
            aria-current={step === s ? 'step' : undefined}
            className={`text-left rounded-2xl px-4 py-3 border-2 transition-colors ${
              step === s ? 'border-primary bg-white' : 'border-transparent bg-white/60 hover:bg-white'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-widest ${step === s ? 'text-primary-ink' : 'text-neutral-dark/40'}`}>Krok {s}</span>
            <span className="block font-black uppercase italic text-neutral-dark leading-tight">{label}</span>
            {hints[s] && <span className="block text-[11px] text-neutral-dark/50 mt-0.5 truncate">{hints[s]}</span>}
          </button>
        ))}
      </nav>
      <div className={step === 1 ? 'space-y-6' : 'hidden'}>{step1}</div>
      <div className={step === 2 ? 'space-y-6' : 'hidden'}>{step2}</div>
      <div className={step === 3 ? 'space-y-6' : 'hidden'}>{step3}</div>
    </WizardContext.Provider>
  );
}

/** Tlačítko „dál“ na konci kroku. */
export function NextStepButton({ to, children }: { to: Step; children: React.ReactNode }) {
  const wizard = useWizard();
  return (
    <div className="flex justify-end">
      <button type="button" onClick={() => wizard?.goTo(to)} className="btn-primary py-3 px-6 uppercase tracking-widest text-xs">
        {children}
      </button>
    </div>
  );
}
