'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, AlertCircle } from 'lucide-react';
import type { AudioPlayerState } from '@/lib/types/media';

interface AudioPlayerProps {
  src: string;
  className?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  className = '',
  onTimeUpdate,
  onEnded,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [resolvedSrc, setResolvedSrc] = useState<string>(src);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    isMuted: false,
    isLoading: true,
    error: null,
  });

  // Resolve audio URL - try blob storage first, fallback to public path
  useEffect(() => {
    const resolveUrl = async () => {
      // If already a full URL, use it
      if (src.startsWith('http://') || src.startsWith('https://')) {
        console.log('[AudioPlayer] Using full URL:', src);
        setResolvedSrc(src);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // In development, use local path directly
      if (process.env.NODE_ENV === 'development') {
        console.log('[AudioPlayer] Development mode, using local path:', src);
        setResolvedSrc(src);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // In production, try to get from blob storage
      const filename = src.replace(/^\/audio\//, '');
      console.log('[AudioPlayer] Resolving blob storage URL for:', filename);

      try {
        const response = await fetch(`/api/audio/${filename}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.url) {
            console.log('[AudioPlayer] Blob URL resolved:', data.url);
            setResolvedSrc(data.url);
            setState(prev => ({ ...prev, isLoading: false }));
            return;
          } else {
            console.warn('[AudioPlayer] API returned unsuccessful response:', data);
          }
        } else {
          console.warn('[AudioPlayer] API request failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('[AudioPlayer] Blob storage fetch error:', error);
      }

      // Fallback to original path
      console.log('[AudioPlayer] Falling back to original path:', src);
      setResolvedSrc(src);
      setState(prev => ({ ...prev, isLoading: false }));
    };

    resolveUrl();
  }, [src]);

  // Initialize audio element and reload when src changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !resolvedSrc) return;

    const handleLoadedMetadata = () => {
      console.log('[AudioPlayer] Audio metadata loaded:', {
        duration: audio.duration,
        src: resolvedSrc,
      });
      setState(prev => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
        error: null,
      }));
    };

    const handleCanPlay = () => {
      console.log('[AudioPlayer] Audio can play');
      setState(prev => ({ ...prev, isLoading: false, error: null }));
    };

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      setState(prev => ({ ...prev, currentTime }));
      onTimeUpdate?.(currentTime);
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      onEnded?.();
    };

    const handleError = () => {
      const audio = audioRef.current;
      let errorDetails = 'Failed to load audio file';

      if (audio?.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorDetails = 'Audio loading was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorDetails = 'Network error while loading audio';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorDetails = 'Audio file could not be decoded';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorDetails = 'Audio format not supported or file not found';
            break;
        }
      }

      console.error('[AudioPlayer] Audio error:', {
        code: audio?.error?.code,
        message: errorDetails,
        src: resolvedSrc,
        originalSrc: src,
      });

      setState(prev => ({
        ...prev,
        error: errorDetails,
        isLoading: false,
      }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Force reload when src changes
    console.log('[AudioPlayer] Loading audio from:', resolvedSrc);
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onTimeUpdate, onEnded, resolvedSrc]);

  // Play/Pause toggle
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  // Seek to position
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setState(prev => ({ ...prev, currentTime: time }));
  };

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const volume = parseFloat(e.target.value);
    audio.volume = volume;
    setState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
  };

  // Toggle mute
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const newMuted = !state.isMuted;
    audio.muted = newMuted;
    setState(prev => ({ ...prev, isMuted: newMuted }));
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(state.duration, audio.currentTime + seconds));
    audio.currentTime = newTime;
    setState(prev => ({ ...prev, currentTime: newTime }));
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (state.error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Audio Playback Error</p>
            <p className="text-xs text-red-700 mt-1">{state.error}</p>
            <div className="mt-2 p-2 bg-white rounded border border-red-200">
              <p className="text-xs text-gray-700">
                <strong>Source Path:</strong> {src}
              </p>
              <p className="text-xs text-gray-700 mt-1">
                <strong>Resolved URL:</strong>{' '}
                <span className="font-mono break-all">{resolvedSrc}</span>
              </p>
            </div>
            <details className="mt-2 text-xs text-red-600">
              <summary className="cursor-pointer font-medium hover:text-red-800">
                Troubleshooting Steps
              </summary>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Verify the audio file exists in blob storage</li>
                <li>Check browser console for detailed error logs</li>
                <li>Ensure BLOB_READ_WRITE_TOKEN is configured in production</li>
                <li>Try testing the resolved URL directly in a new browser tab</li>
                <li>Check if CORS headers are properly configured for blob storage</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`audio-player bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <audio
        ref={audioRef}
        src={resolvedSrc}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={state.duration || 0}
          value={state.currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          disabled={state.isLoading}
        />
        <div className="flex justify-between mt-1 text-xs text-gray-600">
          <span>{formatTime(state.currentTime)}</span>
          <span>{formatTime(state.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Skip Back */}
        <button
          onClick={() => skip(-10)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={state.isLoading}
          aria-label="Skip back 10 seconds"
        >
          <SkipBack className="w-5 h-5 text-gray-700" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50"
          disabled={state.isLoading}
          aria-label={state.isPlaying ? 'Pause' : 'Play'}
        >
          {state.isPlaying ? (
            <Pause className="w-6 h-6 text-white" fill="white" />
          ) : (
            <Play className="w-6 h-6 text-white" fill="white" />
          )}
        </button>

        {/* Skip Forward */}
        <button
          onClick={() => skip(10)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={state.isLoading}
          aria-label="Skip forward 10 seconds"
        >
          <SkipForward className="w-5 h-5 text-gray-700" />
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={toggleMute}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={state.isMuted ? 'Unmute' : 'Mute'}
          >
            {state.isMuted || state.volume === 0 ? (
              <VolumeX className="w-5 h-5 text-gray-700" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-700" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.isMuted ? 0 : state.volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Loading State */}
      {state.isLoading && (
        <div className="mt-2 text-sm text-gray-600">Loading audio...</div>
      )}
    </div>
  );
};
