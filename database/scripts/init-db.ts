/**
 * Database Initialization Script
 * Runs all migrations in order and creates default admin user
 */

import { promises as fs } from 'fs';
import path from 'path';
import { db } from '../../lib/db/pool';
import { createUser } from '../../lib/db/users';
import type { UserRole } from '../types';
import { logger } from '../../lib/utils/logger';

/**
 * Run SQL migration file
 */
async function runMigration(filePath: string): Promise<void> {
  logger.info('Running migration', {
    script: 'init-db',
    file: path.basename(filePath)
  });

  const sql = await fs.readFile(filePath, 'utf-8');

  try {
    await db.query(sql);
    logger.info('Migration completed successfully', {
      script: 'init-db',
      file: path.basename(filePath)
    });
  } catch (error: any) {
    logger.error('Migration failed', {
      script: 'init-db',
      file: path.basename(filePath),
      error: error.message
    });
    throw error;
  }
}

/**
 * Get all migration files in order
 */
async function getMigrationFiles(): Promise<string[]> {
  const migrationsDir = path.join(process.cwd(), 'database', 'migrations');
  const files = await fs.readdir(migrationsDir);

  return files
    .filter(f => f.endsWith('.sql'))
    .sort()
    .map(f => path.join(migrationsDir, f));
}

/**
 * Create default admin user if none exists
 */
async function createDefaultAdmin(): Promise<void> {
  logger.info('Checking for admin users', { script: 'init-db' });

  const result = await db.query(
    "SELECT COUNT(*) FROM users WHERE role = 'admin'"
  );

  const adminCount = parseInt(result.rows[0].count, 10);

  if (adminCount > 0) {
    logger.info('Admin user(s) already exist', {
      script: 'init-db',
      count: adminCount
    });
    return;
  }

  logger.info('No admin users found. Creating default admin', { script: 'init-db' });

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hablas.co';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!ChangeThis';
  const adminName = process.env.ADMIN_NAME || 'Administrator';

  try {
    const admin = await createUser({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: 'admin' as UserRole,
    });

    logger.info('Default admin created', {
      script: 'init-db',
      email: admin.email
    });
    logger.warn('IMPORTANT: Change the default password immediately', { script: 'init-db' });
  } catch (error: any) {
    logger.error('Failed to create default admin', {
      script: 'init-db',
      error: error.message
    });
    throw error;
  }
}

/**
 * Main initialization function
 */
async function main() {
  logger.info('Initializing database', { script: 'init-db' });
  logger.info('='.repeat(50), { script: 'init-db' });

  try {
    // Initialize connection
    await db.initialize();
    logger.info('Database connection established', { script: 'init-db' });

    // Get and run migrations
    const migrations = await getMigrationFiles();
    logger.info('Found migrations', {
      script: 'init-db',
      count: migrations.length
    });

    for (const migration of migrations) {
      await runMigration(migration);
    }

    // Create default admin
    await createDefaultAdmin();

    // Summary
    logger.info('='.repeat(50), { script: 'init-db' });
    logger.info('Database initialization complete', { script: 'init-db' });
    logger.info('='.repeat(50), { script: 'init-db' });

    // Show pool stats
    const stats = db.getStats();
    if (stats) {
      logger.info('Connection Pool stats', {
        script: 'init-db',
        total: stats.pool.totalCount,
        idle: stats.pool.idleCount,
        waiting: stats.pool.waitingCount
      });
    }
  } catch (error) {
    logger.error('Database initialization failed', { script: 'init-db', error });
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as initializeDatabase };
