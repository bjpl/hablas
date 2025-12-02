/**
 * Review Component Types
 *
 * Defines the content model for Hablas resource review system:
 * - PDF content: Comprehensive reference guides
 * - Audio script: Concise listening lessons
 * - Audio recording: TTS verification
 */

import type { Resource } from '@/data/resources';

/** Content status in review workflow */
export type ContentStatus = 'draft' | 'pending' | 'approved' | 'rejected';

/** Content piece with edit tracking */
export interface ReviewContent {
  id: string;
  original: string;
  edited: string;
  status: ContentStatus;
  lastModified?: string;
  editedBy?: string;
}

/** Resource with all content pieces for review */
export interface ReviewableResource {
  resource: Resource;
  pdfContent?: ReviewContent;
  audioScript?: ReviewContent;
  audioUrl?: string;
  hasAudio: boolean;
  hasAudioScript: boolean;
}

/** Props for content editors */
export interface EditorProps {
  content: ReviewContent;
  onChange: (edited: string) => void;
  onSave: () => Promise<void>;
  readOnly?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

/** Props for audio verification */
export interface AudioVerifierProps {
  audioUrl: string;
  scriptContent: string;
  onTimestampClick?: (time: number) => void;
}

/** Review save result */
export interface SaveResult {
  success: boolean;
  message?: string;
  error?: string;
}

/** Resource review mode */
export type ReviewMode = 'pdf' | 'audio-script' | 'comparison' | 'audio-verify';
