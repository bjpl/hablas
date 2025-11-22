/**
 * Audio Error Boundary
 * Handles errors during audio loading and playback
 */

import React from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState, ErrorInfo } from './types';
import { handleError } from './errorLogger';
import { ErrorUI } from './ErrorUI';

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 2000;

export class AudioErrorBoundary extends React.Component<
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
    // Log error with audio-specific context
    handleError(error, errorInfo, 'AudioErrorBoundary', {
      errorType: 'audio',
      userAgent: navigator.userAgent,
      audioSupport: {
        mp3: document.createElement('audio').canPlayType('audio/mpeg'),
        ogg: document.createElement('audio').canPlayType('audio/ogg'),
        wav: document.createElement('audio').canPlayType('audio/wav'),
      },
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

    console.log('Reporting audio error:', { error, errorInfo });

    const subject = encodeURIComponent('Audio Playback Error Report');
    const body = encodeURIComponent(
      `Audio Error: ${error.message}\n\nBrowser: ${navigator.userAgent}\n\nPlease describe the audio file you were trying to play.`
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
          errorType="audio"
        />
      );
    }

    return children;
  }
}

/**
 * Hook for audio error handling in function components
 */
export function useAudioErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleAudioError = React.useCallback((event: Event | Error) => {
    const audioError = event instanceof Error
      ? event
      : new Error('Audio playback failed');

    setError(audioError);

    // Log audio error
    handleError(audioError, { componentStack: '' }, 'AudioPlayer').catch(console.error);
  }, []);

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
    handleAudioError,
    retry,
    reset,
  };
}
