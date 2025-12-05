# Hablas Component Architecture Diagram

## Current State Component Map

### System Overview
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   Homepage   │  │   Recursos   │  │   Practica   │                 │
│  │              │  │              │  │              │                 │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
│         │                  │                  │                          │
│         │                  │                  │                          │
│  ┌──────┴──────────────────┴──────────────────┴───────┐                │
│  │         Next.js App Router (Client-Side)           │                │
│  │  - React 18 Components                              │                │
│  │  - Client-side state management                     │                │
│  │  - Form handling                                    │                │
│  └─────────────────────────┬───────────────────────────┘                │
│                            │                                             │
└────────────────────────────┼─────────────────────────────────────────────┘
                             │ HTTPS
                             │
┌────────────────────────────┼─────────────────────────────────────────────┐
│                     NEXT.JS SERVER (Edge)                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    MIDDLEWARE LAYER                                │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │  middleware.ts                                                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │   Auth   │  │   CSRF   │  │  Rate    │  │ Security │         │  │
│  │  │  Verify  │  │  Check   │  │  Limit   │  │ Headers  │         │  │
│  │  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘         │  │
│  │        │             │             │             │                │  │
│  │        └─────────────┴─────────────┴─────────────┘                │  │
│  │                       │                                            │  │
│  │              ┌────────┴────────┐                                   │  │
│  │              │ Continue / Deny  │                                  │  │
│  │              └────────┬────────┘                                   │  │
│  └───────────────────────┼────────────────────────────────────────────┘  │
│                          │                                               │
│  ┌───────────────────────┼────────────────────────────────────────────┐  │
│  │                  API ROUTES LAYER                                  │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │                                                                    │  │
│  │  ┌────────────────────┐                                           │  │
│  │  │   app/api/auth/    │  (8 routes)                               │  │
│  │  │  ├─ login          │  POST: Authenticate user                  │  │
│  │  │  ├─ logout         │  POST: End session                        │  │
│  │  │  ├─ register       │  POST: Create user                        │  │
│  │  │  ├─ refresh        │  POST: Refresh token                      │  │
│  │  │  ├─ me             │  GET: Current user                        │  │
│  │  │  └─ password-reset │  POST: Reset password                     │  │
│  │  └─────────┬──────────┘                                           │  │
│  │            │                                                       │  │
│  │  ┌─────────┴──────────┐                                           │  │
│  │  │  app/api/content/  │  (5 routes)                               │  │
│  │  │  ├─ list           │  GET: List all content                    │  │
│  │  │  ├─ save           │  POST: Save edits                         │  │
│  │  │  ├─ [id]           │  GET/PUT/DELETE: CRUD                     │  │
│  │  │  ├─ [id]/review    │  POST: Approve/reject                     │  │
│  │  │  └─ [id]/history   │  GET: Edit history                        │  │
│  │  └─────────┬──────────┘                                           │  │
│  │            │                                                       │  │
│  │  ┌─────────┴──────────┐                                           │  │
│  │  │  app/api/topics/   │  (4 routes)                               │  │
│  │  │  ├─ list           │  GET: List topics                         │  │
│  │  │  ├─ route          │  POST: Create topic                       │  │
│  │  │  ├─ [slug]         │  GET/PUT/DELETE: CRUD                     │  │
│  │  │  └─ [slug]/save    │  POST: Save topic                         │  │
│  │  └─────────┬──────────┘                                           │  │
│  │            │                                                       │  │
│  │  ┌─────────┴──────────┐                                           │  │
│  │  │  app/api/audio/    │  (2 routes)                               │  │
│  │  │  ├─ upload         │  POST: Upload audio                       │  │
│  │  │  └─ [id]           │  GET/DELETE: Manage audio                 │  │
│  │  └─────────┬──────────┘                                           │  │
│  │            │                                                       │  │
│  │  ┌─────────┴──────────┐                                           │  │
│  │  │  app/api/media/    │  (1 route)                                │  │
│  │  │  └─ [id]           │  GET: Retrieve media                      │  │
│  │  └─────────┬──────────┘                                           │  │
│  │            │                                                       │  │
│  │            │                                                       │  │
│  │  ┌─────────┴──────────┐                                           │  │
│  │  │  Other Routes      │                                           │  │
│  │  │  ├─ health         │  GET: Health check                        │  │
│  │  │  └─ performance    │  GET: Metrics                             │  │
│  │  └────────────────────┘                                           │  │
│  │                                                                    │  │
│  └────────────────────────┼────────────────────────────────────────────┘  │
│                           │                                               │
│  ┌────────────────────────┼────────────────────────────────────────────┐  │
│  │              BUSINESS LOGIC LAYER (lib/)                           │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │                  lib/auth/                                    │ │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │ │  │
│  │  │  │   jwt    │  │  session │  │   users  │  │   csrf   │    │ │  │
│  │  │  │  (jose)  │  │          │  │          │  │          │    │ │  │
│  │  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │ │  │
│  │  │       └──────────────┴──────────────┴──────────────┘         │ │  │
│  │  └──────────────────────┬───────────────────────────────────────┘ │  │
│  │                         │                                          │  │
│  │  ┌──────────────────────┴───────────────────────────────────────┐ │  │
│  │  │                  lib/db/                                      │ │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │ │  │
│  │  │  │   pool   │  │  redis   │  │ sessions │  │   users  │    │ │  │
│  │  │  │ (pg.Pool)│  │ (client) │  │   (db)   │  │   (db)   │    │ │  │
│  │  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │ │  │
│  │  │       └──────────────┴──────────────┴──────────────┘         │ │  │
│  │  └──────────────────────┬───────────────────────────────────────┘ │  │
│  │                         │                                          │  │
│  │  ┌──────────────────────┴───────────────────────────────────────┐ │  │
│  │  │                lib/cache/                                     │ │  │
│  │  │  ┌──────────────────────────────────────────────────────────┐│ │  │
│  │  │  │  redis-cache.ts                                          ││ │  │
│  │  │  │  - Namespace support                                     ││ │  │
│  │  │  │  - TTL management                                        ││ │  │
│  │  │  │  - Batch operations                                      ││ │  │
│  │  │  │  - Cache statistics                                      ││ │  │
│  │  │  └──────────────────┬───────────────────────────────────────┘│ │  │
│  │  └─────────────────────┴────────────────────────────────────────┘ │  │
│  │                        │                                           │  │
│  │  ┌─────────────────────┴────────────────────────────────────────┐ │  │
│  │  │              lib/utils/                                       │ │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │ │  │
│  │  │  │  logger  │  │   rate-  │  │   cors   │  │sanitize  │    │ │  │
│  │  │  │  (struct)│  │  limiter │  │          │  │          │    │ │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  │                                                                    │  │
│  └────────────────────────┼────────────────────────────────────────────┘  │
│                           │                                               │
└───────────────────────────┼───────────────────────────────────────────────┘
                            │
