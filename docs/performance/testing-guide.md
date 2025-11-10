# Performance Testing Guide

## Quick Start Testing

### 1. Install Testing Tools

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Install additional performance tools
npm install -g web-vitals-cli
npm install -g bundlesize
```

### 2. Run Local Performance Tests

```bash
# Build the production version
npm run build

# Serve the production build locally
npx serve -s out -p 3000

# Run Lighthouse
lighthouse http://localhost:3000/hablas \
  --output html \
  --output-path ./docs/performance/lighthouse-results.html \
  --view
```

### 3. Analyze Bundle Size

```bash
# Analyze the build
npm run build

# Check bundle sizes
ls -lh out/_next/static/chunks/
```

## Chrome DevTools Performance Testing

### 1. Network Performance

**Steps**:
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Enable throttling (Fast 3G or Slow 3G)
4. Reload page (Ctrl+R)
5. Analyze waterfall

**What to Look For**:
- Total requests: < 50
- Total size: < 1 MB
- Load time: < 3s on 3G
- Time to first byte: < 200ms

### 2. Performance Profiling

**Steps**:
1. Open Performance tab
2. Click record
3. Reload page
4. Stop recording
5. Analyze timeline

**What to Look For**:
- Long tasks (> 50ms)
- Layout shifts
- JavaScript execution time
- Paint events

### 3. Coverage Analysis

**Steps**:
1. Open Coverage tab (Cmd+Shift+P → "Coverage")
2. Click record
3. Interact with page
4. Stop recording
5. Review unused code

**Target**:
- Unused JavaScript: < 30%
- Unused CSS: < 20%

## Performance Checklist

### Before Testing
- [ ] Build production version
- [ ] Clear browser cache
- [ ] Close other tabs
- [ ] Disable extensions
- [ ] Use incognito mode

### During Testing
- [ ] Test on slow 3G
- [ ] Test on fast 3G
- [ ] Test on 4G
- [ ] Test on WiFi
- [ ] Test offline mode

### Metrics to Record
- [ ] First Contentful Paint (FCP)
- [ ] Largest Contentful Paint (LCP)
- [ ] Time to Interactive (TTI)
- [ ] Total Blocking Time (TBT)
- [ ] Cumulative Layout Shift (CLS)

## Real User Monitoring (RUM)

### Web Vitals Implementation

Add to `app/layout.tsx`:

```typescript
'use client'

import { useEffect } from 'react'

export function WebVitals() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log)
        getFID(console.log)
        getFCP(console.log)
        getLCP(console.log)
        getTTFB(console.log)
      })
    }
  }, [])

  return null
}
```

## Automated Testing

### GitHub Actions Workflow

```yaml
name: Performance Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000/hablas
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

### Lighthouse Budget

Create `lighthouse-budget.json`:

```json
{
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 200
    },
    {
      "resourceType": "stylesheet",
      "budget": 50
    },
    {
      "resourceType": "image",
      "budget": 500
    },
    {
      "resourceType": "total",
      "budget": 1000
    }
  ],
  "timings": [
    {
      "metric": "first-contentful-paint",
      "budget": 1800
    },
    {
      "metric": "largest-contentful-paint",
      "budget": 2500
    },
    {
      "metric": "interactive",
      "budget": 3500
    }
  ]
}
```

## Performance Regression Testing

### 1. Baseline Metrics

Record baseline after optimizations:

```bash
# Run and save baseline
lighthouse http://localhost:3000/hablas \
  --output json \
  --output-path baseline.json
```

### 2. Compare Against Baseline

```bash
# Run new test
lighthouse http://localhost:3000/hablas \
  --output json \
  --output-path current.json

# Compare (manual for now)
diff baseline.json current.json
```

### 3. Set Alerts

If any metric degrades by > 10%, investigate immediately.

## Mobile Performance Testing

### Android Testing

```bash
# Connect Android device via USB
# Enable USB debugging

# Install Lighthouse
npm install -g lighthouse

# Run on device
lighthouse http://your-domain.com/hablas \
  --port 9222 \
  --chrome-flags="--remote-debugging-port=9222"
```

### iOS Testing

Use Safari Web Inspector:
1. Enable Web Inspector on iOS device
2. Connect to Mac
3. Safari → Develop → [Device] → [Page]
4. Use Timelines to profile

## Performance Monitoring Dashboard

### Key Metrics to Track

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| FCP | < 1.8s | - | ⏳ |
| LCP | < 2.5s | - | ⏳ |
| TBT | < 200ms | - | ⏳ |
| CLS | < 0.1 | - | ⏳ |
| Lighthouse Score | 95+ | - | ⏳ |

### Weekly Tracking

Create weekly performance reports:

```markdown
## Week of [Date]

### Metrics
- FCP: X.Xs (Target: 1.8s)
- LCP: X.Xs (Target: 2.5s)
- TBT: Xms (Target: 200ms)
- CLS: 0.XX (Target: 0.1)

### Issues Found
1. [Issue description]
2. [Issue description]

### Optimizations Made
1. [Optimization description]
2. [Optimization description]

### Next Steps
1. [Next action]
2. [Next action]
```

## Troubleshooting Performance Issues

### Slow Page Load

**Check**:
1. Network waterfall for blocking resources
2. Bundle size (should be < 200KB JS)
3. Number of requests (should be < 50)
4. Server response time (should be < 200ms)

**Fix**:
1. Code splitting
2. Lazy loading
3. Image optimization
4. CDN usage

### High Layout Shift

**Check**:
1. Images without dimensions
2. Dynamic content insertion
3. Web fonts loading

**Fix**:
1. Set explicit width/height
2. Reserve space for dynamic content
3. Use font-display: swap

### Poor Interaction

**Check**:
1. Long tasks in main thread
2. Heavy JavaScript execution
3. Third-party scripts

**Fix**:
1. Code splitting
2. Defer non-critical JS
3. Web workers for heavy tasks

---

**Testing Frequency**: Weekly
**Last Test Date**: 2025-09-30
**Next Test Date**: 2025-10-07
