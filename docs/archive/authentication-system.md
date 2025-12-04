# Authentication System Documentation

## Overview

The Hablas.co platform now features a complete, production-ready authentication system with JWT tokens, role-based access control, and secure session management.

## Architecture

### Components

1. **JWT Token System** (`/lib/auth/jwt.ts`)
   - Token generation with configurable expiry
   - Token verification and validation
   - Automatic token refresh
   - Secure secret management

2. **User Management** (`/lib/auth/users.ts`)
   - User credential validation
   - Password hashing with bcrypt
   - User role management
   - Secure user data storage

3. **Permission System** (`/lib/auth/permissions.ts`)
   - Role-based access control (RBAC)
   - Permission checking utilities
   - Role hierarchy enforcement

4. **Cookie Management** (`/lib/auth/cookies.ts`)
   - HttpOnly cookies for security
   - Secure cookie configuration
   - Cookie parsing utilities

5. **Middleware** (`/middleware.ts`)
   - Route protection
   - Authentication verification
   - Automatic token refresh
   - Redirect handling

## User Roles

### Admin
- **Permissions**: Full access
- **Capabilities**:
  - Edit content
  - Approve content
  - Delete content
  - View dashboard
  - Manage users

### Editor
- **Permissions**: Limited access
- **Capabilities**:
  - Edit content (needs approval)
  - View dashboard
  - Cannot delete or manage users

### Viewer
- **Permissions**: Read-only
- **Capabilities**:
  - View admin dashboard
  - Cannot edit, approve, or delete

## Setup Instructions

### 1. Environment Configuration

Add to `.env.local`:

```bash
# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_EMAIL=admin@hablas.co
ADMIN_PASSWORD=Admin123!
```

**IMPORTANT**: Change these values in production!

### 2. Initialize Admin User

Run the initialization script:

```bash
npm run auth:init
```

This creates the default admin user if no users exist.

### 3. Update .gitignore

Ensure sensitive files are not committed:

```
.env.local
/data/users.json
```

## API Endpoints

### Authentication

#### POST /api/auth/login
Login with email and password.

**Request**:
```json
{
  "email": "admin@hablas.co",
  "password": "Admin123!",
  "rememberMe": false
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "admin@hablas.co",
    "role": "admin",
    "name": "Admin User"
  },
  "token": "eyJhbGc..."
}
```

#### POST /api/auth/logout
Logout current user.

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /api/auth/refresh
Refresh authentication token.

**Response**:
```json
{
  "success": true,
  "refreshed": true,
  "token": "eyJhbGc..."
}
```

#### GET /api/auth/me
Get current authenticated user.

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "admin@hablas.co",
    "role": "admin",
    "name": "Admin User",
    "permissions": {
      "canEdit": true,
      "canApprove": true,
      "canDelete": true,
      "canViewDashboard": true,
      "canManageUsers": true
    }
  }
}
```

## React Context & Hooks

### AuthContext

Provides authentication state throughout the app.

```typescript
import { useAuth } from '@/lib/contexts/AuthContext';

function MyComponent() {
  const {
    user,              // Current user session
    isAuthenticated,   // Boolean auth status
    isLoading,         // Loading state
    login,             // Login function
    logout,            // Logout function
    refreshUser,       // Refresh user data
    hasPermission,     // Check permission
    isRole,            // Check role
  } = useAuth();
}
```

### Usage Examples

#### Check Authentication
```typescript
const { isAuthenticated } = useAuth();

if (isAuthenticated) {
  // Render protected content
}
```

#### Check Permissions
```typescript
const { hasPermission } = useAuth();

if (hasPermission('canEdit')) {
  // Show edit button
}
```

#### Login
```typescript
const { login } = useAuth();

const handleLogin = async () => {
  const result = await login('admin@hablas.co', 'password', true);
  if (result.success) {
    // Redirect to dashboard
  } else {
    // Show error
  }
};
```

## Protected Routes

### Using Middleware

Routes are automatically protected via `/middleware.ts`:

- `/admin/*` - Requires authentication
- `/api/content/*` - Requires authentication
- `/admin/login` - Public (login page)
- `/api/auth/*` - Public (auth endpoints)

### Using Components

#### RequireAuth Component

```typescript
import RequireAuth from '@/components/auth/RequireAuth';

export default function AdminPage() {
  return (
    <RequireAuth requiredRole="admin">
      <div>Admin content here</div>
    </RequireAuth>
  );
}
```

#### PermissionGate Component

```typescript
import PermissionGate from '@/components/auth/PermissionGate';

export default function Dashboard() {
  return (
    <div>
      <PermissionGate permission="canEdit">
        <button>Edit</button>
      </PermissionGate>

      <PermissionGate permission="canDelete">
        <button>Delete</button>
      </PermissionGate>
    </div>
  );
}
```

## Security Features

### Password Security
- Bcrypt hashing with 10 salt rounds
- Minimum 8 characters
- Requires 1 number
- Requires 1 special character

### Token Security
- JWT with 7-day expiry (default)
- 30-day expiry with "Remember Me"
- Automatic refresh before expiry
- HttpOnly cookies (XSS protection)

### Rate Limiting
- 5 login attempts per IP
- 15-minute lockout period
- Automatic cleanup of old attempts

### Session Management
- Secure cookie configuration
- SameSite: Lax
- Secure flag in production
- Automatic token rotation

## Development Workflow

### 1. Login
Navigate to `/admin/login` and use:
- Email: `admin@hablas.co`
- Password: `Admin123!`

### 2. Authenticated State
Once logged in:
- Admin navigation appears
- Protected routes accessible
- User info in top-right corner

### 3. Logout
Click "Sign Out" in admin menu or call `logout()`.

## Testing

### Manual Testing

1. **Login Flow**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@hablas.co","password":"Admin123!"}'
   ```

2. **Protected Route**
   ```bash
   curl http://localhost:3000/api/auth/me \
     -H "Cookie: hablas_auth_token=YOUR_TOKEN"
   ```

3. **Logout**
   ```bash
   curl -X POST http://localhost:3000/api/auth/logout \
     -H "Cookie: hablas_auth_token=YOUR_TOKEN"
   ```

## Troubleshooting

### Cannot Login
1. Check `.env.local` has correct credentials
2. Run `npm run auth:init` to create admin user
3. Verify `data/users.json` exists

### Token Expired
1. Clear cookies
2. Login again
3. Check JWT_SECRET is consistent

### Permission Denied
1. Verify user role in `/api/auth/me`
2. Check permission requirements
3. Ensure user has correct role

## Production Deployment

### Pre-Deployment Checklist

1. **Change Default Credentials**
   ```bash
   JWT_SECRET=$(openssl rand -base64 64)
   ADMIN_PASSWORD=$(openssl rand -base64 32)
   ```

2. **Update Environment**
   - Set `NODE_ENV=production`
   - Use strong JWT_SECRET
   - Change default admin password

3. **Security Headers**
   - Enable HTTPS
   - Set secure cookie flags
   - Configure CSP headers

4. **Database Migration**
   - Move from JSON to database
   - Implement proper user management
   - Add audit logging

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Password reset via email
- [ ] User session management dashboard
- [ ] OAuth integration (Google, GitHub)
- [ ] Activity logging
- [ ] IP-based restrictions
- [ ] Device fingerprinting
- [ ] Passwordless authentication

## Support

For issues or questions:
1. Check this documentation
2. Review `/lib/auth/` source code
3. Test with development credentials
4. Check browser console for errors
