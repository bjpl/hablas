# Redis Quick Start - 5 Minute Setup

Fast-track guide to get Redis working in production.

## 1. Create Upstash Account (2 minutes)

1. Go to **https://upstash.com**
2. Click "Sign Up" and use GitHub
3. Verify your account

## 2. Create Database (1 minute)

1. Click "Create Database"
2. Name: `hablas-production-rate-limit`
3. Region: Choose closest to your Vercel region
   - US East: `us-east-1`
   - Europe: `eu-west-1`
   - Asia: `ap-northeast-1`
4. Click "Create"

## 3. Get Connection URL (30 seconds)

From the database dashboard, copy the **connection URL**:

```
Format: redis://default:[password]@[endpoint]:6379

Example: redis://default:AZBjASQgYzk...@us1-informed-peacock-12345.upstash.io:6379
```

## 4. Configure Environment (1 minute)

### Local (.env.local)
```bash
REDIS_URL=redis://default:[your-password]@[your-endpoint]:6379
```

### Vercel Production
1. Open Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add variable:
   - **Name**: `REDIS_URL`
   - **Value**: `redis://default:[your-password]@[your-endpoint]:6379`
   - **Environment**: Production, Preview
3. Click "Save"

## 5. Deploy (30 seconds)

```bash
# Redeploy to pick up new env vars
vercel --prod
```

## 6. Verify (30 seconds)

```bash
# Test locally
npm run verify:redis

# Test production
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "redis": {
    "connected": true,
    "responseTime": 45,
    "mode": "redis"
  }
}
```

## Done!

Redis is now handling distributed rate limiting across all Vercel instances.

## What You Get

- **5 login attempts** per 15 minutes (distributed across all servers)
- **3 signup attempts** per hour
- **100 API requests** per 15 minutes
- **Automatic fallback** to in-memory if Redis fails
- **Zero configuration** needed in code (already integrated)

## Next Steps

- Monitor usage in Upstash dashboard
- Set up alerts for high usage
- Adjust rate limits in `lib/config/security.ts` if needed

## Troubleshooting

**Connection fails?**
- Check URL format: `redis://default:[password]@[endpoint]:6379`
- Verify database is active in Upstash
- Ensure env var is set in Vercel

**Rate limiting not working?**
```bash
# Check Redis health
curl https://your-app.vercel.app/api/health

# Check Vercel logs
vercel logs --prod
```

**Need help?**
See full guide: `/docs/deployment/redis-production-setup.md`
