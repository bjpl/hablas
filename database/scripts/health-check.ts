/**
 * Database Health Check Script
 * Verifies database connectivity and schema integrity
 */

import { db } from '../../lib/db/pool';

interface HealthCheckResult {
  database: {
    connected: boolean;
    responseTime: number;
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
 * Check table existence and counts
 */
async function checkTables(): Promise<HealthCheckResult['tables']> {
  const tables = ['users', 'refresh_tokens', 'auth_audit_log'];
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
  console.log('🏥 Running database health check...\n');
  console.log('='.repeat(60));

  try {
    // Initialize connection
    await db.initialize();

    // Run checks
    const connection = await checkConnection();
    const tables = await checkTables();
    const indexes = await checkIndexes();
    const pool = db.getStats();

    const results: HealthCheckResult = {
      database: connection,
      tables,
      indexes,
      pool,
    };

    // Print results
    console.log('\n📊 Database Connection:');
    console.log(`  Status:        ${connection.connected ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`  Response Time: ${connection.responseTime}ms`);
    if (connection.error) {
      console.log(`  Error:         ${connection.error}`);
    }

    console.log('\n📋 Tables:');
    for (const [table, info] of Object.entries(tables)) {
      const status = info.exists ? '✅' : '❌';
      console.log(`  ${status} ${table.padEnd(20)} ${info.exists ? `(${info.rowCount} rows)` : '(missing)'}`);
    }

    console.log('\n🔍 Indexes:');
    console.log(`  Total: ${indexes.total}`);
    for (const idx of indexes.details.slice(0, 10)) {
      console.log(`    - ${idx.table}.${idx.index}`);
    }
    if (indexes.total > 10) {
      console.log(`    ... and ${indexes.total - 10} more`);
    }

    if (pool) {
      console.log('\n🔗 Connection Pool:');
      console.log(`  Total:   ${pool.totalCount}`);
      console.log(`  Idle:    ${pool.idleCount}`);
      console.log(`  Waiting: ${pool.waitingCount}`);
    }

    // Overall status
    const allTablesExist = Object.values(tables).every(t => t.exists);
    const isHealthy = connection.connected && allTablesExist;

    console.log('\n' + '='.repeat(60));
    if (isHealthy) {
      console.log('✅ Database is healthy!');
      process.exit(0);
    } else {
      console.log('⚠️  Database has issues - see details above');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Health check failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Run health check
if (require.main === module) {
  main();
}

export { main as healthCheck };
