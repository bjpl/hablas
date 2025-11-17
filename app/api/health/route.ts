/**
 * Health Check API
 * Comprehensive health check for all system components
 */

import { NextRequest, NextResponse } from 'next/server';
import { healthCheck as dbHealthCheck } from '@/lib/db/pool-optimized';
import { redisHealthCheck } from '@/lib/db/redis';

export async function GET(request: NextRequest) {
  const checks = {
    timestamp: Date.now(),
    status: 'unknown' as 'healthy' | 'degraded' | 'unhealthy',
    checks: {} as Record<string, { status: string; responseTime?: number; error?: string }>,
  };

  try {
    // Database health check
    const dbStart = Date.now();
    const dbHealthy = await Promise.race([
      dbHealthCheck(),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000)),
    ]);
    const dbTime = Date.now() - dbStart;

    checks.checks.database = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      responseTime: dbTime,
    };

    // Redis health check (optional)
    const redisStart = Date.now();
    try {
      const redisHealthy = await Promise.race([
        redisHealthCheck(),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3000)),
      ]);
      const redisTime = Date.now() - redisStart;

      checks.checks.redis = {
        status: redisHealthy ? 'healthy' : 'degraded',
        responseTime: redisTime,
      };
    } catch (error) {
      checks.checks.redis = {
        status: 'degraded',
        error: 'Redis not configured',
      };
    }

    // Server health
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    checks.checks.server = {
      status: memoryUsagePercent < 90 ? 'healthy' : 'degraded',
      responseTime: 0,
    };

    // Determine overall status
    const unhealthyCount = Object.values(checks.checks).filter(
      c => c.status === 'unhealthy'
    ).length;
    const degradedCount = Object.values(checks.checks).filter(
      c => c.status === 'degraded'
    ).length;

    if (unhealthyCount > 0) {
      checks.status = 'unhealthy';
    } else if (degradedCount > 0) {
      checks.status = 'degraded';
    } else {
      checks.status = 'healthy';
    }

    const statusCode = checks.status === 'healthy' ? 200 : checks.status === 'degraded' ? 200 : 503;

    return NextResponse.json(checks, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        timestamp: Date.now(),
        status: 'unhealthy',
        error: 'Health check failed',
        checks: {},
      },
      { status: 503 }
    );
  }
}
