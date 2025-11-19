/**
 * HablasFormatComparisonTool Component
 * Tab-based comparison for PDF, Web, and Audio formats with auto-sync
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  FileText,
  Globe,
  Headphones,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { DiffHighlighter } from './DiffHighlighter';
import { FormatDifference } from '@/lib/content-validation/types';

interface FormatContent {
  pdf: string;
  web: string;
  audio: string;
}

interface HablasFormatComparisonToolProps {
  resourceId: number;
  formats: FormatContent;
  onSync?: (sourceFormat: keyof FormatContent, targetFormats: (keyof FormatContent)[]) => Promise<void>;
  onFormatUpdate?: (format: keyof FormatContent, content: string) => void;
  className?: string;
}

type ComparisonMode = 'pdf-web' | 'pdf-audio' | 'web-audio';

interface TabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const Tab: React.FC<TabProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 font-medium rounded-t-lg transition-colors ${
      active
        ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-b'
    }`}
    aria-selected={active}
    role="tab"
  >
    {icon}
    <span>{label}</span>
  </button>
);

/**
 * Detect differences between two content strings
 */
function detectDifferences(source: string, target: string): FormatDifference[] {
  const differences: FormatDifference[] = [];
  const sourceLines = source.split('\n');
  const targetLines = target.split('\n');

  const maxLines = Math.max(sourceLines.length, targetLines.length);

  for (let i = 0; i < maxLines; i++) {
    const sourceLine = sourceLines[i] || '';
    const targetLine = targetLines[i] || '';

    if (sourceLine !== targetLine) {
      if (!sourceLine && targetLine) {
        differences.push({
          type: 'addition',
          line: i + 1,
          content: targetLine,
        });
      } else if (sourceLine && !targetLine) {
        differences.push({
          type: 'deletion',
          line: i + 1,
          content: sourceLine,
        });
      } else {
        differences.push({
          type: 'modification',
          line: i + 1,
          content: targetLine,
          suggestion: sourceLine,
        });
      }
    }
  }

  return differences;
}

