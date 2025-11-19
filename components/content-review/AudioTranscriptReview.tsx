'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download, Edit3, Save, X } from 'lucide-react'

interface TranscriptSegment {
  id: string
  startTime: number
  endTime: number
  english: string
  spanish: string
  speaker?: 'narrator' | 'example' | 'student'
  pronunciation?: string
}

interface AudioTranscriptReviewProps {
  audioUrl: string
  title: string
  transcriptSegments: TranscriptSegment[]
  onSaveTranscript?: (segments: TranscriptSegment[]) => void
  onExportVTT?: () => void
  readOnly?: boolean
}

/**
 * Elegant audio transcript review component for Hablas content review tool.
 * Combines audio playback with synchronized bilingual transcript editing.
 *
 * Features:
 * - Real-time transcript highlighting during playback
 * - Click-to-seek on any segment
 * - Inline editing of English/Spanish text
 * - Timestamp adjustment
 * - Waveform visualization (simplified canvas)
 * - Keyboard shortcuts for efficient review
 * - Export to VTT format
 */
export function AudioTranscriptReview({
  audioUrl,
  title,
  transcriptSegments: initialSegments,
  onSaveTranscript,
  onExportVTT,
  readOnly = false
}: AudioTranscriptReviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  const [segments, setSegments] = useState<TranscriptSegment[]>(initialSegments)
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null)
  const [editedText, setEditedText] = useState({ english: '', spanish: '' })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Find current segment based on playback time
  const currentSegmentIndex = segments.findIndex(
    (seg, i) => currentTime >= seg.startTime && currentTime < (segments[i + 1]?.startTime || duration)
  )

  // Update current time regularly during playback
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current
    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  // Draw simplified waveform on canvas
  useEffect(() => {
    if (!canvasRef.current || !duration) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw background
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw progress
    const progress = currentTime / duration
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(0, 0, rect.width * progress, rect.height)

    // Draw segment markers
    segments.forEach((seg) => {
      const x = (seg.startTime / duration) * rect.width
      ctx.strokeStyle = '#9ca3af'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    })

    // Draw current time indicator
    const currentX = (currentTime / duration) * rect.width
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(currentX, 0)
    ctx.lineTo(currentX, rect.height)
    ctx.stroke()
  }, [currentTime, duration, segments])

  // Playback controls
  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const changeVolume = (newVolume: number) => {
    if (!audioRef.current) return
    audioRef.current.volume = newVolume
    setVolume(newVolume)
  }

  const changePlaybackRate = (rate: number) => {
    if (!audioRef.current) return
    audioRef.current.playbackRate = rate
    setPlaybackRate(rate)
  }

  const seekTo = (time: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  // Transcript editing
  const startEditing = (segment: TranscriptSegment) => {
    if (readOnly) return
    setEditingSegmentId(segment.id)
    setEditedText({ english: segment.english, spanish: segment.spanish })
  }

  const saveEdit = () => {
    if (!editingSegmentId) return

    const updatedSegments = segments.map(seg =>
      seg.id === editingSegmentId
        ? { ...seg, english: editedText.english, spanish: editedText.spanish }
        : seg
    )

    setSegments(updatedSegments)
    setEditingSegmentId(null)
    setHasUnsavedChanges(true)
  }

  const cancelEdit = () => {
    setEditingSegmentId(null)
    setEditedText({ english: '', spanish: '' })
  }

  const handleSave = () => {
    if (onSaveTranscript) {
      onSaveTranscript(segments)
      setHasUnsavedChanges(false)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          skipTime(-5)
          break
        case 'ArrowRight':
          skipTime(5)
          break
        case 'm':
          toggleMute()
          break
      }
    }

    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSpeakerIcon = (speaker?: string) => {
    switch (speaker) {
      case 'narrator': return '🎙️'
      case 'example': return '💬'
      case 'student': return '🎓'
      default: return '👤'
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {segments.length} segments • {formatTime(duration)}
            </p>
          </div>
          <div className="flex gap-2">
            {hasUnsavedChanges && !readOnly && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                aria-label="Save changes">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            )}
            {onExportVTT && (
              <button
                onClick={onExportVTT}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                aria-label="Export as VTT">
                <Download className="w-4 h-4" />
                Export VTT
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audio Player & Waveform */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        {/* Waveform Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-20 rounded-lg mb-4 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const clickTime = (x / rect.width) * duration
            seekTo(clickTime)
          }}
          aria-label="Audio waveform visualization"
        />

        {/* Playback Controls */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => skipTime(-10)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Rewind 10 seconds">
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <button
            onClick={() => skipTime(10)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Forward 10 seconds">
            <SkipForward className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <span className="text-sm font-mono text-gray-700">{formatTime(currentTime)}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span className="text-sm font-mono text-gray-700">{formatTime(duration)}</span>
          </div>

          <button
            onClick={toggleMute}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            className="w-20"
            aria-label="Volume control"
          />
        </div>

        {/* Playback Speed */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Speed:</span>
          {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => changePlaybackRate(rate)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                playbackRate === rate
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label={`Playback speed ${rate}x`}
              aria-pressed={playbackRate === rate}>
              {rate}x
            </button>
          ))}
        </div>

        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      </div>

      {/* Transcript Segments */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {segments.map((segment, index) => {
          const isActive = index === currentSegmentIndex
          const isEditing = segment.id === editingSegmentId

          return (
            <div
              key={segment.id}
              className={`p-4 transition-colors ${
                isActive ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
              }`}>
              <div className="flex items-start gap-3">
                {/* Speaker Icon & Timestamp */}
                <div className="flex-shrink-0 text-center">
                  <div className="text-2xl mb-1">{getSpeakerIcon(segment.speaker)}</div>
                  <button
                    onClick={() => seekTo(segment.startTime)}
                    className="text-xs font-mono text-blue-600 hover:text-blue-700 hover:underline"
                    aria-label={`Seek to ${formatTime(segment.startTime)}`}>
                    {formatTime(segment.startTime)}
                  </button>
                </div>

                {/* Transcript Content */}
                <div className="flex-1">
                  {isEditing ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          🇺🇸 English
                        </label>
                        <textarea
                          value={editedText.english}
                          onChange={(e) => setEditedText({ ...editedText, english: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          🇨🇴 Español
                        </label>
                        <textarea
                          value={editedText.spanish}
                          onChange={(e) => setEditedText({ ...editedText, spanish: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1">
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 flex items-center gap-1">
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div>
                      <p className="text-base font-medium text-gray-900 mb-1">
                        🇺🇸 {segment.english}
                      </p>
                      <p className="text-base text-gray-700 mb-2">
                        🇨🇴 {segment.spanish}
                      </p>
                      {segment.pronunciation && (
                        <p className="text-sm text-purple-600 italic">
                          🔊 [{segment.pronunciation}]
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Edit Button */}
                {!readOnly && !isEditing && (
                  <button
                    onClick={() => startEditing(segment)}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Edit segment">
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <details className="group">
          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 font-medium">
            ⌨️ Keyboard Shortcuts
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div><kbd className="px-2 py-1 bg-white rounded border text-gray-900">Space</kbd> Play/Pause</div>
            <div><kbd className="px-2 py-1 bg-white rounded border text-gray-900">←</kbd> Rewind 5s</div>
            <div><kbd className="px-2 py-1 bg-white rounded border text-gray-900">→</kbd> Forward 5s</div>
            <div><kbd className="px-2 py-1 bg-white rounded border text-gray-900">M</kbd> Mute/Unmute</div>
          </div>
        </details>
      </div>
    </div>
  )
}
