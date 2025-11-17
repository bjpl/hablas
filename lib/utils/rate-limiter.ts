/**
 * Rate Limiting Utility
 * Supports both in-memory and distributed (Redis) rate limiting
 */

import { SECURITY_CONFIG } from '@/lib/config/security';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  message?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  error?: string;
}

interface AttemptRecord {
  count: number;
  resetAt: number;
}

// In-memory store (fallback when Redis is not available)
const memoryStore = new Map<string, AttemptRecord>();

/**
 * Redis client (optional)
 * Set via setRedisClient() for distributed rate limiting
 */
let redisClient: any = null;

/**
 * Set Redis client for distributed rate limiting
 */
export function setRedisClient(client: any): void {
  redisClient = client;
}

/**
 * Get Redis client status
 */
export function isRedisEnabled(): boolean {
  return redisClient !== null;
}

/**
 * Clean up expired entries from memory store
 */
function cleanupMemoryStore(): void {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (now >= record.resetAt) {
      memoryStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupMemoryStore, 5 * 60 * 1000);
}

/**
 * Check rate limit using in-memory store
 */
async function checkMemoryRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const record = memoryStore.get(key);

  // No previous attempts or window expired
  if (!record || now >= record.resetAt) {
    const resetAt = now + config.windowMs;
    memoryStore.set(key, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetAt,
    };
  }

  // Within window
  if (record.count >= config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
      error: config.message || 'Rate limit exceeded. Please try again later.',
    };
  }

  // Increment counter
  record.count += 1;
  memoryStore.set(key, record);

  return {
    allowed: true,
    remaining: config.maxAttempts - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Check rate limit using Redis
 */
async function checkRedisRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const now = Date.now();
    const windowKey = `ratelimit:${key}`;

    // Get current count
    const count = await redisClient.incr(windowKey);

    // Set expiration on first request
    if (count === 1) {
      await redisClient.pexpire(windowKey, config.windowMs);
    }

    // Get TTL
    const ttl = await redisClient.pttl(windowKey);
    const resetAt = now + ttl;

    // Check if exceeded
    if (count > config.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        error: config.message || 'Rate limit exceeded. Please try again later.',
      };
    }

    return {
      allowed: true,
      remaining: config.maxAttempts - count,
      resetAt,
    };
  } catch (error) {
    console.error('Redis rate limit error:', error);
    // Fallback to memory store on Redis error
    return checkMemoryRateLimit(key, config);
  }
}

/**
 * Check rate limit
 * Uses Redis if available, falls back to in-memory store
 */
export async function checkRateLimit(
  identifier: string,
  type: keyof typeof SECURITY_CONFIG.RATE_LIMIT = 'API'
): Promise<RateLimitResult> {
  const config = SECURITY_CONFIG.RATE_LIMIT[type];
  const rateLimitConfig: RateLimitConfig = {
    maxAttempts: config.MAX_ATTEMPTS,
    windowMs: config.WINDOW_MS,
    message: config.MESSAGE,
  };

  const key = `${type.toLowerCase()}:${identifier}`;

  if (redisClient) {
    return checkRedisRateLimit(key, rateLimitConfig);
  }

  return checkMemoryRateLimit(key, rateLimitConfig);
}

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(
  identifier: string,
  type: keyof typeof SECURITY_CONFIG.RATE_LIMIT = 'API'
): Promise<void> {
  const key = `${type.toLowerCase()}:${identifier}`;

  if (redisClient) {
    try {
      await redisClient.del(`ratelimit:${key}`);
    } catch (error) {
      console.error('Redis reset error:', error);
    }
  }

  memoryStore.delete(key);
}

/**
 * Get rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  type: keyof typeof SECURITY_CONFIG.RATE_LIMIT = 'API'
): Promise<RateLimitResult | null> {
  const key = `${type.toLowerCase()}:${identifier}`;
  const config = SECURITY_CONFIG.RATE_LIMIT[type];

  if (redisClient) {
    try {
      const windowKey = `ratelimit:${key}`;
      const count = await redisClient.get(windowKey);

      if (count === null) {
        return null;
      }

      const ttl = await redisClient.pttl(windowKey);
      const now = Date.now();

      return {
        allowed: count < config.MAX_ATTEMPTS,
        remaining: Math.max(0, config.MAX_ATTEMPTS - parseInt(count)),
        resetAt: now + ttl,
      };
    } catch (error) {
      console.error('Redis status error:', error);
    }
  }

  // Check memory store
  const record = memoryStore.get(key);
  if (!record) {
    return null;
  }

  return {
    allowed: record.count < config.MAX_ATTEMPTS,
    remaining: Math.max(0, config.MAX_ATTEMPTS - record.count),
    resetAt: record.resetAt,
  };
}

/**
 * Clear all rate limits (for testing)
 */
export async function clearAllRateLimits(): Promise<void> {
  if (redisClient) {
    try {
      const keys = await redisClient.keys('ratelimit:*');
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }

  memoryStore.clear();
}

/**
 * Custom rate limit check with custom configuration
 */
export async function checkCustomRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `custom:${identifier}`;

  if (redisClient) {
    return checkRedisRateLimit(key, config);
  }

  return checkMemoryRateLimit(key, config);
}
