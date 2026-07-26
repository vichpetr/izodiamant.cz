'use client';

// Klientské odhlášení (next-auth/react) – stejný důvod jako u přihlášení:
// server-action signOut() na Cloudflare Pages edge padá.

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/sprava/prihlaseni' })}
      className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
    >
      Odhlásit
    </button>
  );
}
