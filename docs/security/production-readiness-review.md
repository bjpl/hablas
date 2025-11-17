# Production Readiness Security Review
**Hablas Application - Security Audit Report**

**Date:** 2025-11-17
**Reviewer:** Security Review Agent
**Application:** Hablas Language Learning Platform
**Status:** Production Deployment Candidate

---

## Executive Summary

This security review assesses the Hablas application's readiness for production deployment. The application demonstrates **strong security fundamentals** with well-implemented authentication, authorization, and data protection mechanisms. However, several **critical improvements** are required before production deployment.

### Overall Security Score: 7.5/10

**Strengths:**
- Robust JWT-based authentication with Edge runtime support
- Comprehensive role-based access control (RBAC)
- Strong password policies and validation
- Rate limiting implementation (both in-memory and Redis-ready)
- SQL injection prevention through parameterized queries
- Proper session management with token blacklisting

**Critical Issues to Address:**
- Default/fallback secrets in session management
- Sensitive data logging in production
- File-based user storage (not suitable for production scale)
- Missing database SSL enforcement in production
- Incomplete environment variable validation

---

## 1. Authentication Security

### 1.1 JWT Implementation ✅ EXCELLENT

**File:** `lib/auth/jwt.ts`

**Strengths:**
- Uses `jose` library for Edge runtime compatibility
- Proper token expiration handling (7 days default, 30 days with remember-me)
- Token refresh mechanism with threshold (24 hours)
- Secure secret validation (minimum 32 characters)
- Proper algorithm selection (HS256)

**Code Analysis:**
```typescript
// ✅ Secure secret validation
const JWT_SECRET = SECURITY_CONFIG.JWT.getSecret();
if (secret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

// ✅ Proper token generation
await new SignJWT({ userId, email, role })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime(expirySeconds)
  .sign(secretKey);
```

**Recommendations:**
- ✅ Already implements best practices
- Consider adding token rotation policy documentation

---

### 1.2 Session Management 🔴 CRITICAL ISSUE

**File:** `lib/auth/session.ts`

**Critical Security Flaw:**
```typescript
// ❌ CRITICAL: Hardcoded fallback secret
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ||
  'your-refresh-token-secret-change-in-production';
```

**Impact:** HIGH
- If `REFRESH_TOKEN_SECRET` is not set, a known default is used
- Attackers could forge refresh tokens in production
- Complete session hijacking possible

**Required Fix:**
```typescript
// ✅ SECURE: Fail-fast in production
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
if (!REFRESH_TOKEN_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('REFRESH_TOKEN_SECRET must be set in production');
  }
  console.error('⚠️ CRITICAL: Using default refresh token secret in development');
}
```

**Additional Issues:**
- File-based session storage (`data/sessions.json`) not suitable for production
- No session persistence across server restarts
- No distributed session support for horizontal scaling

**Recommendations:**
1. **CRITICAL:** Add refresh token secret validation
2. Migrate to PostgreSQL-based session storage
3. Implement Redis for session caching
4. Add session cleanup scheduled job

---

### 1.3 Password Security ✅ STRONG

**File:** `lib/auth/users.ts`, `lib/auth/validation.ts`

**Strengths:**
- BCrypt with 10 salt rounds
- Comprehensive password policy:
  - Minimum 8 characters
  - Requires uppercase, lowercase, number, special character
  - Maximum 100 characters (DoS prevention)
- Zod schema validation with detailed error messages
- Password comparison using constant-time bcrypt

**Code Analysis:**
```typescript
// ✅ Strong password validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain special character');

// ✅ Secure hashing
const SALT_ROUNDS = 10;
await bcrypt.hash(password, SALT_ROUNDS);
```

**Recommendations:**
- Consider adding password breach checking (HaveIBeenPwned API)
- Add password history to prevent reuse

---

### 1.4 Admin Account Initialization ⚠️ WARNING

**File:** `lib/auth/users.ts`, `lib/config/security.ts`

**Security Concerns:**
```typescript
// ⚠️ Logs auto-generated password in production
if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) {
  const password = this.generateSecurePassword();
  console.log('🔐 Generated secure admin password:', password);
  console.log('⚠️ SAVE THIS PASSWORD - it will not be shown again!');
}
```

