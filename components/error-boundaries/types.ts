/**
 * Error Boundary Types
 * Shared types for error handling and recovery
 */

import type { ReactNode } from 'react';

export interface ErrorInfo {
  componentStack: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  lastErrorTime: number;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  maxRetries?: number;
  retryDelayMs?: number;
  showReportButton?: boolean;
}

export interface ErrorUIProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
  onReport?: () => void;
  retryCount: number;
  maxRetries: number;
  showReportButton?: boolean;
  errorType: 'content' | 'audio' | 'api' | 'global';
}

export interface ErrorContext {
  timestamp: number;
  userAgent: string;
  url: string;
  component?: string;
  additionalInfo?: Record<string, unknown>;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorReport {
  error: Error;
  errorInfo: ErrorInfo;
  context: ErrorContext;
  severity: ErrorSeverity;
  stack?: string;
}
