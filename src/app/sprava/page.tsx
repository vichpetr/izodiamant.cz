import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { safeAuth, isAllowed } from '@/auth';
import { isDbAvailable, listCustomers } from '@/lib/db';
import { addCustomerAction, deleteCustomerAction, sendThankYouAction, updateRealizedAtAction } from './actions';
import SpravaNav from './SpravaNav';
import ActionForm from './ActionForm';

export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Správa zákazníků',
  robots: { index: false, follow: false },
};

function fmt(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('cs-CZ');
}

export default async function SpravaPage() {
  const session = await safeAuth();
  if (!session?.user || !isAllowed(session.user.email)) redirect('/sprava/prihlaseni');

  const dbReady = isDbAvailable();
  const customers = await listCustomers();

  return (
    <main className="min-h-screen bg-neutral-light">
      <SpravaNav active="/sprava" email={session.user.email} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {!dbReady && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
            <strong>Databáze není připojená.</strong> Chybí binding <code>DB</code> (Cloudflare D1).
            Sekce se zobrazí, ale data se nenačtou ani neuloží – dokud se D1 nenabinduje v nastavení Pages (viz deployment.MD).
          </div>
        )}

        {/* Přidat zákazníka */}
        <section className="bg-white rounded-3xl shadow-sm border border-neutral-dark/5 p-6 sm:p-8">
          <h1 className="text-lg font-black uppercase italic text-neutral-dark mb-6">Přidat zákazníka</h1>
          <ActionForm action={addCustomerAction} resetOnSuccess className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="add-name" className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 ml-1">Jméno a příjmení *</label>
              <input id="add-name" name="name" required className="border-2 border-neutral-light rounded-xl px-4 py-3 font-medium outline-none focus:border-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="add-email" className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 ml-1">E-mail</label>
              <input id="add-email" name="email" type="email" className="border-2 border-neutral-light rounded-xl px-4 py-3 font-medium outline-none focus:border-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="add-phone" className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 ml-1">Telefon</label>
              <input id="add-phone" name="phone" className="border-2 border-neutral-light rounded-xl px-4 py-3 font-medium outline-none focus:border-primary" />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label htmlFor="add-jobsize" className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 ml-1">Velikost / hodnota zakázky</label>
              <input id="add-jobsize" name="job_size" className="border-2 border-neutral-light rounded-xl px-4 py-3 font-medium outline-none focus:border-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="add-realized" className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 ml-1">Datum realizace</label>
              <input id="add-realized" name="realized_at" type="date" className="border-2 border-neutral-light rounded-xl px-4 py-3 font-medium outline-none focus:border-primary" />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
              <label htmlFor="add-project" className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 ml-1">Zakázka / poznámka</label>
              <textarea id="add-project" name="project" rows={2} className="border-2 border-neutral-light rounded-xl px-4 py-3 font-medium outline-none focus:border-primary resize-y" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <button type="submit" className="btn-primary py-3 px-8 uppercase tracking-widest">Uložit</button>
            </div>
          </ActionForm>
        </section>

        {/* Seznam zákazníků */}
        <section className="bg-white rounded-3xl shadow-sm border border-neutral-dark/5 p-6 sm:p-8">
          <h2 className="text-lg font-black uppercase italic text-neutral-dark mb-6">
            Zákazníci <span className="text-neutral-dark/30 text-sm">({customers.length})</span>
          </h2>

          {customers.length === 0 ? (
            <p className="text-neutral-dark/50 font-medium">Zatím žádní zákazníci.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 border-b border-neutral-light">
                    <th className="py-3 pr-4">Zákazník</th>
                    <th className="py-3 pr-4">Kontakt</th>
                    <th className="py-3 pr-4">Zakázka</th>
                    <th className="py-3 pr-4">Velikost</th>
                    <th className="py-3 pr-4">Realizace</th>
                    <th className="py-3 pr-4">Zdroj</th>
                    <th className="py-3 pr-4">Poděkování</th>
                    <th className="py-3 pr-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-neutral-light/60 align-top">
                      <td className="py-4 pr-4 font-bold text-neutral-dark">{c.name}</td>
                      <td className="py-4 pr-4 text-neutral-dark/70">
                        {c.email && <div>{c.email}</div>}
                        {c.phone && <div>{c.phone}</div>}
                        {!c.email && !c.phone && '—'}
                      </td>
                      <td className="py-4 pr-4 text-neutral-dark/70 max-w-[18rem] whitespace-pre-wrap">{c.project || '—'}</td>
                      <td className="py-4 pr-4 text-neutral-dark/70 whitespace-nowrap">{c.job_size || '—'}</td>
                      <td className="py-4 pr-4">
                        {/* Datum realizace lze doplnit/změnit i dodatečně (lead → hotová zakázka). */}
                        <ActionForm action={updateRealizedAtAction} className="flex items-center gap-1">
                          <input type="hidden" name="id" value={c.id} />
                          <input
                            type="date"
                            name="realized_at"
                            defaultValue={c.realized_at ? c.realized_at.slice(0, 10) : ''}
                            className="border border-neutral-light rounded-lg px-2 py-1 text-xs outline-none focus:border-primary"
                          />
                          <button type="submit" title="Uložit datum" className="text-[10px] font-black uppercase tracking-widest text-primary-ink hover:text-neutral-dark px-2 py-1">
                            OK
                          </button>
                        </ActionForm>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/40">{c.source}</span>
                      </td>
                      <td className="py-4 pr-4">
                        {c.last_email_at ? (
                          <span className={c.last_email_status === 'sent' ? 'text-green-600 font-bold text-xs' : 'text-red-500 font-bold text-xs'}>
                            {c.last_email_status === 'sent' ? 'Odesláno' : 'Chyba'} · {fmt(c.last_email_at)}
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
                              <button type="submit" className="text-[10px] font-black uppercase tracking-widest bg-primary/15 text-primary-ink px-3 py-2 rounded-lg hover:bg-primary/25 transition-colors whitespace-nowrap">
                                Poslat poděkování
                              </button>
                            </ActionForm>
                          )}
                          <ActionForm action={deleteCustomerAction}>
                            <input type="hidden" name="id" value={c.id} />
                            <button type="submit" className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/30 hover:text-red-500 transition-colors px-2 py-2">
                              Smazat
                            </button>
                          </ActionForm>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
