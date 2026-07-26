'use client';

// Tlačítko „Přidat zákazníka" + modal s formulářem. Šetří místo na stránce.
// Po úspěšném uložení se modal zavře (onSuccess z ActionForm).

import { useEffect, useState } from 'react';
import ActionForm, { type ActionState } from './ActionForm';

export default function AddCustomerModal({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const inputCls = 'border-2 border-neutral-light rounded-xl px-4 py-3 font-medium outline-none focus:border-primary';
  const labelCls = 'text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 ml-1';

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary py-3 px-8 uppercase tracking-widest">
        + Přidat zákazníka
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center bg-black/50 p-4 overflow-auto" onClick={() => setOpen(false)} role="presentation">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Přidat zákazníka"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black uppercase italic text-neutral-dark">Přidat zákazníka</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Zavřít" className="text-neutral-dark/40 hover:text-neutral-dark text-2xl leading-none px-2">×</button>
            </div>

            <ActionForm action={action} resetOnSuccess onSuccess={() => setOpen(false)} className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="m-name" className={labelCls}>Jméno a příjmení *</label>
                <input id="m-name" name="name" required className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="m-email" className={labelCls}>E-mail *</label>
                <input id="m-email" name="email" type="email" required className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="m-phone" className={labelCls}>Telefon *</label>
                <input
                  id="m-phone"
                  name="phone"
                  type="tel"
                  required
                  inputMode="tel"
                  pattern="[+]?[0-9\s\-()]{9,20}"
                  title="9 číslic, volitelně s mezinárodní předvolbou (např. +420 123 456 789)"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="m-realized" className={labelCls}>Datum realizace</label>
                <input id="m-realized" name="realized_at" type="date" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label htmlFor="m-jobsize" className={labelCls}>Velikost / hodnota zakázky</label>
                <input id="m-jobsize" name="job_size" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label htmlFor="m-project" className={labelCls}>Zakázka / poznámka</label>
                <textarea id="m-project" name="project" rows={3} className={`${inputCls} resize-y`} />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)} className="py-3 px-6 uppercase tracking-widest text-xs font-black text-neutral-dark/50 hover:text-neutral-dark">Zrušit</button>
                <button type="submit" className="btn-primary py-3 px-8 uppercase tracking-widest">Uložit</button>
              </div>
            </ActionForm>
          </div>
        </div>
      )}
    </>
  );
}
