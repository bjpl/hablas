'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, CheckCircle2, AlertTriangle,
  RefreshCw, Download, Check, X, MessageSquare,
  ChevronDown, Loader2
} from 'lucide-react';

interface AudioVerifierProps {
  audioUrl: string;
  scriptContent: string;
  title?: string;
  resourceId?: number;
  onVerificationComplete?: (verified: boolean, issues: VerificationIssue[]) => void;
  onRequestRegeneration?: (issues: VerificationIssue[]) => Promise<void>;
}

type IssueType = 'pronunciation' | 'missing' | 'mismatch' | 'timing' | 'quality' | 'other';

interface VerificationIssue {
  id: string;
  type: IssueType;
  phraseIndex?: number;
  phrase?: string;
  description: string;
  timestamp?: number;
  severity: 'low' | 'medium' | 'high';
}

interface ParsedPhrase {
  english: string;
  spanish: string;
  pronunciation: string;
}

const ISSUE_TYPES: { value: IssueType; label: string; description: string }[] = [
  { value: 'pronunciation', label: 'Pronunciation', description: 'Word pronounced incorrectly' },
  { value: 'missing', label: 'Missing', description: 'Phrase not in audio' },
  { value: 'mismatch', label: 'Mismatch', description: 'Audio differs from script' },
  { value: 'timing', label: 'Timing', description: 'Pacing or pause issues' },
  { value: 'quality', label: 'Quality', description: 'Audio quality problem' },
  { value: 'other', label: 'Other', description: 'Other issue' },
];

/**
 * AudioVerifier Component
 *
 * Full-featured audio verification for TTS content:
 * - Per-phrase verification checkboxes
 * - Issue reporting with types and severity
 * - Volume and playback controls
 * - Verification persistence
 * - Re-generation request support
 */
