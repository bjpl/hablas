# Triple Comparison Content Loading Implementation

## Overview

This document describes the implementation of real content loading in the Triple Comparison View component, replacing placeholder content with actual data from multiple sources.

## Implementation Date

November 21, 2025

## Architecture

### 1. Content Fetcher Utility (`/lib/utils/content-fetcher.ts`)

**Purpose**: Centralized utility for fetching content from various sources with retry logic and caching.

**Key Features**:
- **Automatic Retry**: Exponential backoff with configurable max retries (default: 3)
- **Content Caching**: In-memory cache with 5-minute expiry to reduce redundant requests
- **Parallel Fetching**: Fetches all content types simultaneously using `Promise.allSettled()`
- **Error Handling**: Graceful degradation with partial success support
- **Type Safety**: Full TypeScript support with proper error types

**Content Sources**:
1. **Downloadable PDF/Markdown**:
   - Primary: `/api/content/[id]` (includes cleaned content)
   - Fallback: Direct file access via `downloadUrl`

2. **Web Content**:
   - Currently same as downloadable
   - Architecture allows future differentiation

3. **Audio Transcripts**:
   - Derives URL from `downloadUrl` or `audioUrl`
   - Pattern: `*.md` → `*-audio-script.txt`
   - Returns empty string if not found (optional content)

**API**:
```typescript
// Main function
fetchResourceContent(
  resourceId: string,
  urls: { downloadableUrl?, webUrl?, audioUrl? },
  options?: FetchOptions
): Promise<FetchedContent>

// Cache management
clearContentCache(resourceId?: string): void
prefetchResourceContent(...): Promise<void>

// Error handling
getErrorMessage(error: unknown): string
```

### 2. Content Loader Hook (`/components/triple-comparison/hooks/useContentLoader.ts`)

**Purpose**: React hook for managing content loading state with modern React 18+ patterns.

**Modern Patterns Used**:
- **useTransition**: Non-urgent state updates for smoother UX
- **useDeferredValue**: Deferred content updates to prevent UI blocking
- **Parallel Async**: Loads all content types simultaneously

**Features**:
- Auto-load on mount (configurable)
- Loading and pending states
- Individual error tracking per content type
- Cache control
- Reload functionality

**API**:
```typescript
const {
  content,              // Latest content
  deferredContent,      // Deferred for smooth updates
  isLoading,            // Initial loading state
  isPending,            // Transition pending state
  error,                // Global error
  errors,               // Per-content-type errors
  loadContent,          // Manual load
  reloadContent,        // Reload with cache bypass
  clearCache,           // Clear cache
} = useContentLoader(options)
```

### 3. Error Boundary (`/components/triple-comparison/components/ErrorBoundary.tsx`)

**Purpose**: Catch and handle React errors gracefully with user-friendly UI.

**Features**:
- Automatic error catching
- User-friendly error messages
- Retry functionality
- Reset on prop changes
- Development-only error details
- Custom fallback support

### 4. Wrapper Component (`/components/triple-comparison/components/TripleComparisonWrapper.tsx`)

**Purpose**: Combines ErrorBoundary and Suspense for robust component loading.

**Structure**:
```tsx
<ErrorBoundary resetKeys={[resourceId]}>
  <Suspense fallback={<LoadingFallback />}>
    <TripleComparisonView {...props} />
  </Suspense>
</ErrorBoundary>
```

### 5. Updated Triple Comparison View

**Changes**:
1. Replaced placeholder content loading (lines 42-54) with `useContentLoader` hook
2. Added loading state with user feedback
3. Added error state with retry option
4. Added partial error warnings for individual content types
5. Integrated deferred content updates for smoother UX

## Usage Examples

### Basic Usage

```typescript
import { TripleComparisonWrapper } from '@/components/triple-comparison';

function ResourceEditor({ resourceId }) {
  return (
    <TripleComparisonWrapper
      resourceId={resourceId}
      downloadableUrl="/path/to/resource.md"
      webUrl="/path/to/resource.md"
      audioUrl="/audio/resource.mp3"
      onSave={async (updates) => {
        // Handle save
      }}
    />
  );
}
```

### Advanced Usage with Custom Error Handling

```typescript
import {
  TripleComparisonView,
  ErrorBoundary,
  useContentLoader
} from '@/components/triple-comparison';

function CustomEditor() {
  const content = useContentLoader({
    resourceId: '1',
    downloadableUrl: '/resource.md',
    autoLoad: true,
    cache: false, // Disable cache
  });

  return (
    <ErrorBoundary
      onError={(error, info) => {
        logErrorToService(error, info);
      }}
    >
      {/* Custom UI */}
    </ErrorBoundary>
  );
}
```

## Error Handling Strategy

