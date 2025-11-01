# Admin Authentication Setup Guide

This document explains how to set up and test the admin authentication system for Hablas.

## Overview

The admin panel uses **NextAuth.js** with **GitHub OAuth** for secure authentication. Only whitelisted GitHub accounts can access the admin panel.

## Architecture

- **Authentication Provider**: GitHub OAuth (free, no additional services required)
- **Session Management**: JWT-based sessions (30-day expiration)
- **Route Protection**: Next.js Middleware + Client-side guards
- **Access Control**: Email whitelist in environment variables

## Setup Instructions

### 1. Create a GitHub OAuth Application

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: `Hablas Admin Panel` (or your choice)
   - **Homepage URL**:
     - Development: `http://localhost:3000`
     - Production: `https://hablas.co`
   - **Authorization callback URL**:
     - Development: `http://localhost:3000/api/auth/callback/github`
     - Production: `https://hablas.co/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID**
6. Click "Generate a new client secret" and copy it immediately (you won't see it again)

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-command-below>

# GitHub OAuth
GITHUB_ID=<your-github-client-id>
GITHUB_SECRET=<your-github-client-secret>

# Admin Email Whitelist (comma-separated)
ADMIN_EMAILS=admin@hablas.co,your-github-email@example.com
```

#### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

#### Admin Email Whitelist

- Add GitHub account emails that should have admin access
- Use comma-separated values (no spaces)
- Emails are case-insensitive
- Example: `admin@hablas.co,john@example.com,jane@company.com`

### 3. Install Dependencies

The required packages are already in `package.json`:

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

## Testing the Authentication Flow

### Test 1: Unauthenticated Access Protection

1. Open browser to `http://localhost:3000/admin`
2. **Expected**: Automatic redirect to `/admin/login`
3. **Verify**: URL shows `/admin/login`

### Test 2: GitHub OAuth Login (Authorized User)

1. On login page, click "Iniciar sesión con GitHub"
2. **Expected**: Redirect to GitHub OAuth consent page
3. Click "Authorize" on GitHub
4. **Expected**:
   - Redirect back to `/admin`
   - See admin dashboard with your email displayed
   - Console shows: `✅ Admin access granted: your-email@example.com`

### Test 3: GitHub OAuth Login (Unauthorized User)

1. Test with a GitHub account NOT in `ADMIN_EMAILS`
2. **Expected**:
   - Redirect to `/admin/login` with error message
   - Error: "Acceso denegado. Tu cuenta no está autorizada..."
   - Console shows: `❌ Admin access denied: email@example.com (not in whitelist)`

### Test 4: Session Persistence

1. After successful login, close browser
2. Reopen browser to `http://localhost:3000/admin`
3. **Expected**: Direct access to admin panel (no login required)
4. **Note**: Session expires after 30 days

### Test 5: Logout Functionality

1. In admin panel, click "Cerrar Sesión" button
2. **Expected**:
   - Redirect to home page (`/`)
   - Session cleared
3. Navigate to `/admin` again
4. **Expected**: Redirect to `/admin/login`

### Test 6: Callback URL Preservation

1. While logged out, navigate to `http://localhost:3000/admin`
2. Note the redirect to `/admin/login?callbackUrl=%2Fadmin`
3. Login with GitHub
4. **Expected**: Redirect back to `/admin` (not `/admin/login`)

## Security Features

### 1. Email Whitelist Validation
- Only GitHub accounts with whitelisted emails can access admin panel
- Validation happens in `signIn` callback
- Failed attempts are logged server-side

### 2. Route Protection (Middleware)
- All `/admin/*` routes protected except `/admin/login`
- Unauthenticated requests automatically redirected
- JWT token validation on every request

### 3. Client-Side Guards
- `useRequireAuth()` hook for component-level protection
- Prevents flash of unauthorized content
- Graceful loading states

### 4. Secure Session Management
- JWT-based sessions (no database required)
- 30-day expiration with automatic renewal
- Secure HTTP-only cookies

