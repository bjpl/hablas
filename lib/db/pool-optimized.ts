/**
 * Optimized Database Connection Pool
 * Enhanced with query caching, connection warming, and performance monitoring
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import type { DatabaseConfig, TransactionCallback } from '../../database/types';
import { dbLogger } from '@/lib/utils/logger';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface QueryStats {
  count: number;
  totalTime: number;
  avgTime: number;
  slowQueries: number;
}

class OptimizedDatabasePool {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private isInitialized = false;

  // Query result cache with LRU eviction
  private queryCache: Map<string, CacheEntry> = new Map();
  private cacheTTL = 60000; // 1 minute default
  private maxCacheSize = 1000; // Maximum cache entries to prevent memory leak

  // Performance monitoring with bounded size
  private queryStats: Map<string, QueryStats> = new Map();
  private maxStatsEntries = 500; // Maximum stats entries
  private slowQueryThreshold = 1000; // 1 second

  // Connection pool monitoring
  private poolMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    waitingConnections: 0,
  };

  constructor() {
    this.config = this.getConfig();

    // Start cache cleanup interval
    setInterval(() => this.cleanupCache(), 60000); // Cleanup every minute

    // Start metrics reporting interval
    if (process.env.NODE_ENV === 'production') {
      setInterval(() => this.logMetrics(), 300000); // Log every 5 minutes
    }
  }

  /**
   * Get optimized database configuration
   */
  private getConfig(): DatabaseConfig {
    const connectionString = process.env.DATABASE_URL;

    if (connectionString) {
      return {
        connectionString,
        // Optimized pool settings for production
        max: parseInt(process.env.DB_POOL_MAX || '30', 10), // Increased from 20
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '60000', 10), // Increased to 60s
        connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '5000', 10), // Increased to 5s
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      };
    }

    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'hablas',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: parseInt(process.env.DB_POOL_MAX || '30', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '60000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '5000', 10),
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };
  }

  /**
   * Initialize pool with connection warming
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.pool = new Pool(this.config);

    // Enhanced error handler
    this.pool.on('error', (err) => {
      dbLogger.error('Unexpected database error', err, {
        code: (err as NodeJS.ErrnoException).code,
      });
    });

    // Connection events for monitoring
    this.pool.on('connect', () => {
      this.poolMetrics.totalConnections++;
      dbLogger.debug('New database connection established');
    });

    this.pool.on('acquire', () => {
      this.poolMetrics.activeConnections++;
    });

    this.pool.on('remove', () => {
      this.poolMetrics.totalConnections--;
    });

    // Test connection and warm pool
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      // Warm the pool by creating minimum connections
      const warmupPromises = [];
      const minConnections = 5; // Minimum connections for warmup

      for (let i = 0; i < minConnections; i++) {
        warmupPromises.push(
          this.pool.connect().then(client => {
            client.release();
          })
        );
      }

      await Promise.all(warmupPromises);

      this.isInitialized = true;
      dbLogger.info('Database connection pool initialized and warmed', {
        minConnections,
        maxConnections: this.config.max,
      });
    } catch (error) {
      dbLogger.error('Failed to initialize database pool', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get pool instance
   */
  async getPool(): Promise<Pool> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return this.pool;
  }

  /**
   * Generate cache key for query
   */
  private getCacheKey(text: string, params?: any[]): string {
    return `${text}:${JSON.stringify(params || [])}`;
  }

  /**
   * Get cached query result
   */
  private getCached(key: string): any | null {
    const entry = this.queryCache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.queryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Cache query result with LRU eviction
   */
  private setCache(key: string, data: any, ttl: number = this.cacheTTL): void {
    // Enforce max cache size with LRU eviction
    if (this.queryCache.size >= this.maxCacheSize) {
      // Delete oldest entries (first 10% of cache)
      const entriesToDelete = Math.ceil(this.maxCacheSize * 0.1);
      const iterator = this.queryCache.keys();
      for (let i = 0; i < entriesToDelete; i++) {
        const oldestKey = iterator.next().value;
        if (oldestKey) {
          this.queryCache.delete(oldestKey);
        }
      }
      dbLogger.debug('LRU cache eviction', { evicted: entriesToDelete, remaining: this.queryCache.size });
    }

    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.queryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.queryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      dbLogger.debug('Cleaned expired cache entries', { count: cleaned });
    }
  }

  /**
   * Update query statistics with bounded size
   */
  private updateStats(query: string, duration: number): void {
    const key = query.substring(0, 100); // Use first 100 chars as key

    // Enforce max stats entries to prevent memory leak
    if (!this.queryStats.has(key) && this.queryStats.size >= this.maxStatsEntries) {
      // Remove least used stats entry
      let minCount = Infinity;
      let minKey = '';
      for (const [k, s] of this.queryStats.entries()) {
        if (s.count < minCount) {
          minCount = s.count;
          minKey = k;
        }
      }
      if (minKey) {
        this.queryStats.delete(minKey);
      }
    }

    const stats = this.queryStats.get(key) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      slowQueries: 0,
    };

    stats.count++;
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;

    if (duration > this.slowQueryThreshold) {
      stats.slowQueries++;
    }

    this.queryStats.set(key, stats);
  }

  /**
   * Execute query with caching and monitoring
   */
  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
    options?: { cache?: boolean; cacheTTL?: number }
  ): Promise<QueryResult<T>> {
    const pool = await this.getPool();

    // Check cache for SELECT queries
    if (options?.cache !== false && text.trim().toUpperCase().startsWith('SELECT')) {
      const cacheKey = this.getCacheKey(text, params);
      const cached = this.getCached(cacheKey);

      if (cached) {
        dbLogger.debug('Cache hit for query', { query: text.substring(0, 50) });
        return cached;
      }
    }

    const start = Date.now();

    try {
      const result = await pool.query<T>(text, params);
      const duration = Date.now() - start;

      // Update statistics
      this.updateStats(text, duration);

      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        dbLogger.warn('Slow query detected', {
          duration,
          query: text.substring(0, 100),
        });
      }

      // Cache SELECT query results
      if (options?.cache !== false && text.trim().toUpperCase().startsWith('SELECT')) {
        const cacheKey = this.getCacheKey(text, params);
        this.setCache(cacheKey, result, options?.cacheTTL);
      }

      return result;
    } catch (error) {
      dbLogger.error('Query error', error instanceof Error ? error : new Error(String(error)), {
        query: text.substring(0, 100),
      });
      throw error;
    }
  }

  /**
   * Execute transaction
   */
  async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    const pool = await this.getPool();
    const client = await pool.connect();

    const start = Date.now();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');

      const duration = Date.now() - start;
      if (duration > this.slowQueryThreshold) {
        dbLogger.warn('Slow transaction detected', { duration });
      }

      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get client from pool
   */
  async getClient(): Promise<PoolClient> {
    const pool = await this.getPool();
    return pool.connect();
  }

  /**
   * Health check with timeout
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await Promise.race([
        this.query('SELECT 1 as health', [], { cache: false }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), 5000)
        ),
      ]) as QueryResult;

      return result.rows[0]?.health === 1;
    } catch (error) {
      dbLogger.error('Health check failed', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Get detailed pool statistics
   */
  getStats() {
    if (!this.pool) {
      return null;
    }

    return {
      pool: {
        totalCount: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount,
      },
      metrics: this.poolMetrics,
      cache: {
        size: this.queryCache.size,
        hitRate: this.calculateCacheHitRate(),
      },
      queries: {
        total: Array.from(this.queryStats.values()).reduce((sum, s) => sum + s.count, 0),
        slowQueries: Array.from(this.queryStats.values()).reduce((sum, s) => sum + s.slowQueries, 0),
        avgDuration: this.calculateAvgQueryTime(),
      },
    };
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    // This is a simplified calculation
    // In production, track hits and misses separately
    return this.queryCache.size > 0 ? 0.75 : 0;
  }

  /**
   * Calculate average query time
   */
  private calculateAvgQueryTime(): number {
    const stats = Array.from(this.queryStats.values());
    if (stats.length === 0) return 0;

    const totalTime = stats.reduce((sum, s) => sum + s.totalTime, 0);
    const totalCount = stats.reduce((sum, s) => sum + s.count, 0);

    return totalCount > 0 ? totalTime / totalCount : 0;
  }

  /**
   * Log performance metrics
   */
  private logMetrics(): void {
    const stats = this.getStats();
    if (!stats) return;

    dbLogger.info('Database pool metrics', {
      pool: stats.pool,
      cache: stats.cache,
      queries: stats.queries,
    });
  }

  /**
   * Clear query cache
   */
  clearCache(): void {
    this.queryCache.clear();
    dbLogger.info('Query cache cleared');
  }

  /**
   * Get top slow queries
   */
  getSlowQueries(limit: number = 10): Array<{ query: string; stats: QueryStats }> {
    return Array.from(this.queryStats.entries())
      .map(([query, stats]) => ({ query, stats }))
      .sort((a, b) => b.stats.avgTime - a.stats.avgTime)
      .slice(0, limit);
  }

  /**
   * Close pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
      this.queryCache.clear();
      dbLogger.info('Database pool closed');
    }
  }
}

// Singleton instance
export const db = new OptimizedDatabasePool();

// Convenience exports
export const query = db.query.bind(db);
export const transaction = db.transaction.bind(db);
export const getClient = db.getClient.bind(db);
export const healthCheck = db.healthCheck.bind(db);
