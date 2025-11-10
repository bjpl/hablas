# API Rate Limiting Guide

This guide explains how to set up and use API rate limiting in the Hablas application using Upstash Redis.

## Overview

The application uses Upstash Redis for distributed rate limiting to protect API endpoints from abuse and prevent cost overruns. Rate limiting is implemented using the `@upstash/ratelimit` package with sliding window algorithm.

## Quick Start

### 1. Set Up Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database (free tier available)
3. Copy the REST API credentials from your database dashboard
4. Add credentials to your `.env` file:

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token_here
```

### 2. Rate Limiting in Development

If Upstash credentials are not configured, rate limiting will be **automatically disabled** in development mode. This allows you to develop and test without Redis setup.

**Note**: You'll see a warning in the console:
```
⚠️ Upstash Redis credentials not found. Rate limiting will be disabled.
```

## Available Rate Limit Configurations

The application provides pre-configured rate limits for different endpoint types:

| Endpoint Type | Requests | Window | Use Case |
|--------------|----------|---------|----------|
| `PUBLIC_API` | 100 | 1 hour | General public APIs |
| `ANALYTICS` | 50 | 1 hour | Analytics tracking |
| `AI_GENERATION` | 20 | 1 hour | AI content generation (high cost) |
| `AUTH` | 10 | 15 minutes | Authentication endpoints |
| `GENERAL` | 200 | 1 hour | Low-cost general endpoints |
| `ADMIN` | 500 | 1 hour | Admin panel endpoints |

## Using Rate Limiting

### Method 1: Using Middleware (Recommended)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/api/middleware";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(
    request,
    RATE_LIMIT_CONFIGS.PUBLIC_API
  );

  if (rateLimitResponse) {
    return rateLimitResponse; // Returns 429 if limit exceeded
  }

  // Your endpoint logic here
  return NextResponse.json({ data: "..." });
}
```

### Method 2: Using Higher-Order Function

```typescript
import { withRateLimit } from "@/lib/api/middleware";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

export const GET = withRateLimit(
  async (request: NextRequest) => {
    // Your handler logic
    return NextResponse.json({ data: "..." });
  },
  RATE_LIMIT_CONFIGS.PUBLIC_API
);
```

### Method 3: Manual Rate Limit Check

```typescript
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/api/middleware";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const config = RATE_LIMIT_CONFIGS.ANALYTICS;
  const identifier = `${config.prefix}:${ip}`;

  const result = await checkRateLimit(identifier, config);

  if (!result.success) {
    return NextResponse.json(
      { error: "Too Many Requests" },
      {
        status: 429,
        headers: getRateLimitHeaders(result)
      }
    );
  }

  // Process request
  return NextResponse.json({ success: true });
}
```

## Custom Rate Limit Configuration

Create custom rate limits for specific endpoints:

```typescript
import { RateLimitConfig } from "@/lib/rate-limit";

const CUSTOM_CONFIG: RateLimitConfig = {
  requests: 30,      // 30 requests
  window: "10 m",    // per 10 minutes
  prefix: "custom",  // Redis key prefix
};
```

Supported time units:
- `s` - seconds
- `m` - minutes
- `h` - hours
- `d` - days

## Rate Limit Headers

All rate-limited responses include these headers:

- `X-RateLimit-Limit`: Maximum requests allowed in the window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp (ms) when the limit resets

### Example Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698765432000
```

## 429 Error Response Format

When rate limit is exceeded, the API returns:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again in 3456 seconds.",
  "limit": 100,
  "remaining": 0,
  "reset": 1698765432000
}
```

## IP Address Detection

The middleware automatically detects client IP from these headers (in order):

1. `x-real-ip`
2. `x-forwarded-for`
3. `cf-connecting-ip` (Cloudflare)
4. `true-client-ip` (Cloudflare Enterprise)
5. `x-client-ip`
6. `request.ip`

## Health Check

Check rate limiting and Redis status:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "environment": {
    "redis": {
      "configured": true,
      "healthy": true
    }
  },
  "rateLimiting": {
    "enabled": true,
    "message": "Rate limiting is active"
  }
}
```

## Testing Rate Limits

### Test Analytics Endpoint

```bash
# Check current rate limit status
curl http://localhost:3000/api/analytics

# Send analytics event
curl -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -d '{"event": "page_view", "properties": {"page": "/"}}'
```

### Test Rate Limit Exhaustion

```bash
# Send multiple requests quickly to trigger rate limit
for i in {1..60}; do
  curl -X POST http://localhost:3000/api/analytics \
    -H "Content-Type: application/json" \
    -d '{"event": "test"}' &
done
```

## Best Practices

1. **Use appropriate rate limits**: Choose conservative limits for high-cost operations (AI, database writes)
2. **Monitor usage**: Check Upstash dashboard for rate limit analytics
3. **Handle errors gracefully**: Always provide clear error messages when limits are exceeded
4. **Test in production**: Verify rate limiting works with your deployment platform
5. **Consider user experience**: Set limits that balance security with usability
6. **Use different configs**: Apply stricter limits to expensive operations

## Troubleshooting

### Rate Limiting Not Working

1. Check environment variables are set:
```bash
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN
```

2. Verify Redis connection:
```bash
curl http://localhost:3000/api/health
```

3. Check server logs for Redis errors

### High Rate Limit Usage

1. Review Upstash dashboard for usage patterns
2. Consider implementing user-based rate limiting
3. Add CAPTCHA for suspicious traffic
4. Implement API key authentication for trusted clients

## Upstash Free Tier Limits

Upstash offers a free tier with:
- **10,000 commands per day**
- **256 MB storage**
- **TLS support**

Perfect for small to medium applications. Monitor usage in the Upstash console.

## Production Deployment

### Environment Variables

Ensure these are set in your deployment platform:

```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### Vercel

Add to Project Settings → Environment Variables

### Docker

Add to `docker-compose.yml`:
```yaml
environment:
  - UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
  - UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}
```

## Advanced Usage

### Per-User Rate Limiting

```typescript
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  const identifier = `user:${userId}`;

  const result = await checkRateLimit(identifier, RATE_LIMIT_CONFIGS.PUBLIC_API);
  // ...
}
```

### Dynamic Rate Limits

```typescript
function getRateLimitConfig(userTier: string): RateLimitConfig {
  switch (userTier) {
    case "premium":
      return { requests: 1000, window: "1 h", prefix: "premium" };
    case "free":
      return { requests: 100, window: "1 h", prefix: "free" };
    default:
      return RATE_LIMIT_CONFIGS.PUBLIC_API;
  }
}
```

## API Reference

See the inline documentation in:
- `lib/rate-limit.ts` - Core rate limiting utilities
- `lib/api/middleware.ts` - Middleware and helper functions

## Related Files

- `lib/rate-limit.ts` - Rate limiting implementation
- `lib/api/middleware.ts` - API middleware utilities
- `app/api/analytics/route.ts` - Example implementation
- `app/api/health/route.ts` - Health check endpoint
- `.env.example` - Environment variable template
