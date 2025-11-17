/**
 * Cookie Management
 * Secure cookie handling for authentication tokens
 */

import { serialize, parse } from 'cookie';
import type { NextRequest, NextResponse } from 'next/server';
import { SECURITY_CONFIG } from '@/lib/config/security';

// Export cookie name from centralized config
export const AUTH_COOKIE_NAME = SECURITY_CONFIG.COOKIE.AUTH_COOKIE_NAME;

const COOKIE_OPTIONS = SECURITY_CONFIG.COOKIE.OPTIONS;
const REMEMBER_ME_OPTIONS = SECURITY_CONFIG.COOKIE.REMEMBER_ME_OPTIONS;

/**
 * Set authentication cookie
 */
export function setAuthCookie(
  response: NextResponse,
  token: string,
  rememberMe: boolean = false
): void {
  const options = rememberMe ? REMEMBER_ME_OPTIONS : COOKIE_OPTIONS;
  const cookie = serialize(AUTH_COOKIE_NAME, token, options);

  response.headers.set('Set-Cookie', cookie);
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(response: NextResponse): void {
  const cookie = serialize(AUTH_COOKIE_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });

  response.headers.set('Set-Cookie', cookie);
}

/**
 * Get token from request cookies
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const cookies = parse(request.headers.get('cookie') || '');
  return cookies[AUTH_COOKIE_NAME] || null;
}

/**
 * Get token from cookie header
 */
export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  return cookies[AUTH_COOKIE_NAME] || null;
}

/**
 * Create cookie string for setting auth token
 */
export function createAuthCookie(token: string, rememberMe: boolean = false): string {
  const options = rememberMe ? REMEMBER_ME_OPTIONS : COOKIE_OPTIONS;
  return serialize(AUTH_COOKIE_NAME, token, options);
}

/**
 * Create cookie string for clearing auth token
 */
export function createClearCookie(): string {
  return serialize(AUTH_COOKIE_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
}
