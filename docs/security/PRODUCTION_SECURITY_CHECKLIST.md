# Production Security Checklist - Hablas Deployment

## Document Information
- **Date:** 2025-11-17
- **Version:** 1.0
- **Status:** Production Ready - Requires Configuration
- **Security Audit Completed:** Yes
- **Penetration Testing Required:** Yes (before public launch)

---

## Pre-Deployment Security Checklist

### 🔴 CRITICAL (Blocking Issues - Must Complete Before Deployment)

#### Authentication & Secrets
- [ ] **REFRESH_TOKEN_SECRET** set in production environment
  - Generate: `openssl rand -base64 48`
  - Minimum 32 characters required
  - Must be different from JWT_SECRET
- [ ] **JWT_SECRET** set and validated
  - Minimum 32 characters required
  - Securely generated (not default value)
- [ ] **CSRF_SECRET** configured (or using JWT_SECRET as fallback)
- [ ] All secrets stored in secure environment variables (not in code)
- [ ] `.env` files excluded from version control (verify `.gitignore`)

#### Database Security
- [ ] Database SSL enabled in production
  - `DATABASE_URL` includes `?sslmode=require`
  - Certificate validation enabled (`rejectUnauthorized: true`)
- [ ] Database credentials secured
  - Strong passwords (minimum 16 characters)
  - Credentials in environment variables only
- [ ] Database connection pool configured
  - Maximum connections: 20 (default)
  - Connection timeout: 2000ms
  - Idle timeout: 30000ms

#### CORS & Cross-Origin Security
- [ ] CORS wildcard (`*`) removed from all API routes
- [ ] Allowed origins explicitly configured
  - Production domain added to whitelist
  - Development origins excluded in production
- [ ] Credentials support properly configured (`Access-Control-Allow-Credentials: true`)

#### Security Headers
- [ ] Security headers applied in middleware (✅ Already implemented)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Strict-Transport-Security (HSTS) enabled in production
- [ ] Content Security Policy (CSP) configured
  - Test at https://csp-evaluator.withgoogle.com/
- [ ] Permissions-Policy configured (camera, microphone, geolocation disabled)

#### CSRF Protection
- [ ] CSRF protection implemented for state-changing operations
  - POST, PUT, PATCH, DELETE require CSRF tokens
- [ ] Frontend updated to include CSRF tokens in requests
  - Token retrieved from cookie
  - Token sent in X-CSRF-Token header

---

### 🟠 HIGH PRIORITY (Complete Within Week 1)

#### Rate Limiting
- [ ] Redis configured for distributed rate limiting
  - `REDIS_URL` environment variable set
  - Connection tested and verified
- [ ] Rate limit headers included in responses
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset
  - Retry-After (when exceeded)
- [ ] Rate limits configured for all sensitive endpoints:
  - Login: 5 attempts / 15 minutes ✅
  - Password reset: 3 attempts / 1 hour ✅
  - Registration: 3 attempts / 1 hour ✅
  - API calls: 100 requests / 1 minute ✅

#### Logging & Monitoring
- [ ] Production logging configured
  - Structured logging implemented (Winston/Pino)
  - Sensitive data excluded from logs
  - Log levels properly configured
- [ ] Error tracking service integrated (Sentry recommended)
- [ ] Security event monitoring
  - Failed login attempts tracked
  - Rate limit violations logged
  - CSRF token failures logged

#### Authentication Enhancement
- [ ] Admin default credentials changed
  - Custom admin email configured
  - Strong admin password set (20+ characters)
  - First-time password change enforced
- [ ] Session management reviewed
  - Maximum sessions per user: 5 ✅
  - Session cleanup scheduled (24 hours)
  - Expired session purging automated

---

### 🟡 MEDIUM PRIORITY (Complete Within Week 2-3)

#### Input Validation & Sanitization
- [ ] Input validation on all API endpoints
  - Zod schemas implemented ✅
  - Additional validation for edge cases
- [ ] SQL injection prevention verified
  - Parameterized queries used throughout ✅
  - No string concatenation in SQL
- [ ] XSS prevention verified
  - DOMPurify sanitization applied ✅
  - No `dangerouslySetInnerHTML` usage
  - Content Security Policy enforced

#### API Security
- [ ] All API routes require proper authentication
  - Public routes explicitly marked
  - Protected routes verified
