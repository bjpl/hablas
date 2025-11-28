# Database Documentation

Complete documentation for the Hablas PostgreSQL database implementation.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure database
cp .env.example .env.local
# Edit .env.local and set DATABASE_URL

# 3. Initialize database
npm run db:init

# 4. (Optional) Migrate existing users
npm run db:migrate

# 5. Verify setup
npm run db:health
```

## Documentation Index

### Core Documentation

1. **[Quick Start Database](./QUICK_START_DATABASE.md)** ⭐ NEW
   - Fast-track setup guide (5-10 minutes)
   - PostgreSQL installation options (WSL, Docker, Cloud)
   - Step-by-step migration walkthrough
   - Troubleshooting common issues
   - Maintenance commands

2. **[Migration Status Report](./MIGRATION_STATUS_REPORT.md)** ⭐ NEW
   - Complete migration analysis (Nov 27, 2025)
   - Database schema overview (3 migrations)
   - PostgreSQL setup requirements
   - Migration script logic review
   - Production deployment considerations
   - Technical specifications

3. **[Database Schema](../architecture/03-database-schema.md)**
   - Complete table definitions
   - Relationships and constraints
   - Indexes and performance
   - Query examples

4. **[Migration Guide](./MIGRATION_GUIDE.md)**
   - Prerequisites and setup
   - Step-by-step migration
   - Rollback procedures
   - Troubleshooting

5. **[Migration Summary](./MIGRATION_SUMMARY.md)**
   - What was implemented
   - Architecture decisions
   - File structure
   - Performance metrics

6. **[Sessions Migration Guide](./SESSIONS_MIGRATION_GUIDE.md)**
   - Session management implementation
   - Device tracking features
   - Session limiting and expiry

7. **[Redis Setup Guide](./REDIS_SETUP_GUIDE.md)**
   - Redis configuration for rate limiting
   - Session caching setup

### Quick Reference

#### NPM Scripts

```bash
# Initialize database schema
npm run db:init

# Migrate data from JSON to PostgreSQL
npm run db:migrate

# Check database health
npm run db:health

# Run database tests
npm test -- __tests__/database
```

#### Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Optional (fallback)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hablas
DB_USER=postgres
DB_PASSWORD=secret

# Pool configuration
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30000
DB_CONNECT_TIMEOUT=2000
DB_SSL=false
```

#### File Structure

```
database/
├── migrations/           # SQL migration files
│   ├── 001_create_users_table.sql
│   └── 002_create_auth_tables.sql
├── scripts/             # Management scripts
│   ├── init-db.ts       # Initialize schema
│   ├── migrate.ts       # Migrate data
│   └── health-check.ts  # Health verification
└── types/               # TypeScript definitions
    └── index.ts         # Database types

lib/
├── db/                  # Database layer
│   ├── pool.ts          # Connection pool
│   └── users.ts         # User operations
└── config/
    └── database.ts      # Configuration

__tests__/
└── database/            # Database tests
    ├── pool.test.ts
    └── users.test.ts

docs/
└── database/            # Documentation
    ├── README.md        # This file
    ├── MIGRATION_GUIDE.md
    └── MIGRATION_SUMMARY.md
```

## Database Schema Overview

### Users Table

Core user accounts with authentication:

```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,  -- admin, editor, viewer
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_login TIMESTAMP
)
```

### Refresh Tokens Table

JWT refresh token management:

```sql
refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP
)
```

### Auth Audit Log Table

Security event tracking:

```sql
auth_audit_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP
)
```

## Common Operations

### User Management

```typescript
import { createUser, getUserByEmail, validateCredentials } from '@/lib/db/users';

// Create user
const user = await createUser({
  email: 'user@example.com',
  password: 'SecurePass123!',
  name: 'John Doe',
  role: 'viewer'
});

// Get user
const user = await getUserByEmail('user@example.com');

// Validate credentials
const result = await validateCredentials('user@example.com', 'password');
if (result.valid) {
  console.log('Login successful:', result.user);
}
```

### Direct Database Queries

```typescript
import { db } from '@/lib/db/pool';

// Simple query
const result = await db.query(
  'SELECT * FROM users WHERE role = $1',
  ['admin']
);

// Transaction
await db.transaction(async (client) => {
  await client.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', userId]);
  await client.query('INSERT INTO auth_audit_log (...) VALUES (...)');
});
```

## Security Best Practices

1. **Never expose password_hash** - Always use `UserPublic` type for API responses
2. **Use parameterized queries** - Prevent SQL injection
3. **Log authentication events** - Track security incidents
4. **Rotate JWT secrets** - Invalidate all tokens periodically
5. **Monitor audit logs** - Watch for suspicious patterns
6. **Enable SSL in production** - Encrypt database connections
7. **Use strong passwords** - Enforce password policy
8. **Limit connection pool** - Prevent resource exhaustion

