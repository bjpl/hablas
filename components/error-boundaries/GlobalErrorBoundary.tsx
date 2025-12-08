/**
 * Global Error Boundary
 * Top-level error catcher for the entire application
 */

import React from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState, ErrorInfo } from './types';
import { handleError } from './errorLogger';
import { ErrorUI } from './ErrorUI';
import { createLogger } from '@/lib/utils/logger';

const globalErrorLogger = createLogger('GlobalErrorBoundary');

const DEFAULT_MAX_RETRIES = 1; // Limited retries for global errors
const DEFAULT_RETRY_DELAY_MS = 3000;

export class GlobalErrorBoundary extends React.Component<
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
    // Log critical error with full context
    handleError(error, errorInfo, 'GlobalErrorBoundary', {
      errorType: 'critical',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      localStorage: this.getLocalStorageInfo(),
      sessionInfo: this.getSessionInfo(),
    }).catch((err) => globalErrorLogger.error('Failed to handle error', err as Error));

    this.setState({
      errorInfo,
    });

    this.props.onError?.(error, errorInfo);

    // In production, you might want to redirect to a static error page
    // or display a maintenance message
    if (process.env.NODE_ENV === 'production') {
      globalErrorLogger.error('Critical application error', error);
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private getLocalStorageInfo(): Record<string, unknown> {
    try {
      return {
        available: typeof localStorage !== 'undefined',
        itemCount: localStorage.length,
      };
    } catch {
      return { available: false };
    }
  }

  private getSessionInfo(): Record<string, unknown> {
    return {
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
    };
  }

  handleRetry = (): void => {
    const { maxRetries = DEFAULT_MAX_RETRIES, retryDelayMs = DEFAULT_RETRY_DELAY_MS } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      return;
    }

    this.setState({
      retryCount: retryCount + 1,
    });

    // For global errors, wait before retrying
    this.retryTimeout = setTimeout(() => {
      this.handleReset();
    }, retryDelayMs);
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

    globalErrorLogger.info('Reporting critical error', { error: error.message, componentStack: errorInfo.componentStack });

    // Create detailed error report
    const report = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    const subject = encodeURIComponent('Critical Application Error');
    const body = encodeURIComponent(
      `A critical error occurred:\n\n${JSON.stringify(report, null, 2)}\n\nPlease describe what you were doing when this error occurred.`
    );
  };

  render(): React.ReactNode {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback, maxRetries = DEFAULT_MAX_RETRIES, showReportButton = true } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-2xl w-full mx-4">
            <ErrorUI
              error={error}
              errorInfo={errorInfo}
              onRetry={this.handleRetry}
              onReport={showReportButton ? this.handleReport : undefined}
              retryCount={retryCount}
              maxRetries={maxRetries}
              showReportButton={showReportButton}
              errorType="global"
            />

            {retryCount >= maxRetries && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  If this problem persists, please contact support or try again later.
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Return to Home Page
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Setup global error handlers
 * Call this in your app initialization
 */
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    globalErrorLogger.error('Unhandled promise rejection', error);

    handleError(
      error,
      { componentStack: '' },
      'UnhandledPromise'
    ).catch((err) => globalErrorLogger.error('Failed to handle unhandled rejection', err as Error));
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    const error = event.error instanceof Error ? event.error : new Error(event.message);
    globalErrorLogger.error('Global error', error);

    handleError(
      error,
      { componentStack: '' },
      'GlobalError'
    ).catch((err) => globalErrorLogger.error('Failed to handle global error', err as Error));
  });

  // Handle resource loading errors
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      globalErrorLogger.error('Resource failed to load', new Error(`Failed to load ${target.tagName}: ${(target as any).src || (target as any).href}`));
    }
  }, true);
}
