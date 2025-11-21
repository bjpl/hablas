/**
 * Error UI Component
 * Reusable error display with retry and report functionality
 */

import React from 'react';
import type { ErrorUIProps } from './types';
import { formatErrorMessage } from './errorLogger';

const errorTypeIcons = {
  content: '📄',
  audio: '🔊',
  api: '🔌',
  global: '⚠️',
};

const errorTypeTitles = {
  content: 'Content Error',
  audio: 'Audio Playback Error',
  api: 'API Error',
  global: 'Application Error',
};

export function ErrorUI({
  error,
  errorInfo,
  onRetry,
  onReport,
  retryCount,
  maxRetries,
  showReportButton = false,
  errorType,
}: ErrorUIProps): React.ReactElement {
  const canRetry = retryCount < maxRetries;
  const errorMessage = formatErrorMessage(error, errorType);
  const icon = errorTypeIcons[errorType];
  const title = errorTypeTitles[errorType];

  return (
    <div className="flex items-center justify-center min-h-[200px] p-6">
      <div className="max-w-md w-full bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="text-4xl" role="img" aria-label={errorType}>
            {icon}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              {title}
            </h3>

            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              {errorMessage}
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4">
                <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-950 rounded text-xs font-mono text-red-900 dark:text-red-100 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Message:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                    </div>
                  )}
                  {errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">{errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex space-x-3">
              {canRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-md transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
              )}

              {!canRetry && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-md transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Reload Page
                </button>
              )}

              {showReportButton && onReport && (
                <button
                  onClick={onReport}
                  className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-md transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Report Issue
                </button>
              )}
            </div>

            {retryCount > 0 && (
              <p className="mt-3 text-xs text-red-600 dark:text-red-400">
                Retry attempt {retryCount} of {maxRetries}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
