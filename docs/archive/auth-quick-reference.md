# Authentication Quick Reference Card

## 🚀 Quick Start

### 1. Initialize
```bash
npm run auth:init
```

### 2. Login
- URL: `http://localhost:3000/admin/login`
- Email: `admin@hablas.co`
- Password: `Admin123!`

### 3. Access Protected Routes
- `/admin` - Admin dashboard
- `/api/content/*` - Content API

---

## 📋 Common Tasks

### Login User
```typescript
const { login } = useAuth();
const result = await login(email, password, rememberMe);
```

### Logout User
```typescript
const { logout } = useAuth();
await logout();
```

### Check Authentication
```typescript
const { isAuthenticated, user } = useAuth();
if (isAuthenticated) {
  console.log(user.name);
}
```

### Check Permissions
```typescript
const { hasPermission } = useAuth();
if (hasPermission('canEdit')) {
  // Show edit button
}
```

### Protect a Page
```typescript
import RequireAuth from '@/components/auth/RequireAuth';

export default function AdminPage() {
  return (
    <RequireAuth requiredRole="admin">
      <div>Admin content</div>
    </RequireAuth>
  );
}
```

### Conditional Rendering
```typescript
import PermissionGate from '@/components/auth/PermissionGate';

<PermissionGate permission="canEdit">
  <button>Edit</button>
</PermissionGate>
```

### API Protection
```typescript
import { requireAuth } from '@/lib/auth/middleware-helper';

export async function POST(request: NextRequest) {
  const { user, role } = await requireAuth(request);
  // user is authenticated
}
```

---

## 🔑 Environment Variables

```bash
# Required
JWT_SECRET=your-super-secret-key
ADMIN_EMAIL=admin@hablas.co
ADMIN_PASSWORD=Admin123!

# Optional
NODE_ENV=development
```

---

## 🎭 User Roles

| Role   | Edit | Approve | Delete | Dashboard | Manage Users |
|--------|------|---------|--------|-----------|--------------|
| Admin  | ✅   | ✅      | ✅     | ✅        | ✅           |
| Editor | ✅   | ❌      | ❌     | ✅        | ❌           |
| Viewer | ❌   | ❌      | ❌     | ✅        | ❌           |

---

## 🌐 API Endpoints

| Method | Endpoint             | Description       |
|--------|---------------------|-------------------|
| POST   | /api/auth/login     | Login user        |
| POST   | /api/auth/logout    | Logout user       |
| POST   | /api/auth/refresh   | Refresh token     |
| GET    | /api/auth/me        | Get current user  |

---

## 🛡️ Security Features

✅ JWT tokens with 7-day expiry
✅ HttpOnly cookies (XSS protection)
✅ Bcrypt password hashing (10 rounds)
✅ Rate limiting (5 attempts / 15 min)
✅ Automatic token refresh
✅ Secure session management

---

## 🐛 Troubleshooting

### Can't Login
```bash
# Re-initialize admin user
npm run auth:init
```

### Token Expired
```bash
# Clear cookies and login again
# Or wait for automatic refresh
```

### Permission Denied
```typescript
// Check current user role
const { user } = useAuth();
console.log(user?.role); // admin, editor, or viewer
```

---

## 📁 Key Files

| File                          | Purpose                |
|-------------------------------|------------------------|
| `/lib/auth/types.ts`          | Type definitions       |
| `/lib/auth/jwt.ts`            | Token management       |
| `/lib/auth/users.ts`          | User operations        |
| `/lib/auth/permissions.ts`    | Access control         |
| `/lib/contexts/AuthContext.tsx` | React context        |
| `/app/admin/login/page.tsx`   | Login UI               |
| `/middleware.ts`              | Route protection       |
| `/data/users.json`            | User storage           |

---

## 🚨 Production Deployment

### Before Going Live

1. **Change JWT Secret**
   ```bash
   JWT_SECRET=$(openssl rand -base64 64)
   ```

2. **Change Admin Password**
   ```bash
   ADMIN_PASSWORD=$(openssl rand -base64 32)
   ```

3. **Set Production Mode**
   ```bash
   NODE_ENV=production
   ```

4. **Verify Security**
   - [ ] HTTPS enabled
   - [ ] Secure cookies enabled
   - [ ] Strong passwords enforced
   - [ ] Rate limiting active

---

## 💡 Tips

- Use "Remember Me" for 30-day sessions
- Tokens auto-refresh before expiry
- Middleware protects all `/admin/*` routes
- HttpOnly cookies prevent XSS attacks
- Password must be 8+ chars with number and special char

---

## 📚 Full Documentation

See `/docs/authentication-system.md` for complete details.
