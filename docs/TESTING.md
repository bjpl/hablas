# Testing Guide

**Version**: 1.1.0
**Last Updated**: October 8, 2025

## Overview

This document provides comprehensive testing guidelines for the Hablas project. While automated testing infrastructure is being developed, manual testing procedures ensure quality and reliability.

## 🎯 Testing Philosophy

### Test Principles

1. **Mobile-First**: Test on mobile devices/emulation first
2. **Real-World Conditions**: Test on 3G/4G networks
3. **Colombian Context**: Test with Colombian Spanish settings
4. **Offline Capability**: Verify offline functionality
5. **Accessibility**: Ensure usability for all users

### Quality Standards

- **Performance**: 95+ Lighthouse score
- **Accessibility**: WCAG 2.1 AA compliance (target)
- **Mobile**: Works on budget Android phones
- **Network**: Functions on slow 3G connections
- **Browser**: Compatible with Chrome, Firefox, Safari

---

## 🧪 Manual Testing Procedures

### Pre-Deployment Checklist

Before every deployment, complete this checklist:

#### Build & Configuration
- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run lint` passes with no warnings
- [ ] `npm run build` completes successfully
- [ ] Build output shows expected bundle sizes
- [ ] No console errors or warnings in build output

#### Visual Testing
- [ ] Homepage loads correctly
- [ ] Resource library displays all resources
- [ ] Resource cards show correct information
- [ ] WhatsApp CTA button is visible and styled correctly
- [ ] Offline notice appears when offline
- [ ] Design system consistency across all pages

#### Functionality Testing
- [ ] Navigation works on all pages
- [ ] Resource download links function
- [ ] WhatsApp share button opens correct link
- [ ] Search/filter functionality (if implemented)
- [ ] All interactive elements respond to clicks/taps

#### Mobile Testing
- [ ] Layout is responsive (test 360px, 768px, 1024px)
- [ ] Touch targets are at least 48x48px
- [ ] Scrolling is smooth
- [ ] No horizontal scrolling on small screens
- [ ] Bottom navigation doesn't cover content

#### Performance Testing
- [ ] Pages load in < 2s on 4G
- [ ] Images load progressively
- [ ] No layout shift during load
- [ ] Smooth scrolling and animations
- [ ] Service Worker caches resources

#### Offline Testing
- [ ] Service Worker registers successfully
- [ ] Cached pages load offline
- [ ] Offline notice displays
- [ ] Downloaded resources accessible offline
- [ ] App doesn't crash when offline

---

## 🚀 Lighthouse Testing

### Running Lighthouse

```bash
# Build production version
npm run build

# Serve locally
npx serve -s out -p 3000

# Run Lighthouse (in new terminal)
lighthouse http://localhost:3000/hablas \
  --output html \
  --output-path ./lighthouse-report.html \
  --view
```

### Target Scores

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Performance | 95+ | 90+ |
| Accessibility | 90+ | 85+ |
| Best Practices | 95+ | 90+ |
| SEO | 90+ | 85+ |

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| FID (First Input Delay) | ≤ 100ms | 100ms - 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| FCP (First Contentful Paint) | ≤ 1.8s | 1.8s - 3.0s | > 3.0s |
| TBT (Total Blocking Time) | ≤ 200ms | 200ms - 600ms | > 600ms |

### Interpreting Results

**If scores are below target**:
1. Identify specific failing audits
2. Address highest-impact issues first
3. Re-run after each fix
4. Document changes in CHANGELOG.md

---

## 📱 Mobile Device Testing

### Test Devices

**Priority 1 (Must Test)**:
- Budget Android (360x640px, Android 10+)
- iPhone SE (375x667px, iOS 14+)
- Chrome DevTools mobile emulation

**Priority 2 (Nice to Have)**:
- Samsung Galaxy A12 (real device)
- Moto G Power (real device)
- iPad (tablet view)

### Mobile Test Checklist

#### Layout
- [ ] Content fits screen without horizontal scroll
- [ ] Text is readable without zooming
- [ ] Buttons are thumb-friendly (48x48px minimum)
- [ ] Forms are easy to fill on mobile keyboard

#### Performance
- [ ] Fast 3G: Page loads in < 5s
- [ ] Slow 3G: Page loads in < 10s
- [ ] Images load progressively
- [ ] No janky scrolling or animations

#### Usability
- [ ] One-handed operation possible
- [ ] Navigation is accessible
- [ ] No accidental taps (targets well-spaced)
- [ ] Keyboard doesn't obscure input fields

#### Network Conditions
- [ ] Test on WiFi
- [ ] Test on 4G
- [ ] Test on 3G (throttled)
- [ ] Test offline mode

### Chrome DevTools Mobile Testing

```javascript
// 1. Open DevTools (F12)
// 2. Click device toggle (Ctrl+Shift+M)
// 3. Select device preset or custom dimensions
// 4. Test with these presets:

// Budget Android
Dimensions: 360 x 640
DPR: 2
User Agent: Android

// Network throttling
// Fast 3G: 1.6 Mbps down, 750 Kbps up
// Slow 3G: 400 Kbps down, 400 Kbps up
```

---

## 🌐 Cross-Browser Testing

### Supported Browsers

| Browser | Minimum Version | Test Priority |
|---------|----------------|---------------|
| Chrome | 90+ | High |
| Firefox | 88+ | Medium |
| Safari | 14+ | Medium |
| Edge | 90+ | Low |
| Samsung Internet | 14+ | Low |

### Browser Test Checklist

- [ ] Layout renders correctly
- [ ] All features function
- [ ] CSS Grid/Flexbox work
- [ ] Service Worker registers
- [ ] Local storage works
- [ ] No console errors

### Testing Tools

**BrowserStack** (if available):
- Real device testing
- Multiple OS versions
- Screenshot comparisons

**Manual Testing**:
- Use actual devices when possible
- Test with dev tools
- Verify vendor prefixes

---

## ♿ Accessibility Testing

### Quick Accessibility Checks

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] No keyboard traps
- [ ] Skip links work (if implemented)

#### Screen Reader Testing
- [ ] Images have alt text
- [ ] Links have descriptive text
- [ ] Headings are hierarchical (H1, H2, H3...)
- [ ] ARIA labels are present where needed
- [ ] Form inputs have labels

#### Color & Contrast
- [ ] Text contrast ratio ≥ 4.5:1 (normal text)
- [ ] Text contrast ratio ≥ 3:1 (large text)
- [ ] UI elements visible to colorblind users
- [ ] No color-only information

### Tools

**Lighthouse Accessibility Audit**:
```bash
lighthouse http://localhost:3000/hablas --only-categories=accessibility --view
```

**axe DevTools** (Chrome Extension):
- Automated accessibility testing
- Real-time issue detection
- Guided fixes

**WAVE** (Web Accessibility Evaluation Tool):
- Visual accessibility feedback
- Error/warning identification
- Structure analysis

**Manual Testing**:
- Windows: NVDA screen reader (free)
- macOS: VoiceOver (built-in)
- Android: TalkBack
- iOS: VoiceOver

---

## 🔍 Component Testing

### Component Test Checklist

For each React component:

#### Rendering
- [ ] Component renders without errors
- [ ] Props are properly typed
- [ ] Default props work correctly
- [ ] Conditional rendering works

#### Interactivity
- [ ] Click handlers fire
- [ ] State updates correctly
- [ ] Callbacks receive correct arguments
- [ ] No memory leaks (unmounting)

#### Performance
- [ ] Component uses React.memo (if applicable)
- [ ] Event handlers use useCallback
- [ ] Expensive operations use useMemo
- [ ] No unnecessary re-renders

### Example Component Test

```typescript
// Manual test procedure for ResourceCard component

// 1. Visual Test
// - Renders with correct title, description
// - Shows correct tags
// - Displays file size
// - Shows download icon

// 2. Interaction Test
// - Click opens download URL
// - Hover shows correct state
// - Touch events work on mobile

// 3. Edge Cases
// - Long titles don't break layout
// - Missing tags don't cause errors
// - Invalid URLs are handled
```

---

## 📊 Performance Testing

### Bundle Size Testing

```bash
# Build and analyze bundle
npm run build

# Check output
# Look for:
# - First Load JS: Should be < 100kB
# - Total bundle size
# - Code splitting effectiveness
```

### Performance Monitoring

**Chrome DevTools Performance Tab**:
1. Open DevTools → Performance
2. Record while loading page
3. Analyze:
   - Long tasks (> 50ms)
   - Layout shifts
   - Paint times
   - JavaScript execution

**Network Tab**:
1. Open DevTools → Network
2. Throttle to Fast 3G
3. Reload and measure:
   - Total load time
   - Resource sizes
   - Number of requests
   - Waterfall timing

---

## 🧪 Resource Generation Testing

### AI Generation Quality Checks

After running AI generation:

#### Content Quality
- [ ] English phrases are natural and practical
- [ ] Spanish translations are accurate
- [ ] Phonetic pronunciations are correct
- [ ] Usage contexts are appropriate
- [ ] Examples are realistic

#### Format Validation
- [ ] Markdown formatting is correct
- [ ] Headings are hierarchical
- [ ] Lists are properly formatted
- [ ] Tables render correctly
- [ ] Code blocks display properly

#### Technical Validation
```bash
# Run validation
npm run resource:validate

