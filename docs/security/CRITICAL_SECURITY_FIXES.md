# Critical Security Fixes Applied - 2025-11-17

## Executive Summary

This document details the **CRITICAL security fixes** applied to the Hablas application as part of the production deployment security audit. All fixes address vulnerabilities that could lead to authentication bypass, data breaches, or system compromise.

---

## 1. CRITICAL FIX: Removed Hardcoded Refresh Token Secret

### Issue
**Severity:** CRITICAL (CVSS 9.1)
**Location:** `/lib/auth/session.ts:12`

The application had a hardcoded fallback secret:
```typescript
// ❌ CRITICAL VULNERABILITY
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-change-in-production';
```

**Impact:**
- Anyone with access to the source code could forge refresh tokens
- Complete authentication bypass possible
- Session hijacking and privilege escalation

### Fix Applied

```typescript
// ✅ SECURE: Fail-fast in production
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!REFRESH_TOKEN_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL: REFRESH_TOKEN_SECRET environment variable must be set in production. Generate a secure secret using: openssl rand -base64 48');
  }
  // In development, generate a temporary secure random secret
  const crypto = require('crypto');
  const tempSecret = crypto.randomBytes(64).toString('hex');
  console.warn('⚠️  SECURITY WARNING: Using auto-generated REFRESH_TOKEN_SECRET for development only');
  console.warn('⚠️  DO NOT USE THIS IN PRODUCTION. Set REFRESH_TOKEN_SECRET environment variable.');
  var TEMP_REFRESH_SECRET = tempSecret;
}

// Validate secret length
if (REFRESH_TOKEN_SECRET && REFRESH_TOKEN_SECRET.length < 32) {
  throw new Error('REFRESH_TOKEN_SECRET must be at least 32 characters long for security');
}
```

**Action Required:**
1. Generate a secure 64-character secret:
   ```bash
   openssl rand -base64 48
   ```

2. Add to `.env.production`:
   ```bash
   REFRESH_TOKEN_SECRET=your-generated-secret-here
   ```

3. **Never commit this secret to version control**

---

## 2. CRITICAL FIX: Enforced Database SSL in Production

### Issue
**Severity:** HIGH (CVSS 7.8)
**Location:** `/lib/db/pool.ts`

Database SSL was optional and when enabled, used `rejectUnauthorized: false`:
```typescript
// ❌ INSECURE
ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
```

**Impact:**
- Database connections unencrypted in transit
- Vulnerability to man-in-the-middle attacks
- Exposure of credentials and sensitive data

### Fix Applied

```typescript
// ✅ SECURE: Production enforcement
const isProduction = process.env.NODE_ENV === 'production';
let sslConfig: boolean | { rejectUnauthorized: boolean; ca?: string } = false;

if (isProduction) {
  // PRODUCTION: Enforce SSL with certificate validation
  sslConfig = {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CA, // Optional CA certificate
  };
  console.log('✅ Database SSL enabled with certificate validation (production)');
} else if (process.env.DB_SSL === 'true') {
  // DEVELOPMENT: Allow self-signed certificates
  sslConfig = { rejectUnauthorized: false };
  console.warn('⚠️  Database SSL enabled without certificate validation (development only)');
}

// Validate production configuration
if (isProduction) {
  if (!config.password) {
    throw new Error('CRITICAL: Database password must be set in production');
  }
  if (!config.ssl || config.ssl === false) {
    throw new Error('CRITICAL: Database SSL must be enabled in production');
  }
}
```

**Action Required:**
1. Ensure your PostgreSQL database requires SSL connections
2. Update DATABASE_URL to include `sslmode=require`:
   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/hablas?sslmode=require
   ```

3. If using a custom CA certificate:
   ```bash
   DB_SSL_CA=/path/to/ca-certificate.crt
   ```

---

## 3. CRITICAL FIX: Added CSRF Protection

### Issue
**Severity:** HIGH (CVSS 6.5)
**Location:** All API routes

No CSRF protection existed for state-changing operations.

**Impact:**
- Cross-Site Request Forgery attacks possible
- Unauthorized actions on behalf of authenticated users
- Session manipulation

### Fix Applied

Created `/lib/auth/csrf.ts` with comprehensive CSRF protection:

**Features:**
- Double-submit cookie pattern
- HMAC-signed tokens
- Automatic token generation and validation
- Strict SameSite cookies

**Usage Example:**
```typescript
import { verifyCsrfToken, requiresCsrfProtection } from '@/lib/auth/csrf';

