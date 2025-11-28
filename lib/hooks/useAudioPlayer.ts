/**
 * Custom Hook for Audio Player Logic
 * Separates audio playback concerns from UI rendering
 * Implements modern React patterns and Web Audio API integration
 */

'use client';

import { useState, useRef, useEffect, useCallback, useTransition } from 'react';
import { useAudioContext } from '@/lib/contexts/AudioContext';
import {
  preloadAudio,
  isAudioCached,
  savePlaybackPosition,
  getPlaybackPosition,
  clearPlaybackPosition,
} from '@/lib/audio-utils';

export interface UseAudioPlayerOptions {
  audioUrl?: string;
  resourceId?: number;
  autoplay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
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
  canRetry: boolean;
}

export interface AudioPlayerControls {
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  seek: (time: number) => void;
  skipTime: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  retry: () => Promise<void>;
  download: (filename?: string) => Promise<void>;
}

export function useAudioPlayer(
  audioUrl: string | undefined,
  options: UseAudioPlayerOptions = {}
): [AudioPlayerState, AudioPlayerControls, React.RefObject<HTMLAudioElement | null>] {
  const { setCurrentAudio } = useAudioContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPending, startTransition] = useTransition();

  // State management
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: true,
    error: null,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    volume: 1,
    isLooping: false,
    isCached: false,
    isDownloading: false,
    canRetry: false,
  });

  // Update loading state when URL changes
  useEffect(() => {
    if (audioUrl) {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'No hay archivo de audio disponible',
        canRetry: false
      }));
    }
  }, [audioUrl]);

  // Preload and cache check
  useEffect(() => {
    if (!audioUrl || !audioUrl.startsWith('http')) return;

    const checkCache = async () => {
      const status = await isAudioCached(audioUrl);
      setState((prev) => ({ ...prev, isCached: status.isCached }));
    };

    // Preload in background
    preloadAudio(audioUrl, { resourceId: options.resourceId }).catch((err) => {
      console.warn('Background preload failed:', err);
    });

    checkCache();
  }, [audioUrl, options.resourceId]);

  // Restore playback position and attach event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      console.log('[useAudioPlayer] Waiting for audio element or URL', { hasAudio: !!audio, audioUrl });
      return;
    }

    console.log('[useAudioPlayer] Setting up audio event listeners for:', audioUrl);

    const handleLoadedMetadata = () => {
      console.log('[useAudioPlayer] loadedmetadata fired, duration:', audio.duration);
      setState((prev) => ({ ...prev, duration: audio.duration, error: null }));

      // Restore saved position
      const savedPosition = getPlaybackPosition(audioUrl);
      if (savedPosition > 0 && savedPosition < audio.duration - 1) {
        audio.currentTime = savedPosition;
      }
    };

    const handleTimeUpdate = () => {
      setState((prev) => ({ ...prev, currentTime: audio.currentTime }));

      // Save position every 2 seconds
      if (Math.floor(audio.currentTime) % 2 === 0) {
        savePlaybackPosition(audioUrl, audio.currentTime);
      }
    };

    const handleCanPlay = () => {
      console.log('[useAudioPlayer] canplay fired - audio ready to play');
      setState((prev) => ({ ...prev, isLoading: false, error: null }));
    };

    const handleCanPlayThrough = () => {
      console.log('[useAudioPlayer] canplaythrough fired - audio fully buffered');
      setState((prev) => ({ ...prev, isLoading: false, error: null }));
    };

    const handleLoadStart = () => {
      console.log('[useAudioPlayer] loadstart fired - beginning to load');
    };

    const handleProgress = () => {
      console.log('[useAudioPlayer] progress fired - loading data');
    };

    const handleError = () => {
      let errorMessage = 'Error al cargar el audio';

      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Carga de audio cancelada';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Error de red al cargar el audio';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Error al decodificar el archivo de audio';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Formato de audio no soportado o archivo no encontrado';
            break;
        }
      }

      console.error('Audio error:', {
        url: audioUrl,
        error: audio.error,
        message: errorMessage,
      });

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isPlaying: false,
        isLoading: false,
        canRetry: true,
      }));

      setCurrentAudio(null);
      options.onError?.(errorMessage);
    };

    const handleEnded = () => {
      if (!state.isLooping) {
        setState((prev) => ({ ...prev, isPlaying: false }));
        setCurrentAudio(null);
        if (audioUrl) {
          clearPlaybackPosition(audioUrl);
        }
        options.onEnded?.();
      }
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    // Check current state - audio might already be ready
    console.log('[useAudioPlayer] Audio readyState:', audio.readyState, 'networkState:', audio.networkState);
    if (audio.readyState >= 3) {
      // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
      console.log('[useAudioPlayer] Audio already ready, setting loading false');
      setState((prev) => ({ ...prev, isLoading: false, error: null }));
    } else if (audio.readyState >= 1) {
      handleLoadedMetadata();
    }

    // Force load if not started
    if (audio.networkState === 0) {
      console.log('[useAudioPlayer] Network state EMPTY, calling load()');
      audio.load();
    }

    return () => {
      console.log('[useAudioPlayer] Cleaning up event listeners');
      if (audioRef.current && audioUrl) {
        savePlaybackPosition(audioUrl, audioRef.current.currentTime);
        audioRef.current.pause();
        setCurrentAudio(null);
      }
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, state.isLooping, options, setCurrentAudio]);

  // Autoplay effect
  useEffect(() => {
    if (options.autoplay && audioRef.current && !state.isPlaying && audioUrl) {
      controls.play();
    }
  }, [options.autoplay, audioUrl]);

  // Controls
  const controls: AudioPlayerControls = {
    play: useCallback(async () => {
      if (!audioRef.current) return;

      try {
        setCurrentAudio(audioRef.current);
        await audioRef.current.play();

        startTransition(() => {
          setState((prev) => ({ ...prev, isPlaying: true, error: null, canRetry: false }));
        });

        options.onPlay?.();
      } catch (err) {
        console.error('Error playing audio:', err);
        const errorMessage = 'No se pudo reproducir el audio';

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isPlaying: false,
          canRetry: true
        }));

        options.onError?.(errorMessage);
      }
    }, [setCurrentAudio, options]),

    pause: useCallback(() => {
      if (!audioRef.current) return;

      audioRef.current.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
      setCurrentAudio(null);
      options.onPause?.();
    }, [setCurrentAudio, options]),

    toggle: useCallback(async () => {
      if (state.isPlaying) {
        controls.pause();
      } else {
        await controls.play();
      }
    }, [state.isPlaying]),

    seek: useCallback((time: number) => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = time;
      setState((prev) => ({ ...prev, currentTime: time }));
    }, []),

    skipTime: useCallback((seconds: number) => {
      if (!audioRef.current) return;
      const newTime = Math.max(
        0,
        Math.min(audioRef.current.duration, audioRef.current.currentTime + seconds)
      );
      controls.seek(newTime);
    }, []),

    setPlaybackRate: useCallback((rate: number) => {
      if (!audioRef.current) return;
      audioRef.current.playbackRate = rate;
      setState((prev) => ({ ...prev, playbackRate: rate }));
    }, []),

    setVolume: useCallback((volume: number) => {
      if (!audioRef.current) return;
      audioRef.current.volume = volume;
      setState((prev) => ({ ...prev, volume }));
    }, []),

    toggleMute: useCallback(() => {
      if (!audioRef.current) return;
      const newVolume = state.volume > 0 ? 0 : 1;
      controls.setVolume(newVolume);
    }, [state.volume]),

    toggleLoop: useCallback(() => {
      if (!audioRef.current) return;
      const newLooping = !state.isLooping;
      audioRef.current.loop = newLooping;
      setState((prev) => ({ ...prev, isLooping: newLooping }));
    }, [state.isLooping]),

    retry: useCallback(async () => {
      if (!audioRef.current || !audioUrl) return;

      setState((prev) => ({
        ...prev,
        error: null,
        isLoading: true,
        canRetry: false
      }));

      // Force reload
      audioRef.current.load();

      // Try to play again
      await controls.play();
    }, [audioUrl]),

    download: useCallback(async (filename?: string) => {
      if (!audioUrl) return;

      setState((prev) => ({ ...prev, isDownloading: true }));

      try {
        const { downloadAudio } = await import('@/lib/audio-utils');
        const result = await downloadAudio(audioUrl, filename);

        if (result.success) {
          setState((prev) => ({ ...prev, isCached: true, isDownloading: false }));
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error || 'Error al descargar el audio',
            isDownloading: false,
          }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: 'Error al descargar el audio',
          isDownloading: false,
        }));
      }
    }, [audioUrl]),
  };

  return [state, controls, audioRef];
}
