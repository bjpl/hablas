# Content Review Tool - Test Suite

## Overview

Comprehensive test suite for the Content Review Tool component system, providing side-by-side content comparison and editing capabilities.

## Test Coverage

### Components

#### ContentReviewTool.test.tsx
Main integration tests covering the complete content review workflow.

**Test Categories:**
- Component Rendering (6 tests)
- Save Functionality (8 tests)
- Auto-save Functionality (3 tests)
- User Interactions (3 tests)
- Metadata Display (4 tests)
- Edge Cases (6 tests)

**Total: 30 tests**

**Key Scenarios:**
- Initial rendering with/without content
- Manual save operations with success/error handling
- Auto-save debouncing and timing
- Dirty state tracking
- Metadata display (title, category, timestamps)
- Error message display
- Status indicators (saving, saved, error)

#### ComparisonView.test.tsx
Tests for the read-only comparison panel displaying original content.

**Test Categories:**
- Component Rendering (3 tests)
- Read-only Badge (3 tests)
- Content Display (4 tests)
- Character and Word Count (5 tests)
- Layout and Styling (3 tests)
- Edge Cases (5 tests)

**Total: 23 tests**

**Key Scenarios:**
- Title and content display
- Read-only badge visibility
- Empty content handling
- Character/word counting with edge cases
- Special character and unicode support
- Whitespace handling

#### EditPanel.test.tsx
Tests for the editable content panel with auto-save indicators.

**Test Categories:**
- Component Rendering (4 tests)
- User Interactions (5 tests)
- Dirty State Indicator (4 tests)
- Character and Word Count (5 tests)
- Textarea Auto-resize (2 tests)
- Accessibility (3 tests)
- Edge Cases (6 tests)

**Total: 29 tests**

**Key Scenarios:**
- Textarea editing and updates
- onChange callback handling
- Dirty state indicators
- Auto-saving status display
- Character/word count updates
- Accessibility features (ARIA labels, keyboard navigation)
- Special content handling (unicode, long text, etc.)

### Hooks

#### useAutoSave.test.ts
Unit tests for the auto-save hook with debouncing logic.

**Test Categories:**
- Basic Functionality (3 tests)
- Debouncing (3 tests)
- Enabled/Disabled State (3 tests)
- Content Validation (4 tests)
- Error Handling (2 tests)
- Cleanup (2 tests)
- Complex Scenarios (2 tests)

**Total: 19 tests**

**Key Scenarios:**
- Debounced save after delay
- Multiple rapid changes handling
- Enable/disable toggle
- Null/unchanged content handling
- Error recovery
- Cleanup on unmount
- Timer management

#### useContentManager.test.ts
Unit tests for content state management and dirty tracking.

**Test Categories:**
- Initialization (3 tests)
- updateContent (8 tests)
- resetContent (3 tests)
- resetDirty (4 tests)
- Complex Workflows (3 tests)
- Edge Cases (6 tests)
- State Consistency (2 tests)

**Total: 29 tests**

**Key Scenarios:**
- Content initialization
- Partial updates
- Metadata merging
- Dirty flag management
- Content reset workflows
- Long content and special characters
- State consistency across operations

## Total Test Count

- **Components:** 82 tests
- **Hooks:** 48 tests
- **Overall Total:** 130 tests

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test File
```bash
npm test ContentReviewTool.test
npm test ComparisonView.test
npm test EditPanel.test
npm test useAutoSave.test
npm test useContentManager.test
```

## Test Utilities

### Setup
- Jest with jsdom environment
- React Testing Library
- User Event library for interactions
- Fake timers for debounce testing

### Common Patterns

#### User Interaction Testing
```typescript
const user = userEvent.setup();
await user.type(textarea, 'text');
await user.click(button);
```

#### Async Operations
```typescript
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled();
});
```

#### Timer Testing
```typescript
jest.useFakeTimers();
jest.advanceTimersByTime(1000);
jest.useRealTimers();
```

## Coverage Goals

- **Statements:** >80%
- **Branches:** >75%
- **Functions:** >80%
- **Lines:** >80%

## Test Organization

Tests are organized by:
1. Component/Hook functionality
2. User interactions
3. Edge cases
4. Error handling
5. Accessibility

## Edge Cases Covered

- Empty content
- Very long content (>10,000 characters)
- Special characters and HTML
- Unicode characters (Chinese, Arabic, emojis)
- Null/undefined values
- Rapid state changes
- Multiple spaces and whitespace
- Concurrent operations

## Accessibility Testing

- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

## Future Enhancements

- [ ] Visual regression testing
- [ ] Performance benchmarks
- [ ] E2E integration tests
- [ ] Snapshot testing for complex renders
- [ ] Accessibility audit with jest-axe

## Maintenance

- Update tests when component APIs change
- Add tests for new features
- Maintain >80% coverage
- Review and update edge cases regularly
- Keep test documentation current
