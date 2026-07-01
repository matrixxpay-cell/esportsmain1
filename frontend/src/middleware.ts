import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ALLOWED_PREFIXES = [
  '/coming-soon',
  '/auth/',
  '/admin/',
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

  // Allow static files and explicitly allowed paths
  if (ALLOWED_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow root path (coming soon IS the home now)
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Everything else → coming soon
  return NextResponse.redirect(new URL('/coming-soon', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
