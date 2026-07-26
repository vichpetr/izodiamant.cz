'use client';

// Seznam zákazníků s filtry (datum zadání, datum realizace, poděkování,
// realizované zakázky). Filtrace je klientská nad již načtenými daty.

import { useMemo, useState } from 'react';
import type { Customer } from '@/lib/db';
import ActionForm, { type ActionState } from './ActionForm';
import ProjectCell from './ProjectCell';

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const PAGE_SIZE = 20;

function fmt(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('cs-CZ');
}

const selectCls = 'border-2 border-neutral-light rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-primary';
const dateCls = 'border-2 border-neutral-light rounded-xl px-3 py-2 text-sm outline-none focus:border-primary';
const labelCls = 'text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 ml-1';

export default function CustomerTable({
  customers,
  sendThankYouAction,
  deleteCustomerAction,
  updateRealizedAtAction,
}: {
  customers: Customer[];
  sendThankYouAction: Action;
  deleteCustomerAction: Action;
  updateRealizedAtAction: Action;
}) {
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [realizedFrom, setRealizedFrom] = useState('');
  const [realizedTo, setRealizedTo] = useState('');
  const [thanks, setThanks] = useState<'all' | 'sent' | 'unsent'>('all');
  const [realized, setRealized] = useState<'all' | 'yes' | 'no'>('all');

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const created = (c.created_at || '').slice(0, 10);
      if (createdFrom && created < createdFrom) return false;
      if (createdTo && created > createdTo) return false;

      const rz = (c.realized_at || '').slice(0, 10);
      if (realizedFrom && (!rz || rz < realizedFrom)) return false;
      if (realizedTo && (!rz || rz > realizedTo)) return false;

      const sent = c.last_email_status === 'sent';
      if (thanks === 'sent' && !sent) return false;
      if (thanks === 'unsent' && sent) return false;

      const isRealized = !!c.realized_at;
      if (realized === 'yes' && !isRealized) return false;
      if (realized === 'no' && isRealized) return false;

      return true;
    });
  }, [customers, createdFrom, createdTo, realizedFrom, realizedTo, thanks, realized]);

  const anyFilter = createdFrom || createdTo || realizedFrom || realizedTo || thanks !== 'all' || realized !== 'all';

  // Stránkování nad vyfiltrovaným seznamem.
  const [page, setPage] = useState(1);
  // Při změně filtru zpět na první stranu (reset během renderu – React vzor,
  // bez setState v effectu).
  const filterKey = `${createdFrom}|${createdTo}|${realizedFrom}|${realizedTo}|${thanks}|${realized}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeFrom = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeTo = Math.min(currentPage * PAGE_SIZE, filtered.length);

  return (
    <section className="bg-white rounded-3xl shadow-sm border border-neutral-dark/5 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-black uppercase italic text-neutral-dark">
          Zákazníci <span className="text-neutral-dark/30 text-sm">({filtered.length}{anyFilter ? ` z ${customers.length}` : ''})</span>
        </h2>
        {anyFilter && (
          <button
            type="button"
            onClick={() => { setCreatedFrom(''); setCreatedTo(''); setRealizedFrom(''); setRealizedTo(''); setThanks('all'); setRealized('all'); }}
            className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 hover:text-primary-ink"
          >
            Zrušit filtry
          </button>
        )}
      </div>

      {/* Filtry */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-neutral-light/50 rounded-2xl p-4">
        <div className="flex flex-col gap-1">
          <span className={labelCls}>Datum zadání</span>
          <div className="flex items-center gap-2">
            <input type="date" value={createdFrom} onChange={(e) => setCreatedFrom(e.target.value)} className={dateCls} aria-label="Datum zadání od" />
            <span className="text-neutral-dark/30">–</span>
            <input type="date" value={createdTo} onChange={(e) => setCreatedTo(e.target.value)} className={dateCls} aria-label="Datum zadání do" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className={labelCls}>Datum realizace</span>
          <div className="flex items-center gap-2">
            <input type="date" value={realizedFrom} onChange={(e) => setRealizedFrom(e.target.value)} className={dateCls} aria-label="Datum realizace od" />
            <span className="text-neutral-dark/30">–</span>
            <input type="date" value={realizedTo} onChange={(e) => setRealizedTo(e.target.value)} className={dateCls} aria-label="Datum realizace do" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="f-thanks" className={labelCls}>Poděkování</label>
            <select id="f-thanks" value={thanks} onChange={(e) => setThanks(e.target.value as typeof thanks)} className={selectCls}>
              <option value="all">Vše</option>
              <option value="sent">Odesláno</option>
              <option value="unsent">Neodesláno</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="f-realized" className={labelCls}>Zakázka</label>
            <select id="f-realized" value={realized} onChange={(e) => setRealized(e.target.value as typeof realized)} className={selectCls}>
              <option value="all">Vše</option>
              <option value="yes">Realizované</option>
              <option value="no">Nerealizované</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-neutral-dark/50 font-medium">{customers.length === 0 ? 'Zatím žádní zákazníci.' : 'Žádný zákazník neodpovídá filtru.'}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 border-b border-neutral-light">
                <th className="py-3 pr-4">Zákazník</th>
                <th className="py-3 pr-4">Kontakt</th>
                <th className="py-3 pr-4">Zakázka</th>
                <th className="py-3 pr-4">Velikost</th>
                <th className="py-3 pr-4">Zadáno</th>
                <th className="py-3 pr-4">Realizace</th>
                <th className="py-3 pr-4">Zdroj</th>
                <th className="py-3 pr-4">Poděkování</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((c) => (
                <tr key={c.id} className="border-b border-neutral-light/60 align-top">
                  <td className="py-4 pr-4 font-bold text-neutral-dark">{c.name}</td>
                  <td className="py-4 pr-4 text-neutral-dark/70">
                    {c.email && <div>{c.email}</div>}
                    {c.phone && <div>{c.phone}</div>}
                    {!c.email && !c.phone && '—'}
                  </td>
                  <td className="py-4 pr-4 text-neutral-dark/70 max-w-[18rem]"><ProjectCell text={c.project} /></td>
                  <td className="py-4 pr-4 text-neutral-dark/70 whitespace-nowrap">{c.job_size || '—'}</td>
                  <td className="py-4 pr-4 text-neutral-dark/60 whitespace-nowrap">{fmt(c.created_at)}</td>
                  <td className="py-4 pr-4">
                    {/* Datum realizace lze doplnit/změnit i dodatečně (lead → hotová zakázka). */}
                    <ActionForm action={updateRealizedAtAction} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={c.id} />
                      <input
                        type="date"
                        name="realized_at"
                        defaultValue={c.realized_at ? c.realized_at.slice(0, 10) : ''}
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        title="Uloží se po změně data"
                        className="border border-neutral-light rounded-lg px-2 py-1 text-xs outline-none focus:border-primary"
                      />
                    </ActionForm>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/40">{c.source}</span>
                  </td>
                  <td className="py-4 pr-4">
                    {c.last_email_at ? (
                      <span
                        className={c.last_email_status === 'sent' ? 'text-green-600 font-bold text-xs' : 'text-red-500 font-bold text-xs'}
                        title={c.last_email_status === 'sent' ? 'Poděkování odesláno' : 'Odeslání selhalo'}
                      >
                        {fmt(c.last_email_at)}
                      </span>
                    ) : (
                      <span className="text-neutral-dark/30 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-4 pr-2">
                    <div className="flex items-center gap-2 justify-end">
                      {/* Poděkování: jen s e-mailem, po realizaci a jen jednou. */}
                      {c.last_email_status === 'sent' ? null : !c.email ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-dark/25 whitespace-nowrap" title="Zákazník nemá e-mail">Bez e-mailu</span>
                      ) : !c.realized_at ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-dark/25 whitespace-nowrap" title="Nejdřív doplňte datum realizace">Čeká na realizaci</span>
                      ) : (
                        <ActionForm action={sendThankYouAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <button type="submit" className="text-[10px] font-black uppercase tracking-widest bg-primary/15 text-primary-ink px-3 py-2 rounded-lg hover:bg-primary/25 transition-colors whitespace-nowrap">Poslat poděkování</button>
                        </ActionForm>
                      )}
                      <ActionForm action={deleteCustomerAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/30 hover:text-red-500 transition-colors px-2 py-2">Smazat</button>
                      </ActionForm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-neutral-light">
          <span className="text-xs text-neutral-dark/50 font-medium">{rangeFrom}–{rangeTo} z {filtered.length}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg text-neutral-dark/60 hover:text-neutral-dark disabled:opacity-30 disabled:pointer-events-none"
            >
              ← Předchozí
            </button>
            <span className="text-xs font-bold text-neutral-dark/60 whitespace-nowrap">Strana {currentPage} / {totalPages}</span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg text-neutral-dark/60 hover:text-neutral-dark disabled:opacity-30 disabled:pointer-events-none"
            >
              Další →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
