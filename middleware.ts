/**
 * Next.js Middleware for Route Protection
 *
 * Protects admin routes from unauthorized access.
 * Redirects unauthenticated users to the login page.
 *
 * NOTE: This middleware runs on the Edge Runtime, so it has limited
 * access to Node.js APIs. For GitHub Pages static export, we also
 * use client-side protection in the admin pages themselves.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Check if user has a valid session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      // Add redirect parameter to return user after login
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Token exists, allow access
    return NextResponse.next()
  }

  // Allow all other routes
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/admin/:path*',
    // Exclude these paths from middleware
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
