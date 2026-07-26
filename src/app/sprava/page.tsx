import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { safeAuth, isAllowed } from '@/auth';
import { isDbAvailable, listCustomers } from '@/lib/db';
import { addCustomerAction, deleteCustomerAction, sendThankYouAction, updateRealizedAtAction } from './actions';
import SpravaNav from './SpravaNav';
import AddCustomerModal from './AddCustomerModal';
import CustomerTable from './CustomerTable';

export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Správa zákazníků',
  robots: { index: false, follow: false },
};

export default async function SpravaPage() {
  const session = await safeAuth();
  if (!session?.user || !isAllowed(session.user.email)) redirect('/sprava/prihlaseni');

  const dbReady = isDbAvailable();
  const customers = await listCustomers();

  return (
    <main className="min-h-screen bg-neutral-light">
      <SpravaNav active="/sprava" email={session.user.email} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {!dbReady && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
            <strong>Databáze není připojená.</strong> Chybí binding <code>DB</code> (Cloudflare D1).
            Sekce se zobrazí, ale data se nenačtou ani neuloží – dokud se D1 nenabinduje v nastavení Pages (viz deployment.MD).
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-black uppercase italic text-neutral-dark tracking-tight">Zákazníci</h1>
          <AddCustomerModal action={addCustomerAction} />
        </div>

        <CustomerTable
          customers={customers}
          sendThankYouAction={sendThankYouAction}
          deleteCustomerAction={deleteCustomerAction}
          updateRealizedAtAction={updateRealizedAtAction}
        />
      </div>
    </main>
  );
}
