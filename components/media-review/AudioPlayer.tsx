'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
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
    const audio = audioRef.current;
    if (!audio) return;

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
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      onEnded?.();
    };

    const handleError = () => {
      setState(prev => ({
        ...prev,
        error: 'Failed to load audio file',
        isLoading: false,
      }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onTimeUpdate, onEnded]);

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
        <p className="text-sm text-red-800">{state.error}</p>
      </div>
    );
  }

  return (
    <div className={`audio-player bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

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
