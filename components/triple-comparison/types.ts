/**
 * TypeScript interfaces for Triple Comparison View
 * Supports comparing downloadable, web, and audio content side-by-side
 */

export type ContentType = 'downloadable' | 'web' | 'audio';

export type ContentStatus = 'synced' | 'modified' | 'conflict' | 'unchanged';

export type SyncOperation =
  | 'downloadable-to-web'
  | 'web-to-downloadable'
  | 'downloadable-to-audio'
  | 'audio-to-downloadable'
  | 'web-to-audio'
  | 'audio-to-web'
  | 'sync-all-to-downloadable'
  | 'sync-all-to-web'
  | 'sync-all-to-audio';

export interface ContentData {
  text: string;
  status: ContentStatus;
  lastModified: Date;
  audioUrl?: string;
}

export interface VersionContent {
  current: string;
  original: string;
  isDirty: boolean;
}

export interface TripleComparisonViewProps {
  resourceId: string;
  downloadableUrl?: string;
  webUrl?: string;
  audioUrl?: string;
  onSave: (updates: ContentUpdate[]) => Promise<void>;
  onCancel?: () => void;
}

export interface ContentUpdate {
  type: ContentType;
  content: string;
}

export interface DiffSegment {
  type: 'equal' | 'insert' | 'delete' | 'replace';
  text: string;
  line: number;
}

export interface DiffResult {
  type1: ContentType;
  type2: ContentType;
  additions: number;
  deletions: number;
  changes: number;
  identical: boolean;
  timestamp: Date;
}

export interface SaveResult {
  success: boolean;
  type: ContentType;
  error?: string;
  timestamp: Date;
}

export interface TripleComparisonState {
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  errors: Record<ContentType, string | null>;
  lastSaved: Date | null;
}
