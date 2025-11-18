'use client';

import { useState } from 'react';
import { ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import type { SyncOperation } from '../types';

interface SyncControlsProps {
  onSync: (operation: SyncOperation) => void;
  dirtyStates: {
    downloadable: boolean;
    web: boolean;
    audio: boolean;
  };
  disabled?: boolean;
}

export function SyncControls({ onSync, dirtyStates, disabled = false }: SyncControlsProps) {
  const [pendingOperation, setPendingOperation] = useState<SyncOperation | null>(null);

  const handleSyncClick = (operation: SyncOperation) => {
    setPendingOperation(operation);
  };

  const confirmSync = () => {
    if (pendingOperation) {
      onSync(pendingOperation);
      setPendingOperation(null);
    }
  };

  const cancelSync = () => {
    setPendingOperation(null);
  };

  const getSyncLabel = (operation: SyncOperation): string => {
    const labels: Record<SyncOperation, string> = {
      'downloadable-to-web': 'Downloadable → Web',
      'web-to-downloadable': 'Web → Downloadable',
      'downloadable-to-audio': 'Downloadable → Audio',
      'audio-to-downloadable': 'Audio → Downloadable',
      'web-to-audio': 'Web → Audio',
      'audio-to-web': 'Audio → Web',
      'sync-all-to-downloadable': 'All → Downloadable',
      'sync-all-to-web': 'All → Web',
      'sync-all-to-audio': 'All → Audio',
    };
    return labels[operation];
  };

  const getTargetDirty = (operation: SyncOperation): boolean => {
    if (operation.includes('to-web')) return dirtyStates.web;
    if (operation.includes('to-downloadable')) return dirtyStates.downloadable;
    if (operation.includes('to-audio')) return dirtyStates.audio;
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Dirty State Indicators */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span className="font-medium">Unsaved changes:</span>
        {dirtyStates.downloadable && (
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-600 rounded">
            <AlertCircle className="h-3 w-3" />
            Downloadable
          </span>
        )}
        {dirtyStates.web && (
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-600 rounded">
            <AlertCircle className="h-3 w-3" />
            Web
          </span>
        )}
        {dirtyStates.audio && (
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-600 rounded">
            <AlertCircle className="h-3 w-3" />
            Audio
          </span>
        )}
        {!dirtyStates.downloadable && !dirtyStates.web && !dirtyStates.audio && (
          <span className="text-green-600">None</span>
        )}
      </div>

      {/* Sync Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { op: 'downloadable-to-web' as SyncOperation, label: 'DL → Web' },
          { op: 'web-to-downloadable' as SyncOperation, label: 'Web → DL' },
          { op: 'downloadable-to-audio' as SyncOperation, label: 'DL → Audio' },
          { op: 'audio-to-downloadable' as SyncOperation, label: 'Audio → DL' },
          { op: 'web-to-audio' as SyncOperation, label: 'Web → Audio' },
          { op: 'audio-to-web' as SyncOperation, label: 'Audio → Web' },
        ].map(({ op, label }) => (
          <button
            key={op}
            onClick={() => handleSyncClick(op)}
            disabled={disabled}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>

      {/* Sync All Options */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { op: 'sync-all-to-downloadable' as SyncOperation, label: 'All → DL' },
          { op: 'sync-all-to-web' as SyncOperation, label: 'All → Web' },
          { op: 'sync-all-to-audio' as SyncOperation, label: 'All → Audio' },
        ].map(({ op, label }) => (
          <button
            key={op}
            onClick={() => handleSyncClick(op)}
            disabled={disabled}
            className="flex items-center justify-center gap-1 px-2 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {pendingOperation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-300 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Confirm Sync Operation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to sync <strong>{getSyncLabel(pendingOperation)}</strong>?
            </p>
            {getTargetDirty(pendingOperation) && (
              <div className="flex items-start gap-2 p-3 bg-amber-100 border border-amber-200 rounded mb-4">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-600">
                  The target panel has unsaved changes that will be overwritten.
                </p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelSync}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSync}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
