# Database Migration Guide

Complete guide for migrating from JSON file storage to PostgreSQL database.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Migration Process](#migration-process)
3. [Rollback Procedures](#rollback-procedures)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

### 1. PostgreSQL Installation

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hablas;

# Create user (optional)
CREATE USER hablas_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE hablas TO hablas_user;

# Exit
\q
```

### 3. Install Dependencies

```bash
npm install pg @types/pg
```

## Migration Process

### Step 1: Configure Environment

Create or update `.env.local`:

```env
# PostgreSQL Connection
DATABASE_URL=postgresql://hablas_user:your-secure-password@localhost:5432/hablas

# Or use individual parameters
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hablas
DB_USER=hablas_user
DB_PASSWORD=your-secure-password

# Pool Configuration
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30000
DB_CONNECT_TIMEOUT=2000
DB_SSL=false

# Admin Configuration
ADMIN_EMAIL=admin@hablas.co
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_NAME=Administrator
```

### Step 2: Initialize Database Schema

Run migrations to create tables:

```bash
npm run db:init
```

This will:
- Create `users` table
- Create `refresh_tokens` table
- Create `auth_audit_log` table
- Set up indexes and constraints
- Create triggers for `updated_at` fields
- Create default admin user

**Expected Output:**
```
🚀 Initializing database...
==================================================
✅ Database connection established

📚 Found 2 migration(s)

📄 Running migration: 001_create_users_table.sql
✅ Migration completed successfully

📄 Running migration: 002_create_auth_tables.sql
✅ Migration completed successfully

👤 Checking for admin users...
🔐 No admin users found. Creating default admin...
✅ Default admin created: admin@hablas.co
⚠️  IMPORTANT: Change the default password immediately!

==================================================
✅ Database initialization complete!
```

### Step 3: Verify Database Setup

Check database health:

```bash
npm run db:health
```

**Expected Output:**
```
🏥 Running database health check...
============================================================

📊 Database Connection:
  Status:        ✅ Connected
  Response Time: 15ms

📋 Tables:
  ✅ users                (1 rows)
  ✅ refresh_tokens       (0 rows)
  ✅ auth_audit_log       (1 rows)

🔍 Indexes:
  Total: 12
    - users.users_pkey
    - users.idx_users_email
    - users.idx_users_role
    ...

🔗 Connection Pool:
  Total:   1
  Idle:    1
  Waiting: 0

============================================================
✅ Database is healthy!
```

### Step 4: Migrate Existing Data

If you have existing users in JSON files:

```bash
npm run db:migrate
```

This will:
- Load users from `data/users.json`
- Check for duplicates
- Migrate users to PostgreSQL
- Preserve password hashes
- Log migration events

**Expected Output:**
```
🚀 Starting database migration...

✅ Database connection established

👥 Migrating users...

📊 Found 5 users in JSON file
✅ Migrated admin@hablas.co
✅ Migrated editor@example.com
✅ Migrated viewer@example.com
⏭️  Skipping existing@hablas.co (already exists)
✅ Migrated newuser@example.com

==================================================
📊 Migration Summary
==================================================

Users:
  Total:    5
  Migrated: 4
  Skipped:  1
  Errors:   0

✅ Migration completed successfully!
```

### Step 5: Update Application Code

The authentication layer automatically uses PostgreSQL when `DATABASE_URL` is configured. No code changes required!

The system will:
- Use `lib/db/users.ts` for PostgreSQL operations
- Fall back to `lib/auth/users.ts` for JSON files if database is not configured
- Maintain backward compatibility

### Step 6: Test Authentication

1. **Test Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hablas.co","password":"YourPassword123!"}'
```

2. **Check Audit Logs:**
```bash
psql -d hablas -c "SELECT * FROM auth_audit_log ORDER BY created_at DESC LIMIT 5;"
```

3. **Verify User Data:**
```bash
psql -d hablas -c "SELECT id, email, name, role, last_login FROM users;"
```

## Rollback Procedures

### Option 1: Keep JSON Files as Backup

The migration script does NOT delete JSON files. To rollback:

1. Stop the application
2. Remove or comment out `DATABASE_URL` in `.env.local`
3. Restart the application

The system will automatically fall back to JSON file storage.

### Option 2: Export Database to JSON

```bash
psql -d hablas -t -A -F"," -c "
  SELECT
    json_agg(json_build_object(
      'id', id,
      'email', email,
      'password', password_hash,
      'name', name,
      'role', role,
      'createdAt', created_at,
      'lastLogin', last_login
    ))
  FROM users;
" > data/users_backup.json
```

### Option 3: Database Backup

```bash
# Full backup
pg_dump hablas > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql hablas < backup_20250116_120000.sql
```

## Testing

### Unit Tests

Run database tests:

```bash
npm test -- __tests__/database
```

### Integration Tests

```bash
# Test complete auth flow
npm test -- __tests__/api/auth
```

### Manual Testing Checklist

- [ ] Database connection successful
- [ ] All tables created
- [ ] Indexes created
- [ ] Default admin user created
- [ ] Can login with admin credentials
- [ ] Can create new users
- [ ] Can update user information
- [ ] Can list users
- [ ] Authentication events logged
- [ ] Password hashing works
- [ ] Session management works

## Troubleshooting

### Connection Errors

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
# macOS:
brew services start postgresql@16

# Ubuntu:
sudo systemctl start postgresql

# Windows: Start via Services
```

### Authentication Errors

**Error:** `FATAL: password authentication failed`

**Solution:**
1. Check `.env.local` credentials
2. Verify PostgreSQL user exists:
   ```bash
   psql -U postgres -c "\du"
   ```
3. Reset password:
   ```bash
   psql -U postgres -c "ALTER USER hablas_user PASSWORD 'new-password';"
   ```

### Migration Errors

**Error:** `relation "users" already exists`

**Solution:**
Tables already exist. To recreate:
```bash
psql -d hablas -c "DROP TABLE IF EXISTS users, refresh_tokens, auth_audit_log CASCADE;"
npm run db:init
```

### Permission Errors

**Error:** `permission denied for schema public`

**Solution:**
```bash
psql -U postgres -d hablas -c "
  GRANT ALL ON SCHEMA public TO hablas_user;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO hablas_user;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO hablas_user;
"
```

### SSL Errors (Production)

**Error:** `SSL connection required`

**Solution:**
Update `.env.local`:
```env
DB_SSL=true
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

## Performance Optimization

### 1. Connection Pooling

Adjust pool size based on load:
```env
# High traffic
DB_POOL_MAX=50

# Low traffic
DB_POOL_MAX=10
```

### 2. Query Performance

Monitor slow queries:
```bash
psql -d hablas -c "
  SELECT query, calls, mean_time, total_time
  FROM pg_stat_statements
  WHERE mean_time > 1000
  ORDER BY mean_time DESC
  LIMIT 10;
"
```

### 3. Index Maintenance

```bash
# Analyze tables
psql -d hablas -c "ANALYZE users;"

# Reindex if needed
psql -d hablas -c "REINDEX TABLE users;"
```

## Security Best Practices

1. **Change default admin password immediately**
2. **Use strong DATABASE_URL password**
3. **Enable SSL in production** (`DB_SSL=true`)
4. **Restrict database access** (firewall rules)
5. **Regular backups** (pg_dump scheduled jobs)
6. **Monitor auth_audit_log** for suspicious activity
7. **Rotate JWT secrets** periodically

## Production Deployment

### Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:secure-password@db.example.com:5432/hablas?sslmode=require
DB_SSL=true
DB_POOL_MAX=30
ADMIN_PASSWORD=generate-a-strong-random-password
```

### Health Checks

Set up monitoring:
```bash
# Kubernetes liveness probe
/api/health

# Manual check
npm run db:health
```

### Backup Strategy

```bash
# Daily backups (cron job)
0 2 * * * pg_dump hablas > /backups/hablas_$(date +\%Y\%m\%d).sql

# Keep last 30 days
0 3 * * * find /backups -name "hablas_*.sql" -mtime +30 -delete
```

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [Architecture Documentation](../architecture/03-database-schema.md)
3. Check database logs: `tail -f /var/log/postgresql/postgresql-16-main.log`
4. File an issue with relevant logs and error messages
