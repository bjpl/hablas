# Custom Domain Setup Guide for Vercel

This comprehensive guide walks you through adding a custom domain to your Hablas application deployed on Vercel, including DNS configuration, SSL setup, and troubleshooting.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding Domain Types](#understanding-domain-types)
3. [DNS Configuration Methods](#dns-configuration-methods)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [DNS Provider-Specific Instructions](#dns-provider-specific-instructions)
6. [SSL/HTTPS Configuration](#sslhttps-configuration)
7. [Domain Verification](#domain-verification)
8. [Troubleshooting](#troubleshooting)
9. [Setup Checklist](#setup-checklist)

## Prerequisites

Before starting, ensure you have:

- ✅ A Vercel account with your Hablas project deployed
- ✅ A registered domain name from a domain registrar
- ✅ Access to your domain's DNS management panel
- ✅ Owner or admin access to your Vercel project

---

## Understanding Domain Types

### Apex/Root Domain
- Format: `example.com`
- Also called: naked domain, root domain
- Configuration: A record or Vercel Nameservers
- Use case: Primary website address

### Subdomain
- Format: `www.example.com`, `app.example.com`, `docs.example.com`
- Configuration: CNAME record
- Use case: Separate sections or environments

### Wildcard Domain
- Format: `*.example.com`
- Configuration: Vercel Nameservers (required)
- Use case: Multi-tenant applications, dynamic subdomains
- **Note**: Requires Vercel nameservers for SSL certificate generation

---

## DNS Configuration Methods

Vercel supports three methods for custom domain configuration:

### Method 1: CNAME Record (Recommended for Subdomains)
**Best for**: `www.example.com`, `app.example.com`

**Pros**:
- Simple configuration
- Quick propagation
- Works with existing DNS provider

**Cons**:
- Cannot be used for apex domains with some providers

### Method 2: A Record (For Apex Domains)
**Best for**: `example.com`

**Pros**:
- Works with any DNS provider
- Standard DNS configuration

**Cons**:
- Requires IP address updates if Vercel changes infrastructure
- Manual configuration

### Method 3: Vercel Nameservers (Full DNS Management)
**Best for**: Advanced setups, wildcard domains

**Pros**:
- Automatic DNS management
- Required for wildcard SSL
- Simplified configuration

**Cons**:
- Transfers DNS control to Vercel
- Migration from existing DNS setup required

---

## Step-by-Step Setup

### Step 1: Add Domain in Vercel Dashboard

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Hablas project
3. Navigate to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your domain name:
   - For apex: `example.com`
   - For subdomain: `www.example.com` or `app.example.com`
   - For wildcard: `*.example.com`
6. Click **Add**

### Step 2: Choose Configuration Method

Vercel will display recommended DNS records based on your domain type:

**For Apex Domain (`example.com`)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**For Subdomain (`www.example.com`)**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For Wildcard (`*.example.com`)**:
```
Type: NS
Name: @
Value: ns1.vercel-dns.com
       ns2.vercel-dns.com
```

### Step 3: Configure DNS Records

Choose your DNS provider below for specific instructions.

---

## DNS Provider-Specific Instructions

### Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain
3. Navigate to **DNS** → **Records**
4. Click **Add record**

**For Apex Domain**:
```
Type: A
Name: @
IPv4 address: 76.76.21.21
Proxy status: DNS only (gray cloud)
TTL: Auto
```

**For Subdomain (www)**:
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: DNS only (gray cloud)
TTL: Auto
```

**Important**: Set proxy status to "DNS only" (gray cloud icon), not "Proxied" (orange cloud)

5. Click **Save**

**For Vercel Nameservers**:
1. Go to **DNS** → **Settings**
2. Click **Change** next to Nameservers
3. Select **Custom nameservers**
4. Add:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
5. Click **Continue**

---

### GoDaddy

1. Log in to [GoDaddy](https://www.godaddy.com/)
2. Go to **My Products** → **Domains**
3. Click on your domain → **Manage DNS**

**For Apex Domain**:
1. Find or add an A record
2. Configure:
   ```
   Type: A
   Host: @
   Points to: 76.76.21.21
   TTL: 600 seconds (10 minutes)
   ```
3. Click **Save**

**For Subdomain (www)**:
1. Find or add a CNAME record
2. Configure:
   ```
   Type: CNAME
   Host: www
   Points to: cname.vercel-dns.com
   TTL: 1 Hour
   ```
3. Click **Save**

**For Vercel Nameservers**:
1. Scroll to **Nameservers** section
2. Click **Change**
3. Select **Custom**
4. Enter:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
5. Click **Save**

---

### Namecheap

1. Log in to [Namecheap](https://www.namecheap.com/)
2. Go to **Domain List** → Click **Manage** next to your domain
3. Navigate to **Advanced DNS** tab

**For Apex Domain**:
1. Click **Add New Record**
2. Configure:
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21
   TTL: Automatic
   ```
3. Click **Save Changes** (green checkmark)

**For Subdomain (www)**:
1. Click **Add New Record**
2. Configure:
   ```
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```
3. Click **Save Changes**

**For Vercel Nameservers**:
1. Go to **Domain** tab
2. Under **Nameservers**, select **Custom DNS**
3. Enter:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
4. Click **Save**

---

### Google Domains (Now Squarespace Domains)

1. Log in to [Google Domains](https://domains.google.com/) or [Squarespace Domains](https://domains.squarespace.com/)
2. Select your domain
3. Click **DNS** in the left menu

**For Apex Domain**:
1. Scroll to **Custom resource records**
2. Add:
   ```
   Name: @
   Type: A
   TTL: 1H
   Data: 76.76.21.21
   ```
3. Click **Add**

**For Subdomain (www)**:
1. Scroll to **Custom resource records**
2. Add:
   ```
   Name: www
   Type: CNAME
   TTL: 1H
   Data: cname.vercel-dns.com
   ```
3. Click **Add**

**For Vercel Nameservers**:
1. Scroll to **Name servers**
2. Select **Use custom name servers**
3. Enter:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
4. Click **Save**

---

### Route 53 (AWS)

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **Route 53** → **Hosted zones**
3. Select your domain

**For Apex Domain**:
1. Click **Create record**
2. Configure:
   ```
   Record name: (leave empty for apex)
   Record type: A
   Value: 76.76.21.21
   TTL: 300
   Routing policy: Simple
   ```
3. Click **Create records**

**For Subdomain (www)**:
1. Click **Create record**
2. Configure:
   ```
   Record name: www
   Record type: CNAME
   Value: cname.vercel-dns.com
   TTL: 300
   Routing policy: Simple
   ```
3. Click **Create records**

**For Vercel Nameservers**:
1. Update NS records to point to:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

---

## SSL/HTTPS Configuration

Vercel automatically provisions and manages SSL/TLS certificates for all custom domains using Let's Encrypt.

### Automatic SSL Provisioning

1. **After DNS Configuration**: Once your DNS records are properly configured and verified, Vercel automatically issues an SSL certificate
2. **Certificate Type**: TLS/SSL certificates are provided via Let's Encrypt
3. **Automatic Renewal**: Vercel handles all certificate renewals automatically
4. **No Manual Configuration**: No additional steps required from you

### SSL Certificate Timeline

- **Standard domains**: SSL certificate issued within minutes to hours after DNS verification
- **Wildcard domains**: Requires Vercel nameservers; certificate issued after nameserver propagation
- **DNS propagation**: Can take 24-48 hours globally

### Monitoring SSL Status

Check SSL certificate status in Vercel Dashboard:

1. Go to **Settings** → **Domains**
2. Find your domain in the list
3. Check status indicators:
   - ✅ **Valid**: SSL certificate active
   - 🔄 **Pending**: Certificate being issued
   - ⚠️ **Error**: Configuration issue (see troubleshooting)

### HTTPS Enforcement

Vercel automatically redirects HTTP to HTTPS. No configuration needed.

### SSL Certificate Details

- **Encryption**: TLS 1.2 and TLS 1.3
- **Certificate Authority**: Let's Encrypt
- **Validity Period**: 90 days (auto-renewed)
- **Cipher Suites**: Modern, secure cipher suites only

---

## Domain Verification

### Standard Verification Process

For most domains, verification is automatic:

1. Add domain in Vercel Dashboard
2. Configure DNS records at your provider
3. Wait for DNS propagation (up to 48 hours)
4. Vercel automatically verifies and provisions SSL

### Manual Verification (Domain Already in Use)

If your domain is already registered on another Vercel account:

1. Vercel will display a TXT record requirement
2. Add the TXT record to your DNS:
   ```
   Type: TXT
   Name: _vercel
   Value: vc-domain-verify=<your-verification-code>
   TTL: 600
   ```
3. Return to Vercel Dashboard
4. Click **Verify** or **Refresh**
5. Once verified, configure your A/CNAME records

### Checking Verification Status

**Via Vercel Dashboard**:
- Go to **Settings** → **Domains**
- Status indicators:
  - ✅ **Active**: Domain verified and SSL active
  - 🔄 **Pending Configuration**: Awaiting DNS records
  - ⚠️ **Invalid Configuration**: DNS records incorrect
  - ⏳ **Verification Required**: TXT record needed

**Via Command Line** (for technical verification):

```bash
# Check DNS propagation
dig example.com A
dig www.example.com CNAME

# Check nameservers
dig example.com NS

# Check TXT verification record
dig _vercel.example.com TXT

# Check SSL certificate
openssl s_client -connect example.com:443 -servername example.com
```

**Via Online Tools**:
- [DNS Checker](https://dnschecker.org/) - Check global DNS propagation
- [What's My DNS](https://www.whatsmydns.net/) - Verify DNS records worldwide
- [SSL Labs](https://www.ssllabs.com/ssltest/) - Test SSL configuration

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Domain Shows "Invalid Configuration"

**Symptoms**:
- Red warning in Vercel Dashboard
- Domain not accessible
- "Invalid Configuration" status

**Solutions**:

1. **Verify DNS Records**:
   ```bash
   # Check if A record is correct
   dig example.com A
   # Should show: 76.76.21.21

   # Check if CNAME is correct
   dig www.example.com CNAME
   # Should show: cname.vercel-dns.com
   ```

2. **Wait for DNS Propagation**:
   - DNS changes can take 24-48 hours to propagate globally
   - Check propagation: [dnschecker.org](https://dnschecker.org/)

3. **Verify DNS Provider Settings**:
   - Cloudflare: Ensure proxy is "DNS only" (gray cloud)
   - Check for conflicting records (multiple A or CNAME records)
   - Ensure TTL is set appropriately (300-3600 seconds)

4. **Clear Browser Cache**:
   ```bash
   # Flush DNS cache (macOS)
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Flush DNS cache (Windows)
   ipconfig /flushdns

   # Flush DNS cache (Linux)
   sudo systemd-resolve --flush-caches
   ```

---

#### Issue 2: SSL Certificate Not Provisioning

**Symptoms**:
- "SSL certificate pending" for more than 24 hours
- HTTPS not working
- Browser shows "Not Secure"

**Solutions**:

1. **Check DNS Configuration**:
   - Ensure DNS records are correctly pointing to Vercel
   - For wildcard domains, verify nameservers are set to Vercel

2. **CAA Records**:
   ```bash
   # Check if CAA records are blocking Let's Encrypt
   dig example.com CAA
   ```
   - If CAA records exist, add:
     ```
     Type: CAA
     Name: @
     Value: 0 issue "letsencrypt.org"
     ```

3. **Remove Conflicting Records**:
   - Delete duplicate A or CNAME records
   - Remove old SSL certificates from CDN/proxy services

4. **For Cloudflare Users**:
   - Set SSL/TLS mode to "Full" or "Full (strict)"
   - Disable "Always Use HTTPS" temporarily during setup
   - Set proxy status to "DNS only" during verification

---

#### Issue 3: "Domain Already in Use" Error

**Symptoms**:
- Cannot add domain to Vercel project
- Error: "This domain is already being used by another Vercel deployment"

**Solutions**:

1. **Ownership Verification**:
   - Vercel will prompt you to add a TXT record
   - Add the verification TXT record to your DNS:
     ```
     Type: TXT
     Name: _vercel
     Value: vc-domain-verify=<provided-code>
     ```
   - Wait for DNS propagation (5-60 minutes)
   - Click "Verify" in Vercel Dashboard

2. **Remove from Other Projects**:
   - Check all your Vercel projects
   - Remove domain from any other projects
   - Contact Vercel support if domain is on another account

---

#### Issue 4: Subdomain (www) Not Redirecting to Apex

**Symptoms**:
- `example.com` works, but `www.example.com` doesn't
- Or vice versa

**Solutions**:

1. **Add Both Domains to Vercel**:
   - Add `example.com` as a domain
   - Add `www.example.com` as a separate domain
   - Vercel will automatically redirect between them

2. **Configure DNS for Both**:
   ```
   # Apex domain
   Type: A
   Name: @
   Value: 76.76.21.21

   # WWW subdomain
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Set Primary Domain**:
   - In Vercel Dashboard → Settings → Domains
   - Click ⋯ next to preferred domain
   - Select "Set as Primary Domain"
   - Other domains will redirect to primary

---

#### Issue 5: DNS Propagation Taking Too Long

**Symptoms**:
- DNS records configured but not resolving
- Different results in different locations
- Changes made hours/days ago still not working

**Solutions**:

1. **Check Global Propagation**:
   - Use [dnschecker.org](https://dnschecker.org/)
   - Use [whatsmydns.net](https://www.whatsmydns.net/)
   - Check multiple locations worldwide

2. **Reduce TTL Before Changes**:
   - Lower TTL to 300 seconds (5 minutes) before making changes
   - Wait for old TTL to expire
   - Make DNS changes
   - Increase TTL back to 3600 (1 hour) after verification

3. **Clear Local DNS Cache**:
   ```bash
   # macOS
   sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder

   # Windows (run as Administrator)
   ipconfig /flushdns

   # Linux
   sudo systemd-resolve --flush-caches
   ```

4. **Use Google Public DNS for Testing**:
   ```bash
   # Test using Google DNS
   nslookup example.com 8.8.8.8
   dig @8.8.8.8 example.com
   ```

---

#### Issue 6: Cloudflare Orange Cloud Issues

**Symptoms**:
- Using Cloudflare with proxied (orange cloud) status
- SSL errors or verification failures
- 522 or 525 errors

**Solutions**:

1. **Disable Proxy During Setup**:
   - In Cloudflare DNS settings
   - Click the orange cloud to make it gray (DNS only)
   - Wait for Vercel SSL to provision
   - Can re-enable after verification (but not recommended)

2. **Cloudflare SSL Settings**:
   - Go to SSL/TLS tab
   - Set to "Full" or "Full (strict)" mode
   - Never use "Flexible"

3. **For Production** (recommended):
   - Keep Cloudflare proxy disabled (gray cloud)
   - Let Vercel handle SSL and CDN
   - Vercel's edge network is sufficient for most use cases

---

#### Issue 7: Nameserver Update Not Working

**Symptoms**:
   - Changed nameservers to Vercel but domain not working
- Nameserver update rejected by registrar

**Solutions**:

1. **Wait for Propagation**:
   - Nameserver changes take 24-48 hours
   - Check status:
     ```bash
     dig example.com NS
     # Should show ns1.vercel-dns.com and ns2.vercel-dns.com
     ```

2. **Verify Nameserver Format**:
   - Correct format: `ns1.vercel-dns.com` (not IP addresses)
   - Some registrars require trailing dot: `ns1.vercel-dns.com.`

3. **Minimum Nameserver Requirements**:
   - Most registrars require at least 2 nameservers
   - Add both: `ns1.vercel-dns.com` and `ns2.vercel-dns.com`

4. **Transfer Lock**:
   - Some registrars lock domains for 60 days after transfer
   - Check with your registrar if changes are locked

---

#### Issue 8: Domain Verification Timeout

**Symptoms**:
- Verification stuck on "pending"
- Timeout errors in Vercel Dashboard

**Solutions**:

1. **Re-trigger Verification**:
   - In Vercel Dashboard → Settings → Domains
   - Click ⋯ next to the domain
   - Select "Refresh"
   - Or remove and re-add the domain

2. **Check DNS Records Are Active**:
   ```bash
   # Verify records are live
   dig example.com A +short
   dig www.example.com CNAME +short
   ```

3. **Contact Vercel Support**:
   - If verification stuck > 48 hours
   - Provide domain name and project ID
   - Support can manually verify or reset

---

### Getting Additional Help

**Vercel Support**:
- Dashboard: [vercel.com/support](https://vercel.com/support)
- Email: support@vercel.com
- Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

**DNS Provider Support**:
- Each provider has specific support channels
- Check your registrar's documentation
- Many have live chat or phone support

**Diagnostic Tools**:
```bash
# Complete domain diagnostic
dig example.com ANY
whois example.com
nslookup example.com
curl -I https://example.com
```

---

## Setup Checklist

Use this checklist to ensure your custom domain is properly configured:

### Pre-Setup

- [ ] Domain registered and owned by you
- [ ] Access to domain DNS management panel
- [ ] Vercel account created and logged in
- [ ] Hablas project deployed to Vercel
- [ ] Noted current nameservers (for backup)

### Domain Configuration

- [ ] Domain added in Vercel Dashboard (Settings → Domains)
- [ ] Configuration method chosen (A record, CNAME, or Nameservers)
- [ ] DNS records configured at domain provider
- [ ] DNS record values match Vercel requirements exactly
- [ ] Old/conflicting DNS records removed
- [ ] DNS propagation checked via online tools

### SSL/HTTPS Setup

- [ ] DNS verification completed
- [ ] SSL certificate status shows "Valid" in Vercel
- [ ] HTTPS accessible (https://your-domain.com loads)
- [ ] HTTP redirects to HTTPS automatically
- [ ] SSL certificate tested via [ssllabs.com](https://www.ssllabs.com/ssltest/)
- [ ] No browser security warnings

### Verification & Testing

- [ ] Domain resolves correctly from multiple locations
- [ ] Both apex and www configured (if applicable)
- [ ] Primary domain set in Vercel Dashboard
- [ ] Non-primary domains redirect to primary
- [ ] Email working (if using email with domain)
- [ ] All subdomains configured and working

### For Wildcard Domains (if applicable)

- [ ] Vercel nameservers configured
- [ ] Nameserver propagation verified
- [ ] Wildcard SSL certificate issued
- [ ] Test subdomain works (e.g., test.example.com)
- [ ] Dynamic subdomains functional

### Post-Setup

- [ ] Test domain in incognito/private browser
- [ ] Test on mobile devices
- [ ] Monitor for 24-48 hours for propagation issues
- [ ] Document DNS configuration for team
- [ ] Update environment variables if needed
- [ ] Update documentation with new domain
- [ ] Configure domain monitoring/alerts
- [ ] Set up proper TTL values (3600 recommended for production)

### Cloudflare Users Only

- [ ] Proxy status set to "DNS only" (gray cloud)
- [ ] SSL/TLS mode set to "Full" or "Full (strict)"
- [ ] Page Rules configured (if needed)
- [ ] Cache settings reviewed

### Optional but Recommended

- [ ] SPF record configured (for email)
- [ ] DMARC record configured (for email security)
- [ ] CAA record added for Let's Encrypt
- [ ] Analytics/monitoring configured
- [ ] Backup DNS configuration documented
- [ ] Team members granted access to DNS management

---

## Quick Reference Commands

### DNS Verification Commands

```bash
# Check A record
dig example.com A +short

# Check CNAME record
dig www.example.com CNAME +short

# Check nameservers
dig example.com NS +short

# Check TXT verification record
dig _vercel.example.com TXT +short

# Check global DNS propagation
for server in 8.8.8.8 1.1.1.1 208.67.222.222; do
  echo "Testing with $server:"
  dig @$server example.com A +short
done

# Check SSL certificate
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | openssl x509 -noout -dates
```

### Troubleshooting Commands

```bash
# Full DNS lookup
dig example.com ANY

# Trace DNS resolution
dig example.com +trace

# Check domain registration info
whois example.com

# Test HTTP/HTTPS redirect
curl -IL https://example.com

# Check SSL certificate details
curl -vI https://example.com 2>&1 | grep -i ssl
```

---

## Best Practices

1. **DNS Configuration**:
   - Use low TTL (300-600s) during initial setup
   - Increase TTL (3600s) once stable
   - Document all DNS changes
   - Keep backup of DNS records

2. **SSL/Security**:
   - Let Vercel handle SSL automatically
   - Don't manually manage certificates
   - Monitor SSL expiration (Vercel auto-renews)
   - Use HTTPS-only for production

3. **Multiple Environments**:
   - Use subdomains for staging: `staging.example.com`
   - Keep production apex domain: `example.com`
   - Use `www` as alias to apex, or vice versa

4. **Monitoring**:
   - Set up uptime monitoring (e.g., UptimeRobot)
   - Monitor SSL certificate status
   - Track DNS propagation changes
   - Set up alerts for domain expiration

5. **Team Collaboration**:
   - Document who has DNS access
   - Use registrar's team features
   - Keep credentials secure
   - Communicate DNS changes to team

---

## Additional Resources

- [Vercel Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [DNS Checker Tool](https://dnschecker.org/)
- [SSL Labs Testing](https://www.ssllabs.com/ssltest/)
- [What's My DNS](https://www.whatsmydns.net/)
- [Vercel Support](https://vercel.com/support)

---

**Last Updated**: November 2025
**Version**: 1.0
**Maintained by**: Hablas DevOps Team

For questions or issues with this guide, please contact your team lead or open an issue in the project repository.
