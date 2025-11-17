# Hablas Platform - Requirements Analysis & Gap Report

**Generated:** 2025-11-16
**Version:** 1.2.0
**Status:** Active Development
**Analyst:** Requirements Research Agent

---

## Executive Summary

This report analyzes the Hablas English learning platform codebase to identify implementation gaps, incomplete features, and missing functionality. The platform is designed for Colombian delivery drivers and rideshare workers, with a focus on practical workplace English.

### Current State Overview

- **Project Health:** Active development with 50+ resources implemented
- **Authentication Status:** 80% complete (login functional, registration/password reset missing)
- **Content System:** Fully implemented with comprehensive review tools
- **API Protection:** Middleware implemented, but inconsistent coverage
- **User Management:** Basic structure present, needs expansion

---

## 1. Current State Assessment

### 1.1 Technology Stack Analysis

**Dependencies (package.json):**
- Next.js 15.0 with App Router (production-ready)
- React 18.3.1 with TypeScript 5.6
- Authentication: bcryptjs 3.0.3, jose 6.1.2 (JWT with Edge runtime support)
- Validation: Zod 4.1.12
- UI: Tailwind CSS, Lucide React icons
- Database: Supabase 2.58.0 (devDependency, integration incomplete)
- Testing: Jest 30.2.0 with Testing Library

### 1.2 Implemented Features

#### Authentication System (80% Complete)
**Working Components:**
- ✅ JWT token generation and verification (Edge-compatible with jose)
- ✅ Secure login API route (`/api/auth/login`)
- ✅ Login page UI (`/app/admin/login/page.tsx`)
- ✅ Token refresh mechanism (`/api/auth/refresh`)
- ✅ Logout functionality (`/api/auth/logout`)
- ✅ User session retrieval (`/api/auth/me`)
- ✅ Middleware protection for admin routes
- ✅ AuthContext with React hooks
- ✅ Role-based permissions (admin, editor, viewer)
- ✅ Rate limiting on login attempts (15-minute lockout after 5 attempts)
- ✅ Remember me functionality (7 days vs 30 days token expiry)
- ✅ Cookie-based session management

**Storage:**
- ✅ File-based user storage (`data/users.json`)
- ✅ User structure with hashed passwords (bcryptjs)

#### Content Review System (100% Complete)
- ✅ ContentReviewTool component with side-by-side comparison
- ✅ TopicReviewTool for topic-based content management
- ✅ MediaReviewTool for audio/video/image review
- ✅ Auto-save functionality (2-second debounce)
- ✅ Diff highlighting for content changes
- ✅ Edit history tracking (`data/content-edits.json`)

#### Content Management
- ✅ 50+ AI-generated learning resources
- ✅ Topic-based organization system
- ✅ Resource templates and validation
- ✅ Audio metadata management
- ✅ Bilingual dialogue formatting
- ✅ Cultural notes and practical scenarios

#### API Routes
**Protected:**
- `/admin/*` - Admin dashboard pages
- `/api/content/*` - Content management APIs

**Public:**
- `/api/auth/*` - Authentication endpoints
- Resource detail pages

### 1.3 Architecture Overview

```
hablas/
├── app/
│   ├── admin/                 # Protected admin area
│   │   ├── login/            # ✅ Login page
│   │   ├── edit/[id]/        # Content editing
│   │   └── topics/           # Topic management
│   ├── api/
│   │   ├── auth/             # ✅ Auth endpoints (4/4 implemented)
│   │   ├── content/          # Content CRUD
│   │   ├── topics/           # Topic management
│   │   └── media/            # Media handling
│   └── recursos/[id]/        # Public resource pages
├── components/
│   ├── auth/                 # ✅ Auth components
│   │   ├── RequireAuth.tsx
│   │   └── PermissionGate.tsx
│   ├── content-review/       # ✅ Review tools (100%)
│   └── topic-review/         # ✅ Topic review system
├── lib/
│   ├── auth/                 # ✅ Auth logic (80% complete)
│   │   ├── jwt.ts           # ✅ JWT with jose/Edge runtime
│   │   ├── users.ts         # ✅ User management
│   │   ├── permissions.ts   # ✅ RBAC
│   │   ├── cookies.ts       # ✅ Cookie helpers
│   │   └── types.ts         # ✅ Type definitions
│   ├── contexts/
│   │   └── AuthContext.tsx  # ✅ Auth state management
│   └── topics/              # Topic services
├── data/
│   ├── users.json           # ✅ User storage
│   ├── resources.ts         # Learning resources
│   └── content-edits.json   # Edit history
└── middleware.ts            # ✅ Route protection
```