export const HablasFormatComparisonTool: React.FC<HablasFormatComparisonToolProps> = ({
  resourceId,
  formats,
  onSync,
  onFormatUpdate,
  className = '',
}) => {
  const [activeComparison, setActiveComparison] = useState<ComparisonMode>('pdf-web');
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Parse comparison mode
  const [leftFormat, rightFormat] = activeComparison.split('-') as [
    keyof FormatContent,
    keyof FormatContent
  ];

  // Calculate differences
  const differences = useMemo(
    () => detectDifferences(formats[leftFormat], formats[rightFormat]),
    [formats, leftFormat, rightFormat]
  );

  const totalDifferences = differences.length;
  const hasDifferences = totalDifferences > 0;

  // Auto-sync handler
  const handleAutoSync = useCallback(async () => {
    if (!onSync) return;

    setSyncing(true);
    try {
      // Sync from left (source) to right (target)
      await onSync(leftFormat, [rightFormat]);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  }, [onSync, leftFormat, rightFormat]);

  // Sync all formats
  const handleSyncAll = useCallback(async () => {
    if (!onSync) return;

    setSyncing(true);
    try {
      // Sync PDF to both Web and Audio
      await onSync('pdf', ['web', 'audio']);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (error) {
      console.error('Sync all failed:', error);
    } finally {
      setSyncing(false);
    }
  }, [onSync]);

  const getFormatIcon = (format: keyof FormatContent) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'web':
        return <Globe className="w-4 h-4" />;
      case 'audio':
        return <Headphones className="w-4 h-4" />;
    }
  };

  const getFormatLabel = (format: keyof FormatContent) => {
    switch (format) {
      case 'pdf':
        return 'PDF';
      case 'web':
        return 'Web';
      case 'audio':
        return 'Audio';
    }
  };

  return (
    <div className={`hablas-format-comparison-tool ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Format Comparison</h2>
            <p className="text-sm text-gray-600 mt-1">
              Compare and synchronize PDF, Web, and Audio formats for Resource #{resourceId}
            </p>
          </div>

          {/* Sync All Button */}
          {onSync && (
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync All from PDF'}
            </button>
          )}
        </div>
      </div>

      {/* Format Comparison Tabs */}
      <div className="bg-gray-100 border-b border-gray-200 px-6">
        <div className="flex gap-1" role="tablist">
          <Tab
            active={activeComparison === 'pdf-web'}
            onClick={() => setActiveComparison('pdf-web')}
            icon={
              <>
                <FileText className="w-4 h-4" />
                <span>↔</span>
                <Globe className="w-4 h-4" />
              </>
            }
            label="PDF ↔ Web"
          />
          <Tab
            active={activeComparison === 'pdf-audio'}
            onClick={() => setActiveComparison('pdf-audio')}
            icon={
              <>
                <FileText className="w-4 h-4" />
                <span>↔</span>
                <Headphones className="w-4 h-4" />
              </>
            }
            label="PDF ↔ Audio"
          />
          <Tab
            active={activeComparison === 'web-audio'}
            onClick={() => setActiveComparison('web-audio')}
            icon={
              <>
                <Globe className="w-4 h-4" />
                <span>↔</span>
                <Headphones className="w-4 h-4" />
              </>
            }
            label="Web ↔ Audio"
          />
        </div>
      </div>

      {/* Sync Status & Suggestions */}
      {syncSuccess && (
        <div className="mx-6 mt-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Sync Successful</p>
              <p className="text-sm text-green-800 mt-1">
                All formats have been synchronized successfully.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasDifferences && !syncSuccess && (
        <div className="mx-6 mt-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900">
                  Format Inconsistencies Detected
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  {totalDifferences} difference{totalDifferences !== 1 ? 's' : ''} found
                  between {getFormatLabel(leftFormat)} and {getFormatLabel(rightFormat)}{' '}
                  formats.
                </p>
                {onSync && (
                  <button
                    onClick={handleAutoSync}
                    disabled={syncing}
                    className="mt-3 text-sm font-medium text-amber-900 underline hover:text-amber-700 disabled:opacity-50"
                  >
                    {syncing
                      ? 'Syncing...'
                      : `Auto-sync from ${getFormatLabel(leftFormat)} to ${getFormatLabel(
                          rightFormat
                        )} →`}
                  </button>
                )}
              </div>
            </div>

            {/* Difference Summary */}
            <div className="mt-3 pl-8">
              <ul className="text-xs text-amber-700 space-y-1">
                <li>
                  • {differences.filter(d => d.type === 'addition').length} additions
                </li>
                <li>
                  • {differences.filter(d => d.type === 'deletion').length} deletions
                </li>
                <li>
                  • {differences.filter(d => d.type === 'modification').length}{' '}
                  modifications
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {!hasDifferences && !syncSuccess && (
        <div className="mx-6 mt-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Formats are Synchronized</p>
              <p className="text-sm text-green-800 mt-1">
                No differences detected between {getFormatLabel(leftFormat)} and{' '}
                {getFormatLabel(rightFormat)} formats.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Diff View */}
      <div className="p-6 bg-gray-50">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getFormatIcon(leftFormat)}
                <span className="text-sm font-semibold text-gray-700">
                  {getFormatLabel(leftFormat)} (Source)
                </span>
              </div>
              <span className="text-gray-400">vs</span>
              <div className="flex items-center gap-2">
                {getFormatIcon(rightFormat)}
                <span className="text-sm font-semibold text-gray-700">
                  {getFormatLabel(rightFormat)} (Target)
                </span>
              </div>
            </div>

            {/* Difference Count */}
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{totalDifferences}</span> difference
              {totalDifferences !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Diff Content */}
          <div className="p-0">
            <DiffHighlighter
              original={formats[leftFormat]}
              edited={formats[rightFormat]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
