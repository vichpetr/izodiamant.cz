// Příjem hlášení o porušení Content-Security-Policy (hlavička je zatím jen Report-Only).
// Hlášení se jen zapíše do logu Workeru (Workers Observability) – nic se neukládá.
// Tělo se ořezává, ať endpoint nejde zneužít k plnění logu.

const MAX_BODY = 4096;

export async function POST(request: Request) {
  try {
    const body = (await request.text()).slice(0, MAX_BODY);
    console.warn('[csp-report]', body);
  } catch {
    // hlášení je nepovinné, chyba čtení těla nemá nikoho zajímat
  }
  return new Response(null, { status: 204 });
}
