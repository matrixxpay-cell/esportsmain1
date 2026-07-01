import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ALWAYS_ALLOWED = [
  '/coming-soon',
  '/auth/',
  '/_next/',
  '/api/',
  '/icons/',
  '/favicon',
  '/apple-touch',
  '/logo-eg',
  '/manifest.json',
  '/sw.js',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow these paths
  if (ALWAYS_ALLOWED.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Admin users (cookie set on login) bypass coming-soon
  const isAdmin = request.cookies.get('eg_admin')?.value === '1'
  if (isAdmin) {
    return NextResponse.next()
  }

  // Root → coming soon
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/coming-soon', request.url))
  }

  // Everything else → coming soon
  return NextResponse.redirect(new URL('/coming-soon', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
