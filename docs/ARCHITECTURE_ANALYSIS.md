# Hablas Project Architecture Analysis

**Analysis Date:** 2025-12-09
**Project Version:** 1.2.0
**Status:** Production-ready
**Analyst:** System Architecture Designer

---

## Executive Summary

Hablas is a production-grade Spanish language learning platform built with Next.js 15, TypeScript, and PostgreSQL. The architecture demonstrates strong separation of concerns, comprehensive security implementation, and professional-grade patterns. The system is designed for Colombian gig economy workers with mobile-first design, offline capabilities, and bilingual support.

**Key Metrics:**
- 65 TypeScript files in lib/ (core business logic)
- 71 React components (UI layer)
- 20+ API routes (REST endpoints)
- 3 database migration files
- Comprehensive test coverage with Jest
- Production deployment on Vercel

---

## 1. Overall Project Structure

### Directory Organization

```
hablas/
├── app/                    # Next.js 15 App Router (30+ routes)
│   ├── api/               # REST API endpoints (20+ routes)
│   ├── admin/             # Admin dashboard pages
│   ├── comunidad/         # Community features
│   ├── perfil/            # User profile
│   ├── practica/          # Practice pages
│   ├── recursos/          # Learning resources
│   └── review/            # Content review tools
├── components/            # React components (71 files)
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication UI
│   ├── content-review/   # Content management tools
│   ├── error-boundaries/ # Error handling
│   ├── media-review/     # Media review tools
│   ├── mobile/           # Mobile-optimized components
│   ├── review/           # Review workflow components
│   ├── shared/           # Reusable components
│   ├── topic-review/     # Topic management
│   └── ui/               # Base UI components
├── lib/                   # Core business logic (65 files)
│   ├── ai/               # AI content generation (Anthropic)
│   ├── audio/            # Audio processing
│   ├── auth/             # Authentication & authorization (10 files)
│   ├── cache/            # Redis caching layer
│   ├── config/           # Configuration management
│   ├── content-validation/ # Content quality validation
│   ├── contexts/         # React contexts
│   ├── db/               # Database layer (PostgreSQL)
│   ├── hooks/            # Custom React hooks
│   ├── security/         # Security utilities
│   ├── topics/           # Topic management
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Utility functions
│   └── validation/       # Data validation schemas
├── database/             # Database management
│   ├── migrations/       # SQL migration files (3)
│   ├── scripts/          # DB initialization & health checks
│   └── types/            # Database TypeScript types
├── __tests__/            # Test suites
│   ├── api/              # API route tests
│   ├── auth/             # Authentication tests
│   ├── components/       # Component tests
│   ├── database/         # Database tests
│   ├── integration/      # Integration tests
│   └── middleware/       # Middleware tests
├── docs/                 # Documentation
├── scripts/              # Build & utility scripts
├── public/               # Static assets
└── styles/               # Global styles
```

### Architecture Strengths

1. **Clear Separation of Concerns**: Business logic (lib/), UI (components/), routing (app/), and data (database/) are distinctly separated
2. **Modular Organization**: Feature-based organization (auth, content-review, topics) enables independent development
3. **Scalable Structure**: Easy to add new features without impacting existing code
4. **Type Safety**: Comprehensive TypeScript usage across all layers

### Architecture Weaknesses

1. **Deep Nesting**: Some component directories have 3+ levels of nesting (e.g., components/content-review/hooks/)
2. **Large lib/ Directory**: 65 files in lib/ could be further subdivided into domain modules
3. **Mixed Test Patterns**: Tests are split between __tests__/ and inline component tests

---

## 2. Component Architecture

### Component Organization Pattern

The project uses a **feature-based component organization** with shared UI components:

```
components/
├── Shared Base Components (Root level)
│   ├── ErrorBoundary.tsx
│   ├── AudioPlayer.tsx
│   ├── Hero.tsx
│   └── InstallPrompt.tsx
├── Feature Modules (Subdirectories)
│   ├── admin/ (Administrative features)
│   ├── auth/ (Authentication UI)
│   ├── content-review/ (Content management, 20+ files)
│   ├── topic-review/ (Topic management)
│   └── review/ (General review tools)
├── Platform-Specific
│   └── mobile/ (Mobile-optimized components)
└── Foundation
    ├── ui/ (Base UI primitives)
    └── shared/ (Cross-cutting utilities)
```

### Component Patterns

**1. Context-Based State Management**
```typescript
// lib/contexts/AuthContext.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  // Centralized auth state management
}
```

**2. Custom Hooks for Logic Separation**
```typescript
// components/content-review/hooks/useContentManager.ts
export function useContentManager() {
  // Encapsulates complex content management logic
}
```