### 1. Network Errors
- **Retry Logic**: 3 attempts with exponential backoff
- **User Message**: "Network error. Please check your connection and try again."
- **Recovery**: Manual retry button

### 2. 404 Not Found
- **User Message**: "Content not found. The resource may have been moved or deleted."
- **Recovery**: Cancel or navigate away

### 3. 403 Forbidden
- **User Message**: "Access denied. You may not have permission to view this content."
- **Recovery**: Check permissions or login

### 4. 500 Server Error
- **User Message**: "Server error. Please try again later."
- **Recovery**: Retry with exponential backoff

### 5. Partial Success
- **Behavior**: Load available content, show warnings for failed types
- **User Message**: List of failed content types with specific errors
- **Recovery**: Retry loading button for failed types

## Performance Optimizations

1. **Parallel Loading**: All content types load simultaneously
2. **Content Caching**: 5-minute in-memory cache reduces redundant requests
3. **Deferred Updates**: `useDeferredValue` prevents UI blocking
4. **Transitions**: `useTransition` for non-urgent state updates
5. **Prefetching**: Optional prefetch API for anticipated resources

## Testing Checklist

- [x] Create content fetcher utility
- [x] Implement retry logic with exponential backoff
- [x] Add content caching mechanism
- [x] Create useContentLoader hook
- [x] Implement error boundaries
- [x] Update TripleComparisonView component
- [x] Add Suspense wrapper
- [ ] Test with actual resource IDs
- [ ] Test error scenarios (network failures, 404s, etc.)
- [ ] Test partial success scenarios
- [ ] Test cache invalidation
- [ ] Performance testing with large content

## API Integration Points

### Existing APIs Used

1. **`/api/content/[id]`**: Primary content source
   - Returns: `originalContent`, `editedContent`, `metadata`
   - Includes cleaned content (box characters removed)

### Future Enhancement Opportunities

1. **Streaming API**: Use streaming for large content files
2. **GraphQL**: Single query for all content types
3. **WebSocket**: Real-time content updates
4. **Service Worker**: Offline content caching
5. **CDN**: Cache static content at edge

## File Structure

```
/lib/utils/
  └── content-fetcher.ts          # Content fetching utility

/components/triple-comparison/
  ├── components/
  │   ├── TripleComparisonView.tsx      # Updated with real loading
  │   ├── TripleComparisonWrapper.tsx   # ErrorBoundary + Suspense wrapper
  │   ├── ErrorBoundary.tsx             # Error boundary component
  │   ├── ContentPanel.tsx              # (unchanged)
  │   ├── DiffViewer.tsx                # (unchanged)
  │   └── SyncControls.tsx              # (unchanged)
  ├── hooks/
  │   ├── useTripleComparison.ts        # (unchanged)
  │   └── useContentLoader.ts           # New loading hook
  ├── types.ts                          # (unchanged)
  └── index.ts                          # Updated exports

/docs/
  └── triple-comparison-content-loading.md  # This document
```

## Dependencies

- **@vercel/blob**: For blob storage URLs (already in use)
- **React 18+**: For useTransition, useDeferredValue, Suspense
- **TypeScript**: Type safety

## Breaking Changes

None. The API remains backward compatible. Existing code using `TripleComparisonView` will continue to work, but will now load real content instead of placeholders.

## Migration Guide

### Old Pattern (Placeholder)
```typescript
// Before: Placeholder content
useEffect(() => {
  if (downloadableUrl) {
    updateContent('downloadable', 'Placeholder text...');
  }
}, [downloadableUrl]);
```

### New Pattern (Real Loading)
```typescript
// After: Real content loading
const { content, isLoading, error } = useContentLoader({
  resourceId,
  downloadableUrl,
  webUrl,
  audioUrl,
});

// Content automatically updates via useEffect
```

## Future Enhancements

1. **Progressive Loading**: Show content as it loads (streaming)
2. **Diff Caching**: Cache computed diffs
3. **Optimistic Updates**: Update UI before save completes
4. **Conflict Resolution**: Detect and resolve edit conflicts
5. **Version History**: Track content changes over time
6. **Collaborative Editing**: Real-time multi-user editing

## Conclusion

The Triple Comparison View now loads actual content from multiple sources with robust error handling, retry logic, and modern React patterns. The implementation provides:

- **Reliability**: Automatic retries with exponential backoff
- **Performance**: Parallel loading and caching
- **User Experience**: Loading states, error messages, and retry options
- **Maintainability**: Type-safe, well-documented, modular code
- **Extensibility**: Easy to add new content sources or enhance functionality

---

**Implementation Author**: AI Code Implementation Agent
**Review Status**: Ready for testing
**Documentation Status**: Complete