---

## 2. Missing Features & Incomplete Implementation

### 2.1 CRITICAL: Authentication System Gaps

#### Missing: User Registration Flow
**Status:** ❌ Not Implemented
**Priority:** HIGH
**Impact:** Cannot onboard new admin users without direct JSON manipulation

**Required Components:**
```typescript
// Missing API Route
app/api/auth/register/route.ts

// Missing UI Page
app/admin/register/page.tsx (admin-only access)

// Missing validation
- Email uniqueness check
- Password strength enforcement (partially in users.ts)
- Email verification workflow
```

**Specification:**
- Admin-only registration (protected route)
- Email validation with uniqueness check
- Password requirements: 8+ chars, 1 number, 1 special char (validation exists, UI missing)
- Role assignment by admin only
- Email verification token generation
- Welcome email workflow (optional)

#### Missing: Password Reset Flow
**Status:** ❌ Not Implemented
**Priority:** HIGH
**Impact:** Users locked out cannot recover accounts

**Required Components:**
```typescript
// Missing API Routes
app/api/auth/forgot-password/route.ts
app/api/auth/reset-password/route.ts

// Missing UI Pages
app/admin/forgot-password/page.tsx
app/admin/reset-password/[token]/page.tsx

// Missing infrastructure
- Password reset token generation
- Token expiry validation (1-hour window)
- Secure token storage (in-memory or database)
- Email delivery system
```

**Specification:**
- Forgot password form with email input
- Generate secure reset token (crypto.randomBytes)
- Store token with expiry (1 hour)
- Send reset email with link
- Reset password form with token validation
- Token single-use enforcement

#### Missing: User Profile Management
**Status:** ❌ Not Implemented
**Priority:** MEDIUM
**Impact:** Users cannot update their own information

**Required Components:**
```typescript
// Missing API Routes
app/api/auth/profile/route.ts (GET, PATCH)
app/api/auth/change-password/route.ts

// Missing UI
app/admin/profile/page.tsx

// Missing features
- Update name and email
- Change password (with current password verification)
- View login history
- Manage sessions
```

### 2.2 User Management Admin Panel

**Status:** ❌ Not Implemented
**Priority:** MEDIUM
**Impact:** Cannot manage users through UI

**Required Components:**
```typescript
// Missing admin pages
app/admin/users/page.tsx              // User list
app/admin/users/[id]/page.tsx         // User details/edit
app/admin/users/create/page.tsx       // Create user

// Missing API routes
app/api/admin/users/route.ts          // List users
app/api/admin/users/[id]/route.ts     // CRUD operations

// Missing features
- User listing with search/filter
- Role modification (admin only)
- User deactivation/deletion
- Last login tracking (partially implemented)
- Session management
```

### 2.3 Session Management Enhancements

**Current State:** Basic JWT with refresh
**Missing:**
- ❌ Active session tracking
- ❌ Multi-device session management
- ❌ Force logout all sessions
- ❌ Session activity logging
- ❌ Suspicious activity detection

### 2.4 API Route Protection Audit

**Current Middleware Coverage:**
```javascript
// Protected routes (middleware.ts)
protectedRoutes = ['/admin', '/api/content']

// Public routes
publicRoutes = ['/admin/login', '/api/auth']
```

**Gaps Identified:**
- ⚠️ `/api/topics/[slug]/save` - Needs admin protection
- ⚠️ `/api/media/[id]` - Upload/edit needs protection
- ⚠️ Content edit endpoints need role-based validation (editor vs admin)

**Recommended Protection Matrix:**
```
/api/auth/*                -> Public
/api/content/list          -> Public (read-only)
/api/content/save          -> Admin/Editor only
/api/content/[id]          -> GET: Public, POST/PATCH/DELETE: Admin
/api/topics/list           -> Public
/api/topics/[slug]/save    -> Admin/Editor only (MISSING PROTECTION)
/api/media/*               -> Admin only (NEEDS VERIFICATION)
/admin/*                   -> Authenticated only
```

