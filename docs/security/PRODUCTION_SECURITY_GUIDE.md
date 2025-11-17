# Production Security Guide

## Overview

This guide covers the security hardening implemented for the Hablas application, including cookie management, CORS configuration, rate limiting, and authentication security.

## Security Improvements Summary

### 1. Cookie Constants Alignment

**Issue**: Inconsistent cookie naming between middleware and API routes (JWT_COOKIE_NAME vs authToken).

**Solution**:
- Centralized cookie configuration in `/lib/config/security.ts`
- Standard cookie name: `hablas_auth_token` used across entire application
- All authentication flows now use the same constant from `SECURITY_CONFIG.COOKIE.AUTH_COOKIE_NAME`

**Files Updated**:
- `/lib/auth/cookies.ts` - Now imports from centralized config
- `/middleware.ts` - Uses consistent cookie name
- All `/app/api/auth/*` routes - Unified cookie handling

### 2. CORS Configuration (Production-Ready)

**Issue**: Wildcard CORS (`Access-Control-Allow-Origin: *`) in production poses security risk.

**Solution**:
- Environment-based CORS restrictions
- Production: Only allowed origins from environment variables
- Development: Localhost on multiple ports
- New utility: `/lib/utils/cors.ts`

**Configuration**:
```env
# Production environment variables
NEXT_PUBLIC_APP_URL=https://hablas.co
ALLOWED_ORIGIN_1=https://www.hablas.co
ALLOWED_ORIGIN_2=https://admin.hablas.co
```

**Behavior**:
- **Production**: Validates origin against allowed list, rejects unauthorized origins
- **Development**: Allows localhost on ports 3000, 3001, 127.0.0.1
- **Credentials**: Enabled only for allowed origins

**Implementation**:
```typescript
// All API routes now use:
import { createCorsPreflightResponse, addCorsHeaders } from '@/lib/utils/cors';

// OPTIONS handler
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request.headers.get('origin'));
}

// Add CORS to responses
return addCorsHeaders(response, request.headers.get('origin'));
```

### 3. Distributed Rate Limiting

**Issue**: In-memory rate limiting doesn't scale across multiple server instances.

**Solution**:
- New rate limiter utility: `/lib/utils/rate-limiter.ts`
- Supports both in-memory (fallback) and Redis (distributed)
- Automatic fallback if Redis unavailable
- Configurable limits per endpoint type

**Rate Limit Types**:
```typescript
LOGIN: {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
}

API: {
  MAX_REQUESTS: 100,
  WINDOW_MS: 60 * 1000,  // 1 minute
}

PASSWORD_RESET: {
  MAX_ATTEMPTS: 3,
  WINDOW_MS: 60 * 60 * 1000,  // 1 hour
}

REGISTRATION: {
  MAX_ATTEMPTS: 3,
  WINDOW_MS: 60 * 60 * 1000,  // 1 hour
}
```

**Redis Configuration** (Optional):
```env
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password
```

**Usage**:
```typescript
import { checkRateLimit, resetRateLimit } from '@/lib/utils/rate-limiter';

// Check rate limit
const rateLimit = await checkRateLimit(ip, 'LOGIN');
if (!rateLimit.allowed) {
  return NextResponse.json({
    error: rateLimit.error,
    remaining: rateLimit.remaining,
    resetAt: rateLimit.resetAt
  }, { status: 429 });
}

// Reset on success
await resetRateLimit(ip, 'LOGIN');
```

### 4. Secure Admin Password Configuration

**Issue**: Default hardcoded admin password (`Admin123!`) is insecure.

**Solution**:
- Auto-generated secure random passwords in production
- Password meets strict policy requirements
- Configurable via environment variable
- One-time display of auto-generated password

**Password Policy**:
- Minimum 8 characters (configurable)
- Maximum 128 characters
- Requires uppercase letter
- Requires lowercase letter
- Requires number
- Requires special character

**Behavior**:
1. **Production with ADMIN_PASSWORD set**: Uses environment variable
2. **Production without ADMIN_PASSWORD**: Generates 20-character random password
3. **Development**: Auto-generates secure password (can be overridden)

**Generated Password Example**:
```
K8#mPqR$nL4@xT9vZ2wY
```

**First Startup Output**:
```
🔐 No users found. Creating default admin user...
🔐 Generated secure admin password: K8#mPqR$nL4@xT9vZ2wY
⚠️  SAVE THIS PASSWORD - it will not be shown again!
⚠️  For security, set ADMIN_PASSWORD in environment variables
✅ Default admin created: admin@hablas.co
```

### 5. Centralized Security Configuration

**New File**: `/lib/config/security.ts`

All security settings now centralized in one configuration file:

```typescript
export const SECURITY_CONFIG = {
  COOKIE: {
    AUTH_COOKIE_NAME: 'hablas_auth_token',
    OPTIONS: { httpOnly, secure, sameSite, path, maxAge },
    REMEMBER_ME_OPTIONS: { ... },
  },

  CORS: {
    getAllowedOrigins(): string[],
    isOriginAllowed(origin): boolean,
    DEFAULT_HEADERS: { ... },
  },

  RATE_LIMIT: {
    LOGIN: { MAX_ATTEMPTS, WINDOW_MS, MESSAGE },
    API: { ... },
    PASSWORD_RESET: { ... },
    REGISTRATION: { ... },
  },

  JWT: {
    getSecret(): string,  // Validates JWT_SECRET
    TOKEN_EXPIRY: '7d',
    REMEMBER_ME_EXPIRY: '30d',
    REFRESH_THRESHOLD_SECONDS: 86400,
  },

  PASSWORD: {
    validate(password): { valid, errors },
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },

  ADMIN: {
    generateSecurePassword(): string,
    getDefaultEmail(): string,
    getDefaultPassword(): string,
  },

  HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // HSTS in production only
  },

  SESSION: {
    EXPIRY_DAYS: 30,
    CLEANUP_INTERVAL_MS: 86400000,
    MAX_SESSIONS_PER_USER: 5,
  },
};
```

