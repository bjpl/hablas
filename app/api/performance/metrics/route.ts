/**
 * Performance Metrics API
 * Provides real-time performance metrics for monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/pool';
import { cache } from '@/lib/cache/redis-cache';
import { getRateLimiterStats } from '@/lib/utils/rate-limiter-optimized';
import { createLogger } from '@/lib/utils/logger';
// import { getRedisStats } from '@/lib/db/redis'; // TODO: Add getRedisStats export

const metricsLogger = createLogger('api:performance:metrics');

export async function GET(request: NextRequest) {
  try {
    // Collect all metrics
    const [
      dbStats,
      cacheStats,
      rateLimiterStats,
    ] = await Promise.all([
      Promise.resolve(db.getStats()),
      cache.getStats(),
      Promise.resolve(getRateLimiterStats()),
    ]);

    const redisStats = null; // TODO: Implement getRedisStats()

    // Get slow queries
    const slowQueries = db.getSlowQueries(5);

    const metrics = {
      timestamp: Date.now(),
      database: {
        pool: dbStats?.pool || null,
        cache: dbStats?.cache || null,
        queries: dbStats?.queries || null,
        slowQueries: slowQueries.map(q => ({
          query: q.query,
          avgTime: q.stats.avgTime,
          count: q.stats.count,
          slowQueryCount: q.stats.slowQueries,
        })),
      },
      cache: cacheStats,
      rateLimiter: rateLimiterStats,
      redis: redisStats,
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
    };

    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    metricsLogger.error('Error collecting performance metrics', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to collect performance metrics',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