### 2.5 Database Migration (Incomplete)

**Current:** File-based storage (`data/users.json`)
**Planned:** Supabase integration (dependency installed, not integrated)

**Missing:**
- ❌ Supabase configuration and setup
- ❌ User migration from JSON to database
- ❌ Database schema definitions
- ❌ Migration scripts
- ❌ Environment variable setup (`.env.local` exists but incomplete)

**Risk:** File-based storage not suitable for production (concurrency, scaling issues)

### 2.6 Email Integration

**Status:** ❌ Not Implemented
**Required For:**
- Password reset emails
- User registration verification
- Activity notifications

**Recommended Services:**
- Resend (Next.js optimized)
- SendGrid
- AWS SES
- Postmark

### 2.7 Logging & Monitoring

**Current State:** Console.log statements only
**Missing:**
- ❌ Structured logging (Winston/Pino)
- ❌ Error tracking (Sentry/Rollbar)
- ❌ Authentication audit logs
- ❌ Security event logging (failed login attempts, permission denials)
- ❌ Performance monitoring

### 2.8 Testing Coverage Gaps

**Current Testing:**
- ✅ Jest configured
- ✅ Testing Library setup
- ✅ Accessibility tests with jest-axe
- ⚠️ TopicReviewTool test exists (`components/content-review/__tests__/TopicReviewTool.test.tsx`)

**Missing Tests:**
- ❌ Authentication flow tests (login, logout, token refresh)
- ❌ Permission system tests
- ❌ API route integration tests
- ❌ Middleware protection tests
- ❌ User management tests
- ❌ E2E tests (Playwright/Cypress)

---

## 3. Priority Recommendations

### 3.1 HIGH Priority (Complete Authentication)

**Phase 1: Complete Core Auth Features (1-2 weeks)**
1. User Registration System
   - API route: `/api/auth/register`
   - Admin-only registration page
   - Email validation and uniqueness check
   - Role assignment by admin

2. Password Reset Flow
   - Forgot password API and UI
   - Reset password with token validation
   - Email delivery integration (Resend recommended)

3. API Route Protection Audit
   - Review all `/api/topics/*` routes
   - Verify `/api/media/*` protection
   - Implement role-based middleware helpers

### 3.2 MEDIUM Priority (User Management)

**Phase 2: Admin User Management (1 week)**
1. User Management Panel
   - List/search users
   - Create/edit/deactivate users
   - Role modification (admin only)
   - View user activity

2. Profile Management
   - User profile page
   - Change password (with current password)
   - Update email/name

### 3.3 LOW Priority (Enhancements)

**Phase 3: Production Readiness (2 weeks)**
1. Database Migration to Supabase
   - Schema design
   - Migration scripts
   - Environment configuration
   - User data migration

2. Logging & Monitoring
   - Structured logging
   - Error tracking (Sentry)
   - Security event logging

3. Testing Coverage
   - Authentication integration tests
   - E2E tests for critical flows
   - API route tests

---

## 4. Technical Constraints & Considerations

### 4.1 Current Architecture Constraints

**Edge Runtime Compatibility:**
- ✅ Using `jose` for JWT (Edge-compatible)
- ⚠️ Bcrypt runs in Node.js runtime (login API)
- Constraint: Password operations must stay in API routes (not middleware)

**File-based Storage:**
- ⚠️ Concurrency issues with JSON file writes
- ⚠️ No transaction support
- ⚠️ Scalability limitations
- Recommendation: Migrate to Supabase (already in dependencies)

**No Email Service:**
- ❌ Cannot send password reset emails
- ❌ Cannot verify email addresses
- Recommendation: Integrate Resend or SendGrid

### 4.2 Security Considerations

**Current Security Measures:**
- ✅ JWT with secure signing (jose library)
- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ HTTP-only cookies for tokens
- ✅ Rate limiting on login attempts
- ✅ CORS configuration
- ✅ Middleware route protection