# Check for:
# - All required fields present
# - Correct data types
# - Valid file sizes
# - Appropriate tags
# - Category/level consistency
```

#### Quality Scoring
- **90-100**: Excellent, ready for production
- **80-89**: Good, minor edits needed
- **70-79**: Acceptable, moderate edits needed
- **<70**: Needs regeneration or major revision

---

## 🔒 Security Testing

### Security Checklist

#### Environment Variables
- [ ] No secrets in source code
- [ ] `.env` file not committed
- [ ] Environment variables validated
- [ ] API keys properly secured

#### Input Validation
- [ ] User inputs are sanitized
- [ ] Form validation works
- [ ] XSS protection in place
- [ ] SQL injection N/A (static site)

#### Headers & Configuration
- [ ] Security headers present
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] CSP headers (if applicable)

### Tools

**npm audit**:
```bash
npm audit
# Should show 0 vulnerabilities
```

**Dependency Check**:
```bash
npm outdated
# Review and update critical dependencies
```

---

## 📝 Test Documentation

### Recording Test Results

Create a test report for each release:

```markdown
# Test Report - v1.1.0
Date: October 8, 2025
Tester: [Name]

## Summary
- [ ] All critical tests passed
- [ ] Performance targets met
- [ ] Accessibility score acceptable
- [ ] Mobile functionality verified

## Lighthouse Scores
- Performance: 96
- Accessibility: 92
- Best Practices: 95
- SEO: 91

## Issues Found
1. [Description] - Severity: [Low/Medium/High]
   Status: [Fixed/Pending/Won't Fix]

## Browser Compatibility
- Chrome 118: ✅ Pass
- Firefox 119: ✅ Pass
- Safari 17: ✅ Pass

## Mobile Testing
- Android (Chrome): ✅ Pass
- iOS (Safari): ✅ Pass
- Slow 3G: ✅ Pass
```

### Test Artifacts

Save these files for each release:
- Lighthouse HTML report
- Screenshots of major pages
- Mobile device screenshots
- Accessibility audit results
- Performance recordings

---

## 🚀 Continuous Testing

### Weekly Tests

- Run Lighthouse audit
- Check bundle size
- Test on real mobile device
- Review any error logs

### Monthly Tests

- Full accessibility audit
- Cross-browser testing
- Security dependency check
- Performance regression testing

### Pre-Release Tests

- Complete manual test checklist
- Lighthouse scores meet targets
- Mobile testing on real devices
- Accessibility compliance verified

---

## 🤖 Future: Automated Testing

### Planned Test Infrastructure

**Unit Tests** (Jest + React Testing Library):
```typescript
// Example structure
describe('ResourceCard', () => {
  it('renders with correct props', () => {})
  it('handles click events', () => {})
  it('displays offline indicator', () => {})
})
```

**Integration Tests** (Playwright):
```typescript
// Example structure
test('user can browse and download resources', async ({ page }) => {
  await page.goto('/hablas')
  await page.click('[data-testid="resource-card"]')
  // ... more assertions
})
```

**E2E Tests** (Cypress):
```typescript
// Example structure
describe('Resource Download Flow', () => {
  it('allows user to download PDF', () => {
    cy.visit('/recursos')
    cy.contains('Frases Básicas').click()
    // ... more steps
  })
})
```

### Test Coverage Goals

- Unit Tests: 80%+ coverage
- Integration Tests: Critical user flows
- E2E Tests: Main user journeys
- Visual Regression: All components

---

## 📚 Resources

### Testing Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [WAVE Accessibility Tool](https://wave.webaim.org/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

### Documentation
- [Next.js Testing](https://nextjs.org/docs/testing)
- [React Testing Library](https://testing-library.com/react)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🆘 Support

### Questions?
- Review this guide thoroughly
- Check project documentation
- Open GitHub Discussion
- Contact project maintainer

### Found a Bug?
- Document steps to reproduce
- Include screenshots/videos
- Note device and browser
- Open GitHub Issue

---

**Last Updated**: October 8, 2025
**Version**: 1.1.0
**Status**: Active

*Hecho con ❤️ en Medellín para toda Colombia*
