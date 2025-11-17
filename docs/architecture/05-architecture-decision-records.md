# Architecture Decision Records (ADRs)

## Overview

This document contains Architecture Decision Records for significant technical decisions in the Hablas project.

## ADR Format

Each ADR follows this structure:
- **Status**: Proposed | Accepted | Deprecated | Superseded
- **Context**: What is the issue we're trying to solve?
- **Decision**: What is the change we're making?
- **Consequences**: What are the trade-offs of this decision?

---

## ADR-001: JWT-Based Authentication with jose Library

**Status**: Accepted

**Date**: 2025-11-16

**Context**:
- Next.js 15 applications run primarily on Edge Runtime for better performance
- Traditional JWT libraries like `jsonwebtoken` are not compatible with Edge Runtime
- Need secure, stateless authentication that works globally
- Must support token refresh and revocation

**Decision**:
Implement JWT-based authentication using the `jose` library with the following characteristics:
- Algorithm: HS256 (HMAC-SHA256)
- Token storage: HTTP-only, Secure, SameSite=Lax cookies
- Token expiration: 7 days (default) or 30 days (remember-me)
- Auto-refresh: When token has <24 hours remaining
- Revocation: Blacklist mechanism for logout

**Alternatives Considered**:

1. **Session-based authentication**
   - Pros: Easier revocation, server-side control
   - Cons: Requires database lookup on every request, not Edge-friendly
   - Rejected: Performance impact and Edge Runtime limitations

2. **OAuth2 with third-party providers**
   - Pros: Delegated authentication, SSO capability
   - Cons: External dependency, complexity, requires user accounts
   - Deferred: May add later as optional feature

3. **JWT with RS256 (asymmetric)**
   - Pros: Public key distribution, better for microservices
   - Cons: Higher computational cost, key management complexity
   - Rejected: Overkill for single application, HS256 sufficient

**Consequences**:

Positive:
- Edge Runtime compatible, global low latency
- Stateless authentication reduces database load
- Simple implementation with jose library
- Cookie-based storage provides CSRF protection
- Auto-refresh improves user experience

Negative:
- Token revocation requires blacklist (database check)
- Secret key management is critical
- Cannot revoke tokens until expiration (without blacklist)
- Slightly larger payload size in every request

**Migration Path**:
- If scaling to microservices, migrate to RS256 asymmetric keys
- If adding OAuth, implement as alternative auth flow, not replacement

---

## ADR-002: PostgreSQL as Primary Database

**Status**: Accepted

**Date**: 2025-11-16

**Context**:
- Need reliable, ACID-compliant relational database
- Content requires complex relationships (topics, reviews, media)
- Full-text search capability required
- Must support hierarchical data (topic trees)
- Need JSONB for flexible metadata
- Deployment target is likely Vercel/cloud platform

**Decision**:
Use PostgreSQL as the primary database with the following features:
- JSONB columns for flexible metadata
- Full-text search with `tsvector` and GIN indexes
- Recursive queries for topic hierarchy
- Foreign key constraints for data integrity
- Triggers for automatic timestamp updates

**Alternatives Considered**:

1. **MySQL/MariaDB**
   - Pros: Wide adoption, good performance
   - Cons: Weaker JSON support, no JSONB, less advanced features
   - Rejected: PostgreSQL's JSONB and full-text search superior

2. **MongoDB (NoSQL)**
   - Pros: Flexible schema, good for rapid iteration
   - Cons: No ACID transactions (limited), weak relationships, no referential integrity
   - Rejected: Content relationships require relational model

3. **SQLite**
   - Pros: Zero configuration, simple deployment
   - Cons: No concurrent writes, limited scalability, no full-text search
   - Rejected: Not suitable for production multi-user application

4. **Supabase (Postgres with extras)**
   - Pros: Managed Postgres, real-time subscriptions, auth built-in
   - Cons: Vendor lock-in, cost at scale
   - Considered: Good for MVP, can migrate later

**Consequences**:

Positive:
- ACID compliance ensures data integrity
- Rich feature set (JSONB, full-text search, arrays, triggers)
- Excellent indexing capabilities
- Active community and ecosystem
- Easy cloud deployment (Vercel Postgres, Railway, etc.)
- Supports complex queries and relationships

