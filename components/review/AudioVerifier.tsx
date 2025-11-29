'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, CheckCircle2, AlertTriangle,
  RefreshCw, Download
} from 'lucide-react';

interface AudioVerifierProps {
  audioUrl: string;
  scriptContent: string;
  title?: string;
  onVerificationComplete?: (verified: boolean) => void;
}

interface VerificationIssue {
  type: 'missing' | 'mismatch' | 'timing';
  description: string;
  timestamp?: number;
}

/**
 * AudioVerifier Component
 *
 * Verifies TTS audio matches the script content:
 * - Synchronized playback with script highlighting
 * - Issue reporting for mismatches
 * - Verification checklist
 * - Re-generation request support
 */
export function AudioVerifier({
  audioUrl,
  scriptContent,
  title = 'Audio Verification',
  onVerificationComplete,
}: AudioVerifierProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [issues, setIssues] = useState<VerificationIssue[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Parse phrases from script
  const phrases = React.useMemo(() => {
    const result: string[] = [];
    const lines = scriptContent.split('\n');

    for (const line of lines) {
      if (line.startsWith('**Inglés:**') || line.startsWith('**English:**')) {
        const phrase = line.replace(/\*\*[^:]+:\*\*\s*/, '').replace(/"/g, '');
        if (phrase) result.push(phrase);
      }
    }

    return result;
  }, [scriptContent]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addIssue = useCallback((type: VerificationIssue['type'], description: string) => {
    setIssues(prev => [...prev, { type, description, timestamp: currentTime }]);
  }, [currentTime]);

  const removeIssue = useCallback((index: number) => {
    setIssues(prev => prev.filter((_, i) => i !== index));
  }, []);

  const markVerified = useCallback(() => {
    setIsVerified(true);
    onVerificationComplete?.(true);
  }, [onVerificationComplete]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * duration;
  }, [duration]);

  if (audioError) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Audio Error</h3>
            <p className="text-sm">{audioError}</p>
          </div>
        </div>
        <button
          onClick={() => setAudioError(null)}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Volume2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">Verify TTS audio matches the script</p>
            </div>
          </div>

          {isVerified ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Verified</span>
            </div>
          ) : (
            <button
              onClick={markVerified}
              disabled={issues.length > 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark as Verified
            </button>
          )}
        </div>
      </div>

      {/* Audio Player */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        {/* Progress bar */}
        <div
          className="h-3 bg-gray-200 rounded-full cursor-pointer mb-4 overflow-hidden"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-green-600 transition-all"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => skipTime(-10)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Rewind 10s"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <button
              onClick={() => skipTime(10)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Forward 10s"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <span className="text-sm font-mono text-gray-600 ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Playback speed */}
            <div className="flex items-center gap-1">
              {[0.5, 0.75, 1, 1.25, 1.5].map(rate => (
                <button
                  key={rate}
                  onClick={() => changePlaybackRate(rate)}
                  className={`px-2 py-1 text-xs rounded ${
                    playbackRate === rate
                      ? 'bg-green-600 text-white'
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
              className="p-2 rounded-lg hover:bg-gray-200"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      </div>

      {/* Script phrases */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Script Phrases ({phrases.length} total)
        </h4>
        <div className="grid gap-2 max-h-[300px] overflow-y-auto">
          {phrases.map((phrase, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <span className="flex-1 text-gray-900">{phrase}</span>
              <button
                onClick={() => addIssue('mismatch', `Issue with phrase: "${phrase}"`)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Report issue"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Issues section */}
      {issues.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-red-50">
          <h4 className="text-sm font-semibold text-red-700 mb-2">
            Issues Found ({issues.length})
          </h4>
          <div className="space-y-2">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2 bg-white rounded border border-red-200"
              >
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-700">{issue.description}</span>
                {issue.timestamp !== undefined && (
                  <span className="text-xs text-gray-500">@ {formatTime(issue.timestamp)}</span>
                )}
                <button
                  onClick={() => removeIssue(idx)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <button
            className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            <RefreshCw className="w-4 h-4" />
            Request Re-generation
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
        <span>Audio: {audioUrl}</span>
        <span>{phrases.length} phrases to verify</span>
      </div>
    </div>
  );
}
