// Stažení PDF nabídky / přílohy z R2 přes quotes-worker. R2 není veřejné –
// soubor dostane jen přihlášený admin.

import { safeAuth, isAllowed } from '@/auth';
import { rawQuotesWorker } from '@/lib/quotesWorker';

export const runtime = 'edge';

export async function GET(request: Request) {
  const session = await safeAuth();
  if (!session?.user || !isAllowed(session.user.email)) return new Response('Nemáte oprávnění.', { status: 403 });

  const key = new URL(request.url).searchParams.get('key') ?? '';
  try {
    const res = await rawQuotesWorker(`/files?key=${encodeURIComponent(key)}`);
    if (!res.ok) return new Response('Soubor nenalezen.', { status: res.status });
    const headers = new Headers();
    for (const h of ['Content-Type', 'Content-Disposition', 'Content-Length']) {
      const v = res.headers.get(h);
      if (v) headers.set(h, v);
    }
    headers.set('Cache-Control', 'private, no-store');
    return new Response(res.body, { headers });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : 'Chyba.', { status: 503 });
  }
}
