import { useEffect, useRef } from 'react';
import { createLogger } from '@/lib/utils/logger';

const autoSaveLogger = createLogger('useAutoSave');

interface UseAutoSaveOptions<T> {
  content: T | null;
  onSave: (content: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

/**
 * Custom hook for debounced auto-save functionality
 *
 * @param options - Configuration options
 * @param options.content - Content to save
 * @param options.onSave - Async function to call when saving
 * @param options.delay - Debounce delay in milliseconds (default: 2000)
 * @param options.enabled - Whether auto-save is enabled (default: true)
 */
export function useAutoSave<T>({
  content,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousContentRef = useRef<T | null>(content);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't save if disabled or no content
    if (!enabled || !content) {
      return;
    }

    // Don't save if content hasn't changed
    if (previousContentRef.current === content) {
      return;
    }

    // Set up new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(content);
        previousContentRef.current = content;
      } catch (error) {
        autoSaveLogger.error('Auto-save failed', error as Error);
      }
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, onSave, delay, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}