**Security Gaps:**
- ❌ No CSRF protection
- ❌ No brute force detection beyond rate limiting
- ❌ No security headers (helmet.js)
- ❌ No input sanitization beyond Zod validation
- ❌ JWT secret using default in development (needs .env enforcement)

**Recommendations:**
1. Add CSRF tokens for state-changing operations
2. Implement security headers middleware
3. Add DOMPurify for HTML sanitization (already in dependencies but usage unclear)
4. Enforce JWT_SECRET in production (currently warns but allows)
5. Add IP-based suspicious activity detection

### 4.3 Environment Configuration

**Current State:**
- `.env.example` exists
- `.env.local` exists (not in version control)
- JWT_SECRET optional (defaults to hardcoded value)

**Required Environment Variables:**
```bash
# Authentication
JWT_SECRET=                    # Required in production
ADMIN_EMAIL=admin@hablas.co    # Default admin email
ADMIN_PASSWORD=                # Default admin password

# Database (for Supabase migration)
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Email (for password reset)
EMAIL_SERVICE=resend           # or sendgrid, ses
EMAIL_API_KEY=
EMAIL_FROM=noreply@hablas.co

# Optional
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://hablas.co
```

---

## 5. Implementation Roadmap

### Phase 1: Complete Authentication (HIGH - 2 weeks)

**Week 1: Registration & Password Reset**
```bash
Tasks:
- [ ] Create /api/auth/register route
- [ ] Build admin-only registration UI
- [ ] Implement email validation
- [ ] Add forgot-password API
- [ ] Create password reset UI
- [ ] Integrate email service (Resend)
- [ ] Add email verification tokens
```

**Week 2: API Protection & Testing**
```bash
Tasks:
- [ ] Audit all API routes for protection
- [ ] Add role-based middleware helpers
- [ ] Protect /api/topics/*/save endpoints
- [ ] Verify /api/media/* protection
- [ ] Write authentication integration tests
- [ ] Test all auth flows end-to-end
```

### Phase 2: User Management (MEDIUM - 1 week)

```bash
Tasks:
- [ ] Create /app/admin/users pages
- [ ] Build user management APIs
- [ ] Add user list with search/filter
- [ ] Implement user edit/deactivate
- [ ] Create profile management UI
- [ ] Add change password flow
- [ ] Add session activity tracking
```

### Phase 3: Production Readiness (LOW - 2 weeks)

**Week 1: Database Migration**
```bash
Tasks:
- [ ] Design Supabase schema
- [ ] Create migration scripts
- [ ] Test data migration
- [ ] Update auth logic for database
- [ ] Migrate users from JSON to DB
- [ ] Remove file-based storage
```

**Week 2: Monitoring & Testing**
```bash
Tasks:
- [ ] Add structured logging (Pino)
- [ ] Integrate error tracking (Sentry)
- [ ] Add security event logging
- [ ] Write comprehensive test suite
- [ ] Add E2E tests (Playwright)
- [ ] Security audit and hardening
```

---

## 6. Risk Analysis

### HIGH Risk
- **File-based user storage:** Concurrency issues, data loss risk
  - Mitigation: Migrate to Supabase urgently

- **Missing password reset:** Users can be permanently locked out
  - Mitigation: Implement password reset flow immediately

- **Unprotected API routes:** Unauthorized access to content management
  - Mitigation: Complete API protection audit

### MEDIUM Risk
- **No email verification:** Fake accounts possible
  - Mitigation: Add email verification workflow

- **Default JWT secret:** Potential security breach
  - Mitigation: Enforce JWT_SECRET in production (currently warns only)

- **No audit logging:** Cannot track security incidents
  - Mitigation: Implement security event logging

### LOW Risk
- **Limited testing:** Bugs may reach production
  - Mitigation: Add comprehensive test suite

- **No monitoring:** Difficult to diagnose production issues
  - Mitigation: Add Sentry and structured logging

---

## 7. Success Metrics

### Authentication System Completion
- [ ] 100% of auth features implemented (currently 80%)
- [ ] All API routes properly protected
- [ ] Zero authentication-related bugs in testing
- [ ] Password reset working end-to-end
- [ ] User registration functional