- [ ] Authorization checks on all endpoints
  - Role-based access control (RBAC) implemented ✅
  - Permission checks before sensitive operations
- [ ] Request size limits configured
  - Body parser size limit: 1MB
  - File upload limits enforced

#### Session & Cookie Security
- [ ] Cookie settings verified:
  - `httpOnly: true` ✅
  - `secure: true` (production) ✅
  - `sameSite: 'lax'` or 'strict' ✅
  - Proper expiration times ✅
- [ ] Session token rotation implemented
  - Tokens refreshed within 24 hours ✅
  - Old tokens blacklisted after rotation

#### Dependency Security
- [ ] All npm packages up to date
  - Run `npm audit` and fix vulnerabilities
  - Update to latest stable versions
- [ ] Dependency scanning automated
  - Snyk or Dependabot configured
  - Weekly security scans scheduled

---

### 🟢 LOW PRIORITY (Post-Launch Improvements)

#### Advanced Security Features
- [ ] Password breach checking (HaveIBeenPwned API)
- [ ] Password history tracking (prevent reuse)
- [ ] Account lockout mechanism
  - Progressive delays on failed attempts
  - Permanent lockout after threshold
  - Admin unlock capability
- [ ] Email verification for new accounts
- [ ] Two-factor authentication (2FA)
  - TOTP support
  - Backup codes

#### Audit & Compliance
- [ ] Comprehensive audit logging
  - All admin actions logged
  - User authentication events tracked
  - Data access logged
- [ ] Audit log retention policy (90 days minimum)
- [ ] GDPR compliance features
  - Data export functionality
  - Data deletion capability
  - Consent management
- [ ] Security documentation completed
  - Security architecture documented
  - Incident response plan created
  - Security procedures documented

#### Testing & Validation
- [ ] Security test suite created
  - Authentication flow tests
  - Authorization tests
  - CSRF protection tests
  - XSS prevention tests
- [ ] Penetration testing completed
  - Professional security audit
  - Vulnerability assessment
  - Remediation plan
- [ ] Load testing under security constraints
  - Rate limiting behavior verified
  - Authentication under load tested

---

## Environment Variable Validation

### Required for Production

```bash
# Run this script before deployment
./scripts/validate-production-env.sh
```

**Expected Variables:**

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Authentication (CRITICAL)
JWT_SECRET=<64-char-secure-random-string>
REFRESH_TOKEN_SECRET=<64-char-secure-random-string>
CSRF_SECRET=<64-char-secure-random-string>  # Optional, uses JWT_SECRET

# Admin Account
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=<strong-password-20-chars-min>

# Database (CRITICAL)
DATABASE_URL=postgresql://user:password@host:5432/hablas?sslmode=require
DB_SSL_CA=/path/to/ca-certificate.crt  # Optional

# Redis (for rate limiting)
REDIS_URL=redis://:password@host:6379
REDIS_PASSWORD=<redis-password>

# CORS
ALLOWED_ORIGIN_1=https://www.your-domain.com
ALLOWED_ORIGIN_2=https://app.your-domain.com

# External APIs
ANTHROPIC_API_KEY=<your-api-key>
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=<your-access-key>

# Monitoring (Recommended)
SENTRY_DSN=<your-sentry-dsn>
```

---

## Deployment Steps

### 1. Pre-Deployment Validation

```bash
# 1. Validate environment variables
npm run validate:env

# 2. Run security audit
npm audit --production

# 3. Run security tests
npm run test:security

# 4. Build for production
NODE_ENV=production npm run build

# 5. Verify build output
npm run analyze
```

### 2. Database Migration

```bash
# 1. Backup existing database
npm run db:backup

# 2. Run migrations
npm run db:migrate

# 3. Verify migrations
npm run db:verify

# 4. Test database connection
npm run db:health
```

### 3. Deploy to Production

```bash
# 1. Deploy application
npm run deploy:production

# 2. Verify deployment
curl -I https://your-domain.com/api/health

# 3. Test authentication
npm run test:production:auth

# 4. Monitor logs
npm run logs:production
```

### 4. Post-Deployment Verification

```bash
# 1. Verify security headers
npm run test:headers https://your-domain.com

# 2. Test SSL/TLS configuration
npm run test:ssl https://your-domain.com