export function AudioVerifier({
  audioUrl,
  scriptContent,
  title = 'Audio Verification',
  resourceId,
  onVerificationComplete,
  onRequestRegeneration,
}: AudioVerifierProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(true);

  // Verification state
  const [verifiedPhrases, setVerifiedPhrases] = useState<Set<number>>(new Set());
  const [issues, setIssues] = useState<VerificationIssue[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [saving, setSaving] = useState(false);

  // Issue form state
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueFormPhrase, setIssueFormPhrase] = useState<number | null>(null);
  const [issueType, setIssueType] = useState<IssueType>('mismatch');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueSeverity, setIssueSeverity] = useState<'low' | 'medium' | 'high'>('medium');

  // Parse phrases from script - handles multiple content formats
  const phrases = React.useMemo((): ParsedPhrase[] => {
    const result: ParsedPhrase[] = [];
    const lines = scriptContent.split('\n');

    const cleanLine = (line: string) => line.replace(/[│┌┐└┘─]/g, '').trim();

    let currentPhrase: ParsedPhrase = { english: '', spanish: '', pronunciation: '' };

    for (const rawLine of lines) {
      const line = cleanLine(rawLine);

      const englishMatch = line.match(/\*\*(?:English|Inglés)\*?\*?:?\s*"?([^"]+)"?/i);
      if (englishMatch) {
        if (currentPhrase.english) result.push({ ...currentPhrase });
        currentPhrase = { english: '', spanish: '', pronunciation: '' };
        currentPhrase.english = englishMatch[1].trim();
        continue;
      }

      const spanishMatch = line.match(/(?:🗣️\s*)?\*\*(?:Español|Spanish)\*?\*?:?\s*"?([^"]+)"?/i);
      if (spanishMatch) {
        currentPhrase.spanish = spanishMatch[1].trim();
        continue;
      }

      const pronMatch = line.match(/(?:🔊\s*)?\*\*(?:Pronunciación|Pronunciation)\*?\*?:?\s*\[?([^\]]+)\]?/i);
      if (pronMatch) {
        currentPhrase.pronunciation = pronMatch[1].trim();
      }
    }

    if (currentPhrase.english) result.push(currentPhrase);
    return result;
  }, [scriptContent]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setAudioLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setAudioError('Failed to load audio file. Please check the URL.');
      setAudioLoading(false);
    };
    const handleCanPlay = () => setAudioLoading(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl]);

  // Update audio volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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
    setIsMuted(prev => !prev);
  }, []);

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

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Phrase verification
  const togglePhraseVerified = useCallback((index: number) => {
    setVerifiedPhrases(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const verifyAllPhrases = useCallback(() => {
    setVerifiedPhrases(new Set(phrases.map((_, i) => i)));
  }, [phrases]);

  const clearAllVerifications = useCallback(() => {
    setVerifiedPhrases(new Set());
  }, []);

  // Issue management
  const openIssueForm = useCallback((phraseIndex?: number) => {
    setIssueFormPhrase(phraseIndex ?? null);
    setIssueType('mismatch');
    setIssueDescription('');
    setIssueSeverity('medium');
    setShowIssueForm(true);
  }, []);

  const submitIssue = useCallback(() => {
    const newIssue: VerificationIssue = {
      id: `issue-${Date.now()}`,
      type: issueType,
      phraseIndex: issueFormPhrase ?? undefined,
      phrase: issueFormPhrase !== null ? phrases[issueFormPhrase]?.english : undefined,
      description: issueDescription || ISSUE_TYPES.find(t => t.value === issueType)?.description || '',
      timestamp: currentTime,
      severity: issueSeverity,
    };
    setIssues(prev => [...prev, newIssue]);
    setShowIssueForm(false);

    // Remove from verified if adding issue
    if (issueFormPhrase !== null) {
      setVerifiedPhrases(prev => {
        const next = new Set(prev);
        next.delete(issueFormPhrase);
        return next;
      });
    }
  }, [issueType, issueDescription, issueSeverity, issueFormPhrase, currentTime, phrases]);

  const removeIssue = useCallback((id: string) => {
    setIssues(prev => prev.filter(i => i.id !== id));
  }, []);

  // Mark all as verified
  const markAllVerified = useCallback(async () => {
    if (issues.length > 0) return;

    setSaving(true);
    try {
      // Save to API if resourceId provided
      if (resourceId) {
        await fetch(`/api/content/${resourceId}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify-audio',
            verified: true,
            verifiedPhrases: Array.from(verifiedPhrases),
            totalPhrases: phrases.length,
          }),
        });
      }

      setIsVerified(true);
      onVerificationComplete?.(true, []);
    } catch (error) {
      console.error('Failed to save verification:', error);
    } finally {
      setSaving(false);
    }
  }, [issues.length, resourceId, verifiedPhrases, phrases.length, onVerificationComplete]);

  // Request re-generation
  const requestRegeneration = useCallback(async () => {
    if (issues.length === 0) return;

    setSaving(true);
    try {
      if (onRequestRegeneration) {
        await onRequestRegeneration(issues);
      } else if (resourceId) {
        await fetch(`/api/content/${resourceId}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'request-regeneration',
            issues,
          }),
        });
      }
      alert('Re-generation request submitted successfully');
    } catch (error) {
      console.error('Failed to request regeneration:', error);
      alert('Failed to submit re-generation request');
    } finally {
      setSaving(false);
    }
  }, [issues, resourceId, onRequestRegeneration]);

  // Download transcript
  const downloadTranscript = useCallback(() => {
    const content = phrases.map((p, i) =>
      `${i + 1}. ${p.english}\n   Spanish: ${p.spanish}\n   Pronunciation: ${p.pronunciation}\n`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${resourceId || 'audio'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [phrases, resourceId]);

  // Progress calculation
  const verificationProgress = phrases.length > 0
    ? Math.round((verifiedPhrases.size / phrases.length) * 100)
    : 0;

  // Error state
  if (audioError) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Audio Error</h3>
            <p className="text-sm">{audioError}</p>
            <p className="text-xs text-gray-500 mt-1">URL: {audioUrl}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setAudioError(null);
            setAudioLoading(true);
          }}
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
              <p className="text-sm text-gray-600">
                {verificationProgress}% verified ({verifiedPhrases.size}/{phrases.length} phrases)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadTranscript}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Download transcript"
            >
              <Download className="w-5 h-5" />
            </button>

            {isVerified ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Verified</span>
              </div>
            ) : (
              <button
                onClick={markAllVerified}
                disabled={issues.length > 0 || saving || verifiedPhrases.size < phrases.length}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Mark Verified
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-green-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${verificationProgress}%` }}
          />
        </div>
      </div>

      {/* Audio Player */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        {audioLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading audio...</span>
          </div>
        ) : (
          <>
            {/* Waveform/Progress bar */}
            <div
              className="h-4 bg-gray-200 rounded-full cursor-pointer mb-4 overflow-hidden relative group"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-green-600 transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
              <div className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-20 transition-opacity" />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
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
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        playbackRate === rate
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Volume control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg hover:bg-gray-200"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      </div>

      {/* Phrases verification list */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">
            Phrases to Verify ({phrases.length})
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={verifyAllPhrases}
              className="text-xs text-green-600 hover:text-green-700"
            >
              Verify All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={clearAllVerifications}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {phrases.map((phrase, idx) => {
            const hasIssue = issues.some(i => i.phraseIndex === idx);
            const isVerifiedPhrase = verifiedPhrases.has(idx);

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  hasIssue
                    ? 'bg-red-50 border-red-200'
                    : isVerifiedPhrase
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => togglePhraseVerified(idx)}
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    isVerifiedPhrase
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {isVerifiedPhrase && <Check className="w-4 h-4" />}
                </button>

                {/* Phrase number */}
                <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  hasIssue
                    ? 'bg-red-100 text-red-700'
                    : isVerifiedPhrase
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-700'
                }`}>
                  {idx + 1}
                </span>

                {/* Phrase content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{phrase.english}</p>
                  {phrase.spanish && (
                    <p className="text-sm text-gray-600 mt-0.5">{phrase.spanish}</p>
                  )}
                  {phrase.pronunciation && (
                    <p className="text-xs text-purple-600 mt-0.5 font-mono">[{phrase.pronunciation}]</p>
                  )}
                </div>

                {/* Actions */}
                <button
                  onClick={() => openIssueForm(idx)}
                  className={`p-1.5 rounded transition-colors ${
                    hasIssue
                      ? 'text-red-500 bg-red-100'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                  title="Report issue"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {phrases.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No phrases found in the content.
            </div>
          )}
        </div>
      </div>

      {/* Issue Form Modal */}
      {showIssueForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Report Issue</h3>
              {issueFormPhrase !== null && phrases[issueFormPhrase] && (
                <p className="text-sm text-gray-500 mt-1">
                  Phrase {issueFormPhrase + 1}: "{phrases[issueFormPhrase].english}"
                </p>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Issue Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                <div className="relative">
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as IssueType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white pr-10"
                  >
                    {ISSUE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {ISSUE_TYPES.find(t => t.value === issueType)?.description}
                </p>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(sev => (
                    <button
                      key={sev}
                      onClick={() => setIssueSeverity(sev)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        issueSeverity === sev
                          ? sev === 'high' ? 'bg-red-100 text-red-700 border-2 border-red-300'
                            : sev === 'medium' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                            : 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none h-20"
                />
              </div>

              {/* Timestamp */}
              <p className="text-xs text-gray-500">
                Timestamp: {formatTime(currentTime)}
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowIssueForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={submitIssue}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issues section */}
      {issues.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-red-50">
          <h4 className="text-sm font-semibold text-red-700 mb-3">
            Issues Found ({issues.length})
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200"
              >
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  issue.severity === 'high' ? 'text-red-500'
                  : issue.severity === 'medium' ? 'text-yellow-500'
                  : 'text-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 rounded">
                      {ISSUE_TYPES.find(t => t.value === issue.type)?.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      issue.severity === 'high' ? 'bg-red-100 text-red-700'
                      : issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                    }`}>
                      {issue.severity}
                    </span>
                    {issue.timestamp !== undefined && (
                      <span className="text-xs text-gray-500">@ {formatTime(issue.timestamp)}</span>
                    )}
                  </div>
                  {issue.phrase && (
                    <p className="text-sm text-gray-600 mt-1">"{issue.phrase}"</p>
                  )}
                  {issue.description && (
                    <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                  )}
                </div>
                <button
                  onClick={() => removeIssue(issue.id)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={requestRegeneration}
            disabled={saving}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Request Re-generation
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
        <span className="truncate max-w-[60%]">Audio: {audioUrl}</span>
        <span>{verifiedPhrases.size} of {phrases.length} verified</span>
      </div>
    </div>
  );
}
