/**
 * Rate Limiting Utilities for Hablas API Protection
 *
 * Supports both Upstash Redis (production) and in-memory (development/static export).
 * Automatically falls back to in-memory if Redis credentials are not configured.
 */

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (fallback when Redis is not configured)
const store: RateLimitStore = {}

// Cleanup old entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })
  }, 10 * 60 * 1000)
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  pending?: boolean
}

export interface RateLimitConfig {
  requests: number
  window: string
  prefix?: string
}

/**
 * Initialize Redis client
 * Returns null if environment variables are not configured
 */
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn(
      "⚠️ Upstash Redis not configured. Using in-memory rate limiting.\n" +
      "   For production, add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env"
    )
    return null
  }

  try {
    return new Redis({ url, token })
  } catch (error) {
    console.error("Failed to initialize Redis client:", error)
    return null
  }
}

// Shared Redis client instance
const redis = createRedisClient()

/**
 * Default rate limit configurations for different endpoint types
 */
export const RATE_LIMIT_CONFIGS = {
  PUBLIC_API: { requests: 100, window: "1 h", prefix: "public-api" } as RateLimitConfig,
  ANALYTICS: { requests: 50, window: "1 h", prefix: "analytics" } as RateLimitConfig,
  AI_GENERATION: { requests: 20, window: "1 h", prefix: "ai-gen" } as RateLimitConfig,
  AUTH: { requests: 10, window: "15 m", prefix: "auth" } as RateLimitConfig,
  GENERAL: { requests: 200, window: "1 h", prefix: "general" } as RateLimitConfig,
  ADMIN: { requests: 500, window: "1 h", prefix: "admin" } as RateLimitConfig,
} as const

/**
 * Create a rate limiter instance with Upstash Redis
 */
function createRateLimiter(config: RateLimitConfig): Ratelimit | null {
  if (!redis) return null

  try {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: true,
      prefix: config.prefix || "ratelimit",
    })
  } catch (error) {
    console.error("Failed to create rate limiter:", error)
    return null
  }
}

/**
 * Parse window string to milliseconds
 */
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)\s*([smhd])$/)
  if (!match) throw new Error(`Invalid window format: ${window}`)

  const [, value, unit] = match
  const num = parseInt(value, 10)

  switch (unit) {
    case 's': return num * 1000
    case 'm': return num * 60 * 1000
    case 'h': return num * 60 * 60 * 1000
    case 'd': return num * 24 * 60 * 60 * 1000
    default: throw new Error(`Invalid time unit: ${unit}`)
  }
}

/**
 * In-memory rate limiting (fallback)
 */
function rateLimitMemory(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const key = `ratelimit:${identifier}`

  if (!store[key] || store[key].resetTime < now) {
    store[key] = { count: 0, resetTime: now + windowMs }
  }

  store[key].count++
  const remaining = Math.max(0, limit - store[key].count)
  const success = store[key].count <= limit

  return { success, limit, remaining, reset: store[key].resetTime }
}

/**
 * Check rate limit using Upstash Redis or in-memory fallback
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const rateLimiter = createRateLimiter(config)

  // Use in-memory fallback if Redis is not configured
  if (!rateLimiter) {
    return rateLimitMemory(identifier, config.requests, parseWindow(config.window))
  }

  try {
    const result = await rateLimiter.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      pending: result.pending,
    }
  } catch (error) {
    console.error("Rate limit check failed, using in-memory fallback:", error)
    return rateLimitMemory(identifier, config.requests, parseWindow(config.window))
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use checkRateLimit with RATE_LIMIT_CONFIGS instead
 */
export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60 * 60 * 1000
): RateLimitResult {
  return rateLimitMemory(identifier, limit, windowMs)
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
    'X-RateLimit-Reset': result.reset.toString(),
  }
}

/**
 * Check if Redis is properly configured
 */
export function isRedisConfigured(): boolean {
  return redis !== null
}

/**
 * Get Redis client health status
 */
export async function checkRedisHealth(): Promise<{
  healthy: boolean
  configured: boolean
  error?: string
}> {
  if (!redis) {
    return { healthy: false, configured: false, error: "Redis not configured" }
  }

  try {
    await redis.ping()
    return { healthy: true, configured: true }
  } catch (error) {
    return {
      healthy: false,
      configured: true,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
