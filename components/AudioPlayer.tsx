'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download, RotateCcw, Volume1, VolumeX } from 'lucide-react';
import {
  preloadAudio,
  isAudioCached,
  downloadAudio,
  savePlaybackPosition,
  getPlaybackPosition,
  clearPlaybackPosition
} from '@/lib/audio-utils';
import { useAudioContext } from '@/lib/contexts/AudioContext';

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
  const { setCurrentAudio } = useAudioContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      setIsLoading(false);
      setError(audioUrl ? null : 'No hay archivo de audio disponible');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Preload audio in background
    preloadAudio(audioUrl, { resourceId }).catch(err => {
      console.warn('Background preload failed:', err);
    });

    // Check cache status
    isAudioCached(audioUrl).then(status => {
      setIsCached(status.isCached);
    });

    // Restore playback position if exists
    const savedPosition = getPlaybackPosition(audioUrl);
    if (savedPosition > 0 && savedPosition < audio.duration - 1) {
      audio.currentTime = savedPosition;
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);

      // Restore position after metadata loaded
      const savedPosition = getPlaybackPosition(audioUrl);
      if (savedPosition > 0 && savedPosition < audio.duration - 1) {
        audio.currentTime = savedPosition;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Save position every 2 seconds
      if (Math.floor(audio.currentTime) % 2 === 0) {
        savePlaybackPosition(audioUrl, audio.currentTime);
      }
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('canplay', handleCanPlay);

    // Auto-stop when component unmounts
    return () => {
      if (audioRef.current) {
        savePlaybackPosition(audioUrl, audioRef.current.currentTime);
        audioRef.current.pause();
        setCurrentAudio(null);
      }
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl, resourceId]);

  useEffect(() => {
    // Handle autoplay if enabled
    if (autoplay && audioRef.current && !isPlaying) {
      handlePlay();
    }
  }, [autoplay]);

  const handlePlay = async () => {
    if (!audioRef.current) return;

    try {
      // Set as current audio (context will stop any other playing audio)
      setCurrentAudio(audioRef.current);

      // Play this audio
      await audioRef.current.play();
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
    setCurrentAudio(null);
  };

  const handleToggle = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleEnded = () => {
    if (!isLooping) {
      setIsPlaying(false);
      setCurrentAudio(null);
      // Clear position when finished
      if (audioUrl) {
        clearPlaybackPosition(audioUrl);
      }
    }
  };

  const toggleLoop = () => {
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
      setIsLooping(!isLooping);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newVolume = parseFloat(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (volume > 0) {
      audioRef.current.volume = 0;
      setVolume(0);
    } else {
      audioRef.current.volume = 1;
      setVolume(1);
    }
  };

  const handleDownload = async () => {
    if (!audioUrl) return;

    setIsDownloading(true);
    const filename = title
      ? `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.mp3`
      : audioUrl.split('/').pop();

    const result = await downloadAudio(audioUrl, filename);

    if (result.success) {
      setIsCached(true);
    } else {
      setError(result.error || 'Error al descargar el audio');
    }

    setIsDownloading(false);
  };

  const handleError = () => {
    const audio = audioRef.current;
    let errorMessage = 'Error al cargar el audio';

    if (audio?.error) {
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
        default:
          errorMessage = 'Error desconocido al cargar el audio';
      }
    }

    console.error('Audio error:', { url: audioUrl, error: audio?.error, message: errorMessage });
    setError(errorMessage);
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentAudio(null);
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
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          {metadata && (
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              {metadata.duration && (
                <span>Duración: {metadata.duration}</span>
              )}
              {metadata.narrator && (
                <span>Voz: {metadata.narrator}</span>
              )}
              {metadata.accent && (
                <span>Acento: {metadata.accent}</span>
              )}
            </div>
          )}
        </div>

        {!audioUrl ? (
          <div className="text-center py-4">
            <div className="bg-gray-50 rounded p-4 border border-gray-200">
              <p className="text-gray-900 font-medium mb-2">Guión de Audio Disponible</p>
              <p className="text-sm text-gray-700">
                El archivo de audio estará disponible próximamente.
                Por ahora, puedes ver el guión completo abajo con las frases y pronunciación.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="bg-red-50 rounded p-4 border border-red-200">
              <p className="text-red-900 font-medium mb-2">Error al cargar el audio</p>
              <p className="text-sm text-red-800">{error}</p>
              <p className="text-xs text-red-700 mt-2">URL: {audioUrl}</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-4">
            <div className="bg-gray-50 rounded p-4 border border-gray-200">
              <p className="text-gray-900 font-medium">Cargando audio...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-200 rounded appearance-none cursor-pointer accent-blue-600"
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
                className="p-3 bg-white rounded border border-gray-300 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
                aria-label="Retroceder 10 segundos"
              >
                ⏪
              </button>

              <button
                onClick={handleToggle}
                className="p-4 bg-blue-600 rounded hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
              </button>

              <button
                onClick={() => skipTime(10)}
                className="p-3 bg-white rounded border border-gray-300 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
                aria-label="Adelantar 10 segundos"
              >
                ⏩
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-sm text-gray-700 font-medium">Velocidad:</span>
              <div className="flex gap-1 flex-wrap justify-center">
                {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors min-w-[48px] min-h-[44px] ${
                      playbackRate === rate
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                    aria-label={`Velocidad ${rate}x`}
                    aria-pressed={playbackRate === rate}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              {/* Loop Toggle */}
              <button
                onClick={toggleLoop}
                className={`px-4 py-2 rounded flex items-center gap-2 min-h-[44px] transition-colors ${
                  isLooping
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                aria-label={isLooping ? 'Desactivar repetición' : 'Activar repetición'}
                aria-pressed={isLooping}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">{isLooping ? 'Repitiendo' : 'Repetir'}</span>
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading || !audioUrl}
                className={`px-4 py-2 rounded flex items-center gap-2 min-h-[44px] transition-colors ${
                  isCached
                    ? 'bg-green-50 text-green-700 border border-green-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={isCached ? 'Audio descargado' : 'Descargar audio para uso sin conexión'}
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isDownloading ? 'Descargando...' : isCached ? 'Descargado' : 'Descargar'}
                </span>
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="p-2 rounded hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={volume === 0 ? 'Activar sonido' : 'Silenciar'}
              >
                {volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-gray-700" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5 text-gray-700" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gray-700" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-gray-200 rounded appearance-none cursor-pointer accent-blue-600"
                aria-label="Control de volumen"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(volume * 100)}
              />
              <span className="text-sm text-gray-600 min-w-[3ch]">{Math.round(volume * 100)}%</span>
            </div>

            <div className="bg-gray-50 rounded p-3 border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Consejo:</strong> Escucha este audio varias veces para mejorar tu pronunciación.
                Usa la velocidad 0.75x para practicar palabras difíciles.
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
          loop={isLooping}
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
        disabled={!!error || isLoading || !audioUrl}
        className={`
          flex items-center justify-center
          w-10 h-10 rounded-full
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-green
          ${
            isPlaying
              ? 'bg-accent-green text-white shadow-lg scale-105'
              : error || !audioUrl
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isLoading
              ? 'bg-blue-400 text-white cursor-wait'
              : 'bg-accent-green hover:bg-green-600 text-white shadow-md hover:shadow-lg hover:scale-105'
          }
        `}
        aria-label={isLoading ? 'Cargando audio' : isPlaying ? 'Pausar audio' : 'Reproducir audio'}
        aria-pressed={isPlaying}
      >
        {isLoading ? (
          <span className="animate-spin">⏳</span>
        ) : isPlaying ? (
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

      {/* Loading State Indicator */}
      {isLoading && !isPlaying && (
        <span className="text-sm text-blue-600">Cargando...</span>
      )}

      {/* Error Message */}
      {error && (
        <span className="text-sm text-red-600" role="alert" title={audioUrl || 'No URL'}>
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
        loop={isLooping}
        aria-label={label}
        className="hidden"
      >
        Tu navegador no soporta el elemento de audio.
      </audio>
    </div>
  );
}
