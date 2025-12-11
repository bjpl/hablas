# GOAP Execution Roadmap - Visual Timeline

**Project:** Hablas Portfolio Readiness
**Total Effort:** 16-25 hours (2-3 days)
**Portfolio Impact:** 60/100 → 95/100 (+35 points)

---

## Quick Reference: Action Priority Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                 IMPACT vs EFFORT MATRIX                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HIGH IMPACT                                                │
│  │                                                          │
│  │  [A1]         [A10]                                      │
│  │  CSRF         Showcase                                   │
│  │  2h           1.5h                                       │
│  │                                                          │
│  │  [A2]         [A8]          [A3]                        │
│  │  CORS         Security      Rate Limit                  │
│  │  1h           Docs 2h       3h                          │
│  │                                                          │
│  │  [A9]         [A5]          [A4]                        │
│  │  Perf Docs    console.log   DB Sessions                 │
│  │  2h           1.5h          2h                          │
│  │                                                          │
│  │               [A6]          [A11]                       │
│  │               TypeScript    Tests                       │
│  │               2h            6h                          │
│  │                                                          │
│  │  [A12]        [A7]                                      │
│  │  Health       ESLint                                    │
│  │  1.5h         1h                                        │
│  │                                                          │
│  LOW IMPACT                                                │
│  └────────────────────────────────────────────────────────│
│     LOW EFFORT            MEDIUM              HIGH EFFORT  │
│                                                             │
│  Legend:                                                    │
│  [  ] = Quick Win (do first)                              │
│  [  ] = High Value (priority)                             │
│  [  ] = Long Pole (optional)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Day-by-Day Execution Plan

### DAY 1: Security Hardening & Code Quality

```
┌─────────────────────────────────────────────────────────────┐
│ DAY 1 MORNING (4 hours) - CRITICAL SECURITY                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  08:00 - 10:00  [A1] Enforce CSRF Protection                │
│                 ├─ Create/update middleware.ts              │
│                 ├─ Apply CSRF validation to routes         │
│                 ├─ Test CSRF token flow                    │
│                 └─ Verify with curl commands               │
│                                                             │
│  10:00 - 11:00  [A2] Fix CORS Configuration                 │
│                 ├─ Update lib/utils/cors.ts                │
│                 ├─ Whitelist hablas.co only on auth        │
│                 ├─ Configure public endpoints              │
│                 └─ Test with OPTIONS requests              │
│                                                             │
│  11:00 - 12:00  [A5] console.log Cleanup (START)            │
│                 ├─ Run find-replace on lib/ directory      │
│                 ├─ Run find-replace on app/ directory      │
│                 └─ Verify logger imports                   │
│                                                             │
│  STATUS: 3 hours, Security +70%, Visible Quality +10%      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DAY 1 AFTERNOON (4 hours) - INFRASTRUCTURE & QUALITY        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  13:00 - 16:00  [A3] Distributed Rate Limiting              │
│                 ├─ Setup Vercel KV (or Upstash Redis)      │
│                 ├─ Update lib/utils/rate-limiter.ts        │
│                 ├─ Test distributed behavior               │
│                 └─ Document configuration                  │
│                                                             │
│  16:00 - 17:30  [A6] Fix Critical TypeScript 'any'          │
│                 ├─ Identify 'any' in lib/auth/*            │
│                 ├─ Identify 'any' in app/api/*             │
│                 ├─ Add proper type definitions             │
│                 └─ Verify with npm run typecheck           │
│                                                             │
│  17:30 - 18:00  [A5] console.log Cleanup (FINISH)           │
│                 ├─ Clean up scripts/ (safe to keep some)   │
│                 ├─ Final verification                      │
│                 └─ Test build                              │
│                                                             │
│  STATUS: 7 hours total, Security +100%, Code Quality +25%  │
└─────────────────────────────────────────────────────────────┘
```

**Day 1 Deliverables:**
- ✅ CSRF protection enforced
- ✅ CORS properly configured
- ✅ Distributed rate limiting implemented
- ✅ Zero console.log in lib/ and app/
- ✅ Critical TypeScript types fixed

**Portfolio Impact:** 60 → 80 (+20 points)

---

### DAY 2: Build Quality & Documentation

