/**
 * Content Error Boundary
 * Handles errors during content loading and rendering
 */

import React from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState, ErrorInfo } from './types';
import { handleError } from './errorLogger';
import { ErrorUI } from './ErrorUI';
import { createLogger } from '@/lib/utils/logger';

const contentErrorLogger = createLogger('ContentErrorBoundary');

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

export class ContentErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastErrorTime: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error
    handleError(error, errorInfo, 'ContentErrorBoundary').catch((err) => contentErrorLogger.error('Failed to handle error', err as Error));

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  componentWillUnmount(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleRetry = (): void => {
    const { maxRetries = DEFAULT_MAX_RETRIES, retryDelayMs = DEFAULT_RETRY_DELAY_MS } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      return;
    }

    // Calculate exponential backoff delay
    const delay = retryDelayMs * Math.pow(2, retryCount);

    this.setState({
      retryCount: retryCount + 1,
    });

    // Retry after delay
    this.retryTimeout = setTimeout(() => {
      this.handleReset();
    }, delay);
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    this.props.onReset?.();
  };

  handleReport = (): void => {
    const { error, errorInfo } = this.state;
    if (!error || !errorInfo) return;

    // In a real application, this would send to an error reporting service
    contentErrorLogger.info('Reporting error', { error: error.message, componentStack: errorInfo.componentStack });

    // Could also open a feedback form or email client
    const subject = encodeURIComponent('Content Error Report');
    const body = encodeURIComponent(
      `Error: ${error.message}\n\nPlease describe what you were doing when this error occurred.`
    );

    // Optional: Open email client (commented out by default)
    // window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
  };

  render(): React.ReactNode {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback, maxRetries = DEFAULT_MAX_RETRIES, showReportButton } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <ErrorUI
          error={error}
          errorInfo={errorInfo}
          onRetry={this.handleRetry}
          onReport={showReportButton ? this.handleReport : undefined}
          retryCount={retryCount}
          maxRetries={maxRetries}
          showReportButton={showReportButton}
          errorType="content"
        />
      );
    }

    return children;
  }
}

/**
 * Hook version for function components
 * Provides error handling without using class-based error boundary
 */
export function useContentErrorHandler(onError?: (error: Error) => void) {
  const [error, setError] = React.useState<Error | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleError = React.useCallback(
    (err: Error) => {
      setError(err);
      onError?.(err);
    },
    [onError]
  );

  const retry = React.useCallback(() => {
    setError(null);
    setRetryCount((prev) => prev + 1);
  }, []);

  const reset = React.useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    error,
    retryCount,
    handleError,
    retry,
    reset,
  };
}
