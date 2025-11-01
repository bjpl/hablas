/**
 * TypeScript types for Audio Player and utilities
 */

export interface AudioMetadata {
  duration?: string;
  voice?: string;
  accent?: string;
  narrator?: string;
}

export interface AudioPlayerProps {
  audioUrl?: string;
  label?: string;
  className?: string;
  autoplay?: boolean;
  title?: string;
  metadata?: AudioMetadata;
  resourceId?: number;
  enhanced?: boolean;
}

export interface AudioCacheStatus {
  isCached: boolean;
  isPreloading: boolean;
  error?: string;
}

export interface AudioPreloadOptions {
  priority?: 'high' | 'low';
  resourceId?: number;
}

export interface AudioDownloadResult {
  success: boolean;
  error?: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isLooping: boolean;
  isCached: boolean;
  isDownloading: boolean;
}

export interface AudioControlsConfig {
  showPlayback: boolean;
  showVolume: boolean;
  showLoop: boolean;
  showDownload: boolean;
  showSpeed: boolean;
  playbackRates: number[];
  maxVolume: number;
}

export const DEFAULT_AUDIO_CONTROLS: AudioControlsConfig = {
  showPlayback: true,
  showVolume: true,
  showLoop: true,
  showDownload: true,
  showSpeed: true,
  playbackRates: [0.5, 0.75, 1, 1.25, 1.5],
  maxVolume: 1
};
