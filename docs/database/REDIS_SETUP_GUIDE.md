# Redis Setup Guide for Production

## Overview

Redis integration is **optional** for the Hablas platform. The application gracefully degrades to in-memory rate limiting if Redis is unavailable, making it suitable for both development and production environments.

## Why Redis?

### Benefits

1. **Distributed Rate Limiting**: Share rate limits across multiple application instances
2. **Persistence**: Rate limits survive application restarts
3. **Performance**: Faster than in-memory for high-traffic scenarios
4. **Scalability**: Essential for horizontal scaling with multiple servers

### When to Use Redis

- **Production with multiple instances**: Required for consistent rate limiting
- **High traffic applications**: Better performance at scale
- **Containerized deployments**: Kubernetes, Docker Swarm, etc.

### When In-Memory is Sufficient

- **Development**: Local testing doesn't need Redis
- **Single instance deployments**: Vercel, Render, etc. (single server)
- **Low traffic**: Small applications with limited API usage

## Installation Options

### Option 1: Vercel KV (Recommended for Vercel Deployments)

Vercel provides managed Redis through Vercel KV:

1. **Create Vercel KV Store**:
   ```bash
   # Via Vercel Dashboard
   # 1. Go to your project → Storage → Create Database
   # 2. Select "KV Store"
   # 3. Choose region closest to your deployment
   ```

2. **Environment Variables** (Auto-configured):
   ```env
   KV_URL=redis://...
   KV_REST_API_URL=https://...
   KV_REST_API_TOKEN=...
   KV_REST_API_READ_ONLY_TOKEN=...
   ```

3. **Update .env**:
   ```env
   REDIS_URL=$KV_URL
   ```

### Option 2: Upstash (Serverless Redis)

Free tier available, perfect for hobby projects:

1. **Create Account**: https://upstash.com
2. **Create Database**: Choose region closest to deployment
3. **Get Connection Details**:
   ```env
   REDIS_URL=rediss://default:PASSWORD@HOSTNAME:6379
   ```

### Option 3: Redis Cloud

Managed Redis with free tier:

1. **Create Account**: https://redis.com/try-free/
2. **Create Database**: Select cloud provider and region
3. **Connection String**:
   ```env
   REDIS_URL=redis://default:PASSWORD@HOSTNAME:PORT
   REDIS_PASSWORD=your-password
   ```

### Option 4: Self-Hosted Redis

For custom deployments:

#### Docker

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --requirepass "your-secure-password"
```

#### Docker Compose

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass your-secure-password
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  redis-data:
```

## Configuration

### Environment Variables

Add to `.env.local` (development) or Vercel Environment Variables (production):

```env
# Option 1: Connection URL (recommended)
REDIS_URL=redis://username:password@hostname:6379

# Option 2: Individual parameters
REDIS_HOST=hostname
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_CONNECT_TIMEOUT=5000
```

### Security Considerations

1. **Always use passwords** in production
2. **Use TLS/SSL** for production: `rediss://...` (note the 's')
3. **Restrict network access** to application servers only
4. **Rotate credentials** regularly
5. **Never commit** Redis credentials to git

## Application Integration

The application automatically uses Redis when configured. No code changes needed!

### How It Works

```typescript
// lib/db/redis.ts automatically initializes on import
import { redis } from '@/lib/db/redis';

// Rate limiter automatically uses Redis if available
import { checkRateLimit } from '@/lib/utils/rate-limiter';

const result = await checkRateLimit(userEmail, 'LOGIN');
// ✅ Uses Redis if connected
// ⚠️  Falls back to in-memory if not
```

### Graceful Degradation

The system automatically handles Redis failures:

1. **Initialization fails**: Falls back to in-memory
2. **Connection lost**: Falls back to in-memory
3. **Max retries reached**: Uses in-memory permanently
4. **No configuration**: Uses in-memory (development mode)

## Verification

### Check Redis Connection

```bash
npm run db:health
```

Expected output with Redis:
```
🔴 Redis Connection:
  Status:        ✅ Connected
  Mode:          🚀 Redis
  Response Time: 5ms
```

Expected output without Redis:
```
🔴 Redis Connection:
  Status:        ⚠️  Not Connected
  Mode:          💾 In-Memory
```

### Test Rate Limiting

