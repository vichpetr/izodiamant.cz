'use client';

// Ukazatel „něco běží“ pro akce s AI. Skutečné procento neznáme (model nehlásí
// průběh), takže ukazujeme běžící pruh, uplynulý čas a obvyklou dobu – uživatel
// tak ví, že se pracuje, a přibližně kolik ještě počkat.

import { useEffect, useState } from 'react';

/**
 * Sekundy od `since` (nebo od prvního vykreslení), dokud je `active`.
 * Čas se čte jen v inicializátoru stavu a v intervalu – ne během renderu,
 * aby komponenta zůstala čistá (pravidla React hooks).
 */
export function useElapsed(active: boolean, since?: string | null): number {
  const [start] = useState(() => {
    const parsed = since ? new Date(since).getTime() : NaN;
    return Number.isFinite(parsed) ? parsed : Date.now();
  });
  const [now, setNow] = useState(start);

  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  return active ? Math.max(0, Math.round((now - start) / 1000)) : 0;
}

export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s} s`;
}

export default function Working({
  label,
  hint,
  since,
  className,
}: {
  label: string;
  hint?: string;
  /** ISO čas začátku – u úloh na pozadí, aby čas seděl i po obnovení stránky. */
  since?: string | null;
  className?: string;
}) {
  const seconds = useElapsed(true, since);

  return (
    <div className={`rounded-xl bg-neutral-light/70 px-3 py-2 ${className ?? ''}`} role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-black uppercase tracking-widest text-neutral-dark/60">{label}</span>
        <span className="tabular-nums text-neutral-dark/50">{formatElapsed(seconds)}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-dark/10">
        <div className="h-full w-1/3 rounded-full bg-primary animate-quote-progress" />
      </div>
      {hint && <p className="mt-1 text-[11px] text-neutral-dark/40">{hint}</p>}
    </div>
  );
}
