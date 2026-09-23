'use client';

// Změna stavu (přijato / odmítnuto …) a smazání nabídky.

import { QUOTE_STATUSES, type QuoteStatus } from '@/lib/quotes/model';
import { useToastAction, type Action } from './useToastAction';

export default function QuoteActions({
  id,
  status,
  setStatusAction,
  deleteAction,
}: {
  id: number;
  status: QuoteStatus;
  setStatusAction: Action;
  deleteAction: Action;
}) {
  const [statusFormAction, changing] = useToastAction(setStatusAction);
  const [deleteFormAction, deleting] = useToastAction(deleteAction);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={statusFormAction}>
        <input type="hidden" name="id" value={id} />
        <select
          name="status"
          defaultValue={status}
          disabled={changing}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          aria-label="Stav nabídky"
          className="border-2 border-neutral-light rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest outline-none focus:border-primary bg-white"
        >
          {(Object.keys(QUOTE_STATUSES) as QuoteStatus[]).map((s) => (
            <option key={s} value={s}>{QUOTE_STATUSES[s]}</option>
          ))}
        </select>
      </form>
      <form
        action={deleteFormAction}
        onSubmit={(e) => {
          if (!confirm('Smazat nabídku včetně PDF a nahraných plánků? Nelze vrátit.')) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button type="submit" disabled={deleting} className="text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-50">
          {deleting ? 'Mažu…' : 'Smazat'}
        </button>
      </form>
    </div>
  );
}
