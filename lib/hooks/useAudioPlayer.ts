/**
 * Custom Hook for Audio Player Logic
 * Separates audio playback concerns from UI rendering
 * Implements modern React patterns and Web Audio API integration
 */

'use client';

import { useState, useRef, useEffect, useLayoutEffect, useCallback, useTransition } from 'react';
import { useAudioContext } from '@/lib/contexts/AudioContext';
import { createLogger } from '@/lib/utils/logger';

const audioLogger = createLogger('useAudioPlayer');

// Use useLayoutEffect on client, useEffect on server (for SSR compatibility)
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
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
): [AudioPlayerState, AudioPlayerControls, (node: HTMLAudioElement | null) => void] {
  const { setCurrentAudio } = useAudioContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [, startTransition] = useTransition();

  // Track when audio element is mounted - this triggers effect re-run
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Store options in ref to avoid effect re-runs when options object changes
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Callback ref to capture audio element when mounted
  const audioCallbackRef = useCallback((node: HTMLAudioElement | null) => {
    audioLogger.debug('Callback ref called', { hasNode: !!node });
    audioRef.current = node;
    setAudioElement(node);

    // Immediate load attempt when ref is first attached
    if (node && audioUrl) {
      audioLogger.debug('Callback ref - immediate load attempt');
      // Use requestAnimationFrame to ensure DOM is fully ready
      requestAnimationFrame(() => {
        if (node.networkState === HTMLMediaElement.NETWORK_EMPTY) {
          audioLogger.debug('Callback ref - network state empty, calling load()');
          node.load();
        }
      });
    }
  }, [audioUrl]);

  // Force load on mount/hydration - runs SYNCHRONOUSLY after DOM mutations
  // This ensures audio.load() is called before browser paint
  useIsomorphicLayoutEffect(() => {
    // Use the state-tracked element directly for reliability
    const audio = audioElement;
    if (!audio) {
      audioLogger.debug('Layout effect - waiting for audio element');
      return;
    }

    if (!audioUrl) {
      audioLogger.debug('Layout effect - no audio URL provided');
      return;
    }

    audioLogger.debug('Layout effect - audio element attached, forcing load', {
      currentSrc: audio.src,
      targetUrl: audioUrl,
      readyState: audio.readyState,
      networkState: audio.networkState
    });

    // Always ensure src is set correctly (handles relative vs absolute URL mismatch)
    const normalizedAudioUrl = audioUrl.startsWith('/') ? audioUrl : `/${audioUrl}`;
    const currentSrcPath = new URL(audio.src, window.location.origin).pathname;

    if (currentSrcPath !== normalizedAudioUrl) {
      audioLogger.debug('Setting src explicitly', { audioUrl });
      audio.src = audioUrl;
    }

    // Force load - this triggers the browser to fetch the audio
    audioLogger.debug('Calling audio.load()');
    audio.load();
  }, [audioUrl, audioElement]); // Re-run when element is attached or URL changes

  // BACKUP: Fallback effect that runs after a short delay to catch hydration edge cases
  // This handles scenarios where React hydration doesn't trigger the callback ref
  useEffect(() => {
    if (!audioUrl) return;

    // If audioElement is already set, skip the fallback
    if (audioElement) {
      audioLogger.debug('Fallback effect - audioElement already set, skipping');
      return;
    }

    audioLogger.debug('Fallback effect - scheduling delayed check');

    // Wait a tick for hydration to complete, then check if we have an audio element
    const timeoutId = setTimeout(() => {
      const audio = audioRef.current;
      if (audio && audio.networkState === HTMLMediaElement.NETWORK_EMPTY) {
        audioLogger.debug('Fallback effect - found audio element, forcing load');
        audio.load();
      }
    }, 100); // Small delay to let hydration complete

    return () => clearTimeout(timeoutId);
  }, [audioUrl, audioElement]);

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
    preloadAudio(audioUrl, { resourceId: optionsRef.current.resourceId }).catch((err) => {
      audioLogger.warn('Background preload failed', { error: err });
    });

    checkCache();
  }, [audioUrl]); // resourceId read from optionsRef

  // Restore playback position and attach event listeners
  useEffect(() => {
    const audio = audioElement; // Use state-tracked element instead of ref
    if (!audio || !audioUrl) {
      audioLogger.debug('Waiting for audio element or URL', { hasAudio: !!audio, audioUrl });
      return;
    }

    audioLogger.debug('Setting up audio event listeners', { audioUrl });

    const handleLoadedMetadata = () => {
      audioLogger.debug('loadedmetadata fired', { duration: audio.duration });
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
      audioLogger.debug('canplay fired - audio ready to play');
      setState((prev) => ({ ...prev, isLoading: false, error: null }));
    };

    const handleCanPlayThrough = () => {
      audioLogger.debug('canplaythrough fired - audio fully buffered');
      setState((prev) => ({ ...prev, isLoading: false, error: null }));
    };

    const handleLoadStart = () => {
      audioLogger.debug('loadstart fired - beginning to load');
    };

    const handleProgress = () => {
      audioLogger.debug('progress fired - loading data');
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

      audioLogger.error('Audio error', new Error(errorMessage), {
        url: audioUrl,
        errorCode: audio.error?.code,
      });

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isPlaying: false,
        isLoading: false,
        canRetry: true,
      }));

      setCurrentAudio(null);
      optionsRef.current.onError?.(errorMessage);
    };

    const handleEnded = () => {
      if (!state.isLooping) {
        setState((prev) => ({ ...prev, isPlaying: false }));
        setCurrentAudio(null);
        if (audioUrl) {
          clearPlaybackPosition(audioUrl);
        }
        optionsRef.current.onEnded?.();
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
    audioLogger.debug('Audio state check', { readyState: audio.readyState, networkState: audio.networkState });
    if (audio.readyState >= 3) {
      // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
      audioLogger.debug('Audio already ready, setting loading false');
      setState((prev) => ({ ...prev, isLoading: false, error: null }));
    } else if (audio.readyState >= 1) {
      handleLoadedMetadata();
    }

    // Force load if not started
    if (audio.networkState === 0) {
      audioLogger.debug('Network state EMPTY, calling load()');
      audio.load();
    }

    return () => {
      audioLogger.debug('Cleaning up event listeners');
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
    // audioElement triggers re-run when ref is attached; options removed - using optionsRef
  }, [audioUrl, audioElement, state.isLooping, setCurrentAudio]);

  // Autoplay effect
  useEffect(() => {
    if (optionsRef.current.autoplay && audioRef.current && !state.isPlaying && audioUrl) {
      controls.play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]); // Only trigger on URL change, autoplay is read from ref

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

        optionsRef.current.onPlay?.();
      } catch (err) {
        audioLogger.error('Error playing audio', err as Error);
        const errorMessage = 'No se pudo reproducir el audio';

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isPlaying: false,
          canRetry: true
        }));

        optionsRef.current.onError?.(errorMessage);
      }
    }, [setCurrentAudio]),

    pause: useCallback(() => {
      if (!audioRef.current) return;

      audioRef.current.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
      setCurrentAudio(null);
      optionsRef.current.onPause?.();
    }, [setCurrentAudio]),

    toggle: useCallback(async () => {
      if (state.isPlaying) {
        controls.pause();
      } else {
        await controls.play();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      } catch {
        setState((prev) => ({
          ...prev,
          error: 'Error al descargar el audio',
          isDownloading: false,
        }));
      }
    }, [audioUrl]),
  };

  return [state, controls, audioCallbackRef];
}
