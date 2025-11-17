# Monitoring and Observability Setup Guide

## Overview

This guide covers comprehensive monitoring, error tracking, performance monitoring, and log aggregation for the Hablas application deployed on Vercel. Implementing robust monitoring ensures application reliability, quick issue resolution, and optimal user experience.

## Table of Contents

1. [Monitoring Strategy](#monitoring-strategy)
2. [Error Tracking with Sentry](#error-tracking-with-sentry)
3. [Vercel Analytics](#vercel-analytics)
4. [Performance Monitoring](#performance-monitoring)
5. [Log Aggregation](#log-aggregation)
6. [Alert Configuration](#alert-configuration)
7. [Monitoring Dashboard](#monitoring-dashboard)
8. [Best Practices](#best-practices)

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

### Uptime Monitoring

Use **Uptime Robot** for availability monitoring:

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Create monitors:

```yaml
# Main Site Monitor
URL: https://hablas.co
Interval: 5 minutes
Alert Contacts: team@hablas.co

# API Health Monitor
URL: https://hablas.co/api/health
Interval: 5 minutes
Keyword: "ok"

# Database Health Monitor
URL: https://hablas.co/api/health/db
Interval: 10 minutes
```

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

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Axiom Documentation](https://axiom.co/docs)
- [Web Vitals](https://web.dev/vitals/)
- [Uptime Robot Guide](https://uptimerobot.com/guide/)

## Support

For monitoring-related issues:
- Sentry: [support@sentry.io](mailto:support@sentry.io)
- Vercel: [vercel.com/support](https://vercel.com/support)
- Axiom: [axiom.co/support](https://axiom.co/support)

For Hablas-specific monitoring questions:
- Review monitoring dashboards
- Check alert configurations
- Contact development team