Negative:
- More complex setup than NoSQL
- Requires careful index management
- Connection pooling needed for serverless
- Schema migrations require planning

**Implementation Notes**:
- Use Prisma or Drizzle ORM for type-safe queries
- Implement connection pooling for Edge Runtime
- Regular VACUUM and ANALYZE for maintenance
- Consider read replicas for scale

---

## ADR-003: Role-Based Access Control (RBAC) with Three Roles

**Status**: Accepted

**Date**: 2025-11-16

**Context**:
- Need to restrict access to administrative functions
- Content review workflow requires approval process
- Multiple users will create and edit content
- Must prevent unauthorized data modification

**Decision**:
Implement three-tier RBAC system:

1. **Admin**:
   - Full system access
   - User management
   - Content approval/rejection
   - All CRUD operations
   - System configuration

2. **Editor**:
   - Create and edit content
   - Upload media
   - Submit for review
   - View dashboard
   - Cannot approve own content

3. **Viewer**:
   - Read-only access
   - View published content
   - View dashboard statistics
   - No editing capabilities

**Alternatives Considered**:

1. **Single admin role (binary permissions)**
   - Pros: Simple implementation
   - Cons: Too restrictive, all users need admin or nothing
   - Rejected: Insufficient granularity

2. **Fine-grained permission system**
   - Pros: Maximum flexibility, granular control
   - Cons: Complex to implement and manage, UI complexity
   - Rejected: Overkill for current requirements

3. **Four+ roles (moderator, contributor, etc.)**
   - Pros: More granular separation
   - Cons: Increased complexity, unclear role boundaries
   - Rejected: Three roles cover all use cases

**Consequences**:

Positive:
- Clear separation of responsibilities
- Easy to understand and communicate
- Sufficient for content management workflow
- Simple middleware implementation
- Can extend with permissions later

Negative:
- Less flexible than granular permissions
- Role changes require admin intervention
- Cannot have "partial" permissions

**Future Extensions**:
- Add permission flags within roles (e.g., editor.canPublish)
- Implement groups/teams for organization-level access
- Add resource-based permissions (own content vs all content)

---

## ADR-004: In-Memory User Storage (Temporary) with Database Migration Path

**Status**: Accepted (Temporary)

**Date**: 2025-11-16

**Context**:
- Need authentication functional immediately for development
- Database schema design takes time and iteration
- Want to avoid premature database decisions
- Must provide clear migration path

**Decision**:
Implement in-memory user storage using JavaScript Map for initial development:
- Use bcrypt for password hashing (production-ready)
- Implement all auth logic (validation, sessions, etc.)
- Create database schema in parallel
- Plan migration as next immediate step

**Migration Triggers**:
- Before production deployment
- When team size > 2 users
- When content size requires persistence

**Alternatives Considered**:

1. **Immediate database implementation**
   - Pros: Production-ready from start
   - Cons: Slower initial development, premature decisions
   - Rejected: Want to iterate on auth flow first

2. **File-based storage (JSON)**
   - Pros: Simple, persistent
   - Cons: Concurrent access issues, no querying
   - Rejected: Not much better than in-memory

**Consequences**:

Positive:
- Rapid development and iteration
- No database setup required initially
- Test auth flows quickly
- Clear migration path defined
- Same API interface for business logic

Negative:
- Data lost on server restart
- Not suitable for production
- Must remember to migrate before launch
- Single point of failure

**Migration Plan**:
1. Database schema already designed (see ADR-002)
2. Create migration scripts
3. Update user repository to use database
4. Seed with existing users (if any)
5. No changes to business logic or API

---

## ADR-005: Next.js 15 Route Handlers for API

**Status**: Accepted

**Date**: 2025-11-16

**Context**:
- Building content management API
- Next.js 15 provides built-in API capabilities
- Need Edge Runtime compatibility
- Want to leverage existing Next.js deployment

**Decision**:
Use Next.js 15 Route Handlers (App Router) for all API endpoints:
- Collocate API routes with application code
- Leverage Edge Runtime for global performance
- Use TypeScript for type-safe request/response
- Implement RESTful conventions

