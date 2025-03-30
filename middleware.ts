import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Check if the user is authenticated
  const isAuthenticated = !!session
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
  const isCallback = req.nextUrl.pathname === '/auth/callback'

  // Allow access to auth callback page
  if (isCallback) {
    return res
  }

  // Redirect authenticated users trying to access auth pages to home
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Redirect unauthenticated users to login page except for auth pages
  if (!isAuthenticated && !isAuthPage && req.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url))
  }

  return res
}

// Specify which routes the middleware should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 