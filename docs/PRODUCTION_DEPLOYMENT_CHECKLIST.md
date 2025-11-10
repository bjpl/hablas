# Production Deployment Checklist
**Project**: Hablas - English Learning Hub
**Last Updated**: November 1, 2025
**Version**: 1.2.0

---

## Pre-Deployment Decision

> ⚠️ **CRITICAL**: Read `docs/STATIC_EXPORT_MIGRATION_PLAN.md` first!
>
> **Decision Required**: Choose deployment strategy:
> - [ ] **Option A**: Remove admin panel, stay on GitHub Pages (FREE, SIMPLE)
> - [ ] **Option B**: Deploy to Vercel/Netlify with full server support
> - [ ] **Option C**: Hybrid approach (advanced)

This checklist assumes **Option B** (Vercel deployment). Adapt as needed.

---

## Phase 1: Pre-Deployment Preparation

### 1.1 Code Quality ✅
- [ ] All tests passing: `npm test`
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Linting clean: `npm run lint`
- [ ] No console errors in development
- [ ] All TODOs/FIXMEs addressed or documented

### 1.2 Security Audit ✅
- [ ] Read security audit: `docs/security/audit-2025-11-01.md`
- [ ] Address CRITICAL findings
- [ ] Address HIGH priority issues
- [ ] Document accepted risks
- [ ] Review dependencies for vulnerabilities: `npm audit`

### 1.3 Dependencies 📦
- [ ] Dependencies up to date (safe updates)
- [ ] No deprecated packages
- [ ] Bundle size optimized
- [ ] Tree-shaking configured

### 1.4 Environment Variables 🔐
- [ ] All required variables documented in `.env.example`
- [ ] No secrets in source code
- [ ] Production secrets generated (different from dev)
- [ ] Secrets stored securely (password manager)

---

## Phase 2: Third-Party Service Setup

### 2.1 GitHub OAuth (if keeping admin panel)
- [ ] Created production GitHub OAuth app
- [ ] Homepage URL: `https://hablas.co`
- [ ] Callback URL: `https://hablas.co/api/auth/callback/github`
- [ ] Copied Client ID
- [ ] Generated and copied Client Secret
- [ ] Stored credentials securely

### 2.2 Upstash Redis (optional)
- [ ] Created Upstash account
- [ ] Created production Redis database
- [ ] Chose appropriate region (closest to users)
- [ ] Copied REST URL
- [ ] Copied REST Token
- [ ] Set up usage alerts (80% of free tier)

### 2.3 Domain Configuration
- [ ] Custom domain registered: hablas.co
- [ ] DNS records ready to update
- [ ] Current CNAME saved for rollback
- [ ] SSL certificate plan (auto with Vercel/Netlify)

---

## Phase 3: Platform Setup (Vercel Example)

### 3.1 Vercel Account
- [ ] Created Vercel account (free hobby tier)
- [ ] Connected GitHub account
- [ ] Verified email address

### 3.2 Project Import
- [ ] Imported GitHub repository
- [ ] Detected as Next.js project (auto-configured)
- [ ] Build settings verified:
  ```
  Framework Preset: Next.js
  Build Command: npm run build
  Output Directory: (leave default)
  Install Command: npm install
  ```

### 3.3 Environment Variables
Set in Vercel dashboard → Project Settings → Environment Variables:

**Required**:
```
NEXTAUTH_URL=https://hablas.co
NEXTAUTH_SECRET=<generate-new-production-secret>
```

**If using admin panel**:
```
GITHUB_ID=<production-oauth-client-id>
GITHUB_SECRET=<production-oauth-client-secret>
ADMIN_EMAILS=admin@hablas.co,your-email@example.com
```

**If using Upstash Redis**:
```
UPSTASH_REDIS_REST_URL=https://your-production-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=<production-token>
```

**Environment**: Set for "Production" only (not Preview/Development)

---

## Phase 4: Next.js Configuration

### 4.1 Remove Static Export
Edit `next.config.js`:

```javascript
// REMOVE this line:
// output: 'export',

// REMOVE this line (if present):
// basePath: '/hablas',

// Keep everything else
module.exports = {
  // ...existing config
}
```

### 4.2 Update Base URLs
Check all hardcoded URLs in codebase:

```bash
# Search for localhost references
grep -r "localhost:3000" --include="*.ts" --include="*.tsx"

# Search for GitHub Pages URLs
grep -r "bjpl.github.io/hablas" --include="*.ts" --include="*.tsx"

# Replace with production URL or environment variable
```

