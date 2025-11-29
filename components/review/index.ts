/**
 * Review Components
 *
 * Unified resource review system for Hablas content management.
 *
 * Content Model:
 * - PDF Content: Comprehensive reference guides (web + download)
 * - Audio Script: Concise narration scripts for TTS
 * - Audio Recording: TTS verification
 *
 * Usage:
 * ```tsx
 * import { ResourceReview } from '@/components/review';
 *
 * <ResourceReview resource={resource} />
 * ```
 */

// Main entry point
export { ResourceReview } from './ResourceReview';

// Individual editors
export { PDFEditor } from './PDFEditor';
export { AudioScriptEditor } from './AudioScriptEditor';
export { AudioVerifier } from './AudioVerifier';

// Hook for custom implementations
export { useResourceContent } from './useResourceContent';

// Types
export type {
  ReviewContent,
  ReviewableResource,
  EditorProps,
  AudioVerifierProps,
  SaveResult,
  ReviewMode,
  ContentStatus,
} from './types';
