/**
 * AudioTextAlignmentTool Component
 * Audio waveform visualization with synchronized transcript highlighting
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { TranscriptPhrase } from '@/lib/content-validation/types';

interface AudioTextAlignmentToolProps {
  audioUrl: string;
  transcript: TranscriptPhrase[];
  onTimestampUpdate?: (phraseIndex: number, startTime: number, endTime: number) => void;
  className?: string;
}

interface WaveformViewerProps {
  audioUrl: string;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  phrases: TranscriptPhrase[];
}

const WaveformViewer: React.FC<WaveformViewerProps> = ({
  audioUrl,
  currentTime,
  duration,
  onSeek,
  phrases,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate simple waveform visualization (in production, use wavesurfer.js or similar)
  useEffect(() => {
    // Generate mock waveform data (in production, analyze audio file)
    const data: number[] = [];
    for (let i = 0; i < 200; i++) {
      // Simulate amplitude variation
      const amplitude = Math.random() * 0.8 + 0.2;
      data.push(amplitude);
    }
    setWaveformData(data);
  }, [audioUrl]);

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform bars
    waveformData.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barHeight = amplitude * centerY;
      const progress = (currentTime / duration) * waveformData.length;

      // Color based on playback position
      ctx.fillStyle = index < progress ? '#3b82f6' : '#9ca3af';

      // Draw bar (centered vertically)
      ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
    });

    // Draw current position marker
    const markerX = (currentTime / duration) * width;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(markerX, 0);
    ctx.lineTo(markerX, height);
    ctx.stroke();

    // Draw phrase markers
    phrases.forEach(phrase => {
      const startX = (phrase.startTime / duration) * width;
      const endX = (phrase.endTime / duration) * width;

      // Semi-transparent phrase region
      ctx.fillStyle = 'rgba(147, 51, 234, 0.1)';
      ctx.fillRect(startX, 0, endX - startX, height);

      // Phrase boundary markers
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.stroke();
    });
  }, [waveformData, currentTime, duration, phrases]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickPosition = x / canvas.width;
    const newTime = clickPosition * duration;

    onSeek(newTime);
  };

  return (
    <div className="waveform-viewer bg-gray-100 rounded-lg p-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={120}
        className="w-full cursor-pointer rounded"
        onClick={handleCanvasClick}
        aria-label="Audio waveform - click to seek"
      />
    </div>
  );
};

export const AudioTextAlignmentTool: React.FC<AudioTextAlignmentToolProps> = ({
  audioUrl,
  transcript,
  onTimestampUpdate,
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentPhraseIdx, setCurrentPhraseIdx] = useState<number>(-1);
  const [selectedPhrase, setSelectedPhrase] = useState<number | null>(null);

  // Update current phrase based on audio position
  useEffect(() => {
    const phraseIdx = transcript.findIndex((phrase, i) => {
      const nextPhrase = transcript[i + 1];
      return (
        currentTime >= phrase.startTime &&
        currentTime < (nextPhrase ? nextPhrase.startTime : duration)
      );
    });

    setCurrentPhraseIdx(phraseIdx);
  }, [currentTime, transcript, duration]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const jumpToTimestamp = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleSeek = useCallback(
    (time: number) => {
      jumpToTimestamp(time);
    },
    [jumpToTimestamp]
  );

  const skipBackward = useCallback(() => {
    jumpToTimestamp(Math.max(0, currentTime - 5));
  }, [currentTime, jumpToTimestamp]);

  const skipForward = useCallback(() => {
    jumpToTimestamp(Math.min(duration, currentTime + 5));
  }, [currentTime, duration, jumpToTimestamp]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const formatTime = (time: number): string => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`audio-text-alignment-tool ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-bold text-gray-900">Audio-Text Alignment</h2>
        <p className="text-sm text-gray-600 mt-1">
          Play audio to see synchronized transcript highlighting
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50">
        {/* Waveform & Controls Column */}
        <div className="col-span-2 space-y-4">
          {/* Waveform */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold mb-3 text-gray-900">Audio Waveform</h3>
            <WaveformViewer
              audioUrl={audioUrl}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              phrases={transcript}
            />

            {/* Time Display */}
            <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
              <span className="font-mono">{formatTime(currentTime)}</span>
              <span className="font-mono">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              {/* Skip Backward */}
              <button
                onClick={skipBackward}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Skip backward 5 seconds"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>

              {/* Skip Forward */}
              <button
                onClick={skipForward}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Skip forward 5 seconds"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume Control */}
              <div className="flex items-center gap-2 ml-auto">
                <Volume2 className="w-5 h-5 text-gray-600" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  aria-label="Volume control"
                />
              </div>
            </div>

            {/* Hidden audio element */}
            <audio ref={audioRef} src={audioUrl} preload="metadata" className="hidden" />
          </div>
        </div>

        {/* Transcript Column */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-hidden flex flex-col">
          <h3 className="font-semibold mb-3 text-gray-900">Synchronized Transcript</h3>

          <div className="overflow-y-auto flex-1 -mx-4 px-4" style={{ maxHeight: '600px' }}>
            {transcript.map((phrase, idx) => {
              const isPlaying = idx === currentPhraseIdx;
              const isSelected = idx === selectedPhrase;

              return (
                <div
                  key={idx}
                  className={`p-3 mb-2 rounded border-l-4 cursor-pointer transition-all ${
                    isPlaying
                      ? 'bg-blue-100 border-blue-600 shadow-sm'
                      : isSelected
                      ? 'bg-gray-100 border-gray-400'
                      : 'bg-gray-50 border-transparent hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setSelectedPhrase(idx);
                    jumpToTimestamp(phrase.startTime);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPhrase(idx);
                      jumpToTimestamp(phrase.startTime);
                    }
                  }}
                >
                  {/* Timestamp & Speaker */}
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      className="text-xs text-blue-600 hover:text-blue-800 font-mono"
                      onClick={e => {
                        e.stopPropagation();
                        jumpToTimestamp(phrase.startTime);
                      }}
                    >
                      🕐 {formatTime(phrase.startTime)}
                    </button>
                    {phrase.speaker === 'narrator' && (
                      <span className="text-xs" title="Narrator">
                        🎙️
                      </span>
                    )}
                    {phrase.speaker === 'example' && (
                      <span className="text-xs" title="Example dialogue">
                        💬
                      </span>
                    )}
                  </div>

                  {/* English */}
                  <p className="font-medium text-sm mb-1 text-gray-900">
                    🇺🇸 {phrase.english}
                  </p>

                  {/* Spanish */}
                  <p className="text-sm text-gray-700">🇨🇴 {phrase.spanish}</p>

                  {/* Pronunciation Hint */}
                  {phrase.pronunciation && (
                    <p className="text-xs text-purple-600 mt-1 italic">
                      🔊 [{phrase.pronunciation}]
                    </p>
                  )}
                </div>
              );
            })}

            {transcript.length === 0 && (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p>No transcript available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