**3. Error Boundaries for Resilience**
```typescript
// components/ErrorBoundary.tsx
// Catches and handles component errors gracefully
```

**4. Permission-Based Component Guards**
```typescript
// components/auth/PermissionGate.tsx
// Conditional rendering based on user permissions
```

### Component Strengths

1. **Comprehensive Error Handling**: Multiple error boundaries (API, Audio, general)
2. **Mobile-First Design**: Dedicated mobile component directory
3. **Accessibility**: Uses jest-axe for accessibility testing
4. **Rich Content Review Tools**: 20+ components for content management workflow

### Component Weaknesses

1. **Some Large Components**: AudioPlayer.tsx is 18KB, could be split
2. **Inconsistent Naming**: Mix of PascalCase and kebab-case directories
3. **Potential Prop Drilling**: Deep component trees may pass props multiple levels

---

## 3. API Design Patterns

### API Architecture

**REST-based API** with Next.js 15 Route Handlers (Edge Runtime compatible):

```
app/api/
├── auth/                 # Authentication endpoints
│   ├── login/           # POST /api/auth/login
│   ├── logout/          # POST /api/auth/logout
│   ├── me/              # GET /api/auth/me
│   ├── refresh/         # POST /api/auth/refresh
│   ├── register/        # POST /api/auth/register
│   └── password-reset/  # POST /api/auth/password-reset/*
├── content/             # Content management
│   ├── list/           # GET /api/content/list
│   ├── save/           # POST /api/content/save
│   └── [id]/           # GET/PUT/DELETE /api/content/:id
│       ├── history/    # GET /api/content/:id/history
│       └── review/     # POST /api/content/:id/review
├── topics/              # Topic management
│   ├── list/           # GET /api/topics/list
│   ├── route.ts        # POST /api/topics
│   └── [slug]/         # GET/PUT/DELETE /api/topics/:slug
│       └── save/       # POST /api/topics/:slug/save
├── audio/               # Audio file management
│   ├── upload/         # POST /api/audio/upload
│   └── [id]/           # GET /api/audio/:id
├── media/               # Media management
│   └── [id]/           # GET /api/media/:id
├── performance/         # Performance monitoring
│   └── metrics/        # GET /api/performance/metrics
└── health/              # Health check
    └── route.ts        # GET /api/health
```

### API Patterns & Standards

**1. Consistent Response Structure**
```typescript
// Success response
{ success: true, data: {...}, user: {...} }

// Error response
{ success: false, error: "message", code: "ERROR_CODE" }
```

**2. Authentication Flow**
```
Login → JWT Token Generation → HTTP-Only Cookie + Response Token
       → Session Creation (database)
       → Rate Limiting Check
```

**3. CORS Configuration**
```typescript
// Production: Whitelist specific domains
// Development: Allow localhost
const CORS_CONFIG = {
  getAllowedOrigins(): string[] {
    return process.env.NODE_ENV === 'production'
      ? ['https://hablas.co', ...]
      : ['http://localhost:3000', ...];
  }
}
```

**4. Rate Limiting (Distributed via Redis)**
```typescript
// app/api/auth/login/route.ts
const rateLimit = await checkRateLimit(ip, 'LOGIN');
if (!rateLimit.allowed) {
  return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
}
```

### API Strengths

1. **Edge Runtime Compatible**: Uses jose library for JWT (not jsonwebtoken)
2. **Comprehensive Rate Limiting**: Multiple rate limit categories (login, API, registration)
3. **CSRF Protection**: Implemented for state-changing operations
4. **Structured Logging**: Consistent logging across all routes
5. **Health Check Endpoint**: Supports monitoring and alerting

### API Weaknesses

1. **No API Versioning**: No /v1/ prefix for future breaking changes
2. **Mixed RESTful Patterns**: Some routes use nested actions (e.g., /content/:id/review) instead of separate resources
3. **No OpenAPI/Swagger Docs**: API documentation not auto-generated
4. **Limited Response Pagination**: No standard pagination pattern for list endpoints

---

## 4. Database Schema & Relationships

### Database Technology

**PostgreSQL** with connection pooling and query caching:

```typescript
// lib/db/pool.ts
- Connection pool with 30 max connections
- Query result caching (1-minute TTL, LRU eviction)
- Performance monitoring (slow query detection)
- Health checks with timeout
```

### Schema Design

**Migration-Based Schema Management** (3 migrations):

