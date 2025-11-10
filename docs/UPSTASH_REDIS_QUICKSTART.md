# Upstash Redis Quickstart Guide
**Project**: Hablas API Rate Limiting
**Last Updated**: November 1, 2025

---

## Overview

This guide shows you how to set up Upstash Redis for distributed API rate limiting. Upstash provides a serverless Redis database with a generous free tier, perfect for protecting your API endpoints from abuse.

**Time Required**: 10-15 minutes
**Prerequisites**: Email address (for Upstash account)
**Cost**: FREE (up to 10,000 commands/day)

> **💡 TIP**: The rate limiting implementation works **without Redis**! It automatically falls back to in-memory rate limiting for development. Redis is optional but recommended for production.

---

## Why Upstash Redis?

### Benefits

✅ **Serverless**: No server management, scales automatically
✅ **Free Tier**: 10,000 commands/day (more than enough for this app)
✅ **Global**: Low-latency with edge regions
✅ **REST API**: Works with any platform (Vercel, Netlify, etc.)
✅ **Analytics**: Built-in request analytics
✅ **Zero Downtime**: 99.99% uptime SLA

### Perfect for Hablas

- **50 req/hour** rate limit for analytics = ~1,200 requests/day
- **Free tier** provides 10,000 commands/day
- **8x headroom** for traffic spikes
- **$0 cost** for foreseeable future

---

## Step 1: Create Upstash Account

1. **Visit Upstash Console**
   - Go to: https://console.upstash.com/
   - Click "Sign up" (or "Login" if you have an account)

2. **Sign Up Options**
   - GitHub (recommended - quick OAuth)
   - Google
   - Email

3. **Verify Email** (if using email signup)
   - Check your inbox
   - Click verification link
   - Return to console

---

## Step 2: Create Redis Database

### Create New Database

1. **Click "Create Database"**
   - Big green button on dashboard
   - Or navigate to "Redis" → "Databases" → "+ Create Database"

2. **Configure Database**

   ```
   Name: hablas-rate-limit
   Type: Regional (Free)
   Region: Choose closest to your users
     - For Colombian users: us-east-1 (Virginia) or us-west-1 (California)
     - For global: us-east-1 (best Vercel integration)
   ```

   **Eviction**: LRU (default) - removes least recently used keys when full

3. **Create Database**
   - Click "Create" button
   - Database provisions in ~30 seconds

### Get Your Credentials

After creation, you'll see the database details page:

1. **REST API Section**
   - Find "UPSTASH_REDIS_REST_URL"
   - Copy the URL (e.g., `https://us1-example-12345.upstash.io`)

2. **REST Token**
   - Find "UPSTASH_REDIS_REST_TOKEN"
   - Click "Copy" button
   - This is your authentication token

**Important**: Keep these credentials secure! Don't commit to git.

---

## Step 3: Configure Environment Variables

### Local Development

Add to `.env.local`:

```env
# Upstash Redis (optional for local development)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**Without Redis (Development)**:
```bash
# Simply don't set these variables
# Rate limiting automatically falls back to in-memory mode
```

You'll see this in console:
```
⚠️ Upstash Redis not configured. Using in-memory rate limiting.
   For production, add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env
```

### Production Deployment

**Vercel**:
1. Go to Project Settings → Environment Variables
2. Add for **Production** environment:
   ```
   UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   ```

**Netlify**:
1. Go to Site Settings → Build & Deploy → Environment Variables
2. Add both variables

**Other Platforms**:
- Most platforms support environment variables
- Consult your platform's documentation

---

## Step 4: Test Rate Limiting

### Start Development Server

```bash
npm run dev
```

### Test API Endpoint

**Test 1: Basic Request**
```bash
curl http://localhost:3000/api/analytics
```

**Expected Response**:
```json
{
  "message": "Analytics endpoint",
  "timestamp": "2025-11-01T12:00:00.000Z"
}
```

**Check Headers**:
```bash
curl -I http://localhost:3000/api/analytics
```

**Expected Headers**:
```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 49
X-RateLimit-Reset: 1730469600000
```

### Test 2: Rate Limit Exceeded

Use the automated test script:

```bash
npm run test:rate-limit
```

**Expected Output**:
```
🧪 Testing Rate Limiting...

✅ Request 1/55: 200 OK (49 remaining)
✅ Request 2/55: 200 OK (48 remaining)
...
✅ Request 50/55: 200 OK (0 remaining)
❌ Request 51/55: 429 Too Many Requests
❌ Request 52/55: 429 Too Many Requests
...

