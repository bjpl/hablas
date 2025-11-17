# System Architecture Diagrams

## Overview

This document provides comprehensive system diagrams using C4 model notation for the Hablas content management system.

## C4 Model - Level 1: System Context

```
                    ┌─────────────────────────────────────┐
                    │         Internet Browser            │
                    │  (Admin/Editor using web interface) │
                    └─────────────┬───────────────────────┘
                                  │
                                  │ HTTPS
                                  ▼
        ┌─────────────────────────────────────────────────┐
        │                                                   │
        │          Hablas Content Management System         │
        │                                                   │
        │  - Content creation and review                   │
        │  - Topic-based organization                      │
        │  - User authentication (JWT)                     │
        │  - Media management                              │
        │  - Role-based access control                     │
        │                                                   │
        └───────────┬─────────────────────┬─────────────────┘
                    │                     │
          ┌─────────┼─────────┐          │
          │                   │           │
          ▼                   ▼           ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│   PostgreSQL     │ │  File Storage│ │  Email SMTP  │
│    Database      │ │  (Media)     │ │  (optional)  │
│                  │ │              │ │              │
│ - User data      │ │ - Images     │ │ - Password   │
│ - Content        │ │ - Videos     │ │   reset      │
│ - Reviews        │ │ - Documents  │ │ - Notifications│
└──────────────────┘ └──────────────┘ └──────────────┘
```

## C4 Model - Level 2: Container Diagram

```
                           ┌──────────────────┐
                           │  Web Browser     │
                           │  (React/Next.js) │
                           └────────┬─────────┘
                                    │
                            HTTPS / JSON API
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                 Next.js Application                    │
        │                                                        │
        │  ┌──────────────────────────────────────────────┐    │
        │  │         Frontend (Server Components)          │    │
        │  │  - Admin dashboard                            │    │
        │  │  - Content editor                             │    │
        │  │  - Topic manager                              │    │
        │  │  - Review interface                           │    │
        │  └──────────────┬───────────────────────────────┘    │
        │                 │                                      │
        │  ┌──────────────┴───────────────────────────────┐    │
        │  │            Middleware Layer                   │    │
        │  │  - JWT authentication                         │    │
        │  │  - Route protection                           │    │
        │  │  - Token refresh                              │    │
        │  │  - CORS handling                              │    │
        │  └──────────────┬───────────────────────────────┘    │
        │                 │                                      │
        │  ┌──────────────┴───────────────────────────────┐    │
        │  │         API Layer (Route Handlers)           │    │
        │  │                                               │    │
        │  │  /api/auth     /api/content    /api/topics   │    │
        │  │  /api/media    /api/users                    │    │
        │  └──────────────┬───────────────────────────────┘    │
        │                 │                                      │
        │  ┌──────────────┴───────────────────────────────┐    │
        │  │          Business Logic Layer                │    │
        │  │  - Auth service                              │    │
        │  │  - Content service                           │    │
        │  │  - Review workflow                           │    │
        │  │  - Permission checks                         │    │
        │  └──────────────┬───────────────────────────────┘    │
        │                 │                                      │
        │  ┌──────────────┴───────────────────────────────┐    │
        │  │          Data Access Layer                   │    │
        │  │  - Database queries                          │    │
        │  │  - Connection pooling                        │    │
        │  │  - Transaction management                    │    │
        │  └──────────────┬───────────────────────────────┘    │
        └─────────────────┼──────────────────────────────────────┘
                          │
          ┌───────────────┼─────────────┐
          │               │             │
          ▼               ▼             ▼
    ┌──────────┐   ┌──────────┐  ┌──────────┐
    │PostgreSQL│   │  File    │  │  Redis   │
    │ Database │   │ Storage  │  │  Cache   │
    │          │   │          │  │ (future) │
    └──────────┘   └──────────┘  └──────────┘
```

## C4 Model - Level 3: Component Diagram (API Layer)