```sql
-- 001_create_users_table.sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE
);

-- 002_create_auth_tables.sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  revoked_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE auth_audit_log (
  id UUID PRIMARY KEY,
  user_id UUID,
  event_type VARCHAR(50) NOT NULL,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 003_create_sessions_table.sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token VARCHAR(255) NOT NULL,
  access_token_hash VARCHAR(255),
  refresh_token_hash VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(50),
  device_name VARCHAR(100),
  browser VARCHAR(100),
  os VARCHAR(100),
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Database Relationships

```
users (1) ----< (N) refresh_tokens
users (1) ----< (N) sessions
users (1) ----< (N) auth_audit_log (optional FK)
```

### Indexing Strategy

**Performance-Optimized Indexes:**

```sql
-- Users table
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Sessions table
CREATE UNIQUE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_active ON sessions(user_id, is_active)
  WHERE is_active = true AND revoked_at IS NULL;
CREATE INDEX idx_sessions_cleanup ON sessions(expires_at, is_active)
  WHERE revoked_at IS NULL;

-- Refresh tokens
CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_expires ON refresh_tokens(expires_at);
```

### Database Triggers & Functions

**1. Auto-Update Timestamp Trigger**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

**2. Auto-Revoke Expired Sessions**
```sql
CREATE OR REPLACE FUNCTION auto_revoke_expired_sessions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at <= CURRENT_TIMESTAMP AND NEW.revoked_at IS NULL THEN
    NEW.is_active := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**3. Enforce Max Sessions Per User (5)**
```sql
CREATE OR REPLACE FUNCTION enforce_max_sessions_per_user()
RETURNS TRIGGER AS $$
DECLARE
  max_sessions INTEGER := 5;
  current_count INTEGER;
  oldest_session_id UUID;
BEGIN
  -- Count and revoke oldest if exceeds max
END;
$$ LANGUAGE plpgsql;
```

**4. Cleanup Expired Sessions**
```sql
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
BEGIN
  -- Delete sessions expired more than 7 days ago
END;
$$ LANGUAGE plpgsql;
```

### Database Strengths

1. **Production-Grade Schema**: UUIDs, proper constraints, cascading deletes
2. **Comprehensive Indexing**: Performance-optimized indexes for common queries
3. **Security Audit Trail**: auth_audit_log tracks all authentication events
4. **Session Management**: Device tracking, automatic expiration, session limits
5. **Connection Pooling**: Optimized pool with query caching and monitoring
6. **SSL Support**: Configurable SSL with certificate validation in production
7. **Migration System**: Version-controlled schema changes

### Database Weaknesses

1. **No Content Tables**: Schema only covers auth/sessions, missing content, topics, audio tables
2. **Limited Soft Deletes**: No soft delete pattern (is_deleted flags)
3. **No Partitioning**: Sessions and audit logs will grow indefinitely (consider partitioning)
4. **Manual Cleanup**: Requires periodic calls to cleanup_expired_sessions() (should be automated)
5. **No Read Replicas**: No read replica configuration for scaling reads
6. **Missing Materialized Views**: No precomputed aggregations for analytics

---

## 5. Authentication & Authorization Architecture

### Authentication Stack

**Multi-Layer Security Architecture:**

```
┌─────────────────────────────────────────────────────┐
│                   Client Layer                       │
│  - HTTP-Only Cookies (JWT)                          │
│  - CSRF Tokens (state-changing ops)                 │
│  - React Context (AuthContext)                      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                 Middleware Layer                     │
│  - Next.js Edge Middleware (middleware.ts)          │
│  - JWT Verification (jose library)                  │
│  - Token Refresh (automatic)                        │
│  - CSRF Validation                                  │
│  - Rate Limiting Check                              │
│  - Role-Based Access Control (RBAC)                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                  API Route Layer                     │
│  - Route-specific auth checks                       │
│  - Permission validation                            │
│  - Session management                               │
│  - Audit logging                                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                  Database Layer                      │
│  - users table (credentials, roles)                 │
│  - sessions table (active sessions)                 │
│  - refresh_tokens table (long-lived tokens)         │
│  - auth_audit_log table (security events)           │
└─────────────────────────────────────────────────────┘
```

### Authentication Flow

**1. Login Flow**
```typescript
POST /api/auth/login
  → Check rate limit (5 attempts / 15 minutes)
  → Validate credentials (bcrypt comparison)
  → Generate JWT access token (jose, 7 days)
  → Create session record in database
  → Generate refresh token (30 days)
  → Set HTTP-only cookie with access token
  → Log authentication event to audit log
  → Return user session + tokens
```

**2. Token Refresh Flow**
```typescript
POST /api/auth/refresh
  → Extract refresh token from request
  → Validate token not blacklisted
  → Verify token signature
  → Generate new access token (7 days)
  → Update session last_activity timestamp
  → Return new access token
```

