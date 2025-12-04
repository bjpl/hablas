/**
 * Redis Cache Implementation
 * Centralized caching layer for improved performance
 */

import { redisLogger } from '@/lib/utils/logger';
import type { RedisClientType } from 'redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

class RedisCache {
  private client: RedisClientType | null = null;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
  };

  /**
   * Initialize Redis client
   */
  setClient(client: RedisClientType): void {
    this.client = client;
    redisLogger.info('Redis cache initialized');
  }

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Generate cache key with namespace
   */
  private getKey(key: string, namespace?: string): string {
    return namespace ? `cache:${namespace}:${key}` : `cache:${key}`;
  }

  /**
   * Get value from cache
   */
  async get<T = unknown>(key: string, options?: CacheOptions): Promise<T | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const cacheKey = this.getKey(key, options?.namespace);
      const value = await this.client!.get(cacheKey);

      if (value === null) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();

      return JSON.parse(value) as T;
    } catch (error) {
      redisLogger.error('Redis cache get error', error instanceof Error ? error : new Error(String(error)), { key });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T = unknown>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const cacheKey = this.getKey(key, options?.namespace);
      const serialized = JSON.stringify(value);

      if (options?.ttl) {
        await this.client!.setEx(cacheKey, options.ttl, serialized);
      } else {
        await this.client!.set(cacheKey, serialized);
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      redisLogger.error('Redis cache set error', error instanceof Error ? error : new Error(String(error)), { key });
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const cacheKey = this.getKey(key, options?.namespace);
      await this.client!.del(cacheKey);
      this.stats.deletes++;
      return true;
    } catch (error) {
      redisLogger.error('Redis cache delete error', error instanceof Error ? error : new Error(String(error)), { key });
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async has(key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const cacheKey = this.getKey(key, options?.namespace);
      const exists = await this.client!.exists(cacheKey);
      return exists === 1;
    } catch (error) {
      redisLogger.error('Redis cache exists error', error instanceof Error ? error : new Error(String(error)), { key });
      return false;
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T = unknown>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T | null> {
    // Try to get from cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    try {
      const value = await fetcher();
      await this.set(key, value, options);
      return value;
    } catch (error) {
      redisLogger.error('Cache getOrSet error', error instanceof Error ? error : new Error(String(error)), { key });
      return null;
    }
  }

  /**
   * Delete all keys in namespace
   */
  async deleteNamespace(namespace: string): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const pattern = `cache:${namespace}:*`;
      const keys = await this.client!.keys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      await this.client!.del(keys);
      this.stats.deletes += keys.length;
      return keys.length;
    } catch (error) {
      redisLogger.error('Redis cache deleteNamespace error', error instanceof Error ? error : new Error(String(error)), { namespace });
      return 0;
    }
  }

  /**
   * Get multiple keys at once
   */
  async mget<T = unknown>(
    keys: string[],
    options?: CacheOptions
  ): Promise<Map<string, T>> {
    const result = new Map<string, T>();

    if (!this.isAvailable() || keys.length === 0) {
      return result;
    }

    try {
      const cacheKeys = keys.map(k => this.getKey(k, options?.namespace));
      const values = await this.client!.mGet(cacheKeys);

      keys.forEach((key, index) => {
        if (values[index] !== null) {
          result.set(key, JSON.parse(values[index]!) as T);
          this.stats.hits++;
        } else {
          this.stats.misses++;
        }
      });

      this.updateHitRate();
      return result;
    } catch (error) {
      redisLogger.error('Redis cache mget error', error instanceof Error ? error : new Error(String(error)));
      return result;
    }
  }

  /**
   * Set multiple keys at once
   */
  async mset<T = unknown>(
    entries: Map<string, T>,
    options?: CacheOptions
  ): Promise<boolean> {
    if (!this.isAvailable() || entries.size === 0) {
      return false;
    }

    try {
      const multi = this.client!.multi();

      for (const [key, value] of entries) {
        const cacheKey = this.getKey(key, options?.namespace);
        const serialized = JSON.stringify(value);

        if (options?.ttl) {
          multi.setEx(cacheKey, options.ttl, serialized);
        } else {
          multi.set(cacheKey, serialized);
        }
      }

      await multi.exec();
      this.stats.sets += entries.size;
      return true;
    } catch (error) {
      redisLogger.error('Redis cache mset error', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, by: number = 1, options?: CacheOptions): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const cacheKey = this.getKey(key, options?.namespace);
      const value = await this.client!.incrBy(cacheKey, by);

      if (options?.ttl) {
        await this.client!.expire(cacheKey, options.ttl);
      }

      return value;
    } catch (error) {
      redisLogger.error('Redis cache increment error', error instanceof Error ? error : new Error(String(error)), { key });
      return 0;
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
    };
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const keys = await this.client!.keys('cache:*');
      if (keys.length > 0) {
        await this.client!.del(keys);
        this.stats.deletes += keys.length;
      }
      return true;
    } catch (error) {
      redisLogger.error('Redis cache clear error', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Get cache size
   */
  async size(namespace?: string): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const pattern = namespace ? `cache:${namespace}:*` : 'cache:*';
      const keys = await this.client!.keys(pattern);
      return keys.length;
    } catch (error) {
      redisLogger.error('Redis cache size error', error instanceof Error ? error : new Error(String(error)));
      return 0;
    }
  }
}

// Singleton instance
export const cache = new RedisCache();

// Convenience exports
export const getCache = cache.get.bind(cache);
export const setCache = cache.set.bind(cache);
export const deleteCache = cache.delete.bind(cache);
export const clearCache = cache.clear.bind(cache);
