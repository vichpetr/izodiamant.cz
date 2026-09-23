'use client';

// „+ Nová nabídka“: vybrat existujícího zákazníka z evidence, nebo zadat nového.
// Po založení server action přesměruje rovnou do editoru nabídky.

import { useEffect, useMemo, useState } from 'react';
import ActionForm, { type ActionState } from '../ActionForm';
import { inputCls, labelCls } from './ui';

type Customer = { id: number; name: string; email: string | null; phone: string | null };

export default function NewQuoteModal({
  customers,
  action,
}: {
  customers: Customer[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'existing' | 'new'>(customers.length ? 'existing' : 'new');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? customers.filter((c) => [c.name, c.email, c.phone].some((v) => v?.toLowerCase().includes(q)))
      : customers;
    return list.slice(0, 50);
  }, [customers, query]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary py-3 px-8 uppercase tracking-widest">
        + Nová nabídka
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center bg-black/50 p-4 overflow-auto" onClick={() => setOpen(false)} role="presentation">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 my-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Nová cenová nabídka"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black uppercase italic text-neutral-dark">Nová cenová nabídka</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Zavřít" className="text-neutral-dark/40 hover:text-neutral-dark text-2xl leading-none px-2">×</button>
            </div>

            <div className="flex gap-2 mb-5">
              {(['existing', 'new'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 ${mode === m ? 'border-primary bg-primary/10 text-neutral-dark' : 'border-neutral-light text-neutral-dark/50'}`}
                >
                  {m === 'existing' ? 'Existující zákazník' : 'Nový klient'}
                </button>
              ))}
            </div>

            <ActionForm action={action} className="flex flex-col gap-4">
              {mode === 'existing' ? (
                <>
                  <input
                    type="search"
                    placeholder="Hledat jméno, e-mail, telefon…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={inputCls}
                    aria-label="Hledat zákazníka"
                  />
                  <select name="customer_id" required size={8} className={`${inputCls} py-2`} aria-label="Zákazník">
                    {matches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.email ? ` · ${c.email}` : ''}
                        {c.phone ? ` · ${c.phone}` : ''}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="nq-name" className={labelCls}>Klient (jméno / firma / SVJ) *</label>
                    <input id="nq-name" name="client_name" required className={inputCls} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="nq-email" className={labelCls}>E-mail</label>
                      <input id="nq-email" name="client_email" type="email" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="nq-phone" className={labelCls}>Telefon</label>
                      <input id="nq-phone" name="client_phone" type="tel" className={inputCls} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-neutral-dark/70">
                    <input type="checkbox" name="add_to_crm" defaultChecked className="accent-primary w-4 h-4" />
                    Přidat klienta i do evidence zákazníků
                  </label>
                </>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="py-3 px-6 uppercase tracking-widest text-xs font-black text-neutral-dark/50 hover:text-neutral-dark">Zrušit</button>
                <button type="submit" className="btn-primary py-3 px-8 uppercase tracking-widest">Založit</button>
              </div>
            </ActionForm>
          </div>
        </div>
      )}
    </>
  );
}
