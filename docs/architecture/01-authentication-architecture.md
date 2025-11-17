# Authentication Architecture

## Overview

The Hablas authentication system is built on a stateless JWT-based architecture optimized for Next.js 15 Edge Runtime. It provides secure, scalable authentication with role-based access control (RBAC).

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Browser    │  │   Mobile     │  │   Desktop    │     │
│  │   (Cookies)  │  │   (Token)    │  │   (Token)    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    HTTPS + JWT Token
                             │
┌────────────────────────────┼────────────────────────────────┐
│                  Next.js Middleware (Edge)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Extract Token (Cookie/Header)                     │  │
│  │  2. Verify JWT Signature (jose/HS256)                │  │
│  │  3. Check Expiration                                  │  │
│  │  4. Refresh if near expiry (<24h)                    │  │
│  │  5. Route Authorization (RBAC)                       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
         Authorized                    Unauthorized
              │                             │
              ▼                             ▼
┌─────────────────────────┐    ┌──────────────────────────┐
│   Protected Routes      │    │  Redirect to Login       │
│   /admin/*              │    │  /admin/login            │
│   /api/content/*        │    │  ?redirect=/original     │
│   /api/topics/*         │    │  &error=session-expired  │
└─────────────────────────┘    └──────────────────────────┘
```

## Core Components

### 1. JWT Token Management (`lib/auth/jwt.ts`)

**Technology**: jose library (Edge Runtime compatible)

**Key Features**:
- HS256 algorithm for symmetric signing
- Configurable expiration (7d default, 30d with remember-me)
- Automatic token refresh when <24h to expiry
- Secure secret key management

**Token Structure**:
```typescript
{
  // Header
  alg: 'HS256',
  typ: 'JWT',

  // Payload
  userId: string,
  email: string,
  role: 'admin' | 'editor' | 'viewer',
  iat: number,  // Issued at
  exp: number   // Expiration
}
```

**Functions**:
- `generateToken()`: Create new JWT with user claims
- `verifyToken()`: Validate and decode JWT
- `refreshToken()`: Auto-refresh tokens near expiry
- `getUserFromToken()`: Extract user session
- `isTokenValid()`: Quick validity check
- `getTokenExpiry()`: Get expiration timestamp

### 2. Cookie Management (`lib/auth/cookies.ts`)

**Strategy**: HTTP-only, Secure, SameSite cookies

**Cookie Configuration**:
```typescript
{
  name: 'auth-token',
  httpOnly: true,        // Prevent XSS access
  secure: true,          // HTTPS only in production
  sameSite: 'lax',       // CSRF protection
  path: '/',             // Global scope
  maxAge: 7d | 30d      // Based on remember-me
}
```

**Functions**:
- `createAuthCookie()`: Generate secure cookie string
- `getTokenFromRequest()`: Extract token from request
- `clearAuthCookie()`: Remove authentication cookie

### 3. Middleware Protection (`middleware.ts`)

**Runtime**: Next.js Edge Runtime
**Scope**: Global route protection

**Flow**:
```
Request → Route Check → Token Extract → Verify → Refresh? → Authorize → Continue/Redirect
```

**Protected Routes**:
- `/admin/*` - Admin dashboard and management
- `/api/content/*` - Content CRUD operations
- `/api/topics/*` - Topic management
- `/api/media/*` - Media operations

**Public Routes** (bypass authentication):
- `/admin/login` - Login page
- `/api/auth/*` - Authentication endpoints
- Static assets
- Public content views

**Middleware Logic**:
1. Parse request path
2. Determine if route requires authentication
3. Extract JWT from cookie or Authorization header
4. Verify JWT signature and expiration
5. Check if token needs refresh (<24h to expiry)
6. Validate role-based permissions
7. Continue request or redirect to login

### 4. User Management (`lib/auth/users.ts`)

**Storage**: In-memory Map (currently) → Database migration ready

**User Schema**:
```typescript
{
  id: string,           // UUID
  email: string,        // Unique identifier
  password: string,     // bcrypt hash (cost: 12)
  role: UserRole,       // admin | editor | viewer
  name: string,         // Display name
  createdAt: string,    // ISO timestamp
  lastLogin: string     // ISO timestamp
}
```

**Functions**:
- `validateCredentials()`: Password verification with bcrypt
- `getUserById()`: Fetch user by ID
- `getUserByEmail()`: Fetch user by email
- `createUser()`: Register new user
- `updateUser()`: Modify user details
- `deleteUser()`: Remove user
- `toUserSession()`: Strip password for client
- `initializeDefaultAdmin()`: Bootstrap admin user

**Default Admin**:
- Email: `admin@hablas.local`
- Password: `admin123` (MUST change in production)
- Role: `admin`
- Auto-created on first startup

### 5. Permission System (`lib/auth/permissions.ts`)

**Model**: Role-Based Access Control (RBAC)

**Roles and Permissions**:

| Permission         | Admin | Editor | Viewer |
|-------------------|-------|--------|--------|
| canEdit           | ✓     | ✓      | ✗      |
| canApprove        | ✓     | ✗      | ✗      |
| canDelete         | ✓     | ✗      | ✗      |
| canViewDashboard  | ✓     | ✓      | ✓      |
| canManageUsers    | ✓     | ✗      | ✗      |

**Functions**:
- `hasPermission()`: Check if user role has specific permission
- `requirePermission()`: Throw error if permission denied
- `getPermissions()`: Get all permissions for role

## Security Features

### 1. Password Security
- **Algorithm**: bcrypt with cost factor 12
- **Salt**: Automatic per-password random salt
- **Timing Attack Prevention**: Constant-time comparison

### 2. JWT Security
- **Algorithm**: HS256 (HMAC-SHA256)
- **Secret**: Environment variable `JWT_SECRET` (min 32 chars recommended)
- **Expiration**: Mandatory expiration timestamps
- **Refresh**: Automatic refresh to minimize token lifetime

### 3. Cookie Security
- **HttpOnly**: Prevents JavaScript access (XSS protection)
- **Secure**: HTTPS-only transmission in production
- **SameSite**: Lax mode for CSRF protection
- **Path**: Limited to application scope

### 4. Rate Limiting
- **Implementation**: In-memory IP-based tracking
- **Limit**: 5 failed attempts per IP
- **Lockout**: 15 minutes after limit exceeded
- **Reset**: Automatic on successful login

### 5. Protection Against Common Attacks

| Attack Type          | Mitigation                                    |
|---------------------|-----------------------------------------------|
| XSS                 | HttpOnly cookies, Content Security Policy     |
| CSRF                | SameSite cookies, Token validation            |
| SQL Injection       | Parameterized queries (when DB integrated)    |
| Brute Force         | Rate limiting, account lockout                |
| Session Hijacking   | HTTPS-only, secure cookies, short expiration  |
| Token Replay        | Expiration timestamps, refresh mechanism      |

## Session Management

### Token Lifecycle

```
┌─────────────┐
│   Login     │
│  (POST)     │
└─────┬───────┘
      │
      ▼
┌─────────────────────┐
│  Generate JWT       │
│  - userId           │
│  - email            │
│  - role             │
│  - exp: 7d/30d      │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│  Set Cookie         │
│  - httpOnly         │
│  - secure           │
│  - sameSite: lax    │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────────┐
│  User Activity          │
│  (Middleware checks)    │
│  - Token valid?         │
│  - Expiry < 24h?        │
│    → Auto-refresh       │
└─────┬───────────────────┘
      │
      ▼
┌─────────────────────┐
│  Logout or Expire   │
│  - Clear cookie     │
│  - Redirect login   │
└─────────────────────┘
```

### Refresh Strategy

**Trigger**: Token expiration < 24 hours
**Action**: Generate new token with same claims
**Delivery**: Updated cookie in middleware response
**User Impact**: Transparent, no re-login required

## Migration to Database

### Current State
- In-memory user storage (Map)
- Lost on server restart
- Not scalable for production

### Recommended Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Refresh tokens table (for token revocation)
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Audit log for security events
CREATE TABLE auth_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON auth_audit_log(user_id);
CREATE INDEX idx_audit_type ON auth_audit_log(event_type);
CREATE INDEX idx_audit_created ON auth_audit_log(created_at);
```

### Migration Path

1. **Install Database Client**:
   - PostgreSQL: `pg` or `@vercel/postgres`
   - SQLite: `better-sqlite3`
   - Prisma ORM (recommended)

2. **Create Migration Scripts**:
   - `/lib/db/migrations/001_create_users.sql`
   - `/lib/db/migrations/002_create_refresh_tokens.sql`

3. **Update User Management**:
   - Replace Map with database queries
   - Implement connection pooling
   - Add transaction support

4. **Add Session Tracking**:
   - Store refresh tokens in database
   - Implement token revocation
   - Track user sessions

## Environment Configuration

### Required Variables

```env
# JWT Secret (CRITICAL)
# Generate: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database (when migrated)
DATABASE_URL=postgresql://user:password@localhost:5432/hablas

# Environment
NODE_ENV=production

# Optional: Custom token expiration
JWT_EXPIRY=7d
JWT_REMEMBER_EXPIRY=30d
```

### Production Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up database connection pooling
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set up monitoring/alerts
- [ ] Implement token revocation
- [ ] Regular security audits

## API Integration

All authentication endpoints use consistent response format:

```typescript
// Success Response
{
  success: true,
  user: UserSession,
  token?: string  // Only on login
}

// Error Response
{
  success: false,
  error: string
}
```

## Performance Considerations

1. **Edge Runtime**: All authentication runs on Edge for global low latency
2. **JWT Verification**: Cryptographic operations are optimized with jose
3. **Cookie Strategy**: Reduces API calls by storing token client-side
4. **Auto-refresh**: Minimizes re-login disruptions
5. **Rate Limiting**: In-memory for fast lookups (consider Redis for scale)

## Future Enhancements

1. **Multi-Factor Authentication (MFA)**:
   - TOTP (Time-based One-Time Password)
   - SMS/Email verification
   - Backup codes

2. **OAuth/SSO Integration**:
   - Google Sign-In
   - GitHub OAuth
   - SAML for enterprise

3. **Session Management UI**:
   - View active sessions
   - Revoke specific sessions
   - Device management

4. **Advanced Security**:
   - Anomaly detection
   - Geolocation-based access
   - Device fingerprinting
   - Password policy enforcement

5. **Audit Trail**:
   - Detailed event logging
   - Security dashboards
   - Compliance reports
