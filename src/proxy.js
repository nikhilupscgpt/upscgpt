import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
export async function proxy(request) {
  const { pathname } = request.nextUrl
  // Allow all API routes, static files, and auth routes through
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/admin-login') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/search') ||
    pathname === '/news' ||
    pathname === '/news/' ||
    pathname.startsWith('/news/') ||
    pathname === '/prelims' ||
    pathname === '/prelims/' ||
    pathname.startsWith('/prelims/prepare') ||
    pathname.startsWith('/mains') ||
    pathname.startsWith('/atlas') ||
    pathname.startsWith('/issues') ||
    pathname.startsWith('/node')
  ) {
    return NextResponse.next()
  }
  // Protect all other routes
  const token = await getToken({ req: request })
  if (!token) {
    return NextResponse.redirect(new URL('/api/auth/signin', request.url))
  }
  return NextResponse.next()
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
