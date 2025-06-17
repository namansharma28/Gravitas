import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
  const isAdminLoginPage = request.nextUrl.pathname === "/admin/login";

  // Handle admin routes
  if (isAdminPage && !isAdminLoginPage) {
    // Check for admin token in Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
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
  matcher: ['/admin/:path*', '/auth/:path*']
};