```
┌─────────────────────────────────────────────────────────────┐
│ DAY 2 MORNING (4 hours) - BUILD QUALITY & OPS               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  08:00 - 10:00  [A4] Database-Backed Sessions               │
│                 ├─ Fix Edge Runtime compatibility          │
│                 ├─ Test session persistence                │
│                 ├─ Test session revocation                 │
│                 └─ Document Edge Runtime strategy          │
│                                                             │
│  10:00 - 11:00  [A7] Enable ESLint in Builds                │
│                 ├─ Update next.config.js                   │
│                 ├─ Run npm run lint                        │
│                 ├─ Fix remaining warnings                  │
│                 └─ Verify npm run build passes             │
│                                                             │
│  11:00 - 12:30  [A12] Health Check Endpoints                │
│                 ├─ Create /api/health/live                 │
│                 ├─ Create /api/health/ready                │
│                 ├─ Test database connectivity              │
│                 └─ Test Redis connectivity                 │
│                                                             │
│  STATUS: 4.5 hours, Quality +40%, DevOps +20%              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DAY 2 AFTERNOON (4 hours) - DOCUMENTATION (PARALLEL)        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  13:00 - 15:00  [A8] Security Documentation                 │
│                 ├─ Create docs/security/THREAT_MODEL.md    │
│                 ├─ Document CSRF protection                │
│                 ├─ Document rate limiting                  │
│                 └─ Document session management             │
│                                                             │
│  13:00 - 15:00  [A9] Performance Benchmarks (PARALLEL)      │
│                 ├─ Run npm run perf:lighthouse             │
│                 ├─ Run npm run perf:test                   │
│                 ├─ Create docs/performance/BENCHMARKS.md   │
│                 └─ Document optimization techniques        │
│                                                             │
│  15:00 - 16:30  [A10] Portfolio Showcase Document           │
│                 ├─ Create SHOWCASE.md                      │
│                 ├─ Highlight technical achievements        │
│                 ├─ Add architecture diagram                │
│                 └─ Add code snippets                       │
│                                                             │
│  16:30 - 17:00  Final README Update                         │
│                 ├─ Update badges (Lighthouse, coverage)    │
│                 ├─ Add deployment guide                    │
│                 ├─ Add architecture diagram                │
│                 └─ Link to SHOWCASE.md                     │
│                                                             │
│  STATUS: 8.5 hours total, Portfolio +50%, Presentation +70% │
└─────────────────────────────────────────────────────────────┘
```

**Day 2 Deliverables:**
- ✅ Database sessions fully functional
- ✅ ESLint enabled with zero warnings
- ✅ Health check endpoints operational
- ✅ Security documentation complete
- ✅ Performance benchmarks documented
- ✅ SHOWCASE.md created

**Portfolio Impact:** 80 → 95 (+15 points)

---

### DAY 3 (OPTIONAL): Testing Excellence

```
┌─────────────────────────────────────────────────────────────┐
│ DAY 3 (6 hours) - TESTING COVERAGE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  08:00 - 10:00  Auth Flow Tests                             │
│                 ├─ Test login with CSRF                    │
│                 ├─ Test logout                             │
│                 ├─ Test session refresh                    │
│                 └─ Test session revocation                 │
│                                                             │
│  10:00 - 12:00  API Route Tests                             │
│                 ├─ Test /api/content/* endpoints           │
│                 ├─ Test /api/topics/* endpoints            │
│                 ├─ Test CORS headers                       │
│                 └─ Test rate limiting                      │
│                                                             │
│  13:00 - 15:00  Security Feature Tests                      │
│                 ├─ Test CSRF validation                    │
│                 ├─ Test rate limit distributed behavior    │
│                 ├─ Test session persistence                │
│                 └─ Test health checks                      │
│                                                             │
│  15:00 - 16:00  Coverage Analysis & Documentation           │
│                 ├─ Run npm run test:coverage               │
│                 ├─ Generate coverage report                │
│                 ├─ Document testing strategy               │
│                 └─ Update README with coverage badge       │
│                                                             │
│  STATUS: 6 hours, Test Coverage +40%, Quality +10%         │
└─────────────────────────────────────────────────────────────┘
```

**Day 3 Deliverables:**
- ✅ 80%+ test coverage
- ✅ Auth flow fully tested
- ✅ Critical API routes tested
- ✅ Security features validated

**Portfolio Impact:** 95 → 100 (+5 points)

---

## Alternative: 1-Day Sprint (8 hours)

