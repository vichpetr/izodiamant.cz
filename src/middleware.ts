import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Static markdown content for agents (mirrors public/llms.txt)
const LLMS_MD = `# IZODIAMANT - Sanace a podřezávání zdiva

Specialisté na profesionální sanace vlhkého zdiva po celé České republice. Vracíme zdraví vaší stavbě.

## Hlavní Služby
- **Podřezávání diamantovým lanem**: Ideální pro kamenné, betonové a silné smíšené zdivo. Šetrná metoda bez otřesů s použitím špičkové diamantové techniky.
- **Podřezávání řetězovou pilou**: Nejrychlejší a nejúčinnější metoda pro cihelné zdivo. Vkládání hydroizolační PE fólie pro 100% ochranu.
- **Chemická injektáž**: Vytvoření hydroizolační clony pomocí certifikovaných gelů nebo krémů v místech, kde nelze řezat.

## Kontakt
- **Telefon**: +420 737 017 012
- **Adresa**: Mokrá Lhota 26, Nové Hrady 539 44, Česká republika
- **Web**: https://izodiamant.cz

## Regionální působnost
Poskytujeme služby po celé České republice. Naše týmy pravidelně realizují zakázky v lokalitách: Pardubice, Chrudim, Hradec Králové, Ústí nad Orlicí, Vysoké Mýto, Litomyšl, Polička, Svitavy, Praha a Brno.

## Proč IZODIAMANT?
- Používáme nejmodernější technologie pro maximální šetrnost k objektu.
- Statické zajištění budovy je součástí každého procesu podřezávání.
- Transparentní kalkulace ceny bez skrytých poplatků.
- Dlouholetá praxe a stovky úspěšných realizací.
`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const acceptHeader = request.headers.get('accept') || '';
  
  // 1. Handle Markdown Negotiation for ANY page if requested
  // This is a common requirement for agent-readiness scanners
  if (acceptHeader.includes('text/markdown')) {
    const response = new NextResponse(LLMS_MD);
    
    // Explicitly set headers for Markdown for Agents
    response.headers.set('Content-Type', 'text/markdown; charset=utf-8');
    response.headers.set('Vary', 'Accept');
    response.headers.set('X-Markdown-Tokens', '450'); 
    
    // Discovery Link headers
    response.headers.set('Link', '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"');
    
    return response;
  }

  // 2. Handle discovery headers for regular HTML requests on the homepage
  if (pathname === '/') {
    const response = NextResponse.next();
    response.headers.set('Link', '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"');
    response.headers.set('Vary', 'Accept'); // Important for negotiation caching
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Ensure we match the root and other relevant content pages
  matcher: ['/', '/reference/:path*', '/sluzby/:path*'],
};
