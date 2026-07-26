import Link from 'next/link';
import { cn } from '@/lib/utils';
import SignOutButton from './SignOutButton';

const TABS = [
  { href: '/sprava', label: 'Zákazníci' },
  { href: '/sprava/log', label: 'Audit log' },
] as const;

/** Horní lišta admin sekce se záložkami a odhlášením. */
export default function SpravaNav({ active, email }: { active: '/sprava' | '/sprava/log'; email?: string | null }) {
  return (
    <header className="bg-neutral-dark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="font-black uppercase tracking-tighter">
            IZO<span className="text-primary">DIAMANT</span>
          </div>
          <nav className="flex items-center gap-1">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  'text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-colors',
                  active === t.href
                    ? 'bg-white/10 text-primary'
                    : 'text-white/60 hover:text-white',
                )}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {email && <span className="text-xs text-white/40 hidden sm:inline">{email}</span>}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