```
                    ┌──────────────────────────────────┐
                    │       Middleware Layer           │
                    │  - Authentication                │
                    │  - Authorization                 │
                    └────────────┬─────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
      │ Auth Routes  │  │Content Routes│  │ Topic Routes │
      │              │  │              │  │              │
      │ POST /login  │  │ GET  /       │  │ GET  /       │
      │ POST /logout │  │ POST /       │  │ POST /       │
      │ GET  /me     │  │ GET  /[id]   │  │ GET  /[id]   │
      └──────┬───────┘  │ PATCH/[id]   │  │ PATCH/[id]   │
             │          │ DELETE/[id]  │  │ DELETE/[id]  │
             │          │ POST /review │  │ POST /review │
             │          └──────┬───────┘  └──────┬───────┘
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                               ▼
                    ┌──────────────────────────────────┐
                    │      Service Layer               │
                    │                                  │
                    │  ┌────────────┐  ┌────────────┐ │
                    │  │Auth Service│  │Content Svc │ │
                    │  │            │  │            │ │
                    │  │- validate  │  │- create    │ │
                    │  │- generate  │  │- update    │ │
                    │  │- verify    │  │- delete    │ │
                    │  └────────────┘  │- review    │ │
                    │                  └────────────┘ │
                    │  ┌────────────┐  ┌────────────┐ │
                    │  │Topic Svc   │  │Media Svc   │ │
                    │  │            │  │            │ │
                    │  │- hierarchy │  │- upload    │ │
                    │  │- organize  │  │- validate  │ │
                    │  └────────────┘  │- delete    │ │
                    │                  └────────────┘ │
                    └────────────┬─────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────────────┐
                    │   Repository Layer               │
                    │                                  │
                    │  - UserRepository                │
                    │  - ContentRepository             │
                    │  - TopicRepository               │
                    │  - MediaRepository               │
                    │  - ReviewRepository              │
                    └────────────┬─────────────────────┘
                                 │
                                 ▼
                          ┌─────────────┐
                          │  PostgreSQL │
                          └─────────────┘
```

## Authentication Flow Diagram

```
┌──────────┐                                           ┌──────────┐
│  Client  │                                           │  Server  │
└────┬─────┘                                           └────┬─────┘
     │                                                      │
     │  1. POST /api/auth/login                            │
     │     { email, password, rememberMe }                 │
     ├──────────────────────────────────────────────────>  │
     │                                                      │
     │                            2. Validate credentials   │
     │                               (bcrypt compare)       │
     │                                                      ├─┐
     │                                                      │ │
     │                                                      │<┘
     │                            3. Generate JWT token     │
     │                               (jose/HS256)           │
     │                                                      ├─┐
     │                                                      │ │
     │                                                      │<┘
     │                            4. Create secure cookie   │
     │                               (httpOnly, secure)     │
     │                                                      ├─┐
     │                                                      │ │
     │                                                      │<┘
     │  5. Response with token + Set-Cookie                 │
     │     { success, user, token }                        │
     │  <──────────────────────────────────────────────────┤
     │                                                      │
     │  6. Subsequent requests (cookie auto-sent)          │
     │     Cookie: auth-token=JWT...                       │
     ├──────────────────────────────────────────────────>  │
     │                                                      │
     │                            7. Middleware verifies    │
     │                               - Extract token        │
     │                               - Verify signature     │
     │                               - Check expiration     │
     │                               - Refresh if needed    │
     │                                                      ├─┐
     │                                                      │ │
     │                                                      │<┘
     │  8. Protected resource                              │
     │  <──────────────────────────────────────────────────┤
     │                                                      │
```

