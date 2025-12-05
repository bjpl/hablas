# Hablas System Architecture Analysis
**Date**: December 4, 2025
**Status**: Comprehensive Architectural Review
**Version**: 1.2.0

## Executive Summary

Hablas is a Next.js 15 application designed for English learning targeting Spanish-speaking gig workers. The system is **production-ready with significant technical debt** that requires systematic refactoring. While core functionality is sound, the codebase exhibits patterns that will hinder maintainability and scalability.

### Key Metrics
- **Framework**: Next.js 15, React 18, TypeScript 5.6
- **Database**: PostgreSQL with connection pooling
- **Cache**: Redis (optional, with in-memory fallback)
- **Storage**: Vercel Blob for media assets
- **Security**: JWT (jose), CSRF protection, Rate limiting
- **API Routes**: 21 endpoints
- **Test Files**: 351 (2 failing)
- **Coverage**: Not measured comprehensively
- **Console.log Count**: 2,101 statements
- **TypeScript 'any' types**: 29 instances in lib/

---

## 1. Current State Architecture

### 1.1 High-Level System Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Public App  │  │ Admin Portal │  │ Review Tools │         │
│  │  (pages)     │  │ (auth req'd) │  │ (editor+)    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                      MIDDLEWARE LAYER                             │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐   │
│  │ Auth Middleware│  │ CSRF Protection│  │ Rate Limiting   │   │
│  │ (JWT verify)   │  │ (state-change) │  │ (distributed)   │   │
│  └────────┬───────┘  └────────┬───────┘  └────────┬────────┘   │
│           │                    │                    │             │
└───────────┼────────────────────┼────────────────────┼────────────┘
            │                    │                    │
            └────────────────────┴────────────────────┘
                                 │
┌────────────────────────────────┼─────────────────────────────────┐
│                         API LAYER (21 routes)                     │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │   Auth     │  │  Content   │  │   Topics   │  │  Media   │  │
│  │ (8 routes) │  │ (5 routes) │  │ (4 routes) │  │(2 routes)│  │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └────┬─────┘  │
│        │               │               │               │         │
└────────┼───────────────┼───────────────┼───────────────┼─────────┘
         │               │               │               │
         └───────────────┴───────────────┴───────────────┘
                                 │
┌────────────────────────────────┼─────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                         │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐            │
│  │    Auth     │  │   Content    │  │   Topics    │            │
│  │  Services   │  │  Validation  │  │  Management │            │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘            │
│         │                 │                  │                   │
└─────────┼─────────────────┼──────────────────┼───────────────────┘
          │                 │                  │
          └─────────────────┴──────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                      DATA ACCESS LAYER                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │ Vercel Blob  │          │
│  │  (Pool mgmt) │  │  (Optional)  │  │  (Media)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                      STORAGE LAYER                                │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │   Blob       │          │
│  │   Database   │  │  (Sessions,  │  │  Storage     │          │
│  │              │  │   Cache)     │  │  (Audio/Img) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 1.2 Directory Structure Analysis

```
hablas/
├── app/                      # Next.js App Router (presentation)
│   ├── admin/               # Admin portal (auth required)
│   │   ├── edit/[id]/       # Content editing
│   │   ├── login/           # Admin login
│   │   ├── topics/          # Topic management
│   │   └── page.tsx         # Admin dashboard
│   ├── api/                 # API routes (21 endpoints)
│   │   ├── auth/            # 8 auth routes
│   │   ├── content/         # 5 content routes
│   │   ├── topics/          # 4 topic routes
│   │   ├── audio/           # 2 audio routes
│   │   ├── media/           # 1 media route
│   │   ├── health/          # 1 health check
│   │   └── performance/     # 1 metrics route
│   ├── comunidad/           # Community page
│   ├── perfil/              # User profile
│   ├── practica/            # Practice exercises
│   ├── recursos/            # Learning resources
│   ├── review/              # Content review
│   └── page.tsx             # Homepage
│
├── lib/                     # Business logic & utilities
│   ├── auth/                # Authentication (9 files)
│   │   ├── jwt.ts           # JWT operations (jose)
│   │   ├── session.ts       # Session management
│   │   ├── users.ts         # User operations
│   │   ├── csrf.ts          # CSRF protection
│   │   ├── cookies.ts       # Cookie helpers
│   │   ├── permissions.ts   # RBAC logic
│   │   └── validation.ts    # Auth validation
│   ├── cache/               # Cache layer
│   │   └── redis-cache.ts   # Redis wrapper
│   ├── db/                  # Database layer
│   │   ├── pool.ts          # Connection pooling
│   │   ├── redis.ts         # Redis client
│   │   ├── sessions.ts      # Session DB ops
│   │   └── users.ts         # User DB ops
│   ├── config/              # Configuration
│   │   └── security.ts      # Security settings
│   ├── utils/               # Utilities
│   │   ├── logger.ts        # Structured logging
│   │   ├── rate-limiter.ts  # Rate limiting
│   │   └── cors.ts          # CORS helpers
│   ├── types/               # TypeScript types
│   ├── validation/          # Input validation
│   ├── content-validation/  # Content-specific validation
│   └── topics/              # Topic management
│
├── components/              # React components
│   ├── admin/               # Admin components
│   ├── auth/                # Auth components
│   ├── content-review/      # Review tools
│   ├── media-review/        # Media review
│   ├── topic-review/        # Topic review
│   ├── triple-comparison/   # Comparison tools
│   └── ui/                  # UI components
│
├── data/                    # Static data
│   └── resources/           # Learning resources (JSON)
│       ├── app-specific/
│       ├── avanzado/
│       └── emergency/
│
├── database/                # Database scripts
│   └── scripts/             # DB initialization
│
├── docs/                    # Documentation
│   ├── analysis/            # Analysis reports
│   └── architecture/        # Architecture docs
│
├── tests/                   # Test files (351 tests)
│
└── scripts/                 # Utility scripts
```

### 1.3 Technology Stack

**Frontend**
- Next.js 15 (App Router)
- React 18
- TypeScript 5.6
- Tailwind CSS 3.4

**Backend**
- Next.js API Routes (Edge Runtime)
- PostgreSQL (primary database)
- Redis (optional caching/sessions)
- Vercel Blob (media storage)

**Authentication & Security**
- JWT with jose library (Edge-compatible)
- CSRF protection
- Rate limiting (distributed with Redis)
- Role-based access control (admin/editor/viewer)

**Development & Testing**
- Jest 30.2 (dual config: client/server)
- Testing Library
- ESLint 9, TypeScript strict mode
- tsx for script execution

---

## 2. Technical Debt Assessment

### 2.1 Critical Issues

#### **2.1.1 Logging Practices (CRITICAL)**
- **Problem**: 2,101 `console.log` statements across codebase
- **Impact**:
  - No structured logging in production
  - Cannot filter logs by severity
  - Difficult to trace errors across distributed systems
  - Performance overhead
- **Root Cause**: `lib/utils/logger.ts` exists but underutilized
- **Evidence**: Only 4 files use structured logging (auth/, db/, cache/)

#### **2.1.2 ESLint Disabled in Build (HIGH)**
- **Problem**: `eslint.ignoreDuringBuilds: true` in `next.config.js`
- **Impact**:
  - Code quality issues bypass CI/CD
  - Type safety compromised
  - Maintenance difficulties
- **Root Cause**: Warnings treated as errors in CI, quick fix applied

#### **2.1.3 Test Configuration Fragmentation (HIGH)**
- **Problem**: 3 separate Jest configs with overlap
  - `jest.config.js` (unused?)
  - `jest.config.client.js` (client tests)
  - `jest.config.server.js` (server tests)
- **Impact**:
  - Confusion about which config applies
  - Duplicate configuration
  - Harder to maintain
- **Evidence**: Root config appears abandoned but not removed

#### **2.1.4 TypeScript Type Safety (MEDIUM)**
- **Problem**: 29 `any` types in lib/ directory
- **Impact**:
  - Runtime errors not caught at compile time
  - IDE autocomplete broken
  - Refactoring risks increased
- **Locations**: Scattered across utils, auth, and db modules

### 2.2 Architecture Concerns

#### **2.2.1 Mixed Data Access Patterns**
**Current State**:
- Some API routes use database layer (`lib/db/`)
- Some API routes use file system directly (`fs/promises`)
- Content edits stored in JSON files (`data/content-edits.json`)
- Learning resources stored in JSON files (`data/resources/`)

**Problems**:
1. Inconsistent data persistence strategy
2. JSON files don't scale (no transactions, locking, indexing)
3. File-based storage conflicts with serverless/edge deployment
4. Difficult to implement ACID guarantees

**Example**: `app/api/content/save/route.ts` writes to JSON file directly:
```typescript
const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');
const editsData = await fs.readFile(editsPath, 'utf-8');
const data = JSON.parse(editsData);
// ... mutations ...
await fs.writeFile(editsPath, JSON.stringify(data, null, 2), 'utf-8');
```

**Recommendation**: Migrate all persistent data to PostgreSQL.

#### **2.2.2 Cache Layer Underutilization**
**Current State**:
- Redis cache wrapper exists (`lib/cache/redis-cache.ts`)
- Sophisticated features: namespacing, TTL, getOrSet, batch operations
- **Problem**: Not used consistently across API routes

**Opportunities**:
1. Cache learning resources (currently read from JSON on every request)
2. Cache topic listings
3. Cache user sessions (currently in PostgreSQL)
4. Cache rate limit counters more efficiently

**Impact**: Unnecessary database load, slower responses

#### **2.2.3 Authentication Architecture**
**Strengths**:
- JWT with jose (Edge-compatible)
- CSRF protection on state-changing routes
- Rate limiting
- Session management with refresh tokens
- Role-based access control

**Weaknesses**:
1. Session storage in PostgreSQL adds latency
   - Should use Redis for session storage
2. Token blacklist implementation unclear
   - `isTokenBlacklisted()` called but implementation not examined
3. CSRF token verification in middleware but no clear token generation endpoint

**Recommendation**: Move sessions to Redis, document CSRF flow

#### **2.2.4 Component Organization**
**Issues**:
1. Flat component structure (no clear hierarchy)
2. Review tools split across 3 directories:
   - `components/content-review/`
   - `components/media-review/`
   - `components/topic-review/`
3. No clear separation of shared vs. feature-specific components
4. `components/triple-comparison/` unclear purpose without documentation

**Recommendation**: Organize by feature domain with shared UI library

### 2.3 Security Assessment

#### **Strengths**
1. ✅ JWT secrets validated (min 32 chars)
2. ✅ SSL enforced in production
3. ✅ Password policy implemented
4. ✅ Rate limiting with distributed support
5. ✅ Security headers applied
6. ✅ CSRF protection on state-changing operations
7. ✅ HTTP-only cookies
8. ✅ Role-based access control

#### **Concerns**
1. ⚠️ CSRF implementation incomplete:
   - Token verification exists
   - Token generation endpoint not obvious
2. ⚠️ Session blacklist mechanism unclear
3. ⚠️ Admin password can be auto-generated but only logged once
4. ⚠️ No audit trail for security events
5. ⚠️ Content saved to JSON files (bypass database audit trail)

**Recommendation**: Security audit with penetration testing

### 2.4 Testing Architecture

#### **Issues**
1. **Dual configuration complexity**:
   - Client tests: jsdom environment
   - Server tests: edge-runtime environment
   - Overlap in setup files
2. **Test organization**:
   - 351 test files but no clear naming convention
   - Some in `__tests__/`, some in `*.test.ts`
3. **Coverage thresholds extremely low**:
   ```javascript
   coverageThreshold: {
     global: {
       branches: 10,
       functions: 10,
       lines: 12,
       statements: 12,
     }
   }
   ```
4. **2 failing tests** (mentioned in metrics)

**Recommendation**: Consolidate config, increase coverage targets, fix failing tests

---

## 3. Target State Recommendations

### 3.1 Layered Architecture (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
│  - Next.js pages (app/)                                         │
│  - React components (components/)                               │
│  - API routes (thin controllers)                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────────┐
│                   APPLICATION LAYER                              │
│  - Use cases / Services (lib/services/)                         │
│  - DTOs / Request/Response types                                │
│  - Input validation                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────────┐
│                     DOMAIN LAYER                                 │
│  - Business logic (lib/domain/)                                 │
│  - Domain models                                                │
│  - Business rules                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                             │
│  - Database repositories (lib/repositories/)                    │
│  - External service clients                                     │
│  - Cache, storage, messaging                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Recommended Directory Structure

```
hablas/
├── app/                          # Presentation layer only
│   ├── (public)/                 # Public routes
│   │   ├── page.tsx
│   │   ├── recursos/
│   │   ├── practica/
│   │   └── comunidad/
│   ├── (authenticated)/          # Auth-required routes
│   │   ├── perfil/
│   │   └── review/
│   ├── admin/                    # Admin routes
│   └── api/                      # Thin controllers
│       └── [domain]/
│           └── route.ts          # Delegates to services
│
├── lib/
│   ├── services/                 # Application layer
│   │   ├── auth/
│   │   │   ├── AuthService.ts
│   │   │   └── SessionService.ts
│   │   ├── content/
│   │   │   ├── ContentService.ts
│   │   │   └── TopicService.ts
│   │   └── media/
│   │       └── MediaService.ts
│   │
│   ├── domain/                   # Domain layer
│   │   ├── auth/
│   │   │   ├── User.ts
│   │   │   ├── Session.ts
│   │   │   └── rules/
│   │   │       └── PasswordPolicy.ts
│   │   ├── content/
│   │   │   ├── Resource.ts
│   │   │   ├── Topic.ts
│   │   │   └── rules/
│   │   └── shared/
│   │       └── ValueObjects.ts
│   │
│   ├── repositories/             # Infrastructure layer
│   │   ├── UserRepository.ts
│   │   ├── SessionRepository.ts
│   │   ├── ContentRepository.ts
│   │   └── TopicRepository.ts
│   │
│   ├── infrastructure/           # External integrations
│   │   ├── database/
│   │   │   ├── postgres/
│   │   │   │   ├── pool.ts
│   │   │   │   └── migrations/
│   │   │   └── redis/
│   │   │       └── client.ts
│   │   ├── storage/
│   │   │   └── blob.ts
│   │   └── external/
│   │       └── anthropic.ts
│   │
│   ├── shared/                   # Cross-cutting concerns
│   │   ├── logging/
│   │   │   └── Logger.ts
│   │   ├── validation/
│   │   ├── errors/
│   │   │   └── AppError.ts
│   │   └── types/
│   │
│   └── config/                   # Configuration
│       ├── app.ts
│       ├── database.ts
│       └── security.ts
│
├── components/                   # UI components
│   ├── ui/                       # Shared UI library
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Card/
│   ├── features/                 # Feature-specific components
│   │   ├── auth/
│   │   ├── content/
│   │   │   ├── ResourceCard.tsx
│   │   │   └── TopicList.tsx
│   │   ├── review/
│   │   │   ├── ContentReview/
│   │   │   ├── MediaReview/
│   │   │   └── TopicReview/
│   │   └── admin/
│   └── layout/                   # Layout components
│       ├── Header.tsx
│       └── Sidebar.tsx
│
├── tests/
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
│
└── database/
    ├── migrations/               # SQL migrations
    └── seeds/                    # Seed data
```

### 3.3 Data Flow Architecture

#### **Proposed Flow: API Request → Response**

```
1. Request → API Route Handler (app/api/[domain]/route.ts)
   ↓
2. Input Validation (Zod schemas)
   ↓
3. Service Layer (lib/services/)
   - Business logic orchestration
   - Transaction management
   - Error handling
   ↓
4. Domain Layer (lib/domain/)
   - Business rules enforcement
   - Domain model operations
   ↓
5. Repository Layer (lib/repositories/)
   - Data access abstraction
   - Query optimization
   - Cache integration
   ↓
6. Infrastructure (lib/infrastructure/)
   - Database operations
   - Redis operations
   - External APIs
   ↓
7. Response ← Service Layer
   - Format DTOs
   - Apply transformations
   ↓
8. Response ← API Route Handler
   - HTTP status codes
   - Headers
```

#### **Cache Strategy**

```
Request → Check Cache (Redis)
   ├─ Hit: Return cached response
   └─ Miss:
      ↓
      Query Database
      ↓
      Store in Cache (with TTL)
      ↓
      Return response
```

**Cache Keys Pattern**:
- Users: `user:{userId}`
- Sessions: `session:{sessionId}`
- Resources: `resource:{resourceId}`
- Topics: `topic:{slug}`
- Lists: `list:resources:{filters-hash}`

**TTL Strategy**:
- Users: 15 minutes
- Sessions: Session duration
- Resources: 1 hour (invalidate on update)
- Topics: 1 hour (invalidate on update)
- Lists: 5 minutes

---

## 4. Migration Path

### Phase 1: Stabilization (Weeks 1-2)

#### **1.1 Fix Critical Debt**

**Task 1.1.1: Replace console.log with structured logging**
- **Files affected**: All 2,101 instances
- **Approach**:
  1. Create ESLint rule to ban `console.log`
  2. Use `lib/utils/logger.ts` consistently
  3. Script to bulk-replace common patterns
- **Success criteria**: Zero `console.log` statements

**Task 1.1.2: Enable ESLint in builds**
- **Changes**:
  ```diff
  // next.config.js
  - eslint: { ignoreDuringBuilds: true },
  + eslint: { ignoreDuringBuilds: false },
  ```
- **Prerequisites**: All ESLint warnings fixed
- **Success criteria**: Clean build with zero warnings

**Task 1.1.3: Consolidate test configuration**
- **Changes**:
  1. Remove `jest.config.js` (root)
  2. Keep dual config (client/server) but reduce duplication
  3. Create shared config base: `jest.config.base.js`
- **Success criteria**: All 351 tests pass

**Task 1.1.4: Fix TypeScript 'any' types**
- **Locations**: 29 instances in lib/
- **Approach**:
  1. Create interfaces for external library types
  2. Use generics where appropriate
  3. Use `unknown` for truly dynamic types
- **Success criteria**: Zero `any` types in lib/

#### **1.2 Documentation**

**Task 1.2.1: Architecture Decision Records (ADRs)**
- Document why Next.js 15 chosen
- Document why jose library (Edge compatibility)
- Document dual database strategy (PostgreSQL + JSON files)

**Task 1.2.2: API Documentation**
- Document all 21 API routes
- Request/response schemas
- Authentication requirements
- Rate limits

### Phase 2: Data Migration (Weeks 3-4)

#### **2.1 Migrate JSON Data to PostgreSQL**

**Task 2.1.1: Design database schema**
```sql
-- Content edits table
CREATE TABLE content_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id VARCHAR(255) NOT NULL,
  original_content JSONB,
  edited_content JSONB NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  edited_by UUID REFERENCES users(id),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Edit history table
CREATE TABLE edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_edit_id UUID REFERENCES content_edits(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  edited_by UUID REFERENCES users(id),
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) UNIQUE NOT NULL, -- Original JSON filename
  category VARCHAR(100) NOT NULL,
  level VARCHAR(50),
  content JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_level ON resources(level);
CREATE INDEX idx_content_edits_resource_id ON content_edits(resource_id);
CREATE INDEX idx_edit_history_content_edit_id ON edit_history(content_edit_id);
```

**Task 2.1.2: Data migration script**
- Read JSON files from `data/resources/`
- Transform to database format
- Insert into PostgreSQL
- Verify data integrity
- Keep JSON files as backup

**Task 2.1.3: Update API routes**
- Replace file system operations
- Use repository pattern
- Add caching layer

### Phase 3: Architecture Refactoring (Weeks 5-8)

#### **3.1 Implement Layered Architecture**

**Task 3.1.1: Create service layer**
- Extract business logic from API routes
- Create `lib/services/` directory
- Implement dependency injection

**Example**:
```typescript
// lib/services/content/ContentService.ts
export class ContentService {
  constructor(
    private contentRepo: ContentRepository,
    private cache: CacheService,
    private logger: Logger
  ) {}

  async getResource(id: string): Promise<Resource> {
    // Check cache
    const cached = await this.cache.get(`resource:${id}`);
    if (cached) {
      this.logger.debug('Cache hit for resource', { id });
      return cached;
    }

    // Query database
    const resource = await this.contentRepo.findById(id);
    if (!resource) {
      throw new ResourceNotFoundError(id);
    }

    // Store in cache
    await this.cache.set(`resource:${id}`, resource, { ttl: 3600 });

    return resource;
  }

  async updateResource(
    id: string,
    updates: Partial<Resource>,
    userId: string
  ): Promise<Resource> {
    // Domain validation
    const resource = await this.contentRepo.findById(id);
    if (!resource) {
      throw new ResourceNotFoundError(id);
    }

    // Apply business rules
    resource.validate(updates);

    // Save
    const updated = await this.contentRepo.update(id, updates);

    // Invalidate cache
    await this.cache.delete(`resource:${id}`);

    // Audit log
    this.logger.info('Resource updated', { id, userId });

    return updated;
  }
}
```

**Task 3.1.2: Create repository layer**
- Abstract database operations
- Implement caching at repository level
- Support transactions

**Example**:
```typescript
// lib/repositories/ContentRepository.ts
export class ContentRepository {
  constructor(
    private db: DatabasePool,
    private cache: CacheService
  ) {}

  async findById(id: string): Promise<Resource | null> {
    const result = await this.db.query(
      'SELECT * FROM resources WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async update(id: string, updates: Partial<Resource>): Promise<Resource> {
    const result = await this.db.query(
      `UPDATE resources
       SET content = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(updates.content), id]
    );
    return result.rows[0];
  }

  async findByCategory(category: string): Promise<Resource[]> {
    const cacheKey = `resources:category:${category}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const result = await this.db.query(
        'SELECT * FROM resources WHERE category = $1',
        [category]
      );
      return result.rows;
    }, { ttl: 300 });
  }
}
```

#### **3.2 Implement Caching Strategy**

**Task 3.2.1: Redis session storage**
- Move sessions from PostgreSQL to Redis
- Implement session cleanup
- Add session statistics

**Task 3.2.2: Resource caching**
- Cache learning resources (high read, low write)
- Implement cache invalidation on updates
- Monitor cache hit rates

**Task 3.2.3: List caching**
- Cache topic lists, resource lists
- Implement cache warming on deploy
- Add cache busting for admin operations

### Phase 4: Testing & Quality (Weeks 9-10)

#### **4.1 Increase Test Coverage**

**Task 4.1.1: Unit tests**
- Target: 80% coverage for services
- Target: 70% coverage for repositories
- Use dependency injection for testability

**Task 4.1.2: Integration tests**
- Test database operations
- Test cache operations
- Test API routes end-to-end

**Task 4.1.3: E2E tests**
- Critical user flows
- Authentication flows
- Content creation/editing flows

#### **4.2 Performance Testing**

**Task 4.2.1: Load testing**
- Use k6 (already in package.json)
- Test API endpoints under load
- Identify bottlenecks

**Task 4.2.2: Database optimization**
- Add missing indexes
- Optimize slow queries
- Implement connection pooling improvements

### Phase 5: Production Hardening (Weeks 11-12)

#### **5.1 Security Audit**

**Task 5.1.1: Complete CSRF implementation**
- Document token generation
- Add CSRF token endpoint
- Update documentation

**Task 5.1.2: Audit trail**
- Log all state changes
- Track user actions
- Implement audit log table

**Task 5.1.3: Penetration testing**
- External security audit
- Fix identified vulnerabilities
- Update security documentation

#### **5.2 Monitoring & Observability**

**Task 5.2.1: Application monitoring**
- Implement APM (Vercel Analytics already included)
- Track error rates
- Monitor performance metrics

**Task 5.2.2: Database monitoring**
- Track slow queries
- Monitor connection pool usage
- Alert on connection exhaustion

**Task 5.2.3: Cache monitoring**
- Track hit rates
- Monitor memory usage
- Alert on cache failures

---

## 5. Specific File Changes

### Phase 1: Stabilization

#### **File: lib/utils/logger.ts** (No changes - already good)

#### **File: eslint.config.mjs**
```diff
{
  rules: {
-   "@typescript-eslint/no-explicit-any": "warn",
+   "@typescript-eslint/no-explicit-any": "error",
-   "@typescript-eslint/no-unused-vars": "warn",
+   "@typescript-eslint/no-unused-vars": "error",
+   "no-console": ["error", { allow: ["error"] }],
  }
}
```

#### **File: next.config.js**
```diff
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
- eslint: {
-   ignoreDuringBuilds: true,
- },
  typescript: {
    ignoreBuildErrors: false,
  },
}
```

#### **File: package.json** (Add scripts)
```diff
"scripts": {
+ "lint:fix": "eslint . --fix",
+ "test:coverage:report": "jest --coverage --coverageReporters=html text",
+ "db:migrate:up": "tsx database/scripts/migrate.ts up",
+ "db:migrate:down": "tsx database/scripts/migrate.ts down",
+ "cache:clear": "tsx scripts/clear-cache.ts",
}
```

### Phase 2: Data Migration

#### **New File: database/migrations/001_create_content_tables.sql**
```sql
-- See schema in Phase 2 section above
```

#### **New File: lib/repositories/ContentRepository.ts**
```typescript
// See example in Phase 3 section above
```

#### **Modified File: app/api/content/save/route.ts**
```diff
-import fs from 'fs/promises';
-import path from 'path';
+import { ContentService } from '@/lib/services/content/ContentService';
+import { apiLogger } from '@/lib/utils/logger';

export async function POST(request: Request) {
  try {
    const body: SaveContentRequest = await request.json();
-   const { resourceId, editedContent, status = 'pending', editedBy, comments } = body;
+   const service = new ContentService();
+   const result = await service.saveContent(body);

-   // Read current edits data
-   const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');
-   const editsData = await fs.readFile(editsPath, 'utf-8');
-   // ... (remove 100+ lines of file manipulation)

-   return NextResponse.json(response);
+   return NextResponse.json(result);
  } catch (error) {
-   console.error('Error saving content:', error);
+   apiLogger.error('Error saving content', error);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}
```

### Phase 3: Architecture Refactoring

#### **New File: lib/services/content/ContentService.ts**
```typescript
import { ContentRepository } from '@/lib/repositories/ContentRepository';
import { CacheService } from '@/lib/infrastructure/cache/CacheService';
import { Logger } from '@/lib/shared/logging/Logger';
import type { Resource, SaveContentRequest } from '@/lib/domain/content/types';

export class ContentService {
  constructor(
    private contentRepo: ContentRepository,
    private cache: CacheService,
    private logger: Logger
  ) {}

  async saveContent(request: SaveContentRequest): Promise<{ editId: string }> {
    this.logger.info('Saving content', { resourceId: request.resourceId });

    // Validate input
    // ... validation logic

    // Business logic
    const edit = await this.contentRepo.createEdit(request);

    // Invalidate cache
    await this.cache.deleteNamespace('resources');

    return { editId: edit.id };
  }

  // ... other methods
}
```

---

## 6. Architecture Decision Records (ADRs)

### ADR-001: Migrate from JSON Files to PostgreSQL

**Status**: Proposed
**Date**: 2025-12-04
**Context**:
- Content edits and learning resources currently stored in JSON files
- JSON files don't support transactions, concurrent writes, or indexing
- Serverless/Edge deployments may have read-only file systems

**Decision**: Migrate all persistent data to PostgreSQL

**Consequences**:
- ✅ ACID transactions
- ✅ Better query performance with indexes
- ✅ Concurrent write support
- ✅ Compatible with serverless deployment
- ❌ Migration effort required
- ❌ Increased database costs

**Alternatives Considered**:
1. Keep JSON files → Rejected: doesn't scale
2. Use MongoDB → Rejected: team familiar with PostgreSQL
3. Use SQLite → Rejected: doesn't support concurrent writes well

---

### ADR-002: Implement Layered Architecture

**Status**: Proposed
**Date**: 2025-12-04
**Context**:
- Business logic currently mixed with API route handlers
- Difficult to test business logic in isolation
- No clear separation of concerns

**Decision**: Implement clean architecture with 4 layers:
1. Presentation (API routes, components)
2. Application (services, use cases)
3. Domain (business logic, models)
4. Infrastructure (database, cache, external services)

**Consequences**:
- ✅ Improved testability
- ✅ Clearer code organization
- ✅ Easier to swap implementations
- ❌ More boilerplate code
- ❌ Learning curve for team

---

### ADR-003: Use Redis for Session Storage

**Status**: Proposed
**Date**: 2025-12-04
**Context**:
- Sessions currently stored in PostgreSQL
- Session lookups on every authenticated request add latency
- Redis cache already available (optional)

**Decision**: Move session storage from PostgreSQL to Redis

**Consequences**:
- ✅ Faster session lookups
- ✅ Reduced database load
- ✅ Built-in TTL support
- ❌ Redis becomes required (not optional)
- ❌ Need migration strategy

**Alternatives Considered**:
1. Keep in PostgreSQL → Rejected: slower
2. Use JWT only (stateless) → Rejected: can't revoke tokens easily
3. Use in-memory sessions → Rejected: doesn't scale horizontally

---

### ADR-004: Structured Logging Standard

**Status**: Proposed
**Date**: 2025-12-04
**Context**:
- 2,101 `console.log` statements across codebase
- No structured logging in production
- Difficult to filter/search logs

**Decision**: Mandate use of `lib/utils/logger.ts` for all logging

**Consequences**:
- ✅ Structured logs for production
- ✅ Filterable by severity
- ✅ Contextual information included
- ❌ Bulk replacement effort (2,101 instances)

**Implementation**:
- ESLint rule: ban `console.log`
- Script to bulk-replace common patterns
- Team training on logger usage

---

## 7. Implementation Priorities

### Priority Matrix

| Change | Impact | Effort | Priority | Risk |
|--------|--------|--------|----------|------|
| Replace console.log | High | High | **P0** | Low |
| Enable ESLint | High | Medium | **P0** | Medium |
| Fix TypeScript 'any' | Medium | Low | **P0** | Low |
| Consolidate test config | Low | Low | **P1** | Low |
| Migrate JSON to DB | High | High | **P1** | High |
| Implement service layer | High | High | **P1** | Medium |
| Redis session storage | Medium | Medium | **P2** | Medium |
| Component reorganization | Low | Medium | **P2** | Low |
| Increase test coverage | Medium | High | **P2** | Low |
| Security audit | High | Medium | **P3** | Medium |

### Recommended Phasing

**Sprint 1-2 (Weeks 1-2): Code Quality**
- P0 items: console.log, ESLint, TypeScript 'any'
- Low risk, high impact
- Establishes quality standards

**Sprint 3-4 (Weeks 3-4): Data Foundation**
- P1: Migrate JSON to PostgreSQL
- P1: Create repository layer
- High risk, requires careful testing

**Sprint 5-8 (Weeks 5-8): Architecture**
- P1: Implement service layer
- P2: Redis session storage
- P2: Component reorganization
- Medium risk, improves maintainability

**Sprint 9-10 (Weeks 9-10): Quality Assurance**
- P2: Increase test coverage
- Integration testing
- Performance testing

**Sprint 11-12 (Weeks 11-12): Production Hardening**
- P3: Security audit
- Monitoring & observability
- Documentation finalization

---

## 8. Success Criteria

### Phase 1: Stabilization
- [ ] Zero `console.log` statements
- [ ] ESLint passing with zero warnings
- [ ] Zero TypeScript `any` types in lib/
- [ ] All 351 tests passing
- [ ] Test configuration consolidated

### Phase 2: Data Migration
- [ ] All JSON data migrated to PostgreSQL
- [ ] Data integrity verified
- [ ] API routes updated to use database
- [ ] JSON files kept as backup only

### Phase 3: Architecture
- [ ] Service layer implemented for all domains
- [ ] Repository layer abstracts all data access
- [ ] Sessions moved to Redis
- [ ] Cache hit rate > 70% for resources

### Phase 4: Testing
- [ ] Unit test coverage > 80% for services
- [ ] Integration test coverage > 60%
- [ ] All critical flows have E2E tests
- [ ] Load testing passes for expected traffic

### Phase 5: Production
- [ ] Security audit completed with no critical issues
- [ ] Monitoring dashboards configured
- [ ] Documentation complete and up-to-date
- [ ] Deployment runbook created

---

## 9. Risk Mitigation

### Risk 1: Data Migration Failure
**Probability**: Medium
**Impact**: Critical
**Mitigation**:
- Create backup of all JSON files
- Run migration in staging first
- Implement rollback script
- Test data integrity thoroughly
- Keep JSON files as fallback for 30 days

### Risk 2: Performance Regression
**Probability**: Low
**Impact**: High
**Mitigation**:
- Benchmark current performance before changes
- Monitor key metrics during migration
- Load test each phase
- Have rollback plan ready

### Risk 3: Team Knowledge Gap
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Document all architectural decisions
- Conduct team training sessions
- Pair programming during implementation
- Code review for knowledge transfer

### Risk 4: Breaking Changes in Production
**Probability**: Low
**Impact**: Critical
**Mitigation**:
- Feature flags for major changes
- Gradual rollout (canary deployment)
- Comprehensive testing in staging
- Monitoring and alerting
- Quick rollback capability

---

## 10. Conclusion

The Hablas platform has a **solid technical foundation** with modern tools (Next.js 15, PostgreSQL, Redis) and **good security practices** (JWT, CSRF, rate limiting). However, **significant technical debt** in logging, configuration, and architecture will hinder long-term maintainability.

### Key Takeaways

1. **Immediate Action Required**:
   - Replace 2,101 console.log statements
   - Enable ESLint in builds
   - Fix TypeScript type safety

2. **Strategic Migration**:
   - Move from JSON files to PostgreSQL
   - Implement layered architecture
   - Leverage Redis caching

3. **Long-term Investment**:
   - Increase test coverage
   - Security hardening
   - Monitoring & observability

### Estimated Timeline
- **12 weeks** for complete migration
- **4 weeks** for stabilization (can ship)
- **8 weeks** for architecture improvements

### Resource Requirements
- **1 Senior Backend Engineer** (full-time)
- **1 Senior Frontend Engineer** (part-time, weeks 5-8)
- **1 QA Engineer** (weeks 9-10)
- **1 Security Auditor** (week 11)

---

**Next Steps**:
1. Review this analysis with engineering team
2. Prioritize phases based on business needs
3. Allocate resources for Phase 1 (stabilization)
4. Create detailed task breakdown for Sprint 1

---

*Document prepared by: System Architecture Designer*
*Review status: Pending engineering team approval*
