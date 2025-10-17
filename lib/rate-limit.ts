/**
 * Rate Limiting Utilities for Hablas API Protection
 *
 * Uses in-memory rate limiting for static export compatibility.
 * For production with server runtime, consider Upstash Redis.
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (resets on server restart)
const store: RateLimitStore = {}

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 10 * 60 * 1000)

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param limit - Maximum requests allowed in window
 * @param windowMs - Time window in milliseconds (default: 1 hour)
 * @returns Rate limit result with success status and metadata
 */
export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): RateLimitResult {
  const now = Date.now()
  const key = `ratelimit:${identifier}`

  // Get or initialize store entry
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + windowMs
    }
  }

  // Increment count
  store[key].count++

  const remaining = Math.max(0, limit - store[key].count)
  const success = store[key].count <= limit

  return {
    success,
    limit,
    remaining,
    reset: store[key].resetTime
  }
}

/**
 * Get client IP address from request headers
 * Handles various proxy headers (Cloudflare, Vercel, etc.)
 */
export function getClientIp(headers: Headers): string {
  // Check common proxy headers
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback for development
  return 'unknown'
}

/**
 * Format rate limit info for response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  }
}
