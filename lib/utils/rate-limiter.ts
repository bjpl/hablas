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
 * Import Redis manager
 */
import { getRedisClient, isRedisConnected } from '../db/redis';

/**
 * Get Redis client (uses centralized Redis manager)
 */
function getClient() {
  return getRedisClient();
}

/**
 * Get Redis client status
 */
export function isRedisEnabled(): boolean {
  return isRedisConnected();
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
  const client = getClient();
  if (!client) {
    return checkMemoryRateLimit(key, config);
  }

  try {
    const now = Date.now();
    const windowKey = `ratelimit:${key}`;

    // Get current count
    const count = await client.incr(windowKey);

    // Set expiration on first request
    if (count === 1) {
      await client.pExpire(windowKey, config.windowMs);
    }

    // Get TTL
    const ttl = await client.pTTL(windowKey);
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
    maxAttempts: 'MAX_ATTEMPTS' in config ? config.MAX_ATTEMPTS : (config as any).MAX_REQUESTS,
    windowMs: config.WINDOW_MS,
    message: config.MESSAGE,
  };

  const key = `${type.toLowerCase()}:${identifier}`;

  // Use Redis if available, fallback to memory
  const client = getClient();
  if (client) {
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
  const client = getClient();

  if (client) {
    try {
      await client.del(`ratelimit:${key}`);
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
  const client = getClient();

  if (client) {
    try {
      const windowKey = `ratelimit:${key}`;
      const count = await client.get(windowKey);

      if (count === null) {
        return null;
      }

      const ttl = await client.pTTL(windowKey);
      const now = Date.now();

      const maxAttempts = 'MAX_ATTEMPTS' in config ? config.MAX_ATTEMPTS : (config as any).MAX_REQUESTS;
      return {
        allowed: parseInt(count) < maxAttempts,
        remaining: Math.max(0, maxAttempts - parseInt(count)),
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

  const maxAttempts = 'MAX_ATTEMPTS' in config ? config.MAX_ATTEMPTS : (config as any).MAX_REQUESTS;
  return {
    allowed: record.count < maxAttempts,
    remaining: Math.max(0, maxAttempts - record.count),
    resetAt: record.resetAt,
  };
}

/**
 * Clear all rate limits (for testing)
 */
export async function clearAllRateLimits(): Promise<void> {
  const client = getClient();

  if (client) {
    try {
      const keys = await client.keys('ratelimit:*');
      if (keys.length > 0) {
        await client.del(keys);
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
  const client = getClient();

  if (client) {
    return checkRedisRateLimit(key, config);
  }

  return checkMemoryRateLimit(key, config);
}
