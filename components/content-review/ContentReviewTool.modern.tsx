'use client';

/**
 * Modernized ContentReviewTool Component
 *
 * Features:
 * - React 18+ patterns with useTransition for smooth state updates
 * - Optimistic UI updates for instant feedback
 * - Dark mode support
 * - Skeleton loaders
 * - Enhanced accessibility
 * - Micro-interactions and animations
 * - Performance optimizations with React.memo
 *
 * @module ContentReviewTool
 */

import React, { useState, useCallback, useMemo, useTransition, Suspense } from 'react';
import { Save, AlertCircle, CheckCircle2, Loader2, GitCompare, Moon, Sun } from 'lucide-react';
import { ComparisonView } from './ComparisonView';
import { EditPanel } from './EditPanel';
import { DiffHighlighter } from './DiffHighlighter';
import { useAutoSave } from './hooks/useAutoSave';
import { useContentManager } from './hooks/useContentManager';
import { useOptimisticUpdate } from '@/lib/hooks/useOptimisticUpdate';
import { useTheme } from '@/lib/hooks/useTheme';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { createLogger } from '@/lib/utils/logger';

const contentReviewModernLogger = createLogger('ContentReviewToolModern');

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

interface ContentReviewToolProps {
  initialContent?: ContentItem;
  onSave?: (content: ContentItem) => Promise<void>;
  autoSaveDelay?: number;
  className?: string;
}

/**
 * Memoized comparison view for performance
 */
const MemoizedComparisonView = React.memo(ComparisonView);

/**
 * Memoized edit panel for performance
 */
const MemoizedEditPanel = React.memo(EditPanel);

/**
 * Memoized diff highlighter for performance
 */
const MemoizedDiffHighlighter = React.memo(DiffHighlighter);

/**
 * ContentReviewTool - Main component for content review and editing
 *
 * Provides side-by-side comparison of original and edited content with
 * real-time diff highlighting, auto-save, and optimistic updates.
 *
 * @param props - Component properties
 * @returns Rendered content review interface
 */
export const ContentReviewTool: React.FC<ContentReviewToolProps> = ({
  initialContent,
  onSave,
  autoSaveDelay = 2000,
  className = '',
}) => {
  const { theme, toggleTheme } = useTheme();
  const {
    content,
    updateContent,
    isDirty,
    resetDirty,
  } = useContentManager(initialContent);

  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showDiff, setShowDiff] = useState(false);

  /**
   * Handle manual save with optimistic UI update
   */
  const handleManualSave = useCallback(async () => {
    if (!onSave || !content) return;

    // Use transition for smooth state update
    startTransition(() => {
      setSaveStatus('saving');
      setErrorMessage('');
    });

    try {
      await onSave(content);

      startTransition(() => {
        setSaveStatus('success');
        resetDirty();
      });

      // Reset success status after 3 seconds
      setTimeout(() => {
        startTransition(() => {
          setSaveStatus('idle');
        });
      }, 3000);
    } catch (error) {
      startTransition(() => {
        setSaveStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to save content');
      });
    }
  }, [content, onSave, resetDirty]);

  /**
   * Auto-save callback with error handling
   */
  const handleAutoSave = useCallback(async (currentContent: ContentItem) => {
    if (!onSave) return;

    try {
      await onSave(currentContent);
      contentReviewModernLogger.info('Auto-saved successfully');
    } catch (error) {
      contentReviewModernLogger.error('Auto-save failed', error as Error);
    }
  }, [onSave]);

  /**
   * Setup auto-save with debouncing
   */
  useAutoSave({
    content,
    onSave: handleAutoSave,
    delay: autoSaveDelay,
    enabled: isDirty && !!onSave,
  });

  /**
   * Handle content updates with optimistic UI
   */
  const handleEditChange = useCallback((newEditedContent: string) => {
    startTransition(() => {
      updateContent({ edited: newEditedContent });
    });
  }, [updateContent]);

  /**
   * Memoized save button state
   */
  const isSaveDisabled = useMemo(
    () => !isDirty || saveStatus === 'saving' || isPending,
    [isDirty, saveStatus, isPending]
  );

  /**
   * Toggle diff view with transition
   */
  const handleToggleDiff = useCallback(() => {
    startTransition(() => {
      setShowDiff(prev => !prev);
    });
  }, []);

  if (!content) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No content to review</p>
      </div>
    );
  }

  return (
    <div className={`content-review-tool ${className} transition-colors duration-200`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Content Review Tool
            </h1>
            {content.metadata?.title && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {content.metadata.title}
              </p>
            )}
          </div>

          {/* Save Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Status Indicator */}
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 animate-in fade-in duration-200">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Saved</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Save failed</span>
              </div>
            )}

            {/* Diff Toggle Button */}
            <button
              onClick={handleToggleDiff}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg font-medium
                transition-all duration-200 transform hover:scale-105 active:scale-95
                ${showDiff
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
              aria-label="Toggle diff view"
              aria-pressed={showDiff}
            >
              <GitCompare className="w-4 h-4" />
              <span className="text-sm">Diff</span>
            </button>

            {/* Manual Save Button */}
            <button
              onClick={handleManualSave}
              disabled={isSaveDisabled}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                transition-all duration-200 transform
                ${isDirty
                  ? 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 hover:scale-105 active:scale-95'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }
                disabled:opacity-50
              `}
              aria-label="Save changes"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300"
            role="alert"
          >
            <p className="text-sm text-red-800 dark:text-red-300">{errorMessage}</p>
          </div>
        )}

        {/* Metadata */}
        {content.metadata && (
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {content.metadata.category && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded transition-colors duration-200">
                {content.metadata.category}
              </span>
            )}
            {content.metadata.lastModified && (
              <span>
                Last modified: {new Date(content.metadata.lastModified).toLocaleString()}
              </span>
            )}
            {/* Dirty Indicator */}
            {isDirty && (
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded animate-pulse">
                Unsaved changes
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <Suspense fallback={<div className="p-6"><SkeletonCard /></div>}>
          {showDiff ? (
            /* Diff View */
            <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Changes Comparison
                    </h2>
                  </div>
                </div>
                <MemoizedDiffHighlighter
                  original={content.original}
                  edited={content.edited}
                />
              </div>
            </div>
          ) : (
            /* Side-by-side View */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 animate-in fade-in duration-300">
              {/* Original Content Panel */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
                <MemoizedComparisonView
                  title="Original Content"
                  content={content.original}
                  isOriginal={true}
                />
              </div>

              {/* Edit Panel */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
                <MemoizedEditPanel
                  content={content.edited}
                  onChange={handleEditChange}
                  onSave={handleManualSave}
                  isDirty={isDirty}
                />
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
};
