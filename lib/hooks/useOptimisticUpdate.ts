/**
 * useOptimisticUpdate Hook
 * Provides optimistic UI updates with automatic rollback on error
 */

import { useState, useCallback, useTransition } from 'react';

interface UseOptimisticUpdateOptions<T> {
  onUpdate: (value: T) => Promise<void>;
  onError?: (error: Error) => void;
}

export function useOptimisticUpdate<T>(
  initialValue: T,
  options: UseOptimisticUpdateOptions<T>
) {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateValue = useCallback(
    (newValue: T) => {
      const previousValue = value;

      // Optimistically update UI
      startTransition(() => {
        setValue(newValue);
      });

      // Perform actual update
      options.onUpdate(newValue).catch((err) => {
        // Rollback on error
        setValue(previousValue);
        setError(err);
        options.onError?.(err);
      });
    },
    [value, options]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    value,
    updateValue,
    isPending,
    error,
    clearError,
  };
}