## Performance Tips

1. **Use indexes** - All queries should use indexed columns
2. **Limit result sets** - Always paginate large queries
3. **Monitor slow queries** - Check logs for queries > 1000ms
4. **Analyze tables regularly** - Keep statistics up-to-date
5. **Use connection pooling** - Reuse database connections
6. **Batch operations** - Group multiple inserts/updates
7. **Cache frequent queries** - Use Redis for hot data

## Backup and Recovery

### Create Backup

```bash
# Full database backup
pg_dump hablas > backup_$(date +%Y%m%d).sql

# Schema only
pg_dump --schema-only hablas > schema.sql

# Data only
pg_dump --data-only hablas > data.sql
```

### Restore Backup

```bash
# Restore full backup
psql hablas < backup_20250116.sql

# Restore specific table
psql hablas -c "TRUNCATE users CASCADE;"
psql hablas < users_backup.sql
```

## Monitoring

### Check Database Health

```bash
npm run db:health
```

### Monitor Active Connections

```sql
SELECT * FROM pg_stat_activity
WHERE state = 'active';
```

### Check Table Sizes

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Monitor Slow Queries

```sql
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Troubleshooting

### Connection Refused

```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql@16

# Start PostgreSQL (Ubuntu)
sudo systemctl start postgresql
```

### Authentication Failed

```bash
# Reset password
psql -U postgres -c "ALTER USER hablas_user PASSWORD 'new-password';"
```

### Migration Errors

```bash
# Drop and recreate tables
psql -d hablas -c "DROP TABLE IF EXISTS users, refresh_tokens, auth_audit_log CASCADE;"
npm run db:init
```

## Testing

### Run All Tests

```bash
npm test -- __tests__/database
```

### Run Specific Test Suite

```bash
# Pool tests
npm test -- __tests__/database/pool.test.ts

# User tests
npm test -- __tests__/database/users.test.ts
```

### Manual Testing

```bash
# Initialize test database
createdb hablas_test
export DATABASE_URL=postgresql://localhost/hablas_test

# Run migrations
npm run db:init

# Run tests
npm test -- __tests__/database

# Cleanup
dropdb hablas_test
```

## Production Deployment

### Checklist

- [ ] Set strong DATABASE_URL password
- [ ] Enable SSL (DB_SSL=true)
- [ ] Configure connection pool size
- [ ] Set up automated backups
- [ ] Configure monitoring/alerts
- [ ] Test failover procedures
- [ ] Document recovery procedures
- [ ] Set up read replicas (if needed)
- [ ] Configure firewall rules
- [ ] Enable connection encryption

### Environment Configuration

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:secure-pass@db.example.com:5432/hablas?sslmode=require
DB_SSL=true
DB_POOL_MAX=30
```

### Monitoring Setup

```bash
# Enable pg_stat_statements
psql -d hablas -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"

# Set up log collection
# Configure PostgreSQL logs: /var/log/postgresql/

# Set up metrics collection
# Use tools like pgBadger, pg_stat_monitor, or cloud-native solutions
```

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node-Postgres (pg) Documentation](https://node-postgres.com/)
- [Database Architecture](../architecture/03-database-schema.md)
- [Security Best Practices](https://www.postgresql.org/docs/current/security.html)

## Support

For issues or questions:

1. Check the [Migration Guide](./MIGRATION_GUIDE.md) troubleshooting section
2. Review [Database Schema](../architecture/03-database-schema.md)
3. Run health check: `npm run db:health`
4. Check database logs: `tail -f /var/log/postgresql/postgresql.log`
5. Review audit logs: `SELECT * FROM auth_audit_log ORDER BY created_at DESC LIMIT 50;`

## Version History

- **v1.2** (2025-11-27) - Migration status assessment and documentation update
  - Migration status report (MIGRATION_STATUS_REPORT.md)
  - Quick start guide (QUICK_START_DATABASE.md)
  - esbuild platform compatibility fix
  - PostgreSQL setup validation
  - Comprehensive troubleshooting documentation

- **v1.1** (2025-11-17) - Sessions table implementation
  - Sessions table with device tracking
  - Session limiting (5 per user)
  - Auto-expiry mechanisms
  - Cleanup functions
  - Redis integration guide

- **v1.0** (2025-01-16) - Initial PostgreSQL migration
  - Users table with authentication
  - Refresh tokens table
  - Auth audit log table
  - Migration scripts
  - Comprehensive testing
  - Documentation
