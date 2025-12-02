'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface AudioTranscriptPanelProps {
  audioUrl: string;
  transcript: string;
  status?: 'synced' | 'modified' | 'conflict';
  lastModified?: Date;
  onSave?: (newTranscript: string) => void;
  className?: string;
}

interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
}

/**
 * AudioTranscriptPanel Component
 *
 * Combined audio player with synchronized transcript display:
 * - Audio controls (play/pause, seek, speed)
 * - Synchronized transcript highlighting
 * - Editable transcript with save capability
 * - Status indicator (synced/modified/conflict)
 */
export const AudioTranscriptPanel: React.FC<AudioTranscriptPanelProps> = ({
  audioUrl,
  transcript,
  status = 'synced',
  lastModified = new Date(),
  onSave,
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioError, setAudioError] = useState<string | null>(null);

  const [editedTranscript, setEditedTranscript] = useState(transcript);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Parse transcript into segments with timestamps
  const segments = React.useMemo(() => {
    const result: TranscriptSegment[] = [];
    const lines = transcript.split('\n');

    // Simple heuristic: divide duration evenly among phrases
    // In production, you'd use actual timestamp data from TTS
    const phrases = lines.filter(line =>
      line.trim() &&
      !line.startsWith('#') &&
      !line.startsWith('**')
    );

    if (duration > 0 && phrases.length > 0) {
      const segmentDuration = duration / phrases.length;
      phrases.forEach((phrase, idx) => {
        result.push({
          text: phrase.trim(),
          startTime: idx * segmentDuration,
          endTime: (idx + 1) * segmentDuration,
        });
      });
    }

    return result;
  }, [transcript, duration]);

  // Find current segment based on playback time
  const currentSegmentIndex = React.useMemo(() => {
    return segments.findIndex(
      seg => currentTime >= seg.startTime && currentTime < seg.endTime
    );
  }, [segments, currentTime]);

  // Sync edited transcript with original
  useEffect(() => {
    setEditedTranscript(transcript);
    setHasChanges(false);
  }, [transcript]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => setAudioError('Failed to load audio file');

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setAudioError('Failed to play audio'));
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const skipTime = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  }, [currentTime, duration]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const changePlaybackRate = useCallback((rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * duration;
  }, [duration]);

  const seekToSegment = useCallback((startTime: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = startTime;
  }, []);

  const handleTranscriptChange = (value: string) => {
    setEditedTranscript(value);
    setHasChanges(value !== transcript);
  };

  const handleSave = () => {
    onSave?.(editedTranscript);
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleRevert = () => {
    setEditedTranscript(transcript);
    setHasChanges(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusClasses = () => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'modified':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'conflict':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (audioError) {
    return (
      <div className={`flex flex-col h-full bg-white rounded-lg border border-red-200 shadow-sm ${className}`}>
        <div className="p-6 flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Audio Error</h3>
            <p className="text-sm">{audioError}</p>
          </div>
        </div>
        <button
          onClick={() => setAudioError(null)}
          className="mx-6 mb-6 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Audio + Transcript
          </h3>
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusClasses()}`}>
            {status}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{editedTranscript.length} characters</span>
          <span>Modified: {formatDate(lastModified)}</span>
        </div>
      </div>

      {/* Audio Player */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        {/* Progress bar */}
        <div
          className="h-2 bg-gray-200 rounded-full cursor-pointer mb-3 overflow-hidden"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => skipTime(-10)}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Rewind 10s"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => skipTime(10)}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Forward 10s"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-gray-600 ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Playback speed */}
            <div className="flex items-center gap-1">
              {[0.75, 1, 1.25, 1.5].map(rate => (
                <button
                  key={rate}
                  onClick={() => changePlaybackRate(rate)}
                  className={`px-2 py-0.5 text-xs rounded ${
                    playbackRate === rate
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Volume */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded hover:bg-gray-200"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      </div>

      {/* Transcript Content */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            {isEditing ? 'Edit Transcript' : 'Synchronized Transcript'}
          </label>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            {isEditing ? 'View Mode' : 'Edit Mode'}
          </button>
        </div>

        {isEditing ? (
          /* Edit Mode: Textarea */
          <div className="flex-1 flex flex-col gap-3">
            <textarea
              value={editedTranscript}
              onChange={(e) => handleTranscriptChange(e.target.value)}
              className="flex-1 p-3 font-mono text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter transcript..."
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleRevert}
                disabled={!hasChanges}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Revert
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </button>
            </div>
          </div>
        ) : (
          /* View Mode: Synchronized Segments */
          <div className="flex-1 overflow-y-auto space-y-2">
            {segments.length > 0 ? (
              segments.map((segment, idx) => (
                <div
                  key={idx}
                  onClick={() => seekToSegment(segment.startTime)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    idx === currentSegmentIndex
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 text-xs font-mono text-gray-500 mt-0.5">
                      {formatTime(segment.startTime)}
                    </span>
                    <p className={`flex-1 text-sm ${
                      idx === currentSegmentIndex
                        ? 'text-blue-900 font-medium'
                        : 'text-gray-700'
                    }`}>
                      {segment.text}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                No transcript segments available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
