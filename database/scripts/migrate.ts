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
    console.log('ℹ️  No existing users.json file found');
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

  console.log(`\n📊 Found ${stats.total} users in JSON file`);

  for (const user of jsonUsers) {
    try {
      // Check if user already exists in database
      const existingUser = await db.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
        [user.email]
      );

      if (existingUser.rows.length > 0) {
        console.log(`⏭️  Skipping ${user.email} (already exists)`);
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

      console.log(`✅ Migrated ${user.email} (new ID: ${newUserId})`);
      stats.migrated++;
    } catch (error: any) {
      console.error(`❌ Error migrating ${user.email}:`, error.message);
      stats.errors++;
    }
  }

  return stats;
}

/**
 * Run migration
 */
async function main() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Initialize database connection
    await db.initialize();
    console.log('✅ Database connection established\n');

    // Check database health
    const healthy = await db.healthCheck();
    if (!healthy) {
      throw new Error('Database health check failed');
    }

    // Migrate users
    console.log('👥 Migrating users...');
    const userStats = await migrateUsers();

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary');
    console.log('='.repeat(50));
    console.log(`\nUsers:`);
    console.log(`  Total:    ${userStats.total}`);
    console.log(`  Migrated: ${userStats.migrated}`);
    console.log(`  Skipped:  ${userStats.skipped}`);
    console.log(`  Errors:   ${userStats.errors}`);

    if (userStats.errors === 0) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with errors');
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
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
