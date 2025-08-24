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

  // Get the pathname of the request (e.g. /, /protected, /landing)
  const path = request.nextUrl.pathname;

  // If it's the landing page, don't apply the default layout
  if (path.startsWith('/landing')) {
    return NextResponse.next();
  }

  // Continue with default layout for other routes
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};