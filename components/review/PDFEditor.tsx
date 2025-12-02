'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Eye, Edit3, CheckCircle, AlertCircle } from 'lucide-react';
import type { EditorProps } from './types';

interface PDFEditorProps extends EditorProps {
  title?: string;
  description?: string;
}

/**
 * PDFEditor Component
 *
 * Editor for PDF/reference content with:
 * - Split view (edit/preview)
 * - Auto-save support
 * - Change tracking
 * - Markdown preview
 */
export function PDFEditor({
  content,
  onChange,
  onSave,
  readOnly = false,
  autoSave = true,
  autoSaveDelay = 3000,
  title = 'Reference Content',
  description = 'Edit the comprehensive reference guide content',
}: PDFEditorProps) {
  const [view, setView] = useState<'edit' | 'preview' | 'split'>('split');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Track changes
  useEffect(() => {
    setHasChanges(content.edited !== content.original);
  }, [content.edited, content.original]);

  // Auto-save logic
  useEffect(() => {
    if (!autoSave || readOnly || !hasChanges) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(async () => {
      await handleSave();
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content.edited, autoSave, autoSaveDelay, hasChanges, readOnly]);

  const handleSave = useCallback(async () => {
    if (saving || readOnly) return;

    setSaving(true);
    try {
      await onSave();
      setLastSaved(new Date());
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  }, [onSave, saving, readOnly]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // Simple markdown preview (basic rendering)
  const renderPreview = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-blue-800">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold mt-6 mb-4">{line.slice(2)}</h1>;
        }
        // Lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} className="ml-4">{line.slice(2)}</li>;
        }
        // Horizontal rule
        if (line.startsWith('---')) {
          return <hr key={i} className="my-4 border-gray-300" />;
        }
        // Bold text
        const boldText = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        // Empty line
        if (!line.trim()) {
          return <br key={i} />;
        }
        return <p key={i} className="my-1" dangerouslySetInnerHTML={{ __html: boldText }} />;
      });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status indicator */}
            {hasChanges ? (
              <span className="flex items-center gap-1.5 text-sm text-amber-600">
                <AlertCircle className="w-4 h-4" />
                Unsaved changes
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Saved
              </span>
            ) : null}

            {/* View toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('edit')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === 'edit' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                }`}
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('split')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === 'split' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setView('preview')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === 'preview' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                }`}
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Save button */}
            {!readOnly && (
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className={`${view === 'split' ? 'grid grid-cols-2 divide-x divide-gray-200' : ''}`}>
        {/* Editor */}
        {(view === 'edit' || view === 'split') && (
          <div className="p-4">
            <textarea
              value={content.edited}
              onChange={handleChange}
              readOnly={readOnly}
              className="w-full h-[600px] p-4 font-mono text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter content..."
            />
          </div>
        )}

        {/* Preview */}
        {(view === 'preview' || view === 'split') && (
          <div className="p-4">
            <div className="h-[600px] overflow-y-auto p-4 bg-gray-50 rounded-lg prose prose-sm max-w-none">
              {renderPreview(content.edited)}
            </div>
          </div>
        )}
      </div>

      {/* Footer with metadata */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
        <span>Status: {content.status}</span>
        {content.lastModified && (
          <span>Last modified: {new Date(content.lastModified).toLocaleString()}</span>
        )}
      </div>
    </div>
  );
}
