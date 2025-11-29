/**
 * Optimized Rate Limiter
 * Implements sliding window algorithm with Redis support and performance optimizations
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
  retryAfter?: number;
}

interface SlidingWindowEntry {
  timestamps: number[];
  resetAt: number;
}

// Optimized in-memory store with sliding window
const slidingWindowStore = new Map<string, SlidingWindowEntry>();

// Redis client interface for rate limiting operations
interface RedisRateLimitClient {
  multi(): {
    zremrangebyscore(key: string, min: number, max: number): unknown;
    zcard(key: string): unknown;
    zadd(key: string, score: number, member: string): unknown;
    pexpire(key: string, ms: number): unknown;
    zrange(key: string, start: number, stop: number, withScores?: string): unknown;
    exec(): Promise<Array<[Error | null, unknown]> | null>;
  };
  del(...keys: string[]): Promise<number>;
  zcount(key: string, min: number, max: number): Promise<number>;
  zrange(key: string, start: number, stop: number, withScores?: string): Promise<string[]>;
  keys(pattern: string): Promise<string[]>;
}

// Redis client
let redisClient: RedisRateLimitClient | null = null;

/**
 * Set Redis client
 */
export function setRedisClient(client: RedisRateLimitClient): void {
  redisClient = client;
  console.log('✅ Redis rate limiter enabled');
}

/**
 * Check Redis status
 */
export function isRedisEnabled(): boolean {
  return redisClient !== null;
}

/**
 * Clean up expired entries
 */
function cleanupSlidingWindow(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of slidingWindowStore.entries()) {
    // Remove expired timestamps
    entry.timestamps = entry.timestamps.filter(ts => now - ts < entry.resetAt);

    // Remove entry if no valid timestamps
    if (entry.timestamps.length === 0) {
      slidingWindowStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0 && process.env.NODE_ENV === 'development') {
    console.log(`🧹 Cleaned ${cleaned} expired rate limit entries`);
  }
}

// Run cleanup every 2 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupSlidingWindow, 120000);
}

/**
 * Sliding window rate limiter (in-memory)
 */
async function checkSlidingWindowRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Get or create entry
  let entry = slidingWindowStore.get(key);
  if (!entry) {
    entry = {
      timestamps: [],
      resetAt: now + config.windowMs,
    };
    slidingWindowStore.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);

  // Check if limit exceeded
  if (entry.timestamps.length >= config.maxAttempts) {
    const oldestTimestamp = entry.timestamps[0];
    const retryAfter = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestTimestamp + config.windowMs,
      retryAfter,
      error: config.message || 'Rate limit exceeded. Please try again later.',
    };
  }

  // Add current timestamp
  entry.timestamps.push(now);
  entry.resetAt = now + config.windowMs;

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.timestamps.length,
    resetAt: entry.resetAt,
  };
}

/**
 * Redis sliding window rate limiter
 */
async function checkRedisSlidingWindow(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const now = Date.now();
    const windowKey = `ratelimit:${key}`;
    const windowStart = now - config.windowMs;

    // Use Redis sorted set for sliding window
    if (!redisClient) {
      return checkSlidingWindowRateLimit(key, config);
    }
    const multi = redisClient.multi();

    // Remove old entries
    multi.zremrangebyscore(windowKey, 0, windowStart);

    // Count current entries
    multi.zcard(windowKey);

    // Add current timestamp
    multi.zadd(windowKey, now, `${now}-${Math.random()}`);

    // Set expiration
    multi.pexpire(windowKey, config.windowMs);

    // Get oldest timestamp
    multi.zrange(windowKey, 0, 0, 'WITHSCORES');

    const results = await multi.exec();

    if (!results) {
      throw new Error('Redis transaction failed');
    }

    const count = results[1][1] as number;
    const oldestEntry = results[4][1] as string[];
    const oldestTimestamp = oldestEntry.length > 0 ? parseInt(oldestEntry[1]) : now;

    // Check if limit exceeded
    if (count > config.maxAttempts) {
      const retryAfter = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetAt: oldestTimestamp + config.windowMs,
        retryAfter,
        error: config.message || 'Rate limit exceeded. Please try again later.',
      };
    }

    return {
      allowed: true,
      remaining: config.maxAttempts - count,
      resetAt: now + config.windowMs,
    };
  } catch (error) {
    console.error('Redis rate limit error:', error);
    // Fallback to in-memory
    return checkSlidingWindowRateLimit(key, config);
  }
}

