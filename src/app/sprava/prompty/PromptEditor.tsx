'use client';

import { useRef, useState } from 'react';
import { MAX_PROMPT_LENGTH, type PromptDef } from '@/lib/quotes/prompts';
import { cn } from '@/lib/utils';
import { fmtDateTime, ghostBtn, primarySmall } from '../nabidky/ui';
import { submitWithoutReset, useToastAction } from '../nabidky/useToastAction';
import { resetPromptAction, savePromptAction } from './actions';
import Markdown from './Markdown';

interface Props {
  def: PromptDef;
  /** Uložený přepis; null = platí výchozí. */
  override: { content: string; updated_at: string; updated_by: string | null } | null;
  model: string | null;
}

export default function PromptEditor({ def, override, model }: Props) {
  const saved = override?.content ?? def.instructions;
  const [value, setValue] = useState(saved);
  const [save, saving] = useToastAction(savePromptAction);
  const [reset, resetting] = useToastAction(resetPromptAction, () => setValue(def.instructions));
  const [preview, setPreview] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const dirty = value.trim() !== saved.trim();
  const busy = saving || resetting;

  /** Vloží markdown kolem výběru (nebo na začátek řádků u seznamů a nadpisů). */
  function format(kind: 'bold' | 'italic' | 'code' | 'h' | 'ul' | 'ol') {
    const el = area.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const sel = value.slice(a, b);
    let next: string;
    if (kind === 'bold') next = `**${sel || 'text'}**`;
    else if (kind === 'italic') next = `*${sel || 'text'}*`;
    else if (kind === 'code') next = `\`${sel || 'kód'}\``;
    else {
      const prefix = (n: number) => (kind === 'h' ? '## ' : kind === 'ul' ? '- ' : `${n + 1}. `);
      next = (sel || 'text').split('\n').map((l, n) => prefix(n) + l).join('\n');
    }
    setValue(value.slice(0, a) + next + value.slice(b));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a, a + next.length);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
        <span className={cn('px-2.5 py-1 rounded-full uppercase tracking-widest text-[10px] font-black', override ? 'bg-amber-100 text-amber-900' : 'bg-neutral-light text-neutral-dark/60')}>
          {override ? 'Upraveno' : 'Výchozí'}
        </span>
        {override && (
          <span className="text-neutral-dark/50">
            {fmtDateTime(override.updated_at)}
            {override.updated_by ? ` · ${override.updated_by}` : ''}
          </span>
        )}
        {model && <span className="text-neutral-dark/40 ml-auto">Model: {model}</span>}
      </div>

      <form action={save} onSubmit={submitWithoutReset(save)} className="space-y-3">
        <input type="hidden" name="key" value={def.key} />
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              ['bold', 'B', 'Tučně'],
              ['italic', 'I', 'Kurzíva'],
              ['code', '</>', 'Kód'],
              ['h', 'H', 'Nadpis'],
              ['ul', '•', 'Odrážky'],
              ['ol', '1.', 'Číslovaný seznam'],
            ] as const
          ).map(([kind, label, title]) => (
            <button key={kind} type="button" title={title} disabled={preview} onClick={() => format(kind)} className={cn(ghostBtn, 'min-w-9 !px-2')}>
              {label}
            </button>
          ))}
          <div className="ml-auto flex gap-1">
            <button type="button" onClick={() => setPreview(false)} className={cn(ghostBtn, !preview && '!bg-primary/15 !text-primary-ink')}>Psaní</button>
            <button type="button" onClick={() => setPreview(true)} className={cn(ghostBtn, preview && '!bg-primary/15 !text-primary-ink')}>Náhled</button>
          </div>
        </div>
        {/* Textarea zůstává v DOM i při náhledu, ať se hodnota odešle s formulářem. */}
        <textarea
          ref={area}
          name="content"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={Math.min(28, Math.max(8, value.split('\n').length + 1))}
          maxLength={MAX_PROMPT_LENGTH}
          spellCheck={false}
          className={cn('w-full border-2 border-neutral-light rounded-xl px-4 py-3 font-mono text-[13px] leading-relaxed outline-none focus:border-primary bg-white', preview && 'hidden')}
        />
        {preview && (
          <div className="border-2 border-neutral-light rounded-xl px-4 py-3 bg-white">
            <Markdown source={value} />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={busy || !dirty} className={primarySmall}>
            {saving ? 'Ukládám…' : 'Uložit'}
          </button>
          {dirty && (
            <button type="button" disabled={busy} onClick={() => setValue(saved)} className={ghostBtn}>
              Zahodit změny
            </button>
          )}
          <span className="text-[11px] text-neutral-dark/40 ml-auto">{value.length} / {MAX_PROMPT_LENGTH} znaků</span>
        </div>
      </form>

      {override && (
        <form action={reset} onSubmit={submitWithoutReset(reset)}>
          <input type="hidden" name="key" value={def.key} />
          <button
            type="submit"
            disabled={busy}
            onClick={(e) => {
              if (!confirm('Smazat vaše úpravy a vrátit výchozí text?')) e.preventDefault();
            }}
            className={ghostBtn}
          >
            {resetting ? 'Obnovuji…' : 'Vrátit výchozí text'}
          </button>
        </form>
      )}

      <details className="text-xs">
        <summary className="cursor-pointer font-black uppercase tracking-widest text-[10px] text-neutral-dark/50">
          Pevná část: formát odpovědi (nelze upravit)
        </summary>
        <p className="mt-2 text-neutral-dark/50 font-medium">
          Tento tvar JSON parsuje kód aplikace, proto se vždy připojí na konec promptu a úpravami výše ho nerozbijete.
        </p>
        <pre className="mt-2 whitespace-pre-wrap break-words bg-neutral-light rounded-xl p-3 font-mono text-[12px] text-neutral-dark/70">{def.schema}</pre>
      </details>
    </div>
  );
}