## Content Review Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Content Lifecycle                           │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────┐
  │  DRAFT   │  ← Editor creates content
  └────┬─────┘
       │
       │ Editor submits
       ▼
  ┌──────────┐
  │ PENDING  │  ← Awaiting review
  └────┬─────┘
       │
       │ Admin reviews
       │
       ├─────────┬─────────┐
       │         │         │
       ▼         ▼         ▼
  ┌─────────┐ ┌─────────┐ ┌─────────┐
  │APPROVED │ │REJECTED │ │CHANGES  │
  │         │ │         │ │REQUESTED│
  └────┬────┘ └────┬────┘ └────┬────┘
       │           │            │
       │           │            │ Editor revises
       │           │            │
       │           │            ▼
       │           │       ┌──────────┐
       │           │       │  DRAFT   │
       │           │       └────┬─────┘
       │           │            │
       │           │ End        │
       │           ▼            │
       │      ┌─────────┐       │
       │      │ARCHIVED │◄──────┘
       │      └─────────┘
       │
       │ Publish
       ▼
  ┌──────────┐
  │PUBLISHED │
  └──────────┘
```

## Data Flow - Content Creation

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  Editor  │          │   API    │          │ Database │
└────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                      │
     │ 1. Create content   │                      │
     ├──────────────────>  │                      │
     │                     │                      │
     │         2. Verify auth & permissions       │
     │                     ├─────────┐            │
     │                     │         │            │
     │                     │<────────┘            │
     │                     │                      │
     │         3. Validate input data             │
     │                     ├─────────┐            │
     │                     │         │            │
     │                     │<────────┘            │
     │                     │                      │
     │         4. Begin transaction               │
     │                     ├───────────────────>  │
     │                     │                      │
     │         5. Insert content record           │
     │                     ├───────────────────>  │
     │                     │                      │
     │         6. Insert review record (pending)  │
     │                     ├───────────────────>  │
     │                     │                      │
     │         7. Upload media (if any)           │
     │                     ├───────────────────>  │
     │                     │                      │
     │         8. Link media to content           │
     │                     ├───────────────────>  │
     │                     │                      │
     │         9. Commit transaction              │
     │                     ├───────────────────>  │
     │                     │                      │
     │         10. Return created content         │
     │                     │  <──────────────────┤
     │                     │                      │
     │ 11. Response        │                      │
     │  <─────────────────┤                      │
     │                     │                      │
```

## Deployment Architecture

