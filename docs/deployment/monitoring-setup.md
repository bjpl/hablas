# Hablas Production Monitoring Setup Guide

## Overview

Comprehensive monitoring and observability setup for Hablas production environment covering error tracking, performance monitoring, uptime monitoring, log aggregation, and alerting. This guide ensures application reliability, quick issue resolution, and optimal user experience.

## Table of Contents

1. [Monitoring Strategy](#monitoring-strategy)
2. [Error Tracking with Sentry](#error-tracking-with-sentry)
3. [Vercel Analytics](#vercel-analytics)
4. [Performance Monitoring](#performance-monitoring)
5. [Uptime Monitoring](#uptime-monitoring)
6. [Log Aggregation](#log-aggregation)
7. [Alert Configuration](#alert-configuration)
8. [Monitoring Dashboard](#monitoring-dashboard)
9. [Health Check Endpoints](#health-check-endpoints)
10. [Incident Response Plan](#incident-response-plan)
11. [Cost Estimation](#cost-estimation)
12. [Best Practices](#best-practices)

## Monitoring Strategy

### Key Metrics to Monitor

1. **Application Health**
   - Error rate and types
   - Response times
   - Uptime/availability

2. **Performance**
   - Page load times
   - API response times
   - Database query performance
   - Resource utilization

3. **User Experience**
   - Core Web Vitals (LCP, FID, CLS)
   - User flows and conversions
   - Geographic distribution

4. **Business Metrics**
   - Topic creation rate
   - Audio upload success rate
   - User engagement
   - Session duration

### Recommended Monitoring Stack

| Component | Service | Purpose |
|-----------|---------|---------|
| Error Tracking | Sentry | Runtime errors, exceptions |
| Analytics | Vercel Analytics | Performance, Web Vitals |
| Logging | Axiom / Logtail | Centralized logs |
| Uptime | Uptime Robot | Availability monitoring |
| APM | New Relic / Datadog | Application performance |

## Error Tracking with Sentry

### Why Sentry?

- Real-time error notifications
- Detailed stack traces and context
- Release tracking
- Performance monitoring
- Generous free tier (5K events/month)

### Step 1: Create Sentry Account

1. Visit [sentry.io](https://sentry.io/signup/)
2. Sign up with GitHub or email
3. Create new organization: "Hablas"
4. Create new project:
   - Platform: **Next.js**
   - Project name: **hablas-production**

### Step 2: Install Sentry SDK

```bash
# Install Sentry SDK for Next.js
npm install @sentry/nextjs

# Run Sentry wizard for automatic configuration
npx @sentry/wizard@latest -i nextjs
```

### Step 3: Configure Sentry

The wizard creates configuration files. Customize as needed:

#### sentry.client.config.ts

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Sample rate for performance monitoring
  tracesSampleRate: 1.0,

  // Session replay sample rate
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Integrations
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/hablas\.co/],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Ignore common errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],

  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove sensitive information
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.['authorization'];
    }
    return event;
  },
});
```

#### sentry.server.config.ts

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: 1.0,

  // Enable Node.js profiling
  profilesSampleRate: 1.0,

  integrations: [
    new Sentry.Integrations.Postgres(),
  ],

  beforeSend(event) {
    // Filter sensitive server data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  },
});
```

#### sentry.edge.config.ts

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Step 4: Environment Variables

Add to Vercel environment variables:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxx  # For source maps upload
SENTRY_ORG=hablas
SENTRY_PROJECT=hablas-production

# Git information (auto-populated by Vercel)
NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA=$VERCEL_GIT_COMMIT_SHA
```

### Step 5: Custom Error Tracking

```typescript
// lib/error-tracking.ts
import * as Sentry from '@sentry/nextjs';

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    tags: {
      component: context?.component,
      action: context?.action,
    },
    extra: context,
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

export function setUserContext(user: { id: string; email?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
}
```

### Step 6: Usage in Application

```typescript
// app/api/topics/route.ts
import { captureError } from '@/lib/error-tracking';

export async function POST(request: Request) {
  try {
    // Your code
  } catch (error) {
    captureError(error as Error, {
      component: 'TopicCreation',
      action: 'create_topic',
      userId: session?.user?.id,
    });

    return Response.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}
```

### Step 7: Configure Alerts

In Sentry Dashboard:

1. Go to **Alerts** → **Create Alert**
2. Configure alert rules:

```yaml
# Critical Error Alert
Condition: Error count > 10 in 5 minutes
Actions:
  - Send email to: team@hablas.co
  - Send Slack notification to: #hablas-alerts

# Performance Degradation Alert
Condition: Average response time > 2s for 10 minutes
Actions:
  - Send email notification
  - Create GitHub issue

# New Error Type Alert
Condition: New unique error detected
Actions:
  - Send email notification
```

## Vercel Analytics

### Step 1: Enable Vercel Analytics

1. Go to Vercel Dashboard → Your project
2. Click **Analytics** tab
3. Click **Enable Analytics**
4. Choose plan:
   - **Hobby**: Free (2,500 events/month)
   - **Pro**: $10/month (100K events/month)

### Step 2: Install Analytics Package

```bash
npm install @vercel/analytics
```

### Step 3: Add to Application

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Step 4: Track Custom Events

```typescript
// Track custom events
import { track } from '@vercel/analytics';

// In your components
const handleTopicCreated = () => {
  track('topic_created', {
    category: 'engagement',
    label: 'user_action',
  });
};

const handleAudioUploaded = () => {
  track('audio_uploaded', {
    category: 'content',
    fileSize: file.size,
  });
};
```

### Step 5: Web Vitals Monitoring

```typescript
// app/web-vitals.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    console.log(metric);

    // Send to custom endpoint if needed
    if (metric.value > threshold) {
      fetch('/api/analytics/vitals', {
        method: 'POST',
        body: JSON.stringify(metric),
      });
    }
  });

  return null;
}
```

## Performance Monitoring

### Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Performance Tracking

```typescript
// lib/performance.ts
export function trackPerformance(label: string, callback: () => void) {
  const start = performance.now();

  callback();

  const duration = performance.now() - start;

  // Log or send to analytics
  if (duration > 100) {
    console.warn(`Slow operation: ${label} took ${duration}ms`);

    // Send to monitoring service
    fetch('/api/performance', {
      method: 'POST',
      body: JSON.stringify({ label, duration }),
    });
  }
}

// Usage
trackPerformance('database_query', () => {
  // Your database query
});
```

### Database Query Performance

```typescript
// lib/db/pool.ts
import { captureMessage } from '@/lib/error-tracking';

const originalQuery = pool.query.bind(pool);

pool.query = async function monitoredQuery(...args: any[]) {
  const start = Date.now();

  try {
    const result = await originalQuery(...args);
    const duration = Date.now() - start;

    if (duration > 1000) {
      captureMessage(`Slow query detected: ${duration}ms`, 'warning');
    }

    return result;
  } catch (error) {
    captureError(error as Error, {
      component: 'Database',
      query: args[0],
    });
    throw error;
  }
};
```

## Log Aggregation

### Option 1: Axiom

#### Setup

1. Sign up at [axiom.co](https://axiom.co)
2. Create dataset: `hablas-logs`
3. Get API token

#### Install

```bash
npm install @axiomhq/js
```

#### Configure

```typescript
// lib/logger.ts
import { Axiom } from '@axiomhq/js';

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN,
  orgId: process.env.AXIOM_ORG_ID,
});

export async function log(
  level: 'info' | 'warn' | 'error',
  message: string,
  metadata?: Record<string, any>
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    environment: process.env.NODE_ENV,
    ...metadata,
  };

  // Send to Axiom
  await axiom.ingest('hablas-logs', [logEntry]);

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(logEntry);
  }
}
```

### Option 2: Logtail

```bash
npm install @logtail/node
```

```typescript
// lib/logger.ts
import { Logtail } from '@logtail/node';

const logtail = new Logtail(process.env.LOGTAIL_TOKEN!);

export const logger = {
  info: (message: string, context?: object) => {
    logtail.info(message, context);
  },
  warn: (message: string, context?: object) => {
    logtail.warn(message, context);
  },
  error: (message: string, context?: object) => {
    logtail.error(message, context);
  },
};

// Usage
logger.info('Topic created', { topicId: topic.id, userId: user.id });
logger.error('Upload failed', { error: error.message, fileSize: file.size });
```

### Structured Logging

```typescript
// lib/structured-logger.ts
type LogContext = {
  userId?: string;
  topicId?: string;
  action?: string;
  duration?: number;
  error?: Error;
};

export class Logger {
  private context: LogContext = {};

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  info(message: string, additionalContext?: LogContext) {
    this.log('info', message, additionalContext);
  }

  warn(message: string, additionalContext?: LogContext) {
    this.log('warn', message, additionalContext);
  }

  error(message: string, error?: Error, additionalContext?: LogContext) {
    this.log('error', message, { ...additionalContext, error });
  }

  private log(level: string, message: string, additionalContext?: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...additionalContext,
    };

    // Send to log aggregation service
    // Also send to Sentry if error
    if (level === 'error' && logEntry.error) {
      captureError(logEntry.error, logEntry);
    }
  }
}
```

## Alert Configuration

## Uptime Monitoring

### Option A: UptimeRobot (Recommended - Free Tier)

#### Features
- Monitor up to 50 sites (Free)
- 5-minute check intervals
- Email/SMS/Slack alerts
- Public status page
- SSL certificate monitoring
- 99.98% monitoring uptime SLA

#### Setup Steps

1. **Sign up** at [uptimerobot.com](https://uptimerobot.com)

2. **Create Main Site Monitor**:
   ```yaml
   Monitor Type: HTTPS
   URL: https://hablas.vercel.app
   Friendly Name: Hablas - Main Site
   Monitoring Interval: 5 minutes
   Monitor Timeout: 30 seconds
   ```

3. **Create API Health Monitor**:
   ```yaml
   Monitor Type: Keyword
   URL: https://hablas.vercel.app/api/health
   Friendly Name: Hablas - API Health
   Monitoring Interval: 5 minutes
   Keyword: "healthy"
   Keyword Type: exists
   ```

4. **Create Critical Endpoints Monitors**:
   ```yaml
   # Topics API
   URL: https://hablas.vercel.app/api/topics
   Expected Status Code: 200

   # Audio API
   URL: https://hablas.vercel.app/api/audio/metadata
   Expected Status Code: 200

   # Database Health
   URL: https://hablas.vercel.app/api/health
   Keyword: "database\":true"
   ```

5. **Configure Alert Contacts**:
   - Go to My Settings > Alert Contacts
   - Add email addresses
   - Set up Slack webhook (see Alert Configuration section)
   - Configure SMS (optional, for critical alerts)

6. **Create Status Page** (Optional):
   - Go to Status Pages > Add Status Page
   - Select monitors to display
   - Customize branding
   - Share public URL with users

#### Alert Thresholds
```yaml
Down: 2 consecutive failures (10 minutes)
Up: 1 successful check after downtime
Notification Frequency: Every 5 minutes while down
```

### Option B: Better Uptime (Advanced Alternative)

#### Features
- 30-second check intervals
- Multi-region monitoring (10+ locations)
- Incident management timeline
- On-call schedules and escalations
- Status page with subscriber notifications
- Free tier: 10 monitors

#### Setup Steps

1. **Sign up** at [betteruptime.com](https://betteruptime.com)

2. **Create Monitors**:
   ```yaml
   # Application Monitor
   URL: https://hablas.vercel.app
   Check Frequency: 30 seconds
   Regions: North America, Europe, Asia
   Expected Status Code: 200
   Timeout: 10 seconds

   # API Health Check
   URL: https://hablas.vercel.app/api/health
   Check Frequency: 1 minute
   Response Time Threshold: 500ms
   ```

3. **Configure Incident Timeline**:
   - Automatic incident creation on failure
   - Incident status updates
   - Post-mortem templates

4. **Set Up On-Call Rotation**:
   - Define team members
   - Set escalation policies
   - Configure notification methods

### Option C: Pingdom (Enterprise)

For high-traffic production:
- Transaction monitoring
- Real user monitoring
- Synthetic monitoring from 100+ locations
- Starting at $10/month

### Alert Channels

Configure multiple alert channels:

1. **Email**: team@hablas.co
2. **Slack**: Create webhook integration
3. **PagerDuty**: For critical alerts
4. **Discord**: Team notifications

### Alert Rules

```typescript
// lib/alerts.ts
type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

interface AlertConfig {
  severity: AlertSeverity;
  channels: ('email' | 'slack' | 'pagerduty')[];
  throttle: number; // minutes
}

const alertConfigs: Record<string, AlertConfig> = {
  high_error_rate: {
    severity: 'critical',
    channels: ['email', 'slack', 'pagerduty'],
    throttle: 5,
  },
  slow_response: {
    severity: 'medium',
    channels: ['slack'],
    throttle: 15,
  },
  failed_upload: {
    severity: 'high',
    channels: ['email', 'slack'],
    throttle: 10,
  },
};

export async function sendAlert(
  type: keyof typeof alertConfigs,
  message: string,
  context?: object
) {
  const config = alertConfigs[type];

  if (config.channels.includes('slack')) {
    await sendSlackAlert(message, config.severity, context);
  }

  if (config.channels.includes('email')) {
    await sendEmailAlert(message, config.severity, context);
  }
}
```

## Monitoring Dashboard

### Create Custom Dashboard

```typescript
// app/admin/monitoring/page.tsx
import { Card } from '@/components/ui/card';

export default async function MonitoringDashboard() {
  // Fetch metrics from various sources
  const [sentryStats, analyticsData, uptimeStatus] = await Promise.all([
    fetchSentryStats(),
    fetchAnalytics(),
    fetchUptimeStatus(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <h3>Error Rate</h3>
        <div className="text-4xl">{sentryStats.errorRate}%</div>
      </Card>

      <Card>
        <h3>Uptime (24h)</h3>
        <div className="text-4xl">{uptimeStatus.uptime}%</div>
      </Card>

      <Card>
        <h3>Avg Response Time</h3>
        <div className="text-4xl">{analyticsData.avgResponseTime}ms</div>
      </Card>
    </div>
  );
}
```

## Health Check Endpoints

### Create Comprehensive Health Check

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/pool';
import { redisClient } from '@/lib/utils/rate-limiter';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: boolean;
    redis: boolean;
    storage?: boolean;
  };
  metrics?: {
    databaseLatency: number;
    redisLatency: number;
  };
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    checks: {
      database: false,
      redis: false,
    },
    metrics: {
      databaseLatency: 0,
      redisLatency: 0,
    },
  };

  try {
    // Database health check
    const dbStart = Date.now();
    const dbResult = await Promise.race([
      pool.query('SELECT NOW()'),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      ),
    ]);
    checks.metrics!.databaseLatency = Date.now() - dbStart;
    checks.checks.database = true;

    // Redis health check
    const redisStart = Date.now();
    const redisCheck = await Promise.race([
      redisClient.ping(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis timeout')), 5000)
      ),
    ]);
    checks.metrics!.redisLatency = Date.now() - redisStart;
    checks.checks.redis = redisCheck === 'PONG';

    // Determine overall status
    const allHealthy = checks.checks.database && checks.checks.redis;
    checks.status = allHealthy ? 'healthy' : 'degraded';

    const statusCode = allHealthy ? 200 : 503;

    return NextResponse.json(checks, { status: statusCode });
  } catch (error) {
    checks.status = 'unhealthy';

    return NextResponse.json(
      {
        ...checks,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

### Database-Specific Health Check

Create `app/api/health/db/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/pool';

export async function GET() {
  try {
    // Check connection
    const connectionResult = await pool.query('SELECT NOW()');

    // Check table access
    const tableCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      LIMIT 5
    `);

    // Check pool stats
    const poolStats = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };

    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        tablesAccessible: tableCheck.rows.length > 0,
        pool: poolStats,
        latency: connectionResult.rowCount ? 'ok' : 'slow',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 503 }
    );
  }
}
```

### Redis Health Check

Create `app/api/health/redis/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { redisClient } from '@/lib/utils/rate-limiter';

export async function GET() {
  try {
    const start = Date.now();

    // Test connection
    const pingResult = await redisClient.ping();

    // Test write/read
    await redisClient.set('health-check', Date.now().toString(), { EX: 60 });
    const getValue = await redisClient.get('health-check');

    const latency = Date.now() - start;

    return NextResponse.json({
      status: 'healthy',
      redis: {
        connected: pingResult === 'PONG',
        readable: getValue !== null,
        writable: true,
        latency: `${latency}ms`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        redis: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 503 }
    );
  }
}
```

## Incident Response Plan

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P0** | Critical - Site Down | 15 minutes | Complete outage, database failure, data loss |
| **P1** | High - Major Feature Broken | 1 hour | Authentication failure, API completely down |
| **P2** | Medium - Feature Degraded | 4 hours | Slow queries, partial API failure, cache issues |
| **P3** | Low - Minor Issue | 24 hours | UI bugs, analytics issues, minor performance degradation |

### Response Workflow

#### Phase 1: Detection (0-5 minutes)

```yaml
Detection Sources:
  - UptimeRobot alert received
  - Sentry error spike detected
  - User reports via support
  - Monitoring dashboard alarm

Immediate Actions:
  1. Acknowledge alert in monitoring system
  2. Check Vercel deployment status
  3. Verify issue in multiple browsers/locations
  4. Check status page (status.hablas.co)
  5. Create incident in tracking system
```

#### Phase 2: Triage (5-15 minutes)

```yaml
Investigation Checklist:
  - [ ] Check recent deployments (last 24 hours)
  - [ ] Review Vercel function logs
  - [ ] Check Sentry error dashboard
  - [ ] Verify database connectivity (/api/health/db)
  - [ ] Check Redis status (/api/health/redis)
  - [ ] Review API response times
  - [ ] Check rate limiting logs
  - [ ] Verify environment variables
  - [ ] Check third-party service status

Tools to Use:
  - Vercel Dashboard: https://vercel.com/dashboard
  - Sentry Dashboard: https://sentry.io
  - UptimeRobot: https://uptimerobot.com/dashboard
  - Health Check: https://hablas.vercel.app/api/health
```

#### Phase 3: Resolution (15-60 minutes)

```yaml
Resolution Options:

Option A - Rollback (fastest):
  1. Identify last working deployment
  2. In Vercel: Deployments → Click working deployment → "Redeploy"
  3. Monitor for 5 minutes
  4. Verify fix via health checks

Option B - Hotfix:
  1. Create hotfix branch from main
  2. Apply minimal fix
  3. Test locally
  4. Deploy to production
  5. Monitor closely

Option C - Configuration Change:
  1. Update environment variables in Vercel
  2. Redeploy current version
  3. Verify configuration applied
  4. Monitor for issues

Verification Steps:
  - [ ] Health check returns 200
  - [ ] UptimeRobot shows green
  - [ ] Sentry error rate normalized
  - [ ] API response times normal
  - [ ] Test critical user flows
```

#### Phase 4: Post-Incident (1-24 hours)

```yaml
Post-Mortem Template:

1. Incident Summary
   - Date/Time: [timestamp]
   - Duration: [minutes]
   - Severity: [P0/P1/P2/P3]
   - Impact: [users affected, features down]

2. Timeline
   - [HH:MM] Issue detected
   - [HH:MM] Team notified
   - [HH:MM] Root cause identified
   - [HH:MM] Fix deployed
   - [HH:MM] Verified resolved

3. Root Cause
   - What happened: [description]
   - Why it happened: [technical explanation]
   - Why it wasn't caught: [monitoring gaps]

4. Resolution
   - Actions taken: [steps]
   - Fix applied: [code/config changes]

5. Prevention
   - [ ] Add monitoring for similar issues
   - [ ] Update deployment checklist
   - [ ] Improve testing coverage
   - [ ] Update documentation
   - [ ] Create runbook for similar incidents

6. Action Items
   - [ ] Task 1 (Owner: @person, Due: date)
   - [ ] Task 2 (Owner: @person, Due: date)
```

### Incident Communication Template

```markdown
**Incident Alert - [Severity]**

Status: [Investigating | Identified | Monitoring | Resolved]
Started: [timestamp]
Last Update: [timestamp]

**Impact:**
- Affected Services: [list]
- Estimated Users Affected: [number/percentage]
- Current Status: [description]

**Updates:**
[timestamp] - [status update]
[timestamp] - [status update]

**Next Update:** [timestamp or "when resolved"]
```

## Cost Estimation

### Monthly Monitoring Costs (1000 DAU)

| Service | Plan | Cost/Month | Notes |
|---------|------|------------|-------|
| **Sentry** | Developer | $26 | 50k errors + performance monitoring |
| **UptimeRobot** | Free | $0 | 50 monitors, 5-min intervals |
| **Vercel Analytics** | Hobby | $0 | Included with deployment |
| **Vercel Speed Insights** | Hobby | $0 | Included with deployment |
| **Axiom/Logtail** | Free | $0 | 100GB/month (sufficient for start) |
| **Better Uptime** | Free | $0 | Optional, 10 monitors |
| **Total (Minimum)** | | **$26** | Basic production monitoring |
| **Total (Recommended)** | | **$26-50** | With optional paid tiers |

### Scaling Costs (10,000 DAU)

| Service | Plan | Cost/Month |
|---------|------|------------|
| **Sentry** | Team | $80 | 250k errors + advanced features |
| **UptimeRobot** | Pro | $18 | 1-min intervals, 50 monitors |
| **Vercel Analytics** | Pro | $10 | 100k events |
| **Axiom** | Starter | $25 | 1TB/month |
| **Total** | | **$133** |

### Enterprise Costs (100,000+ DAU)

| Service | Plan | Cost/Month |
|---------|------|------------|
| **Sentry** | Business | $259 | Unlimited errors + enterprise features |
| **Better Uptime** | Pro | $49 | 30-sec intervals, incident management |
| **Vercel Analytics** | Enterprise | Custom | Unlimited events |
| **Datadog** | Pro | $300+ | Full APM + infrastructure monitoring |
| **Total** | | **$600+** |

### Cost Optimization Tips

1. **Start with Free Tiers**:
   - Sentry Free: 5k errors/month
   - UptimeRobot Free: 50 monitors
   - Vercel Analytics: Included
   - Axiom Free: 100GB/month

2. **Upgrade Strategically**:
   - Upgrade Sentry when hitting error limits
   - Upgrade UptimeRobot for faster checks
   - Add paid logging when log volume increases

3. **Sample Wisely**:
   - Set Sentry trace sample rate to 0.1-0.2 (10-20%)
   - Use conditional error capture
   - Filter out known/expected errors

4. **Monitor Usage**:
   - Review Sentry quota usage weekly
   - Check log aggregation volume
   - Optimize noisy error sources

## Best Practices

### 1. Error Budget

Define acceptable error rates:
- 99.9% uptime target = 43 minutes downtime/month
- < 0.1% error rate for API requests
- < 5% failed uploads

### 2. Alert Fatigue Prevention

- Use alert throttling
- Set appropriate thresholds
- Group related alerts
- Implement auto-resolution

### 3. Privacy and Compliance

```typescript
// Sanitize sensitive data before logging
function sanitizeLogData(data: any) {
  const sanitized = { ...data };

  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.creditCard;

  // Mask email
  if (sanitized.email) {
    sanitized.email = sanitized.email.replace(
      /(.{2}).*(@.*)$/,
      '$1***$2'
    );
  }

  return sanitized;
}
```

### 4. Performance Budgets

Set performance budgets:
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- API response time < 500ms

### 5. Regular Review

- Weekly: Review error trends
- Monthly: Analyze performance metrics
- Quarterly: Audit alert configurations

## Production Monitoring Checklist

### Pre-Launch Setup

- [ ] **Sentry Configuration**
  - [ ] Account created and project set up
  - [ ] SDK installed (@sentry/nextjs)
  - [ ] Environment variables configured in Vercel
  - [ ] Error boundary implemented
  - [ ] Source maps upload configured
  - [ ] Alert rules created
  - [ ] Slack integration configured
  - [ ] Tested error tracking in staging

- [ ] **Uptime Monitoring**
  - [ ] UptimeRobot account created
  - [ ] Main site monitor configured (5-min interval)
  - [ ] API health monitor configured
  - [ ] Critical endpoint monitors added
  - [ ] Alert contacts configured (email, Slack)
  - [ ] Status page created (optional)
  - [ ] Test monitors with downtime simulation

- [ ] **Health Check Endpoints**
  - [ ] /api/health endpoint created
  - [ ] /api/health/db endpoint created
  - [ ] /api/health/redis endpoint created
  - [ ] Endpoints tested and verified
  - [ ] Added to UptimeRobot monitors

- [ ] **Analytics Setup**
  - [ ] Vercel Analytics enabled
  - [ ] @vercel/analytics package installed
  - [ ] Analytics component added to layout
  - [ ] Vercel Speed Insights enabled
  - [ ] @vercel/speed-insights package installed
  - [ ] Custom events implemented
  - [ ] Tested in production

- [ ] **Alert Configuration**
  - [ ] Slack webhook configured
  - [ ] Email alerts configured
  - [ ] Alert severity levels defined
  - [ ] Alert throttling configured
  - [ ] Test alerts sent and verified

- [ ] **Documentation**
  - [ ] Incident response plan documented
  - [ ] Runbooks created for common issues
  - [ ] Team contact list updated
  - [ ] Monitoring dashboard URLs documented

### Week 1 Post-Launch

- [ ] Monitor error rate daily
- [ ] Review slow query logs
- [ ] Check uptime percentage (target: 99.9%)
- [ ] Verify all alerts functioning
- [ ] Review Sentry dashboard
- [ ] Check API response times
- [ ] Monitor database connection pool
- [ ] Test incident response procedures
- [ ] Review Core Web Vitals
- [ ] Analyze user traffic patterns

### Ongoing Monthly

- [ ] Review incident reports and post-mortems
- [ ] Analyze error trends and patterns
- [ ] Update alert thresholds as needed
- [ ] Optimize slow database queries
- [ ] Review monitoring costs and usage
- [ ] Update monitoring documentation
- [ ] Test disaster recovery procedures
- [ ] Review and update runbooks
- [ ] Check for monitoring tool updates
- [ ] Conduct team training on monitoring tools

### Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Uptime | 99.9% | 99.5% |
| Error Rate | < 0.1% | < 1% |
| API Response Time (p95) | < 500ms | < 1000ms |
| Database Query Time (avg) | < 50ms | < 200ms |
| Page Load Time (LCP) | < 2.5s | < 4s |
| Redis Hit Rate | > 80% | > 60% |

## Additional Resources

### Documentation
- [Sentry Documentation](https://docs.sentry.io/)
- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [Axiom Documentation](https://axiom.co/docs)
- [Web Vitals](https://web.dev/vitals/)
- [Uptime Robot Guide](https://uptimerobot.com/guide/)
- [Better Uptime Docs](https://docs.betteruptime.com/)

### Quick Links

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Sentry Dashboard | https://sentry.io |
| UptimeRobot Dashboard | https://uptimerobot.com/dashboard |
| Health Check | https://hablas.vercel.app/api/health |
| Database Health | https://hablas.vercel.app/api/health/db |
| Redis Health | https://hablas.vercel.app/api/health/redis |

## Support

### For Monitoring Tool Issues
- **Sentry**: [support@sentry.io](mailto:support@sentry.io) | [Sentry Help Center](https://help.sentry.io/)
- **Vercel**: [vercel.com/support](https://vercel.com/support) | [Vercel Discord](https://vercel.com/discord)
- **UptimeRobot**: [support@uptimerobot.com](mailto:support@uptimerobot.com)
- **Axiom**: [support@axiom.co](mailto:support@axiom.co)

### For Hablas Production Issues
1. Check monitoring dashboards (Sentry, Vercel, UptimeRobot)
2. Review alert configurations
3. Consult incident response plan
4. Check relevant runbooks
5. Contact development team if needed

## Next Steps

1. **Immediate (Today)**:
   - Set up Sentry account and install SDK
   - Configure UptimeRobot monitors
   - Create health check endpoints
   - Set up Slack webhook

2. **This Week**:
   - Implement error tracking in all API routes
   - Set up alert rules and test notifications
   - Create monitoring dashboard
   - Document incident response procedures

3. **This Month**:
   - Review and optimize alert thresholds
   - Conduct incident response drill
   - Set up log aggregation (Axiom/Logtail)
   - Create custom monitoring dashboard

4. **Ongoing**:
   - Monitor metrics daily
   - Review incidents weekly
   - Update documentation monthly
   - Optimize monitoring costs quarterly

---

**Critical**: At minimum, set up Sentry (error tracking) and UptimeRobot (uptime monitoring) before launching to production. These provide essential visibility into application health and user-impacting issues.
