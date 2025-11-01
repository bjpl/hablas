/**
 * API Middleware Utilities
 *
 * This module provides middleware utilities for Next.js API routes,
 * including rate limiting, IP extraction, and response helpers.
 *
 * @module lib/api/middleware
 */

import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getRateLimitHeaders,
  RateLimitConfig,
  RateLimitResult,
} from "../rate-limit";

/**
 * Extract client IP address from Next.js request
 *
 * @param request - Next.js request object
 * @returns IP address or 'unknown'
 */
export function getClientIp(request: NextRequest): string {
  // Try to get IP from various headers (prioritized order)
  const headers = [
    "x-real-ip",
    "x-forwarded-for",
    "cf-connecting-ip", // Cloudflare
    "true-client-ip", // Cloudflare Enterprise
    "x-client-ip",
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(",")[0].trim();
    }
  }

  // Fallback to IP from request
  return request.ip || "unknown";
}

/**
 * Apply rate limiting to an API request
 *
 * @param request - Next.js request object
 * @param config - Rate limit configuration
 * @returns Rate limit result or null if rate limit is not exceeded
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const rateLimitResponse = await applyRateLimit(request, RATE_LIMIT_CONFIGS.PUBLIC_API);
 *   if (rateLimitResponse) {
 *     return rateLimitResponse;
 *   }
 *   // Continue with request handling
 * }
 * ```
 */
export async function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const identifier = `${config.prefix || "api"}:${ip}`;

  const result = await checkRateLimit(identifier, config);
  const headers = getRateLimitHeaders(result);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: `Rate limit exceeded. Please try again in ${Math.ceil(
          (result.reset - Date.now()) / 1000
        )} seconds.`,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      },
      {
        status: 429,
        headers,
      }
    );
  }

  return null;
}

/**
 * Create a rate-limited API handler wrapper
 *
 * @param handler - API route handler
 * @param config - Rate limit configuration
 * @returns Wrapped handler with rate limiting
 *
 * @example
 * ```typescript
 * export const GET = withRateLimit(
 *   async (request: NextRequest) => {
 *     // Your handler logic
 *     return NextResponse.json({ data: "..." });
 *   },
 *   RATE_LIMIT_CONFIGS.PUBLIC_API
 * );
 * ```
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check rate limit
    const rateLimitResponse = await applyRateLimit(request, config);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Add rate limit headers to successful response
    const ip = getClientIp(request);
    const identifier = `${config.prefix || "api"}:${ip}`;
    const result = await checkRateLimit(identifier, config);

    const response = await handler(request);
    const headers = getRateLimitHeaders(result);

    // Add rate limit headers to response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Create a JSON error response
 *
 * @param message - Error message
 * @param status - HTTP status code
 * @param details - Optional additional details
 * @returns NextResponse with error
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error: true,
      message,
      ...details,
    },
    { status }
  );
}

/**
 * Create a JSON success response with optional rate limit headers
 *
 * @param data - Response data
 * @param rateLimitResult - Optional rate limit result
 * @returns NextResponse with data
 */
export function createSuccessResponse(
  data: unknown,
  rateLimitResult?: RateLimitResult
): NextResponse {
  const headers = rateLimitResult ? getRateLimitHeaders(rateLimitResult) : {};

  return NextResponse.json(data, { headers });
}

/**
 * Validate request method
 *
 * @param request - Next.js request object
 * @param allowedMethods - Array of allowed HTTP methods
 * @returns Error response if method is not allowed, null otherwise
 */
export function validateMethod(
  request: NextRequest,
  allowedMethods: string[]
): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return createErrorResponse(
      `Method ${request.method} Not Allowed`,
      405,
      { allowedMethods }
    );
  }
  return null;
}

/**
 * Extract and validate query parameters
 *
 * @param request - Next.js request object
 * @param requiredParams - Array of required parameter names
 * @returns Parameters object or error response
 */
export function validateQueryParams(
  request: NextRequest,
  requiredParams: string[]
): { params: Record<string, string> } | { error: NextResponse } {
  const params: Record<string, string> = {};
  const missing: string[] = [];

  for (const param of requiredParams) {
    const value = request.nextUrl.searchParams.get(param);
    if (!value) {
      missing.push(param);
    } else {
      params[param] = value;
    }
  }

  if (missing.length > 0) {
    return {
      error: createErrorResponse(
        "Missing required parameters",
        400,
        { missing }
      ),
    };
  }

  return { params };
}
