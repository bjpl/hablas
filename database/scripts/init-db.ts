/**
 * Database Initialization Script
 * Runs all migrations in order and creates default admin user
 */

import { promises as fs } from 'fs';
import path from 'path';
import { db } from '../../lib/db/pool';
import { createUser } from '../../lib/db/users';
import type { UserRole } from '../types';

/**
 * Run SQL migration file
 */
async function runMigration(filePath: string): Promise<void> {
  console.log(`\n📄 Running migration: ${path.basename(filePath)}`);

  const sql = await fs.readFile(filePath, 'utf-8');

  try {
    await db.query(sql);
    console.log(`✅ Migration completed successfully`);
  } catch (error: any) {
    console.error(`❌ Migration failed:`, error.message);
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
  console.log('\n👤 Checking for admin users...');

  const result = await db.query(
    "SELECT COUNT(*) FROM users WHERE role = 'admin'"
  );

  const adminCount = parseInt(result.rows[0].count, 10);

  if (adminCount > 0) {
    console.log(`ℹ️  ${adminCount} admin user(s) already exist`);
    return;
  }

  console.log('🔐 No admin users found. Creating default admin...');

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

    console.log(`✅ Default admin created: ${admin.email}`);
    console.log(`⚠️  IMPORTANT: Change the default password immediately!`);
  } catch (error: any) {
    console.error('❌ Failed to create default admin:', error.message);
    throw error;
  }
}

/**
 * Main initialization function
 */
async function main() {
  console.log('🚀 Initializing database...\n');
  console.log('='.repeat(50));

  try {
    // Initialize connection
    await db.initialize();
    console.log('✅ Database connection established');

    // Get and run migrations
    const migrations = await getMigrationFiles();
    console.log(`\n📚 Found ${migrations.length} migration(s)`);

    for (const migration of migrations) {
      await runMigration(migration);
    }

    // Create default admin
    await createDefaultAdmin();

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ Database initialization complete!');
    console.log('='.repeat(50));

    // Show pool stats
    const stats = db.getStats();
    if (stats) {
      console.log('\n📊 Connection Pool Stats:');
      console.log(`  Total:   ${stats.totalCount}`);
      console.log(`  Idle:    ${stats.idleCount}`);
      console.log(`  Waiting: ${stats.waitingCount}`);
    }
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
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