```
                         ┌─────────────────────────┐
                         │    CDN / Edge Network   │
                         │   (Vercel Edge / CF)    │
                         └────────────┬────────────┘
                                      │
                                      │ Route to nearest edge
                                      │
                         ┌────────────┴────────────┐
                         │   Edge Runtime          │
                         │   (Next.js Middleware)  │
                         │   - JWT verification    │
                         │   - Token refresh       │
                         │   - Route protection    │
                         └────────────┬────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │   Region 1   │  │   Region 2   │  │   Region 3   │
          │  (US-East)   │  │  (EU-West)   │  │  (AP-South)  │
          │              │  │              │  │              │
          │  Next.js     │  │  Next.js     │  │  Next.js     │
          │  Serverless  │  │  Serverless  │  │  Serverless  │
          └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                 │                 │                 │
                 └─────────────────┼─────────────────┘
                                   │
                                   │ Database connection
                                   │
                         ┌─────────┴──────────┐
                         │   PostgreSQL        │
                         │   (Primary Region)  │
                         │                     │
                         │   + Read Replicas   │
                         └─────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layers                          │
└─────────────────────────────────────────────────────────────┘

Layer 7: Application Security
┌─────────────────────────────────────────────────────────────┐
│ - Input validation (Zod schemas)                            │
│ - SQL injection prevention (parameterized queries)          │
│ - XSS prevention (content sanitization)                     │
│ - CSRF protection (SameSite cookies)                        │
└─────────────────────────────────────────────────────────────┘

Layer 6: Authentication & Authorization
┌─────────────────────────────────────────────────────────────┐
│ - JWT token-based auth (jose/HS256)                         │
│ - Role-based access control (RBAC)                          │
│ - Secure password hashing (bcrypt cost 12)                  │
│ - Token refresh mechanism                                   │
└─────────────────────────────────────────────────────────────┘

Layer 5: Session Management
┌─────────────────────────────────────────────────────────────┐
│ - HttpOnly cookies (XSS protection)                         │
│ - Secure flag (HTTPS only)                                  │
│ - SameSite=Lax (CSRF protection)                           │
│ - Short-lived tokens (7d/30d)                              │
└─────────────────────────────────────────────────────────────┘

Layer 4: Rate Limiting & DDoS Protection
┌─────────────────────────────────────────────────────────────┐
│ - IP-based rate limiting (5 attempts/15min)                 │
│ - Account lockout on failures                               │
│ - CDN-level DDoS protection                                 │
└─────────────────────────────────────────────────────────────┘

Layer 3: Network Security
┌─────────────────────────────────────────────────────────────┐
│ - TLS 1.3 (HTTPS everywhere)                                │
│ - Certificate pinning                                        │
│ - Secure headers (CSP, HSTS, etc.)                          │
└─────────────────────────────────────────────────────────────┘

Layer 2: Database Security
┌─────────────────────────────────────────────────────────────┐
│ - Encrypted connections (SSL/TLS)                           │
│ - Least privilege access                                    │
│ - Connection pooling                                         │
│ - Audit logging                                             │
└─────────────────────────────────────────────────────────────┘

Layer 1: Infrastructure Security
┌─────────────────────────────────────────────────────────────┐
│ - Encrypted at rest                                          │
│ - Network isolation (VPC)                                    │
│ - Regular backups                                            │
│ - Monitoring & alerts                                        │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     Error Handling Strategy                   │
└──────────────────────────────────────────────────────────────┘

Request → Middleware → Route Handler → Service Layer → Repository
   ↓           ↓             ↓              ↓              ↓
  Try        Try           Try            Try            Try
   │           │             │              │              │
Catch      Catch         Catch          Catch          Catch
   │           │             │              │              │
   │           │             │              │              └─→ DB Error
   │           │             │              │                  - Connection
   │           │             │              │                  - Query
   │           │             │              │                  - Constraint
   │           │             │              │
   │           │             │              └─→ Business Logic Error
   │           │             │                  - Validation
   │           │             │                  - State conflict
   │           │             │
   │           │             └─→ Handler Error
   │           │                 - Input validation
   │           │                 - Permission denied
   │           │
   │           └─→ Auth Error
   │               - Invalid token
   │               - Expired token
   │               - Missing auth
   │
   └─→ Network Error
       - Timeout
       - Connection refused

All errors flow to centralized handler:
   ↓
┌────────────────────────────────┐
│   Error Response Builder       │
│                                │
│ - Log error (with context)     │
│ - Sanitize error message       │
│ - Set appropriate status code  │
│ - Return consistent format     │
└────────────────────────────────┘
   ↓
{ success: false, error: string }
```

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────┐
│                  Monitoring Stack                            │
└─────────────────────────────────────────────────────────────┘

Application Layer
┌─────────────────────────────────────────────────────────────┐
│ - Request/response logging                                   │
│ - Error tracking (Sentry)                                    │
│ - Performance metrics (Vercel Analytics)                     │
│ - User analytics                                             │
└─────────────────────────────────────────────────────────────┘
                                ↓
API Layer
┌─────────────────────────────────────────────────────────────┐
│ - Request rate                                               │
│ - Response time (p50, p95, p99)                             │
│ - Error rate by endpoint                                     │
│ - Auth success/failure rate                                  │
└─────────────────────────────────────────────────────────────┘
                                ↓
Database Layer
┌─────────────────────────────────────────────────────────────┐
│ - Query performance                                          │
│ - Connection pool status                                     │
│ - Slow query log                                             │
│ - Replication lag                                            │
└─────────────────────────────────────────────────────────────┘
                                ↓
Infrastructure Layer
┌─────────────────────────────────────────────────────────────┐
│ - CPU/Memory usage                                           │
│ - Network I/O                                                │
│ - Disk usage                                                 │
│ - Uptime                                                     │
└─────────────────────────────────────────────────────────────┘
                                ↓
        ┌───────────────────────────────────┐
        │     Alerting & Dashboards         │
        │                                   │
        │  - PagerDuty / Opsgenie           │
        │  - Grafana dashboards             │
        │  - Slack notifications            │
        └───────────────────────────────────┘
```
