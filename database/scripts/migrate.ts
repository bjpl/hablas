/**
 * Database Migration Script
 * Migrates data from JSON files to PostgreSQL
 */

import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import { db } from '../../lib/db/pool';
import { createUser, logAuthEvent } from '../../lib/db/users';
import type { User } from '../../lib/auth/types';
import { logger } from '../../lib/utils/logger';

interface MigrationStats {
  users: {
    total: number;
    migrated: number;
    skipped: number;
    errors: number;
  };
}

/**
 * Load users from JSON file
 */
async function loadJsonUsers(): Promise<User[]> {
  const usersFile = path.join(process.cwd(), 'data', 'users.json');

  try {
    const data = await fs.readFile(usersFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    logger.info('No existing users.json file found', { script: 'migrate' });
    return [];
  }
}

/**
 * Migrate users from JSON to PostgreSQL
 */
async function migrateUsers(): Promise<MigrationStats['users']> {
  const stats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
  };

  const jsonUsers = await loadJsonUsers();
  stats.total = jsonUsers.length;

  logger.info('Found users in JSON file', {
    script: 'migrate',
    count: stats.total
  });

  for (const user of jsonUsers) {
    try {
      // Check if user already exists in database
      const existingUser = await db.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
        [user.email]
      );

      if (existingUser.rows.length > 0) {
        logger.info('Skipping existing user', {
          script: 'migrate',
          email: user.email
        });
        stats.skipped++;
        continue;
      }

      // Insert user with new UUID (old IDs are not valid UUIDs)
      const result = await db.query(
        `INSERT INTO users (email, password_hash, name, role, created_at, last_login)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          user.email,
          user.password, // Already hashed in JSON
          user.name,
          user.role,
          user.createdAt || new Date().toISOString(),
          user.lastLogin || null,
        ]
      );

      const newUserId = result.rows[0].id;

      // Log migration event
      await logAuthEvent({
        user_id: newUserId,
        event_type: 'registration',
        success: true,
        error_message: 'Migrated from JSON',
      });

      logger.info('Migrated user', {
        script: 'migrate',
        email: user.email,
        newId: newUserId
      });
      stats.migrated++;
    } catch (error: any) {
      logger.error('Error migrating user', {
        script: 'migrate',
        email: user.email,
        error: error.message
      });
      stats.errors++;
    }
  }

  return stats;
}

/**
 * Run migration
 */
async function main() {
  logger.info('Starting database migration', { script: 'migrate' });

  try {
    // Initialize database connection
    await db.initialize();
    logger.info('Database connection established', { script: 'migrate' });

    // Check database health
    const healthy = await db.healthCheck();
    if (!healthy) {
      throw new Error('Database health check failed');
    }

    // Migrate users
    logger.info('Migrating users', { script: 'migrate' });
    const userStats = await migrateUsers();

    // Print summary
    logger.info('='.repeat(50), { script: 'migrate' });
    logger.info('Migration Summary', {
      script: 'migrate',
      total: userStats.total,
      migrated: userStats.migrated,
      skipped: userStats.skipped,
      errors: userStats.errors
    });
    logger.info('='.repeat(50), { script: 'migrate' });

    if (userStats.errors === 0) {
      logger.info('Migration completed successfully', { script: 'migrate' });
    } else {
      logger.warn('Migration completed with errors', {
        script: 'migrate',
        errorCount: userStats.errors
      });
    }
  } catch (error) {
    logger.error('Migration failed', { script: 'migrate', error });
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Run migration
if (require.main === module) {
  main();
}

export { migrateUsers };
