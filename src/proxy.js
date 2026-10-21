import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow all API routes, static files, and auth routes through
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/llms") ||
    pathname.startsWith("/ai-catalog") ||
    pathname.startsWith("/.well-known") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/mapping") ||
    pathname.startsWith("/atlas") ||
    pathname.startsWith("/news") ||
    pathname.startsWith("/prelims") ||
    pathname.startsWith("/mains") ||
    pathname.startsWith("/issues") ||
    pathname.startsWith("/node")
  ) {
    return NextResponse.next();
  }

  // Protect all other routes
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = pathname.startsWith("/admin") ? "/admin-login" : "/login";
    return NextResponse.redirect(new URL(`${loginUrl}?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
