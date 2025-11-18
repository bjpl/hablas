import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  VersionContent,
  ContentType,
  DiffResult,
  TripleComparisonState,
  SaveResult,
  SyncOperation,
} from '../types';

interface UseTripleComparisonOptions {
  initialDownloadable?: string;
  initialWeb?: string;
  initialAudio?: string;
  onSave?: (type: ContentType, content: string) => Promise<void>;
  onSync?: (from: ContentType, to: ContentType, content: string) => Promise<void>;
  autoCalculateDiff?: boolean;
}

interface UseTripleComparisonReturn {
  state: TripleComparisonState;
  content: Record<ContentType, VersionContent>;
  updateContent: (type: ContentType, newContent: string) => void;
  saveContent: (type: ContentType) => Promise<SaveResult>;
  saveAll: () => Promise<Record<ContentType, SaveResult>>;
  revertContent: (type: ContentType) => void;
  revertAll: () => void;
  syncContent: (from: ContentType, to: ContentType) => Promise<void>;
  calculateDiff: (type1: ContentType, type2: ContentType) => DiffResult;
  hasUnsavedChanges: () => boolean;
  isLoading: (type?: ContentType) => boolean;
  getError: (type?: ContentType) => string | null;
  clearError: (type: ContentType) => void;
}

export function useTripleComparison(
  options: UseTripleComparisonOptions = {}
): UseTripleComparisonReturn {
  const {
    initialDownloadable = '',
    initialWeb = '',
    initialAudio = '',
    onSave,
    onSync,
    autoCalculateDiff = true,
  } = options;

  // Content state
  const [content, setContent] = useState<Record<ContentType, VersionContent>>({
    downloadable: {
      current: initialDownloadable,
      original: initialDownloadable,
      isDirty: false,
    },
    web: {
      current: initialWeb,
      original: initialWeb,
      isDirty: false,
    },
    audio: {
      current: initialAudio,
      original: initialAudio,
      isDirty: false,
    },
  });

  // Loading states
  const [loadingStates, setLoadingStates] = useState<Record<ContentType, boolean>>({
    downloadable: false,
    web: false,
    audio: false,
  });

  // Error states
  const [errors, setErrors] = useState<Record<ContentType, string | null>>({
    downloadable: null,
    web: null,
    audio: null,
  });

  // Diff cache
  const diffCache = useRef<Map<string, DiffResult>>(new Map());

  // Update content for a specific version
  const updateContent = useCallback(
    (type: ContentType, newContent: string) => {
      setContent((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          current: newContent,
          isDirty: newContent !== prev[type].original,
        },
      }));

      // Clear diff cache when content changes
      if (autoCalculateDiff) {
        diffCache.current.clear();
      }
    },
    [autoCalculateDiff]
  );

  // Save content for a specific version
  const saveContent = useCallback(
    async (type: ContentType): Promise<SaveResult> => {
      setLoadingStates((prev) => ({ ...prev, [type]: true }));
      setErrors((prev) => ({ ...prev, [type]: null }));

      try {
        if (onSave) {
          await onSave(type, content[type].current);
        }

        setContent((prev) => ({
          ...prev,
          [type]: {
            current: prev[type].current,
            original: prev[type].current,
            isDirty: false,
          },
        }));

        return {
          success: true,
          type,
          timestamp: new Date(),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Save failed';
        setErrors((prev) => ({ ...prev, [type]: errorMessage }));

        return {
          success: false,
          type,
          error: errorMessage,
          timestamp: new Date(),
        };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [type]: false }));
      }
    },
    [content, onSave]
  );

  // Save all versions
  const saveAll = useCallback(async (): Promise<Record<ContentType, SaveResult>> => {
    const types: ContentType[] = ['downloadable', 'web', 'audio'];
    const results = await Promise.all(types.map((type) => saveContent(type)));

    return {
      downloadable: results[0],
      web: results[1],
      audio: results[2],
    };
  }, [saveContent]);

  // Revert content for a specific version
  const revertContent = useCallback((type: ContentType) => {
    setContent((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        current: prev[type].original,
        isDirty: false,
      },
    }));
    setErrors((prev) => ({ ...prev, [type]: null }));
    diffCache.current.clear();
  }, []);

  // Revert all versions
  const revertAll = useCallback(() => {
    const types: ContentType[] = ['downloadable', 'web', 'audio'];
    types.forEach((type) => revertContent(type));
  }, [revertContent]);

  // Sync content from one version to another
  const syncContent = useCallback(
    async (from: ContentType, to: ContentType) => {
      setLoadingStates((prev) => ({ ...prev, [to]: true }));
      setErrors((prev) => ({ ...prev, [to]: null }));

      try {
        if (onSync) {
          await onSync(from, to, content[from].current);
        }

        setContent((prev) => ({
          ...prev,
          [to]: {
            ...prev[to],
            current: prev[from].current,
            isDirty: prev[from].current !== prev[to].original,
          },
        }));

        diffCache.current.clear();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sync failed';
        setErrors((prev) => ({ ...prev, [to]: errorMessage }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, [to]: false }));
      }
    },
    [content, onSync]
  );

  // Calculate diff between two versions
  const calculateDiff = useCallback(
    (type1: ContentType, type2: ContentType): DiffResult => {
      const cacheKey = `${type1}-${type2}`;
      const cached = diffCache.current.get(cacheKey);

      if (cached) {
        return cached;
      }

      const content1 = content[type1].current;
      const content2 = content[type2].current;

      // Simple line-based diff calculation
      const lines1 = content1.split('\n');
      const lines2 = content2.split('\n');

      let additions = 0;
      let deletions = 0;
      let changes = 0;

      const maxLines = Math.max(lines1.length, lines2.length);
      for (let i = 0; i < maxLines; i++) {
        const line1 = lines1[i];
        const line2 = lines2[i];

        if (line1 === undefined && line2 !== undefined) {
          additions++;
        } else if (line1 !== undefined && line2 === undefined) {
          deletions++;
        } else if (line1 !== line2) {
          changes++;
        }
      }

      const result: DiffResult = {
        type1,
        type2,
        additions,
        deletions,
        changes,
        identical: additions === 0 && deletions === 0 && changes === 0,
        timestamp: new Date(),
      };

      diffCache.current.set(cacheKey, result);
      return result;
    },
    [content]
  );

  // Check if any version has unsaved changes
  const hasUnsavedChanges = useCallback((): boolean => {
    return content.downloadable.isDirty || content.web.isDirty || content.audio.isDirty;
  }, [content]);

  // Check loading state
  const isLoading = useCallback(
    (type?: ContentType): boolean => {
      if (type) {
        return loadingStates[type];
      }
      return loadingStates.downloadable || loadingStates.web || loadingStates.audio;
    },
    [loadingStates]
  );

  // Get error for a specific version
  const getError = useCallback(
    (type?: ContentType): string | null => {
      if (type) {
        return errors[type];
      }
      return errors.downloadable || errors.web || errors.audio;
    },
    [errors]
  );

  // Clear error for a specific version
  const clearError = useCallback((type: ContentType) => {
    setErrors((prev) => ({ ...prev, [type]: null }));
  }, []);

  // Compile state object
  const state: TripleComparisonState = {
    hasUnsavedChanges: hasUnsavedChanges(),
    isLoading: isLoading(),
    errors: {
      downloadable: errors.downloadable,
      web: errors.web,
      audio: errors.audio,
    },
    lastSaved: null, // Could be enhanced to track last save time
  };

  // Clear diff cache when auto-calculate is enabled and content changes
  useEffect(() => {
    if (autoCalculateDiff) {
      diffCache.current.clear();
    }
  }, [content, autoCalculateDiff]);

  return {
    state,
    content,
    updateContent,
    saveContent,
    saveAll,
    revertContent,
    revertAll,
    syncContent,
    calculateDiff,
    hasUnsavedChanges,
    isLoading,
    getError,
    clearError,
  };
}
