# Redis Production Setup Guide - Upstash

This guide walks you through setting up Redis for distributed rate limiting in production using Upstash (serverless Redis).

## Why Upstash?

- **Serverless**: Perfect for Vercel's serverless architecture
- **Free Tier**: 10,000 commands/day free forever
- **Global**: Low latency with edge locations
- **Pay-as-you-go**: No idle costs
- **TLS Support**: Secure connections by default
- **REST API**: Fallback option available

## Prerequisites

- Vercel account with project deployed
- GitHub account (for Upstash sign-up)

## Step 1: Create Upstash Account

1. Go to [https://upstash.com/](https://upstash.com/)
2. Click "Get Started" or "Sign Up"
3. Sign in with GitHub (recommended) or Email
4. Complete account verification

## Step 2: Create Redis Database

1. After login, you'll see the Upstash Console
2. Click "Create Database" button
3. Configure your database:

   **Database Configuration:**
   ```
   Name: hablas-production-rate-limit
   Type: Regional (for single region) or Global (for multi-region)
   Region: Choose closest to your Vercel deployment region
   - US East (N. Virginia) - us-east-1
   - Europe (Ireland) - eu-west-1
   - Asia Pacific (Tokyo) - ap-northeast-1

   TLS: Enabled (default)
   Eviction: No eviction (we use TTL on keys)
   ```

4. Click "Create"

## Step 3: Get Redis Connection URL

Once created, you'll see the database details page:

1. Look for the **REST API** section
2. Find **UPSTASH_REDIS_REST_URL** - this is your REDIS_URL

   ```
   Example format:
   https://us1-informed-peacock-12345.upstash.io
   ```

3. Also note the **UPSTASH_REDIS_REST_TOKEN** (you may need this for REST API usage)

4. For native Redis protocol (recommended), use the **Endpoint** URL:
   ```
   Format:
   redis://default:[password]@[endpoint]:6379

   Example:
   redis://default:AZBjASQgYzk...@us1-informed-peacock-12345.upstash.io:6379
   ```

## Step 4: Configure Environment Variables

### Local Development (.env.local)

Create or update `.env.local`:

```bash
# Redis Configuration (Upstash)
REDIS_URL=redis://default:[your-password]@[your-endpoint]:6379

# Optional: For monitoring/debugging
REDIS_PASSWORD=[your-password]
REDIS_HOST=[your-endpoint]
REDIS_PORT=6379
```

### Vercel Production

1. Open your Vercel project dashboard
2. Go to **Settings** > **Environment Variables**
3. Add the following:

   ```
   Name: REDIS_URL
   Value: redis://default:[your-password]@[your-endpoint]:6379
   Environment: Production, Preview (optional)
   ```

4. Click "Save"
5. **Important**: Redeploy your application for changes to take effect

   ```bash
   # Via Vercel CLI
   vercel --prod

   # Or push to main branch to trigger auto-deployment
   git push origin main
   ```

## Step 5: Verify Redis Connection

Run the verification script:

```bash
# Make sure REDIS_URL is in your .env.local
npm run verify:redis
```

Or manually test:

```bash
# Test local connection
ts-node scripts/verify-redis.ts

# Test production (requires Vercel CLI)
vercel env pull .env.production
REDIS_URL=$(grep REDIS_URL .env.production | cut -d '=' -f2) ts-node scripts/verify-redis.ts
```

Expected output:
```
🔄 Testing Redis connection...
✅ Redis connected successfully
📊 Response time: 45ms
💾 Database size: 0 keys
✅ Redis is ready for production!
```

## Step 6: Monitor Redis Usage

### Upstash Console

1. Go to your database dashboard
2. View real-time metrics:
   - Commands per second
   - Memory usage
   - Connection count
   - Error rate

### Application Monitoring

Use the built-in health check endpoint:

```bash
# Check Redis health
curl https://your-app.vercel.app/api/health

# Expected response
{
  "status": "healthy",
  "redis": {
    "connected": true,
    "responseTime": 45,
    "mode": "redis"
  }
}
```

## Step 7: Test Rate Limiting

### Test with curl

```bash
# Test rate limiting (should allow 5 requests in 15 minutes)
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST https://your-app.vercel.app/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -i | grep "X-RateLimit"
  echo ""
done
```

Expected headers:
```
Request 1: X-RateLimit-Remaining: 4
Request 2: X-RateLimit-Remaining: 3
Request 3: X-RateLimit-Remaining: 2
Request 4: X-RateLimit-Remaining: 1
Request 5: X-RateLimit-Remaining: 0
Request 6: HTTP 429 Too Many Requests
```

### Verify Redis Keys

In Upstash Console > Data Browser:
```
Key: ratelimit:login:test@example.com
Value: 6
TTL: 900 seconds (15 minutes)
```

## Configuration Details

### Current Rate Limits (from lib/config/security.ts)

```typescript
RATE_LIMIT: {
  LOGIN: {
    MAX_ATTEMPTS: 5,      // 5 attempts
    WINDOW_MS: 900000,    // 15 minutes
  },
  SIGNUP: {
    MAX_ATTEMPTS: 3,      // 3 attempts
    WINDOW_MS: 3600000,   // 1 hour
  },
  API: {
    MAX_REQUESTS: 100,    // 100 requests
    WINDOW_MS: 900000,    // 15 minutes
  }
}
```

### Redis Key Format

```
Pattern: ratelimit:{type}:{identifier}

Examples:
- ratelimit:login:user@example.com
- ratelimit:signup:192.168.1.1
- ratelimit:api:api-key-abc123
```

## Fallback Behavior

The application is designed to work with or without Redis:

1. **Redis Available**: Distributed rate limiting across all Vercel instances
2. **Redis Unavailable**: Falls back to in-memory rate limiting (per-instance)

### Fallback Characteristics

- **In-memory mode**: Each Vercel serverless function has its own memory
- **Limits are less strict**: Users could exceed limits by hitting different instances
- **No persistence**: Limits reset when function cold-starts
- **Recommended**: Always use Redis in production for consistent rate limiting

## Troubleshooting

### Connection Issues

**Symptom**: `Redis connection timeout`

**Solutions**:
1. Verify REDIS_URL format is correct
2. Check Upstash dashboard for database status
3. Ensure TLS is enabled (Upstash requires it)
4. Check Vercel environment variables are set

**Test connection:**
```bash
# Using redis-cli
redis-cli -u "redis://default:[password]@[endpoint]:6379" ping
# Should return: PONG
```

### Rate Limits Not Working

**Symptom**: No rate limiting applied

**Check**:
1. Verify Redis is connected:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. Check Vercel logs for Redis errors:
   ```bash
   vercel logs --prod
   ```

3. Verify environment variables:
   ```bash
   vercel env ls
   ```

### High Latency

**Symptom**: Slow Redis responses (>200ms)

**Solutions**:
1. Choose Upstash region closest to Vercel deployment region
2. Consider upgrading to Upstash Global database
3. Monitor Upstash metrics for throttling
4. Check network issues in Vercel logs

### Keys Not Expiring

**Symptom**: Redis keys persist longer than expected

**Check**:
1. Upstash eviction policy (should be "No eviction")
2. TTL is being set on keys:
   ```bash
   # In Upstash Console > Data Browser
   TTL ratelimit:login:user@example.com
   # Should show remaining seconds
   ```

## Cost Estimation

### Upstash Free Tier
- **Commands**: 10,000/day free
- **Storage**: 256 MB
- **Concurrent connections**: 1,000
- **Bandwidth**: 1 GB/month

### Typical Usage (Hablas App)
Assuming 1,000 daily active users:
- Login attempts: ~2,000 rate limit checks/day
- API requests: ~5,000 rate limit checks/day
- **Total**: ~7,000 commands/day (within free tier)

### When to Upgrade
- **Free tier sufficient for**: <10,000 commands/day
- **Paid tier needed when**: >10,000 commands/day or >256MB storage
- **Pricing**: $0.20 per 100k commands beyond free tier

## Best Practices

### 1. Use Connection Pooling
Already implemented in `lib/db/redis.ts`:
- Singleton Redis client
- Automatic reconnection
- Error handling with fallback

### 2. Set Appropriate TTLs
- LOGIN: 15 minutes (900 seconds)
- SIGNUP: 1 hour (3600 seconds)
- API: 15 minutes (900 seconds)

### 3. Monitor Redis Health
- Use `/api/health` endpoint
- Set up Vercel monitoring alerts
- Check Upstash dashboard regularly

### 4. Handle Errors Gracefully
- Application falls back to in-memory on Redis errors
- Logs errors without crashing
- No degraded user experience

### 5. Secure Your Redis URL
- Never commit REDIS_URL to git
- Use Vercel environment variables
- Rotate credentials periodically

### 6. Test Before Production
1. Test locally with Upstash dev database
2. Test in Vercel preview deployments
3. Monitor production for first 24 hours
4. Verify rate limiting works as expected

## Security Considerations

### 1. TLS Encryption
- Upstash enforces TLS by default
- All data encrypted in transit
- Certificate validation automatic

### 2. Authentication
- Redis password required in connection URL
- Password stored securely in Vercel env vars
- No password in application logs

### 3. Network Security
- Upstash uses IP whitelisting (optional)
- No direct database port exposure
- All connections over HTTPS/TLS

### 4. Data Privacy
- Rate limit data contains user identifiers
- Data auto-expires via TTL
- No sensitive data stored in Redis
- GDPR compliant with auto-deletion

## Advanced Configuration

### Using REST API (Alternative)

If you prefer REST API over native Redis protocol:

```typescript
// .env.local
UPSTASH_REDIS_REST_URL=https://us1-informed-peacock-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AZBjASQgYzk...
```

```typescript
// lib/db/redis-rest.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default redis;
```

Benefits:
- No persistent connections
- Better for serverless
- HTTP-based (works everywhere)

### Global Replication

For multi-region deployments:

1. Create Global database in Upstash
2. Configure read regions
3. Update connection URL
4. Test latency from each region

### Custom Eviction Policy

For advanced use cases:

```
Eviction: allkeys-lru (evict oldest keys when memory full)
Use case: Caching with rate limiting
```

## Migration Checklist

- [ ] Create Upstash account
- [ ] Create Redis database
- [ ] Copy REDIS_URL
- [ ] Add to Vercel environment variables
- [ ] Add to .env.local for testing
- [ ] Run verification script
- [ ] Test rate limiting locally
- [ ] Deploy to Vercel
- [ ] Verify production Redis connection
- [ ] Test production rate limiting
- [ ] Monitor for 24 hours
- [ ] Set up Upstash alerts
- [ ] Document any issues

## Support Resources

- **Upstash Documentation**: https://docs.upstash.com/redis
- **Upstash Discord**: https://upstash.com/discord
- **Vercel Support**: https://vercel.com/support
- **Redis Documentation**: https://redis.io/docs/

## Next Steps

After Redis is configured:

1. **Monitor Performance**: Check Redis latency and usage
2. **Tune Rate Limits**: Adjust based on actual usage patterns
3. **Set Up Alerts**: Configure Upstash alerts for high usage
4. **Document Incidents**: Track any Redis-related issues
5. **Plan Scaling**: Monitor free tier usage, upgrade if needed

---

**Quick Reference:**

```bash
# Verify Redis
npm run verify:redis

# Check health
curl https://your-app.vercel.app/api/health

# View Vercel env vars
vercel env ls

# Tail production logs
vercel logs --prod --follow

# Redeploy after env changes
vercel --prod
```
