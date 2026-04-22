import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const acceptHeader = request.headers.get('accept');
  
  if (acceptHeader && acceptHeader.includes('text/markdown')) {
    // If the request is for the homepage and asks for markdown, serve llms.txt
    if (request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/llms.txt';
      
      const response = NextResponse.rewrite(url);
      
      // Standard headers for Markdown for Agents
      response.headers.set('Content-Type', 'text/markdown; charset=utf-8');
      response.headers.set('Vary', 'Accept');
      response.headers.set('X-Markdown-Tokens', '450'); 
      
      // Add discovery links even to the markdown response
      response.headers.set('Link', '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"');
      
      return response;
    }
  }

  const response = NextResponse.next();

  // Inject Link headers for discovery on the homepage
  if (request.nextUrl.pathname === '/') {
    response.headers.set('Link', '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"');
  }

  return response;
}

export const config = {
  matcher: '/',
};
