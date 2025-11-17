'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { Edit3, RotateCcw, Download } from 'lucide-react';

interface EditPanelProps {
  content: string;
  onChange: (content: string) => void;
  isDirty?: boolean;
  onSave?: () => void;
  className?: string;
}

export const EditPanel: React.FC<EditPanelProps> = ({
  content,
  onChange,
  isDirty = false,
  onSave,
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle content change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (onSave && isDirty) {
        onSave();
      }
    }
  }, [onSave, isDirty]);

  // Handle export/download
  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edited-content-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className={`edit-panel ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-700">
            Edit Content
          </h2>
          {isDirty && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-100 rounded">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleDownload}
            className="ml-auto p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Download edited content"
            aria-label="Download content"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="p-6">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="
            w-full px-4 py-3
            text-gray-800 leading-relaxed
            border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            resize-none
            font-mono text-sm
          "
          style={{
            minHeight: '400px',
            maxHeight: '600px',
          }}
          placeholder="Enter your content here..."
          aria-label="Content editor"
        />
        <p className="mt-2 text-xs text-gray-500">
          Tip: Press Ctrl+S (or Cmd+S on Mac) to save quickly
        </p>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Characters: {content?.length || 0} | Words: {content?.split(/\s+/).filter(Boolean).length || 0}
          </p>
          {isDirty && (
            <p className="text-xs text-amber-600 font-medium">
              Auto-saving...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
