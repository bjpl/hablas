/**
 * Modernized BilingualComparisonView Component
 *
 * Features:
 * - React 18+ patterns with useTransition
 * - Enhanced responsiveness and animations
 * - Dark mode support
 * - Improved accessibility with ARIA labels
 * - Performance optimizations with React.memo
 * - Smooth micro-interactions
 * - Better keyboard navigation
 *
 * @module BilingualComparisonView
 */

'use client';

import React, { useState, useCallback, useMemo, useTransition } from 'react';
import { Edit3, AlertTriangle, CheckCircle2, Moon, Sun, Save } from 'lucide-react';
import {
  parseBilingualContent,
  findMissingTranslations,
} from '@/lib/content-validation/bilingual-parser';
import { BilingualPhrase } from '@/lib/content-validation/types';
import { useTheme } from '@/lib/hooks/useTheme';

interface BilingualComparisonViewProps {
  content: string;
  onEdit: (lang: 'en' | 'es', lineIndex: number, newText: string) => void;
  onSave?: () => void;
  className?: string;
}

interface EditablePhraseProps {
  text: string;
  language: 'en' | 'es';
  index: number;
  onEdit: (lang: 'en' | 'es', index: number, newText: string) => void;
  highlightIfMissing: boolean;
}

/**
 * EditablePhrase - Memoized editable phrase component
 */
