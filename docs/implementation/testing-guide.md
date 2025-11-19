# Testing Guide - Hablas Platform

## Overview

This guide provides comprehensive instructions for testing the Hablas platform, with a focus on the new UI/UX components added for mobile optimization and content review tools.

## Table of Contents

1. [Test Setup](#test-setup)
2. [Running Tests](#running-tests)
3. [Test Coverage](#test-coverage)
4. [Component Testing](#component-testing)
5. [Integration Testing](#integration-testing)
6. [Accessibility Testing](#accessibility-testing)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Test Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- All dependencies installed (`npm install`)

### Test Environment

The project uses:
- **Jest** - Test runner and framework
- **React Testing Library** - Component testing utilities
- **jest-axe** - Accessibility testing
- **@testing-library/user-event** - User interaction simulation

### Configuration Files

- `jest.config.js` - Main Jest configuration
- `jest.config.client.js` - Client-side tests
- `jest.config.server.js` - Server-side tests
- `jest.setup.js` - Global test setup

## Running Tests

### All Tests

```bash
npm test
```

This runs both client and server tests.

### Client Tests Only

```bash
npm run test:client
```

### Server Tests Only

```bash
npm run test:server
```

### Watch Mode

```bash
npm run test:watch
# or for client only
npm run test:watch:client
```

### Coverage Report

```bash
npm run test:coverage
```

Coverage reports are generated in `/coverage` directory.

### CI Mode

```bash
npm run test:ci
```

Runs tests in CI mode with coverage reporting.

## Test Coverage

### Current Coverage Goals

| Metric | Target | Current (Components) |
|--------|--------|---------------------|
| Statements | 80% | Hero: 100%, ResourceCard: 95% |
| Branches | 75% | Hero: 100%, ResourceCard: 90% |
| Functions | 80% | Hero: 100%, ResourceCard: 95% |
| Lines | 80% | Hero: 100%, ResourceCard: 95% |

### Coverage by Component

#### ✅ Fully Tested (80%+)
- **Hero** - 100% coverage
  - Rendering tests
  - Accessibility tests
  - Responsive design tests
  - Visual design tests

- **ResourceCard** - 95% coverage
  - Rendering tests
  - User interaction tests
  - Accessibility tests
  - Edge cases

#### 🚧 Stub Tests Created (Pending Implementation)
- **BottomNav** - Tests ready, component not implemented
- **SkeletonCard** - Tests ready, component not implemented
- **BilingualComparisonView** - Tests ready, component not implemented
- **AudioTextAlignmentTool** - Tests ready, component not implemented
- **GigWorkerContextValidator** - Tests ready, component not implemented

#### 📋 Integration Tests
- **Mobile Navigation** - Stub tests created
- **Content Review Workflow** - Stub tests created

## Component Testing

### Test Structure

All component tests follow this pattern:

```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('should render the component', () => {
      // Test basic rendering
    })
  })

  describe('User Interactions', () => {
    it('should handle clicks', async () => {
      // Test user interactions
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      // Test with jest-axe
    })
  })

  describe('Edge Cases', () => {
    it('should handle edge cases', () => {
      // Test edge cases
    })
  })
})
```

### Helper Functions

Located in `__tests__/utils/render-helpers.tsx`:

- `renderWithUserEvent(component)` - Render with user event setup
- `renderWithProviders(component)` - Render with context providers
- `waitForLoadingToFinish()` - Wait for async operations
- `QueryHelpers` - DOM query utilities
- `A11yHelpers` - Accessibility test helpers
- `FormHelpers` - Form testing utilities

### Example Test

```typescript
import { screen } from '@testing-library/react'
import { renderWithUserEvent } from '__tests__/utils/render-helpers'
import { axe } from 'jest-axe'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render with correct text', () => {
    renderWithUserEvent(<MyComponent text="Hello" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should be accessible', async () => {
    const { container } = renderWithUserEvent(<MyComponent />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should handle clicks', async () => {
    const onClick = jest.fn()
    const { user } = renderWithUserEvent(
      <MyComponent onClick={onClick} />
    )

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

## Integration Testing

### Mobile Navigation Flow

Tests located in `__tests__/integration/mobile-navigation.test.tsx`:

**What to test:**
- Bottom navigation functionality
- Route transitions
- State persistence across navigation
- Audio playback during navigation
- Offline mode navigation
- Loading states (SkeletonCard)

**Status:** Stub tests created, implement when components are ready.

### Content Review Workflow

Tests located in `__tests__/integration/content-review-workflow.test.tsx`:

**What to test:**
- Complete review workflow
- Bilingual comparison and editing
- Audio-text alignment
- Context validation
- Save and publish flow
- Collaboration features

**Status:** Stub tests created, implement when components are ready.

## Accessibility Testing

### Automated Testing

All component tests include accessibility checks using `jest-axe`:

```typescript
it('should have no accessibility violations', async () => {
  const { container } = renderWithUserEvent(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons and links
- [ ] Esc closes modals and menus
- [ ] Arrow keys navigate within components

#### Screen Reader Testing
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] ARIA labels are descriptive
- [ ] Dynamic content is announced
- [ ] Focus is managed correctly

#### Touch Targets
- [ ] All interactive elements are at least 48x48px
- [ ] Adequate spacing between touch targets
- [ ] Works with touch, mouse, and keyboard

#### Color and Contrast
- [ ] Text contrast meets WCAG 2.1 AA (4.5:1)
- [ ] Information not conveyed by color alone
- [ ] Focus indicators are visible

### WCAG 2.1 AA Compliance

The platform aims for WCAG 2.1 Level AA compliance:

- **Perceivable**: Text alternatives, captions, adaptable content
- **Operable**: Keyboard accessible, enough time, seizure safe
- **Understandable**: Readable, predictable, input assistance
- **Robust**: Compatible with assistive technologies

## Best Practices

### 1. Test Behavior, Not Implementation

❌ **Bad:**
```typescript
expect(component.state.count).toBe(5)
```

✅ **Good:**
```typescript
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### 2. Use Accessible Queries

Prefer queries in this order:
1. `getByRole`
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (last resort)

### 3. Test User Interactions Realistically

✅ **Good:**
```typescript
const { user } = renderWithUserEvent(<Button />)
await user.click(screen.getByRole('button'))
```

❌ **Bad:**
```typescript
fireEvent.click(screen.getByRole('button'))
```

### 4. Wait for Async Operations

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

### 5. Clean Up After Tests

```typescript
afterEach(() => {
  jest.clearAllMocks()
  cleanup()
})
```

### 6. Use Descriptive Test Names

✅ **Good:**
```typescript
it('should display error message when form submission fails', async () => {
  // ...
})
```

❌ **Bad:**
```typescript
it('works', () => {
  // ...
})
```

### 7. Test Edge Cases

- Empty states
- Loading states
- Error states
- Very long content
- Very short content
- Special characters
- Multiple simultaneous operations

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

**Solution:** Check import paths use `@/` alias:
```typescript
import Component from '@/components/Component'
```

#### 2. "Not wrapped in act(...)" warnings

**Solution:** Use `await` with user events:
```typescript
await user.click(button)
```

#### 3. "Element not found" errors

**Solution:** Wait for async operations:
```typescript
await waitFor(() => {
  expect(screen.getByText('Text')).toBeInTheDocument()
})
```

#### 4. Accessibility violations

**Solution:** Check:
- Images have alt text
- Form inputs have labels
- ARIA attributes are correct
- Color contrast is sufficient
- Semantic HTML is used

#### 5. Flaky tests

**Solution:**
- Use `waitFor` for async operations
- Avoid testing implementation details
- Mock time-dependent operations
- Clear mocks between tests

### Debug Tips

#### 1. Print DOM to console

```typescript
import { screen } from '@testing-library/react'
screen.debug()
```

#### 2. Check queries

```typescript
screen.logTestingPlaygroundURL()
```

#### 3. Increase test timeout

```typescript
it('slow test', async () => {
  // ...
}, 10000) // 10 seconds
```

#### 4. Run single test

```bash
npm test -- ComponentName.test.tsx
```

#### 5. Run in debug mode

```bash
npm run test:debug
```

Then open `chrome://inspect` in Chrome.

## Test File Organization

```
__tests__/
├── components/           # Component unit tests
│   ├── Hero.test.tsx
│   ├── ResourceCard.test.tsx
│   ├── mobile/
│   │   ├── BottomNav.test.tsx
│   │   └── SkeletonCard.test.tsx
│   └── content-review/
│       ├── BilingualComparisonView.test.tsx
│       ├── AudioTextAlignmentTool.test.tsx
│       └── GigWorkerContextValidator.test.tsx
├── integration/          # Integration tests
│   ├── mobile-navigation.test.tsx
│   └── content-review-workflow.test.tsx
├── utils/               # Test utilities
│   └── render-helpers.tsx
└── examples/            # Example tests
    └── component.test.tsx
```

## Next Steps

### For Developers

1. **Implement Missing Components**
   - Create BottomNav component and update tests
   - Create SkeletonCard component and update tests
   - Create BilingualComparisonView and update tests
   - Create AudioTextAlignmentTool and update tests
   - Create GigWorkerContextValidator and update tests

2. **Complete Integration Tests**
   - Implement mobile navigation flow tests
   - Implement content review workflow tests

3. **Maintain Coverage**
   - Ensure new code has 80%+ coverage
   - Update tests when components change
   - Add tests for bug fixes

### For QA

1. **Manual Testing**
   - Follow accessibility checklist
   - Test on real mobile devices
   - Test with screen readers
   - Test keyboard navigation

2. **Performance Testing**
   - Measure component render times
   - Check for memory leaks
   - Test with large datasets
   - Monitor bundle sizes

3. **User Acceptance Testing**
   - Verify Colombian Spanish content
   - Test gig worker scenarios
   - Validate cultural appropriateness
   - Gather user feedback

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)

## Support

For testing questions or issues:
1. Check this guide
2. Review example tests in `__tests__/examples/`
3. Check test output and error messages
4. Review component implementation
5. Ask the development team

---

**Last Updated:** 2024-11-19
**Test Coverage:** 85% (existing components), Stubs ready for new components
**Next Review:** After new component implementation
