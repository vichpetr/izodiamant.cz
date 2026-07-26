import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { safeAuth, isAllowed, signOut } from '@/auth';
import { isDbAvailable, listCustomers } from '@/lib/db';
import { addCustomerAction, deleteCustomerAction, sendThankYouAction } from './actions';

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
      <header className="bg-neutral-dark text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <div className="font-black uppercase tracking-tighter">
              IZO<span className="text-primary">DIAMANT</span>
              <span className="text-white/40 font-bold text-xs ml-3 uppercase tracking-widest">Správa</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sprava/log" className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-primary transition-colors">
              Audit log
            </Link>
            <span className="text-xs text-white/40 hidden sm:inline">{session.user.email}</span>
            <form action={async () => { 'use server'; await signOut({ redirectTo: '/sprava/prihlaseni' }); }}>
              <button type="submit" className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                Odhlásit
              </button>
            </form>
          </div>
        </div>
      </header>

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
          <form action={addCustomerAction} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input name="name" required placeholder="Jméno a příjmení *" className="border-2 border-neutral-light rounded-xl px-4 py-3 font-medium outline-none focus:border-primary" />
            <input name="email" type="email" placeholder="E-mail" className="border-2 border-neutral-light rounded-xl px-4 py-3 font-medium outline-none focus:border-primary" />
            <input name="phone" placeholder="Telefon" className="border-2 border-neutral-light rounded-xl px-4 py-3 font-medium outline-none focus:border-primary" />
            <input name="project" placeholder="Zakázka / poznámka" className="border-2 border-neutral-light rounded-xl px-4 py-3 font-medium outline-none focus:border-primary sm:col-span-2" />
            <input name="realized_at" type="date" title="Datum realizace" className="border-2 border-neutral-light rounded-xl px-4 py-3 font-medium outline-none focus:border-primary" />
            <div className="sm:col-span-2 lg:col-span-3">
              <button type="submit" className="btn-primary py-3 px-8 uppercase tracking-widest">Uložit</button>
            </div>
          </form>
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
                      <td className="py-4 pr-4 text-neutral-dark/70 max-w-[16rem]">{c.project || '—'}</td>
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
                          {c.email && (
                            <form action={sendThankYouAction}>
                              <input type="hidden" name="id" value={c.id} />
                              <button type="submit" className="text-[10px] font-black uppercase tracking-widest bg-primary/15 text-primary-ink px-3 py-2 rounded-lg hover:bg-primary/25 transition-colors whitespace-nowrap">
                                Poslat poděkování
                              </button>
                            </form>
                          )}
                          <form action={deleteCustomerAction}>
                            <input type="hidden" name="id" value={c.id} />
                            <button type="submit" className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/30 hover:text-red-500 transition-colors px-2 py-2">
                              Smazat
                            </button>
                          </form>
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