```bash
npm run test:rate-limit
```

## Monitoring

### Redis Stats

The health check provides Redis metrics:

```typescript
import { redis } from '@/lib/db/redis';

const stats = await redis.getStats();
console.log(stats);
// {
//   connected: true,
//   dbSize: 150,
//   info: "..."
// }
```

### Rate Limit Inspection

```typescript
import { getRateLimitStatus } from '@/lib/utils/rate-limiter';

const status = await getRateLimitStatus('user@example.com', 'LOGIN');
console.log(status);
// {
//   allowed: true,
//   remaining: 4,
//   resetAt: 1234567890
// }
```

## Production Deployment

### Vercel Deployment

1. **Enable Vercel KV**:
   - Dashboard → Project → Storage → Create KV Store

2. **Environment Variables** (auto-configured):
   ```
   KV_URL, KV_REST_API_URL, etc.
   ```

3. **Add to .env**:
   ```env
   REDIS_URL=$KV_URL
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### Other Platforms

1. **Set Environment Variables**:
   ```env
   REDIS_URL=your-redis-connection-string
   ```

2. **Ensure Network Access**:
   - Whitelist application server IPs
   - Open firewall rules (port 6379 or custom)

3. **Test Connection**:
   ```bash
   npm run db:health
   ```

## Troubleshooting

### Connection Refused

**Problem**: `ECONNREFUSED` error

**Solutions**:
1. Verify Redis is running: `redis-cli ping`
2. Check hostname/port: `telnet hostname 6379`
3. Verify firewall rules
4. Check network connectivity

### Authentication Failed

**Problem**: `NOAUTH` or authentication errors

**Solutions**:
1. Verify password in `REDIS_URL`
2. Check Redis config: `CONFIG GET requirepass`
3. Ensure correct password format in URL

### Timeout Issues

**Problem**: Connection timeouts

**Solutions**:
1. Increase timeout: `REDIS_CONNECT_TIMEOUT=10000`
2. Check network latency
3. Verify Redis server load
4. Consider regional Redis instance

### Fallback to Memory

**Problem**: Always using in-memory mode

**Check**:
1. Redis environment variable set: `echo $REDIS_URL`
2. Application logs for connection errors
3. Run health check: `npm run db:health`

## Performance Optimization

### Connection Pooling

The Redis client automatically handles connection pooling. No configuration needed.

### Key Expiration

Rate limit keys automatically expire based on window:
- Login attempts: 15 minutes
- API requests: 1 minute
- Password reset: 1 hour

### Memory Management

Redis automatically evicts expired keys. For manual cleanup:

```typescript
import { clearAllRateLimits } from '@/lib/utils/rate-limiter';

// Clear all rate limits (admin operation)
await clearAllRateLimits();
```

## Cost Considerations

### Free Tiers

1. **Upstash**: 10,000 requests/day
2. **Redis Cloud**: 30MB storage
3. **Vercel KV**: Included with Pro plan

### Estimated Usage

For typical application:
- Rate limit checks: ~5-10 per request
- Storage per key: ~100 bytes
- Daily requests: 1M = ~100MB storage

**Recommendation**: Start with free tier, upgrade if needed.

## Maintenance

### Regular Tasks

1. **Monitor Memory Usage**:
   ```bash
   redis-cli INFO memory
   ```

2. **Check Key Count**:
   ```bash
   redis-cli DBSIZE
   ```

3. **Inspect Keys**:
   ```bash
   redis-cli KEYS "ratelimit:*"
   ```

4. **Flush (if needed)**:
   ```bash
   redis-cli FLUSHDB  # Development only!
   ```

### Backup

Redis rate limit data is transient. No backups needed for this use case.

## Migration Path

### Starting Without Redis

1. Deploy application with in-memory rate limiting
2. Monitor performance and traffic
3. Add Redis when needed (zero downtime)

### Adding Redis Later

1. Provision Redis instance
2. Add `REDIS_URL` environment variable
3. Redeploy application
4. Verify with health check

No code changes or database migrations required!

## References

- Redis Manager: `lib/db/redis.ts`
- Rate Limiter: `lib/utils/rate-limiter.ts`
- Health Check: `database/scripts/health-check.ts`
- Security Config: `lib/config/security.ts`