**3. Middleware Protection**
```typescript
middleware.ts (Edge Runtime)
  → Extract JWT from cookie
  → Check token blacklist (Redis)
  → Verify token signature (jose)
  → Check token expiration
  → Validate user role for route
  → Refresh token if < 1 day remaining
  → Add user headers (X-User-Id, X-User-Role)
  → Apply security headers (CSP, HSTS, etc.)
```

### Authorization Model

**Role-Based Access Control (RBAC):**

```typescript
// lib/auth/types.ts
export type UserRole = 'admin' | 'editor' | 'viewer';

export const PERMISSIONS = {
  admin: {
    viewContent: true,
    editContent: true,
    deleteContent: true,
    manageUsers: true,
    viewAnalytics: true,
    manageSettings: true,
  },
  editor: {
    viewContent: true,
    editContent: true,
    deleteContent: false,
    manageUsers: false,
    viewAnalytics: true,
    manageSettings: false,
  },
  viewer: {
    viewContent: true,
    editContent: false,
    deleteContent: false,
    manageUsers: false,
    viewAnalytics: false,
    manageSettings: false,
  },
};
```

**Route-Level Protection:**

```typescript
// middleware.ts
const routeConfigs: RouteConfig[] = [
  // Public routes
  { path: '/api/auth/login', requireAuth: false },
  { path: '/api/auth/register', requireAuth: false },

  // Admin-only routes
  { path: '/admin/users', requireAuth: true, allowedRoles: ['admin'] },
  { path: '/admin/settings', requireAuth: true, allowedRoles: ['admin'] },

  // Editor and admin routes
  { path: '/admin/content/edit', requireAuth: true, allowedRoles: ['admin', 'editor'] },
  { path: '/api/content', requireAuth: true, allowedRoles: ['admin', 'editor'] },

  // All authenticated users
  { path: '/admin', requireAuth: true },
];
```

### Security Features

**1. CSRF Protection**
```typescript
// lib/auth/csrf.ts
- Required for state-changing operations (POST, PUT, DELETE)
- Token generation and verification
- Exempt routes: /api/auth/* (handle own CSRF)
```

**2. Rate Limiting (Distributed)**
```typescript
// lib/utils/rate-limiter.ts
export const RATE_LIMIT_CONFIG = {
  LOGIN: { MAX_ATTEMPTS: 5, WINDOW_MS: 900000 },
  API: { MAX_REQUESTS: 100, WINDOW_MS: 60000 },
  PASSWORD_RESET: { MAX_ATTEMPTS: 3, WINDOW_MS: 3600000 },
  REGISTRATION: { MAX_ATTEMPTS: 3, WINDOW_MS: 3600000 },
};
```

**3. Session Management**
```typescript
// lib/auth/session.ts
- Device tracking (IP, user-agent, browser, OS)
- Active session limit (5 per user)
- Automatic expiration (30 days)
- Manual session revocation
- Session activity tracking
```

**4. Password Policy**
```typescript
// lib/config/security.ts
export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
};
```

**5. Security Headers**
```typescript
// middleware.ts
response.headers.set('X-Frame-Options', 'DENY');
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('X-XSS-Protection', '1; mode=block');
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
```

**6. Audit Logging**
```typescript
// database/migrations/002_create_auth_tables.sql
auth_audit_log tracks:
- login, logout, token_refresh, password_change
- failed_login, account_locked, suspicious_activity
- registration, password_reset
```

### Authentication Strengths

1. **Edge Runtime Compatible**: Uses jose (not jsonwebtoken) for Edge compatibility
2. **Defense in Depth**: Multiple security layers (cookies, CSRF, rate limiting, RBAC)
3. **Comprehensive Audit Trail**: All authentication events logged
4. **Session Management**: Device tracking, session limits, automatic cleanup
5. **Token Refresh**: Automatic token renewal without user intervention
6. **Distributed Rate Limiting**: Redis-backed rate limiting across instances
7. **Production-Ready Security**: SSL enforcement, secure cookies, CSP headers

### Authentication Weaknesses

1. **No 2FA/MFA**: No two-factor authentication support
2. **No OAuth Providers**: No social login (Google, GitHub, etc.)
3. **Single Secret Key**: JWT uses single secret (consider key rotation)
4. **No Refresh Token Rotation**: Refresh tokens don't rotate on use
5. **Limited Password Reset**: Basic password reset flow (no security questions, recovery codes)
6. **No Account Lockout**: Failed login attempts don't lock accounts
7. **Session Fingerprinting**: Limited device fingerprinting (could detect session hijacking better)

---

## 6. State Management Approach

### State Management Architecture

**Hybrid State Management Strategy:**

