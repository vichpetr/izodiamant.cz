// Cloudflare bindingy (DB, QUOTES, …) pro serverový kód. Mimo Workers runtime
// (next dev / next start v testech) vrací null a volající degradují.

import { getCloudflareContext } from '@opennextjs/cloudflare';

export function getCfEnv(): Record<string, unknown> | null {
  try {
    return getCloudflareContext().env as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}
