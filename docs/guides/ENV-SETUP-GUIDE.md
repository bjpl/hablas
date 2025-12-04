# Environment Variables Setup Guide

## 🔒 Security First

**NEVER commit API keys to git!** All `.env` and `.env.local` files are in `.gitignore` to prevent accidental commits.

## 📋 Quick Setup

### 1. Create Your Local Environment File

```bash
# Copy the example file
cp .env.example .env.local
```

### 2. Add Your Unsplash API Key

Open `.env.local` and replace the placeholder:

```bash
# Before (placeholder)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# After (your actual key)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=AbCdEf123456789_YourActualKey
```

## 🔑 Getting API Keys

### Unsplash API Key

1. Go to [https://unsplash.com/developers](https://unsplash.com/developers)
2. Click "Register as a developer"
3. Create a new application
4. Copy the **Access Key** (not Secret Key for public apps)
5. Paste it in `.env.local`

### Other API Keys (if needed)

**Anthropic (for AI features):**
- Get from: [https://console.anthropic.com/](https://console.anthropic.com/)
- Add to: `ANTHROPIC_API_KEY`

**Supabase (optional):**
- Get from: [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Add to: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🎯 Environment Variable Naming

### Client-Side (Browser) Variables
Use `NEXT_PUBLIC_` prefix when:
- Variable is needed in React components
- Variable is used in client-side JavaScript
- Variable is safe to expose to users

```bash
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=abc123
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```

### Server-Side Only Variables
No prefix when:
- Variable contains sensitive data
- Variable is only used in API routes
- Variable should never be exposed to browsers

```bash
ANTHROPIC_API_KEY=sk-ant-xxx
DATABASE_PASSWORD=secret123
```

## 📁 File Structure

```
project/
├── .env.example          # Template (committed to git)
├── .env.local           # Your actual keys (NOT in git)
├── .env                 # Legacy (NOT in git)
└── .gitignore          # Ensures .env* files are ignored
```

## ✅ Verification

After adding your keys, restart the dev server:

```bash
# Stop the server (Ctrl+C)
npm run dev

# Your keys are now loaded
```

## 🧪 Testing Your Setup

Check if environment variables are loaded:

```javascript
// In a React component (client-side)
console.log('Unsplash key exists:', !!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY)

// In an API route (server-side)
console.log('Anthropic key exists:', !!process.env.ANTHROPIC_API_KEY)
```

## ⚠️ Common Issues

### Issue: "Environment variable is undefined"

**Cause**: Variable name doesn't match or missing `NEXT_PUBLIC_` prefix

**Solution**:
1. Check spelling matches exactly
2. Restart dev server after adding variables
3. Use `NEXT_PUBLIC_` prefix for client-side access

### Issue: "API key not working"

**Cause**: Wrong key or key has quotes around it

**Solution**:
```bash
# ❌ Wrong - has quotes
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY="abc123"

# ✅ Correct - no quotes
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=abc123
```

### Issue: "Variable works locally but not in production"

**Cause**: Environment variables not set in deployment platform

**Solution**:
- **GitHub Pages**: Add to repository secrets (Settings → Secrets)
- **Vercel**: Add in project settings → Environment Variables
- **Netlify**: Add in Site settings → Build & deploy → Environment

## 🚀 Deployment

### GitHub Actions (GitHub Pages)

Add secrets in repository settings:

```
Repository → Settings → Secrets and variables → Actions → New repository secret
```

Add each variable:
- Name: `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`
- Value: Your actual key

Update `.github/workflows/deploy.yml` to use secrets:

```yaml
- name: Build Next.js Static Site
  run: npm run build
  env:
    NEXT_PUBLIC_UNSPLASH_ACCESS_KEY: ${{ secrets.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY }}
```

### Important Security Notes

1. **Client-side variables** (`NEXT_PUBLIC_*`) are embedded in JavaScript and visible to users
2. **Use demo/public keys** for client-side APIs when possible
3. **Never expose** server-side keys (`ANTHROPIC_API_KEY`, database passwords, etc.)
4. **Rotate keys** if accidentally committed to git

## 📚 Next.js Environment Variables Documentation

For more details: [https://nextjs.org/docs/basic-features/environment-variables](https://nextjs.org/docs/basic-features/environment-variables)

## 🔄 Quick Reference

| Where Used | Prefix | Example | Exposed to Browser? |
|------------|--------|---------|---------------------|
| Client-side components | `NEXT_PUBLIC_` | `NEXT_PUBLIC_API_URL` | ✅ Yes |
| API routes | None | `DATABASE_URL` | ❌ No |
| Server components | None | `SECRET_KEY` | ❌ No |
| Build time | Any | Any variable | Depends on usage |

---

**Remember**: `.env.local` is in `.gitignore` - it's safe to add your real API keys there!
