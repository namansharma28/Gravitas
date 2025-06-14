import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
  
  // Handle admin routes
  if (isAdminPage) {
    // Allow access to login page
    if (request.nextUrl.pathname === "/admin/login") {
      if (token && (token as any).role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }
    
    // Protect other admin routes
    if (!token || (token as any).role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    
    return NextResponse.next();
  }

  // Handle auth pages
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
};