**Directory Structure**:
```
/app/api
  /auth
    /login/route.ts
    /logout/route.ts
  /content
    /route.ts
    /[id]/route.ts
  /topics
    /route.ts
    /[id]/route.ts
```

**Alternatives Considered**:

1. **Separate Express.js API server**
   - Pros: More control, middleware ecosystem
   - Cons: Separate deployment, Node.js runtime only
   - Rejected: Adds deployment complexity

2. **Next.js Pages API (legacy)**
   - Pros: Familiar to Next.js users
   - Cons: Deprecated in App Router, not Edge-compatible
   - Rejected: App Router is the future

3. **tRPC for type-safe APIs**
   - Pros: End-to-end type safety, great DX
   - Cons: Learning curve, client coupling
   - Deferred: Consider for future enhancement

**Consequences**:

Positive:
- Single codebase for frontend and backend
- Simplified deployment (one app)
- Edge Runtime performance
- Type safety with TypeScript
- Built-in middleware support

Negative:
- Less flexibility than dedicated API framework
- Tied to Next.js deployment
- Limited middleware ecosystem
- Cannot easily extract API to separate service

**Best Practices**:
- Keep route handlers thin (delegate to services)
- Use Zod for input validation
- Consistent error handling
- Proper HTTP status codes
- OpenAPI documentation (future)

---

## ADR-006: Topic-Based Content Review Workflow

**Status**: Accepted

**Date**: 2025-11-16

**Context**:
- Content quality control is critical for educational platform
- Need approval process before publishing
- Multiple editors creating content
- Admins must review before publication

**Decision**:
Implement workflow-based content status:

**States**:
1. **Draft**: Editor working on content
2. **Pending**: Submitted for review
3. **Changes Requested**: Rejected with feedback
4. **Approved**: Accepted by admin
5. **Published**: Live to users
6. **Archived**: Removed from active use

**Transitions**:
```
Draft → Pending (Editor submits)
Pending → Approved (Admin approves)
Pending → Changes Requested (Admin requests changes)
Pending → Rejected (Admin rejects)
Changes Requested → Draft (Editor revises)
Approved → Published (Admin publishes)
Any → Archived (Admin archives)
```

**Review Records**:
- Store all review actions in `content_reviews` table
- Track reviewer, action, timestamp, comments
- Audit trail for content changes

**Alternatives Considered**:

1. **No approval workflow (direct publish)**
   - Pros: Faster content delivery
   - Cons: Quality risk, no quality control
   - Rejected: Educational content requires review

2. **Multi-stage review (peer → admin → QA)**
   - Pros: Thorough quality control
   - Cons: Slow, complex, overkill for small team
   - Rejected: Too complex for current needs

3. **Automatic approval for trusted editors**
   - Pros: Faster for experienced users
   - Cons: Risk of quality issues, trust management
   - Deferred: Can add as future enhancement

**Consequences**:

Positive:
- Quality control ensures content accuracy
- Clear workflow for editors and admins
- Audit trail for compliance
- Prevents accidental publication
- Facilitates collaboration with feedback

Negative:
- Slower content publication
- Requires admin availability
- Potential bottleneck if few admins
- More complex than direct publish

**Optimizations**:
- Email notifications for review requests
- Batch review interface for admins
- Auto-approve after X days (configurable)
- Editor can see review status in dashboard

---

## ADR-007: bcrypt for Password Hashing

**Status**: Accepted

**Date**: 2025-11-16

**Context**:
- Need secure password storage
- Protection against rainbow tables and brute force
- Balance security and performance
- Must be future-proof

**Decision**:
Use bcrypt with cost factor 12:
- Industry-standard algorithm
- Adaptive cost (can increase as hardware improves)
- Built-in salt generation
- Constant-time comparison

**Parameters**:
- **Cost Factor**: 12 (currently ~250ms per hash)
- **Algorithm**: bcrypt
- **Library**: `bcryptjs` (pure JS, Edge-compatible)

**Alternatives Considered**:

1. **Argon2 (modern algorithm)**
   - Pros: More secure, better against GPU attacks
   - Cons: Less mature ecosystem, potential Edge compatibility issues
   - Rejected: bcrypt sufficient, Argon2 not Edge-compatible

2. **PBKDF2**
   - Pros: Built into Node.js crypto
   - Cons: Weaker than bcrypt against specialized hardware
   - Rejected: bcrypt better security