const EditablePhrase: React.FC<EditablePhraseProps> = React.memo(({
  text,
  language,
  index,
  onEdit,
  highlightIfMissing,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [isPending, startTransition] = useTransition();

  const handleSave = useCallback(() => {
    if (editedText !== text) {
      startTransition(() => {
        onEdit(language, index, editedText);
        setIsEditing(false);
      });
    } else {
      setIsEditing(false);
    }
  }, [editedText, text, language, index, onEdit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        setEditedText(text);
        setIsEditing(false);
      }
    },
    [handleSave, text]
  );

  const handleCancel = useCallback(() => {
    setEditedText(text);
    setIsEditing(false);
  }, [text]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Missing translation indicator
  if (!text && highlightIfMissing) {
    return (
      <div
        className="p-3 mb-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 rounded transition-all duration-200 animate-in fade-in slide-in-from-left-2"
        role="alert"
      >
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Missing translation</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3 mb-2 rounded border-l-4 transition-all duration-200 ${
        highlightIfMissing
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${isPending ? 'opacity-60' : ''}`}
    >
      {isEditing ? (
        <div className="animate-in fade-in duration-200">
          <textarea
            value={editedText}
            onChange={e => setEditedText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            rows={2}
            autoFocus
            aria-label={`Edit ${language === 'en' ? 'English' : 'Spanish'} phrase`}
            disabled={isPending}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 dark:bg-blue-500 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save (Ctrl+Enter)'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200 disabled:opacity-50"
            >
              Cancel (Esc)
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleEdit}
          className="cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleEdit();
            }
          }}
          aria-label={`${language === 'en' ? 'English' : 'Spanish'} phrase: ${text}. Press Enter to edit.`}
        >
          <div className="flex items-start justify-between">
            <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">{text}</p>
            <Edit3 className="w-3 h-3 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2 flex-shrink-0 group-hover:scale-110" />
          </div>
        </div>
      )}
    </div>
  );
});

EditablePhrase.displayName = 'EditablePhrase';

/**
 * BilingualComparisonView - Main component for bilingual content comparison
 *
 * Provides side-by-side English/Spanish comparison with inline editing,
 * translation completeness tracking, and missing translation detection.
 *
 * @param props - Component properties
 * @returns Rendered bilingual comparison interface
 */
export const BilingualComparisonView: React.FC<BilingualComparisonViewProps> = ({
  content,
  onEdit,
  onSave,
  className = '',
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  // Parse content and find missing translations
  const { englishPhrases, spanishPhrases } = useMemo(
    () => parseBilingualContent(content),
    [content]
  );

  const { missingEnglish, missingSpanish } = useMemo(
    () => findMissingTranslations(englishPhrases, spanishPhrases),
    [englishPhrases, spanishPhrases]
  );

  const maxLength = Math.max(englishPhrases.length, spanishPhrases.length);

  // Pad arrays to same length for display (memoized)
  const { paddedEnglish, paddedSpanish } = useMemo(() => {
    const paddedEn = [...englishPhrases];
    const paddedEs = [...spanishPhrases];

    while (paddedEn.length < maxLength) {
      paddedEn.push({ english: '', spanish: '', lineNumber: 0 });
    }
    while (paddedEs.length < maxLength) {
      paddedEs.push({ english: '', spanish: '', lineNumber: 0 });
    }

    return {
      paddedEnglish: paddedEn,
      paddedSpanish: paddedEs,
    };
  }, [englishPhrases, spanishPhrases, maxLength]);

  // Calculate translation accuracy (memoized)
  const translationAccuracy = useMemo(
    () =>
      maxLength > 0
        ? Math.round(
            ((maxLength - missingEnglish.length - missingSpanish.length) / maxLength) * 100
          )
        : 100,
    [maxLength, missingEnglish.length, missingSpanish.length]
  );

  // Handle save with transition
  const handleSave = useCallback(() => {
    if (onSave) {
      startTransition(() => {
        onSave();
      });
    }
  }, [onSave]);

  return (
    <div className={`bilingual-comparison-view ${className} transition-colors duration-200`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-all duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Bilingual Comparison
          </h2>

          {/* Translation Stats & Controls */}
          <div className="flex items-center gap-4">
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

            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Phrase pairs: </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{maxLength}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
              {translationAccuracy === 100 ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
              <span className="text-sm">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {translationAccuracy}%
                </span>{' '}
                <span className="text-gray-600 dark:text-gray-400">complete</span>
              </span>
            </div>

            {onSave && (
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50"
                aria-label="Save all changes"
              >
                <Save className="w-4 h-4" />
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        {/* Warnings */}
        {(missingEnglish.length > 0 || missingSpanish.length > 0) && (
          <div
            className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300"
            role="alert"
          >
            <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                {missingSpanish.length > 0 &&
                  `${missingSpanish.length} missing Spanish translation(s)`}
                {missingSpanish.length > 0 && missingEnglish.length > 0 && ', '}
                {missingEnglish.length > 0 &&
                  `${missingEnglish.length} missing English translation(s)`}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        {/* English Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-2xl" role="img" aria-label="United States flag">
              🇺🇸
            </span>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">English</h3>
            <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded transition-colors duration-200">
              Source Language
            </span>
          </div>

          <div className="space-y-1" role="list" aria-label="English phrases">
            {paddedEnglish.map((phrase, idx) => (
              <div key={`en-${idx}`} role="listitem">
                <EditablePhrase
                  text={phrase.english}
                  language="en"
                  index={idx}
                  onEdit={onEdit}
                  highlightIfMissing={missingEnglish.includes(idx)}
                />
              </div>
            ))}
          </div>

          {paddedEnglish.length === 0 && (
            <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
              <p>No English content found</p>
            </div>
          )}
        </div>

        {/* Spanish Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-2xl" role="img" aria-label="Colombia flag">
              🇨🇴
            </span>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
              Español (Colombian)
            </h3>
            <span className="ml-auto text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded transition-colors duration-200">
              Target Language
            </span>
          </div>

          <div className="space-y-1" role="list" aria-label="Spanish phrases">
            {paddedSpanish.map((phrase, idx) => (
              <div key={`es-${idx}`} role="listitem">
                <EditablePhrase
                  text={phrase.spanish}
                  language="es"
                  index={idx}
                  onEdit={onEdit}
                  highlightIfMissing={missingSpanish.includes(idx)}
                />
              </div>
            ))}
          </div>

          {paddedSpanish.length === 0 && (
            <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
              <p>No Spanish content found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
