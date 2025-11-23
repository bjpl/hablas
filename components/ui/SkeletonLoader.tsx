/**
 * SkeletonLoader Component
 * Provides loading skeleton UI with animations
 */

'use client';

import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

/**
 * SkeletonLoader - Animated loading placeholder
 * @param variant - Shape of skeleton (text, rectangular, circular)
 * @param width - Width of skeleton
 * @param height - Height of skeleton
 * @param count - Number of skeleton elements to render
 */
export function SkeletonLoader({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}: SkeletonLoaderProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-md';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const defaultHeight = variant === 'text' ? '1em' : '100px';
  const defaultWidth = variant === 'circular' ? defaultHeight : '100%';

  const style: React.CSSProperties = {
    width: width || defaultWidth,
    height: height || defaultHeight,
  };

  const skeletonElement = (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] ${getVariantClasses()} ${className}`}
      style={{
        ...style,
        animation: 'shimmer 2s ease-in-out infinite',
      }}
      role="status"
      aria-label="Loading..."
    />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>{skeletonElement}</React.Fragment>
      ))}
    </div>
  );
}

/**
 * SkeletonCard - Card-shaped skeleton for content panels
 */
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <SkeletonLoader width="60%" height={20} />
          <SkeletonLoader width="40%" height={16} />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonLoader count={3} />
      </div>
    </div>
  );
}

/**
 * SkeletonTable - Table-shaped skeleton
 */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <SkeletonLoader height={40} className="mb-4" />
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonLoader key={index} height={60} />
      ))}
    </div>
  );
}
