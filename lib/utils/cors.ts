/**
 * CORS Utilities
 * Production-ready CORS configuration with environment-based restrictions
 */

import { NextResponse } from 'next/server';
import { SECURITY_CONFIG } from '@/lib/config/security';

/**
 * Get CORS headers for a specific origin
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    ...SECURITY_CONFIG.CORS.DEFAULT_HEADERS,
  };

  // Production: Validate origin
  if (process.env.NODE_ENV === 'production') {
    if (origin && SECURITY_CONFIG.CORS.isOriginAllowed(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    } else {
      // Don't set CORS headers for disallowed origins
      return {};
    }
  } else {
    // Development: Allow all origins
    headers['Access-Control-Allow-Origin'] = origin || '*';
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

/**
 * Create CORS preflight response
 */
export function createCorsPreflightResponse(origin: string | null): NextResponse {
  const headers = getCorsHeaders(origin);

  if (Object.keys(headers).length === 0) {
    // Origin not allowed
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers,
  });
}

/**
 * Add CORS headers to an existing response
 */
export function addCorsHeaders(
  response: NextResponse,
  origin: string | null
): NextResponse {
  const headers = getCorsHeaders(origin);

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  if (process.env.NODE_ENV === 'production') {
    return SECURITY_CONFIG.CORS.isOriginAllowed(origin);
  }

  // Development: Allow all origins
  return true;
}

/**
 * Get allowed origins list
 */
export function getAllowedOrigins(): string[] {
  return SECURITY_CONFIG.CORS.getAllowedOrigins();
}
