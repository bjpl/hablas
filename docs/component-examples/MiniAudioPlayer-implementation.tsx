/**
 * Mini Audio Player - Persistent Mobile Audio Experience
 *
 * Location: /home/user/hablas/components/mobile/MiniAudioPlayer.tsx
 *
 * Features:
 * - Persistent playback (survives navigation)
 * - Mini player (bottom sticky, above nav)
 * - Expandable to full player (bottom sheet)
 * - Lock screen controls (Media Session API)
 * - Background playback
 * - Playback position persistence
 * - Auto-pause on phone calls
 *
 * Context:
 * Gig workers need to listen while:
 * - Checking delivery apps
 * - Navigating Google Maps
 * - Accepting orders
 * - Between deliveries
 */

'use client'

import { Play, Pause, X, ChevronUp, SkipBack, SkipForward } from 'lucide-react'
import { useAudioContext } from '@/lib/contexts/AudioContext'
import { useState, useEffect } from 'react'

export default function MiniAudioPlayer() {
  const {
    currentAudio,
    currentTitle,
    currentArtwork,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    stopAudio,
    seekTo,
    skipTime
  } = useAudioContext()

  const [showFullPlayer, setShowFullPlayer] = useState(false)

  // Hide if no audio is loaded
  if (!currentAudio) return null

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Mini Player - Sticky at bottom above navigation */}
      <div
        className="fixed bottom-16 left-0 right-0 z-40 bg-gradient-to-r from-accent-green to-green-600 text-white shadow-lg pb-safe"
        role="region"
        aria-label="Reproductor de audio en miniatura"
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progreso de reproducción: ${Math.round(progress)}%`}
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-3 max-w-6xl mx-auto">
          {/* Artwork thumbnail */}
          {currentArtwork && (
            <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-white/10">
              <img
                src={currentArtwork}
                alt=""
                className="w-full h-full object-cover"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="flex-shrink-0 w-10 h-10 bg-white text-accent-green rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform min-w-[44px] min-h-[44px]"
            aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" aria-hidden="true" />
            )}
          </button>

          {/* Track Info */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setShowFullPlayer(true)}
          >
            <p className="font-medium text-sm truncate leading-tight">
              {currentTitle || 'Reproduciendo audio'}
            </p>
            <p className="text-xs text-white/80 mt-0.5">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setShowFullPlayer(true)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center active:scale-95 transition-transform min-w-[44px] min-h-[44px]"
            aria-label="Expandir reproductor"
          >
            <ChevronUp className="w-6 h-6" aria-hidden="true" />
          </button>

          {/* Close Button */}
          <button
            onClick={() => {
              stopAudio()
              // Haptic feedback
              if ('vibrate' in navigator) {
                navigator.vibrate(10)
              }
            }}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center active:scale-95 transition-transform min-w-[44px] min-h-[44px]"
            aria-label="Cerrar reproductor"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Full Player Modal (Bottom Sheet) */}
      {showFullPlayer && (
        <FullPlayerSheet
          isOpen={showFullPlayer}
          onClose={() => setShowFullPlayer(false)}
        />
      )}
    </>
  )
}

/**
 * Full Audio Player (Bottom Sheet)
 */
function FullPlayerSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    currentTitle,
    currentArtwork,
    currentMetadata,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isLooping,
    togglePlay,
    seekTo,
    skipTime,
    changePlaybackRate,
    toggleLoop,
    setVolume
  } = useAudioContext()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Prevent scroll on background when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label="Reproductor de audio completo"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative w-full bg-gradient-to-b from-accent-green to-green-700 text-white rounded-t-3xl shadow-2xl pb-safe max-h-[90vh] overflow-y-auto">
        {/* Drag Handle */}
        <div className="flex items-center justify-center py-3">
          <div
            className="w-12 h-1.5 bg-white/30 rounded-full cursor-grab active:cursor-grabbing"
            onClick={onClose}
            aria-label="Deslizar para cerrar"
          />
        </div>

        <div className="px-6 pb-6">
          {/* Artwork */}
          <div className="flex items-center justify-center mb-6">
            {currentArtwork ? (
              <img
                src={currentArtwork}
                alt={currentTitle || 'Audio en reproducción'}
                className="w-48 h-48 rounded-2xl shadow-2xl object-cover"
              />
            ) : (
              <div className="w-48 h-48 bg-white/10 rounded-2xl shadow-2xl flex items-center justify-center">
                <Mic className="w-20 h-20 text-white/50" />
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{currentTitle || 'Audio'}</h2>
            {currentMetadata && (
              <div className="text-sm text-white/80 space-y-1">
                {currentMetadata.narrator && <p>Voz: {currentMetadata.narrator}</p>}
                {currentMetadata.accent && <p>Acento: {currentMetadata.accent}</p>}
              </div>
            )}
          </div>

          {/* Progress Slider */}
          <div className="space-y-2 mb-6">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
              aria-label="Barra de progreso del audio"
              style={{
                background: `linear-gradient(to right, white ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%)`
              }}
            />
            <div className="flex justify-between text-sm text-white/90">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {/* Skip Back */}
            <button
              onClick={() => skipTime(-10)}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all min-w-[48px] min-h-[48px]"
              aria-label="Retroceder 10 segundos"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            {/* Play/Pause (Large) */}
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-white text-accent-green rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all min-w-[64px] min-h-[64px]"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => skipTime(10)}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all min-w-[48px] min-h-[48px]"
              aria-label="Adelantar 10 segundos"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Playback Speed */}
          <div className="mb-6">
            <p className="text-sm text-white/80 mb-2 text-center">Velocidad de reproducción</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => changePlaybackRate(rate)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[56px] min-h-[44px] ${
                    playbackRate === rate
                      ? 'bg-white text-accent-green shadow-md'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                  aria-label={`Velocidad ${rate}x`}
                  aria-pressed={playbackRate === rate}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Loop Toggle */}
            <button
              onClick={toggleLoop}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                isLooping
                  ? 'bg-white text-accent-green'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              aria-label={isLooping ? 'Desactivar repetición' : 'Activar repetición'}
              aria-pressed={isLooping}
            >
              {isLooping ? 'Repitiendo' : 'Repetir'}
            </button>
          </div>

          {/* Tip */}
          <div className="mt-6 bg-white/10 rounded-lg p-4 text-sm text-white/90">
            <p className="font-medium mb-1">💡 Consejo:</p>
            <p>
              Puedes seguir escuchando mientras usas otras apps.
              Controla la reproducción desde la pantalla de bloqueo o las notificaciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Enhanced AudioContext with Lock Screen Controls
 *
 * Update lib/contexts/AudioContext.tsx to include:
 */

// Add to AudioContext provider:
/*
useEffect(() => {
  if (!currentAudio || !('mediaSession' in navigator)) return

  // Set metadata for lock screen
  navigator.mediaSession.metadata = new MediaMetadata({
    title: currentTitle || 'Hablas Audio',
    artist: 'Hablas - Aprende Inglés',
    album: currentMetadata?.category || 'Recursos',
    artwork: [
      {
        src: currentArtwork || '/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: currentArtwork || '/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  })

  // Set action handlers
  navigator.mediaSession.setActionHandler('play', () => {
    currentAudio.play()
    setIsPlaying(true)
  })

  navigator.mediaSession.setActionHandler('pause', () => {
    currentAudio.pause()
    setIsPlaying(false)
  })

  navigator.mediaSession.setActionHandler('seekbackward', () => {
    currentAudio.currentTime = Math.max(0, currentAudio.currentTime - 10)
  })

  navigator.mediaSession.setActionHandler('seekforward', () => {
    currentAudio.currentTime = Math.min(currentAudio.duration, currentAudio.currentTime + 10)
  })

  navigator.mediaSession.setActionHandler('stop', () => {
    currentAudio.pause()
    currentAudio.currentTime = 0
    setCurrentAudio(null)
  })

  // Update playback state
  navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'

}, [currentAudio, currentTitle, currentArtwork, currentMetadata, isPlaying])
*/

/**
 * Integration Steps:
 *
 * 1. Create component: components/mobile/MiniAudioPlayer.tsx
 *
 * 2. Update AudioContext: lib/contexts/AudioContext.tsx
 *    - Add Media Session API support
 *    - Add playback controls (skipTime, changePlaybackRate, etc.)
 *
 * 3. Add to layout: app/layout.tsx
 *    import MiniAudioPlayer from '@/components/mobile/MiniAudioPlayer'
 *
 *    <Providers>
 *      {children}
 *      <MiniAudioPlayer />  // Add before BottomNav
 *      <BottomNav />
 *    </Providers>
 *
 * 4. Update AudioPlayer component to use context:
 *    const { setCurrentAudio } = useAudioContext()
 *    setCurrentAudio(audioElement, title, artwork, metadata)
 *
 * 5. Test lock screen controls:
 *    - Play audio
 *    - Lock phone
 *    - Verify controls appear on lock screen
 *    - Test play/pause/skip from lock screen
 *
 * Testing Checklist:
 *
 * - [ ] Mini player appears when audio starts
 * - [ ] Playback persists across page navigation
 * - [ ] Lock screen controls work (iOS/Android)
 * - [ ] Background playback continues
 * - [ ] Auto-pause on phone call
 * - [ ] Playback position persists
 * - [ ] Expand to full player works
 * - [ ] Progress bar updates smoothly
 * - [ ] Playback speed changes work
 * - [ ] Loop toggle works
 * - [ ] Close button stops playback
 * - [ ] Works with notification controls
 * - [ ] Bluetooth headphone controls work
 */