/**
 * Check rate limit with sliding window algorithm
 */
export async function checkRateLimit(
  identifier: string,
  type: keyof typeof SECURITY_CONFIG.RATE_LIMIT = 'API'
): Promise<RateLimitResult> {
  const config = SECURITY_CONFIG.RATE_LIMIT[type];
  const rateLimitConfig: RateLimitConfig = {
    maxAttempts: 'MAX_ATTEMPTS' in config ? config.MAX_ATTEMPTS : (config as { MAX_REQUESTS: number }).MAX_REQUESTS,
    windowMs: config.WINDOW_MS,
    message: config.MESSAGE,
  };

  const key = `${type.toLowerCase()}:${identifier}`;

  if (redisClient) {
    return checkRedisSlidingWindow(key, rateLimitConfig);
  }

  return checkSlidingWindowRateLimit(key, rateLimitConfig);
}

/**
 * Reset rate limit
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

  slidingWindowStore.delete(key);
}

/**
 * Get rate limit status
 */
export async function getRateLimitStatus(
  identifier: string,
  type: keyof typeof SECURITY_CONFIG.RATE_LIMIT = 'API'
): Promise<RateLimitResult | null> {
  const key = `${type.toLowerCase()}:${identifier}`;
  const config = SECURITY_CONFIG.RATE_LIMIT[type];
  const maxAttempts = 'MAX_ATTEMPTS' in config ? config.MAX_ATTEMPTS : (config as { MAX_REQUESTS: number }).MAX_REQUESTS;

  if (redisClient) {
    try {
      const windowKey = `ratelimit:${key}`;
      const now = Date.now();
      const windowStart = now - config.WINDOW_MS;

      const count = await redisClient.zcount(windowKey, windowStart, now);
      const oldestEntry = await redisClient.zrange(windowKey, 0, 0, 'WITHSCORES');
      const oldestTimestamp = oldestEntry.length > 0 ? parseInt(oldestEntry[1]) : now;

      return {
        allowed: count < maxAttempts,
        remaining: Math.max(0, maxAttempts - count),
        resetAt: oldestTimestamp + config.WINDOW_MS,
      };
    } catch (error) {
      console.error('Redis status error:', error);
    }
  }

  // Check in-memory store
  const entry = slidingWindowStore.get(key);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  const validTimestamps = entry.timestamps.filter(ts => now - ts < config.WINDOW_MS);

  return {
    allowed: validTimestamps.length < maxAttempts,
    remaining: Math.max(0, maxAttempts - validTimestamps.length),
    resetAt: entry.resetAt,
  };
}

/**
 * Clear all rate limits
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

  slidingWindowStore.clear();
}

/**
 * Custom rate limit check
 */
export async function checkCustomRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `custom:${identifier}`;

  if (redisClient) {
    return checkRedisSlidingWindow(key, config);
  }

  return checkSlidingWindowRateLimit(key, config);
}

/**
 * Batch rate limit check for multiple identifiers
 */
export async function checkBatchRateLimits(
  identifiers: string[],
  type: keyof typeof SECURITY_CONFIG.RATE_LIMIT = 'API'
): Promise<Map<string, RateLimitResult>> {
  const results = new Map<string, RateLimitResult>();

  // Process in parallel for better performance
  await Promise.all(
    identifiers.map(async (identifier) => {
      const result = await checkRateLimit(identifier, type);
      results.set(identifier, result);
    })
  );

  return results;
}

/**
 * Get rate limiter statistics
 */
export function getRateLimiterStats(): {
  inMemoryEntries: number;
  redisEnabled: boolean;
} {
  return {
    inMemoryEntries: slidingWindowStore.size,
    redisEnabled: isRedisEnabled(),
  };
}
