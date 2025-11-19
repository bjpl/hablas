/**
 * BilingualComparisonView Component
 * Side-by-side English/Spanish editor with inline editing capability
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Edit3, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  parseBilingualContent,
  findMissingTranslations,
} from '@/lib/content-validation/bilingual-parser';
import { BilingualPhrase } from '@/lib/content-validation/types';

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

const EditablePhrase: React.FC<EditablePhraseProps> = ({
  text,
  language,
  index,
  onEdit,
  highlightIfMissing,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);

  const handleSave = useCallback(() => {
    if (editedText !== text) {
      onEdit(language, index, editedText);
    }
    setIsEditing(false);
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

  if (!text && highlightIfMissing) {
    return (
      <div className="p-3 mb-2 bg-red-50 border-l-4 border-red-400 rounded">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Missing translation</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3 mb-2 rounded border-l-4 transition-colors ${
        highlightIfMissing
          ? 'bg-yellow-50 border-yellow-400'
          : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
      }`}
    >
      {isEditing ? (
        <div>
          <textarea
            value={editedText}
            onChange={e => setEditedText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            autoFocus
            aria-label={`Edit ${language === 'en' ? 'English' : 'Spanish'} phrase`}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Save (Ctrl+Enter)
            </button>
            <button
              onClick={() => {
                setEditedText(text);
                setIsEditing(false);
              }}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel (Esc)
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsEditing(true);
            }
          }}
        >
          <div className="flex items-start justify-between">
            <p className="text-sm text-gray-800 flex-1">{text}</p>
            <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
};

export const BilingualComparisonView: React.FC<BilingualComparisonViewProps> = ({
  content,
  onEdit,
  onSave,
  className = '',
}) => {
  const { englishPhrases, spanishPhrases } = parseBilingualContent(content);
  const { missingEnglish, missingSpanish } = findMissingTranslations(
    englishPhrases,
    spanishPhrases
  );

  const maxLength = Math.max(englishPhrases.length, spanishPhrases.length);

  // Pad arrays to same length for display
  const paddedEnglish = [...englishPhrases];
  const paddedSpanish = [...spanishPhrases];

  while (paddedEnglish.length < maxLength) {
    paddedEnglish.push({ english: '', spanish: '', lineNumber: 0 });
  }
  while (paddedSpanish.length < maxLength) {
    paddedSpanish.push({ english: '', spanish: '', lineNumber: 0 });
  }

  const translationAccuracy =
    maxLength > 0
      ? Math.round(
          ((maxLength - missingEnglish.length - missingSpanish.length) / maxLength) * 100
        )
      : 100;

  return (
    <div className={`bilingual-comparison-view ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Bilingual Comparison</h2>

          {/* Translation Stats */}
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-600">Phrase pairs: </span>
              <span className="font-semibold text-gray-900">{maxLength}</span>
            </div>
            <div className="flex items-center gap-2">
              {translationAccuracy === 100 ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span className="text-sm">
                <span className="font-semibold">{translationAccuracy}%</span>{' '}
                <span className="text-gray-600">complete</span>
              </span>
            </div>
            {onSave && (
              <button
                onClick={onSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Warnings */}
        {(missingEnglish.length > 0 || missingSpanish.length > 0) && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              {missingSpanish.length > 0 &&
                `${missingSpanish.length} missing Spanish translation(s)`}
              {missingSpanish.length > 0 && missingEnglish.length > 0 && ', '}
              {missingEnglish.length > 0 &&
                `${missingEnglish.length} missing English translation(s)`}
            </p>
          </div>
        )}
      </div>

      {/* Split View */}
      <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 min-h-screen">
        {/* English Column */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
            <span className="text-2xl" role="img" aria-label="United States flag">
              🇺🇸
            </span>
            <h3 className="font-bold text-gray-900 text-lg">English</h3>
            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Source Language
            </span>
          </div>

          <div className="space-y-1">
            {paddedEnglish.map((phrase, idx) => (
              <EditablePhrase
                key={`en-${idx}`}
                text={phrase.english}
                language="en"
                index={idx}
                onEdit={onEdit}
                highlightIfMissing={missingEnglish.includes(idx)}
              />
            ))}
          </div>

          {paddedEnglish.length === 0 && (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No English content found</p>
            </div>
          )}
        </div>

        {/* Spanish Column */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
            <span className="text-2xl" role="img" aria-label="Colombia flag">
              🇨🇴
            </span>
            <h3 className="font-bold text-gray-900 text-lg">Español (Colombian)</h3>
            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              Target Language
            </span>
          </div>

          <div className="space-y-1">
            {paddedSpanish.map((phrase, idx) => (
              <EditablePhrase
                key={`es-${idx}`}
                text={phrase.spanish}
                language="es"
                index={idx}
                onEdit={onEdit}
                highlightIfMissing={missingSpanish.includes(idx)}
              />
            ))}
          </div>

          {paddedSpanish.length === 0 && (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No Spanish content found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
