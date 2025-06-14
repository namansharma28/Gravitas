import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
  const isAdminLoginPage = request.nextUrl.pathname === "/admin/login";

  // Handle admin routes
  if (isAdminPage && !isAdminLoginPage) {
    // Check for admin token in cookies
    const adminToken = request.cookies.get('admin_token');
    
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    
    // In a real implementation, you would verify the token here
    // For now, we'll just check if it exists
  }

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};