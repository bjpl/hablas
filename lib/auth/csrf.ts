/**
 * CSRF Protection Implementation
 * Provides Cross-Site Request Forgery protection for state-changing operations
 */

import { createHmac, randomBytes } from 'crypto';
import type { NextRequest } from 'next/server';
import { serialize, parse } from 'cookie';

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET;
const CSRF_COOKIE_NAME = 'hablas_csrf_token';
const CSRF_TOKEN_LENGTH = 32;

if (!CSRF_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CSRF_SECRET or JWT_SECRET must be set in production');
  }
  console.warn('⚠️  WARNING: Using default CSRF secret in development');
}

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Create HMAC signature for CSRF token
 */
function createTokenSignature(token: string): string {
  const hmac = createHmac('sha256', CSRF_SECRET!);
  hmac.update(token);
  return hmac.digest('hex');
}

/**
 * Verify CSRF token signature
 */
function verifyTokenSignature(token: string, signature: string): boolean {
  const expectedSignature = createTokenSignature(token);
  return signature === expectedSignature;
}

/**
 * Create signed CSRF token
 */
export function createSignedCsrfToken(): { token: string; signature: string } {
  const token = generateCsrfToken();
  const signature = createTokenSignature(token);
  return { token, signature };
}

/**
 * Set CSRF token cookie in response
 */
export function setCsrfCookie(token: string): string {
  return serialize(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Get CSRF token from request cookies
 */
export function getCsrfTokenFromCookies(request: NextRequest): string | null {
  const cookies = parse(request.headers.get('cookie') || '');
  return cookies[CSRF_COOKIE_NAME] || null;
}

/**
 * Get CSRF token from request header
 */
export function getCsrfTokenFromHeader(request: NextRequest): string | null {
  return request.headers.get('X-CSRF-Token') ||
         request.headers.get('x-csrf-token') ||
         null;
}

/**
 * Verify CSRF token from request
 */
export async function verifyCsrfToken(request: NextRequest): Promise<boolean> {
  // Get token from cookie (stored on client)
  const cookieToken = getCsrfTokenFromCookies(request);

  // Get token from header (sent with request)
  const headerToken = getCsrfTokenFromHeader(request);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Tokens must match (double-submit cookie pattern)
  return cookieToken === headerToken;
}

/**
 * Verify CSRF token with signature
 * More secure alternative to double-submit cookie pattern
 */
export async function verifyCsrfTokenWithSignature(
  token: string,
  signature: string
): Promise<boolean> {
  if (!token || !signature) {
    return false;
  }

  return verifyTokenSignature(token, signature);
}

/**
 * Middleware helper to check CSRF token
 */
export async function requireCsrfToken(request: NextRequest): Promise<void> {
  const isValid = await verifyCsrfToken(request);

  if (!isValid) {
    throw new Error('Invalid or missing CSRF token');
  }
}

/**
 * Check if request method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return protectedMethods.includes(method.toUpperCase());
}

/**
 * Clear CSRF cookie
 */
export function clearCsrfCookie(): string {
  return serialize(CSRF_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}
