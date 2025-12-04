# Backend Quick Fixes - Priority Order

## CRITICAL - Fix Immediately (Blocking All Backend Functionality)

### 1. Fix WSL Binary Compatibility (5 minutes)
```bash
cd /mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas
rm -rf node_modules package-lock.json
npm install
```

**Why:** Cannot run any server scripts, tests, or migrations until this is fixed.

---

### 2. Add Missing Environment Variable (1 minute)
```bash
# Add to .env.local
echo "REFRESH_TOKEN_SECRET=$(openssl rand -base64 64)" >> .env.local
```

**Why:** Sessions won't persist, users logged out on restart.

---

### 3. Run Database Migrations (2 minutes)
```bash
npm run db:migrate
npm run db:health
```

**Why:** Sessions table not created, authentication persistence broken.

---

## HIGH PRIORITY - Fix Before Testing (Security & Functionality)

### 4. Fix Middleware Authentication Bug (2 minutes)

**File:** `/lib/auth/middleware-helper.ts`
**Line:** 27

```typescript
// BEFORE (BUG)
const payload = verifyToken(token);

// AFTER (FIXED)
const payload = await verifyToken(token);
```

**Why:** Authentication checks always pass (security vulnerability).

---

### 5. Migrate Content API to Database (30 minutes)

**Files to update:**
- `/app/api/content/save/route.ts`
- Create database migration for `content_edits` table

**Why:** File-based storage doesn't work in production, can't scale.

---

## MEDIUM PRIORITY - Fix Before Production

### 6. Centralize Rate Limiting (15 minutes)

**File:** `/app/api/auth/register/route.ts`
**Lines:** 14-55

Replace in-memory Map with:
```typescript
import { checkRateLimit, resetRateLimit } from '@/lib/utils/rate-limiter';
```

**Why:** In-memory rate limits don't work across multiple instances.

---

### 7. Fix Admin Initialization Race Condition (10 minutes)

**File:** `/lib/auth/users.ts` (assumed location of initializeDefaultAdmin)

Add database transaction with locking:
```typescript
await db.transaction(async (client) => {
  await client.query('LOCK TABLE users IN EXCLUSIVE MODE');
  // Check and create admin
});
```

**Why:** Concurrent requests can create duplicate admins.

---

### 8. Standardize CORS (20 minutes)

Apply consistent CORS to all API routes:
```typescript
import { createCorsPreflightResponse, addCorsHeaders } from '@/lib/utils/cors';
return addCorsHeaders(response, request.headers.get('origin'));
```

**Files:**
- `/app/api/topics/route.ts`
- `/app/api/content/*/route.ts`
- All routes missing CORS

**Why:** Inconsistent CORS can break production deployments.

---

## LOW PRIORITY - Nice to Have

### 9. Add Blob Token Validation (5 minutes)

**File:** `/app/api/health/route.ts`

Add check:
```typescript
checks.blobStorage = {
  status: process.env.BLOB_READ_WRITE_TOKEN ? 'configured' : 'missing',
};
```

---

### 10. Verify Redis Fallback (15 minutes)

Audit all rate limiters:
```bash
grep -r "getRedisClient" lib/
```

Ensure all handle null return value properly.

---

## Verification Commands

After each fix, run:
```bash
# Health check
curl http://localhost:3000/api/health | jq

# Test authentication
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Run tests
npm run test:server
```

---

## Complete Fix Sequence (Copy-Paste)

```bash
# 1. Fix WSL (5 min)
cd /mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas
rm -rf node_modules package-lock.json
npm install

# 2. Add environment variable (1 min)
echo "REFRESH_TOKEN_SECRET=$(openssl rand -base64 64)" >> .env.local

# 3. Run migrations (2 min)
npm run db:migrate
npm run db:health

# 4. Verify
npm run dev
curl http://localhost:3000/api/health | jq
```

Then manually fix the middleware authentication bug (step 4).

---

## Expected Outcome

After critical fixes (1-3):
- ✅ Server scripts run successfully
- ✅ Database migrations applied
- ✅ Sessions persist across restarts
- ✅ Tests can execute

After high priority fixes (4-5):
- ✅ Authentication works correctly
- ✅ Content API uses database
- ✅ All backend tests pass

After medium priority fixes (6-8):
- ✅ Production-ready rate limiting
- ✅ No admin duplication
- ✅ Consistent CORS behavior
- ✅ Ready for multi-instance deployment