**Issues:**
- Password logged to console/logs in production
- Logs may be persisted in cloud logging systems
- Security risk if logs are accessible

**Recommendations:**
1. Remove password from console logs in production
2. Send password via secure channel (email, secrets manager)
3. Force password change on first login
4. Document secure password initialization process

---

## 2. Authorization & Access Control

### 2.1 Role-Based Access Control (RBAC) ✅ EXCELLENT

**File:** `lib/auth/middleware-helper.ts`, `middleware.ts`

**Strengths:**
- Three-tier role hierarchy: admin > editor > viewer
- Granular permission checks
- Route-based authorization in middleware
- Proper role validation before protected operations

**Code Analysis:**
```typescript
// ✅ Role hierarchy properly implemented
const roleHierarchy = { admin: 3, editor: 2, viewer: 1 };
const userRoleLevel = roleHierarchy[authResult.role];
const requiredRoleLevel = roleHierarchy[requiredRole];

if (userRoleLevel < requiredRoleLevel) {
  throw new Error(`Insufficient permissions. Required: ${requiredRole}`);
}

// ✅ Granular permission checks
export async function checkPermission(
  request: NextRequest,
  permission: 'canEdit' | 'canApprove' | 'canDelete' | 'canViewDashboard' | 'canManageUsers'
): Promise<boolean>
```

**Recommendations:**
- ✅ Implementation is secure and well-designed
- Consider adding audit logging for permission checks

---

### 2.2 Middleware Protection ✅ STRONG

**File:** `middleware.ts`

**Strengths:**
- Edge runtime compatible
- Token blacklist checking
- Automatic token refresh
- Route-based access control
- Proper redirect handling with original URL preservation

**Code Analysis:**
```typescript
// ✅ Token blacklist check
const blacklisted = await isTokenBlacklisted(token);
if (blacklisted) {
  return NextResponse.redirect(loginUrl);
}

// ✅ Role-based route protection
if (routeConfig.allowedRoles &&
    !hasRequiredRole(payload.role, routeConfig.allowedRoles)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

**Recommendations:**
- Add rate limiting to middleware
- Consider adding IP-based blocking for suspicious activity

---

## 3. Rate Limiting

### 3.1 Implementation ✅ GOOD

**File:** `lib/utils/rate-limiter.ts`

**Strengths:**
- Dual-mode: in-memory (development) and Redis (production)
- Per-endpoint rate limits:
  - Login: 5 attempts / 15 minutes
  - API: 100 requests / 1 minute
  - Password Reset: 3 attempts / 1 hour
  - Registration: 3 attempts / 1 hour
- Automatic cleanup of expired entries
- Graceful fallback to memory store on Redis failure

**Code Analysis:**
```typescript
// ✅ Configurable rate limits
export const RATE_LIMIT_CONFIG = {
  LOGIN: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000,
    LOCKOUT_DURATION_MS: 15 * 60 * 1000,
    MESSAGE: 'Too many login attempts. Please try again later.',
  },
  // ... other limits
}

// ✅ Fallback handling
if (redisClient) {
  return checkRedisRateLimit(key, config);
}
return checkMemoryRateLimit(key, config);
```

**Weaknesses:**
- In-memory store not suitable for production with multiple instances
- No distributed rate limiting without Redis
- No IP blocking after repeated violations

**Recommendations:**
1. **REQUIRED:** Configure Redis for production
2. Add IP-based blocking mechanism
3. Implement progressive delays (exponential backoff)
4. Add monitoring/alerting for rate limit violations

---

## 4. Database Security

### 4.1 Connection Pool Configuration ⚠️ NEEDS IMPROVEMENT

**File:** `lib/db/pool.ts`

**Security Issues:**
```typescript
// ⚠️ SSL not enforced in production
ssl: process.env.DB_SSL === 'true' ?
  { rejectUnauthorized: false } : false
```

**Problems:**
- SSL disabled by default (should be enabled in production)
- `rejectUnauthorized: false` bypasses certificate validation
- Allows man-in-the-middle attacks on database connections

**Required Fix:**
```typescript
// ✅ SECURE: Enforce SSL in production
ssl: process.env.NODE_ENV === 'production' ?
  {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CA
  } :
  (process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false)
