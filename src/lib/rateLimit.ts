// Pojistka proti jednomu klientovi, který web zahlcuje (2026-11-08: stovky tisíc požadavků
// z jedné IP). Doplňuje pravidlo WAF v Cloudflare – to na Free zóně blokuje jen na 10 s a
// počítá krátké okno, tady se hlídá pomalejší trvalý tok (RATE_LIMITER = 200 požadavků / 60 s).
//
// Používá Workers Rate Limiting binding (`[[ratelimits]]` ve wrangler.toml). Mimo Workers
// (next dev / next start v testech) nebo bez bindingu se nic neomezuje.

import { getCfEnv } from '@/lib/cfEnv';

interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/** IPv6 se omezuje po /64 podsíti – klient si v ní běžně mění spodní polovinu adresy. */
export function rateLimitKey(ip: string): string {
  if (!ip.includes(':')) return ip;
  const groups = ip.split(':');
  const head = ip.includes('::')
    ? groups.slice(0, groups.indexOf('')).filter(Boolean)
    : groups.slice(0, 4);
  return `${head.slice(0, 4).join(':')}::/64`;
}

/** true = požadavek má projít; při chybě nebo chybějícím bindingu vždy projde. */
export async function allowRequest(ip: string | null): Promise<boolean> {
  if (!ip) return true;
  const binding = getCfEnv()?.RATE_LIMITER as RateLimitBinding | undefined;
  if (!binding) return true;
  try {
    const { success } = await binding.limit({ key: rateLimitKey(ip) });
    return success;
  } catch {
    return true;
  }
}
