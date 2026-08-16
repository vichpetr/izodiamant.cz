import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { safeAuth, isAllowed } from '@/auth';
import referencesData from '@/data/references.json';
import SpravaNav from '../SpravaNav';
import ReferencesAdminList, { type AdminReference } from '../ReferencesAdminList';

export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Reference – FB posty',
  robots: { index: false, follow: false },
};

export default async function SpravaReferencePage() {
  const session = await safeAuth();
  if (!session?.user || !isAllowed(session.user.email)) redirect('/sprava/prihlaseni');

  // Chronologicky (od nejstarší) – ve stejném pořadí je posílá i auto-poster (pondělní fronta).
  const items: AdminReference[] = (referencesData as AdminReference[])
    .map((r) => ({
      id: r.id,
      title: r.title,
      location: r.location,
      date: r.date,
      technology: r.technology,
      fbPost: r.fbPost,
    }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  return (
    <main className="min-h-screen bg-neutral-light">
      <SpravaNav active="/sprava/reference" email={session.user.email} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-black uppercase italic text-neutral-dark tracking-tight">Reference</h1>
          <p className="text-sm text-neutral-dark/60 mt-2 max-w-2xl">
            Ke každé referenci je připravený text pro Facebook ke zkopírování. Auto-poster je posílá
            automaticky <strong>v pondělí v 11:30</strong> (chronologicky, od nejstarší). Odkaz vede na detail reference na webu.
          </p>
        </div>

        <ReferencesAdminList items={items} />
      </div>
    </main>
  );
}
