import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { safeAuth } from '@/auth';
import GoogleSignInButton from './GoogleSignInButton';

export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Přihlášení',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await safeAuth();
  if (session?.user) redirect('/sprava');

  return (
    <main className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-neutral-dark/5 p-10 text-center">
        <div className="font-black text-xl uppercase tracking-tighter mb-1">
          IZO<span className="text-primary-ink">DIAMANT</span>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-dark/40 mb-8">
          Interní správa
        </p>

        <GoogleSignInButton />

        <p className="text-[11px] text-neutral-dark/40 font-medium mt-6 leading-relaxed">
          Přístup mají jen povolené e-maily. Cizí účet bude odmítnut.
        </p>
      </div>
    </main>
  );
}
