# API Architecture

## Overview

The Hablas API follows RESTful principles with Next.js 15 Route Handlers, providing a clean, consistent interface for content management, authentication, and media handling.

## API Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway Layer                         │
│                    (Next.js Route Handlers)                      │
└───────────┬─────────────────────────────────────────────────────┘
            │
    ┌───────┴────────┐
    │   Middleware   │
    │   - Auth       │
    │   - CORS       │
    │   - Rate Limit │
    └───────┬────────┘
            │
    ┌───────┴────────────────────────────────────────┐
    │              Route Handlers                     │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
    │  │  /auth   │  │ /content │  │  /topics │    │
    │  │  - login │  │ - CRUD   │  │  - CRUD  │    │
    │  │  - logout│  │ - review │  │  - review│    │
    │  └──────────┘  └──────────┘  └──────────┘    │
    │  ┌──────────┐  ┌──────────┐                   │
    │  │  /media  │  │  /users  │                   │
    │  │  - upload│  │  - CRUD  │                   │
    │  │  - delete│  │  - perms │                   │
    │  └──────────┘  └──────────┘                   │
    └───────┬────────────────────────────────────────┘
            │
    ┌───────┴────────────────────────────────────────┐
    │            Business Logic Layer                 │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
    │  │   Auth   │  │  Content │  │  Topics  │    │
    │  │  Service │  │  Service │  │  Service │    │
    │  └──────────┘  └──────────┘  └──────────┘    │
    │  ┌──────────┐  ┌──────────┐                   │
    │  │   Media  │  │   User   │                   │
    │  │  Service │  │  Service │                   │
    │  └──────────┘  └──────────┘                   │
    └───────┬────────────────────────────────────────┘
            │
    ┌───────┴────────────────────────────────────────┐
    │              Data Access Layer                  │
    │  ┌──────────────────────────────────────┐     │
    │  │        Database / Storage             │     │
    │  │  - User data                          │     │
    │  │  - Content metadata                   │     │
    │  │  - Review status                      │     │
    │  │  - Topic management                   │     │
    │  └──────────────────────────────────────┘     │
    └────────────────────────────────────────────────┘
```

## API Structure

### Base URL Structure

```
/api
├── /auth
│   ├── /login      [POST]
│   ├── /logout     [POST]
│   └── /me         [GET]
│
├── /content
│   ├── /           [GET, POST]
│   ├── /[id]       [GET, PATCH, DELETE]
│   ├── /[id]/review [POST]
│   └── /bulk       [POST, PATCH, DELETE]
│
├── /topics
│   ├── /           [GET, POST]
│   ├── /[id]       [GET, PATCH, DELETE]
│   ├── /[id]/content [GET]
│   └── /[id]/review [POST]
│
├── /media
│   ├── /upload     [POST]
│   ├── /[id]       [GET, DELETE]
│   └── /bulk       [DELETE]
│
└── /users
    ├── /           [GET, POST]
    ├── /[id]       [GET, PATCH, DELETE]
    └── /[id]/permissions [PATCH]
