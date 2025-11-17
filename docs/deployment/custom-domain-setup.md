# Custom Domain Setup Guide - hablas.co

## Overview

This guide covers the complete setup of the custom domain `hablas.co` for your Hablas application deployed on Vercel, including DNS configuration, SSL certificate setup, and domain verification.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Domain Acquisition](#domain-acquisition)
3. [Vercel Domain Configuration](#vercel-domain-configuration)
4. [DNS Configuration](#dns-configuration)
5. [SSL Certificate Setup](#ssl-certificate-setup)
6. [Domain Verification](#domain-verification)
7. [Subdomain Configuration](#subdomain-configuration)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Domain name `hablas.co` registered with a domain registrar
- Vercel account with Hablas project deployed
- Access to domain registrar's DNS management panel
- Email access for domain verification

## Domain Acquisition

If you haven't acquired `hablas.co` yet:

### Recommended Registrars

1. **Vercel Domains** (Recommended for simplicity)
   - Integrated with Vercel platform
   - Automatic DNS configuration
   - Simplified management

2. **Namecheap**
   - Competitive pricing
   - Easy DNS management
   - Good customer support

3. **Cloudflare Registrar**
   - At-cost pricing
   - Built-in CDN and security
   - Advanced DNS features

4. **Google Domains / Squarespace Domains**
   - Simple interface
   - Reliable service

### Check Availability

```bash
# Check if hablas.co is available
# Visit: https://domains.vercel.com or your preferred registrar
```

## Vercel Domain Configuration

### Step 1: Access Domain Settings

1. Navigate to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Hablas** project
3. Click on **Settings** tab
4. Select **Domains** from the sidebar

### Step 2: Add Custom Domain

1. In the **Domains** section, enter: `hablas.co`
2. Click **Add**
3. Vercel will provide DNS configuration instructions

### Step 3: Choose Configuration Method

Vercel offers two options:

#### Option A: Vercel Nameservers (Recommended)

**Advantages**:
- Automatic DNS management
- Instant SSL provisioning
- Simplified configuration
- Built-in DDoS protection

**Nameservers provided by Vercel**:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

#### Option B: External DNS (Advanced)

**Advantages**:
- Keep existing DNS provider
- More control over DNS records
- Use existing DNS features (email, etc.)

**Required DNS records**:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## DNS Configuration

### Using Vercel Nameservers (Recommended)

#### Step 1: Update Nameservers at Registrar

1. Log in to your domain registrar (e.g., Namecheap, GoDaddy)
2. Navigate to domain management for `hablas.co`
3. Find **Nameservers** or **DNS Settings**
4. Change to **Custom Nameservers**
5. Enter Vercel nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
6. Save changes

#### Step 2: Wait for Propagation

- DNS propagation typically takes 24-48 hours
- Can be faster (minutes to hours) depending on TTL
- Check status at: https://www.whatsmydns.net/

### Using External DNS Provider

#### Step 1: Configure A Record (Apex Domain)

```
Type: A
Name: @ (or blank/root)
Value: 76.76.21.21
TTL: 3600 (or automatic)
```

#### Step 2: Configure CNAME Record (www subdomain)

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or automatic)
```

#### Step 3: Configure Additional Subdomains (Optional)

```
# API subdomain
Type: CNAME
Name: api
Value: cname.vercel-dns.com

# Admin subdomain
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

### Example: Namecheap Configuration

1. Log in to Namecheap
2. Go to **Domain List** → Select `hablas.co`
3. Click **Manage** → **Advanced DNS** tab
4. Add the following records:

| Type  | Host | Value              | TTL       |
|-------|------|--------------------|-----------|
| A     | @    | 76.76.21.21        | Automatic |
| CNAME | www  | cname.vercel-dns.com | Automatic |

### Example: Cloudflare Configuration

1. Log in to Cloudflare
2. Select `hablas.co` domain
3. Go to **DNS** → **Records**
4. Add records:

| Type  | Name | Content            | Proxy Status | TTL  |
|-------|------|--------------------|--------------|------|
| A     | @    | 76.76.21.21        | Proxied      | Auto |
| CNAME | www  | cname.vercel-dns.com | Proxied      | Auto |

**Note**: If using Cloudflare proxy, ensure SSL/TLS mode is set to **Full** or **Full (strict)**

## SSL Certificate Setup

Vercel automatically provisions SSL certificates using Let's Encrypt.

### Automatic SSL (Default)

1. After DNS configuration, Vercel automatically:
   - Detects domain configuration
   - Requests SSL certificate from Let's Encrypt
   - Provisions certificate (usually within minutes)
   - Auto-renews before expiration

### Verify SSL Certificate

1. Visit: `https://hablas.co`
2. Click padlock icon in browser
3. Verify certificate details:
   - Issued to: `hablas.co`
   - Issued by: `Let's Encrypt`
   - Valid dates shown

### Force HTTPS Redirect

Ensure all HTTP traffic redirects to HTTPS:

1. In Vercel Dashboard → Project Settings → Domains
2. Verify **Redirect to HTTPS** is enabled (default)
3. This automatically redirects `http://hablas.co` → `https://hablas.co`

### Custom SSL Certificate (Advanced)

If you need a custom certificate:

1. Go to **Settings** → **Domains** → Select domain
2. Click **Certificate** → **Custom Certificate**
3. Upload:
   - Certificate file (`.crt` or `.pem`)
   - Private key (`.key`)
   - Certificate chain (if required)

**Note**: Custom certificates are typically only needed for specific compliance requirements

## Domain Verification

### Automatic Verification

When DNS is correctly configured, Vercel automatically verifies:

1. DNS records point to Vercel
2. Domain ownership confirmed
3. SSL certificate issued
4. Domain marked as "Valid" in dashboard

### Manual Verification Steps

If automatic verification fails:

#### Step 1: Check DNS Propagation

```bash
# Check A record
dig hablas.co A

# Expected output
hablas.co.  300  IN  A  76.76.21.21

# Check CNAME record
dig www.hablas.co CNAME

# Expected output
www.hablas.co.  300  IN  CNAME  cname.vercel-dns.com
```

#### Step 2: Verify in Vercel Dashboard

1. Go to **Settings** → **Domains**
2. Check domain status:
   - ✓ **Valid**: Domain configured correctly
   - ⚠ **Pending**: Awaiting DNS propagation
   - ✗ **Invalid Configuration**: DNS misconfigured

#### Step 3: TXT Record Verification (If Required)

Some registrars require TXT record verification:

```
Type: TXT
Name: _vercel
Value: [provided by Vercel]
TTL: 3600
```

### Verification Checklist

- [ ] DNS records configured correctly
- [ ] DNS propagation complete (check whatsmydns.net)
- [ ] Domain shows "Valid" in Vercel dashboard
- [ ] SSL certificate issued (HTTPS works)
- [ ] HTTP redirects to HTTPS
- [ ] www.hablas.co redirects to hablas.co (or vice versa)
- [ ] No certificate warnings in browser

## Subdomain Configuration

### Add www Subdomain

Already covered in DNS configuration. To redirect:

**Option 1**: Redirect www to apex (hablas.co)
- Default Vercel behavior
- `www.hablas.co` → `hablas.co`

**Option 2**: Redirect apex to www
```javascript
// next.config.mjs
async redirects() {
  return [
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'hablas.co' }],
      destination: 'https://www.hablas.co/:path*',
      permanent: true,
    },
  ];
}
```

### Add Custom Subdomains

For API, admin, or other subdomains:

1. In Vercel Dashboard → **Domains**
2. Add subdomain: `api.hablas.co`
3. Configure DNS:
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
```

4. Configure routing in application:
```javascript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');

  if (hostname?.startsWith('api.')) {
    return NextResponse.rewrite(new URL('/api', request.url));
  }

  if (hostname?.startsWith('admin.')) {
    return NextResponse.rewrite(new URL('/admin', request.url));
  }
}
```

### Wildcard Subdomain

To support `*.hablas.co`:

1. Add in Vercel: `*.hablas.co`
2. Configure DNS:
```
Type: A
Name: *
Value: 76.76.21.21
```

## Troubleshooting

### Issue 1: Domain Shows "Invalid Configuration"

**Causes**:
- DNS not propagated
- Incorrect DNS records
- TTL too high

**Solutions**:
```bash
# Verify DNS records
dig hablas.co A
dig www.hablas.co CNAME

# Check propagation globally
# Visit: https://www.whatsmydns.net/#A/hablas.co

# Wait for propagation (up to 48 hours)
# Reduce TTL if possible (3600 or less)
```

### Issue 2: SSL Certificate Not Provisioning

**Causes**:
- Domain not verified
- DNS misconfiguration
- CAA records blocking Let's Encrypt

**Solutions**:

1. Verify DNS configuration
2. Check CAA records:
```bash
dig hablas.co CAA

# Should allow Let's Encrypt
# If present, ensure it includes:
# 0 issue "letsencrypt.org"
```

3. Remove conflicting CAA records or add Let's Encrypt

### Issue 3: Redirect Loop

**Cause**: Cloudflare + Vercel SSL mismatch

**Solution**:
1. In Cloudflare → SSL/TLS settings
2. Change mode to **Full** or **Full (strict)**
3. Ensure **Always Use HTTPS** is enabled

### Issue 4: DNS Propagation Taking Too Long

**Solutions**:
```bash
# Flush local DNS cache

# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Windows
ipconfig /flushdns

# Linux
sudo systemd-resolve --flush-caches

# Use alternative DNS servers
# Google DNS: 8.8.8.8, 8.8.4.4
# Cloudflare DNS: 1.1.1.1, 1.0.0.1
```

### Issue 5: www Not Redirecting

**Solution**:
1. Ensure CNAME record for www exists
2. In Vercel Dashboard → Domains
3. Both `hablas.co` and `www.hablas.co` should be listed
4. One should show "Redirect" status

## Post-Setup Verification

### Final Checklist

- [ ] `hablas.co` loads correctly over HTTPS
- [ ] `www.hablas.co` redirects to `hablas.co` (or vice versa)
- [ ] SSL certificate valid and trusted
- [ ] No mixed content warnings
- [ ] All assets load from HTTPS
- [ ] Favicon displays correctly
- [ ] Meta tags include correct domain
- [ ] Sitemap references correct domain
- [ ] robots.txt accessible

### Update Application Configuration

Update any hardcoded URLs:

```typescript
// lib/config.ts
export const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://hablas.co',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://hablas.co/api',
};
```

### Update Environment Variables

```bash
# Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_SITE_URL=https://hablas.co
NEXT_PUBLIC_APP_URL=https://hablas.co
```

### Update External Services

Update domain in:
- Google Search Console
- Google Analytics
- Social media meta tags
- API CORS origins
- OAuth redirect URIs
- Webhook endpoints

## Performance Optimization

### Enable Edge Network

Vercel automatically uses edge network for:
- Static assets
- Image optimization
- API routes (with Edge Runtime)

### Configure Headers

```javascript
// next.config.mjs
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
      ],
    },
  ];
}
```

## Additional Resources

- [Vercel Custom Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [DNS Propagation Checker](https://www.whatsmydns.net/)
- [SSL Certificate Checker](https://www.ssllabs.com/ssltest/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## Support

For domain-related issues:
- [Vercel Support](https://vercel.com/support)
- [Domain Registrar Support](https://www.namecheap.com/support/)

For Hablas-specific issues:
- Check Vercel deployment logs
- Review DNS configuration
- Contact development team
