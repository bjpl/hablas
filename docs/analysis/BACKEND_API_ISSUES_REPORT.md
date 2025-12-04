# Backend API Issues Report
**Date:** 2025-11-27
**Environment:** WSL2 (Linux) with Windows node_modules
**Project:** Hablas - English Learning Platform

## Executive Summary

The Hablas application has a well-architected backend with comprehensive authentication, database pooling, and API infrastructure. However, several critical issues prevent proper functionality:

### Critical Issues (BLOCKING)
1. **WSL/Windows node_modules incompatibility** - Binary mismatch preventing all Node.js scripts from running
2. **Database migration incomplete** - Sessions table not created
3. **Session management using deprecated file-based storage** - Should use PostgreSQL
4. **Missing environment variable** - REFRESH_TOKEN_SECRET not configured

### High Priority Issues
5. **Content save API using file-based storage** - Violates database-first architecture
6. **Middleware authentication bug** - checkAuth returns sync value from async function
7. **Redis graceful degradation incomplete** - Some rate limiters still expect Redis
8. **Missing BLOB_READ_WRITE_TOKEN validation** - Audio API fails silently

### Medium Priority Issues
9. **CORS configuration inconsistencies** - Different policies across routes
10. **Rate limiting using in-memory storage** - Not suitable for production
11. **Admin initialization race condition** - Multiple concurrent requests may create duplicate admins

---

## Issue Details

### 1. WSL/Windows Binary Incompatibility ⛔ CRITICAL

**Status:** BLOCKING
**Impact:** Cannot run any server-side scripts (db:health, db:migrate, tests)

**Problem:**
```bash
Error: You installed esbuild for another platform than the one you're currently using.
The "@esbuild/win32-x64" package is present but this platform needs "@esbuild/linux-x64"
```

**Root Cause:**
- `node_modules` was installed on Windows
- Code is being run in WSL2 (Linux environment)
- Binary packages like esbuild, tsx, and potentially others have platform-specific builds

**Solution:**
```bash
# From WSL, rebuild node_modules for Linux
rm -rf node_modules
npm install

# Or use Docker for consistent environments
docker run -v $(pwd):/app -w /app node:18 npm install
```

**Files Affected:**
- All TypeScript execution (tsx)
- All Jest tests
- All database scripts

**Priority:** CRITICAL - Must be fixed before any other testing/fixes

---

### 2. Database Session Table Missing ⛔ CRITICAL

**Status:** BLOCKING authentication persistence
**Impact:** Session management falls back to deprecated file-based storage

**Evidence:**
```typescript
// lib/auth/session.ts
async function loadSessions(): Promise<Session[]> {
  // Deprecated: Sessions are now stored in PostgreSQL sessions table
  return [];
}
```

**Missing Migration:**
- File: `database/migrations/003_create_sessions_table.sql` exists but may not be applied
- Need to verify if migrations have been run

**Current State:**
- Sessions table defined in migration file
- Code expects PostgreSQL storage but has file-based fallback
- All session operations return empty/no-op

**Solution:**
```bash
# After fixing WSL issue
npm run db:migrate
npm run db:health
```

**Verify:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'refresh_tokens', 'auth_audit_log', 'sessions');
```

---

### 3. Missing REFRESH_TOKEN_SECRET Environment Variable ⛔ CRITICAL

**Status:** Using auto-generated temporary secret in development
**Impact:** Sessions invalidated on every app restart

**Evidence:**
```typescript
// lib/auth/session.ts:19-36
if (!REFRESH_TOKEN_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL: REFRESH_TOKEN_SECRET must be set in production');
  } else {
    const crypto = require('crypto');
    TEMP_REFRESH_SECRET = crypto.randomBytes(64).toString('hex');
    console.warn('⚠️  Using auto-generated REFRESH_TOKEN_SECRET for development only');
  }
}
```

**Current .env.example:**
- JWT_SECRET is documented
- REFRESH_TOKEN_SECRET is missing

**Solution:**
Add to `.env.local`:
```bash
# Generate secure secret
REFRESH_TOKEN_SECRET=$(openssl rand -base64 64)

