import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
export async function proxy(request) {
  const { pathname } = request.nextUrl
  // Allow all API routes, static files, and auth routes through
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/search')
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