```
┌─────────────────────────────────────────────────────┐
│           Server State (Database)                    │
│  - User accounts, sessions, content                 │
│  - PostgreSQL + Redis caching                       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│           Server Cache (Redis)                       │
│  - Query results (1-minute TTL)                     │
│  - Rate limit counters                              │
│  - Session blacklist                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│           API Layer (Next.js Routes)                 │
│  - REST endpoints for data access                   │
│  - Server-side data fetching                        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│           React Context (Client State)               │
│  AuthContext    - User authentication state         │
│  AudioContext   - Audio player state                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│           Component State (React useState)           │
│  - Form inputs, UI toggles, local data             │
└─────────────────────────────────────────────────────┘
```

### State Management Patterns

**1. React Context for Global State**

```typescript
// lib/contexts/AuthContext.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Global auth state management
  const login = useCallback(async (email, password) => {
    const response = await fetch('/api/auth/login', {...});
    setUser(data.user);
  }, []);

  return <AuthContext.Provider value={{ user, login, ... }}>
    {children}
  </AuthContext.Provider>;
}
```

**2. Custom Hooks for Encapsulation**

```typescript
// components/content-review/hooks/useContentManager.ts
export function useContentManager() {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadContent = useCallback(async () => {
    const response = await fetch('/api/content/list');
    setContent(response.data);
  }, []);

  return { content, isLoading, loadContent };
}
```

**3. Server-Side Caching**

```typescript
// lib/db/pool.ts - Query result caching
private queryCache: Map<string, CacheEntry> = new Map();
private cacheTTL = 60000; // 1 minute

async query(text: string, params?: any[]) {
  const cacheKey = this.getCacheKey(text, params);
  const cached = this.getCached(cacheKey);
  if (cached) return cached;

  const result = await this.pool.query(text, params);
  this.setCache(cacheKey, result);
  return result;
}
```

**4. Redis for Distributed State**

```typescript
// lib/cache/redis-cache.ts
class RedisCache {
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setEx(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
    return true;
  }
}
```

### State Flow Examples

**1. Authentication State Flow**

```
User clicks Login
  → AuthContext.login() called
  → POST /api/auth/login
  → Server validates credentials
  → Server creates session in database
  → Server returns user data + JWT
  → AuthContext updates user state
  → UI re-renders with authenticated state
  → Middleware protects subsequent requests
```

**2. Content Editing State Flow**

```
User loads content
  → useContentManager.loadContent()
  → GET /api/content/:id
  → Server checks query cache (Redis)
  → If miss, query PostgreSQL
  → Cache result in Redis (1 min TTL)
  → Return content to client
  → Component updates local state
  → User edits content (local state)
  → Auto-save triggered (debounced)
  → PUT /api/content/:id
  → Server invalidates cache
  → Database updated
  → Success response
```

### State Management Strengths

1. **Clear Boundaries**: Server state vs. client state clearly separated
2. **Minimal Client State**: Uses React Context sparingly (only auth, audio)
3. **Server-First**: Leverages Next.js server components where possible
4. **Caching Strategy**: Multi-layer caching (query cache, Redis)
5. **Custom Hooks**: Logic encapsulation prevents state duplication

### State Management Weaknesses

1. **No Client-Side State Library**: No Zustand, Redux, or Jotai for complex UI state
2. **Potential Stale Data**: 1-minute cache TTL may show outdated data
3. **No Optimistic Updates**: UI updates only after server response
4. **Limited Offline Support**: No service worker or IndexedDB for offline state
5. **No State Persistence**: Client state lost on refresh (except cookies)
6. **Prop Drilling Risk**: Deep component trees may pass props multiple levels

---

## 7. Build & Deployment Configuration

### Build Pipeline

**Next.js 15 Production Build:**

```json
// package.json scripts
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "jest --projects jest.config.client.js jest.config.server.js",
  "test:ci": "jest --ci --maxWorkers=2 --coverage"
}
```

**Build Configuration:**

```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,

  // ESLint disabled during builds (runs in CI)
  eslint: { ignoreDuringBuilds: true },

  // Type checking separate
  typescript: { ignoreBuildErrors: false },

  // Unique build IDs
  generateBuildId: async () => `hablas-${Date.now()}`,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    unoptimized: true,
  },

  experimental: {
    optimizeCss: false,
  },
};
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2017",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Test Configuration

**Dual Jest Configurations (Client + Server):**

```javascript
// jest.config.client.js - jsdom environment
{
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.client.test.[jt]s?(x)', '**/components/**/*.test.[jt]s?(x)'],
}

