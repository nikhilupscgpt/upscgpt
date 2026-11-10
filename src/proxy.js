import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function isNoIndexUtilityPath(pathname) {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/content-portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/notes")
  );
}

function withNoIndexHeader(response) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow internal auth/utility routes through with explicit X-Robots-Tag: noindex, nofollow
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/content-portal")
  ) {
    return withNoIndexHeader(NextResponse.next());
  }

  // Allow all API routes, static files, and public study routes through
  if (
    pathname === "/" ||
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
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/refund-policy") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/mapping") ||
    pathname.startsWith("/atlas") ||
    pathname.startsWith("/news") ||
    pathname.startsWith("/prelims") ||
    pathname.startsWith("/mains") ||
    pathname.startsWith("/issues") ||
    pathname.startsWith("/remote") ||
    pathname.startsWith("/node")
  ) {
    return NextResponse.next();
  }

  // Protect all other routes
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = pathname.startsWith("/admin") ? "/admin-login" : "/login";
    const fullTarget = pathname + (request.nextUrl.search || "");
    const redirectRes = NextResponse.redirect(
      new URL(`${loginUrl}?callbackUrl=${encodeURIComponent(fullTarget)}`, request.url)
    );
    return withNoIndexHeader(redirectRes);
  }

  // Display role restriction: keeps classroom display accounts strictly on board display
  if (token?.role === 'DISPLAY') {
    if (!pathname.startsWith('/remote/display') && !pathname.startsWith('/api/remote') && !pathname.startsWith('/api/auth')) {
      return NextResponse.redirect(new URL('/remote/display', request.url));
    }
  }

  const res = NextResponse.next();
  return isNoIndexUtilityPath(pathname) ? withNoIndexHeader(res) : res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
