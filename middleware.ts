/**
 * Next.js Middleware
 * Protects admin routes and API endpoints with authentication
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth/cookies';
import { verifyToken, refreshToken as refreshJWT } from '@/lib/auth/jwt';
import { createAuthCookie } from '@/lib/auth/cookies';

// Routes that require authentication
const protectedRoutes = [
  '/admin',
  '/api/content',
];

// Routes that don't require authentication
const publicRoutes = [
  '/admin/login',
  '/api/auth',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (isProtectedRoute) {
    const token = getTokenFromRequest(request);

    // No token - redirect to login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token
    const payload = verifyToken(token);

    // Invalid token - redirect to login
    if (!payload) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'session-expired');
      return NextResponse.redirect(loginUrl);
    }

    // Try to refresh token if close to expiry
    const newToken = refreshJWT(token);
    if (newToken && typeof newToken === 'string') {
      // Token was refreshed, update cookie
      const response = NextResponse.next();
      const cookie = createAuthCookie(newToken, false);
      response.headers.set('Set-Cookie', cookie);
      return response;
    }

    // Token valid, continue
    return NextResponse.next();
  }

  // Non-protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
