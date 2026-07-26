// Auth.js v5 – přihlášení do skryté admin sekce /sprava přes Google.
//
// Session je JWT (bez databáze). Přístup má jen e-mail uvedený v ADMIN_EMAILS
// (čárkami oddělený seznam v env). Cizí Google účet se do sekce vůbec nedostane –
// signIn callback ho odmítne. Přidání dalšího providera (Seznam) je snadné později.
//
// Vyžadované env (nastavit v Cloudflare Pages, viz deployment.MD):
//   AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, ADMIN_EMAILS, AUTH_URL

import NextAuth from 'next-auth';
import type { Session } from 'next-auth';
import Google from 'next-auth/providers/google';

/** Povolené e-maily (malá písmena, oříznuté). */
export function allowedEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  return allowedEmails().includes(email.toLowerCase());
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: 'jwt' },
  trustHost: true,
  // I chybovou stránku (např. odmítnutý účet – AccessDenied) směrujeme na náš
  // vlastní login v designu webu, ať uživatel nevidí generickou Auth.js stránku.
  pages: { signIn: '/sprava/prihlaseni', error: '/sprava/prihlaseni' },
  callbacks: {
    // Do sekce pustíme jen účet z allowlistu; cizí přihlášení odmítneme.
    async signIn({ user }) {
      return isAllowed(user.email);
    },
  },
});

/**
 * Bezpečná varianta auth() – vrátí null místo výjimky, když sekce ještě není
 * nakonfigurovaná (chybí AUTH_SECRET / Google creds). Díky tomu /sprava po
 * prvním nasazení bez configu neshodí na 500, ale slušně ukáže přihlášení.
 * Používat v server komponentách a při gate v actions (fail closed).
 */
export async function safeAuth(): Promise<Session | null> {
  try {
    return (await auth()) as Session | null;
  } catch {
    return null;
  }
}
