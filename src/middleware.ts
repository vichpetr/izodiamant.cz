import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { LLMS_MD } from '@/lib/llms';

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
    // Hrubý odhad (~4 znaky na token) – jinak by hodnota zastarala s každou úpravou llms.txt.
    response.headers.set('X-Markdown-Tokens', String(Math.ceil(LLMS_MD.length / 4)));
    
    // Discovery Link headers
    response.headers.set('Link', '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog", </.well-known/openid-configuration>; rel="openid-configuration", </.well-known/oauth-protected-resource>; rel="oauth-protected-resource", </.well-known/agent-card.json>; rel="agent-card"');
    
    return response;
  }

  // 2. Handle discovery headers for regular HTML requests on the homepage
  if (pathname === '/') {
    const response = NextResponse.next();
    response.headers.set('Link', '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog", </.well-known/openid-configuration>; rel="openid-configuration", </.well-known/oauth-protected-resource>; rel="oauth-protected-resource", </.well-known/agent-card.json>; rel="agent-card"');
    response.headers.set('Vary', 'Accept'); // Important for negotiation caching
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Match content pages but explicitly exclude static assets and .well-known
  matcher: [
    '/((?!api|_next/static|_next/image|.well-known|favicon.ico).*)',
  ],
};