// jest.config.server.js - Edge runtime environment
{
  testEnvironment: '@edge-runtime/jest-environment',
  testMatch: ['**/__tests__/api/**/*.test.[jt]s', '**/__tests__/middleware/**/*.test.[jt]s'],
  maxWorkers: 1, // Sequential execution for server tests
}
```

### Deployment Platform

**Vercel (Production):**

```
Domain: https://hablas.co
Platform: Vercel
Framework: Next.js 15
Node Version: >=18.0.0
Build Command: npm run build
Output Directory: .next
Environment: Production
```

**Environment Variables:**

```bash
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=<32+ character secret>
ANTHROPIC_API_KEY=<Anthropic API key>

# Optional
REDIS_URL=<Redis connection string>
ADMIN_EMAIL=admin@hablas.co
ADMIN_PASSWORD=<secure password>
NEXT_PUBLIC_APP_URL=https://hablas.co

# Database Pool
DB_POOL_MAX=30
DB_IDLE_TIMEOUT=60000
DB_CONNECT_TIMEOUT=5000
```

### Build & Deployment Strengths

1. **Production-Ready Config**: Compression, security headers, build IDs
2. **Type Safety**: Strict TypeScript enforcement
3. **Comprehensive Testing**: Separate client/server test environments
4. **Edge Runtime Support**: Uses Edge-compatible libraries (jose)
5. **Image Optimization**: Modern formats (AVIF, WebP)
6. **Analytics Integration**: Vercel Analytics + Speed Insights
7. **PWA Support**: Manifest file, offline capabilities

### Build & Deployment Weaknesses

1. **No CI/CD Pipeline**: No GitHub Actions or automated deployment
2. **Manual Environment Config**: No infra-as-code (Terraform, Pulumi)
3. **Single Region**: No multi-region deployment for latency
4. **No Blue-Green Deployment**: No zero-downtime deployment strategy
5. **Limited Monitoring**: No Sentry, Datadog, or New Relic integration
6. **No Database Migrations in CI**: Manual migration execution required
7. **No Rollback Strategy**: No automated rollback on deployment failure

---

## 8. Key Architectural Decisions (ADRs)

### ADR-1: Next.js 15 App Router

**Decision:** Use Next.js 15 with App Router (not Pages Router)

**Rationale:**
- Server components reduce client-side JavaScript
- Improved performance with server-side rendering
- Better SEO for public-facing content
- Colocation of routes, layouts, and logic

**Trade-offs:**
- Learning curve for new paradigm
- Some libraries not compatible with server components

### ADR-2: PostgreSQL for Primary Database

**Decision:** Use PostgreSQL as primary database (not MongoDB, MySQL)

**Rationale:**
- ACID compliance for authentication and transactions
- Rich indexing capabilities for performance
- JSON support for flexible schema where needed
- Mature ecosystem and tooling

**Trade-offs:**
- Requires structured schema design upfront
- Scaling horizontally more complex than NoSQL

### ADR-3: JWT with HTTP-Only Cookies

**Decision:** Use JWT tokens stored in HTTP-only cookies

**Rationale:**
- Secure against XSS attacks (no localStorage access)
- Automatic token transmission with requests
- Edge runtime compatible (jose library)
- Stateless authentication for scalability

**Trade-offs:**
- Requires CSRF protection
- Cannot access token from JavaScript
- Cookie size limits (4KB)

### ADR-4: Redis for Caching & Rate Limiting

**Decision:** Use Redis for distributed caching and rate limiting

**Rationale:**
- Shared state across multiple server instances
- Fast in-memory operations for rate limiting
- Pub/sub for real-time features (future)
- TTL support for automatic expiration

**Trade-offs:**
- Additional infrastructure dependency
- Requires graceful degradation if Redis unavailable

### ADR-5: Edge Runtime for Middleware

**Decision:** Use Next.js Edge Runtime for middleware

**Rationale:**
- Global deployment (low latency)
- Fast cold starts
- Built-in JWT verification (jose)
- Automatic token refresh

**Trade-offs:**
- Limited Node.js API access
- Smaller package size limits
- Cannot use native Node.js modules

### ADR-6: Feature-Based Component Organization

**Decision:** Organize components by feature (not by type)

**Rationale:**
- Colocation of related components
- Easier to find components
- Supports independent feature development
- Aligns with domain-driven design

**Trade-offs:**
- Some duplication of shared components
- Requires clear feature boundaries

### ADR-7: Dual Jest Configurations (Client/Server)

**Decision:** Use separate Jest configs for client and server tests

**Rationale:**
- Different test environments (jsdom vs. Edge runtime)
- Isolated test execution (prevent conflicts)
- Faster test runs (parallel execution)
- Clear separation of concerns

**Trade-offs:**
- More configuration files
- Potential duplication of test utilities
- Requires running both suites in CI

---

## 9. Security Architecture

### Security Layers

**1. Network Layer**
- SSL/TLS enforcement in production (HSTS)
- Vercel edge network for DDoS protection
- Rate limiting at API level (distributed)

**2. Application Layer**
- CSRF protection for state-changing operations
- XSS protection via Content Security Policy
- SQL injection protection via parameterized queries
- Input validation (Zod schemas)
- Output sanitization (DOMPurify)

**3. Authentication Layer**
- JWT-based authentication (jose library)
- HTTP-only cookies (XSS protection)
- Token blacklist (Redis)
- Session management (device tracking)
- Password hashing (bcrypt, cost factor 10-12)

**4. Authorization Layer**
- Role-Based Access Control (RBAC)
- Permission-based component guards
- Route-level protection (middleware)
- Resource-level authorization (API routes)

**5. Data Layer**
- Database SSL in production
- Encrypted connections (TLS)
- Audit logging (authentication events)
- Session limits (5 per user)

### Security Configurations

**Password Policy:**
```typescript
MIN_LENGTH: 8
REQUIRE_UPPERCASE: true
REQUIRE_LOWERCASE: true
REQUIRE_NUMBER: true
REQUIRE_SPECIAL: true
```

**Rate Limiting:**
```typescript
LOGIN: 5 attempts / 15 minutes
API: 100 requests / 1 minute
PASSWORD_RESET: 3 attempts / 1 hour
REGISTRATION: 3 attempts / 1 hour
```

**Session Configuration:**
```typescript
TOKEN_EXPIRY: 7 days
REMEMBER_ME_EXPIRY: 30 days
REFRESH_TOKEN_EXPIRY: 30 days
MAX_SESSIONS_PER_USER: 5
```

**Security Headers:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Security Strengths

1. **Defense in Depth**: Multiple security layers
2. **Comprehensive Audit Trail**: All authentication events logged
3. **Modern Authentication**: JWT with refresh tokens
4. **Rate Limiting**: Distributed rate limiting (Redis)
5. **CSRF Protection**: Token-based CSRF validation
6. **Secure Defaults**: SSL, secure cookies, HSTS

### Security Weaknesses

1. **No WAF**: No Web Application Firewall
2. **No Secrets Management**: Uses environment variables (no Vault, AWS Secrets Manager)
3. **Limited Input Validation**: No centralized schema validation layer
4. **No Security Scanning**: No automated security audits (Snyk, Dependabot)
5. **No Penetration Testing**: No documented penetration testing
6. **Single JWT Secret**: No key rotation mechanism

---

## 10. Performance & Scalability

### Performance Optimizations

**1. Database Layer**
```typescript
// Connection pooling
max: 30 connections
idleTimeoutMillis: 60000
connectionTimeoutMillis: 5000

