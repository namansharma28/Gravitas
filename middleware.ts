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

  // Check if the request is for an API endpoint that requires authentication
  // This allows viewing pages but prevents unauthenticated API calls
  if (path.startsWith('/api/') && 
      (path.includes('/follow') || 
       path.includes('/rsvp') || 
       path.includes('/register') || 
       path.includes('/submit') || 
       path.includes('/create') || 
       path.includes('/update') || 
       path.includes('/delete'))) {
    
    if (!isAuth) {
      // Return a 401 response with a JSON message
      return new NextResponse(
        JSON.stringify({ 
          error: 'Authentication required', 
          message: 'Please sign in to perform this action' 
        }),
        { 
          status: 401, 
          headers: { 'content-type': 'application/json' } 
        }
      );
    }
  }

  // Continue with default layout for other routes
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};