3. **Plain SHA-256 hashing**
   - Pros: Fast, simple
   - Cons: Vulnerable to rainbow tables, not adaptive
   - Rejected: Insecure for passwords

**Consequences**:

Positive:
- Strong protection against brute force
- Adaptive cost can increase over time
- Industry standard with proven track record
- Built-in salt eliminates rainbow table attacks
- Edge Runtime compatible (with bcryptjs)

Negative:
- Slower than simple hashing (~250ms per operation)
- Cost factor tuning needed for hardware changes
- May need rate limiting to prevent DoS via hash computation

**Security Notes**:
- Never log password hashes
- Use constant-time comparison to prevent timing attacks
- Consider increasing cost factor every 2-3 years
- Monitor hash time (should be <500ms)

---

## ADR-008: Middleware-Based Route Protection

**Status**: Accepted

**Date**: 2025-11-16

**Context**:
- Need to protect admin routes from unauthorized access
- Want consistent authentication across all protected routes
- Must run on Edge Runtime for performance
- Need to minimize redundant authentication logic

**Decision**:
Implement Next.js Middleware for route protection:
- Single middleware function for all routes
- JWT verification using jose (Edge-compatible)
- Role-based access control
- Automatic token refresh
- Redirect to login for unauthenticated users

**Protected Route Patterns**:
- `/admin/*` (except `/admin/login`)
- `/api/content/*`
- `/api/topics/*`
- `/api/users/*`

**Alternatives Considered**:

1. **Component-level auth checks**
   - Pros: Fine-grained control
   - Cons: Repetitive code, easy to forget, client-side only
   - Rejected: Not suitable for API routes

2. **Route handler auth in each endpoint**
   - Pros: Explicit, flexible
   - Cons: Duplicate code, error-prone, inconsistent
   - Rejected: Middleware more DRY

3. **Higher-order functions (HOC) for auth**
   - Pros: Reusable, composable
   - Cons: Still requires application in each route
   - Rejected: Middleware more comprehensive

**Consequences**:

Positive:
- Single source of truth for authentication
- Runs before any route handler (efficiency)
- Edge Runtime deployment (global performance)
- Automatic token refresh transparent to user
- Clear redirect flow for unauthenticated users
- Consistent error handling

Negative:
- Cannot customize auth per-route easily
- Middleware matcher patterns can be complex
- Debugging middleware issues harder than route-level

**Implementation Notes**:
- Use matcher config to exclude static assets
- Set custom headers (X-User-Id, X-User-Role) for downstream use
- Handle both cookie-based and header-based tokens
- Graceful error handling with redirect

---

## Summary Table

| ADR | Title | Status | Date | Key Decision |
|-----|-------|--------|------|--------------|
| 001 | JWT Authentication | Accepted | 2025-11-16 | jose library, HS256, Edge Runtime |
| 002 | PostgreSQL Database | Accepted | 2025-11-16 | Primary database with JSONB, full-text search |
| 003 | RBAC Three Roles | Accepted | 2025-11-16 | Admin, Editor, Viewer roles |
| 004 | In-Memory Users | Temporary | 2025-11-16 | Map storage, migrate to DB soon |
| 005 | Next.js Route Handlers | Accepted | 2025-11-16 | App Router API routes |
| 006 | Content Review Workflow | Accepted | 2025-11-16 | Six-state workflow with audit trail |
| 007 | bcrypt Password Hashing | Accepted | 2025-11-16 | Cost factor 12 |
| 008 | Middleware Protection | Accepted | 2025-11-16 | Centralized route authentication |

## Future ADRs to Consider

1. **Caching Strategy**: Redis vs in-memory vs CDN
2. **File Storage**: Local vs S3 vs Cloudinary for media
3. **Search Implementation**: PostgreSQL full-text vs Algolia/Meilisearch
4. **Real-time Updates**: WebSockets vs SSE vs polling
5. **Internationalization**: i18n strategy for multi-language content
6. **Testing Strategy**: Unit, integration, E2E frameworks
7. **Deployment Strategy**: Vercel vs self-hosted vs Docker
8. **Monitoring**: Logging, APM, error tracking tools
