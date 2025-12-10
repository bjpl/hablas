/**
 * Database Health Check Script
 * Verifies database connectivity and schema integrity
 */

import { db } from '../../lib/db/pool';
import { redis, redisHealthCheck } from '../../lib/db/redis';
import { logger } from '../../lib/utils/logger';

interface HealthCheckResult {
  database: {
    connected: boolean;
    responseTime: number;
    error?: string;
  };
  redis: {
    connected: boolean;
    responseTime?: number;
    mode: 'redis' | 'memory';
    error?: string;
  };
  tables: {
    [key: string]: {
      exists: boolean;
      rowCount: number;
    };
  };
  indexes: {
    total: number;
    details: Array<{ table: string; index: string }>;
  };
  pool: {
    total: number;
    idle: number;
    waiting: number;
  } | null;
}

/**
 * Check database connection
 */
async function checkConnection(): Promise<HealthCheckResult['database']> {
  const start = Date.now();

  try {
    await db.query('SELECT 1');
    return {
      connected: true,
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      connected: false,
      responseTime: Date.now() - start,
      error: error.message,
    };
  }
}

/**
 * Check Redis connection
 */
async function checkRedis(): Promise<HealthCheckResult['redis']> {
  try {
    const status = await redisHealthCheck();
    return status;
  } catch (error: any) {
    return {
      connected: false,
      mode: 'memory',
      error: error.message,
    };
  }
}

/**
 * Check table existence and counts
 */
async function checkTables(): Promise<HealthCheckResult['tables']> {
  const tables = ['users', 'sessions', 'refresh_tokens', 'auth_audit_log'];
  const result: HealthCheckResult['tables'] = {};

  for (const table of tables) {
    try {
      // Check if table exists
      const existsQuery = await db.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        )`,
        [table]
      );

      const exists = existsQuery.rows[0].exists;

      if (exists) {
        // Get row count
        const countQuery = await db.query(`SELECT COUNT(*) FROM ${table}`);
        result[table] = {
          exists: true,
          rowCount: parseInt(countQuery.rows[0].count, 10),
        };
      } else {
        result[table] = {
          exists: false,
          rowCount: 0,
        };
      }
    } catch (error) {
      result[table] = {
        exists: false,
        rowCount: 0,
      };
    }
  }

  return result;
}

/**
 * Check indexes
 */
async function checkIndexes(): Promise<HealthCheckResult['indexes']> {
  const query = await db.query(
    `SELECT
      schemaname,
      tablename,
      indexname
     FROM pg_indexes
     WHERE schemaname = 'public'
     ORDER BY tablename, indexname`
  );

  return {
    total: query.rows.length,
    details: query.rows.map(row => ({
      table: row.tablename,
      index: row.indexname,
    })),
  };
}

/**
 * Run health check
 */
async function main() {
  logger.info('Running database health check', { script: 'health-check' });
  logger.info('='.repeat(60), { script: 'health-check' });

  try {
    // Initialize connection
    await db.initialize();

    // Run checks
    const connection = await checkConnection();
    const redisStatus = await checkRedis();
    const tables = await checkTables();
    const indexes = await checkIndexes();
    const poolStats = db.getStats();

    const results: HealthCheckResult = {
      database: connection,
      redis: redisStatus,
      tables,
      indexes,
      pool: poolStats ? {
        total: poolStats.pool.totalCount,
        idle: poolStats.pool.idleCount,
        waiting: poolStats.pool.waitingCount
      } : null,
    };

    // Print results
    logger.info('Database Connection', {
      script: 'health-check',
      connected: connection.connected,
      responseTime: connection.responseTime,
      error: connection.error
    });

    logger.info('Redis Connection', {
      script: 'health-check',
      connected: redisStatus.connected,
      mode: redisStatus.mode,
      responseTime: redisStatus.responseTime,
      error: redisStatus.error
    });

    logger.info('Tables status', {
      script: 'health-check',
      tables: Object.entries(tables).map(([table, info]) => ({
        table,
        exists: info.exists,
        rowCount: info.rowCount
      }))
    });

    logger.info('Indexes summary', {
      script: 'health-check',
      total: indexes.total,
      sample: indexes.details.slice(0, 10).map(idx => `${idx.table}.${idx.index}`)
    });

    if (poolStats) {
      logger.info('Connection Pool stats', {
        script: 'health-check',
        total: poolStats.pool.totalCount,
        idle: poolStats.pool.idleCount,
        waiting: poolStats.pool.waitingCount
      });
    }

    // Overall status
    const allTablesExist = Object.values(tables).every(t => t.exists);
    const isHealthy = connection.connected && allTablesExist;

    logger.info('='.repeat(60), { script: 'health-check' });
    if (isHealthy) {
      logger.info('Database is healthy', { script: 'health-check' });
      process.exit(0);
    } else {
      logger.warn('Database has issues - see details above', { script: 'health-check' });
      process.exit(1);
    }
  } catch (error) {
    logger.error('Health check failed', { script: 'health-check', error });
    process.exit(1);
  } finally {
    await db.close();
    await redis.close();
  }
}

// Run health check
if (require.main === module) {
  main();
}

export { main as healthCheck };