```

**Additional Improvements Needed:**
```typescript
// Add connection validation
private validateConfig(): void {
  if (process.env.NODE_ENV === 'production') {
    if (!this.config.connectionString && !this.config.password) {
      throw new Error('Database credentials required in production');
    }

    if (!this.config.ssl) {
      console.error('⚠️ WARNING: Database SSL not enabled in production');
    }
  }
}
```

**Recommendations:**
1. **CRITICAL:** Enforce SSL in production
2. Use proper SSL certificate validation
3. Add connection pool monitoring
4. Implement connection retry logic with exponential backoff
5. Add query timeout configuration

---

### 4.2 SQL Injection Prevention ✅ EXCELLENT

**File:** `lib/db/pool.ts`, `database/migrations/*.sql`

**Strengths:**
- Parameterized queries throughout
- No string concatenation for SQL
- Proper use of PostgreSQL placeholders
- Transaction support with proper rollback

**Code Analysis:**
```typescript
// ✅ Parameterized queries
async query<T>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const result = await pool.query<T>(text, params);
  // No SQL concatenation anywhere
}

// ✅ Transaction safety
async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
  await client.query('BEGIN');
  const result = await callback(client);
  await client.query('COMMIT');
}
```

**Recommendations:**
- ✅ Current implementation is secure
- Consider adding query logging for debugging (non-production)

---

### 4.3 Migration Scripts ✅ GOOD

**Files:** `database/migrations/001_create_users_table.sql`, `002_create_auth_tables.sql`

**Strengths:**
- Proper constraints and foreign keys
- Index optimization for common queries
- Audit trail tables for authentication events
- Proper data types and validation

**Code Analysis:**
```sql
-- ✅ Proper constraints
CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
CONSTRAINT chk_password_length CHECK (length(password) >= 8),

-- ✅ Security indexes
CREATE INDEX idx_refresh_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_audit_failed ON auth_audit_log(success, event_type) WHERE success = false;

-- ✅ Audit logging
CREATE TABLE auth_audit_log (
  event_type VARCHAR(50) NOT NULL,
  success BOOLEAN DEFAULT false,
  ip_address VARCHAR(45),
  -- ...
);
```

**Recommendations:**
- Add row-level security policies for multi-tenancy (if needed)
- Consider adding encrypted columns for PII

---

## 5. Data Protection

### 5.1 User Data Storage 🔴 CRITICAL ISSUE

**File:** `lib/auth/users.ts`

**Critical Security Flaw:**
```typescript
// ❌ CRITICAL: File-based user storage
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
```

**Problems:**
- User data stored in JSON files (not encrypted at rest)
- No transaction support
- No concurrent access control
- File permissions depend on filesystem
- Not scalable for production
- Backup/recovery challenges

**Required Action:**
**MUST migrate to PostgreSQL before production deployment**

**Migration Plan:**
1. Create `users` table migration (already exists)
2. Update `lib/auth/users.ts` to use database pool
3. Migrate existing data from JSON to PostgreSQL
4. Remove file-based storage code
5. Update tests to use database

**Temporary Mitigation (if database migration delayed):**
```typescript
// ⚠️ Temporary: Encrypt file-based storage
import { createCipheriv, createDecipheriv } from 'crypto';

const ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

async function encryptData(data: string): Promise<string> {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  // ... encryption logic
}
```

---

### 5.2 Session Data Storage 🔴 CRITICAL ISSUE

**File:** `lib/auth/session.ts`

**Same Issues as User Storage:**
- File-based storage (`data/sessions.json`, `data/token-blacklist.json`)
- Not suitable for production
- No distributed support

**Required Action:**
Use database tables from migration `002_create_auth_tables.sql`:
- `refresh_tokens` table
- `auth_audit_log` table

---

### 5.3 Sensitive Data Logging ⚠️ WARNING

**Files:** Multiple

**Issues Found:**
```typescript
// ⚠️ Password logged in production
console.log('🔐 Generated secure admin password:', password);

// ⚠️ Token logged in development
console.log('Reset Link:', `...?token=${resetToken}`);

// ⚠️ Query parameters logged
console.warn(`Slow query (${duration}ms):`, text.substring(0, 100));
```

**Recommendations:**
1. Remove password logging completely
2. Add log sanitization function
3. Use log levels (debug, info, warn, error)
4. Configure production logging to exclude sensitive fields

**Secure Logging Pattern:**
```typescript
// ✅ SECURE: Sanitize logs
function sanitizeForLog(data: any): any {
  const sensitive = ['password', 'token', 'secret', 'key'];
  const sanitized = { ...data };

  for (const field of sensitive) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}
```

---

## 6. CORS Configuration

### 6.1 Implementation ✅ GOOD

**Files:** `lib/utils/cors.ts`, `lib/config/security.ts`

**Strengths:**
- Environment-based origin validation
- Production: Whitelist-only
- Development: Permissive for testing
- Proper preflight handling
- Credentials support

**Code Analysis:**
```typescript
// ✅ Production origin validation
if (process.env.NODE_ENV === 'production') {
  if (origin && SECURITY_CONFIG.CORS.isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else {
    return {}; // Reject disallowed origins
  }
}
```

**Recommendations:**
1. Add wildcard subdomain support (e.g., `*.hablas.co`)
2. Document allowed origins in deployment guide
3. Add monitoring for rejected CORS requests

---

## 7. Environment Variables

### 7.1 Configuration ⚠️ NEEDS IMPROVEMENT

**File:** `.env.example`

**Issues:**
```bash
# ⚠️ Weak example that might be copied
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production...

# ⚠️ No refresh token secret documented
# Missing: REFRESH_TOKEN_SECRET

# ⚠️ Optional Redis but critical for production
REDIS_URL=
```

**Recommendations:**
1. Add `REFRESH_TOKEN_SECRET` to `.env.example`
2. Add validation script to check required environment variables
3. Create separate `.env.production.example`
4. Add comments explaining security requirements

**Environment Variable Validation Script:**
```typescript
// scripts/validate-env.ts
const required = {
  production: [
    'JWT_SECRET',
    'REFRESH_TOKEN_SECRET',
    'DATABASE_URL',
    'REDIS_URL',
    'ADMIN_EMAIL',
  ],
  development: [
    'JWT_SECRET',
    'DATABASE_URL',
  ],
};

function validateEnv() {
  const env = process.env.NODE_ENV || 'development';
  const missing = required[env].filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables for ${env}:`);
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  // Validate secret lengths
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters');
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}
```

---

## 8. Security Headers

### 8.1 Implementation ✅ GOOD

**File:** `lib/config/security.ts`

**Strengths:**
```typescript
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', // Production only
}
```

**Missing Headers:**
- `Content-Security-Policy` (CSP)
- `X-Permitted-Cross-Domain-Policies`

**Recommendations:**
1. Add comprehensive CSP:
```typescript
'Content-Security-Policy': [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.anthropic.com",
  "frame-ancestors 'none'",
].join('; ')
```

2. Add headers to `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: Object.entries(SECURITY_HEADERS).map(([key, value]) => ({
        key,
        value,
      })),
    },
  ];
}
```

---

## 9. API Security

### 9.1 Input Validation ✅ EXCELLENT

**Files:** `lib/auth/validation.ts`, API routes

**Strengths:**
- Zod schema validation throughout
- Type-safe validation
- Detailed error messages
- Email normalization
- SQL injection prevention

**Code Analysis:**
```typescript
// ✅ Comprehensive validation
export const registerSchema = z.object({
  email: emailSchema, // Validated, trimmed, lowercased
  password: passwordSchema, // Complex requirements
  confirmPassword: z.string(),
  name: z.string().min(2).max(100).trim(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ✅ Safe validation function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown) {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err =>
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}
```

**Recommendations:**
- ✅ Current implementation is excellent
- Consider adding request size limits

---

### 9.2 Error Handling ✅ GOOD

**Analysis Across API Routes:**

**Strengths:**
- Generic error messages to prevent information leakage
- Detailed logging for debugging
- Proper HTTP status codes
- Try-catch blocks throughout

**Code Analysis:**
```typescript
// ✅ Safe error responses
} catch (error) {
  console.error('Login error:', error); // Detailed logging
  return NextResponse.json(
    { success: false, error: 'Internal server error' }, // Generic to user
    { status: 500 }
  );
}

// ✅ Specific error codes
if (!rateLimit.allowed) {
  return NextResponse.json(
    { error: rateLimit.error, remaining: 0, resetAt: rateLimit.resetAt },
    { status: 429 }
  );
}
```

**Recommendations:**
- Add error tracking service integration (Sentry, etc.)
- Create error sanitization middleware
- Add request ID for error tracing

---

### 9.3 Authentication on API Routes ⚠️ PARTIAL

**Analysis:**

**Protected Routes:** ✅
- `/api/auth/me` - Requires authentication
- `/api/content/save` - Should require authentication
- `/api/content/[id]` - Should require authentication

**Missing Protection:**
```typescript
// ❌ /api/content/save - No auth check
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // No authentication check!
    // Anyone can save content
```

**Required Fix:**
```typescript
// ✅ Add authentication
import { requireAuth } from '@/lib/auth/middleware-helper';

export async function POST(request: NextRequest) {
  // Check authentication
  const authResult = await requireAuth(request);

  // Check authorization
  if (authResult.role !== 'admin' && authResult.role !== 'editor') {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  // ... rest of handler
}
```

---

## 10. Production Deployment Checklist

### 10.1 Critical Requirements (MUST FIX)

- [ ] **Add REFRESH_TOKEN_SECRET environment variable**
- [ ] **Remove hardcoded fallback for REFRESH_TOKEN_SECRET**
- [ ] **Migrate user storage from JSON files to PostgreSQL**
- [ ] **Migrate session storage from JSON files to PostgreSQL**
- [ ] **Enable and enforce SSL for database connections**
- [ ] **Configure Redis for distributed rate limiting**
- [ ] **Remove password logging from admin initialization**
- [ ] **Add authentication to `/api/content/save` route**
- [ ] **Add authentication to all content API routes**
- [ ] **Validate all required environment variables on startup**

### 10.2 High Priority (SHOULD FIX)

- [ ] Add Content Security Policy headers
- [ ] Implement environment variable validation script
- [ ] Add session cleanup scheduled job
- [ ] Configure production logging (exclude sensitive data)
- [ ] Add error tracking service (Sentry, etc.)
- [ ] Document deployment environment variables
- [ ] Add IP-based blocking for rate limit violations
- [ ] Implement password breach checking
- [ ] Add audit logging for all admin actions
- [ ] Configure database connection pool monitoring

### 10.3 Recommended Improvements

- [ ] Add API request/response logging middleware
- [ ] Implement request ID tracking
- [ ] Add health check endpoint with authentication
- [ ] Configure automated security scanning (Snyk, etc.)
- [ ] Add database backup automation
- [ ] Implement log rotation and retention
- [ ] Add monitoring and alerting (DataDog, New Relic, etc.)
- [ ] Create incident response playbook
- [ ] Configure WAF (Web Application Firewall)
- [ ] Add DDoS protection (Cloudflare, etc.)

---

## 11. Security Best Practices Compliance

| Security Practice | Status | Notes |
|------------------|--------|-------|
| **Authentication** | ✅ Excellent | JWT with proper expiry and refresh |
| **Authorization** | ✅ Excellent | RBAC with role hierarchy |
| **Password Security** | ✅ Strong | BCrypt + strong policy |
| **Session Management** | 🔴 Critical | File-based storage, default secrets |
| **Input Validation** | ✅ Excellent | Zod schemas throughout |
| **SQL Injection Prevention** | ✅ Excellent | Parameterized queries |
| **XSS Prevention** | ✅ Good | React auto-escaping + CSP needed |
| **CSRF Protection** | ✅ Good | SameSite cookies + token validation |
| **Rate Limiting** | ⚠️ Partial | Needs Redis for production |
| **Data Encryption** | 🔴 Critical | No encryption at rest for files |
| **Database Security** | ⚠️ Partial | SSL not enforced |
| **CORS** | ✅ Good | Environment-based validation |
| **Security Headers** | ✅ Good | Missing CSP |
| **Error Handling** | ✅ Good | Generic messages, detailed logging |
| **Logging** | ⚠️ Warning | Sensitive data in logs |

---

## 12. Recommended Security Tools

### 12.1 Runtime Security
- **Helmet.js** - Additional security headers
- **Express Rate Limit** - Enhanced rate limiting
- **CORS** - Advanced CORS configuration

### 12.2 Development Security
- **Snyk** - Dependency vulnerability scanning
- **ESLint Security Plugin** - Code security linting
- **npm audit** - Regular dependency audits
- **git-secrets** - Prevent committing secrets

### 12.3 Production Monitoring
- **Sentry** - Error tracking and performance
- **DataDog** - Application monitoring
- **CloudFlare** - DDoS protection and WAF
- **AWS GuardDuty** - Threat detection

---

## 13. Immediate Action Items

### Week 1 (Critical)
1. Add `REFRESH_TOKEN_SECRET` to production environment
2. Remove fallback secrets from code
3. Enable database SSL enforcement
4. Remove password from console logs
5. Add authentication to content API routes

### Week 2 (High Priority)
6. Migrate user storage to PostgreSQL
7. Migrate session storage to PostgreSQL
8. Configure Redis for production
9. Add environment variable validation
10. Implement CSP headers

### Week 3 (Recommended)
11. Add error tracking service
12. Configure production logging
13. Add IP-based rate limit blocking
14. Implement database backup automation
15. Add monitoring and alerting

---

## 14. Security Contacts

### Vulnerability Reporting
- **Email:** security@hablas.co
- **Response Time:** 24 hours for critical issues

### Security Review Schedule
- **Pre-deployment:** Complete (this review)
- **Post-deployment:** 1 week after launch
- **Regular:** Quarterly security audits
- **Penetration Testing:** Annually

---

## 15. Conclusion

The Hablas application demonstrates **strong security fundamentals** with well-implemented authentication and authorization. However, **several critical issues must be addressed before production deployment**, particularly:

1. **File-based storage migration** - Critical security and scalability issue
2. **Secret management** - Remove hardcoded fallbacks
3. **Database SSL** - Enforce encrypted connections
4. **API authentication** - Protect content endpoints

With these issues resolved, the application will be production-ready with a robust security posture.

### Recommended Timeline
- **Fix Critical Issues:** 1-2 weeks
- **Production Deployment:** After critical fixes verified
- **Monitoring Setup:** Concurrent with deployment
- **Security Audit:** 1 week post-deployment

---

**Review Completed:** 2025-11-17
**Next Review:** Post-deployment (scheduled)
**Reviewed By:** Security Review Agent
**Classification:** Internal - Security Sensitive

---

## Appendix A: Environment Variables Reference

### Required for Production
```bash
# Authentication (CRITICAL)
JWT_SECRET=<64-char-random-string>
REFRESH_TOKEN_SECRET=<64-char-random-string>
ADMIN_EMAIL=admin@hablas.co
ADMIN_PASSWORD=<strong-password-or-auto-generate>

# Database (CRITICAL)
DATABASE_URL=postgresql://user:pass@host:5432/hablas?sslmode=require
DB_SSL=true

# Redis (CRITICAL for scale)
REDIS_URL=redis://redis-host:6379
REDIS_PASSWORD=<redis-password>

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://hablas.co
ALLOWED_ORIGIN_1=https://www.hablas.co

# APIs
ANTHROPIC_API_KEY=<api-key>
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=<access-key>
```

### Generating Secure Secrets
```bash
# Generate JWT_SECRET (64 characters)
openssl rand -base64 48

# Generate REFRESH_TOKEN_SECRET (64 characters)
openssl rand -base64 48

# Generate ADMIN_PASSWORD (20 characters)
openssl rand -base64 32 | tr -d "=+/" | cut -c1-20
```

---

## Appendix B: Secure Deployment Commands

```bash
# 1. Validate environment variables
npm run validate-env

# 2. Run security audit
npm audit --production

# 3. Run migrations
npm run migrate:production

# 4. Build for production
NODE_ENV=production npm run build

# 5. Start with health check
npm run start:production

# 6. Verify deployment
curl -s https://hablas.co/api/health | jq .
```
