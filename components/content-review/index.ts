/**
 * Content Review Tool - Main exports
 *
 * A professional React-based content review tool with:
 * - Side-by-side comparison view
 * - Real-time editing with auto-save
 * - Manual save controls
 * - Diff highlighting
 * - Keyboard shortcuts (Ctrl+S to save)
 * - Download/export functionality
 * - Responsive, accessible design
 * - Multimedia support (audio, image, video)
 */

export { ContentReviewTool } from './ContentReviewTool';
export { ComparisonView } from './ComparisonView';
export { EditPanel } from './EditPanel';
export { DiffHighlighter } from './DiffHighlighter';
export { TopicReviewTool } from './TopicReviewTool';
export { TopicResourceTab } from './TopicResourceTab';
export { useAutoSave } from './hooks/useAutoSave';
export { useContentManager } from './hooks/useContentManager';
export { useTopicManager } from './hooks/useTopicManager';

export type { ContentItem } from './ContentReviewTool';
export type { TopicReviewToolProps } from './TopicReviewTool';
export type { ResourceEditState } from './hooks/useTopicManager';

// Re-export media review components for convenience
export { MediaReviewTool } from '@/components/media-review';
export type { MediaReviewProps } from '@/lib/types/media';
