/**
 * Redis Connection Manager
 * Manages Redis connections for rate limiting and caching
 * Graceful fallback to in-memory when Redis is unavailable
 */

import { createClient, RedisClientType } from 'redis';
import { redisLogger } from '@/lib/utils/logger';

export interface RedisConfig {
  url?: string;
  password?: string;
  socket?: {
    host?: string;
    port?: number;
    connectTimeout?: number;
    reconnectStrategy?: (retries: number) => number | Error;
  };
}

export interface RedisHealthStatus {
  connected: boolean;
  responseTime?: number;
  error?: string;
  mode: 'redis' | 'memory';
}

class RedisManager {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private maxRetries: number = 3;
  private isEnabled: boolean = false;

  constructor() {
    this.isEnabled = this.shouldEnableRedis();
  }

  /**
   * Check if Redis should be enabled based on environment
   */
  private shouldEnableRedis(): boolean {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST;

    // Redis is optional - only enable if explicitly configured
    return !!(redisUrl || redisHost);
  }

  /**
   * Get Redis configuration from environment
   */
  private getConfig(): RedisConfig {
    const url = process.env.REDIS_URL;

    if (url) {
      return {
        url,
        password: process.env.REDIS_PASSWORD,
      };
    }

    // Fallback to individual parameters
    return {
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '5000', 10),
        reconnectStrategy: (retries: number) => {
          if (retries > this.maxRetries) {
            redisLogger.warn('Redis max retries reached - using in-memory fallback');
            return new Error('Max retries reached');
          }
          // Exponential backoff: 100ms, 200ms, 400ms, 800ms...
          return Math.min(retries * 100, 3000);
        },
      },
      password: process.env.REDIS_PASSWORD,
    };
  }

  /**
   * Initialize Redis connection
   * Non-blocking - will use memory fallback on failure
   */
  async initialize(): Promise<boolean> {
    if (!this.isEnabled) {
      redisLogger.info('Redis not configured - using in-memory rate limiting');
      return false;
    }

    if (this.isConnected) {
      return true;
    }

    try {
      this.connectionAttempts++;
      const config = this.getConfig();

      // Create Redis client
      this.client = createClient(config) as RedisClientType;

      // Set up error handlers
      this.client.on('error', (err) => {
        redisLogger.error('Redis client error', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        redisLogger.debug('Redis connecting');
      });

      this.client.on('ready', () => {
        redisLogger.info('Redis connection ready');
        this.isConnected = true;
        this.connectionAttempts = 0;
      });

      this.client.on('reconnecting', () => {
        redisLogger.debug('Redis reconnecting');
      });

      this.client.on('end', () => {
        redisLogger.info('Redis connection closed');
        this.isConnected = false;
      });

      // Attempt connection with timeout
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
        ),
      ]);

      redisLogger.info('Redis connected successfully');
      return true;
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      redisLogger.warn('Redis connection failed - falling back to in-memory', { error: errMessage });
      this.client = null;
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get Redis client (null if not connected)
   */
  getClient(): RedisClientType | null {
    if (!this.isConnected || !this.client) {
      return null;
    }
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<RedisHealthStatus> {
    if (!this.isEnabled || !this.client) {
      return {
        connected: false,
        mode: 'memory',
      };
    }

    const start = Date.now();

    try {
      // Try to ping Redis
      await this.client.ping();

      return {
        connected: true,
        responseTime: Date.now() - start,
        mode: 'redis',
      };
    } catch (error: any) {
      return {
        connected: false,
        responseTime: Date.now() - start,
        error: error.message,
        mode: 'memory',
      };
    }
  }

  /**
   * Get Redis stats
   */
  async getStats(): Promise<{ connected: boolean; dbSize: number; info: string } | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const info = await this.client.info('stats');
      const dbSize = await this.client.dbSize();

      return {
        connected: true,
        dbSize,
        info,
      };
    } catch (error) {
      redisLogger.error('Failed to get Redis stats', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        this.client = null;
        this.isConnected = false;
        redisLogger.info('Redis connection closed gracefully');
      } catch (error) {
        redisLogger.error('Error closing Redis connection', error instanceof Error ? error : new Error(String(error)));
        // Force disconnect
        await this.client?.disconnect();
        this.client = null;
        this.isConnected = false;
      }
    }
  }

  /**
   * Attempt to reconnect Redis
   */
  async reconnect(): Promise<boolean> {
    await this.close();
    return this.initialize();
  }
}

// Singleton instance
export const redis = new RedisManager();

// Auto-initialize on import (non-blocking)
if (typeof window === 'undefined') {
  // Only in Node.js environment
  redis.initialize().catch((error: unknown) => {
    const errMessage = error instanceof Error ? error.message : String(error);
    redisLogger.warn('Redis auto-initialization failed', { error: errMessage });
  });
}

// Convenience exports
export const getRedisClient = () => redis.getClient();
export const isRedisConnected = () => redis.isRedisConnected();
export const redisHealthCheck = () => redis.healthCheck();
export const getRedisStats = () => redis.getStats();
