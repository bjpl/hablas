# Deployment Instructions for hablas.co

## Issues Fixed

### 1. SSL Certificate Error
**Problem**: `NET::ERR_CERT_COMMON_NAME_INVALID` - Certificate mismatch
**Solution**: GitHub Pages needs time to provision SSL certificate for custom domain (24-48 hours)

### 2. Missing Styles (Unstyled HTML)
**Problem**: CSS and assets not loading due to incorrect path configuration
**Solution**: Removed `basePath` and `assetPrefix` from `next.config.js`

### 3. Path Configuration
**Problem**: Next.js configured for subdirectory (`/hablas`) but using custom domain
**Solution**: Custom domains require root path configuration

## Manual Steps Required

### Step 1: Rebuild the Application
```bash
cd /mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas
npm run build
```

### Step 2: Verify Build Output
The `out/` directory should now have assets with correct paths:
- `out/index.html` - Should reference `/_next/` not `/hablas/_next/`
- `out/_next/static/` - CSS and JS files
- `out/CNAME` - Contains `hablas.co`

### Step 3: Commit and Push Changes
```bash
git add next.config.js
git commit -m "fix: Remove basePath for custom domain configuration"
git push origin main
```

### Step 4: Verify GitHub Pages Settings
1. Go to your GitHub repository
2. Navigate to **Settings** → **Pages**
3. Verify:
   - ✅ Source: Deploy from a branch
   - ✅ Branch: `main` / `out` folder (or root if deploying whole repo)
   - ✅ Custom domain: `hablas.co`
   - ✅ Enforce HTTPS: **Checked** (may be grayed out initially)

### Step 5: DNS Configuration (If Not Already Set)
In your domain registrar (Namecheap, GoDaddy, etc.):

**For Apex Domain (hablas.co):**
```
Type: A
Host: @
Value: 185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153
```

**For WWW Subdomain:**
```
Type: CNAME
Host: www
Value: <your-github-username>.github.io
```

### Step 6: Wait for SSL Certificate
After DNS is configured and GitHub Pages detects your custom domain:
- GitHub automatically provisions a Let's Encrypt SSL certificate
- This takes **10 minutes to 48 hours** depending on DNS propagation
- You'll see the "Not Secure" warning until the certificate is active

### Step 7: Verify Deployment
Once SSL is provisioned:
1. Visit `https://hablas.co` (should load with green padlock)
2. Check that styles are loading correctly
3. Verify all pages and resources work

## Troubleshooting

### If styles still don't load after rebuild:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check browser DevTools Console for 404 errors
3. Verify `out/_next/static/` files exist

### If SSL certificate doesn't provision:
1. Verify DNS records are correct (use `dig hablas.co` or online DNS checker)
2. In GitHub Pages settings, try:
   - Remove custom domain
   - Wait 5 minutes
   - Re-add custom domain `hablas.co`
3. Make sure HTTPS enforcement is enabled

### If site still shows raw HTML:
1. Check that `next.config.js` has NO `basePath` or `assetPrefix`
2. Rebuild: `npm run build`
3. Verify `out/index.html` references `/_next/` not `/hablas/_next/`

## Current Status

- ✅ Configuration fixed in `next.config.js`
- ⏳ Rebuild required (`npm run build`)
- ⏳ Push to GitHub required
- ⏳ SSL certificate provisioning (automatic, 10min-48hrs)

## Expected Timeline

- **Immediate**: After rebuild and push, HTML structure should be correct
- **10-60 minutes**: GitHub Pages rebuilds and deploys
- **10 minutes to 48 hours**: SSL certificate provisioned (usually within 1-2 hours)

## Notes

- Custom domains use root paths (`/`) not subdirectory paths (`/hablas`)
- The `basePath` configuration is ONLY for GitHub Pages subdirectory hosting
- DNS propagation can take up to 48 hours globally
- SSL certificate is automatic once DNS is verified
