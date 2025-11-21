/**
 * Triple Comparison Wrapper Component
 *
 * Wraps TripleComparisonView with ErrorBoundary and Suspense for robust error handling
 * and optimistic UI updates following React 18+ best practices
 */

'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { TripleComparisonView } from './TripleComparisonView';
import { ErrorBoundary } from './ErrorBoundary';
import type { TripleComparisonViewProps } from '../types';

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-lg font-medium text-gray-700 mt-4">
          Initializing Content Comparison
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Setting up the triple comparison editor...
        </p>
      </div>
    </div>
  );
}

/**
 * Wrapper component with error boundaries and suspense
 */
export function TripleComparisonWrapper(props: TripleComparisonViewProps) {
  return (
    <ErrorBoundary resetKeys={[props.resourceId]}>
      <Suspense fallback={<LoadingFallback />}>
        <TripleComparisonView {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Re-export for convenience
 */
export default TripleComparisonWrapper;
