# Custom Domain Setup: hablas.co

Complete guide to setting up hablas.co with GitHub Pages.

## ✅ Step 1: CNAME File (DONE)

The CNAME file has been created at `public/CNAME` and pushed to the repository.

---

## 🔧 Step 2: Configure GitHub Pages

1. Go to your GitHub repository: https://github.com/bjpl/hablas

2. Click **Settings** (top right)

3. In left sidebar, click **Pages** (under "Code and automation")

4. Under **Custom domain**:
   - Enter: `hablas.co`
   - Click **Save**

5. **Important:** Wait for DNS check (may take a few minutes)
   - GitHub will verify the domain
   - You'll see a message: "DNS check successful"

6. **Enable HTTPS** (after DNS check passes):
   - Check the box: ☑️ "Enforce HTTPS"
   - This may take 10-20 minutes to provision SSL certificate

**Screenshot locations:**
- Settings → Pages → Custom domain field
- Build and deployment should show: "Deploy from a branch: gh-pages"

---

## 🌐 Step 3: Configure Namecheap DNS

1. Go to Namecheap: https://www.namecheap.com/

2. Sign in to your account

3. Click **Domain List** (left sidebar)

4. Find **hablas.co** and click **Manage**

5. Go to **Advanced DNS** tab

6. **Delete** any existing A Records or CNAME Records for @ and www

7. **Add these DNS records:**

### Record 1-4: A Records (for apex domain hablas.co)
```
Type: A Record
Host: @
Value: 185.199.108.153
TTL: Automatic

Type: A Record
Host: @
Value: 185.199.109.153
TTL: Automatic

Type: A Record
Host: @
Value: 185.199.110.153
TTL: Automatic

Type: A Record
Host: @
Value: 185.199.111.153
TTL: Automatic
```

### Record 5: CNAME (for www subdomain)
```
Type: CNAME Record
Host: www
Value: bjpl.github.io
TTL: Automatic
```

**Visual Guide:**
```
┌──────────┬──────┬────────────────────┬──────────┐
│   Type   │ Host │       Value        │   TTL    │
├──────────┼──────┼────────────────────┼──────────┤
│ A Record │  @   │ 185.199.108.153    │ Automatic│
│ A Record │  @   │ 185.199.109.153    │ Automatic│
│ A Record │  @   │ 185.199.110.153    │ Automatic│
│ A Record │  @   │ 185.199.111.153    │ Automatic│
│ CNAME    │ www  │ bjpl.github.io     │ Automatic│
└──────────┴──────┴────────────────────┴──────────┘
```

8. Click **Save All Changes** (green button)

---

## ⏱️ Step 4: Wait for DNS Propagation

**DNS changes take time to propagate:**
- **Minimum:** 10-30 minutes
- **Maximum:** 48 hours (usually much faster)
- **Average:** 1-2 hours

---

## ✅ Step 5: Verify Setup

### Check DNS Propagation:

```bash
# Check A records
nslookup hablas.co

# Check CNAME for www
nslookup www.hablas.co

# Or use online tool:
# https://dnschecker.org (enter hablas.co)
```

**Expected Results:**
```
hablas.co → 185.199.108.153 (or .109, .110, .111)
www.hablas.co → bjpl.github.io
```

### Test in Browser:

1. http://hablas.co → Should redirect to https://hablas.co
2. http://www.hablas.co → Should redirect to https://hablas.co
3. https://hablas.co → Should show your site

---

## 🔒 HTTPS / SSL Certificate

GitHub Pages provides **free SSL certificates** automatically:
- Provisioned via Let's Encrypt
- Auto-renews
- Takes 10-20 minutes after DNS verification
- Enable "Enforce HTTPS" checkbox in GitHub Pages settings

---

## 🐛 Troubleshooting

### Issue: "Domain's DNS record could not be retrieved"
**Fix:** DNS not propagated yet. Wait 30-60 minutes and try again.

### Issue: "CNAME already taken"
**Fix:** Another repository is using this domain. Remove it from the other repo first.

### Issue: "www.hablas.co" doesn't work
**Fix:** Make sure CNAME record points to `bjpl.github.io` (NOT `bjpl.github.io/hablas`)

### Issue: Mixed content warnings
**Fix:** Update next.config.js after domain is working - may need to adjust basePath.

---

## 📝 Post-Setup: Update Configuration

**After domain works**, you may need to update:

```javascript
// next.config.js - Remove basePath for custom domain
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // basePath: '/hablas',  // REMOVE this line
  // assetPrefix: '/hablas',  // REMOVE this line
  images: {
    unoptimized: true,
  },
}
```

**Then rebuild:**
```bash
npm run build
# Commit and push changes
git add next.config.js out/
git commit -m "fix: Remove basePath for custom domain"
git push
```

---

## 📞 Support

If you encounter issues:
1. Check GitHub Pages status: https://www.githubstatus.com/
2. Verify DNS: https://dnschecker.org
3. GitHub Pages docs: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

---

## ✅ Checklist

- [x] CNAME file created and pushed
- [ ] GitHub Pages custom domain configured
- [ ] Namecheap DNS A records added (4 records)
- [ ] Namecheap DNS CNAME record added (www)
- [ ] DNS propagation complete (check with nslookup)
- [ ] GitHub DNS check passes
- [ ] HTTPS enabled in GitHub Pages
- [ ] Site accessible at https://hablas.co
- [ ] Site accessible at https://www.hablas.co
- [ ] Update next.config.js (remove basePath)
- [ ] Rebuild and deploy final version

---

**Estimated Total Time:** 1-2 hours (mostly waiting for DNS)
