# Lighthouse Performance Testing Guide

## Running Lighthouse Tests

### 1. Chrome DevTools Method

```bash
# Open the application in Chrome
# Press F12 to open DevTools
# Navigate to "Lighthouse" tab
# Select "Performance" and "Best Practices"
# Click "Analyze page load"
```

### 2. Command Line Method

```bash
# Install Lighthouse globally
npm install -g lighthouse

# Run Lighthouse on the application
lighthouse https://your-domain.com/hablas \
  --output html \
  --output-path ./lighthouse-report.html \
  --view

# Run with mobile simulation
lighthouse https://your-domain.com/hablas \
  --preset=mobile \
  --output html \
  --view
```

### 3. CI/CD Integration

```yaml
# GitHub Actions example
name: Lighthouse CI
on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://your-domain.com/hablas
          uploadArtifacts: true
```

## Performance Budgets

### Critical Metrics

| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 1.8s | 2.5s |
| Largest Contentful Paint (LCP) | < 2.5s | 4.0s |
| Total Blocking Time (TBT) | < 200ms | 600ms |
| Cumulative Layout Shift (CLS) | < 0.1 | 0.25 |
| Speed Index | < 3.4s | 5.8s |

### Resource Budgets

| Resource Type | Budget |
|--------------|--------|
| JavaScript | 200 KB |
| CSS | 50 KB |
| Images | 500 KB |
| Fonts | 100 KB |
| Total | 1 MB |

## Test Scenarios

### 1. Desktop Performance
- Fast 3G network throttling
- No CPU throttling
- 1920x1080 viewport

### 2. Mobile Performance
- Slow 3G network throttling
- 4x CPU throttling
- 375x667 viewport

### 3. Offline Performance
- No network
- Service worker active
- Test cached resources

## Key Metrics to Monitor

### 1. Loading Performance
- **First Contentful Paint (FCP)**: When first content appears
- **Largest Contentful Paint (LCP)**: When main content is visible
- **Time to Interactive (TTI)**: When page is fully interactive

### 2. Interactivity
- **Total Blocking Time (TBT)**: Time main thread is blocked
- **First Input Delay (FID)**: Responsiveness to first interaction
- **Max Potential FID**: Worst-case input delay

### 3. Visual Stability
- **Cumulative Layout Shift (CLS)**: Visual stability score
- **Layout Shift Score**: Individual shift measurements

### 4. Progressive Enhancement
- **Progressive Web App Score**: PWA compliance
- **Service Worker**: Offline capability
- **Manifest**: App-like experience

## Optimization Checklist

### Critical Path
- [ ] Minimize render-blocking resources
- [ ] Defer non-critical CSS
- [ ] Async non-critical JavaScript
- [ ] Optimize critical rendering path

### Resources
- [ ] Compress images (WebP/AVIF)
- [ ] Enable text compression (gzip/brotli)
- [ ] Leverage browser caching
- [ ] Use CDN for static assets

### JavaScript
- [ ] Remove unused JavaScript
- [ ] Code splitting
- [ ] Tree shaking
- [ ] Minification

### CSS
- [ ] Remove unused CSS
- [ ] Inline critical CSS
- [ ] Defer non-critical CSS
- [ ] Minify CSS

### Images
- [ ] Use modern formats (WebP, AVIF)
- [ ] Implement lazy loading
- [ ] Proper sizing
- [ ] Compression

### Fonts
- [ ] Use font-display: swap
- [ ] Subset fonts
- [ ] Preload fonts
- [ ] Use system fonts when possible

## Expected Lighthouse Scores

### Production Build
```
Performance: 95+
Accessibility: 100
Best Practices: 95+
SEO: 100
PWA: 90+
```

### Development Build
```
Performance: 70-80 (expected lower due to dev tools)
Accessibility: 100
Best Practices: 90+
SEO: 100
PWA: 80+
```

## Troubleshooting Common Issues

### Low Performance Score
1. Check bundle size
2. Review network waterfall
3. Analyze main thread activity
4. Check third-party scripts

### High Layout Shift
1. Set explicit dimensions for images
2. Reserve space for ads/embeds
3. Avoid inserting content above existing content
4. Use transform instead of top/left

### Slow First Contentful Paint
1. Reduce server response time
2. Eliminate render-blocking resources
3. Minify CSS
4. Defer JavaScript

### Large Total Blocking Time
1. Break up long tasks
2. Optimize third-party scripts
3. Reduce JavaScript execution time
4. Use web workers for heavy computation

## Continuous Monitoring

### Weekly Audits
- Run Lighthouse tests
- Compare with baseline
- Document regressions
- Plan optimizations

### Production Monitoring
- Use Real User Monitoring (RUM)
- Track Core Web Vitals
- Set up alerts for regressions
- Monitor error rates

### Performance Reports
- Generate weekly reports
- Track trends over time
- Share with team
- Plan improvements

---

**Last Updated**: 2025-09-30
**Next Audit**: Weekly
**Baseline Score**: 95
