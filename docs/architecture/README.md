# Architecture Documentation

## Overview

This directory contains comprehensive architecture documentation for the Hablas content management system, designed using the SPARC methodology and C4 model notation.

## Document Index

### 1. [Authentication Architecture](./01-authentication-architecture.md)
Complete authentication system design covering:
- JWT token management with jose library
- Cookie-based session handling
- Middleware protection patterns
- Password security with bcrypt
- Role-based access control (RBAC)
- Session lifecycle and refresh strategy
- Database migration path
- Security features and attack mitigation

**Key Technologies**: jose, bcrypt, Next.js Middleware, Edge Runtime

### 2. [API Architecture](./02-api-architecture.md)
RESTful API design specifications including:
- Complete endpoint catalog (Auth, Content, Topics, Media, Users)
- Request/Response schemas
- Error handling patterns
- Middleware chain design
- Pagination and filtering
- Rate limiting strategy
- Security measures
- Performance optimizations
- API versioning strategy

**API Base**: `/api`

### 3. [Database Schema](./03-database-schema.md)
PostgreSQL database design with:
- Entity-Relationship Diagrams (ERD)
- Complete table definitions with constraints
- Index optimization strategy
- Full-text search implementation
- Hierarchical data (topics)
- Audit logging tables
- Migration scripts
- Backup and recovery procedures
- Performance tuning

**Tables**: users, refresh_tokens, auth_audit_log, topics, content, content_reviews, media, content_media

### 4. [System Diagrams](./04-system-diagrams.md)
Visual architecture using C4 model:
- Level 1: System Context Diagram
- Level 2: Container Diagram
- Level 3: Component Diagram
- Authentication flow diagrams
- Content review workflow
- Data flow diagrams
- Deployment architecture
- Security layers
- Error handling flow
- Monitoring stack

**Notation**: C4 Model, ASCII diagrams

### 5. [Architecture Decision Records](./05-architecture-decision-records.md)
Key architectural decisions with rationale:
- ADR-001: JWT Authentication with jose
- ADR-002: PostgreSQL as Primary Database
- ADR-003: RBAC with Three Roles
- ADR-004: In-Memory Users (Temporary)
- ADR-005: Next.js Route Handlers
- ADR-006: Content Review Workflow
- ADR-007: bcrypt Password Hashing
- ADR-008: Middleware Route Protection

**Format**: Context, Decision, Consequences, Alternatives

## Quick Reference

### System Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15 (React) | Server components, admin UI |
| API | Next.js Route Handlers | RESTful endpoints |
| Auth | jose (JWT), bcrypt | Token-based authentication |
| Database | PostgreSQL | Relational data storage |
| Runtime | Edge Runtime | Global low-latency deployment |
| Deployment | Vercel / Cloud | Serverless, auto-scaling |

### Security Features

1. **Authentication**: JWT with HS256, HTTP-only cookies
2. **Authorization**: Role-based access control (Admin, Editor, Viewer)
3. **Password Security**: bcrypt cost factor 12
4. **Rate Limiting**: 5 attempts per 15 minutes
5. **CSRF Protection**: SameSite cookies
6. **XSS Protection**: HTTP-only cookies, CSP headers
7. **Session Management**: Auto-refresh, blacklist revocation

### Database Tables

```
users (authentication)
  ├── refresh_tokens (session tracking)
  └── auth_audit_log (security events)

topics (hierarchical structure)
  └── content
      ├── content_reviews (approval workflow)
      └── content_media
          └── media (files)
```

### API Endpoints

```
/api/auth      - Authentication (login, logout, me)
/api/content   - Content CRUD and review
/api/topics    - Topic management
/api/media     - File uploads and management
/api/users     - User administration
```

### User Roles

| Role   | Permissions |
|--------|------------|
| Admin  | Full access: manage users, approve content, delete, configure |
| Editor | Create/edit content, upload media, submit for review |
| Viewer | Read-only: view dashboard, published content |

## Architecture Principles

### 1. Security First
- Never trust client input
- Defense in depth (multiple security layers)
- Principle of least privilege
- Audit all sensitive operations

### 2. Edge-First Design
- Stateless authentication (JWT)
- Global CDN deployment
- Minimize database round-trips
- Optimize for low latency

### 3. Developer Experience
- Type-safe APIs (TypeScript)
- Clear error messages
- Comprehensive documentation
- Consistent patterns

### 4. Scalability
- Stateless architecture
- Connection pooling
- Indexed database queries
- Horizontal scaling ready

### 5. Maintainability
- Clean separation of concerns
- Single responsibility principle
- Clear naming conventions
- Comprehensive comments

## Data Flow Overview

```
User Request
    ↓
Edge Middleware (Auth)
    ↓
Route Handler (Validation)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (PostgreSQL)
```

## Development Workflow

### Adding New Feature

1. **Design Phase**:
   - Create ADR if architectural decision
   - Update relevant architecture docs
   - Design database schema changes
   - Document API endpoints

2. **Implementation Phase**:
   - Database migration (if needed)
   - Service layer implementation
   - Route handler creation
   - Middleware updates (if needed)

3. **Testing Phase**:
   - Unit tests (service layer)
   - Integration tests (API endpoints)
   - E2E tests (user workflows)

4. **Documentation Phase**:
   - Update API documentation
   - Add code comments
   - Update README if needed

## Migration Checklist

### Before Production Launch

- [ ] Migrate users to PostgreSQL database
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Change default admin password
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure CORS for production domain
- [ ] Set up database connection pooling
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts
- [ ] Implement token blacklist cleanup
- [ ] Regular database backups
- [ ] Performance testing
- [ ] Security audit
- [ ] Load testing

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time (p95) | <200ms | TBD |
| Authentication Time | <100ms | ~50ms |
| Database Query Time | <50ms | TBD |
| Page Load Time | <1s | TBD |
| Token Refresh | Transparent | ✓ |

## Future Enhancements

### Short Term (1-3 months)
- [ ] Database migration from in-memory
- [ ] File upload to cloud storage (S3/Cloudinary)
- [ ] Real-time notifications
- [ ] Advanced search with filters
- [ ] Bulk operations API

### Medium Term (3-6 months)
- [ ] Multi-factor authentication (MFA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Advanced analytics dashboard
- [ ] Content versioning system
- [ ] API rate limiting with Redis

### Long Term (6-12 months)
- [ ] Multi-language support (i18n)
- [ ] Advanced caching strategy
- [ ] GraphQL API option
- [ ] Mobile app development
- [ ] AI-powered content suggestions

## Related Documentation

- [Project README](../../README.md)
- [API Documentation](../api/) (future)
- [User Guide](../user-guide/) (future)
- [Deployment Guide](../deployment/) (future)

## Maintenance

### Regular Tasks

**Weekly**:
- Review error logs
- Check slow query log
- Monitor disk usage

**Monthly**:
- Database vacuum and analyze
- Review and rotate logs
- Security patch updates
- Dependency updates

**Quarterly**:
- Security audit
- Performance review
- Architecture review
- Capacity planning

## Contact & Support

For architecture questions or proposals:
1. Create an issue on GitHub
2. Tag with `architecture` label
3. Reference relevant ADR or documentation

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-16 | Initial architecture documentation |

---

**Note**: This architecture documentation follows the SPARC methodology and C4 model standards. All diagrams use ASCII for universal readability.