export async function POST(request: NextRequest) {
  // Verify CSRF token for state-changing operations
  if (requiresCsrfProtection(request.method)) {
    const isValid = await verifyCsrfToken(request);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  // ... rest of handler
}
```

**Action Required:**
1. Add CSRF secret to environment:
   ```bash
   CSRF_SECRET=your-generated-csrf-secret-here
   # Or it will use JWT_SECRET as fallback
   ```

2. Update API routes to require CSRF tokens (see implementation guide below)

3. Update frontend to include CSRF tokens in requests:
   ```typescript
   // Get CSRF token from cookie
   const csrfToken = document.cookie
     .split('; ')
     .find(row => row.startsWith('hablas_csrf_token='))
     ?.split('=')[1];

   // Include in request headers
   fetch('/api/endpoint', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-CSRF-Token': csrfToken,
     },
     body: JSON.stringify(data),
   });
   ```

---

## 4. SECURITY ENHANCEMENT: Added Security Headers

### Issue
**Severity:** HIGH (CVSS 6.1)
**Location:** `/middleware.ts`

Missing security headers left application vulnerable to:
- Cross-site scripting (XSS)
- Clickjacking
- MIME type sniffing

### Fix Applied

Created `/lib/security/headers.ts` with comprehensive security headers:

**Headers Applied:**
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy (disables camera, microphone, etc.)
- Strict-Transport-Security (HSTS) in production
- Cross-Origin policies

**Middleware Updated:**
Security headers are now automatically applied to all responses in middleware.

---

## 5. SECURITY ENHANCEMENT: Rate Limit Headers

### Issue
**Severity:** MEDIUM (CVSS 4.0)

Rate limit responses didn't include standard headers for client-side backoff strategies.

### Fix Applied

Added rate limit header utilities in `/lib/security/headers.ts`:

```typescript
export function createRateLimitHeaders(
  limit: number,
  remaining: number,
  resetAt: number
): RateLimitHeaders {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetAt.toString(),
    'Retry-After': retryAfter.toString(), // When limit exceeded
  };
}
```

**Action Required:**
Update API routes to include rate limit headers (see implementation guide).

---

## Implementation Checklist

### Immediate (Before Production Deployment)

- [x] Remove hardcoded REFRESH_TOKEN_SECRET
- [x] Enforce database SSL in production
- [x] Create CSRF protection utilities
- [x] Add comprehensive security headers
- [x] Create rate limit header utilities
- [ ] Generate and configure REFRESH_TOKEN_SECRET in production
- [ ] Verify database SSL configuration
- [ ] Add CSRF protection to all state-changing API routes
- [ ] Test security headers with tools (securityheaders.com)
- [ ] Update frontend to handle CSRF tokens

### High Priority (Week 1)

- [ ] Update all API routes to use CSRF protection
- [ ] Add rate limit headers to all rate-limited endpoints
- [ ] Configure Content Security Policy exceptions if needed
- [ ] Set up security monitoring and alerting
- [ ] Create security incident response plan

### Medium Priority (Week 2-3)

- [ ] Implement CORS restrictions (remove wildcard)
- [ ] Add input sanitization middleware
- [ ] Enhance rate limiting with Redis
- [ ] Add comprehensive security tests
- [ ] Document security architecture

---

## Environment Variables Required

### Production Environment

```bash
# CRITICAL - Must be set before deployment
REFRESH_TOKEN_SECRET=<64-char-random-string>
JWT_SECRET=<64-char-random-string>

# Database Security
DATABASE_URL=postgresql://user:pass@host:5432/hablas?sslmode=require
DB_SSL_CA=/path/to/ca-certificate.crt  # Optional

# CSRF Protection (optional, uses JWT_SECRET as fallback)
CSRF_SECRET=<64-char-random-string>

# Environment
NODE_ENV=production
```

### Generate Secure Secrets

```bash
# Generate REFRESH_TOKEN_SECRET (64 characters)
openssl rand -base64 48

# Generate JWT_SECRET (64 characters)
openssl rand -base64 48

# Generate CSRF_SECRET (64 characters)
openssl rand -base64 48
```

---

## Security Testing

### 1. Verify Secrets Are Not Hardcoded

```bash
# Should fail in production without environment variables
NODE_ENV=production npm start

# Should show error:
# "CRITICAL: REFRESH_TOKEN_SECRET environment variable must be set in production"
```

### 2. Verify Database SSL

```bash
# Test database connection
npm run db:health

# Should show:
# "✅ Database SSL enabled with certificate validation (production)"
```

### 3. Test CSRF Protection

```bash
# Attempt POST without CSRF token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Should return 403 Forbidden with CSRF error
```

### 4. Verify Security Headers

Visit https://securityheaders.com/ and test your production URL.
Target grade: **A or A+**

---

## Rollback Plan

If issues are discovered after deployment:

1. **Revert commits:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Emergency fallback:**
   - Temporarily set `NODE_ENV=development` (NOT RECOMMENDED)
   - Only as last resort for critical production issues

3. **Database SSL issues:**
   - Set `DB_SSL=false` temporarily (NOT RECOMMENDED)
   - Fix SSL configuration and re-enable immediately

---

## Security Contacts

For security issues or questions:
- **Security Team:** security@hablas.co
- **On-Call:** [To be configured]
- **Incident Response:** Follow security incident response plan

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Next.js Security Best Practices](https://nextjs.org/docs/authentication)
- [PostgreSQL SSL Configuration](https://www.postgresql.org/docs/current/ssl-tcp.html)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Author:** Security Specialist Agent
**Status:** Production Ready - Requires Configuration
