// Stažení PDF nabídky / přílohy z R2 přes quotes-worker. R2 není veřejné –
// soubor dostane jen přihlášený admin.
//
// Přílohy (`prilohy/…`) pocházejí z e-mailů od cizích odesílatelů, a servírují se
// ze stejné domény jako administrace. Proto se vždy nabídnou ke stažení, typ se
// omezí na neaktivní formáty a prohlížeči se zakáže cokoli z nich spouštět.

import { safeAuth, isAllowed } from '@/auth';
import { rawQuotesWorker } from '@/lib/quotesWorker';

export const runtime = 'edge';

const SAFE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

/** Název souboru bezpečný do hlavičky (ASCII fallback + RFC 5987 varianta s diakritikou). */
function disposition(key: string): string {
  const raw = key.split('/').pop() || 'soubor';
  const ascii = raw.replace(/[^\w.\-]/g, '_').slice(0, 100) || 'soubor';
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(raw)}`;
}

export async function GET(request: Request) {
  const session = await safeAuth();
  if (!session?.user || !isAllowed(session.user.email)) return new Response('Nemáte oprávnění.', { status: 403 });

  const key = new URL(request.url).searchParams.get('key') ?? '';
  const isGeneratedPdf = key.startsWith('nabidky/');
  try {
    const res = await rawQuotesWorker(`/files?key=${encodeURIComponent(key)}`);
    if (!res.ok) return new Response('Soubor nenalezen.', { status: res.status });

    const upstreamType = res.headers.get('Content-Type') ?? '';
    const headers = new Headers({
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      // I kdyby se sem dostal aktivní obsah, nesmí nic spustit ani načíst.
      'Content-Security-Policy': "sandbox; default-src 'none'",
    });
    const length = res.headers.get('Content-Length');
    if (length) headers.set('Content-Length', length);

    if (isGeneratedPdf) {
      // Naše vlastní vygenerované PDF – může se otevřít rovnou v prohlížeči.
      headers.set('Content-Type', 'application/pdf');
      headers.set('Content-Disposition', res.headers.get('Content-Disposition') ?? disposition(key));
    } else {
      headers.set('Content-Type', SAFE_TYPES.includes(upstreamType) ? upstreamType : 'application/octet-stream');
      headers.set('Content-Disposition', disposition(key));
    }
    return new Response(res.body, { headers });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : 'Chyba.', { status: 503 });
  }
}