📊 Summary:
   Total Requests: 55
   Successful: 50
   Rate Limited: 5
   ✅ Rate limiting working correctly!
```

### Test 3: Health Check

```bash
curl http://localhost:3000/api/health
```

**With Redis**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-01T12:00:00.000Z",
  "redis": {
    "connected": true,
    "provider": "upstash"
  },
  "rateLimiting": {
    "enabled": true,
    "provider": "redis"
  }
}
```

**Without Redis** (in-memory fallback):
```json
{
  "status": "ok",
  "timestamp": "2025-11-01T12:00:00.000Z",
  "redis": {
    "connected": false,
    "provider": "none"
  },
  "rateLimiting": {
    "enabled": true,
    "provider": "in-memory"
  }
}
```

---

## Step 5: Monitor Usage

### Upstash Dashboard

1. **Navigate to Your Database**
   - Upstash Console → Databases → hablas-rate-limit

2. **Metrics Tab**
   - **Total Commands**: Number of Redis operations
   - **Daily Commands**: Commands in last 24 hours
   - **Storage**: Data stored in database
   - **Connections**: Active connections

3. **Data Browser**
   - See actual rate limit keys
   - Format: `rate-limit:ip:192.168.1.1:analytics`
   - Values: Request counts

### Usage Patterns

**Typical Usage**:
```
Analytics endpoint: 50 req/hour/IP
Average IPs: 10-50/day
Commands/day: ~1,000-5,000
Free tier limit: 10,000 commands/day
Headroom: 2-10x
```

**Monitoring Alerts**:
- Set up alerts at 80% of free tier (8,000 commands/day)
- Upstash sends email warnings
- Consider upgrading if consistently hitting limits

---

## Free Tier Limits

### What's Included

| Feature | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Commands** | 10,000/day | Unlimited |
| **Storage** | 256 MB | Unlimited |
| **Databases** | 1 | Unlimited |
| **Regions** | 1 (Regional) | Global + Edge |
| **TLS** | ✅ Included | ✅ Included |
| **Persistence** | ✅ Included | ✅ Included |
| **Analytics** | ✅ Included | ✅ Enhanced |
| **Support** | Community | Priority |

### Upgrade Triggers

Consider upgrading to **Pay As You Go** ($0.2 per 100K commands) if:
- [ ] Exceeding 10,000 commands/day regularly
- [ ] Need multiple databases
- [ ] Want global replication
- [ ] Need edge regions for lower latency

**Estimated Costs** (if upgrading):
- 50,000 commands/day = ~$3/month
- 100,000 commands/day = ~$6/month
- Still very affordable!

---

## Troubleshooting

### Issue 1: Connection Errors

**Error**: "Failed to connect to Upstash Redis"

**Solutions**:
- [ ] Verify `UPSTASH_REDIS_REST_URL` is correct
- [ ] Verify `UPSTASH_REDIS_REST_TOKEN` is correct
- [ ] Check database is in "Ready" state (not "Suspended")
- [ ] Ensure no typos in environment variables
- [ ] Restart dev server after adding variables

**Fallback**: App automatically uses in-memory rate limiting if Redis fails

### Issue 2: Rate Limits Not Working

**Error**: Can make unlimited requests

**Solutions**:
- [ ] Check rate limit configuration in `lib/rate-limit.ts`
- [ ] Verify middleware is applied to endpoint
- [ ] Check browser isn't caching responses
- [ ] Test with different IP (VPN or mobile)
- [ ] Check console logs for errors

### Issue 3: Database Suspended

**Error**: "Database is suspended"

**Cause**: Exceeded free tier limits or inactive for 30+ days

**Solutions**:
- [ ] Check usage in Upstash dashboard
- [ ] Upgrade to paid tier if needed
- [ ] Reactivate database (if inactive)
- [ ] Contact Upstash support

### Issue 4: Environment Variables Not Loading

**Error**: Rate limiting uses in-memory despite Redis configured

**Solutions**:
- [ ] Ensure variables are in `.env.local` (not `.env`)
- [ ] Restart dev server
- [ ] Check for typos in variable names
- [ ] Verify no extra spaces in values
- [ ] Check `.env.local` is in project root

---

## Security Best Practices

### Credentials

✅ **DO**:
- Store credentials in environment variables
- Use different databases for dev/production
- Rotate tokens periodically
- Enable TLS (included by default)
- Use read-only tokens where possible

❌ **DON'T**:
- Hardcode credentials in source code
- Commit `.env.local` to git
- Share tokens publicly
- Use production tokens in development
- Expose tokens in client-side code

### IP Whitelisting (Optional)

