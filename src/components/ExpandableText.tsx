'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Text s ořezem na daný počet řádků a tlačítkem „Zobrazit více".
 *
 * Zda je text „dlouhý" rozhodujeme deterministicky podle počtu znaků
 * (`charThreshold`) – ne měřením DOM, které je u asynchronně načtených recenzí
 * a layout animací nespolehlivé a nefunguje při SSR. Vizuální ořez řeší
 * -webkit-line-clamp; tlačítko se ukáže jen u textu nad prahem.
 */
export default function ExpandableText({
  text,
  className,
  clampLines = 8,
  charThreshold = 280,
  buttonClassName,
}: {
  text: string;
  className?: string;
  clampLines?: number;
  charThreshold?: number;
  buttonClassName?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const collapsible = text.length > charThreshold;
  const clamped = collapsible && !expanded;

  return (
    <div>
      <p
        className={className}
        style={
          clamped
            ? {
                display: '-webkit-box',
                WebkitLineClamp: clampLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
            : undefined
        }
      >
        {text}
      </p>
      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={cn('mt-3 font-black uppercase tracking-widest transition-colors', buttonClassName)}
        >
          {expanded ? 'Zobrazit méně' : 'Zobrazit více'}
        </button>
      )}
    </div>
  );
}
