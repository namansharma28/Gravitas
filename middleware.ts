import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return null;
  }

  if (!isAuth) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/auth/signin?from=${encodeURIComponent(from)}`, request.url)
    );
  }
}

export const config = {
  matcher: ['/auth/:path*', '/profile/:path*', '/communities/:path*', '/events/:path*']
};