┌───────────────────────────┼───────────────────────────────────────────────┐
│                     DATA LAYER                                            │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │   PostgreSQL     │  │      Redis       │  │  Vercel Blob     │      │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤      │
│  │ Tables:          │  │ Keys:            │  │ Storage:         │      │
│  │ - users          │  │ - sessions       │  │ - Audio files    │      │
│  │ - sessions       │  │ - rate_limits    │  │ - Images         │      │
│  │ - user_roles     │  │ - cache:*        │  │ - Documents      │      │
│  │                  │  │ - tokens         │  │                  │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │                   File System (LEGACY)                        │       │
│  │  - data/resources/*.json (25 files)                           │       │
│  │  - data/content-edits.json                                    │       │
│  │  ⚠️  TO BE MIGRATED TO POSTGRESQL                             │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Component Dependencies

### Authentication Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                   Authentication Flow                            │
└─────────────────────────────────────────────────────────────────┘

User Login Request
        │
        ▼
┌──────────────────┐
│ POST /api/auth/  │
│      login       │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ lib/auth/validation.ts                               │
│ - Validate email format                              │
│ - Validate password strength                         │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ lib/utils/rate-limiter.ts                            │
│ - Check rate limit (5 attempts / 15 min)            │
│ - Increment attempt counter                          │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ lib/auth/users.ts                                    │
│ - validateCredentials()                              │
│ - Query user from database                           │
│ - Compare bcrypt hash                                │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ lib/auth/jwt.ts                                      │
│ - generateToken() with jose                          │
│ - Sign with HS256                                    │
│ - Set expiry (7d or 30d)                             │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ lib/auth/session.ts                                  │
│ - createSession()                                    │
│ - Generate refresh token                             │
│ - Store in PostgreSQL                                │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ lib/auth/cookies.ts                                  │
│ - createAuthCookie()                                 │
│ - Set HTTP-only cookie                               │
│ - Set secure flag (production)                       │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│ Response with:   │
│ - Set-Cookie hdr │
│ - Access token   │
│ - Refresh token  │
│ - User session   │
└──────────────────┘
```

### Authenticated Request Flow
```
┌─────────────────────────────────────────────────────────────────┐
│              Authenticated Request Flow                          │
└─────────────────────────────────────────────────────────────────┘

Authenticated Request
        │
        ▼
┌──────────────────────────────────────────────────────┐
│ middleware.ts                                        │
│ - Extract token from cookie                          │
│ - getTokenFromRequest()                              │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ lib/auth/session.ts                                  │
│ - isTokenBlacklisted()                               │
│ - Check if session revoked                           │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ lib/auth/jwt.ts                                      │
│ - verifyToken() with jose                            │
│ - Check signature                                    │
│ - Check expiration                                   │
└────────┬─────────────────────────────────────────────┘
         │
         ├─ Valid ────────────────────────────────────┐
         │                                            │
         ├─ Expired ──────────────────┐               │
         │                            │               │
         └─ Invalid ─────────┐        │               │
                             │        │               │
                             ▼        ▼               ▼
                      ┌──────────┐  ┌───────┐  ┌────────────┐
                      │ Redirect │  │Refresh│  │  Continue  │
                      │ to login │  │ Token │  │  Request   │
                      └──────────┘  └───┬───┘  └──────┬─────┘
                                        │             │
                                        ▼             │
                              ┌──────────────────┐   │
                              │ New access token │   │
                              │ Set-Cookie       │   │
                              └────────┬─────────┘   │
                                       │             │
                                       └─────────────┘
                                                │
                                                ▼
                                       ┌──────────────────┐
                                       │ Add X-User-Id    │
                                       │ Add X-User-Role  │
                                       │ to headers       │
                                       └────────┬─────────┘
                                                │
                                                ▼
                                       ┌──────────────────┐
                                       │ API Route        │
                                       │ Handler          │
                                       └──────────────────┘
```

### Content Save Flow (Current - File-Based)
```
┌─────────────────────────────────────────────────────────────────┐
│          Content Save Flow (CURRENT - TO BE MIGRATED)           │
└─────────────────────────────────────────────────────────────────┘

POST /api/content/save
        │
        ▼
┌──────────────────────────────────────────────────────┐
│ app/api/content/save/route.ts                        │
│ - Validate input (resourceId, editedContent)         │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ fs.readFile('data/content-edits.json')               │
│ - Read entire JSON file                              │
│ - Parse to JavaScript object                         │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ In-Memory Manipulation                               │
│ - Find existing edit or create new                   │
│ - Add history entry                                  │
│ - Update metadata counters                           │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ fs.writeFile('data/content-edits.json')              │
│ - Serialize to JSON                                  │
│ - Write entire file (overwrite)                      │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│ Return success   │
└──────────────────┘

⚠️  PROBLEMS:
- No concurrent write protection
- No transactions
- Entire file read/written on every operation
- Cannot run in read-only file systems (serverless)
- No indexing or query optimization
```

### Content Save Flow (Target - Database)
```
┌─────────────────────────────────────────────────────────────────┐
│          Content Save Flow (TARGET - AFTER MIGRATION)           │
└─────────────────────────────────────────────────────────────────┘

POST /api/content/save
        │
        ▼
┌──────────────────────────────────────────────────────┐
│ app/api/content/save/route.ts                        │
│ - Thin controller, delegates to service              │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ lib/services/content/ContentService.ts               │
│ - Validate business rules                            │
│ - Orchestrate transaction                            │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ lib/repositories/ContentRepository.ts                │
│ - createEdit(request)                                │
│ - Abstract database queries                          │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ lib/db/pool.ts                                       │
│ - db.transaction(async (client) => {                 │
│     BEGIN TRANSACTION                                │
│     INSERT INTO content_edits                        │
│     INSERT INTO edit_history                         │
│     UPDATE metadata counters                         │
│     COMMIT                                           │
│   })                                                 │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│ lib/cache/redis-cache.ts                             │
│ - Invalidate cache                                   │
│ - cache.deleteNamespace('resources')                 │
└────────┬─────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│ Return success   │
└──────────────────┘

✅  BENEFITS:
+ ACID transactions
+ Concurrent write support
+ Only affected rows locked
+ Indexes for fast queries
+ Compatible with serverless
+ Audit trail in database
```

---

## Component Interaction Matrix

| Component | Depends On | Used By | Data Flow |
|-----------|-----------|---------|-----------|
| **middleware.ts** | auth/jwt, auth/session, auth/csrf | All protected routes | Request → Middleware → API Route |
| **lib/auth/jwt.ts** | jose, config/security | middleware, auth API routes | Generate/verify tokens |
| **lib/auth/session.ts** | db/pool, db/sessions | Auth routes, middleware | Session CRUD operations |
| **lib/db/pool.ts** | pg, config/database | All repositories | Database queries |
| **lib/cache/redis-cache.ts** | redis, db/redis | Services, repositories | Cache operations |
| **lib/utils/logger.ts** | None | Everything (should be) | Structured logging |
| **lib/utils/rate-limiter.ts** | cache/redis-cache | Auth routes, middleware | Rate limit checks |
| **app/api/auth/login** | auth/users, auth/jwt, auth/session | Frontend auth forms | User authentication |
| **app/api/content/save** | fs (current), db (target) | Admin content editor | Save content edits |
| **app/api/topics/** | db/pool (partial), fs (partial) | Admin topic manager | Topic CRUD |

---

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  React 18                    TypeScript 5.6                     │
│  Next.js 15 (App Router)     Tailwind CSS 3.4                   │
│                                                                  │
│  Components:                 State Management:                  │
│  - Functional components     - React hooks                      │
│  - Server components         - Context API                      │
│  - Client components         - Form state                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND / API                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Next.js 15 API Routes       Edge Runtime                       │
│  TypeScript 5.6              Node.js 18+                        │
│                                                                  │
│  Authentication:             Security:                           │
│  - jose (JWT)                - CSRF protection                  │
│  - bcryptjs                  - Rate limiting                    │
│  - Cookie-based sessions     - Security headers                 │
│                              - Input validation (Zod)           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PostgreSQL                  Redis (Optional)                   │
│  - Primary database          - Session storage                  │
│  - Connection pooling (pg)   - Cache layer                      │
│  - SSL in production         - Rate limit counters              │
│                              - redis client (4.7.0)             │
│                                                                  │
│  Vercel Blob                 File System (LEGACY)               │
│  - Media storage             - JSON data files                  │
│  - Audio files               - ⚠️  To be migrated               │
│  - Images                                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Anthropic AI (@anthropic-ai/sdk)                               │
│  - Content generation                                           │
│  - AI-powered features                                          │
│                                                                  │
│  Vercel Platform                                                │
│  - Hosting                                                      │
│  - Edge functions                                               │
│  - Blob storage                                                 │
│  - Analytics                                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Interfaces

### Database Interfaces
```typescript
// lib/infrastructure/database/interfaces.ts

export interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  ssl?: boolean | { rejectUnauthorized: boolean; ca?: string };
}

export interface QueryParams {
  [key: string]: unknown;
}

export interface TransactionCallback<T> {
  (client: PoolClient): Promise<T>;
}
```

### Authentication Interfaces
```typescript
// lib/domain/auth/types.ts

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  exp?: number;
  iat?: number;
}

export interface Session {
  id: string;
  user_id: string;
  refresh_token: string;
  user_agent?: string;
  ip_address?: string;
  expires_at: Date;
  created_at: Date;
}

export type UserRole = 'admin' | 'editor' | 'viewer';
```

### Cache Interfaces
```typescript
// lib/infrastructure/cache/interfaces.ts

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

export interface CacheService {
  get<T>(key: string, options?: CacheOptions): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean>;
  delete(key: string, options?: CacheOptions): Promise<boolean>;
  has(key: string, options?: CacheOptions): Promise<boolean>;
  clear(): Promise<boolean>;
  getStats(): CacheStats;
}
```

---

## Component Catalog

### Core Components (21 Routes)

#### Authentication Routes (8)
1. `POST /api/auth/login` - User authentication
2. `POST /api/auth/logout` - Session termination
3. `POST /api/auth/register` - User registration
4. `POST /api/auth/refresh` - Token refresh
5. `GET /api/auth/me` - Current user info
6. `POST /api/auth/password-reset/request` - Request password reset
7. `POST /api/auth/password-reset/confirm` - Confirm password reset
8. `POST /api/auth/password-reset` - Complete password reset

#### Content Routes (5)
1. `GET /api/content/list` - List all content
2. `POST /api/content/save` - Save content edits
3. `GET /api/content/[id]` - Get content by ID
4. `POST /api/content/[id]/review` - Review content (approve/reject)
5. `GET /api/content/[id]/history` - Get edit history

#### Topic Routes (4)
1. `GET /api/topics/list` - List all topics
2. `POST /api/topics` - Create topic
3. `GET /api/topics/[slug]` - Get topic by slug
4. `POST /api/topics/[slug]/save` - Save topic

#### Media Routes (3)
1. `POST /api/audio/upload` - Upload audio file
2. `GET /api/audio/[id]` - Get audio file
3. `GET /api/media/[id]` - Get media file

#### System Routes (2)
1. `GET /api/health` - Health check
2. `GET /api/performance/metrics` - Performance metrics

### Library Modules (lib/)

#### Authentication (lib/auth/) - 9 files
- `jwt.ts` - JWT operations with jose
- `session.ts` - Session management
- `users.ts` - User operations
- `csrf.ts` - CSRF protection
- `cookies.ts` - Cookie helpers
- `permissions.ts` - RBAC logic
- `validation.ts` - Auth validation
- `middleware-helper.ts` - Middleware utilities
- `types.ts` - Auth type definitions

#### Database (lib/db/) - 5 files
- `pool.ts` - Connection pooling
- `pool-optimized.ts` - Optimized pool config
- `redis.ts` - Redis client
- `sessions.ts` - Session database operations
- `users.ts` - User database operations

#### Cache (lib/cache/) - 1 file
- `redis-cache.ts` - Redis cache wrapper

#### Configuration (lib/config/) - 1 file
- `security.ts` - Security settings

#### Utilities (lib/utils/) - 3 files
- `logger.ts` - Structured logging
- `rate-limiter.ts` - Rate limiting
- `cors.ts` - CORS helpers

---

*This diagram represents the current state of the Hablas architecture. Refer to SYSTEM_ARCHITECTURE_ANALYSIS.md for target state and migration path.*