## Troubleshooting

### Issue: "Configuration error" on login page

**Solution**: Check environment variables are set correctly in `.env.local`

```bash
# Verify variables are loaded
npm run dev
# Check server console for warnings about missing env vars
```

### Issue: "Access denied" even with correct email

**Possible causes**:
1. Email not in `ADMIN_EMAILS` whitelist
2. GitHub account uses different primary email
3. Typo in environment variable

**Solution**:
- Check GitHub account's primary email at https://github.com/settings/emails
- Ensure exact match in `ADMIN_EMAILS`
- Server console shows which email was used: `❌ Admin access denied: actual-email@example.com`

### Issue: Redirect loop on /admin

**Possible causes**:
1. `NEXTAUTH_URL` doesn't match your domain
2. `NEXTAUTH_SECRET` not set

**Solution**:
- Set `NEXTAUTH_URL=http://localhost:3000` for development
- Generate and set `NEXTAUTH_SECRET` using `openssl rand -base64 32`

### Issue: OAuth callback error

**Possible causes**:
1. Callback URL mismatch in GitHub OAuth app settings
2. `GITHUB_ID` or `GITHUB_SECRET` incorrect

**Solution**:
- Verify callback URL in GitHub app matches: `http://localhost:3000/api/auth/callback/github`
- Double-check `GITHUB_ID` and `GITHUB_SECRET` values

## Production Deployment

### Environment Variables for Production

```bash
# Production environment (.env.production)
NEXTAUTH_URL=https://hablas.co
NEXTAUTH_SECRET=<new-secure-secret-for-production>
GITHUB_ID=<production-github-app-client-id>
GITHUB_SECRET=<production-github-app-client-secret>
ADMIN_EMAILS=admin@hablas.co,authorized-user@example.com
```

### GitHub OAuth App for Production

Create a **separate** GitHub OAuth app for production:
- Homepage URL: `https://hablas.co`
- Callback URL: `https://hablas.co/api/auth/callback/github`

**Important**: Never use the same OAuth app for both development and production.

### Deployment Checklist

- [ ] Create production GitHub OAuth app
- [ ] Set production environment variables
- [ ] Generate new `NEXTAUTH_SECRET` for production
- [ ] Update `ADMIN_EMAILS` with production admin emails
- [ ] Test authentication flow in production
- [ ] Verify unauthorized access is blocked
- [ ] Check server logs for security warnings

## File Structure

```
app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts          # NextAuth configuration
├── admin/
│   ├── page.tsx                  # Protected admin dashboard
│   └── login/
│       └── page.tsx              # Login page with GitHub OAuth
lib/
├── auth.ts                       # Server-side auth utilities
└── auth-client.ts                # Client-side auth hooks
middleware.ts                     # Route protection middleware
```

## API Reference

### Server-Side Functions (lib/auth.ts)

```typescript
// Get current session
const session = await getSession()

// Check if user is authenticated
const isAuth = await isAuthenticated()

// Require authentication (throws if not authenticated)
const session = await requireAuth()

// Check if email is whitelisted
const isAdmin = isAdminEmail('user@example.com')
```

### Client-Side Hooks (lib/auth-client.ts)

```typescript
// Require authentication (auto-redirects to login)
const { session, status } = useRequireAuth()

// Check authentication status (no redirect)
const { isAuthenticated, isLoading, user } = useIsAuthenticated()

// Get current user
const { user, isLoading, isAuthenticated } = useCurrentUser()
```

## Support

For issues or questions about authentication:
1. Check server console for error messages
2. Verify environment variables are set correctly
3. Review GitHub OAuth app settings
4. Check browser console for client-side errors

## Security Notes

- **Never commit `.env.local`** to version control
- **Rotate secrets** regularly in production
- **Use different OAuth apps** for development and production
- **Limit admin emails** to only necessary personnel
- **Monitor server logs** for unauthorized access attempts
