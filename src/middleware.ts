import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const acceptHeader = request.headers.get('accept') || '';
  
  // 1. Handle Markdown Negotiation for the homepage
  if (pathname === '/' && acceptHeader.includes('text/markdown')) {
    const url = request.nextUrl.clone();
    url.pathname = '/llms.txt';
    
    const response = NextResponse.rewrite(url);
    
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
  // Broaden matcher to ensure we don't miss the root under any conditions
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
