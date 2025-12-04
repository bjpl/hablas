# Quick Fix Guide - Deploy hablas.co

## ✅ What Was Fixed

1. **Removed incorrect path configuration** from `next.config.js`
   - Deleted `basePath: '/hablas'`
   - Deleted `assetPrefix: '/hablas'`
   - These settings are for subdirectory hosting, not custom domains

2. **Rebuilt the application** with correct configuration
   - All assets now use root paths (`/_next/...` instead of `/hablas/_next/...`)
   - Build completed successfully with 60 static pages

## 🚀 Next Steps - You Must Do These

### Step 1: Commit and Push (REQUIRED)
```bash
cd /mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas

git add next.config.js out/
git commit -m "fix: Configure for custom domain hablas.co (remove basePath)"
git push origin main
```

### Step 2: Wait for GitHub Pages Deployment (5-10 minutes)
- GitHub will automatically rebuild and deploy
- Check deployment status at: `https://github.com/YOUR_USERNAME/hablas/actions`

### Step 3: Wait for SSL Certificate (10 minutes - 48 hours, usually 1-2 hours)
GitHub Pages automatically provisions a free Let's Encrypt SSL certificate:
- You'll see "Not Secure" warning until certificate is active
- This is NORMAL and temporary
- Cannot be skipped or forced - it's automatic

### Step 4: Verify GitHub Pages Settings
Go to your repository → Settings → Pages and verify:
- ✅ Custom domain: `hablas.co`
- ✅ Enforce HTTPS: Checked (may be disabled until SSL is ready)
- ✅ Source: Correct branch and folder

## 🔍 How to Check if It's Working

### Test 1: Check Asset Paths
Visit your deployed site and open browser DevTools (F12):
- **Network tab**: CSS/JS files should load from `/_next/static/...`
- **Console**: Should have NO 404 errors
- **Wrong**: If files try to load from `/hablas/_next/...` → rebuild failed

### Test 2: SSL Certificate Status
In GitHub Pages settings:
- Green checkmark next to custom domain = SSL is ready
- Orange warning = SSL is being provisioned (wait)
- Red X = DNS configuration issue

### Test 3: DNS Propagation
Use online DNS checker (like `dnschecker.org`):
- Check `hablas.co` → Should point to GitHub Pages IPs
- Takes up to 48 hours to propagate globally

## ⚠️ Common Issues

### Issue: "Still showing raw HTML"
**Cause**: Browser cached old version
**Fix**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache completely
3. Try incognito/private window

### Issue: "404 errors for CSS/JS files"
**Cause**: GitHub Pages hasn't deployed new build yet
**Fix**: Wait 5-10 minutes after pushing, then check again

### Issue: "Not Secure" warning persists
**Cause**: SSL certificate still provisioning
**Fix**:
- Wait 1-24 hours
- If still not working after 48 hours:
  1. Go to GitHub Pages settings
  2. Remove custom domain
  3. Wait 5 minutes
  4. Re-add custom domain
  5. Wait for SSL to provision

### Issue: "DNS_PROBE_FINISHED_NXDOMAIN"
**Cause**: DNS not configured correctly
**Fix**: Verify DNS records with your domain registrar:
```
A Record:
  Host: @
  Values: 185.199.108.153
          185.199.109.153
          185.199.110.153
          185.199.111.153

CNAME Record:
  Host: www
  Value: YOUR_GITHUB_USERNAME.github.io
```

## 📋 Checklist

Before contacting support, verify:
- [ ] Pushed changes to GitHub
- [ ] GitHub Pages deployment succeeded
- [ ] Custom domain set in GitHub Pages settings
- [ ] DNS records configured correctly
- [ ] Waited at least 2 hours for SSL provisioning
- [ ] Cleared browser cache
- [ ] Tested in incognito/private window

## 🎯 Expected Timeline

- **Now**: Configuration fixed, rebuild complete
- **5-10 minutes**: After push, GitHub Pages deploys new build
- **10 minutes - 2 hours**: SSL certificate provisioned (most common)
- **Up to 48 hours**: DNS fully propagated globally, SSL worst-case

## 📞 What to Report if Still Broken

If issues persist after 48 hours:
1. Screenshot of GitHub Pages settings
2. Screenshot of browser error (DevTools Console)
3. DNS checker results for hablas.co
4. Browser and version
5. Whether you've pushed the changes

The fix is complete - the rest is automatic deployment and SSL provisioning.
