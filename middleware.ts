/**
 * Next.js Middleware with Edge Runtime Support
 * Protects admin routes and API endpoints with JWT authentication
 * Uses jose library for Edge-compatible JWT verification
 * Implements role-based access control
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth/cookies';
import { verifyToken, refreshToken as refreshJWT } from '@/lib/auth/jwt';
import { createAuthCookie } from '@/lib/auth/cookies';
import { isTokenBlacklisted } from '@/lib/auth/session';
import type { UserRole } from '@/lib/auth/types';

// Route configuration with role-based access
interface RouteConfig {
  path: string;
  allowedRoles?: UserRole[];
  requireAuth: boolean;
}

const routeConfigs: RouteConfig[] = [
  // Public routes (no auth required)
  { path: '/admin/login', requireAuth: false },
  { path: '/admin/reset-password', requireAuth: false },
  { path: '/api/auth', requireAuth: false },

  // Admin-only routes
  { path: '/admin/users', requireAuth: true, allowedRoles: ['admin'] },
  { path: '/admin/settings', requireAuth: true, allowedRoles: ['admin'] },

  // Editor and admin routes
  { path: '/admin/content/edit', requireAuth: true, allowedRoles: ['admin', 'editor'] },
  { path: '/admin/content/create', requireAuth: true, allowedRoles: ['admin', 'editor'] },
  { path: '/api/content', requireAuth: true, allowedRoles: ['admin', 'editor'] },

  // All authenticated users
  { path: '/admin', requireAuth: true },
];

// Default protected routes pattern
const defaultProtectedPattern = /^\/admin(?!\/login|\/reset-password)/;

function getRouteConfig(pathname: string): RouteConfig | null {
  // Find exact match first
  const exactMatch = routeConfigs.find(config => pathname === config.path);
  if (exactMatch) return exactMatch;

  // Find prefix match
  const prefixMatch = routeConfigs.find(config =>
    pathname.startsWith(config.path) && config.path !== '/admin/login'
  );
  if (prefixMatch) return prefixMatch;

  // Check default protected pattern
  if (defaultProtectedPattern.test(pathname)) {
    return { path: pathname, requireAuth: true };
  }

  return null;
}

function hasRequiredRole(userRole: UserRole, allowedRoles?: UserRole[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true; // No role restrictions
  }
  return allowedRoles.includes(userRole);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get route configuration
  const routeConfig = getRouteConfig(pathname);

  // Public route or no config - allow access
  if (!routeConfig || !routeConfig.requireAuth) {
    return NextResponse.next();
  }

  // Protected route - check authentication
  const token = getTokenFromRequest(request);

  // No token - redirect to login
  if (!token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if token is blacklisted
  const blacklisted = await isTokenBlacklisted(token);
  if (blacklisted) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'session-revoked');
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const payload = await verifyToken(token);

  // Invalid token - redirect to login
  if (!payload) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'session-expired');
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  if (routeConfig.allowedRoles && !hasRequiredRole(payload.role, routeConfig.allowedRoles)) {
    // User doesn't have required role - return 403
    return NextResponse.json(
      { error: 'Forbidden', message: 'You do not have permission to access this resource' },
      { status: 403 }
    );
  }

  // Try to refresh token if close to expiry
  const newToken = await refreshJWT(token);
  if (newToken && typeof newToken === 'string') {
    // Token was refreshed, update cookie
    const response = NextResponse.next();
    const cookie = createAuthCookie(newToken, false);
    response.headers.set('Set-Cookie', cookie);

    // Add user info to headers for API routes
    response.headers.set('X-User-Id', payload.userId);
    response.headers.set('X-User-Role', payload.role);

    return response;
  }

  // Token valid, add user info to headers and continue
  const response = NextResponse.next();
  response.headers.set('X-User-Id', payload.userId);
  response.headers.set('X-User-Role', payload.role);

  return response;
}

export const config = {
  // Edge runtime is the default in Next.js 15 (no need to specify)
  // jose library is fully compatible with Edge runtime
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