## Environment Variables Reference

### Required for Production

```env
# JWT Secret (REQUIRED - minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-cryptographically-random

# Admin Email
ADMIN_EMAIL=admin@hablas.co

# Admin Password (optional - will auto-generate if not set)
ADMIN_PASSWORD=your-secure-admin-password-here

# Application URL
NEXT_PUBLIC_APP_URL=https://hablas.co

# Allowed CORS Origins
ALLOWED_ORIGIN_1=https://www.hablas.co
ALLOWED_ORIGIN_2=https://admin.hablas.co

# Node Environment
NODE_ENV=production
```

### Optional (Enhanced Security)

```env
# Redis for distributed rate limiting
REDIS_URL=redis://your-redis-host:6379
REDIS_PASSWORD=your-redis-password
```

## Security Checklist for Production

### Pre-Deployment

- [ ] Set `JWT_SECRET` to 32+ character random string
- [ ] Configure `ADMIN_PASSWORD` or note auto-generated password
- [ ] Set `NEXT_PUBLIC_APP_URL` to actual domain
- [ ] Configure `ALLOWED_ORIGIN_1` and `ALLOWED_ORIGIN_2`
- [ ] Set `NODE_ENV=production`
- [ ] (Optional) Configure Redis for distributed rate limiting
- [ ] Review and update admin email if needed

### Post-Deployment

- [ ] Verify CORS restrictions are working (test from unauthorized domain)
- [ ] Test rate limiting on login endpoint
- [ ] Confirm admin login works with configured/generated password
- [ ] Save auto-generated password if not using environment variable
- [ ] Monitor rate limiting metrics
- [ ] Set up Redis if using multiple server instances
- [ ] Review security headers in browser DevTools

### Ongoing Security

- [ ] Rotate JWT_SECRET periodically (requires user re-authentication)
- [ ] Monitor failed login attempts
- [ ] Review rate limit logs for abuse patterns
- [ ] Keep dependencies updated (especially `jose`, `bcryptjs`)
- [ ] Audit session cleanup (every 24 hours)
- [ ] Review and update CORS origins as needed

## Testing Security Features

### Test CORS Restrictions

```bash
# Should succeed (allowed origin)
curl -X OPTIONS https://hablas.co/api/auth/login \
  -H "Origin: https://hablas.co" \
  -v

# Should fail (unauthorized origin)
curl -X OPTIONS https://hablas.co/api/auth/login \
  -H "Origin: https://malicious-site.com" \
  -v
```

### Test Rate Limiting

```bash
# Login endpoint - should block after 5 attempts
for i in {1..10}; do
  curl -X POST https://hablas.co/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -v
done
```

### Test Password Policy

```typescript
// Strong password (should pass)
const strongPassword = 'MySecure123!Password';

// Weak password (should fail)
const weakPassword = 'password';

import { SECURITY_CONFIG } from '@/lib/config/security';
const result = SECURITY_CONFIG.PASSWORD.validate(password);
```

## Migration Notes

### Breaking Changes

1. **Cookie Name**: Changed from inconsistent names to `hablas_auth_token`
   - **Impact**: Existing sessions will be invalidated
   - **Action**: Users will need to log in again after deployment

2. **CORS Restrictions**: Wildcard origins no longer allowed in production
   - **Impact**: Frontend must be on allowed domain
   - **Action**: Configure allowed origins before deployment

3. **Admin Password**: Default password no longer hardcoded
   - **Impact**: Must save auto-generated password on first startup
   - **Action**: Either set ADMIN_PASSWORD or note generated password

### Backward Compatibility

- Rate limiting falls back to in-memory if Redis unavailable
- Development environment still allows localhost CORS
- JWT validation remains compatible with existing tokens

## Security Incident Response

### Rate Limit Exceeded

```typescript
// Clear rate limit for legitimate user
import { resetRateLimit } from '@/lib/utils/rate-limiter';
await resetRateLimit(userIp, 'LOGIN');
```

### Suspected Token Compromise

```typescript
// Revoke all user sessions
import { revokeAllUserSessions } from '@/lib/auth/session';
await revokeAllUserSessions(userId);
```

### CORS Attack Detected

1. Check server logs for suspicious origins
2. Review ALLOWED_ORIGIN_* environment variables
3. Ensure production environment is properly set

## Performance Considerations

### Rate Limiting

- **In-Memory**: No external dependency, fast, but not distributed
- **Redis**: Distributed, scalable, requires Redis server
- **Recommendation**: Use Redis in production with multiple instances

### Cookie Security

- **httpOnly**: Prevents XSS access to tokens
- **secure**: HTTPS only in production
- **sameSite**: CSRF protection

### JWT Refresh Strategy

- Tokens refresh when < 24 hours remaining
- Reduces number of re-authentications
- Balances security and user experience

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CORS Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Redis Rate Limiting](https://redis.io/topics/quickstart)

## Support

For security issues, please contact: security@hablas.co

**DO NOT** open public issues for security vulnerabilities.
