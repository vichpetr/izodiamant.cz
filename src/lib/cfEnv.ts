// Cloudflare bindingy (DB, QUOTES, …) pro serverový kód – v obou runtimech, ve kterých
// web během migrace běží:
//   - Workers (OpenNext, `wrangler.jsonc`)            → getCloudflareContext()
//   - Pages (@cloudflare/next-on-pages, dožívá)       → getRequestContext()
// Mimo Cloudflare (next dev / next start v testech) vrací null a volající degradují.
// Po smazání Pages projektu větev s getRequestContext odstranit (viz deployment.MD §1.3).

import { getRequestContext } from '@cloudflare/next-on-pages';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export function getCfEnv(): Record<string, unknown> | null {
  try {
    return getCloudflareContext().env as unknown as Record<string, unknown>;
  } catch {
    // není Workers runtime – zkusíme Pages
  }
  try {
    return getRequestContext().env as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}