### User Management
- [ ] Admin can manage users through UI
- [ ] Users can manage own profiles
- [ ] Session management working
- [ ] Audit logs tracking all user actions

### Production Readiness
- [ ] Database migration complete
- [ ] All tests passing (>90% coverage)
- [ ] Error tracking operational
- [ ] Security audit passed
- [ ] Performance monitoring active

---

## 8. Next Steps

### Immediate Actions (This Week)
1. Create detailed implementation specifications for:
   - User registration system
   - Password reset flow
   - API protection matrix

2. Set up development environment:
   - Configure Resend for emails
   - Set up Supabase project
   - Configure .env.local properly

3. Begin Phase 1 implementation:
   - Start with user registration API
   - Implement email service integration
   - Create registration UI

### Team Assignments (Recommended)
- **Backend Developer:** Auth APIs, middleware, database migration
- **Frontend Developer:** Admin UI, registration/reset forms
- **QA Engineer:** Test suite, E2E tests, security testing
- **DevOps:** Email service setup, Supabase config, monitoring

---

## Appendix A: File Inventory

### Authentication Files (Implemented)
```
lib/auth/
  ✅ jwt.ts                  # JWT with jose/Edge runtime
  ✅ users.ts                # User CRUD and validation
  ✅ permissions.ts          # RBAC utilities
  ✅ cookies.ts              # Cookie management
  ✅ types.ts                # TypeScript definitions
  ✅ middleware-helper.ts    # Auth middleware utilities

app/api/auth/
  ✅ login/route.ts          # Login endpoint
  ✅ logout/route.ts         # Logout endpoint
  ✅ refresh/route.ts        # Token refresh
  ✅ me/route.ts             # Get current user

app/admin/
  ✅ login/page.tsx          # Login UI

lib/contexts/
  ✅ AuthContext.tsx         # Auth state management

components/auth/
  ✅ RequireAuth.tsx         # Route protection HOC
  ✅ PermissionGate.tsx      # Permission-based rendering

middleware.ts               # ✅ Route protection middleware
```

### Authentication Files (Missing)
```
app/api/auth/
  ❌ register/route.ts       # User registration
  ❌ forgot-password/route.ts
  ❌ reset-password/route.ts
  ❌ verify-email/route.ts
  ❌ profile/route.ts
  ❌ change-password/route.ts

app/admin/
  ❌ register/page.tsx
  ❌ forgot-password/page.tsx
  ❌ reset-password/[token]/page.tsx
  ❌ profile/page.tsx
  ❌ users/page.tsx          # User management
  ❌ users/[id]/page.tsx
  ❌ users/create/page.tsx

app/api/admin/
  ❌ users/route.ts          # User management APIs
  ❌ users/[id]/route.ts
```

---

## Appendix B: Dependencies Analysis

### Current Dependencies (Relevant to Auth)
```json
{
  "bcryptjs": "^3.0.3",           // Password hashing
  "jose": "^6.1.2",               // JWT (Edge-compatible)
  "cookie": "^1.0.2",             // Cookie parsing
  "zod": "^4.1.12",               // Validation
  "@supabase/supabase-js": "^2.58.0" // Database (devDep, unused)
}
```

### Recommended Additional Dependencies
```json
{
  "resend": "^3.0.0",             // Email service
  "pino": "^8.0.0",               // Structured logging
  "pino-pretty": "^10.0.0",       // Log formatting
  "@sentry/nextjs": "^7.0.0",     // Error tracking
  "helmet": "^7.0.0",             // Security headers
  "rate-limiter-flexible": "^3.0.0" // Advanced rate limiting
}
```

---

## Document Metadata

**Generated:** 2025-11-16
**Project:** Hablas English Learning Platform
**Version:** 1.2.0
**Analyst:** Requirements Research Agent
**Status:** Draft for Review
**Next Review:** After Phase 1 completion

**Related Documents:**
- `/docs/AUTHENTICATION_COMPLETE.md` - Auth implementation summary
- `/docs/auth-implementation-summary.md` - Technical details
- `/docs/admin-quick-start.md` - Admin user guide
- `/docs/content-review-implementation.md` - Review system docs

**Changelog:**
- 2025-11-16: Initial requirements analysis and gap assessment
