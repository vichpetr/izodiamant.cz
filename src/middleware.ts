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
      response.headers.set('Content-Type', 'text/markdown; charset=utf-8');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
