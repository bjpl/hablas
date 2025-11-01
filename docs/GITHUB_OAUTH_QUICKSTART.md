# GitHub OAuth Quickstart Guide
**Project**: Hablas Admin Authentication
**Last Updated**: November 1, 2025

> **⚠️ NOTE**: This guide is for reference only. Based on the Static Export Migration Plan, we recommend **removing the admin panel** instead of setting up authentication. See `docs/STATIC_EXPORT_MIGRATION_PLAN.md` for details.

---

## Overview

This guide walks you through setting up GitHub OAuth for admin authentication in the Hablas project. You'll create a GitHub OAuth application and configure your local environment to enable secure admin panel access.

**Time Required**: 15-20 minutes
**Prerequisites**: GitHub account, repository access

---

## Step 1: Create GitHub OAuth Application

### Development Setup

1. **Navigate to GitHub Developer Settings**
   - Go to: https://github.com/settings/developers
   - Click on "OAuth Apps" in the left sidebar
   - Click the "New OAuth App" button (green button, top right)

2. **Fill in Application Details**

   ```
   Application name: Hablas Admin (Development)
   Homepage URL: http://localhost:3000
   Application description: Local development authentication for Hablas admin panel
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```

   **Important**:
   - The callback URL MUST match exactly (including `http://` and port `3000`)
   - Do NOT use `https://` for localhost
   - Do NOT add trailing slash

3. **Register the Application**
   - Click "Register application"
   - You'll see the application details page

