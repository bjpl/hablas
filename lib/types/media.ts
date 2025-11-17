/**
 * Media Type Definitions
 * Extends existing Resource interface for multimedia content review
 */

import type { Resource } from '@/data/resources';

export interface MediaMetadata {
  duration?: number; // For audio/video in seconds
  dimensions?: { width: number; height: number }; // For image/video
  format: string; // File format (mp3, mp4, jpg, etc.)
  size: number; // File size in bytes
  bitrate?: number; // For audio/video
  sampleRate?: number; // For audio
  channels?: number; // For audio (1 = mono, 2 = stereo)
  createdAt?: string;
  modifiedAt?: string;
}

export interface MediaResource extends Resource {
  metadata?: MediaMetadata;
  transcript?: string; // For audio/video content
  thumbnailUrl?: string; // For video content
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface WaveformData {
  peaks: number[];
  length: number;
  bits: number;
}

export interface MediaUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface MediaUploadResult {
  success: boolean;
  url: string;
  metadata: MediaMetadata;
  error?: string;
}

export interface MediaStreamOptions {
  resourceId: number;
  startTime?: number;
  endTime?: number;
  quality?: 'low' | 'medium' | 'high';
}

export type MediaType = 'pdf' | 'audio' | 'image' | 'video';

export interface MediaReviewProps {
  resource: MediaResource;
  onSave: (content: string) => Promise<void>;
  onMediaUpload?: (file: File) => Promise<MediaUploadResult>;
}
