# Error Boundaries

Comprehensive error boundary components for graceful error handling in React applications.

## Components

### 1. ContentErrorBoundary
Handles errors during content loading and rendering.

```tsx
import { ContentErrorBoundary } from '@/components/error-boundaries';

<ContentErrorBoundary
  maxRetries={3}
  retryDelayMs={1000}
  showReportButton={true}
  onError={(error, errorInfo) => console.log('Error:', error)}
  onReset={() => console.log('Reset')}
>
  <YourContentComponent />
</ContentErrorBoundary>
```

### 2. AudioErrorBoundary
Handles errors during audio loading and playback.

```tsx
import { AudioErrorBoundary } from '@/components/error-boundaries';

<AudioErrorBoundary maxRetries={2} retryDelayMs={2000}>
  <AudioPlayer src="/audio/file.mp3" />
</AudioErrorBoundary>
```

### 3. APIErrorBoundary
Handles errors during API calls with automatic retry and exponential backoff.

```tsx
import { APIErrorBoundary } from '@/components/error-boundaries';

<APIErrorBoundary maxRetries={3} retryDelayMs={1500}>
  <DataFetchingComponent />
</APIErrorBoundary>
```

### 4. GlobalErrorBoundary
Top-level error catcher for the entire application.

```tsx
import { GlobalErrorBoundary, setupGlobalErrorHandlers } from '@/components/error-boundaries';

// In your app initialization
setupGlobalErrorHandlers();

// In your root component
<GlobalErrorBoundary showReportButton={true}>
  <App />
</GlobalErrorBoundary>
```

## Hooks

### useContentErrorHandler
For function components that need error handling without a boundary.

```tsx
import { useContentErrorHandler } from '@/components/error-boundaries';

function MyComponent() {
  const { error, retryCount, handleError, retry, reset } = useContentErrorHandler();

  try {
    // Your code
  } catch (err) {
    handleError(err);
  }

  if (error) {
    return <div>Error: {error.message} <button onClick={retry}>Retry</button></div>;
  }
}
```

### useAudioErrorHandler
Audio-specific error handling.

```tsx
import { useAudioErrorHandler } from '@/components/error-boundaries';

function AudioComponent() {
  const { error, handleAudioError, retry } = useAudioErrorHandler();

  return (
    <audio onError={handleAudioError}>
      <source src="/audio/file.mp3" />
    </audio>
  );
}
```

### useAPIErrorHandler
API call error handling with automatic retry.

```tsx
import { useAPIErrorHandler } from '@/components/error-boundaries';

function DataComponent() {
  const { error, isRetrying, handleAPIError, retry } = useAPIErrorHandler(3);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
    } catch (err) {
      handleAPIError(err);
    }
  };
}
```

## Utilities

### fetchWithRetry
Fetch wrapper with automatic retry logic.

```tsx
import { fetchWithRetry } from '@/components/error-boundaries';

const response = await fetchWithRetry('/api/data', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
}, 3); // max retries
```

### Error Logging
Automatic error logging to console (development) and tracking service (production).

```tsx
import { handleError, createErrorReport } from '@/components/error-boundaries';

// Manual error logging
try {
  // risky code
} catch (error) {
  await handleError(error, { componentStack: '' }, 'ComponentName', {
    additionalContext: 'value'
  });
}
```

## Features

### Error Recovery
- Automatic retry with exponential backoff
- Configurable retry limits
- Reset to safe state
- Show cached/offline content

### Error UI
- User-friendly error messages
- Retry button
- Report error button (optional)
- Development mode details
- Responsive design with dark mode support

### Error Logging
- Console logging in development
- Error tracking in production
- Stack trace capture
- Context information
- Severity classification

### Modern Patterns
- React 18 error boundaries
- TypeScript support
- Suspense-compatible
- Hook-based API for function components

## Integration Examples

### Wrap TripleComparisonView
```tsx
<ContentErrorBoundary>
  <TripleComparisonView />
</ContentErrorBoundary>
```

### Wrap AudioPlayer
```tsx
<AudioErrorBoundary>
  <AudioPlayer />
</AudioErrorBoundary>
```

### Wrap API Routes
```tsx
<APIErrorBoundary>
  <DataFetchingComponent />
</APIErrorBoundary>
```

### Add to App Layout
```tsx
import { GlobalErrorBoundary, setupGlobalErrorHandlers } from '@/components/error-boundaries';

// App initialization
useEffect(() => {
  setupGlobalErrorHandlers();
}, []);

// Root component
<GlobalErrorBoundary>
  <YourApp />
</GlobalErrorBoundary>
```

## Configuration

### Props
- `maxRetries` - Maximum retry attempts (default: varies by boundary type)
- `retryDelayMs` - Initial retry delay in milliseconds (default: varies)
- `showReportButton` - Show error report button (default: false)
- `fallback` - Custom fallback UI
- `onError` - Error callback
- `onReset` - Reset callback

### Environment
- Development: Shows detailed error information
- Production: User-friendly messages, error tracking

## Best Practices

1. **Layer Error Boundaries**: Use specific boundaries (Content, Audio, API) within a GlobalErrorBoundary
2. **Provide Context**: Pass meaningful component names and additional info to error handlers
3. **Configure Retries**: Adjust retry counts and delays based on error type
4. **Test Error States**: Regularly test error scenarios during development
5. **Monitor Production**: Integrate with error tracking services (Sentry, Rollbar, etc.)
6. **User Experience**: Provide clear error messages and recovery options

## Error Tracking Integration

To integrate with error tracking services, update `errorLogger.ts`:

```typescript
// Example: Sentry integration
import * as Sentry from '@sentry/react';

export async function sendErrorToTracking(report: ErrorReport): Promise<void> {
  if (!isDevelopment) {
    Sentry.captureException(report.error, {
      contexts: {
        errorInfo: report.errorInfo,
        custom: report.context,
      },
      level: report.severity,
    });
  }
}
```

## License

MIT