---

## Phase 5: Testing (Pre-Deploy)

### 5.1 Local Testing
- [ ] Clean install: `rm -rf node_modules package-lock.json && npm install`
- [ ] Build succeeds: `npm run build`
- [ ] Start production server: `npm start`
- [ ] Test all 59 resources load
- [ ] Test audio playback
- [ ] Test search functionality
- [ ] Test mobile responsiveness

### 5.2 Authentication Testing (if applicable)
- [ ] Test login flow locally
- [ ] Test logout
- [ ] Test access control
- [ ] Test unauthorized access
- [ ] Verify email whitelist works

---

## Phase 6: Initial Deployment

### 6.1 First Deploy
- [ ] Push to `main` branch (or deploy via Vercel dashboard)
- [ ] Build completes successfully
- [ ] Deployment URL received (e.g., `hablas-xyz.vercel.app`)
- [ ] No build errors
- [ ] No runtime errors in logs

### 6.2 Smoke Tests
Test on temporary Vercel URL before custom domain:

- [ ] Homepage loads (`https://hablas-xyz.vercel.app`)
- [ ] All navigation links work
- [ ] Resource library displays all 59 resources
- [ ] Click random resource → loads correctly
- [ ] Audio playback works
- [ ] Search functionality works
- [ ] Mobile view works (test on real device)
- [ ] Service Worker registers
- [ ] Offline mode works

### 6.3 Admin Panel Tests (if applicable)
- [ ] Navigate to `/admin`
- [ ] Redirects to login
- [ ] GitHub OAuth flow works
- [ ] Authorized user can access
- [ ] Unauthorized user sees error
- [ ] Logout works

### 6.4 API Endpoint Tests
```bash
# Test analytics endpoint
curl https://hablas-xyz.vercel.app/api/analytics

# Check rate limit headers
curl -I https://hablas-xyz.vercel.app/api/analytics

# Test health endpoint
curl https://hablas-xyz.vercel.app/api/health
```

Expected responses:
- [ ] Analytics returns 200 OK
- [ ] Rate limit headers present
- [ ] Health shows Redis connection (or in-memory fallback)

---

## Phase 7: Custom Domain Configuration

### 7.1 Add Domain to Vercel
1. Vercel Dashboard → Project → Settings → Domains
2. Add `hablas.co`
3. Vercel provides DNS instructions

### 7.2 Update DNS
In your domain registrar (Namecheap, GoDaddy, etc.):

**Option 1: CNAME (recommended)**:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

**Option 2: A Record**:
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)
TTL: 3600
```

**Add www subdomain**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 7.3 SSL Certificate
- [ ] Wait for DNS propagation (5 min - 48 hours)
- [ ] Vercel automatically provisions SSL certificate
- [ ] HTTPS enabled
- [ ] HTTP → HTTPS redirect works

### 7.4 Test Custom Domain
- [ ] `https://hablas.co` loads
- [ ] `https://www.hablas.co` redirects to `https://hablas.co`
- [ ] SSL certificate valid (green padlock)
- [ ] All tests from Phase 6.2 pass on custom domain
- [ ] OAuth callback updated to use custom domain

---

## Phase 8: Post-Deployment Validation

### 8.1 Full Feature Test
- [ ] Test all 59 resources (sample 10-15)
- [ ] Test audio playback (all variations)
- [ ] Test search with various queries
- [ ] Test category filtering
- [ ] Test level filtering
- [ ] Test WhatsApp integration links
- [ ] Test offline mode (disable network in DevTools)
- [ ] Test service worker caching

### 8.2 Performance Validation
Run Lighthouse audit:
- [ ] Performance score: 90+ target
- [ ] Accessibility score: 95+ target
- [ ] Best Practices: 90+ target
- [ ] SEO: 90+ target
- [ ] PWA: Installable

### 8.3 Mobile Testing
Test on real devices:
- [ ] Budget Android device (Chrome)
- [ ] iOS device (Safari)
- [ ] Tablet (iPad/Android)
- [ ] Slow 3G network simulation
- [ ] Offline functionality

### 8.4 Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## Phase 9: Monitoring & Analytics Setup

### 9.1 Error Monitoring
- [ ] Vercel analytics enabled (automatic)
- [ ] Check error logs: Vercel Dashboard → Project → Logs
- [ ] Set up error alerts (Vercel or Sentry)

