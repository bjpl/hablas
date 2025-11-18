'use client';

import React, { useMemo, useState } from 'react';
import type { DiffSegment } from '../types';

interface DiffViewerProps {
  leftContent: string;
  rightContent: string;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

type ViewMode = 'unified' | 'split';

/**
 * Advanced diff viewer component for comparing two content versions
 * Supports both unified and side-by-side views with line numbers and color coding
 */
export const DiffViewer: React.FC<DiffViewerProps> = ({
  leftContent,
  rightContent,
  leftLabel = 'Original',
  rightLabel = 'Modified',
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Generate diff segments
  const diffSegments = useMemo((): DiffSegment[] => {
    const leftLines = leftContent.split('\n');
    const rightLines = rightContent.split('\n');
    const maxLines = Math.max(leftLines.length, rightLines.length);
    const segments: DiffSegment[] = [];

    for (let i = 0; i < maxLines; i++) {
      const leftLine = leftLines[i] || '';
      const rightLine = rightLines[i] || '';

      if (leftLine === rightLine) {
        segments.push({
          type: 'equal',
          text: rightLine,
          line: i + 1,
        });
      } else if (!leftLine && rightLine) {
        segments.push({
          type: 'insert',
          text: rightLine,
          line: i + 1,
        });
      } else if (leftLine && !rightLine) {
        segments.push({
          type: 'delete',
          text: leftLine,
          line: i + 1,
        });
      } else {
        segments.push({
          type: 'replace',
          text: rightLine,
          line: i + 1,
        });
      }
    }

    return segments;
  }, [leftContent, rightContent]);

  // Calculate statistics
  const stats = useMemo(() => {
    const insertions = diffSegments.filter(d => d.type === 'insert').length;
    const deletions = diffSegments.filter(d => d.type === 'delete').length;
    const replacements = diffSegments.filter(d => d.type === 'replace').length;
    const unchanged = diffSegments.filter(d => d.type === 'equal').length;

    return { insertions, deletions, replacements, unchanged };
  }, [diffSegments]);

  // Render line number
  const LineNumber: React.FC<{ num: number; type?: string }> = ({ num, type }) => (
    <span
      className={`
        inline-block w-12 text-right pr-3 select-none text-xs
        ${type === 'insert' ? 'bg-green-100 text-green-700' : ''}
        ${type === 'delete' ? 'bg-red-100 text-red-700' : ''}
        ${type === 'replace' ? 'bg-amber-100 text-amber-700' : ''}
        ${type === 'equal' ? 'bg-gray-50 text-gray-500' : ''}
      `}
    >
      {num}
    </span>
  );

  // Render unified view
  const renderUnifiedView = () => {
    const leftLines = leftContent.split('\n');
    const rightLines = rightContent.split('\n');

    return (
      <div className="font-mono text-sm overflow-auto border border-gray-300 rounded-md">
        {diffSegments.map((segment, index) => {
          const leftLine = leftLines[segment.line - 1];
          const rightLine = rightLines[segment.line - 1];

          if (segment.type === 'equal') {
            return (
              <div key={index} className="flex hover:bg-gray-50">
                <LineNumber num={segment.line} type="equal" />
                <span className="flex-1 px-3 py-1 whitespace-pre-wrap break-words">
                  {segment.text || '\u00A0'}
                </span>
              </div>
            );
          }

          if (segment.type === 'delete') {
            return (
              <div key={index} className="flex bg-red-50 border-l-4 border-red-500">
                <LineNumber num={segment.line} type="delete" />
                <span className="flex-1 px-3 py-1 text-red-800 whitespace-pre-wrap break-words">
                  - {segment.text || '\u00A0'}
                </span>
              </div>
            );
          }

          if (segment.type === 'insert') {
            return (
              <div key={index} className="flex bg-green-50 border-l-4 border-green-500">
                <LineNumber num={segment.line} type="insert" />
                <span className="flex-1 px-3 py-1 text-green-800 whitespace-pre-wrap break-words">
                  + {segment.text || '\u00A0'}
                </span>
              </div>
            );
          }

          // Replace: show both delete and insert
          return (
            <React.Fragment key={index}>
              <div className="flex bg-red-50 border-l-4 border-red-500">
                <LineNumber num={segment.line} type="delete" />
                <span className="flex-1 px-3 py-1 text-red-800 whitespace-pre-wrap break-words">
                  - {leftLine || '\u00A0'}
                </span>
              </div>
              <div className="flex bg-green-50 border-l-4 border-green-500">
                <LineNumber num={segment.line} type="insert" />
                <span className="flex-1 px-3 py-1 text-green-800 whitespace-pre-wrap break-words">
                  + {rightLine || '\u00A0'}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Render split view
  const renderSplitView = () => {
    const leftLines = leftContent.split('\n');
    const rightLines = rightContent.split('\n');

    return (
      <div className="grid grid-cols-2 gap-1 border border-gray-300 rounded-md overflow-hidden">
        {/* Left pane */}
        <div className="border-r border-gray-300">
          <div className="bg-gray-100 px-3 py-2 text-sm font-semibold border-b border-gray-300">
            {leftLabel}
          </div>
          <div className="font-mono text-sm overflow-auto">
            {diffSegments.map((segment, index) => {
              const leftLine = leftLines[segment.line - 1];
              const showDelete = segment.type === 'delete' || segment.type === 'replace';

              return (
                <div
                  key={index}
                  className={`
                    flex hover:bg-gray-50
                    ${showDelete ? 'bg-red-50' : ''}
                    ${segment.type === 'insert' ? 'bg-gray-100 opacity-50' : ''}
                  `}
                >
                  <LineNumber
                    num={segment.line}
                    type={showDelete ? 'delete' : segment.type}
                  />
                  <span
                    className={`
                      flex-1 px-3 py-1 whitespace-pre-wrap break-words
                      ${showDelete ? 'text-red-800 border-l-4 border-red-500' : ''}
                      ${segment.type === 'insert' ? 'text-gray-400' : ''}
                    `}
                  >
                    {leftLine !== undefined ? leftLine : '\u00A0'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right pane */}
        <div>
          <div className="bg-gray-100 px-3 py-2 text-sm font-semibold border-b border-gray-300">
            {rightLabel}
          </div>
          <div className="font-mono text-sm overflow-auto">
            {diffSegments.map((segment, index) => {
              const rightLine = rightLines[segment.line - 1];
              const showInsert = segment.type === 'insert' || segment.type === 'replace';

              return (
                <div
                  key={index}
                  className={`
                    flex hover:bg-gray-50
                    ${showInsert ? 'bg-green-50' : ''}
                    ${segment.type === 'delete' ? 'bg-gray-100 opacity-50' : ''}
                  `}
                >
                  <LineNumber
                    num={segment.line}
                    type={showInsert ? 'insert' : segment.type}
                  />
                  <span
                    className={`
                      flex-1 px-3 py-1 whitespace-pre-wrap break-words
                      ${showInsert ? 'text-green-800 border-l-4 border-green-500' : ''}
                      ${segment.type === 'delete' ? 'text-gray-400' : ''}
                    `}
                  >
                    {rightLine !== undefined ? rightLine : '\u00A0'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`diff-viewer ${className}`}>
      {/* Header with stats and view toggle */}
      <div className="mb-3 flex items-center justify-between gap-4 p-3 bg-gray-50 border border-gray-300 rounded-md">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-green-700 font-medium">
            +{stats.insertions} additions
          </span>
          <span className="text-red-700 font-medium">
            -{stats.deletions} deletions
          </span>
          {stats.replacements > 0 && (
            <span className="text-amber-700 font-medium">
              ~{stats.replacements} changes
            </span>
          )}
          <span className="text-gray-600">
            {stats.unchanged} unchanged
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('unified')}
            className={`
              px-3 py-1 text-xs font-medium rounded transition-colors
              ${viewMode === 'unified'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }
            `}
          >
            Unified
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`
              px-3 py-1 text-xs font-medium rounded transition-colors
              ${viewMode === 'split'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }
            `}
          >
            Split
          </button>
        </div>
      </div>

      {/* Diff content */}
      <div className="max-h-[600px] overflow-auto">
        {viewMode === 'unified' ? renderUnifiedView() : renderSplitView()}
      </div>
    </div>
  );
};
