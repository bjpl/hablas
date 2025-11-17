# Hablas Analytics Setup Guide

## Overview

This guide covers setting up comprehensive analytics for the Hablas platform to track user engagement, learning progress, and platform usage.

---

## 1. Vercel Web Analytics (Recommended - Built-in)

### Why Vercel Analytics?
- Zero-config integration with Next.js
- Privacy-friendly (no cookies required)
- Lightweight (< 1KB)
- GDPR & CCPA compliant
- No impact on Core Web Vitals

### Setup Steps

#### Step 1: Enable in Vercel Dashboard
1. Go to your project: https://vercel.com/your-team/hablas
2. Navigate to **Settings** > **Analytics**
3. Click **Enable Web Analytics**
4. Select plan:
   - **Hobby**: 100k events/month (Free)
   - **Pro**: 1M events/month ($10/month)
   - **Enterprise**: Unlimited (Custom pricing)

#### Step 2: Install Package
```bash
npm install @vercel/analytics
```

#### Step 3: Add to Root Layout
Edit `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
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

#### Step 4: Deploy
```bash
git add .
git commit -m "feat: Enable Vercel Web Analytics"
git push origin main
```

### What You'll Track
- Page views and unique visitors
- Top pages and referrers
- Geographic distribution
- Browser and device types
- Custom events (see below)

---

## 2. Vercel Speed Insights

### Why Speed Insights?
- Real User Monitoring (RUM) for Core Web Vitals
- Track actual user experience
- Identify performance bottlenecks
- Monitor loading times by page

### Setup Steps

#### Step 1: Enable in Vercel Dashboard
1. Go to **Settings** > **Speed Insights**
2. Click **Enable Speed Insights**
3. Pricing:
   - **Hobby**: 100 samples/day (Free)
   - **Pro**: 100k samples/month ($10/month)

#### Step 2: Install Package
```bash
npm install @vercel/speed-insights
```

#### Step 3: Add to Root Layout
Edit `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Metrics Tracked
- **LCP** (Largest Contentful Paint): Loading performance
- **FID** (First Input Delay): Interactivity
- **CLS** (Cumulative Layout Shift): Visual stability
- **TTFB** (Time to First Byte): Server response time
- **FCP** (First Contentful Paint): Perceived loading speed

---

## 3. Custom Event Tracking

### Track Learning Progress Events

Create `lib/analytics/events.ts`:
```typescript
import { track } from '@vercel/analytics';

export const analyticsEvents = {
  // Lesson Events
  lessonStarted: (topicId: string, lessonId: string) => {
    track('lesson_started', { topicId, lessonId });
  },

  lessonCompleted: (topicId: string, lessonId: string, duration: number) => {
    track('lesson_completed', { topicId, lessonId, duration });
  },

  // Exercise Events
  exerciseAttempted: (exerciseId: string, type: string) => {
    track('exercise_attempted', { exerciseId, type });
  },

  exerciseCompleted: (exerciseId: string, type: string, score: number) => {
    track('exercise_completed', { exerciseId, type, score });
  },

  // Audio Events
  audioPlayed: (audioId: string, speed: number) => {
    track('audio_played', { audioId, speed });
  },

  audioCompleted: (audioId: string, speed: number) => {
    track('audio_completed', { audioId, speed });
  },

  // Progress Events
  topicProgressUpdated: (topicId: string, progress: number) => {
    track('topic_progress', { topicId, progress });
  },

  // Search Events
  searchPerformed: (query: string, resultsCount: number) => {
    track('search', { query, resultsCount });
  },

  // Authentication Events
  userLogin: (method: string) => {
    track('user_login', { method });
  },

  userSignup: (method: string) => {
    track('user_signup', { method });
  },

  // Error Events
  errorOccurred: (errorType: string, page: string) => {
    track('error', { errorType, page });
  }
};
```

### Usage Example
```typescript
import { analyticsEvents } from '@/lib/analytics/events';

// In a lesson component
function handleLessonStart() {
  analyticsEvents.lessonStarted(topicId, lessonId);
  // ... rest of logic
}

function handleLessonComplete() {
  const duration = Date.now() - startTime;
  analyticsEvents.lessonCompleted(topicId, lessonId, duration);
  // ... rest of logic
}
```

---

## 4. Google Analytics 4 (Optional - Advanced)

