/**
 * API Error Boundary
 * Handles errors during API calls with automatic retry and backoff
 */

import React from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState, ErrorInfo } from './types';
import { handleError } from './errorLogger';
import { ErrorUI } from './ErrorUI';

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1500;
const MAX_BACKOFF_DELAY_MS = 30000; // 30 seconds

export class APIErrorBoundary extends React.Component<
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
    // Log error with API-specific context
    handleError(error, errorInfo, 'APIErrorBoundary', {
      errorType: 'api',
      networkStatus: navigator.onLine ? 'online' : 'offline',
      timestamp: new Date().toISOString(),
    }).catch(console.error);

    this.setState({
      errorInfo,
    });

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

    // Calculate exponential backoff delay with jitter
    const baseDelay = retryDelayMs * Math.pow(2, retryCount);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    const delay = Math.min(baseDelay + jitter, MAX_BACKOFF_DELAY_MS);

    this.setState({
      retryCount: retryCount + 1,
    });

    console.log(`Retrying API call in ${Math.round(delay)}ms (attempt ${retryCount + 1}/${maxRetries})`);

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

    console.log('Reporting API error:', { error, errorInfo });

    const subject = encodeURIComponent('API Error Report');
    const body = encodeURIComponent(
      `API Error: ${error.message}\n\nTime: ${new Date().toISOString()}\nOnline: ${navigator.onLine}\n\nPlease describe what action you were performing.`
    );
  };

  render(): React.ReactNode {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback, maxRetries = DEFAULT_MAX_RETRIES, showReportButton } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorUI
          error={error}
          errorInfo={errorInfo}
          onRetry={this.handleRetry}
          onReport={showReportButton ? this.handleReport : undefined}
          retryCount={retryCount}
          maxRetries={maxRetries}
          showReportButton={showReportButton}
          errorType="api"
        />
      );
    }

    return children;
  }
}

/**
 * Hook for API error handling with automatic retry
 */
export function useAPIErrorHandler(maxRetries = DEFAULT_MAX_RETRIES) {
  const [error, setError] = React.useState<Error | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleAPIError = React.useCallback((err: Error) => {
    setError(err);

    // Log API error
    handleError(err, { componentStack: '' }, 'API').catch(console.error);
  }, []);

  const retry = React.useCallback(async (retryFn: () => Promise<void>) => {
    if (retryCount >= maxRetries) {
      return;
    }

    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    // Calculate delay with exponential backoff
    const delay = DEFAULT_RETRY_DELAY_MS * Math.pow(2, retryCount);

    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      await retryFn();
      setError(null);
      setIsRetrying(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries]);

  const reset = React.useCallback(() => {
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    error,
    retryCount,
    isRetrying,
    handleAPIError,
    retry,
    reset,
  };
}

/**
 * Fetch wrapper with automatic retry
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = DEFAULT_MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Don't retry on client errors (4xx), only server errors (5xx) and network errors
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Network error');
    }

    // Don't wait after the last attempt
    if (attempt < maxRetries) {
      const delay = DEFAULT_RETRY_DELAY_MS * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}
