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
      
      // Optional: x-markdown-tokens header (rough estimation: 1 word ≈ 1.3 tokens)
      // This is a static value for llms.txt summary for now
      response.headers.set('X-Markdown-Tokens', '450'); 
      
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
