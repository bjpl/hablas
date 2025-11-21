# Comprehensive Test Suite

This directory contains comprehensive tests for all newly implemented features with 90%+ code coverage target.

## Test Files

### 1. Content Fetchers (`lib/content-fetchers.test.ts`)
Tests for PDF, Web, and Audio content fetching utilities with caching and retry logic.

**Coverage:**
- ✅ PDF content fetching
- ✅ Web content fetching
- ✅ Audio transcript fetching from Blob Storage
- ✅ Caching behavior
- ✅ Error handling and retry logic
- ✅ File upload/download operations
- ✅ URL resolution
- ✅ File validation
- ✅ Concurrent request handling

**Key Test Scenarios:**
- Upload audio files to Vercel Blob Storage
- Delete audio files
- Fetch audio metadata
- List audio files with pagination
- Client-side API helpers
- Filename sanitization
- Content type detection
- Error recovery
- Network timeout handling
- Malformed response handling

### 2. Triple Comparison View (`components/triple-comparison/TripleComparisonView.test.tsx`)
Integration tests for the Triple Comparison component.

**Coverage:**
- ✅ Content loading from all sources (PDF, Web, Audio)
- ✅ Diff calculation between panels
- ✅ Panel synchronization
- ✅ Unsaved changes tracking
- ✅ Error states
- ✅ Save functionality
- ✅ Cancel functionality
- ✅ Accessibility (jest-axe)

**Key Test Scenarios:**
- Render all three content panels
- Load content from downloadable, web, and audio sources
- Select two panels for side-by-side comparison
- Prevent selecting more than two panels
- Calculate and display diffs
- Sync content between panels
- Track dirty/modified state
- Save all changes
- Handle save errors
- Keyboard navigation
- ARIA labels and roles

### 3. Enhanced Audio Player (`components/AudioPlayer.enhanced.test.tsx`)
Comprehensive tests for the audio player component.

**Coverage:**
- ✅ Playback controls (play, pause, seek)
- ✅ URL resolution from Blob Storage
- ✅ Error recovery
- ✅ Accessibility features
- ✅ Keyboard shortcuts
- ✅ Time formatting
- ✅ Progress tracking
- ✅ Autoplay functionality

**Key Test Scenarios:**
- Load audio from Blob Storage URL
- Play/pause toggle
- Seek to specific time
- Display current time and duration
- Handle playback end
- Error handling and recovery
- ARIA labels for screen readers
- Keyboard navigation support
- Custom vs native controls
- Loading and error states
- Edge cases (null ref, rapid clicks)
- Performance optimization

### 4. Error Boundaries (`components/error-boundaries/ErrorBoundary.test.tsx`)
Tests for error boundary component.

**Coverage:**
- ✅ Error catching from child components
- ✅ Retry mechanism
- ✅ Fallback UI
- ✅ Error logging
- ✅ Accessibility
- ✅ State management
- ✅ React lifecycle integration

**Key Test Scenarios:**
- Catch rendering errors
- Catch errors in event handlers
- Display fallback UI
- Custom fallback support
- Reset error state (retry)
- Reload page functionality
- Navigate to home
- Console error logging
- ARIA alerts
- Keyboard navigation
- Development vs production modes
- Nested error boundaries
- Multiple sequential errors

### 5. Test Utilities (`test-utils/mocks.ts`)
Centralized mocks and utilities for testing.

**Utilities Provided:**
- ✅ Mock Audio Metadata factory
- ✅ Mock File factory
- ✅ Mock Fetch Response
- ✅ Mock Blob Storage functions
- ✅ Mock Audio Element
- ✅ Mock localStorage
- ✅ Mock IntersectionObserver
- ✅ Mock ResizeObserver
- ✅ Mock matchMedia
- ✅ Console mocking utilities
- ✅ Retry utilities for flaky tests
- ✅ Async wait helpers

## Running Tests

### Run All New Tests
```bash
npm test -- --testPathPatterns="content-fetchers|TripleComparisonView|AudioPlayer.enhanced|ErrorBoundary"
```

### Run Specific Test Suite
```bash
# Content Fetchers
npm test -- __tests__/lib/content-fetchers.test.ts

# Triple Comparison
npm test -- __tests__/components/triple-comparison/TripleComparisonView.test.tsx

# Audio Player
npm test -- __tests__/components/AudioPlayer.enhanced.test.tsx

# Error Boundary
npm test -- __tests__/components/error-boundaries/ErrorBoundary.test.tsx
```

### Run with Coverage
```bash
npm run test:coverage -- --testPathPatterns="content-fetchers|TripleComparisonView|AudioPlayer.enhanced|ErrorBoundary"
```

### Watch Mode
```bash
npm run test:watch -- --testPathPatterns="content-fetchers"
```

## Test Coverage Goals

All test suites target **90%+ code coverage**:
- ✅ Statements: >90%
- ✅ Branches: >85%
- ✅ Functions: >90%
- ✅ Lines: >90%

## Test Patterns Used

### Unit Tests
- Individual function testing
- Mock external dependencies
- Isolated component testing

### Integration Tests
- Component interaction testing
- API integration testing
- State management testing

### Accessibility Tests
- jest-axe for WCAG compliance
- ARIA attribute validation
- Keyboard navigation testing
- Screen reader compatibility

### Error Handling Tests
- Error boundary testing
- Network error simulation
- Timeout handling
- Retry logic verification

## Best Practices Followed

1. **AAA Pattern**: Arrange, Act, Assert
2. **Descriptive Names**: Clear test descriptions
3. **One Assertion Per Test**: Focused test cases
4. **Mock External Dependencies**: Isolated testing
5. **Test Data Builders**: Reusable factories
6. **Accessibility First**: jest-axe integration
7. **Edge Case Coverage**: Boundary conditions
8. **Performance Testing**: Timeout and debounce tests

## Dependencies

Required test dependencies (from package.json):
- `jest` (v30.2.0)
- `@testing-library/react` (v16.3.0)
- `@testing-library/jest-dom` (v6.9.1)
- `@testing-library/user-event` (v14.6.1)
- `jest-axe` (v10.0.0)
- `jest-environment-jsdom` (v30.2.0)
- `ts-jest` (v29.4.4)

## Mock APIs

External APIs are mocked in tests:
- Vercel Blob Storage (`@vercel/blob`)
- Fetch API (global.fetch)
- HTMLMediaElement (audio/video)
- Browser APIs (localStorage, IntersectionObserver, etc.)

## Continuous Integration

Tests can be run in CI with:
```bash
npm run test:ci
```

This runs tests with:
- Maximum 2 workers
- Coverage reporting
- CI-optimized output

## Troubleshooting

### Tests Not Found
Ensure jest can find test files:
```bash
npm test -- --listTests
```

### Coverage Not Generated
Use the correct config:
```bash
npm run test:coverage:client  # For client-side tests
npm run test:coverage:server  # For server-side tests
```

### Mock Errors
Clear jest cache:
```bash
npx jest --clearCache
```

## Future Enhancements

- [ ] Visual regression testing
- [ ] E2E tests with Playwright
- [ ] Performance benchmarking
- [ ] Snapshot testing for UI components
- [ ] Mutation testing
- [ ] Load testing for API endpoints

## Contributing

When adding new tests:
1. Follow existing patterns
2. Include accessibility tests
3. Test error scenarios
4. Add edge case coverage
5. Update this README
6. Ensure 90%+ coverage

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
