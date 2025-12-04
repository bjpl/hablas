# Quick Start: Database Setup and Migration
**Last Updated:** 2025-11-27

---

## TL;DR - Fast Track

```bash
# 1. Install PostgreSQL on WSL
sudo apt update && sudo apt install -y postgresql postgresql-contrib

# 2. Start PostgreSQL
sudo service postgresql start

# 3. Setup database
sudo -u postgres psql << 'EOF'
ALTER USER postgres PASSWORD 'postgres';
CREATE DATABASE hablas;
\c hablas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
\q
EOF

# 4. Run migrations
cd /mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas
npm run db:migrate
```

---

## Step-by-Step Guide

### Step 1: Install PostgreSQL (5 minutes)

```bash
# Update package repositories
sudo apt update

# Install PostgreSQL and extensions
sudo apt install -y postgresql postgresql-contrib

# Verify installation
psql --version
# Expected: psql (PostgreSQL) 14.x or higher
```

### Step 2: Start PostgreSQL Service

```bash
# Start the service
sudo service postgresql start

# Verify it's running
sudo service postgresql status
# Expected: "online" or "active"
```

### Step 3: Configure Database

```bash
# Set postgres user password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Create hablas database
sudo -u postgres createdb hablas

# Enable required extensions
sudo -u postgres psql -d hablas << 'EOF'
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
SELECT extname, extversion FROM pg_extension;
\q
EOF
```

**Expected Output:**
```
        extname        | extversion
-----------------------+------------
 plpgsql               | 1.0
 uuid-ossp             | 1.1
 pgcrypto              | 1.3
```

### Step 4: Verify Database Connection

```bash
# Test connection (you'll be prompted for password: postgres)
psql -h localhost -U postgres -d hablas -c "SELECT current_database(), version();"
```

**Expected Output:**
```
 current_database |                            version
------------------+---------------------------------------------------------------
 hablas           | PostgreSQL 14.x on x86_64-linux-gnu...
```

### Step 5: Run Schema Migrations

```bash
# Navigate to project directory
cd /mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas

# Apply migrations (in order)
psql -h localhost -U postgres -d hablas -f database/migrations/001_create_users_table.sql
psql -h localhost -U postgres -d hablas -f database/migrations/002_create_auth_tables.sql
psql -h localhost -U postgres -d hablas -f database/migrations/003_create_sessions_table.sql
```

**Expected Output (for each file):**
```
CREATE EXTENSION
CREATE TABLE
CREATE INDEX
...
COMMIT
```

### Step 6: Verify Schema

```bash
# Check tables were created
psql -h localhost -U postgres -d hablas -c "\dt"
```

**Expected Output:**
```
              List of relations
 Schema |      Name       | Type  |  Owner
--------+-----------------+-------+----------
 public | auth_audit_log  | table | postgres
 public | refresh_tokens  | table | postgres
 public | sessions        | table | postgres
 public | users           | table | postgres
```

### Step 7: Run Data Migration

```bash
# Migrate users from JSON to PostgreSQL
npm run db:migrate
```

**Expected Output:**
```
🚀 Starting database migration...
✅ Database connection established

👥 Migrating users...
📊 Found X users in JSON file
✅ Migrated user@example.com (new ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

==================================================
📊 Migration Summary
==================================================
Users:
  Total:    X
  Migrated: X
  Skipped:  0
  Errors:   0

✅ Migration completed successfully!
```

---

## Verification Checklist

After migration, verify everything is working:

```bash
# 1. Check user count
psql -h localhost -U postgres -d hablas -c "SELECT COUNT(*) FROM users;"

# 2. Check admin user exists
psql -h localhost -U postgres -d hablas -c "SELECT email, role FROM users WHERE role = 'admin';"

# 3. Check all tables
psql -h localhost -U postgres -d hablas -c "
  SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename;
"

# 4. Check triggers
psql -h localhost -U postgres -d hablas -c "
  SELECT trigger_name, event_object_table
  FROM information_schema.triggers
  WHERE event_object_schema = 'public'
  ORDER BY event_object_table;
"
```

