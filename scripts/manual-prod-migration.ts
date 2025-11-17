/**
 * Manual Production Migration Script
 * Run this to migrate your production Neon database
 *
 * Usage:
 * 1. Set DATABASE_URL environment variable to your Neon connection string
 * 2. Run: DATABASE_URL="your-neon-url" tsx scripts/manual-prod-migration.ts
 */

import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';

async function runMigration(migrationFile: string, pool: Pool) {
  const migrationPath = path.join(process.cwd(), 'database', 'migrations', migrationFile);
  const sql = await fs.readFile(migrationPath, 'utf-8');

  console.log(`\n📄 Running: ${migrationFile}`);

  try {
    await pool.query(sql);
    console.log(`✅ Success: ${migrationFile}`);
  } catch (error: any) {
    console.error(`❌ Error in ${migrationFile}:`, error.message);
    throw error;
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.log('\nUsage:');
    console.log('  DATABASE_URL="your-neon-connection-string" tsx scripts/manual-prod-migration.ts');
    console.log('\nGet your DATABASE_URL from:');
    console.log('  Vercel Dashboard → Storage → hablas → Click "Show secret" 👁️');
    process.exit(1);
  }

  console.log('🚀 Production Database Migration');
  console.log('================================\n');
  console.log('⚠️  WARNING: This will modify your PRODUCTION database!');
  console.log(`📍 Database: ${databaseUrl.split('@')[1]?.split('/')[0] || 'Unknown'}\n`);

  // Create connection pool
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 1, // Single connection for migrations
  });

  try {
    // Test connection
    console.log('🔌 Testing connection...');
    const result = await pool.query('SELECT NOW() as now, version() as version');
    console.log(`✅ Connected to PostgreSQL`);
    console.log(`   Time: ${result.rows[0].now}`);
    console.log(`   Version: ${result.rows[0].version.split(' ')[0]}\n`);

    // Run migrations in order
    const migrations = [
      '001_create_users_table.sql',
      '002_create_auth_tables.sql',
      '003_create_sessions_table.sql',
    ];

    for (const migration of migrations) {
      await runMigration(migration, pool);
    }

    // Check tables
    console.log('\n📊 Verifying tables...');
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('✅ Tables created:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Count indexes
    const indexes = await pool.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public'
    `);
    console.log(`✅ Indexes: ${indexes.rows[0].count} total`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Verify: npm run db:health');
    console.log('   2. Deploy: git push (or npx vercel --prod)');
    console.log('   3. Test: https://your-app.vercel.app/api/health');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
