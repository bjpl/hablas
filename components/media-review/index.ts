/**
 * Media Review Tool - Main exports
 *
 * Multimedia content review system that extends the existing ContentReviewTool
 * with support for audio, image, and video content.
 *
 * INTEGRATION:
 * - Wraps existing ContentReviewTool for text/PDF content
 * - Adds AudioReview with player + transcript editing
 * - Adds ImageReview with zoom/rotation controls
 * - Adds VideoReview with playback controls
 * - Maintains compatibility with existing API routes
 */

export { MediaReviewTool } from './MediaReviewTool';
export { AudioReview } from './AudioReview';
export { PDFWithAudioReview } from './PDFWithAudioReview';
export { AudioPlayer } from './AudioPlayer';
export { ImageReview } from './ImageReview';
export { VideoReview } from './VideoReview';

export type { MediaReviewProps } from '@/lib/types/media';