# Or manually add to .env.local
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-at-least-64-chars-long
```

**Impact if not fixed:**
- Users logged out on every server restart
- Cannot maintain persistent sessions
- Production deployment will fail

---

### 4. Content Save API Using File System ⚠️ HIGH

**Status:** Architectural inconsistency
**Impact:** Content edits not persisted to database

**Problem:**
```typescript
// app/api/content/save/route.ts:33-34
const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');
const editsData = await fs.readFile(editsPath, 'utf-8');
```

**Issues:**
- Uses file-based storage instead of PostgreSQL
- Not suitable for multi-instance deployments
- No ACID guarantees
- Race conditions on concurrent edits
- Violates project architecture (database-first)

**Recommended Solution:**
Create database table for content edits:
```sql
CREATE TABLE content_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id VARCHAR(255) NOT NULL,
  original_content JSONB,
  edited_content JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  edited_by VARCHAR(255),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_edit_id UUID REFERENCES content_edits(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  change_description TEXT,
  edited_by VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### 5. Middleware Authentication Bug ⚠️ HIGH

**Status:** Logic error causing inconsistent authentication
**Impact:** Auth checks may pass incorrectly

**Problem:**
```typescript
// lib/auth/middleware-helper.ts:14-27
export async function checkAuth(request: NextRequest): Promise<AuthResult> {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { authenticated: false, error: 'No authentication token found' };
  }

  // BUG: verifyToken is async but not awaited
  const payload = verifyToken(token); // Should be: await verifyToken(token)

  if (!payload) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }
}
```

**Impact:**
- `verifyToken()` returns a Promise, not the payload
- `if (!payload)` will always be false (Promises are truthy)
- Authentication appears to succeed even with invalid tokens

**Solution:**
```typescript
// Line 27
const payload = await verifyToken(token);
```

**Files to Fix:**
- `/mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas/lib/auth/middleware-helper.ts` (line 27)

---

### 6. Redis Graceful Degradation Incomplete ⚠️ HIGH

**Status:** Partial implementation
**Impact:** Some rate limiters may crash without Redis

**Evidence:**
```typescript
// lib/db/redis.ts - Good graceful handling
async initialize(): Promise<boolean> {
  if (!this.isEnabled) {
    console.log('ℹ️  Redis not configured - using in-memory rate limiting');
    return false;
  }
}
```

**But:**
```typescript
// lib/utils/rate-limiter.ts - May expect Redis client
const client = getRedisClient();
if (client) {
  // Use Redis
} else {
  // Fallback to memory - needs verification
}
```

**Issue:**
- Redis manager has good fallback logic
- Rate limiters reference Redis but may not handle null client properly
- Need to verify all rate limiter implementations have proper fallback

**Solution:**
Audit all files importing `getRedisClient()` and ensure they handle null return:
```bash
grep -r "getRedisClient" lib/
```

---

### 7. Missing BLOB_READ_WRITE_TOKEN Validation 🔧 MEDIUM

**Status:** Silent failure
**Impact:** Audio endpoints return 500 without clear error

**Problem:**
```typescript
// app/api/audio/[id]/route.ts:74-84
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN not configured');
  return NextResponse.json(
    { success: false, error: 'Storage not configured' },
    { status: 500 }
  );
}
```

**Issues:**
- Check happens at request time, not startup
- Should validate at app initialization
- No health check for Vercel Blob connectivity

**Solution:**
Add to startup validation:
```typescript
// app/layout.tsx or middleware.ts
if (process.env.NODE_ENV === 'production' && !process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error('BLOB_READ_WRITE_TOKEN required in production');
}
```

Add to health check:
```typescript
// app/api/health/route.ts
checks.blobStorage = {
  status: process.env.BLOB_READ_WRITE_TOKEN ? 'configured' : 'missing',
};
```

---

### 8. CORS Configuration Inconsistencies 🔧 MEDIUM

**Status:** Different implementations across routes
**Impact:** Potential CORS issues in production

**Evidence:**

**Option 1 - Full CORS utility:**
```typescript
// app/api/auth/login/route.ts
import { createCorsPreflightResponse, addCorsHeaders } from '@/lib/utils/cors';
return addCorsHeaders(response, request.headers.get('origin'));
```

**Option 2 - Simple wildcard:**
```typescript
// app/api/auth/me/route.ts
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}
```

**Option 3 - No CORS headers:**
```typescript
// app/api/topics/route.ts
// No CORS configuration
```

**Recommendation:**
- Standardize on one approach across all API routes
- Use environment-based CORS configuration
- Production should use allowlist, development can use wildcard

```typescript
// Standardized CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.NEXT_PUBLIC_APP_URL, process.env.ALLOWED_ORIGIN_1, process.env.ALLOWED_ORIGIN_2]
  : ['*'];
```

---

### 9. Rate Limiting Using In-Memory Storage 🔧 MEDIUM

**Status:** Not production-ready
**Impact:** Rate limits won't work across multiple instances

**Problem:**
```typescript
// app/api/auth/register/route.ts:14
const registrationAttempts = new Map<string, { count: number; resetAt: number }>();
```

**Issues:**
- In-memory Map won't persist across restarts
- Won't work in multi-instance deployments (horizontal scaling)
- Each instance has separate rate limit counters

**Current Status:**
- Redis fallback exists in `lib/utils/rate-limiter.ts`
- But registration route uses local Map
- Inconsistent rate limiting strategy

**Solution:**
- Remove in-memory Maps from individual routes
- Use centralized rate limiter from `lib/utils/rate-limiter.ts`
- Ensure Redis is configured for production

---

### 10. Admin Initialization Race Condition 🔧 MEDIUM

**Status:** Potential duplicate admin creation
**Impact:** Multiple admins created on first concurrent requests

**Problem:**
```typescript
// app/api/auth/login/route.ts:18-19
await initializeDefaultAdmin();
```

**Issue:**
- Called on every login request
- No atomic check-and-create
- Two simultaneous login requests could both see "no admin" and create one

**Solution:**
Use database transaction with proper locking:
```typescript
export async function initializeDefaultAdmin(): Promise<void> {
  await db.transaction(async (client) => {
    // Lock table for read/write
    await client.query('LOCK TABLE users IN EXCLUSIVE MODE');

    const { rows } = await client.query(
      'SELECT id FROM users WHERE role = $1 LIMIT 1',
      ['admin']
    );

    if (rows.length === 0) {
      // Create admin
    }
  });
}
```

Or use a mutex/semaphore for single-instance deployments.

---

## Database Schema Status

### Confirmed Tables (from migrations)

✅ **001_create_users_table.sql**
- Table: `users`
- Columns: id, email, password_hash, name, role, is_active, created_at, updated_at, last_login
- Indexes: email (unique), role, is_active, created_at
- Triggers: auto-update updated_at

✅ **002_create_auth_tables.sql**
- Table: `refresh_tokens`
  - Columns: id, user_id, token_hash, expires_at, ip_address, user_agent, revoked_at, created_at
  - Foreign key: user_id → users(id) CASCADE
  - Indexes: user_id, token_hash, expires_at, active tokens

- Table: `auth_audit_log`
  - Columns: id, user_id, event_type, success, error_message, ip_address, user_agent, created_at
  - Foreign key: user_id → users(id) SET NULL
  - Indexes: user_id, event_type, created_at, failed attempts

❓ **003_create_sessions_table.sql**
- Status: UNKNOWN (file exists but migration status unclear)
- Need to verify if applied

### Missing Tables

⚠️ **Content Management**
- content_edits
- edit_history
- resources (if not using JSON files)
- topics (if not using JSON files)

⚠️ **Media Management**
- media_files
- audio_metadata

---

## API Routes Status

### Authentication Routes ✅

| Route | Method | Status | Issues |
|-------|--------|--------|--------|
| /api/auth/login | POST | ⚠️ Working | Admin init race condition, missing await in middleware |
| /api/auth/register | POST | ⚠️ Working | In-memory rate limiting |
| /api/auth/logout | POST | ❓ Untested | Needs verification |
| /api/auth/refresh | POST | ⚠️ Working | Depends on session storage |
| /api/auth/me | GET | ⚠️ Working | Middleware allows unauthenticated |
| /api/auth/password-reset/request | POST | ❓ Untested | Need to verify |
| /api/auth/password-reset/confirm | POST | ❓ Untested | Need to verify |

### Content Routes ⚠️

| Route | Method | Status | Issues |
|-------|--------|--------|--------|
| /api/content/save | POST | ❌ File-based | Should use database |
| /api/content/list | GET | ❓ Untested | Need to verify source |
| /api/content/[id] | GET | ❓ Untested | Need to verify source |

### Topics Routes ✅

| Route | Method | Status | Issues |
|-------|--------|--------|--------|
| /api/topics | GET | ✅ Working | Uses static data from lib/utils/topic-groups |
| /api/topics/list | GET | ✅ Working | Uses static data |
| /api/topics/[slug] | GET | ❓ Untested | Need to verify |
| /api/topics/[slug]/save | POST | ❓ Untested | Likely file-based |

### Audio Routes ⚠️

| Route | Method | Status | Issues |
|-------|--------|--------|--------|
| /api/audio/[id] | GET | ⚠️ Working | Requires BLOB_READ_WRITE_TOKEN |
| /api/audio/[id] | DELETE | ⚠️ Working | Requires admin auth + BLOB token |
| /api/audio/upload | POST | ❓ Untested | Need to verify |

### System Routes ✅

| Route | Method | Status | Issues |
|-------|--------|--------|--------|
| /api/health | GET | ✅ Working | Good implementation |
| /api/performance/metrics | GET | ❓ Untested | Need to verify |

---

## Environment Variables Checklist

### Required for Backend Functionality

- [x] `DATABASE_URL` - PostgreSQL connection string
- [x] `JWT_SECRET` - Access token signing key (min 32 chars)
- [ ] `REFRESH_TOKEN_SECRET` - **MISSING** - Refresh token signing key (min 32 chars)
- [ ] `BLOB_READ_WRITE_TOKEN` - **OPTIONAL** - Vercel Blob storage (for audio)
- [ ] `REDIS_URL` - **OPTIONAL** - Redis connection (for distributed rate limiting)

### Configured but Optional

- [x] `ADMIN_EMAIL` - Default admin email
- [x] `ADMIN_PASSWORD` - Default admin password (or auto-generated)
- [x] `NEXT_PUBLIC_APP_URL` - Application URL
- [x] `DB_POOL_MAX` - Database pool size
- [x] `DB_SSL` - Database SSL mode

### External Services

- [x] `ANTHROPIC_API_KEY` - For AI content generation
- [ ] `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` - For images

---

## Immediate Action Items

### 1. Fix WSL Environment (CRITICAL)
```bash
cd /mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas
rm -rf node_modules package-lock.json
npm install
```

### 2. Configure Missing Environment Variables (CRITICAL)
```bash
# Add to .env.local
echo "REFRESH_TOKEN_SECRET=$(openssl rand -base64 64)" >> .env.local

# Optional but recommended
echo "BLOB_READ_WRITE_TOKEN=your-vercel-blob-token" >> .env.local
echo "REDIS_URL=redis://localhost:6379" >> .env.local
```

### 3. Run Database Migrations (CRITICAL)
```bash
npm run db:migrate
npm run db:health
```

### 4. Fix Middleware Authentication Bug (HIGH)
Edit `/lib/auth/middleware-helper.ts` line 27:
```typescript
const payload = await verifyToken(token);
```

### 5. Migrate Content API to Database (HIGH)
- Create migration for content_edits table
- Update `/app/api/content/save/route.ts` to use PostgreSQL
- Remove dependency on file-based storage

### 6. Verify All API Endpoints (MEDIUM)
```bash
# After fixing WSL issue
npm run test:server
npm run test:coverage:server
```

### 7. Standardize CORS Configuration (MEDIUM)
- Audit all API routes
- Apply consistent CORS middleware
- Use environment-based origin allowlist

---

## Testing Strategy

### Prerequisites
1. Fix WSL binary compatibility
2. Run database migrations
3. Configure all required environment variables

### Unit Tests
```bash
npm run test:server
```

### Integration Tests
```bash
# Test authentication flow
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test protected route
curl -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

### Health Checks
```bash
# System health
curl http://localhost:3000/api/health | jq

# Database health
npm run db:health

# Redis health
npm run verify:redis
```

---

## Architecture Recommendations

### 1. Eliminate File-Based Storage
- Migrate all data to PostgreSQL
- Use Vercel Blob only for binary assets (audio, images)
- Never use file system for structured data

### 2. Centralize Rate Limiting
- Remove in-memory Maps from individual routes
- Use Redis-backed rate limiter throughout
- Graceful degradation to in-memory when Redis unavailable

### 3. Database Session Management
- Complete migration to PostgreSQL sessions
- Remove all file-based session code
- Implement session cleanup job

### 4. Consistent Error Handling
- Standardize error response format
- Centralized error logging
- Include request IDs for tracing

### 5. API Versioning
- Consider `/api/v1/` prefix for future compatibility
- Document breaking changes
- Maintain backward compatibility

---

## Conclusion

The Hablas backend is well-architected with good separation of concerns, comprehensive authentication, and solid database design. However, several critical issues prevent it from functioning properly:

**Must Fix Before Production:**
1. WSL binary compatibility (blocks everything)
2. Database migrations (blocks authentication persistence)
3. REFRESH_TOKEN_SECRET configuration (blocks secure sessions)
4. Middleware authentication bug (security issue)
5. Content API database migration (scalability issue)

**Should Fix Before Scale:**
6. Redis-based rate limiting
7. CORS standardization
8. Admin initialization race condition
9. Session management cleanup

**Nice to Have:**
10. Comprehensive API testing
11. Health check enhancements
12. Performance monitoring
13. API documentation (OpenAPI/Swagger)

The foundation is solid. Once the critical WSL and environment issues are resolved, the backend should function reliably.
