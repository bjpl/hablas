/**
 * Security Headers Configuration
 * Comprehensive security headers for production deployment
 */

import type { NextResponse } from 'next/server';

/**
 * Content Security Policy (CSP) Configuration
 * Prevents XSS and other code injection attacks
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'",   // Required for Next.js development
    process.env.NODE_ENV === 'production' ? '' : "'unsafe-eval'",
  ].filter(Boolean),
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components/CSS-in-JS
    'fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:',
  ],
  'font-src': [
    "'self'",
    'data:',
    'fonts.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    'https://api.anthropic.com',
    process.env.NEXT_PUBLIC_API_URL || '',
  ].filter(Boolean),
  'media-src': ["'self'", 'blob:', 'data:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'frame-src': ["'none'"],
  'worker-src': ["'self'", 'blob:'],
  'manifest-src': ["'self'"],
  'upgrade-insecure-requests': process.env.NODE_ENV === 'production' ? [] : undefined,
};

/**
 * Generate CSP header value
 */
export function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .filter(([_, value]) => value !== undefined)
    .map(([directive, sources]) => {
      if (!sources || sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Complete security headers configuration
 */
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': generateCSP(),

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // XSS Protection (legacy, CSP is better)
  'X-XSS-Protection': '1; mode=block',

  // Referrer Policy - Balance privacy and functionality
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy - Disable unnecessary features
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()', // Disable FLoC
    'payment=()',
    'usb=()',
  ].join(', '),

  // Strict Transport Security (HTTPS only) - Production only
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),

  // Cross-Origin Policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',

  // Prevent DNS prefetching
  'X-DNS-Prefetch-Control': 'off',

  // Download options (IE)
  'X-Download-Options': 'noopen',

  // Permitted cross-domain policies
  'X-Permitted-Cross-Domain-Policies': 'none',
};

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  return response;
}

/**
 * Get security headers as object (for Next.js config)
 */
export function getSecurityHeadersArray(): Array<{ key: string; value: string }> {
  return Object.entries(SECURITY_HEADERS)
    .filter(([_, value]) => value)
    .map(([key, value]) => ({ key, value: value as string }));
}

/**
 * Rate limit headers helper
 */
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'Retry-After'?: string;
}

/**
 * Create rate limit headers
 */
export function createRateLimitHeaders(
  limit: number,
  remaining: number,
  resetAt: number
): RateLimitHeaders {
  const now = Date.now();
  const retryAfter = Math.ceil((resetAt - now) / 1000);

  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetAt.toString(),
    ...(remaining === 0 && { 'Retry-After': retryAfter.toString() }),
  };
}

/**
 * Apply rate limit headers to response
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  headers: RateLimitHeaders
): NextResponse {
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  return response;
}
