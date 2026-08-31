import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const sessionToken = request.cookies.get('dashboard_session')?.value;

  if (pathname.startsWith('/dashboard')) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }
  }

  if (pathname.startsWith('/portal') || pathname.startsWith('/map')) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/portal/:path*', '/map/:path*'],
};