import { useState, useCallback, useRef } from 'react';

export interface ContentItem {
  id: string;
  original: string;
  edited: string;
  metadata?: {
    title?: string;
    category?: string;
    lastModified?: string;
  };
}

interface UseContentManagerReturn {
  content: ContentItem | null;
  updateContent: (updates: Partial<Omit<ContentItem, 'id'>>) => void;
  resetContent: (newContent: ContentItem) => void;
  isDirty: boolean;
  resetDirty: () => void;
}

/**
 * Custom hook for managing content state and tracking changes
 *
 * @param initialContent - Initial content to manage
 * @returns Content management functions and state
 */
export function useContentManager(
  initialContent?: ContentItem
): UseContentManagerReturn {
  const [content, setContent] = useState<ContentItem | null>(
    initialContent || null
  );
  const [isDirty, setIsDirty] = useState(false);
  const initialContentRef = useRef<ContentItem | null>(initialContent || null);

  /**
   * Update content with partial updates
   */
  const updateContent = useCallback((updates: Partial<Omit<ContentItem, 'id'>>) => {
    setContent((prev) => {
      if (!prev) return null;

      const updated = {
        ...prev,
        ...updates,
        metadata: {
          ...prev.metadata,
          ...updates.metadata,
          lastModified: new Date().toISOString(),
        },
      };

      // Mark as dirty if edited content changed
      if (updates.edited !== undefined) {
        setIsDirty(true);
      }

      return updated;
    });
  }, []);

  /**
   * Reset content to new value
   */
  const resetContent = useCallback((newContent: ContentItem) => {
    setContent(newContent);
    initialContentRef.current = newContent;
    setIsDirty(false);
  }, []);

  /**
   * Reset dirty flag (after successful save)
   */
  const resetDirty = useCallback(() => {
    setIsDirty(false);
    if (content) {
      initialContentRef.current = content;
    }
  }, [content]);

  return {
    content,
    updateContent,
    resetContent,
    isDirty,
    resetDirty,
  };
}
