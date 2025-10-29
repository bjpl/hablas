'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioMetadata {
  duration?: string;
  voice?: string;
  accent?: string;
  narrator?: string;
}

interface AudioPlayerProps {
  audioUrl?: string;
  label?: string;
  className?: string;
  autoplay?: boolean;
  title?: string;
  metadata?: AudioMetadata;
  resourceId?: number;
  enhanced?: boolean;
}

// Track currently playing audio globally to auto-stop when new audio plays
let currentlyPlaying: HTMLAudioElement | null = null;

export default function AudioPlayer({
  audioUrl,
  label = 'Reproducir audio',
  className = '',
  autoplay = false,
  title,
  metadata,
  resourceId,
  enhanced = false
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(audioUrl ? null : 'Audio próximamente disponible');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    // Auto-stop when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        if (currentlyPlaying === audioRef.current) {
          currentlyPlaying = null;
        }
      }
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [audioUrl]);

  useEffect(() => {
    // Handle autoplay if enabled
    if (autoplay && audioRef.current && !isPlaying) {
      handlePlay();
    }
  }, [autoplay]);

  const handlePlay = async () => {
    if (!audioRef.current) return;

    try {
      // Stop any currently playing audio
      if (currentlyPlaying && currentlyPlaying !== audioRef.current) {
        currentlyPlaying.pause();
        currentlyPlaying.currentTime = 0;
      }

      // Play this audio
      await audioRef.current.play();
      currentlyPlaying = audioRef.current;
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('No se pudo reproducir el audio');
      setIsPlaying(false);
    }
  };

  const handlePause = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setIsPlaying(false);
    if (currentlyPlaying === audioRef.current) {
      currentlyPlaying = null;
    }
  };

  const handleToggle = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (currentlyPlaying === audioRef.current) {
      currentlyPlaying = null;
    }
  };

  const handleError = () => {
    setError('Error al cargar el audio');
    setIsPlaying(false);
    if (currentlyPlaying === audioRef.current) {
      currentlyPlaying = null;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changePlaybackRate = (rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, audioRef.current.currentTime + seconds));
  };

  // Enhanced player for resource detail pages
  if (enhanced && title) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border-2 border-purple-200 shadow-lg">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl" aria-hidden="true">🎧</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
            {metadata && (
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                {metadata.duration && (
                  <span className="px-2 py-1 bg-white rounded border border-purple-200">
                    ⏱️ {metadata.duration}
                  </span>
                )}
                {metadata.narrator && (
                  <span className="px-2 py-1 bg-white rounded border border-purple-200">
                    🎙️ {metadata.narrator}
                  </span>
                )}
                {metadata.accent && (
                  <span className="px-2 py-1 bg-white rounded border border-purple-200">
                    🗣️ {metadata.accent}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {error && !audioUrl && (
          <div className="text-center py-4">
            <div className="bg-purple-100 rounded-lg p-4 border border-purple-300">
              <p className="text-purple-900 font-medium mb-2">📋 Guión de Audio Disponible</p>
              <p className="text-sm text-purple-800">
                El archivo de audio estará disponible próximamente.
                Por ahora, puedes ver el guión completo abajo con las frases y pronunciación.
              </p>
            </div>
          </div>
        )}

        {audioUrl && !error && (
          <div className="space-y-4">
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                aria-label="Progreso del audio"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => skipTime(-10)}
                className="p-3 bg-white rounded-full border-2 border-purple-300 hover:bg-purple-100 transition-colors focus:ring-2 focus:ring-purple-400 focus:outline-none"
                aria-label="Retroceder 10 segundos"
              >
                ⏪
              </button>

              <button
                onClick={handleToggle}
                className="p-4 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors focus:ring-2 focus:ring-purple-400 focus:outline-none shadow-lg"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
              </button>

              <button
                onClick={() => skipTime(10)}
                className="p-3 bg-white rounded-full border-2 border-purple-300 hover:bg-purple-100 transition-colors focus:ring-2 focus:ring-purple-400 focus:outline-none"
                aria-label="Adelantar 10 segundos"
              >
                ⏩
              </button>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-700 font-medium">Velocidad:</span>
              <div className="flex gap-1">
                {[0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      playbackRate === rate
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 border border-purple-200 hover:bg-purple-100'
                    }`}
                    aria-label={`Velocidad ${rate}x`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-purple-100 rounded-lg p-3 border border-purple-300">
              <p className="text-sm text-purple-900 flex items-center gap-2">
                <span>💡</span>
                <span>
                  <strong>Consejo:</strong> Escucha este audio varias veces para mejorar tu pronunciación.
                  Usa la velocidad 0.75x para practicar palabras difíciles.
                </span>
              </p>
            </div>
          </div>
        )}

        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleEnded}
          onError={handleError}
          preload="metadata"
          className="hidden"
        />
      </div>
    );
  }

  // Simple inline player (original design)
  return (
    <div
      className={`audio-player inline-flex items-center gap-2 ${className}`}
      role="region"
      aria-label={label}
    >
      {/* Play/Pause Button */}
      <button
        onClick={handleToggle}
        disabled={!!error}
        className={`
          flex items-center justify-center
          w-10 h-10 rounded-full
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-green
          ${
            isPlaying
              ? 'bg-accent-green text-white shadow-lg scale-105'
              : error
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-accent-green hover:bg-green-600 text-white shadow-md hover:shadow-lg hover:scale-105'
          }
        `}
        aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" aria-hidden="true" />
        )}
      </button>

      {/* Playing State Indicator */}
      {isPlaying && (
        <div className="flex items-center gap-2 text-accent-green animate-pulse">
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">Reproduciendo...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <span className="text-sm text-red-600" role="alert">
          {error}
        </span>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
        aria-label={label}
        className="hidden"
      >
        Tu navegador no soporta el elemento de audio.
      </audio>
    </div>
  );
}
