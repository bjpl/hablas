# Rate Limiting Quick Start

## 5-Minute Setup

### 1. Get Upstash Redis Credentials (Optional)

```bash
# Visit: https://console.upstash.com/
# Create free Redis database
# Copy REST API credentials
```

### 2. Configure Environment

```bash
# Add to .env (optional - works without it)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### 3. Use in Your API Route

```typescript
import { NextRequest, NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/api/middleware"
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  // Apply rate limiting (100 req/hour)
  const rateLimitResponse = await applyRateLimit(
    request,
    RATE_LIMIT_CONFIGS.PUBLIC_API
  )
  if (rateLimitResponse) return rateLimitResponse

  // Your API logic here
  return NextResponse.json({ data: "success" })
}
```

## Available Configurations

```typescript
RATE_LIMIT_CONFIGS.PUBLIC_API    // 100 req/hour
RATE_LIMIT_CONFIGS.ANALYTICS     // 50 req/hour
RATE_LIMIT_CONFIGS.AI_GENERATION // 20 req/hour (expensive)
RATE_LIMIT_CONFIGS.AUTH          // 10 req/15min (security)
RATE_LIMIT_CONFIGS.GENERAL       // 200 req/hour
RATE_LIMIT_CONFIGS.ADMIN         // 500 req/hour
```

## Test Your Implementation

```bash
# Start dev server
npm run dev

# Run automated tests
npm run test:rate-limit

# Manual test
curl http://localhost:3000/api/analytics
curl http://localhost:3000/api/health
```

## Common Patterns

### Pattern 1: Middleware (Recommended)

```typescript
export async function POST(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(
    request,
    RATE_LIMIT_CONFIGS.ANALYTICS
  )
  if (rateLimitResponse) return rateLimitResponse

  // Your logic
}
```

### Pattern 2: Higher-Order Function

```typescript
export const GET = withRateLimit(
  async (request) => {
    return NextResponse.json({ data: "..." })
  },
  RATE_LIMIT_CONFIGS.PUBLIC_API
)
```

### Pattern 3: Custom Configuration

```typescript
const CUSTOM_CONFIG = {
  requests: 30,
  window: "10 m",
  prefix: "custom"
}

const result = await checkRateLimit(
  `custom:${ip}`,
  CUSTOM_CONFIG
)
```

## Response Headers

Every rate-limited response includes:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698765432000
```

## Error Response (429)

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again in 3456 seconds.",
  "limit": 100,
  "remaining": 0,
  "reset": 1698765432000
}
```

## Development Mode

Works without Redis! Automatically uses in-memory rate limiting:

```
⚠️ Upstash Redis not configured. Using in-memory rate limiting.
```

## Production Deployment

### Vercel
1. Project Settings → Environment Variables
2. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Deploy

### Docker
```yaml
environment:
  - UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
  - UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}
```

## Monitoring

```bash
# Check health
curl http://localhost:3000/api/health

# Returns:
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

## Troubleshooting

**Rate limiting not working?**
- Check `.env` file has correct credentials
- Verify Upstash dashboard shows active database
- Check `/api/health` endpoint for Redis status

**Getting rate limited in development?**
- Limits apply to all environments
- Clear rate limit: restart server (in-memory mode)
- Increase limits for development if needed

**Need different limits?**
```typescript
const DEV_CONFIG = {
  requests: 1000,  // Higher for development
  window: "1 h",
  prefix: "dev"
}
```

## Quick Reference

| Task | Command |
|------|---------|
| Setup env | Add credentials to `.env` |
| Test locally | `npm run test:rate-limit` |
| Check health | `curl /api/health` |
| View analytics | Check Upstash dashboard |
| Restart limits | Restart dev server (in-memory) |

## Examples

See these files for working examples:
- `app/api/analytics/route.ts` - 50 req/hour
- `app/api/health/route.ts` - 200 req/hour

## Documentation

- **Full Guide**: `docs/api-rate-limiting.md`
- **Implementation**: `docs/RATE-LIMIT-IMPLEMENTATION.md`
- **Environment**: `.env.example`

---

**That's it!** Your API is now protected with rate limiting. 🎉