4. **Get Your Credentials**
   - **Client ID**: Copy this value (visible immediately)
   - **Client Secret**:
     - Click "Generate a new client secret"
     - **IMMEDIATELY** copy the secret (you can only see it once!)
     - Store it securely (don't commit to git!)

### Production Setup (when deploying)

Create a **separate** OAuth app for production:

1. **Create Another OAuth App**
   - Follow same steps as above
   - Use different name: "Hablas Admin (Production)"

2. **Production URLs**
   ```
   Homepage URL: https://hablas.co
   Authorization callback URL: https://hablas.co/api/auth/callback/github
   ```

3. **Save Production Credentials**
   - Use these in your production environment variables
   - Never mix development and production credentials

---

## Step 2: Configure Local Environment

### Create `.env.local` File

Create a new file in your project root:

```bash
# Navigate to project root
cd /path/to/hablas

# Create .env.local file (NOT tracked by git)
touch .env.local
```

### Add Environment Variables

Open `.env.local` and add:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# GitHub OAuth
GITHUB_ID=your-github-client-id-here
GITHUB_SECRET=your-github-client-secret-here

# Admin Email Whitelist (comma-separated)
ADMIN_EMAILS=your-email@example.com,another-admin@example.com
```

### Generate NEXTAUTH_SECRET

**On macOS/Linux**:
```bash
openssl rand -base64 32
```

**On Windows (PowerShell)**:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Or use online generator**:
- https://generate-secret.vercel.app/32

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

### Example `.env.local` (Complete)

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=P7vkDQ2vK8xR9wF3mN5hL1jT6uY4sB2qZ8eX0cW9gH4=

# GitHub OAuth Credentials
GITHUB_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0

# Admin Email Whitelist
ADMIN_EMAILS=your-email@example.com,admin@hablas.co
```

---

## Step 3: Verify Configuration

### Start Development Server

```bash
npm run dev
```

You should see:
```
✓ Ready in 2.3s
○ Local:        http://localhost:3000
○ Network:      http://192.168.1.x:3000
```

### Test Authentication Flow

1. **Navigate to Admin Panel**
   ```
   http://localhost:3000/admin
   ```

2. **Expected Behavior**:
   - Should redirect to `/admin/login`
   - See "Iniciar sesión con GitHub" button
   - Clean, simple login page

3. **Click "Iniciar sesión con GitHub"**
   - Redirects to GitHub OAuth page
   - Shows app name and permissions requested
   - Click "Authorize" button

4. **After Authorization**:
   - Redirects back to `http://localhost:3000/admin`
   - If your email is in `ADMIN_EMAILS`: ✅ Access granted
   - If your email is NOT in whitelist: ❌ "Acceso denegado" error

### Test Access Control

**Test 1: Authorized Access**
- Use GitHub account with email in `ADMIN_EMAILS`
- Should see admin dashboard

**Test 2: Unauthorized Access**
- Log out
- Sign in with different GitHub account (not in whitelist)
- Should see "Acceso denegado" message
- Check server console: Should log denial with email address

**Test 3: Logout**
- Click logout button (if implemented)
- Should redirect to login page
- Trying to access `/admin` should redirect to login again

---

## Step 4: Troubleshooting

### Common Issues

#### 1. Callback URL Mismatch

**Error**: "The redirect_uri MUST match the registered callback URL for this application."

**Solutions**:
- Check GitHub OAuth app settings
- Ensure callback URL is EXACTLY: `http://localhost:3000/api/auth/callback/github`
- No trailing slash
- Check for `http://` vs `https://`
- Verify port number matches (3000)

#### 2. Environment Variables Not Loaded

**Error**: "NEXTAUTH_URL is not defined"

**Solutions**:
- Ensure `.env.local` exists in project root
- Restart dev server after creating `.env.local`
- Check file is named exactly `.env.local` (not `.env`, not `.env.local.txt`)
- Verify no syntax errors in `.env.local`

#### 3. Email Not in Whitelist

**Error**: "Acceso denegado" after successful GitHub OAuth

**Solutions**:
- Check `ADMIN_EMAILS` in `.env.local`
- Ensure your GitHub email is listed
- Use comma separation (no spaces): `email1@example.com,email2@example.com`
- Verify GitHub account email is verified
- Check server logs for the email being used

#### 4. Session Not Persisting

**Error**: Logged in, but page reload requires login again

**Solutions**:
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies for localhost
- Check browser console for errors
- Verify NextAuth middleware is working

#### 5. "Access Denied" from GitHub

**Error**: GitHub OAuth page shows "Access Denied"

**Solutions**:
- Check GitHub OAuth app is not suspended
- Verify GitHub account has access to the app
- Check GitHub account email is verified
- Try revoking app authorization and re-authorizing

---

## Step 5: Security Best Practices

### Local Development

✅ **DO**:
- Use `.env.local` for secrets (never committed to git)
- Use separate OAuth apps for dev/production
- Keep `NEXTAUTH_SECRET` secure and random
- Limit `ADMIN_EMAILS` to necessary people
- Regularly rotate secrets

❌ **DON'T**:
- Commit `.env.local` to git
- Share OAuth secrets publicly
- Use production credentials locally
- Hardcode secrets in source code
- Use weak/simple secrets

### Environment Variables Checklist

- [ ] `.env.local` exists in project root
- [ ] `.env.local` is in `.gitignore`
- [ ] `NEXTAUTH_URL` matches your localhost URL
- [ ] `NEXTAUTH_SECRET` is random (32+ characters)
- [ ] `GITHUB_ID` from OAuth app
- [ ] `GITHUB_SECRET` from OAuth app (kept secret!)
- [ ] `ADMIN_EMAILS` contains valid email addresses
- [ ] Dev server restarted after creating `.env.local`

---

## Production Deployment

### Environment Variables (Vercel Example)

1. **Navigate to Project Settings**
   - Go to Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables

2. **Add Variables**

   For **Production** environment:
   ```
   NEXTAUTH_URL=https://hablas.co
   NEXTAUTH_SECRET=<generate-new-secret-different-from-dev>
   GITHUB_ID=<production-oauth-client-id>
   GITHUB_SECRET=<production-oauth-client-secret>
   ADMIN_EMAILS=admin@hablas.co,your-email@example.com
   ```

3. **Redeploy**
   - Trigger new deployment
   - Environment variables are encrypted at rest
   - Not visible in build logs

### Production OAuth App

**Critical**: Use separate GitHub OAuth app with production URLs:
```
Homepage URL: https://hablas.co
Callback URL: https://hablas.co/api/auth/callback/github
```

---

## Testing Checklist

### Local Development

- [ ] Created GitHub OAuth app (development)
- [ ] Created `.env.local` with all variables
- [ ] Generated secure `NEXTAUTH_SECRET`
- [ ] Added your email to `ADMIN_EMAILS`
- [ ] Started dev server (`npm run dev`)
- [ ] Navigated to http://localhost:3000/admin
- [ ] Redirected to login page
- [ ] Clicked "Sign in with GitHub"
- [ ] Authorized app on GitHub
- [ ] Redirected back to admin panel
- [ ] Access granted (or denied if not in whitelist)
- [ ] Tested logout
- [ ] Tested unauthorized access (different account)

### Production (when deployed)

- [ ] Created separate GitHub OAuth app (production)
- [ ] Set environment variables on hosting platform
- [ ] Generated new `NEXTAUTH_SECRET` (different from dev)
- [ ] Updated production `ADMIN_EMAILS`
- [ ] Deployed application
- [ ] Tested login at https://hablas.co/admin
- [ ] Verified OAuth callback works
- [ ] Tested access control
- [ ] Verified SSL/HTTPS working
- [ ] Checked error handling

---

## Reference

### File Structure
```
hablas/
├── .env.local                          # Your local secrets (not in git)
├── .env.example                        # Template (in git)
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts            # NextAuth configuration
│   └── admin/
│       ├── page.tsx                    # Admin dashboard
│       └── login/
│           └── page.tsx                # Login page
├── middleware.ts                       # Route protection
├── lib/
│   ├── auth.ts                        # Server-side auth utilities
│   └── auth-client.ts                 # Client-side auth hooks
└── docs/
    └── ADMIN_AUTH_SETUP.md           # Complete setup documentation
```

### Environment Variables Reference

| Variable | Example | Required | Description |
|----------|---------|----------|-------------|
| `NEXTAUTH_URL` | `http://localhost:3000` | Yes | Base URL for NextAuth |
| `NEXTAUTH_SECRET` | `<random-32-char-string>` | Yes | Encryption secret for sessions |
| `GITHUB_ID` | `Iv1.a1b2c3d4e5f6g7h8` | Yes | GitHub OAuth Client ID |
| `GITHUB_SECRET` | `<oauth-client-secret>` | Yes | GitHub OAuth Client Secret |
| `ADMIN_EMAILS` | `admin@example.com` | Yes | Comma-separated list of admin emails |

---

## Next Steps

1. ✅ **Complete this guide** - Set up GitHub OAuth locally
2. ⏭️ **Test authentication** - Verify login/logout works
3. ⏭️ **Read security audit** - Understand the static export issue
4. ⏭️ **Review migration plan** - Consider removing admin panel vs deploying to Vercel
5. ⏭️ **Make decision** - Choose deployment strategy

---

## Additional Resources

- **NextAuth.js Documentation**: https://next-auth.js.org/
- **GitHub OAuth Apps**: https://docs.github.com/en/developers/apps/building-oauth-apps
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Security Best Practices**: https://next-auth.js.org/configuration/options#security

---

**Last Updated**: November 1, 2025
**Status**: Reference documentation (admin panel removal recommended)
**See Also**: `docs/STATIC_EXPORT_MIGRATION_PLAN.md` for deployment decision
