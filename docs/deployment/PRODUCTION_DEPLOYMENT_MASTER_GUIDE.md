# Production Deployment Master Guide - Hablas

## Document Information
- **Project:** Hablas - English Learning Platform
- **Version:** 1.2.0
- **Last Updated:** 2025-11-17
- **Status:** Production Ready - Configuration Required
- **Platform:** Vercel + Neon PostgreSQL

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Configuration](#environment-configuration)
4. [Infrastructure Setup](#infrastructure-setup)
5. [Database Deployment](#database-deployment)
6. [Application Deployment](#application-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring & Observability](#monitoring--observability)
9. [Security Hardening](#security-hardening)
10. [Rollback Procedures](#rollback-procedures)
11. [Common Production Tasks](#common-production-tasks)
12. [Incident Response](#incident-response)
13. [Dashboard Links & Resources](#dashboard-links--resources)

---

## Quick Start

For experienced teams, here's the 5-minute deployment path:

```bash
# 1. Set up Vercel project
vercel login
vercel link

# 2. Configure environment variables
vercel env add PRODUCTION < .env.production

# 3. Deploy database
DATABASE_URL="your-neon-url" npm run db:migrate

# 4. Deploy application
vercel --prod

# 5. Verify deployment
curl https://your-app.vercel.app/api/health
```

**First-time deployers:** Please follow the complete guide below.

---

## Pre-Deployment Checklist

### Development Readiness
- [ ] All tests passing (`npm run test`)
- [ ] Type checking successful (`npm run typecheck`)
- [ ] Build successful locally (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] Database migrations tested locally
- [ ] Latest changes committed to Git
- [ ] Code reviewed and approved

### Security Validation
- [ ] All secrets generated and secured
- [ ] No hardcoded credentials in code
- [ ] `.env` files in `.gitignore`
- [ ] CORS origins configured
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] CSRF protection enabled

### Infrastructure Preparation
- [ ] Vercel account created
- [ ] Neon PostgreSQL account created
- [ ] Redis instance provisioned (optional but recommended)
- [ ] Domain registered (if using custom domain)
- [ ] SSL certificate planning complete
- [ ] Backup strategy defined

---

## Environment Configuration

### Required Environment Variables

Create these secrets before deployment:

```bash
# Generate strong secrets
openssl rand -base64 48  # For JWT_SECRET
openssl rand -base64 48  # For REFRESH_TOKEN_SECRET
openssl rand -base64 48  # For CSRF_SECRET
```

### Production Environment Variables (.env.production)

```bash
# ============================================================================
# APPLICATION CONFIGURATION
# ============================================================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://hablas.co

# ============================================================================
# CRITICAL SECURITY SECRETS
# ============================================================================
# IMPORTANT: Generate new secrets - DO NOT use examples
JWT_SECRET=<64-char-base64-string-from-openssl>
REFRESH_TOKEN_SECRET=<different-64-char-base64-string>
CSRF_SECRET=<another-64-char-base64-string>

# ============================================================================
# ADMIN ACCOUNT
# ============================================================================
ADMIN_EMAIL=admin@hablas.co
# Leave blank for auto-generated secure password (recommended)
# OR set strong password (20+ characters)
ADMIN_PASSWORD=

# ============================================================================
# DATABASE - NEON POSTGRESQL
# ============================================================================
# Connection string with pooling (from Neon dashboard)
DATABASE_URL=postgresql://user:pass@host-pooler.region.aws.neon.tech/neondb?sslmode=require

# Database configuration
DB_SSL=true
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30000
DB_CONNECT_TIMEOUT=5000

# ============================================================================
# REDIS (OPTIONAL - HIGHLY RECOMMENDED)
# ============================================================================
# For distributed rate limiting
REDIS_URL=redis://:password@host:port
REDIS_PASSWORD=<your-redis-password>

# ============================================================================
# CORS CONFIGURATION
# ============================================================================
ALLOWED_ORIGIN_1=https://hablas.co
ALLOWED_ORIGIN_2=https://www.hablas.co

# ============================================================================
# EXTERNAL API KEYS
# ============================================================================
ANTHROPIC_API_KEY=<your-anthropic-api-key>
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=<your-unsplash-key>

# ============================================================================
# VERCEL BLOB STORAGE (OPTIONAL)
# ============================================================================
# For audio file storage
BLOB_READ_WRITE_TOKEN=<from-vercel-storage-dashboard>

# ============================================================================
# MONITORING (OPTIONAL - RECOMMENDED)
# ============================================================================
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_AUTH_TOKEN=<sentry-auth-token>
SENTRY_ORG=hablas
SENTRY_PROJECT=hablas-production

# ============================================================================
# GIT INFORMATION (AUTO-POPULATED BY VERCEL)
# ============================================================================
NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA=$VERCEL_GIT_COMMIT_SHA
```

### Environment Variable Management

#### Add to Vercel Dashboard
1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Add each variable individually
3. Set environment scope:
   - **Production**: ✓ (required)
   - **Preview**: ✓ (recommended)
   - **Development**: Leave unchecked (use `.env.local`)

#### Verify Environment Variables
```bash
# List all environment variables
vercel env ls

# Pull environment variables locally (for development)
vercel env pull .env.local
```

---

## Infrastructure Setup

### 1. Vercel Project Setup

#### Create New Project
1. Visit: https://vercel.com/new
2. Import your Git repository
3. Configure project:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

#### Link Existing Project
```bash
# Login to Vercel
vercel login

# Link to project
vercel link

# Follow prompts to select project
```

### 2. Neon PostgreSQL Setup

#### Create Database
1. Visit: https://console.neon.tech
2. Click **Create Project**
3. Configure:
   ```
   Project Name: hablas-production
   Region: us-east-1 (or closest to users)
   PostgreSQL Version: 16 (latest)
   ```

#### Get Connection String
1. In Neon Dashboard → **Connection Details**
2. Copy **Pooled Connection** string
3. Add to Vercel environment variables as `DATABASE_URL`

**Connection String Format:**
```
postgresql://[user]:[password]@[host]-pooler.[region].aws.neon.tech/[database]?sslmode=require
```

### 3. Redis Setup (Optional - Recommended)

#### Option A: Upstash Redis (Recommended)
1. Visit: https://upstash.com
2. Create new Redis database
3. Select region closest to Vercel deployment
4. Copy connection details to environment variables

#### Option B: Redis Cloud
1. Visit: https://redis.com/cloud
2. Create free database (30MB)
3. Configure connection string

#### Option C: Skip Redis
If skipping Redis, the app will use in-memory rate limiting (not recommended for production with multiple instances).

### 4. Vercel Blob Storage (Optional)

#### Create Blob Store
1. In Vercel Dashboard → **Storage** tab
2. Click **Create Database** → **Blob**
3. Configure:
   ```
   Name: hablas-audio-files
   Region: iad1 (US East) or nearest
   ```
4. Copy `BLOB_READ_WRITE_TOKEN` to environment variables

For detailed setup: See `/docs/deployment/vercel-blob-storage-setup.md`

### 5. Custom Domain Setup (Optional)

#### Using Vercel Domains (Easiest)
1. In Vercel Dashboard → **Domains**
2. Click **Add** → Enter `hablas.co`
3. Follow Vercel's automated setup

#### Using External DNS Provider
1. Add domain in Vercel Dashboard
2. Configure DNS records at your registrar:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

For detailed setup: See `/docs/deployment/custom-domain-setup.md`

---

## Database Deployment

### Pre-Migration Checklist
- [ ] Database connection string configured
- [ ] Database accessible from local machine (test connection)
- [ ] Migration scripts reviewed
- [ ] Backup strategy in place (Neon has automatic backups)

### Run Database Migrations

#### Method 1: Using npm script (Recommended)
```bash
# Set database URL
export DATABASE_URL="your-neon-connection-string"

# Run migrations
npm run db:migrate

# Verify database health
npm run db:health
```

#### Method 2: Manual migration
```bash
# Run migration script directly
tsx database/scripts/migrate.ts
```

### Expected Migration Results
```
✓ Connected to database
✓ Created users table
✓ Created sessions table
✓ Created refresh_tokens table
✓ Created auth_audit_log table
✓ Created 26 performance indexes
✓ Installed triggers and functions
✓ Migration complete!

Database Details:
- Tables: 4
- Indexes: 26
- Functions: 3
- Triggers: 2
```

### Database Health Check
```bash
# Run health check
npm run db:health

# Expected output:
{
  "status": "healthy",
  "database": {
    "connected": true,
    "tables": ["users", "sessions", "refresh_tokens", "auth_audit_log"],
    "indexes": 26,
    "version": "16.x"
  }
}
```

### Initialize Admin Account
```bash
# Run admin initialization
npm run auth:init

# If ADMIN_PASSWORD is blank, a secure password will be generated
# SAVE THIS PASSWORD - it's only shown once
```

---

## Application Deployment

### Deployment Methods

#### Method 1: Git Push (Recommended - Automatic)
```bash
# Commit your changes
git add .
git commit -m "Production deployment ready"

# Push to trigger deployment
git push origin main

# Vercel automatically deploys on push to main branch
```

#### Method 2: Vercel CLI (Manual)
```bash
# Deploy to production
vercel --prod

# Follow prompts
# Deployment URL will be displayed when complete
```

#### Method 3: Vercel Dashboard (Manual)
1. Go to: **Vercel Dashboard → Deployments**
2. Click **Redeploy** on latest deployment
3. Check **Use existing Build Cache** for faster deployment
4. Click **Redeploy**

### Monitor Deployment

#### Real-time Logs
```bash
# Follow deployment logs
vercel logs --follow

# Or view in dashboard
# Vercel Dashboard → Deployments → Click deployment → View Logs
```

#### Build Status
- **Building**: Application is being built
- **Deploying**: Built application being deployed to edge network
- **Ready**: Deployment complete and live
- **Error**: Deployment failed (check logs)

### Deployment Verification

Once deployment completes, verify:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Expected response (200 OK):
{
  "status": "healthy",
  "database": {
    "connected": true,
    "tables": [...],
    "indexes": 26
  },
  "timestamp": "2025-11-17T..."
}
```

---

## Post-Deployment Verification

### Critical Functionality Tests

#### 1. Database Connectivity
```bash
curl https://your-app.vercel.app/api/health
```
**Expected:** Status 200, `database.connected: true`

#### 2. Authentication System
```bash
# Test login endpoint
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hablas.co","password":"your-password"}'
```
**Expected:** Status 200, returns session token

#### 3. Admin Access
1. Navigate to: `https://your-app.vercel.app/admin`
2. Login with admin credentials
3. Verify dashboard loads

#### 4. Rate Limiting
```bash
# Send multiple rapid requests
for i in {1..6}; do
  curl -X POST https://your-app.vercel.app/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo ""
done
```
**Expected:** First 5 succeed (or fail with 401), 6th returns 429 (Too Many Requests)

#### 5. Security Headers
```bash
curl -I https://your-app.vercel.app/
```
**Verify headers present:**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=...`
- `Referrer-Policy: strict-origin-when-cross-origin`

#### 6. CORS Configuration
```bash
# Test from unauthorized origin
curl -H "Origin: https://malicious-site.com" \
     -X OPTIONS \
     https://your-app.vercel.app/api/auth/login
```
**Expected:** No CORS headers in response (origin blocked)

### Performance Verification

#### 1. Response Times
```bash
# Test API response time
time curl https://your-app.vercel.app/api/health
```
**Target:** < 500ms

#### 2. Database Query Performance
Monitor in Neon Dashboard:
- Average query time: < 50ms
- Connection pool usage: < 80%
- Active connections: < 20

#### 3. Web Vitals
Use Lighthouse or WebPageTest:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Security Validation

#### External Tools
1. **Security Headers:** https://securityheaders.com/
   - Enter your domain
   - **Target Grade:** A or A+

2. **SSL/TLS Test:** https://www.ssllabs.com/ssltest/
   - Enter your domain
   - **Target Grade:** A or A+

3. **OWASP ZAP Scan:**
   ```bash
   # Install OWASP ZAP
   # Run automated scan
   zap-cli quick-scan https://your-app.vercel.app
   ```

---

## Monitoring & Observability

### Quick Setup - Essential Monitoring

#### 1. Vercel Analytics (Built-in)
```bash
# Install package
npm install @vercel/analytics

# Already integrated in app/layout.tsx
# Enable in Vercel Dashboard → Analytics tab
```

#### 2. Sentry Error Tracking (Recommended)

**Setup:**
1. Create account: https://sentry.io/signup/
2. Create project: Platform = Next.js
3. Install SDK:
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```
4. Add to Vercel environment variables:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=your-dsn
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

**Configure Alerts:**
- Error rate > 10 in 5 minutes → Email + Slack
- New error type detected → Email
- Performance degradation → Email

For detailed setup: See `/docs/deployment/monitoring-setup.md`

#### 3. Uptime Monitoring (Free)

**Uptime Robot:**
1. Sign up: https://uptimerobot.com
2. Create monitors:
   ```
   Monitor 1:
   - URL: https://your-app.vercel.app
   - Interval: 5 minutes

   Monitor 2:
   - URL: https://your-app.vercel.app/api/health
   - Keyword: "healthy"
   - Interval: 5 minutes
   ```

### Monitoring Dashboards

#### Vercel Dashboard
- **URL:** https://vercel.com/dashboard
- **Metrics:** Deployments, Functions, Analytics, Logs
- **Review:** Daily

#### Neon Dashboard
- **URL:** https://console.neon.tech
- **Metrics:** Database performance, connections, storage
- **Review:** Weekly

#### Sentry Dashboard
- **URL:** https://sentry.io
- **Metrics:** Errors, performance, releases
- **Review:** Daily

---

## Security Hardening

### Critical Security Checklist

#### Authentication & Secrets (CRITICAL)
- [ ] `REFRESH_TOKEN_SECRET` set (different from JWT_SECRET)
- [ ] `JWT_SECRET` minimum 32 characters, cryptographically random
- [ ] `CSRF_SECRET` configured
- [ ] Admin password changed from default
- [ ] All secrets in environment variables (not code)
- [ ] `.env` files excluded from Git

#### Database Security
- [ ] SSL/TLS enabled (`?sslmode=require` in connection string)
- [ ] Strong database password (16+ characters)
- [ ] Connection pooling configured
- [ ] Database backups enabled in Neon

#### API Security
- [ ] CORS wildcard removed, specific origins configured
- [ ] Rate limiting active (test with rapid requests)
- [ ] CSRF protection enabled
- [ ] Input validation on all endpoints (Zod schemas)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (DOMPurify sanitization)

#### Headers & Cookies
- [ ] Security headers configured (verify with securityheaders.com)
- [ ] Cookies: `httpOnly=true`, `secure=true`, `sameSite=lax`
- [ ] HSTS enabled in production
- [ ] CSP configured

### Security Testing

```bash
# Run security audit
npm audit --production

# Check for vulnerabilities
npm audit fix

# Test authentication
npm run test:server
```

### Security Scoring
Run these checks and aim for:
- **Security Headers:** A+ (https://securityheaders.com)
- **SSL/TLS:** A+ (https://www.ssllabs.com/ssltest/)
- **OWASP:** No high/critical vulnerabilities

For complete checklist: See `/docs/security/PRODUCTION_SECURITY_CHECKLIST.md`

---

## Rollback Procedures

### Emergency Rollback (Critical Issues)

#### Scenario: Application not functioning, needs immediate revert

```bash
# 1. Revert to previous deployment in Vercel Dashboard
# Go to: Deployments → Previous deployment → Promote to Production

# OR via CLI:
vercel rollback

# 2. Verify rollback
curl https://your-app.vercel.app/api/health

# 3. Notify team
# Send alert to team channels
```

### Database Rollback

#### Scenario: Migration caused issues

```bash
# Option 1: Neon point-in-time recovery
# 1. Go to Neon Dashboard → Operations → Restore
# 2. Select timestamp before migration
# 3. Create new branch with restored data

# Option 2: Re-run previous migration
# Ensure migration scripts are idempotent
DATABASE_URL="your-url" npm run db:migrate
```

### Partial Rollback (Feature-specific)

```bash
# 1. Create hotfix branch
git checkout -b hotfix/revert-feature

# 2. Revert specific commits
git revert <commit-hash>

# 3. Push and deploy
git push origin hotfix/revert-feature

# 4. Deploy via Vercel (automatically triggered)
```

### Rollback Verification

```bash
# 1. Check health
curl https://your-app.vercel.app/api/health

# 2. Test critical functionality
# - Authentication
# - Database queries
# - API endpoints

# 3. Monitor error rates
# Check Sentry dashboard for 15 minutes

# 4. Verify user reports
# Monitor support channels
```

---

## Common Production Tasks

### Update Environment Variables

```bash
# Add new variable
vercel env add VARIABLE_NAME production

# Update existing variable
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production

# Redeploy to apply changes
vercel --prod
```

### Database Maintenance

```bash
# Check database health
npm run db:health

# View database metrics
# Go to: Neon Dashboard → Metrics

# Optimize tables (if needed)
# Run via Neon SQL Editor:
# VACUUM ANALYZE;
# REINDEX DATABASE neondb;
```

### View Application Logs

```bash
# Real-time logs
vercel logs --follow

# Logs for specific deployment
vercel logs [deployment-url]

# Or in Vercel Dashboard:
# Deployments → Select deployment → Logs
```

### Scale Resources

#### Database Scaling (Neon)
1. Go to: Neon Dashboard → Settings → Compute
2. Adjust compute size based on usage
3. Enable autoscaling for variable workloads

#### Application Scaling (Vercel)
- **Automatic:** Vercel auto-scales based on traffic
- **No manual configuration needed**
- Monitor in: Dashboard → Usage

### Performance Optimization

```bash
# Run performance test
npm run perf:test

# Check bundle size
npm run build
# Review output for large bundles

# Lighthouse audit
npm run perf:lighthouse
```

### Security Updates

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm audit fix

# Manual review of critical updates
npm outdated
npm update

# Test after updates
npm run test
npm run build
```

---

## Incident Response

### Severity Levels

#### Critical (P0) - Immediate Response
- **Examples:** Complete site outage, data breach, authentication failure
- **Response Time:** < 15 minutes
- **Action:** Page on-call engineer, start incident process

#### High (P1) - Urgent Response
- **Examples:** Slow performance, partial feature failure, high error rate
- **Response Time:** < 1 hour
- **Action:** Notify team, investigate immediately

#### Medium (P2) - Same-Day Response
- **Examples:** Non-critical feature issues, degraded performance
- **Response Time:** < 4 hours
- **Action:** Create ticket, assign to team

#### Low (P3) - Next Business Day
- **Examples:** Minor bugs, UI issues, documentation
- **Response Time:** < 24 hours
- **Action:** Add to backlog

### Incident Response Process

#### 1. Identify
```bash
# Check monitoring dashboards
# - Vercel Dashboard (deployment status, errors)
# - Sentry (error tracking)
# - Uptime Robot (availability)
# - Neon Dashboard (database health)

# Verify issue
curl https://your-app.vercel.app/api/health
```

#### 2. Assess Severity
- **Impact:** How many users affected?
- **Scope:** What functionality is broken?
- **Data:** Is user data at risk?

#### 3. Contain
```bash
# If critical, consider:
# - Rollback to previous version
vercel rollback

# - Enable maintenance mode (if implemented)
# - Temporarily disable affected features
```

#### 4. Investigate
```bash
# Check logs
vercel logs --follow

# Check error tracking
# Go to: Sentry Dashboard

# Check database
npm run db:health

# Review recent deployments
# Vercel Dashboard → Deployments
```

#### 5. Resolve
```bash
# Apply fix
git checkout -b hotfix/issue-description
# Make fix
git commit -m "fix: description"
git push

# Deploy hotfix
vercel --prod

# Verify fix
curl https://your-app.vercel.app/api/health
```

#### 6. Communicate
- **During:** Update status page, notify users
- **After:** Send postmortem to team
- **Document:** Add to incident log

#### 7. Postmortem
- What happened?
- What was the impact?
- What was the root cause?
- How did we fix it?
- How do we prevent recurrence?

### Emergency Contacts

**During Incidents:**
- **Primary On-Call:** [Configure]
- **Secondary On-Call:** [Configure]
- **Escalation:** [Configure]

**External Support:**
- **Vercel Support:** https://vercel.com/support
- **Neon Support:** https://neon.tech/docs/introduction/support
- **Sentry Support:** support@sentry.io

---

## Dashboard Links & Resources

### Essential Dashboards

#### Vercel
- **Main Dashboard:** https://vercel.com/dashboard
- **Deployments:** https://vercel.com/[team]/[project]/deployments
- **Analytics:** https://vercel.com/[team]/[project]/analytics
- **Logs:** https://vercel.com/[team]/[project]/logs
- **Environment Variables:** https://vercel.com/[team]/[project]/settings/environment-variables
- **Domains:** https://vercel.com/[team]/[project]/settings/domains
- **Storage:** https://vercel.com/[team]/storage

#### Neon PostgreSQL
- **Console:** https://console.neon.tech
- **Connection Details:** https://console.neon.tech/app/projects/[project-id]
- **Metrics:** https://console.neon.tech/app/projects/[project-id]/metrics
- **Operations:** https://console.neon.tech/app/projects/[project-id]/operations
- **Backups:** https://console.neon.tech/app/projects/[project-id]/branches

#### Sentry (if configured)
- **Dashboard:** https://sentry.io/organizations/[org]/projects/[project]
- **Issues:** https://sentry.io/organizations/[org]/issues/
- **Performance:** https://sentry.io/organizations/[org]/performance/
- **Releases:** https://sentry.io/organizations/[org]/releases/

#### Uptime Monitoring (if configured)
- **Uptime Robot:** https://uptimerobot.com/dashboard
- **Status Page:** [Configure custom status page]

### Documentation Links

#### Internal Documentation
- **Security Checklist:** `/docs/security/PRODUCTION_SECURITY_CHECKLIST.md`
- **Custom Domain Setup:** `/docs/deployment/custom-domain-setup.md`
- **Blob Storage Setup:** `/docs/deployment/vercel-blob-storage-setup.md`
- **Monitoring Setup:** `/docs/deployment/monitoring-setup.md`
- **Testing Guide:** `/docs/testing/TESTING_GUIDE.md`

#### External Documentation
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Neon Docs:** https://neon.tech/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Sentry Docs:** https://docs.sentry.io/

### Support & Community

#### Official Support
- **Vercel:** https://vercel.com/support
- **Neon:** https://neon.tech/docs/introduction/support
- **Next.js:** https://github.com/vercel/next.js/discussions

#### Security Resources
- **OWASP:** https://owasp.org/
- **Security Headers:** https://securityheaders.com/
- **SSL Labs:** https://www.ssllabs.com/ssltest/
- **Security Checklist:** https://cheatsheetseries.owasp.org/

---

## Quick Reference Commands

### Deployment
```bash
# Deploy to production
vercel --prod

# View deployment logs
vercel logs --follow

# List deployments
vercel ls

# Rollback to previous
vercel rollback
```

### Environment Variables
```bash
# List all env vars
vercel env ls

# Add variable
vercel env add NAME production

# Pull env vars locally
vercel env pull .env.local
```

### Database
```bash
# Run migrations
npm run db:migrate

# Health check
npm run db:health

# Initialize admin
npm run auth:init
```

### Testing
```bash
# Run all tests
npm run test

# Type checking
npm run typecheck

# Build verification
npm run build

# Security audit
npm audit
```

### Monitoring
```bash
# Performance test
npm run perf:test

# Check metrics
npm run perf:metrics

# View logs
vercel logs
```

---

## Deployment Success Checklist

### Pre-Launch Final Check
- [ ] All environment variables configured
- [ ] Database migrated successfully
- [ ] Admin account created and tested
- [ ] Health endpoint returning healthy status
- [ ] Authentication working (login/logout)
- [ ] Rate limiting active
- [ ] Security headers present
- [ ] SSL certificate valid (A+ grade)
- [ ] Monitoring configured (Sentry + Uptime)
- [ ] Backup strategy in place
- [ ] Team notified of deployment
- [ ] Documentation updated
- [ ] Rollback procedure tested and ready

### Post-Launch Monitoring (First 24 Hours)
- [ ] Hour 1: Check health endpoint every 15 minutes
- [ ] Hour 4: Review Sentry for any errors
- [ ] Hour 8: Check Uptime Robot reports
- [ ] Hour 12: Review database metrics in Neon
- [ ] Hour 24: Verify all monitoring alerts working
- [ ] Week 1: Daily monitoring dashboard review
- [ ] Week 2: Performance optimization if needed

---

## Support & Escalation

### Internal Team
- **Primary Contact:** [Your Name/Team]
- **Email:** [team@hablas.co]
- **Slack:** [#hablas-ops]

### External Support
- **Vercel:** https://vercel.com/support (Pro plan: Priority support)
- **Neon:** support@neon.tech (Email support)
- **Emergency:** Create ticket in respective dashboards

### Community Resources
- **GitHub Issues:** [Your repo]/issues
- **Discord/Slack:** [Community channel if available]
- **Stack Overflow:** Tag with `next.js`, `vercel`, `postgresql`

---

## Appendix

### A. Environment Variables Reference

**Complete list of all supported environment variables:**

See section: [Environment Configuration](#environment-configuration)

### B. Database Schema

**Current production schema:**
- `users`: User accounts and authentication
- `sessions`: Active user sessions
- `refresh_tokens`: JWT refresh tokens
- `auth_audit_log`: Security audit trail

**Indexes:** 26 total for optimized queries

### C. API Endpoints

**Public endpoints:**
- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh tokens

**Protected endpoints:**
- `GET /api/admin/*` - Admin routes (requires admin role)
- `POST /api/topics/*` - Topic management (requires authentication)

### D. Rate Limits

**Current configuration:**
- Login attempts: 5 per 15 minutes
- Registration: 3 per hour
- Password reset: 3 per hour
- API calls: 100 per minute
- File uploads: 10 per hour

### E. SSL/TLS Configuration

**Automatic via Vercel:**
- Certificate provider: Let's Encrypt
- Auto-renewal: 90 days
- TLS version: 1.2 and 1.3
- Cipher suites: Modern, secure ciphers

### F. Performance Targets

**Response times:**
- API endpoints: < 500ms (p95)
- Page loads: < 2s (p95)
- Database queries: < 50ms (average)

**Web Vitals:**
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

---

## Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-17 | Initial production guide | Deployment Team |

---

## Feedback & Improvements

This guide is a living document. Submit improvements via:
- GitHub Pull Request
- Team Slack channel
- Email to tech lead

**Last Updated:** 2025-11-17
**Next Review:** 2025-12-17 (30 days)
**Document Owner:** DevOps/Platform Team

---

**Congratulations on your production deployment! 🚀**

Remember:
- Monitor closely for the first 24 hours
- Have rollback procedures ready
- Communicate with your team
- Respond quickly to incidents
- Learn from each deployment

**Need Help?**
- Review the relevant section above
- Check linked documentation
- Contact support channels
- Ask the team in Slack

**You're ready to deploy Hablas to production!**
