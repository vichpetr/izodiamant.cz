import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { safeAuth } from '@/auth';
import GoogleSignInButton from './GoogleSignInButton';

export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Přihlášení',
  robots: { index: false, follow: false },
};

// Text chyby podle Auth.js `error` parametru. AccessDenied = účet není v allowlistu.
function errorMessage(error?: string): string | null {
  if (!error) return null;
  switch (error) {
    case 'AccessDenied':
      return 'Tento účet nemá přístup do interní správy. Přihlaste se povoleným účtem.';
    case 'Configuration':
      return 'Přihlášení není správně nakonfigurováno. Kontaktujte správce.';
    case 'Verification':
      return 'Odkaz pro přihlášení vypršel nebo už byl použit. Zkuste to znovu.';
    default:
      return 'Přihlášení se nezdařilo. Zkuste to prosím znovu.';
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await safeAuth();
  if (session?.user) redirect('/sprava');

  const { error } = await searchParams;
  const message = errorMessage(error);

  return (
    <main className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-neutral-dark/5 p-10 text-center">
        <div className="font-black text-xl uppercase tracking-tighter mb-1">
          IZO<span className="text-primary-ink">DIAMANT</span>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-dark/40 mb-8">
          Interní správa
        </p>

        {message && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-left">
            <p className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-1">
              Přístup odmítnut
            </p>
            <p className="text-xs text-red-700/80 font-medium leading-relaxed">{message}</p>
          </div>
        )}

        <GoogleSignInButton />

        <p className="text-[11px] text-neutral-dark/40 font-medium mt-6 leading-relaxed">
          Přístup mají jen povolené e-maily. Cizí účet bude odmítnut.
        </p>
      </div>
    </main>
  );
}
