'use client';

import { memo, useMemo } from 'react';
import { Play, Pause, Volume2, Download, RotateCcw, Volume1, VolumeX, RefreshCw, AlertCircle, Keyboard } from 'lucide-react';
import { useAudioUrl } from '@/lib/audio/audio-url-resolver';
import { useAudioPlayer } from '@/lib/hooks/useAudioPlayer';
import { useAudioKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';

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

/**
 * Modernized AudioPlayer Component
 * Features:
 * - Clean URL resolution with useAudioUrl hook
 * - Separated concerns with custom hooks
 * - React 18 useTransition for smooth updates
 * - Error recovery UI with retry button
 * - Keyboard shortcuts for accessibility
 * - Performance optimized with React.memo
 */
const AudioPlayer = memo(function AudioPlayer({
  audioUrl,
  label = 'Reproducir audio',
  className = '',
  autoplay = false,
  title,
  metadata,
  resourceId,
  enhanced = false
}: AudioPlayerProps) {
  // 1️⃣ Simplified URL Resolution - uses existing hook
  const { url: resolvedAudioUrl, loading: urlLoading, error: urlError } = useAudioUrl(audioUrl);

  // 2️⃣ Memoize options to prevent stale closures and unnecessary re-renders
  const audioPlayerOptions = useMemo(() => ({
    resourceId,
    autoplay,
  }), [resourceId, autoplay]);

  // 3️⃣ Custom Hook for Audio Playback Logic
  const [state, controls, audioRef] = useAudioPlayer(resolvedAudioUrl || undefined, audioPlayerOptions);

  // 3️⃣ Keyboard Shortcuts for Accessibility
  const { shortcuts: keyboardShortcutsList } = useAudioKeyboardShortcuts({
    playPause: controls.toggle,
    skipForward: () => controls.skipTime(10),
    skipBackward: () => controls.skipTime(-10),
    volumeUp: () => controls.setVolume(Math.min(1, state.volume + 0.1)),
    volumeDown: () => controls.setVolume(Math.max(0, state.volume - 0.1)),
    toggleMute: controls.toggleMute,
    speedUp: () => {
      const rates = [0.5, 0.75, 1, 1.25, 1.5];
      const currentIndex = rates.indexOf(state.playbackRate);
      if (currentIndex < rates.length - 1) {
        controls.setPlaybackRate(rates[currentIndex + 1]);
      }
    },
    speedDown: () => {
      const rates = [0.5, 0.75, 1, 1.25, 1.5];
      const currentIndex = rates.indexOf(state.playbackRate);
      if (currentIndex > 0) {
        controls.setPlaybackRate(rates[currentIndex - 1]);
      }
    },
  }, enhanced); // Only enable shortcuts in enhanced mode

  // Determine loading and error states
  const isLoading = urlLoading || state.isLoading;
  const error = urlError || state.error;

  // 4️⃣ Memoized Helper Functions for Performance
  const formatTime = useMemo(() => {
    return (seconds: number): string => {
      if (!isFinite(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
  }, []);

  const handleDownload = async () => {
    const filename = title
      ? `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.mp3`
      : resolvedAudioUrl?.split('/').pop();
    await controls.download(filename);
  };

  // 5️⃣ Error Recovery Component
  const ErrorRecoveryUI = () => (
    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-900 font-medium mb-2">Error al cargar el audio</p>
          <p className="text-sm text-red-800 mb-3">{error}</p>
          {state.canRetry && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={controls.retry}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                aria-label="Reintentar carga de audio"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
              {state.isCached && (
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors flex items-center gap-2"
                  aria-label="Descargar audio para uso sin conexión"
                >
                  <Download className="w-4 h-4" />
                  Descargar copia local
                </button>
              )}
            </div>
          )}
          <details className="mt-3 text-xs text-red-700">
            <summary className="cursor-pointer hover:text-red-900">Detalles técnicos</summary>
            <div className="mt-2 space-y-1">
              <p>URL original: {audioUrl || 'N/A'}</p>
              {resolvedAudioUrl && resolvedAudioUrl !== audioUrl && (
                <p>URL resuelta: {resolvedAudioUrl}</p>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );

  // 6️⃣ Keyboard Shortcuts Help Component
  const KeyboardShortcutsHelp = () => (
    <details className="mt-4">
      <summary className="cursor-pointer text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2">
        <Keyboard className="w-4 h-4" />
        Atajos de teclado
      </summary>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs bg-gray-50 rounded p-3 border border-gray-200">
        {keyboardShortcutsList.map((shortcut, index) => (
          <div key={index} className="flex justify-between">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded font-mono">
              {shortcut.key}
            </kbd>
            <span className="text-gray-600">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </details>
  );

  // 7️⃣ Enhanced player for resource detail pages
  if (enhanced && title) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200" role="region" aria-label="Reproductor de audio">
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
          <ErrorRecoveryUI />
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
                max={state.duration || 0}
                value={state.currentTime}
                onChange={(e) => controls.seek(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded appearance-none cursor-pointer accent-blue-600"
                aria-label="Progreso del audio"
                aria-valuemin={0}
                aria-valuemax={Math.floor(state.duration)}
                aria-valuenow={Math.floor(state.currentTime)}
                aria-valuetext={`${formatTime(state.currentTime)} de ${formatTime(state.duration)}`}
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{formatTime(state.currentTime)}</span>
                <span>{formatTime(state.duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => controls.skipTime(-10)}
                className="p-3 bg-white rounded border border-gray-300 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
                aria-label="Retroceder 10 segundos (tecla J)"
              >
                ⏪
              </button>

              <button
                onClick={controls.toggle}
                className="p-4 bg-blue-600 rounded hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
                aria-label={state.isPlaying ? 'Pausar (tecla K o Espacio)' : 'Reproducir (tecla K o Espacio)'}
              >
                {state.isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
              </button>

              <button
                onClick={() => controls.skipTime(10)}
                className="p-3 bg-white rounded border border-gray-300 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
                aria-label="Adelantar 10 segundos (tecla L)"
              >
                ⏩
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-sm text-gray-700 font-medium">Velocidad:</span>
              <div className="flex gap-1 flex-wrap justify-center" role="group" aria-label="Controles de velocidad de reproducción">
                {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => controls.setPlaybackRate(rate)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors min-w-[48px] min-h-[44px] ${
                      state.playbackRate === rate
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                    aria-label={`Velocidad ${rate}x`}
                    aria-pressed={state.playbackRate === rate}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              {/* Loop Toggle */}
              <button
                onClick={controls.toggleLoop}
                className={`px-4 py-2 rounded flex items-center gap-2 min-h-[44px] transition-colors ${
                  state.isLooping
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                aria-label={state.isLooping ? 'Desactivar repetición' : 'Activar repetición'}
                aria-pressed={state.isLooping}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">{state.isLooping ? 'Repitiendo' : 'Repetir'}</span>
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={state.isDownloading || !audioUrl}
                className={`px-4 py-2 rounded flex items-center gap-2 min-h-[44px] transition-colors ${
                  state.isCached
                    ? 'bg-green-50 text-green-700 border border-green-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={state.isCached ? 'Audio descargado' : 'Descargar audio para uso sin conexión'}
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {state.isDownloading ? 'Descargando...' : state.isCached ? 'Descargado' : 'Descargar'}
                </span>
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <button
                onClick={controls.toggleMute}
                className="p-2 rounded hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={state.volume === 0 ? 'Activar sonido (tecla M)' : 'Silenciar (tecla M)'}
              >
                {state.volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-gray-700" />
                ) : state.volume < 0.5 ? (
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
                value={state.volume}
                onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded appearance-none cursor-pointer accent-blue-600"
                aria-label="Control de volumen (flechas arriba/abajo)"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(state.volume * 100)}
                aria-valuetext={`Volumen ${Math.round(state.volume * 100)}%`}
              />
              <span className="text-sm text-gray-600 min-w-[3ch]">{Math.round(state.volume * 100)}%</span>
            </div>

            <div className="bg-gray-50 rounded p-3 border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Consejo:</strong> Escucha este audio varias veces para mejorar tu pronunciación.
                Usa la velocidad 0.75x para practicar palabras difíciles.
              </p>
            </div>

            {/* Keyboard Shortcuts Help */}
            <KeyboardShortcutsHelp />
          </div>
        )}

        <audio
          ref={audioRef}
          src={resolvedAudioUrl || undefined}
          preload="metadata"
          loop={state.isLooping}
          className="hidden"
          aria-label={title || label}
        />
      </div>
    );
  }

  // 8️⃣ Simple inline player (original design) - Performance optimized
  return (
    <div
      className={`audio-player inline-flex items-center gap-2 ${className}`}
      role="region"
      aria-label={label}
      aria-live="polite"
    >
      {/* Play/Pause Button */}
      <button
        onClick={controls.toggle}
        disabled={!!error || isLoading || !audioUrl}
        className={`
          flex items-center justify-center
          w-10 h-10 rounded-full
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-green
          ${
            state.isPlaying
              ? 'bg-accent-green text-white shadow-lg scale-105'
              : error || !audioUrl
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isLoading
              ? 'bg-blue-400 text-white cursor-wait'
              : 'bg-accent-green hover:bg-green-600 text-white shadow-md hover:shadow-lg hover:scale-105'
          }
        `}
        aria-label={isLoading ? 'Cargando audio' : state.isPlaying ? 'Pausar audio' : 'Reproducir audio'}
        aria-pressed={state.isPlaying}
      >
        {isLoading ? (
          <span className="animate-spin" role="status" aria-label="Cargando">⏳</span>
        ) : state.isPlaying ? (
          <Pause className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" aria-hidden="true" />
        )}
      </button>

      {/* Playing State Indicator */}
      {state.isPlaying && (
        <div className="flex items-center gap-2 text-accent-green animate-pulse" role="status" aria-live="polite">
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">Reproduciendo...</span>
        </div>
      )}

      {/* Loading State Indicator */}
      {isLoading && !state.isPlaying && (
        <span className="text-sm text-blue-600" role="status" aria-live="polite">Cargando...</span>
      )}

      {/* Error Message with Retry */}
      {error && (
        <div className="flex items-center gap-2" role="alert">
          <span className="text-sm text-red-600" title={resolvedAudioUrl || audioUrl || 'No URL'}>
            {error}
          </span>
          {state.canRetry && (
            <button
              onClick={controls.retry}
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center gap-1"
              aria-label="Reintentar carga de audio"
            >
              <RefreshCw className="w-3 h-3" />
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={resolvedAudioUrl || undefined}
        preload="metadata"
        loop={state.isLooping}
        aria-label={label}
        className="hidden"
      >
        Tu navegador no soporta el elemento de audio.
      </audio>
    </div>
  );
});

export default AudioPlayer;