```

## Endpoint Specifications

### 1. Authentication API (`/api/auth`)

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request**:
```typescript
{
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

**Response** (200):
```typescript
{
  success: true;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    name: string;
  };
  token: string;
}
```

**Errors**:
- 400: Missing email or password
- 401: Invalid credentials
- 429: Too many login attempts

**Rate Limit**: 5 attempts per 15 minutes per IP

---

#### POST /api/auth/logout
Clear authentication cookie and invalidate session.

**Response** (200):
```typescript
{
  success: true;
}
```

---

#### GET /api/auth/me
Get current authenticated user.

**Headers**: `Authorization: Bearer <token>` or Cookie

**Response** (200):
```typescript
{
  success: true;
  user: UserSession;
}
```

**Errors**:
- 401: Not authenticated

---

### 2. Content API (`/api/content`)

#### GET /api/content
List content items with filtering and pagination.

**Query Parameters**:
```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 50, Max: 100
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  topic?: string;       // Filter by topic ID
  search?: string;      // Full-text search
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  order?: 'asc' | 'desc';
}
```

**Response** (200):
```typescript
{
  success: true;
  data: ContentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Permissions**: viewer, editor, admin

---

#### POST /api/content
Create new content item.

**Request**:
```typescript
{
  title: string;
  content: string;
  topicId?: string;
  type: 'lesson' | 'exercise' | 'resource';
  metadata?: Record<string, any>;
}
```

**Response** (201):
```typescript
{
  success: true;
  data: ContentItem;
}
```

**Errors**:
- 400: Invalid input
- 403: Insufficient permissions

**Permissions**: editor, admin

---

#### GET /api/content/[id]
Get single content item by ID.

**Response** (200):
```typescript
{
  success: true;
  data: ContentItem;
}
```

**Errors**:
- 404: Content not found

**Permissions**: viewer, editor, admin

---

#### PATCH /api/content/[id]
Update content item.

**Request**:
```typescript
{
  title?: string;
  content?: string;
  topicId?: string;
  metadata?: Record<string, any>;
}
```

**Response** (200):
```typescript
{
  success: true;
  data: ContentItem;
}
```

**Errors**:
- 400: Invalid input
- 403: Insufficient permissions
- 404: Content not found

**Permissions**: editor, admin

---

#### DELETE /api/content/[id]
Delete content item.

**Response** (200):
```typescript
{
  success: true;
  data: { id: string };
}
```

**Errors**:
- 403: Insufficient permissions
- 404: Content not found

**Permissions**: admin only

---

#### POST /api/content/[id]/review
Submit review decision for content.

**Request**:
```typescript
{
  action: 'approve' | 'reject' | 'request_changes';
  comments?: string;
  reviewerId: string;
}
```

**Response** (200):
```typescript
{
  success: true;
  data: {
    id: string;
    status: string;
    reviewedAt: string;
    reviewedBy: string;
  };
}
```

**Errors**:
- 400: Invalid action
- 403: Insufficient permissions
- 404: Content not found

**Permissions**: admin only

---

### 3. Topics API (`/api/topics`)

#### GET /api/topics
List all topics.

**Query Parameters**:
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  includeContent?: boolean; // Include content count
}
```

**Response** (200):
```typescript
{
  success: true;
  data: Topic[];
  pagination: PaginationMeta;
}
```

---

#### POST /api/topics
Create new topic.

**Request**:
```typescript
{
  name: string;
  description?: string;
  order?: number;
  parentId?: string;      // For nested topics
  metadata?: Record<string, any>;
}
```

**Response** (201):
```typescript
{
  success: true;
  data: Topic;
}
```

**Permissions**: admin only

---

#### GET /api/topics/[id]
Get topic details.

**Response** (200):
```typescript
{
  success: true;
  data: Topic & {
    contentCount: number;
    children?: Topic[];
  };
}
```

---

#### PATCH /api/topics/[id]
Update topic.

**Request**:
```typescript
{
  name?: string;
  description?: string;
  order?: number;
  parentId?: string;
}
```

**Response** (200):
```typescript
{
  success: true;
  data: Topic;
}
```

**Permissions**: admin only

---

#### DELETE /api/topics/[id]
Delete topic.

**Query Parameters**:
```typescript
{
  cascade?: boolean;  // Also delete related content
}
```

**Response** (200):
```typescript
{
  success: true;
  data: { id: string; deleted: number };
}
```

**Permissions**: admin only

---

#### GET /api/topics/[id]/content
Get all content for a topic.

**Query Parameters**: Same as GET /api/content

**Response** (200):
```typescript
{
  success: true;
  data: ContentItem[];
  pagination: PaginationMeta;
}
```

---

### 4. Media API (`/api/media`)

#### POST /api/media/upload
Upload media file.

**Request**: multipart/form-data
```typescript
{
  file: File;
  alt?: string;
  caption?: string;
  topicId?: string;
}
```

**Response** (201):
```typescript
{
  success: true;
  data: {
    id: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedBy: string;
    uploadedAt: string;
  };
}
```

**Errors**:
- 400: Invalid file type or size
- 403: Insufficient permissions
- 413: File too large

**Permissions**: editor, admin
**Max File Size**: 10MB (configurable)

---

#### GET /api/media/[id]
Get media metadata.

**Response** (200):
```typescript
{
  success: true;
  data: MediaItem;
}
```

---

#### DELETE /api/media/[id]
Delete media file.

**Response** (200):
```typescript
{
  success: true;
  data: { id: string };
}
```

**Permissions**: admin only

---

### 5. Users API (`/api/users`)

#### GET /api/users
List all users.

**Query Parameters**:
```typescript
{
  page?: number;
  limit?: number;
  role?: 'admin' | 'editor' | 'viewer';
  search?: string;
}
```

**Response** (200):
```typescript
{
  success: true;
  data: UserSession[];
  pagination: PaginationMeta;
}
```

**Permissions**: admin only

---

#### POST /api/users
Create new user.

**Request**:
```typescript
{
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}
```

**Response** (201):
```typescript
{
  success: true;
  data: UserSession;
}
```

**Permissions**: admin only

---

#### GET /api/users/[id]
Get user details.

**Response** (200):
```typescript
{
  success: true;
  data: UserSession;
}
```

**Permissions**: admin or self

---

#### PATCH /api/users/[id]
Update user.

**Request**:
```typescript
{
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'editor' | 'viewer';
}
```

**Response** (200):
```typescript
{
  success: true;
  data: UserSession;
}
```

**Permissions**: admin or self (limited fields)

---

#### DELETE /api/users/[id]
Delete user.

**Response** (200):
```typescript
{
  success: true;
  data: { id: string };
}
```

**Permissions**: admin only

---

## Common Patterns

### Request/Response Format

All API responses follow this structure:

**Success**:
```typescript
{
  success: true;
  data: T;
  pagination?: PaginationMeta;
}
```

**Error**:
```typescript
{
  success: false;
  error: string;
  details?: Record<string, any>;
}
```

### Pagination

```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### Error Codes

| Code | Meaning           | Usage                          |
|------|-------------------|--------------------------------|
| 200  | OK                | Successful GET, PATCH, DELETE  |
| 201  | Created           | Successful POST                |
| 400  | Bad Request       | Invalid input                  |
| 401  | Unauthorized      | Missing or invalid auth        |
| 403  | Forbidden         | Insufficient permissions       |
| 404  | Not Found         | Resource doesn't exist         |
| 409  | Conflict          | Duplicate resource             |
| 413  | Payload Too Large | File size exceeded             |
| 422  | Unprocessable     | Validation error               |
| 429  | Too Many Requests | Rate limit exceeded            |
| 500  | Server Error      | Internal error                 |

## Middleware Chain

```
Request
   │
   ▼
┌────────────────┐
│  CORS Handler  │  Allow origins, methods, headers
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Rate Limiter   │  Check IP-based limits
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Auth Verifier  │  Extract and verify JWT
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Permission     │  Check RBAC permissions
│ Checker        │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Request        │  Log request details
│ Logger         │
└───────┬────────┘
        │
        ▼
   Route Handler
```

## Security Measures

1. **Authentication**: JWT tokens required for protected routes
2. **Authorization**: Role-based access control (RBAC)
3. **Rate Limiting**: IP-based throttling
4. **Input Validation**: Schema validation with Zod
5. **SQL Injection**: Parameterized queries
6. **XSS Protection**: Content sanitization
7. **CSRF**: SameSite cookies + token validation
8. **CORS**: Configured allowed origins

## Performance Optimizations

1. **Edge Runtime**: Global CDN deployment
2. **Caching**: HTTP cache headers
3. **Pagination**: Limit large datasets
4. **Compression**: Gzip/Brotli responses
5. **Database Indexes**: Optimized queries
6. **Connection Pooling**: Reuse DB connections

## API Versioning Strategy

### Current: Path-based versioning (future)
```
/api/v1/content
/api/v2/content
```

### Migration Plan:
1. Introduce `/api/v1` prefix
2. Maintain backward compatibility
3. Deprecation notices in headers
4. Remove old versions after 6 months

## Testing Strategy

1. **Unit Tests**: Individual route handlers
2. **Integration Tests**: Full API workflows
3. **E2E Tests**: Client-server interaction
4. **Load Tests**: Performance benchmarks
5. **Security Tests**: Penetration testing

## Monitoring & Observability

Recommended metrics to track:

1. **Request Metrics**:
   - Request rate (req/s)
   - Response time (p50, p95, p99)
   - Error rate (4xx, 5xx)

2. **Auth Metrics**:
   - Login success/failure rate
   - Token refresh rate
   - Session duration

3. **Business Metrics**:
   - Content creation rate
   - Review approval rate
   - User activity

4. **Resource Metrics**:
   - CPU usage
   - Memory usage
   - Database connections