// Query caching
cacheTTL: 60000ms (1 minute)
maxCacheSize: 1000 entries
LRU eviction strategy

// Performance monitoring
slowQueryThreshold: 1000ms
```

**2. Redis Caching**
```typescript
// API response caching
TTL: Configurable per endpoint
Namespace-based cache keys
Automatic cache invalidation

// Cache statistics
Hit rate tracking
Cache size monitoring
```

**3. Image Optimization**
```javascript
// next.config.js
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60,
}
```

**4. Edge Runtime**
- Middleware runs on Edge (low latency)
- Global deployment (Vercel Edge Network)
- Fast cold starts

**5. Static Generation**
- Static page generation where possible
- Incremental Static Regeneration (ISR) support

### Scalability Considerations

**Horizontal Scaling:**
- Stateless authentication (JWT) enables multiple instances
- Redis for shared state (rate limiting, cache)
- Database connection pooling

**Vertical Scaling:**
- PostgreSQL tuning (max connections: 30)
- Redis memory limits
- Node.js memory limits

**Database Scaling:**
- Read replicas (not configured)
- Partitioning (not implemented)
- Caching layer (Redis)

### Performance Monitoring

**Available Metrics:**
```typescript
// Database metrics
GET /api/performance/metrics
{
  pool: { totalCount, idleCount, waitingCount },
  cache: { size, hitRate },
  queries: { total, slowQueries, avgDuration }
}