# 3. Verify CORS configuration
npm run test:cors https://your-domain.com

# 4. Test rate limiting
npm run test:rate-limit https://your-domain.com/api/auth/login
```

---

## Security Testing Tools

### Automated Testing

```bash
# Security headers test
npm run test:security-headers

# OWASP ZAP automated scan
npm run test:zap

# Dependency vulnerability scan
npm audit
snyk test

# SSL/TLS configuration test
npm run test:ssl
```

### Manual Testing

1. **Security Headers:** https://securityheaders.com/
   - Target grade: A or A+

2. **SSL/TLS:** https://www.ssllabs.com/ssltest/
   - Target grade: A or A+

3. **CORS Configuration:**
   ```bash
   curl -H "Origin: https://malicious-site.com" \
        -H "Access-Control-Request-Method: POST" \
        -X OPTIONS \
        https://your-domain.com/api/auth/login
   ```
   - Should return no CORS headers or reject origin

4. **CSRF Protection:**
   ```bash
   curl -X POST https://your-domain.com/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"password"}'
   ```
   - Should return 403 Forbidden

5. **Rate Limiting:**
   ```bash
   # Send 10 requests rapidly
   for i in {1..10}; do
     curl -X POST https://your-domain.com/api/auth/login \
          -H "Content-Type: application/json" \
          -d '{"email":"test@test.com","password":"wrong"}'
   done
   ```
   - Should return 429 Too Many Requests after 5 attempts

---

## Rollback Procedures

### Emergency Rollback

If critical security issues are discovered:

```bash
# 1. Revert to previous version
git revert HEAD
git push origin main

# 2. Redeploy previous version
npm run deploy:rollback

# 3. Verify rollback
curl https://your-domain.com/api/health

# 4. Notify team and users
npm run notify:security-incident
```

### Database Rollback

```bash
# Rollback last migration
npm run db:rollback

# Restore from backup
npm run db:restore --backup-id=<backup-id>
```

---

## Monitoring & Alerting

### Critical Alerts (Immediate Response)

- Authentication system failures
- Database connection failures
- Rate limit bypasses detected
- CSRF token validation failures
- Unusual spike in failed login attempts (>100/minute)
- Security header misconfiguration

### Warning Alerts (Investigation Within 1 Hour)

- High rate of 401 Unauthorized responses
- Increased rate limit violations
- Slow database query performance
- Memory usage above 80%
- CPU usage above 80%

### Info Alerts (Daily Review)

- Total authentication attempts
- Rate limit statistics
- API usage patterns
- Error rate trends

---

## Incident Response

### Security Incident Procedure

1. **Identify**: Detect and confirm security incident
2. **Contain**: Limit damage and prevent spread
3. **Eradicate**: Remove threat and vulnerabilities
4. **Recover**: Restore normal operations
5. **Learn**: Document and improve

### Contact Information

- **Security Team:** security@your-domain.com
- **On-Call Engineer:** [Configure PagerDuty/Similar]
- **Incident Commander:** [Designate person]

---

## Compliance & Regulations

### GDPR Requirements

- [ ] Data processing documented
- [ ] User consent mechanisms
- [ ] Data export functionality
- [ ] Right to deletion implemented
- [ ] Privacy policy published
- [ ] Data breach notification procedure

### Security Standards

- [ ] OWASP Top 10 compliance verified
- [ ] PCI DSS (if handling payments)
- [ ] SOC 2 (if enterprise customers)
- [ ] ISO 27001 consideration

---

## Sign-Off

### Security Team Approval

- [ ] Security Specialist: ________________________ Date: __________
- [ ] DevOps Engineer: __________________________ Date: __________
- [ ] Technical Lead: ____________________________ Date: __________

### Production Readiness Confirmed

- [ ] All CRITICAL items completed
- [ ] All HIGH PRIORITY items completed
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery tested
- [ ] Incident response plan in place

**Approved for Production Deployment:** YES / NO

**Signature:** _________________________ **Date:** ___________

---

## Additional Resources

- [OWASP Security Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Next.js Security Best Practices](https://nextjs.org/docs/authentication)
- [PostgreSQL Security Documentation](https://www.postgresql.org/docs/current/security.html)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated:** 2025-11-17
**Next Review:** 2025-12-17 (30 days)
**Document Owner:** Security Team
