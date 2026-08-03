import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Define public paths
  const isPublicPath = pathname === "/login" || pathname === "/" || pathname.startsWith("/form-perubahan-it");
  
  // Static assets, public resources, and favicon bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next();
  }

  // If user is logged in and accesses /login, redirect to dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is NOT logged in and path is protected, redirect to landing page (/)
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }


  // Otherwise, proceed
  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard",
    "/dashboard/:path*",
    "/spd/:path*",
    "/rekayasaaplikasi/:path*",
    "/integrasiinteroperabilitas/:path*",
    "/smartjabar/:path*",
    "/sidebarjabar/:path*",
    "/sadajabar/:path*",
    "/pengelolaanaplikasi/:path*",
    "/manajementugasdigital/:path*",
    "/admin/:path*",
  ],
};
