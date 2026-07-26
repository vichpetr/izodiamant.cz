import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { safeAuth, isAllowed } from '@/auth';
import { listEmailLog } from '@/lib/db';
import SpravaNav from '../SpravaNav';

export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Audit log e-mailů',
  robots: { index: false, follow: false },
};

function fmt(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString('cs-CZ');
}

export default async function LogPage() {
  const session = await safeAuth();
  if (!session?.user || !isAllowed(session.user.email)) redirect('/sprava/prihlaseni');

  const rows = await listEmailLog();

  return (
    <main className="min-h-screen bg-neutral-light">
      <SpravaNav active="/sprava/log" email={session.user.email} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <section className="bg-white rounded-3xl shadow-sm border border-neutral-dark/5 p-6 sm:p-8">
          <h1 className="text-lg font-black uppercase italic text-neutral-dark mb-6">
            Odeslané e-maily <span className="text-neutral-dark/30 text-sm">({rows.length})</span>
          </h1>

          {rows.length === 0 ? (
            <p className="text-neutral-dark/50 font-medium">Zatím nebyl odeslán žádný e-mail.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-widest text-neutral-dark/40 border-b border-neutral-light">
                    <th className="py-3 pr-4">Kdy</th>
                    <th className="py-3 pr-4">Komu</th>
                    <th className="py-3 pr-4">Předmět</th>
                    <th className="py-3 pr-4">Stav</th>
                    <th className="py-3 pr-4">Odeslal</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-neutral-light/60 align-top">
                      <td className="py-3 pr-4 text-neutral-dark/70 whitespace-nowrap">{fmt(r.sent_at)}</td>
                      <td className="py-3 pr-4 text-neutral-dark/70">{r.to_email}</td>
                      <td className="py-3 pr-4 text-neutral-dark/70">{r.subject}</td>
                      <td className="py-3 pr-4">
                        {r.status === 'sent' ? (
                          <span className="text-green-600 font-bold text-xs">Odesláno</span>
                        ) : (
                          <span className="text-red-500 font-bold text-xs" title={r.error || ''}>Chyba</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-neutral-dark/50 text-xs">{r.sent_by}</td>
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
