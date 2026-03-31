import { NextResponse, type NextRequest } from 'next/server'

// Middleware is kept minimal — no Supabase calls — to avoid Edge timeout.
// Auth and role checks are handled entirely in server components/pages.
// We do a lightweight cookie-presence check to redirect obviously unauthenticated
// requests away from protected routes without any network calls.
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check for Supabase auth cookie (sb-*-auth-token) without validating it —
  // server components do the real validation via getUser().
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('-auth-token') && c.value)

  if (!hasAuthCookie && (pathname.startsWith('/dashboard') || pathname.startsWith('/outreach'))) {
    return NextResponse.redirect(new URL('/client-login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/outreach/:path*', '/client-login'],
}
