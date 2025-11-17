# Sessions Table Migration Guide

## Overview

This guide covers the implementation of the sessions table (Migration 003) and Redis integration for distributed rate limiting.

## Database Migration: 003_create_sessions_table.sql

### Features

1. **Active Session Tracking**
   - Session tokens with device metadata
   - Activity tracking with last_activity timestamp
   - Automatic session expiration
   - Manual session revocation support

2. **Device Intelligence**
   - Track device type (mobile, tablet, desktop)
   - Browser and OS information
   - IP address and location tracking
   - User agent parsing

3. **Security Features**
   - Session token hashing (SHA-256)
   - Automatic expiration with triggers
   - Maximum sessions per user (5 default)
   - Expired session cleanup function

4. **Performance Optimization**
   - Comprehensive indexing strategy
   - Efficient cleanup queries
   - Automatic session limiting per user
   - Connection to refresh_tokens table

### Schema Design

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token VARCHAR(255) NOT NULL,
  access_token_hash VARCHAR(255),
  refresh_token_hash VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(50),
  device_name VARCHAR(100),
  browser VARCHAR(100),
  os VARCHAR(100),
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Indexes

1. **idx_sessions_token** (UNIQUE) - Fast session lookup by token
2. **idx_sessions_user** - User's sessions queries
3. **idx_sessions_active** - Active sessions per user
4. **idx_sessions_expires** - Expiration-based queries
5. **idx_sessions_last_activity** - Activity sorting
6. **idx_sessions_cleanup** - Efficient cleanup operations
7. **idx_sessions_user_created** - Session management by user

### Automatic Features

#### 1. Session Expiration Trigger
Automatically marks sessions as inactive when expired:

```sql
CREATE TRIGGER check_session_expiry
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_revoke_expired_sessions();
```

#### 2. Session Limit Enforcement
Automatically revokes oldest session when user exceeds maximum (5 sessions):

```sql
CREATE TRIGGER enforce_session_limit
  AFTER INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_max_sessions_per_user();
```

#### 3. Cleanup Function
Remove sessions expired more than 7 days ago:

```sql
SELECT cleanup_expired_sessions(); -- Returns number of deleted sessions
```

**Recommended**: Run cleanup daily via cron or scheduled job.

## Migration Steps

### 1. Run Migration

```bash
npm run db:migrate
```

This will:
- Create sessions table
- Create all indexes
- Set up triggers and functions
- Add table comments

### 2. Verify Migration

```bash
npm run db:health
```

Expected output:
```
📊 Database Connection:
  Status:        ✅ Connected

🔴 Redis Connection:
  Status:        ⚠️  Not Connected (or ✅ Connected)
  Mode:          💾 In-Memory (or 🚀 Redis)

📋 Tables:
  ✅ users                  (X rows)
  ✅ sessions               (0 rows)
  ✅ refresh_tokens         (X rows)
  ✅ auth_audit_log         (X rows)
```

### 3. Rollback (if needed)

```bash
psql $DATABASE_URL -f database/migrations/rollback/003_rollback_sessions_table.sql
```

## Redis Integration

### Configuration

Redis is **optional** for production. The system automatically falls back to in-memory rate limiting if Redis is unavailable.

#### Environment Variables

```env
# Optional: Redis for distributed rate limiting
REDIS_URL=redis://username:password@hostname:6379
REDIS_PASSWORD=your-redis-password

# Or individual parameters:
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_CONNECT_TIMEOUT=5000
```

### Features

1. **Automatic Fallback**
   - Gracefully degrades to in-memory if Redis unavailable
   - Non-blocking initialization
   - Automatic reconnection attempts

2. **Rate Limiting**
   - Distributed rate limiting across instances
   - Faster than in-memory for high traffic
   - Persistent across application restarts

3. **Health Monitoring**
   - Built-in health checks
   - Connection status reporting
   - Performance metrics

### Usage

Redis is automatically initialized on application start. No code changes needed:

```typescript
// Rate limiting automatically uses Redis if available
import { checkRateLimit } from '@/lib/utils/rate-limiter';

const result = await checkRateLimit(userEmail, 'LOGIN');
// Uses Redis if connected, falls back to memory if not
```

### Health Check

```bash
npm run db:health
```

Check Redis status in output:
```
🔴 Redis Connection:
  Status:        ✅ Connected
  Mode:          🚀 Redis
  Response Time: 5ms
```

