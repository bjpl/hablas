/**
 * useMediaPlayer Hook
 *
 * Custom hook for managing audio/video playback state
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { AudioPlayerState } from '@/lib/types/media';

interface UseMediaPlayerOptions {
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onError?: (error: string) => void;
}

export function useMediaPlayer({
  src,
  autoPlay = false,
  loop = false,
  onEnded,
  onTimeUpdate,
  onError,
}: UseMediaPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = 'metadata';
    audioRef.current = audio;

    if (autoPlay) {
      audio.play().catch(err => {
        console.error('Auto-play failed:', err);
      });
    }

    audio.loop = loop;

    // Event handlers
    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
      }));
    };

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      setState(prev => ({ ...prev, currentTime }));
      onTimeUpdate?.(currentTime);
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      onEnded?.();
    };

    const handleError = () => {
      const errorMessage = 'Failed to load media file';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      onError?.(errorMessage);
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audio.src = '';
    };
  }, [src, autoPlay, loop, onEnded, onTimeUpdate, onError]);

  const play = useCallback(async () => {
    try {
      await audioRef.current?.play();
    } catch (err) {
      console.error('Play failed:', err);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(state.duration, time));
    }
  }, [state.duration]);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      audioRef.current.volume = clampedVolume;
      setState(prev => ({ ...prev, volume: clampedVolume }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMuted = !state.isMuted;
      audioRef.current.muted = newMuted;
      setState(prev => ({ ...prev, isMuted: newMuted }));
    }
  }, [state.isMuted]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setState(prev => ({ ...prev, playbackRate: rate }));
    }
  }, []);

  return {
    state,
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    audioElement: audioRef.current,
  };
}