### 9.2 Usage Analytics
**Option 1: Vercel Analytics** (recommended)
- [ ] Enable in Vercel dashboard (free on hobby tier)
- [ ] Real-time visitor tracking
- [ ] Core Web Vitals monitoring

**Option 2: Google Analytics**
- [ ] Add GA4 tracking code
- [ ] Verify events tracking
- [ ] Set up conversions

### 9.3 Upstash Monitoring (if using Redis)
- [ ] Set usage alert at 8,000 commands/day (80% of free tier)
- [ ] Check daily usage first week
- [ ] Monitor for unusual patterns

---

## Phase 10: Documentation & Rollback Plan

### 10.1 Update Documentation
- [ ] Update README.md with production URL
- [ ] Update CHANGELOG.md (new version)
- [ ] Document deployment date
- [ ] Update contributor guide
- [ ] Archive old deployment docs (GitHub Pages)

### 10.2 Rollback Plan
Document how to rollback if issues arise:

**Quick Rollback** (Vercel):
```
1. Vercel Dashboard → Project → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Instant rollback (< 1 minute)
```

**DNS Rollback** (if domain issues):
```
1. Revert DNS to GitHub Pages CNAME
2. Point to: bjpl.github.io
3. Wait for DNS propagation (5-60 minutes)
```

**Code Rollback**:
```bash
git revert <commit-hash>
git push origin main
# Vercel auto-deploys
```

### 10.3 Backup Strategy
- [ ] Database backup (if using Supabase in future)
- [ ] Environment variables documented securely
- [ ] Git repository up to date
- [ ] OAuth credentials stored securely (password manager)

---

## Phase 11: Launch Communication

### 11.1 Stakeholders
- [ ] Notify team (if applicable)
- [ ] Update users (if existing user base)
- [ ] Social media announcement (optional)

### 11.2 Documentation URLs
Update all references to old URL:
- [ ] GitHub repository description
- [ ] Social media profiles
- [ ] Email signatures
- [ ] Partner sites

---

## Phase 12: Post-Launch Monitoring (First Week)

### Day 1
- [ ] Check error logs (hourly)
- [ ] Monitor performance metrics
- [ ] Test all critical flows
- [ ] Watch for OAuth issues
- [ ] Check rate limiting effectiveness

### Day 2-3
- [ ] Review analytics (daily)
- [ ] Check Upstash usage (if applicable)
- [ ] Monitor Vercel build minutes
- [ ] Test on various devices
- [ ] Collect user feedback

### Day 7
- [ ] Full week analytics review
- [ ] Performance trends
- [ ] Cost analysis (Vercel, Upstash)
- [ ] Error pattern analysis
- [ ] Plan optimizations

---

## Emergency Contacts & Resources

### Platform Support
- **Vercel Support**: https://vercel.com/support
- **Upstash Support**: support@upstash.com
- **GitHub Support**: https://support.github.com

### Documentation
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **NextAuth Docs**: https://next-auth.js.org

### Critical Files
- `docs/STATIC_EXPORT_MIGRATION_PLAN.md` - Deployment decision
- `docs/security/audit-2025-11-01.md` - Security findings
- `docs/ADMIN_AUTH_SETUP.md` - Auth setup
- `.env.example` - Environment variables reference

---

## Deployment Summary

### Option A: GitHub Pages (Static)
**Estimated Time**: 2-3 hours
**Cost**: $0/month
**Complexity**: Very Low
**Recommendation**: If removing admin panel

### Option B: Vercel (Serverless)
**Estimated Time**: 1-2 days (including testing)
**Cost**: $0-20/month
**Complexity**: Medium
**Recommendation**: If keeping admin panel

### Option C: Hybrid
**Estimated Time**: 2-3 weeks
**Cost**: $0/month
**Complexity**: Very High
**Recommendation**: Not recommended for solo developer

---

## Final Checklist

Before marking deployment as complete:

- [ ] All Phase 1-12 checkboxes completed
- [ ] Zero critical errors in production
- [ ] All core features working
- [ ] Performance targets met
- [ ] Security requirements satisfied
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Rollback plan tested
- [ ] Team notified
- [ ] Post-launch monitoring scheduled

**Deployment Date**: _____________
**Deployed By**: _____________
**Version**: 1.2.0
**Platform**: _____________
**Status**: ❌ Not Deployed | ⏳ In Progress | ✅ Complete

---

**Last Updated**: November 1, 2025
**Next Review**: After first deployment