For extra security:
1. Upstash Console → Database Settings
2. IP Whitelist → Add your server IPs
3. Blocks access from unlisted IPs
4. Useful for production databases

### Rate Limit Configuration

Current rates (in `lib/rate-limit.ts`):
```typescript
ANALYTICS: {
  requests: 50,
  window: '1 h',  // 50 requests per hour
}

PUBLIC_API: {
  requests: 100,
  window: '1 h',  // 100 requests per hour
}

AUTH: {
  requests: 10,
  window: '15 m', // 10 requests per 15 minutes
}
```

Adjust based on your needs!

---

## Alternative: In-Memory Rate Limiting

### When to Use In-Memory

✅ **Good for**:
- Local development
- Low-traffic sites
- Single-server deployments
- Testing

❌ **Bad for**:
- Multi-server deployments (Vercel serverless)
- High-traffic sites
- Persistent rate limiting across deploys

### How It Works

Without Redis, rate limiting uses JavaScript `Map()`:
- Stored in memory
- **Resets on server restart**
- **Not shared between serverless functions**
- Fast, but not persistent

**Production Implications**:
- Each Vercel serverless function has independent memory
- User might hit different functions, bypassing limits
- Limits reset on cold starts

**Recommendation**: Use Redis for production, in-memory for development

---

## Advanced Configuration

### Multiple Rate Limit Tiers

Edit `lib/rate-limit.ts` to add custom tiers:

```typescript
export const RATE_LIMIT_CONFIGS = {
  FREE_USER: {
    requests: 10,
    window: '1 h',
  },
  PREMIUM_USER: {
    requests: 100,
    window: '1 h',
  },
  ADMIN: {
    requests: 1000,
    window: '1 h',
  },
}
```

### Custom Windows

Supported time windows:
- `'10 s'` - 10 seconds
- `'1 m'` - 1 minute
- `'15 m'` - 15 minutes
- `'1 h'` - 1 hour
- `'1 d'` - 1 day

### Analytics Integration

Upstash provides analytics:
```typescript
await ratelimit.limit(identifier, {
  analytics: true, // Enable request tracking
})
```

View in Upstash dashboard under Analytics tab.

---

## Checklist

### Setup

- [ ] Created Upstash account
- [ ] Created Redis database (hablas-rate-limit)
- [ ] Copied REST URL
- [ ] Copied REST Token
- [ ] Added to `.env.local` (optional for dev)
- [ ] Tested in-memory fallback
- [ ] Tested with Redis connection

### Testing

- [ ] Ran `npm run test:rate-limit`
- [ ] Tested `/api/analytics` endpoint
- [ ] Checked rate limit headers
- [ ] Verified 429 response after limit
- [ ] Tested `/api/health` endpoint
- [ ] Checked Upstash dashboard metrics

### Production

- [ ] Created separate production database (recommended)
- [ ] Set environment variables on hosting platform
- [ ] Deployed application
- [ ] Tested rate limiting in production
- [ ] Set up usage alerts
- [ ] Monitored first week of usage

---

## Cost Estimation

### Current Implementation

- **Analytics endpoint**: 50 req/hour/IP
- **Health endpoint**: 200 req/hour/IP
- **Estimated daily IPs**: 10-50 users
- **Commands/day**: ~1,000-5,000
- **Cost**: **$0/month** (within free tier)

### Scaling Scenarios

**Scenario 1: 100 daily active users**
- Commands/day: ~10,000
- Still FREE!

**Scenario 2: 500 daily active users**
- Commands/day: ~50,000
- Cost: ~$3/month ($0.2 per 100K commands)

**Scenario 3: 1,000 daily active users**
- Commands/day: ~100,000
- Cost: ~$6/month

**Note**: These are generous estimates. Actual usage likely lower!

---

## References

- **Upstash Documentation**: https://docs.upstash.com/redis
- **REST API**: https://docs.upstash.com/redis/features/restapi
- **Pricing**: https://upstash.com/pricing
- **@upstash/ratelimit**: https://github.com/upstash/ratelimit

---

## Next Steps

1. ✅ **Complete this guide** - Set up Upstash Redis
2. ⏭️ **Test locally** - Verify rate limiting works
3. ⏭️ **Deploy to production** - Add environment variables
4. ⏭️ **Monitor usage** - Check Upstash dashboard weekly
5. ⏭️ **Optimize limits** - Adjust based on actual traffic

---

**Last Updated**: November 1, 2025
**Status**: OPTIONAL - Works without Redis (in-memory fallback)
**Recommendation**: Set up for production, skip for development
