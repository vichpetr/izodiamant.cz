import { cn } from '@/lib/utils';
import { QUOTE_STATUSES, type QuoteStatus } from '@/lib/quotes/model';

export const inputCls = 'w-full border-2 border-neutral-light rounded-xl px-4 py-2.5 font-medium outline-none focus:border-primary bg-white';
export const labelCls = 'text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 ml-1';
export const cardCls = 'bg-white rounded-3xl border border-neutral-dark/5 p-6';
export const headingCls = 'text-sm font-black uppercase tracking-widest text-neutral-dark';
export const ghostBtn = 'text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-neutral-light text-neutral-dark/70 hover:text-neutral-dark disabled:opacity-50';
export const primarySmall = 'text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-primary/15 text-primary-ink hover:bg-primary/25 disabled:opacity-50';

const STATUS_STYLE: Record<QuoteStatus, string> = {
  koncept: 'bg-neutral-light text-neutral-dark/70',
  ceka_na_udaje: 'bg-amber-100 text-amber-900',
  vygenerovano: 'bg-primary/20 text-primary-ink',
  odeslano: 'bg-sky-100 text-sky-900',
  prijato: 'bg-emerald-100 text-emerald-900',
  odmitnuto: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={cn('inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap', STATUS_STYLE[status])}>
      {QUOTE_STATUSES[status] ?? status}
    </span>
  );
}

export function fmtDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });
}

export function fileUrl(key: string): string {
  return `/sprava/nabidky/soubor?key=${encodeURIComponent(key)}`;
}