## Session Management Best Practices

### 1. Session Creation

```typescript
import { db } from '@/lib/db/pool';

async function createSession(userId: string, metadata: SessionMetadata) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const result = await db.query(
    `INSERT INTO sessions (
      user_id, session_token, ip_address, user_agent,
      device_type, browser, os, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [userId, sessionToken, ip, userAgent, deviceType, browser, os, expiresAt]
  );

  return result.rows[0];
}
```

### 2. Session Validation

```typescript
async function validateSession(sessionToken: string) {
  const result = await db.query(
    `UPDATE sessions
     SET last_activity = CURRENT_TIMESTAMP
     WHERE session_token = $1
       AND is_active = true
       AND revoked_at IS NULL
       AND expires_at > CURRENT_TIMESTAMP
     RETURNING *`,
    [sessionToken]
  );

  return result.rows[0] || null;
}
```

### 3. Session Revocation

```typescript
async function revokeSession(sessionToken: string) {
  await db.query(
    `UPDATE sessions
     SET is_active = false, revoked_at = CURRENT_TIMESTAMP
     WHERE session_token = $1`,
    [sessionToken]
  );
}
```

### 4. User Session Management

```typescript
// Get all active sessions for a user
async function getUserSessions(userId: string) {
  const result = await db.query(
    `SELECT * FROM sessions
     WHERE user_id = $1
       AND is_active = true
       AND revoked_at IS NULL
     ORDER BY last_activity DESC`,
    [userId]
  );

  return result.rows;
}

// Revoke all sessions for a user (e.g., password change)
async function revokeAllUserSessions(userId: string) {
  await db.query(
    `UPDATE sessions
     SET is_active = false, revoked_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}
```

## Maintenance

### Daily Cleanup (Recommended)

Add to cron or scheduled job:

```sql
-- Run daily to cleanup old sessions
SELECT cleanup_expired_sessions();
```

Or via Node.js:

```typescript
import { db } from '@/lib/db/pool';

async function cleanupSessions() {
  const result = await db.query('SELECT cleanup_expired_sessions()');
  console.log(`Cleaned up ${result.rows[0].cleanup_expired_sessions} expired sessions`);
}
```

### Monitoring Queries

```sql
-- Active sessions count
SELECT COUNT(*) FROM sessions
WHERE is_active = true AND revoked_at IS NULL;

-- Sessions by device type
SELECT device_type, COUNT(*) as count
FROM sessions
WHERE is_active = true
GROUP BY device_type;

-- Sessions expiring soon (next 24 hours)
SELECT COUNT(*) FROM sessions
WHERE expires_at < CURRENT_TIMESTAMP + INTERVAL '24 hours'
  AND revoked_at IS NULL;
```

## Security Considerations

1. **Token Storage**: Always hash session tokens before database storage
2. **HTTPS Only**: Use secure cookies (httpOnly, secure, sameSite)
3. **Session Rotation**: Regenerate session tokens after privilege changes
4. **Activity Tracking**: Update last_activity on each authenticated request
5. **Session Limits**: Enforce maximum sessions per user (configured: 5)
6. **IP Validation**: Consider validating IP address for sensitive operations

## Performance Tips

1. **Index Usage**: All queries should use appropriate indexes
2. **Regular Cleanup**: Run cleanup_expired_sessions() daily
3. **Connection Pooling**: Database pool handles concurrent session checks
4. **Redis Caching**: Use Redis for faster rate limiting in production
5. **Batch Operations**: Use transactions for multiple session operations

## Troubleshooting

### Sessions Not Expiring
Check trigger is active:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'check_session_expiry';
```

### Too Many Sessions Per User
Verify trigger:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'enforce_session_limit';
```

### Slow Session Queries
Analyze query performance:
```sql
EXPLAIN ANALYZE
SELECT * FROM sessions WHERE user_id = 'uuid-here' AND is_active = true;
```

### Redis Connection Issues
Check Redis health:
```bash
npm run db:health
```

Verify environment variables:
```bash
echo $REDIS_URL
```

## References

- Migration file: `database/migrations/003_create_sessions_table.sql`
- Rollback script: `database/migrations/rollback/003_rollback_sessions_table.sql`
- Redis manager: `lib/db/redis.ts`
- Rate limiter: `lib/utils/rate-limiter.ts`
- Health check: `database/scripts/health-check.ts`
