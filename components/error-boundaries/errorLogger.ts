/**
 * Error Logging Utility
 * Handles error logging in development and production
 */

import type { ErrorReport, ErrorContext, ErrorSeverity, ErrorInfo } from './types';
import { createLogger } from '@/lib/utils/logger';

const errorLoggerInstance = createLogger('ErrorLogger');
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Get current error context
 */
export function getErrorContext(component?: string): ErrorContext {
  return {
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    component,
  };
}

/**
 * Determine error severity based on error type
 */
export function getErrorSeverity(error: Error): ErrorSeverity {
  const message = error.message.toLowerCase();

  // Critical errors
  if (message.includes('network') || message.includes('fetch failed')) {
    return 'critical';
  }

  // High severity
  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return 'high';
  }

  // Medium severity
  if (message.includes('not found') || message.includes('timeout')) {
    return 'medium';
  }

  // Low severity (default)
  return 'low';
}

/**
 * Log error to console in development
 */
export function logErrorToConsole(error: Error, errorInfo: ErrorInfo, component?: string): void {
  if (isDevelopment) {
    errorLoggerInstance.error(
      `Error in ${component || 'Unknown Component'}`,
      error,
      {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      }
    );
  }
}

/**
 * Send error to tracking service in production
 */
export async function sendErrorToTracking(report: ErrorReport): Promise<void> {
  // In production, send to error tracking service
  // Examples: Sentry, Rollbar, LogRocket, etc.

  if (!isDevelopment) {
    try {
      // TODO: Integrate with your error tracking service
      // Example:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report),
      // });

      errorLoggerInstance.warn('Error tracking not configured', { report });
    } catch (trackingError) {
      errorLoggerInstance.error('Failed to send error to tracking', trackingError as Error);
    }
  }
}

/**
 * Create error report
 */
export function createErrorReport(
  error: Error,
  errorInfo: ErrorInfo,
  component?: string,
  additionalInfo?: Record<string, unknown>
): ErrorReport {
  const context = getErrorContext(component);

  if (additionalInfo) {
    context.additionalInfo = additionalInfo;
  }

  return {
    error,
    errorInfo,
    context,
    severity: getErrorSeverity(error),
    stack: error.stack,
  };
}

/**
 * Handle error logging and reporting
 */
export async function handleError(
  error: Error,
  errorInfo: ErrorInfo,
  component?: string,
  additionalInfo?: Record<string, unknown>
): Promise<void> {
  // Log to console in development
  logErrorToConsole(error, errorInfo, component);

  // Create error report
  const report = createErrorReport(error, errorInfo, component, additionalInfo);

  // Send to tracking in production
  await sendErrorToTracking(report);
}

/**
 * Format error for display
 */
export function formatErrorMessage(error: Error, errorType: string): string {
  const message = error.message;

  // Network errors
  if (message.includes('fetch') || message.includes('network')) {
    return 'Unable to connect. Please check your internet connection.';
  }

  // Audio errors
  if (errorType === 'audio') {
    return 'Failed to load or play audio. The file may be unavailable.';
  }

  // Content errors
  if (errorType === 'content') {
    return 'Failed to load content. Please try again.';
  }

  // API errors
  if (errorType === 'api') {
    return 'API request failed. Please try again.';
  }

  // Generic error
  return 'Something went wrong. Please try again.';
}
