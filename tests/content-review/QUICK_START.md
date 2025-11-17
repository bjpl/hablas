# Quick Start Guide - Content Review Tool Tests

## Run Tests Immediately

```bash
# Run all content review tests
npm test -- tests/content-review

# Run specific test file
npm test ContentReviewTool.test
npm test ComparisonView.test
npm test EditPanel.test
npm test useAutoSave.test
npm test useContentManager.test

# Watch mode (auto-run on file changes)
npm run test:watch -- tests/content-review

# Generate coverage report
npm run test:coverage -- tests/content-review
```

## Test Files Location

```
tests/content-review/
├── ContentReviewTool.test.tsx      # Main component (30 tests)
├── ComparisonView.test.tsx         # Read-only panel (23 tests)
├── EditPanel.test.tsx              # Edit panel (29 tests)
├── hooks/
│   ├── useAutoSave.test.ts         # Auto-save hook (19 tests)
│   └── useContentManager.test.ts   # State management (29 tests)
├── README.md                       # Full documentation
├── COVERAGE_SUMMARY.md             # Detailed coverage report
└── QUICK_START.md                  # This file
```

## What's Tested

### Components (82 tests)
✅ Rendering with/without content
✅ Save functionality (manual + auto)
✅ Edit operations
✅ Dirty state tracking
✅ Error handling
✅ Character/word counting
✅ Accessibility features

### Hooks (48 tests)
✅ Auto-save debouncing
✅ Content state management
✅ Dirty flag tracking
✅ Cleanup and error recovery

### Edge Cases
✅ Empty content
✅ Very long content (100,000+ chars)
✅ Special characters & unicode
✅ Rapid state changes
✅ Error scenarios

## Expected Results

**Total Tests:** 130
**Expected Coverage:** 94%+
**Test Duration:** ~5-10 seconds

## Troubleshooting

### Tests timeout
```bash
# Increase timeout
npm test -- tests/content-review --testTimeout=120000
```

### Mock errors
```bash
# Clear jest cache
npm test -- --clearCache
```

### Type errors
```bash
# Run type checking
npm run typecheck
```

## Next Steps

1. Run tests: `npm test -- tests/content-review`
2. Review coverage: `npm run test:coverage`
3. Read detailed docs: See `README.md`
4. Check metrics: See `COVERAGE_SUMMARY.md`

## Success Indicators

When tests run successfully, you should see:

```
PASS tests/content-review/ContentReviewTool.test.tsx
PASS tests/content-review/ComparisonView.test.tsx
PASS tests/content-review/EditPanel.test.tsx
PASS tests/content-review/hooks/useAutoSave.test.ts
PASS tests/content-review/hooks/useContentManager.test.ts

Test Suites: 5 passed, 5 total
Tests:       130 passed, 130 total
```

## Need Help?

- See full test documentation: `/tests/content-review/README.md`
- Review coverage details: `/tests/content-review/COVERAGE_SUMMARY.md`
- Check component source: `/components/content-review/`