// Health check
GET /api/health
```

**Vercel Analytics:**
- Real User Monitoring (RUM)
- Web Vitals tracking
- Page load times

### Performance Strengths

1. **Multi-Layer Caching**: Query cache + Redis cache
2. **Slow Query Detection**: Automatic logging of slow queries
3. **Connection Pooling**: Optimized database connections
4. **Edge Deployment**: Low-latency middleware execution
5. **Image Optimization**: Modern formats (AVIF, WebP)

### Performance Weaknesses

1. **No CDN for Assets**: Static assets not on CDN (Cloudflare, CloudFront)
2. **No Read Replicas**: All reads hit primary database
3. **No Database Partitioning**: Large tables will slow down over time
4. **Limited Caching Strategy**: No cache warming, no stale-while-revalidate
5. **No Performance Budgets**: No automated performance regression testing
6. **No Request Batching**: No GraphQL or REST batching

---

## 11. Recommendations

### High Priority (Immediate)

1. **Add API Versioning**: Prefix routes with /api/v1/ for future breaking changes
2. **Implement Database Migration CI/CD**: Automate migration execution in deployment pipeline
3. **Add Content Tables to Schema**: Complete database schema with content, topics, audio tables
4. **Implement Automated Session Cleanup**: Schedule cleanup_expired_sessions() via cron or scheduled task
5. **Add OpenAPI/Swagger Documentation**: Auto-generate API documentation
6. **Implement Rollback Strategy**: Add automated rollback on deployment failure

### Medium Priority (Next Quarter)

7. **Add Two-Factor Authentication (2FA)**: Enhance security with TOTP or SMS
8. **Implement OAuth Providers**: Add Google, GitHub social login
9. **Add Read Replicas**: Separate read/write database connections
10. **Implement Database Partitioning**: Partition sessions and audit_log tables by date
11. **Add CI/CD Pipeline**: GitHub Actions for automated testing and deployment
12. **Implement Secrets Management**: Use Vault or AWS Secrets Manager
13. **Add Security Scanning**: Snyk or Dependabot for dependency vulnerabilities

### Low Priority (Future)

14. **Implement GraphQL API**: For complex data fetching (alternative to REST)
15. **Add Real-Time Features**: WebSocket support via Pusher or Socket.io
16. **Implement Micro-Frontends**: Split large features into independent apps
17. **Add Multi-Region Deployment**: Deploy to multiple Vercel regions
18. **Implement Service Worker**: Enhanced offline capabilities
19. **Add A/B Testing Framework**: Experiment framework for feature rollouts
20. **Implement Observability Stack**: Sentry + Datadog + OpenTelemetry

### Technical Debt

1. **Refactor Large Components**: Split AudioPlayer.tsx (18KB)
2. **Standardize Component Naming**: Consistent PascalCase for directories
3. **Reduce lib/ Directory Size**: Extract domain modules from lib/
4. **Add Pagination Pattern**: Standardize pagination across list endpoints
5. **Implement Optimistic Updates**: Update UI before server response
6. **Add Service Worker**: IndexedDB for offline state persistence

---

## 12. Conclusion

### Overall Assessment

Hablas demonstrates **professional-grade architecture** with strong separation of concerns, comprehensive security implementation, and production-ready patterns. The codebase reflects thoughtful design decisions, particularly in authentication, database schema, and API design.

**Architectural Maturity Score: 8/10**

**Strengths:**
- Clean, modular architecture with clear separation of concerns
- Production-ready authentication and authorization
- Comprehensive database schema with proper indexing
- Edge runtime compatibility for global deployment
- Multi-layer caching strategy
- Strong security posture (CSRF, rate limiting, audit logging)

**Areas for Improvement:**
- Complete database schema (missing content tables)
- API versioning for future changes
- Automated CI/CD pipeline
- Enhanced performance monitoring
- Multi-factor authentication
- Horizontal scalability (read replicas, partitioning)

### Architecture Alignment with Goals

**Target Audience (Colombian Gig Workers):**
- ✅ Mobile-first design
- ✅ Offline capabilities
- ✅ Bilingual support
- ✅ PWA support

**Scalability:**
- ✅ Stateless authentication (horizontal scaling ready)
- ⚠️ Single database instance (vertical scaling only)
- ⚠️ No read replicas (read scaling limited)

**Security:**
- ✅ Enterprise-grade authentication
- ✅ Comprehensive audit logging
- ✅ Rate limiting and CSRF protection
- ⚠️ No 2FA (recommended for production)

**Developer Experience:**
- ✅ Clear project structure
- ✅ TypeScript throughout
- ✅ Comprehensive testing setup
- ⚠️ Missing API documentation (OpenAPI/Swagger)

### Final Verdict

The Hablas architecture is **production-ready** with some room for enhancement. The foundation is solid, security is comprehensive, and the codebase is maintainable. Implementing the high-priority recommendations will elevate the system to enterprise-grade maturity.

---

**Document Version:** 1.0
**Last Updated:** 2025-12-09
**Next Review:** Q1 2026