### Why Add GA4?
- More detailed funnel analysis
- Custom dashboards and reports
- Integration with Google tools
- Advanced segmentation

### Setup with Next.js

#### Step 1: Create GA4 Property
1. Go to https://analytics.google.com
2. Create new property
3. Get Measurement ID (G-XXXXXXXXXX)

#### Step 2: Add to Environment Variables
```bash
# .env.local
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### Step 3: Create Analytics Component
Create `components/shared/GoogleAnalytics.tsx`:
```typescript
'use client';

import Script from 'next/script';

export function GoogleAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
```

#### Step 4: Add to Layout
```typescript
import { GoogleAnalytics } from '@/components/shared/GoogleAnalytics';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
```

---

## 5. Privacy & Compliance

### GDPR/CCPA Compliance

#### Cookie Consent Banner
Create `components/shared/CookieConsent.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm">
          We use analytics to improve your experience. By continuing, you agree to our use of cookies.
        </p>
        <button
          onClick={acceptCookies}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
```

### Privacy Policy
Ensure your privacy policy covers:
- What data is collected
- How it's used
- Third-party services (Vercel, GA4)
- User rights (access, deletion)
- Contact information

---

## 6. Key Metrics to Track

### User Engagement Metrics
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- Session duration
- Pages per session
- Bounce rate

### Learning Metrics
- Lessons started vs. completed
- Average lesson completion time
- Exercise success rate
- Topics completed
- Learning streak days
- Daily practice time

### Content Metrics
- Most popular topics
- Most completed lessons
- Audio playback rate
- Exercise completion rate
- Search queries

### Technical Metrics
- Page load times
- API response times
- Error rates
- Browser/device distribution
- Geographic distribution

---

## 7. Analytics Dashboard Recommendations

### Custom Dashboard Structure

#### 1. Overview Dashboard
- Total users (today, week, month)
- Active sessions
- Top pages
- Real-time visitors
- Geographic map

#### 2. Learning Dashboard
- Lessons completed (trend)
- Top topics
- Average completion rate
- Exercise scores
- Learning time distribution

#### 3. Performance Dashboard
- Core Web Vitals
- Page load times
- API latency
- Error rates
- Uptime percentage

#### 4. Engagement Dashboard
- User retention (cohorts)
- Feature usage
- Session duration
- Return visitor rate
- Conversion funnel

---

## 8. Analytics Checklist

### Pre-Launch
- [ ] Vercel Analytics enabled
- [ ] Speed Insights enabled
- [ ] Custom events implemented
- [ ] Privacy policy updated
- [ ] Cookie consent banner added
- [ ] GA4 configured (optional)
- [ ] Test events in development
- [ ] Verify data collection in staging

### Post-Launch
- [ ] Monitor analytics dashboard daily
- [ ] Set up weekly reports
- [ ] Review Core Web Vitals
- [ ] Analyze user behavior patterns
- [ ] Identify drop-off points
- [ ] A/B test improvements
- [ ] Export monthly reports
- [ ] Review and optimize

---

## 9. Cost Estimation

### Vercel Plans (for 1000 DAU)

| Plan | Analytics | Speed Insights | Total/Month |
|------|-----------|----------------|-------------|
| Hobby | Free (100k events) | Free (100 samples/day) | $0 |
| Pro | $10 (1M events) | $10 (100k samples) | $20 |

### Recommended Starting Plan
- **Hobby**: For first 3-6 months
- **Pro**: When you exceed limits or need more data

---

## 10. Support Resources

### Vercel Analytics
- Docs: https://vercel.com/docs/analytics
- Dashboard: https://vercel.com/dashboard/analytics
- Support: https://vercel.com/support

### Speed Insights
- Docs: https://vercel.com/docs/speed-insights
- Web Vitals: https://web.dev/vitals/

### Google Analytics
- Docs: https://developers.google.com/analytics/devguides/collection/ga4
- Dashboard: https://analytics.google.com

---

## Next Steps

1. ✅ Enable Vercel Analytics in dashboard
2. ✅ Install and configure packages
3. ✅ Implement custom event tracking
4. ✅ Add cookie consent banner
5. ✅ Test in staging environment
6. ✅ Deploy to production
7. ✅ Monitor for 7 days
8. ✅ Review data and optimize

**Questions or issues?** Check the monitoring setup guide for error tracking and alerting.
