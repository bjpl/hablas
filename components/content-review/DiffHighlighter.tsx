'use client';

import React, { useMemo } from 'react';

interface DiffHighlighterProps {
  original: string;
  edited: string;
  className?: string;
}

interface DiffResult {
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  content: string;
  lineNumber: number;
}

/**
 * Simple diff highlighting component
 * Compares original and edited content line-by-line
 */
export const DiffHighlighter: React.FC<DiffHighlighterProps> = ({
  original,
  edited,
  className = '',
}) => {
  const diff = useMemo(() => {
    const originalLines = original.split('\n');
    const editedLines = edited.split('\n');
    const maxLines = Math.max(originalLines.length, editedLines.length);
    const result: DiffResult[] = [];

    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const editedLine = editedLines[i] || '';

      if (originalLine === editedLine) {
        result.push({
          type: 'unchanged',
          content: editedLine,
          lineNumber: i + 1,
        });
      } else if (!originalLine && editedLine) {
        result.push({
          type: 'added',
          content: editedLine,
          lineNumber: i + 1,
        });
      } else if (originalLine && !editedLine) {
        result.push({
          type: 'removed',
          content: originalLine,
          lineNumber: i + 1,
        });
      } else {
        result.push({
          type: 'modified',
          content: editedLine,
          lineNumber: i + 1,
        });
      }
    }

    return result;
  }, [original, edited]);

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === 'added').length;
    const removed = diff.filter(d => d.type === 'removed').length;
    const modified = diff.filter(d => d.type === 'modified').length;
    return { added, removed, modified };
  }, [diff]);

  return (
    <div className={`diff-highlighter ${className}`}>
      {/* Stats Header */}
      <div className="px-4 py-2 bg-gray-100 border-b border-gray-300 flex items-center gap-4 text-xs">
        <span className="text-green-700 font-medium">
          +{stats.added} added
        </span>
        <span className="text-red-700 font-medium">
          -{stats.removed} removed
        </span>
        <span className="text-blue-700 font-medium">
          ~{stats.modified} modified
        </span>
      </div>

      {/* Diff Content */}
      <div className="p-4 font-mono text-sm overflow-auto" style={{ maxHeight: '500px' }}>
        {diff.map((line, index) => (
          <div
            key={index}
            className={`
              flex items-start px-2 py-1 rounded
              ${line.type === 'added' ? 'bg-green-50 border-l-4 border-green-500' : ''}
              ${line.type === 'removed' ? 'bg-red-50 border-l-4 border-red-500' : ''}
              ${line.type === 'modified' ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
              ${line.type === 'unchanged' ? 'text-gray-600' : ''}
            `}
          >
            <span className="inline-block w-12 text-gray-400 text-xs mr-4 flex-shrink-0">
              {line.lineNumber}
            </span>
            <span
              className={`
                flex-1 whitespace-pre-wrap break-words
                ${line.type === 'added' ? 'text-green-800' : ''}
                ${line.type === 'removed' ? 'text-red-800 line-through' : ''}
                ${line.type === 'modified' ? 'text-blue-800' : ''}
              `}
            >
              {line.content || '\u00A0'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