---

## Troubleshooting

### Issue: "peer authentication failed"

**Solution:** Edit PostgreSQL config to allow password authentication

```bash
# Find the pg_hba.conf file
sudo find /etc -name pg_hba.conf

# Edit the file (replace path with actual location)
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Change this line:
# local   all             postgres                                peer

# To:
# local   all             postgres                                md5

# Restart PostgreSQL
sudo service postgresql restart
```

### Issue: "database 'hablas' does not exist"

**Solution:** Create the database manually

```bash
sudo -u postgres createdb hablas
```

### Issue: "extension 'uuid-ossp' does not exist"

**Solution:** Install contrib package and enable extension

```bash
# Install contrib (if not already installed)
sudo apt install postgresql-contrib

# Enable extension
sudo -u postgres psql -d hablas -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
```

### Issue: "esbuild platform mismatch"

**Solution:** Reinstall correct platform binary

```bash
npm install --force @esbuild/linux-x64
```

### Issue: "connection refused" or "could not connect"

**Solution:** Ensure PostgreSQL is running

```bash
# Check status
sudo service postgresql status

# If not running, start it
sudo service postgresql start

# Check if listening on port 5432
sudo netstat -plnt | grep 5432
```

---

## Alternative: Docker PostgreSQL

If you prefer using Docker instead of installing PostgreSQL directly:

```bash
# Pull and run PostgreSQL container
docker run --name hablas-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=hablas \
  -p 5432:5432 \
  -d postgres:15

# Wait for container to start (5-10 seconds)
sleep 10

# Enable extensions
docker exec hablas-postgres psql -U postgres -d hablas \
  -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" \
  -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"

# Verify
docker exec hablas-postgres psql -U postgres -d hablas -c "\dx"

# Now run migrations
npm run db:migrate
```

**To stop/start Docker container:**
```bash
docker stop hablas-postgres
docker start hablas-postgres
docker rm hablas-postgres  # Remove container
```

---

## Production Deployment

For production, update `.env.local` or `.env.production`:

```bash
# Example production configuration
DATABASE_URL=postgresql://prod_user:secure_password@db.example.com:5432/hablas
DB_HOST=db.example.com
DB_PORT=5432
DB_NAME=hablas
DB_USER=prod_user
DB_PASSWORD=your_secure_password_here
DB_SSL=true
DB_POOL_MAX=50
```

**Security Checklist:**
- [ ] Change default passwords
- [ ] Enable SSL/TLS for database connections
- [ ] Use strong passwords (20+ characters)
- [ ] Restrict database network access
- [ ] Enable PostgreSQL audit logging
- [ ] Set up automated backups
- [ ] Configure firewall rules

---

## Maintenance Commands

### Backup Database
```bash
# Full backup
pg_dump -h localhost -U postgres hablas > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -h localhost -U postgres hablas | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore Database
```bash
# From SQL file
psql -h localhost -U postgres hablas < backup_20251127.sql

# From compressed backup
gunzip -c backup_20251127.sql.gz | psql -h localhost -U postgres hablas
```

### Cleanup Expired Sessions
```bash
# Run cleanup function
psql -h localhost -U postgres -d hablas -c "SELECT cleanup_expired_sessions();"
```

### Monitor Database Size
```bash
# Check database size
psql -h localhost -U postgres -d hablas -c "
  SELECT
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
  FROM pg_database
  WHERE datname = 'hablas';
"
```

---

## Next Steps

After successful migration:

1. **Test Application:** Start the Next.js app and verify authentication works
2. **Check Logs:** Monitor `auth_audit_log` table for events
3. **Performance:** Run queries and check index usage
4. **Backup:** Set up automated backup schedule
5. **Monitoring:** Configure database monitoring tools

**Complete Documentation:** See `MIGRATION_STATUS_REPORT.md` for full technical details.

---

**Quick Reference Created:** 2025-11-27
**Database Specialist Agent**