If time is extremely limited, focus on **highest portfolio impact per hour:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1-DAY SPRINT (8 hours) - MAXIMUM IMPACT                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  08:00 - 10:00  [A1] CSRF + [A2] CORS (3h compressed)       │
│                 Security blockers eliminated                │
│                                                             │
│  10:00 - 11:00  [A5] console.log cleanup (1h)               │
│                 High-visibility code quality                │
│                                                             │
│  11:00 - 13:00  [A9] Performance Benchmarks (2h)            │
│                 Data collection + docs                      │
│                                                             │
│  13:00 - 15:00  [A10] Portfolio Showcase (2h)               │
│                 Critical first impression                   │
│                                                             │
│  STATUS: 8 hours, Portfolio Impact 60 → 82 (+22 points)    │
└─────────────────────────────────────────────────────────────┘
```

**1-Day Result:** Security blockers removed + professional presentation
**Trade-offs:** Distributed rate limiting, DB sessions, tests deferred

---

## Progress Tracking Checklist

### Phase 1: Security Hardening ⬜
- [ ] A1: CSRF protection enforced in middleware
- [ ] A2: CORS whitelist configured on auth endpoints
- [ ] A3: Distributed rate limiting with Vercel KV/Redis
- [ ] A4: Database-backed sessions operational

### Phase 2: Code Quality ⬜
- [ ] A5: Zero console.log in lib/ and app/ directories
- [ ] A6: TypeScript 'any' types fixed in critical paths
- [ ] A7: ESLint enabled in builds with zero warnings

### Phase 3: Documentation ⬜
- [ ] A8: docs/security/ created with threat model
- [ ] A9: docs/performance/ created with benchmarks
- [ ] A10: SHOWCASE.md created for portfolio
- [ ] README.md updated with architecture

### Phase 4: Operations ⬜
- [ ] A12: Health check endpoints implemented
- [ ] Monitoring documentation complete
- [ ] Deployment guide updated

### Phase 5: Testing (Optional) ⬜
- [ ] A11: Auth flow tests implemented
- [ ] A11: API route tests implemented
- [ ] A11: Security feature tests implemented
- [ ] A11: Test coverage >80%

---

## Success Validation Commands

After each phase, run these commands to validate progress:

```bash
# Security Validation
curl -X POST https://hablas.co/api/auth/login -d '{}' # Should require CSRF
curl -X OPTIONS https://hablas.co/api/auth/login -H "Origin: https://evil.com" # Should block

# Code Quality Validation
grep -r "console\.log" lib/ app/ | grep -v node_modules | wc -l # Should be 0
npm run typecheck # Should pass with 0 errors
npm run lint # Should pass with 0 warnings
npm run build # Should complete successfully

# Documentation Validation
ls docs/security/ # Should show THREAT_MODEL.md, SECURITY_CONTROLS.md
ls docs/performance/ # Should show BENCHMARKS.md
ls SHOWCASE.md # Should exist

# Operations Validation
curl https://hablas.co/api/health/live # Should return 200
curl https://hablas.co/api/health/ready # Should return 200

# Testing Validation (if Phase 5 complete)
npm run test:coverage # Should show >80% coverage
```

---

## Adaptive Replanning Decision Points

**After Day 1 Morning:**
- ✅ If A1+A2 complete in <3h → Proceed with plan
- ⚠️ If A1+A2 take >4h → Skip A4, focus on documentation

**After Day 1 Afternoon:**
- ✅ If A3 complete → Proceed with Day 2
- ⚠️ If A3 blocked (Vercel KV issues) → Document limitation, continue

**After Day 2 Morning:**
- ✅ If A4+A7+A12 complete → Full documentation (A8-A10)
- ⚠️ If time pressure → Skip A8, focus on A9+A10 (visible portfolio impact)

**Before Day 3:**
- ✅ If ahead of schedule → Full testing (A11)
- ⚠️ If on schedule → Auth tests only (3h instead of 6h)
- 🛑 If behind schedule → Skip testing, add testing strategy to docs

---

## Final Portfolio Value Calculation

```
Initial State:
├─ Live Production App: +30 points
├─ Modern Stack: +15 points
├─ AI Integration: +10 points
├─ Mobile-First Design: +5 points
├─ Security Gaps: -15 points
├─ Code Quality Issues: -10 points
└─ Incomplete Documentation: -15 points
TOTAL: 60/100

After Day 1:
├─ Security Hardened: +20 points (gaps eliminated)
├─ Code Quality Improved: +10 points (professional standards)
├─ Distributed Systems: +5 points (rate limiting)
└─ Full-Stack Auth: +5 points (session management)
TOTAL: 80/100 (+20)

After Day 2:
├─ Security Documentation: +10 points (expertise demonstrated)
├─ Performance Benchmarks: +10 points (optimization credential)
├─ Portfolio Showcase: +15 points (compelling presentation)
├─ DevOps Operations: +5 points (health checks, monitoring)
└─ Professional Presentation: +10 points (complete docs)
TOTAL: 95/100 (+15)

After Day 3 (Optional):
├─ Testing Excellence: +5 points (quality engineering)
└─ 80%+ Coverage: credential badge
TOTAL: 100/100 (+5)
```

---

## Quick Start: Execute This First

```bash
# 1. Create working branch
git checkout -b portfolio-readiness-goap

# 2. Run initial validation
npm run typecheck
npm run lint
npm run build

# 3. Start with A1 (CSRF Enforcement)
# Create middleware.ts or update existing
# Implement CSRF validation on all POST/PUT/PATCH/DELETE routes

# 4. Track progress
# Update this file's checkboxes as you complete each action
# Commit frequently with clear messages

# 5. Final validation before merging
npm run test
npm run build
# Verify all validation commands pass
```

---

**Generated:** 2025-12-10
**Plan Version:** 1.0
**Estimated Completion:** 2-3 days (16-25 hours)
**Portfolio Impact:** +35 points (60 → 95)
