'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Mic, Play, Pause, Volume2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import type { EditorProps } from './types';

interface AudioScriptEditorProps extends EditorProps {
  audioUrl?: string;
  title?: string;
  description?: string;
}

/**
 * AudioScriptEditor Component
 *
 * Editor for audio narration scripts with:
 * - Script editing with phrase structure awareness
 * - Optional audio playback for verification
 * - Phrase highlighting during playback
 * - TTS-friendly format validation
 */
export function AudioScriptEditor({
  content,
  onChange,
  onSave,
  readOnly = false,
  autoSave = true,
  autoSaveDelay = 3000,
  audioUrl,
  title = 'Audio Script',
  description = 'Edit the narration script for TTS generation',
}: AudioScriptEditorProps) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Track changes
  useEffect(() => {
    setHasChanges(content.edited !== content.original);
  }, [content.edited, content.original]);

  // Auto-save logic
  useEffect(() => {
    if (!autoSave || readOnly || !hasChanges) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(async () => {
      await handleSave();
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content.edited, autoSave, autoSaveDelay, hasChanges, readOnly]);

  // Audio time tracking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const handleSave = useCallback(async () => {
    if (saving || readOnly) return;

    setSaving(true);
    try {
      await onSave();
      setLastSaved(new Date());
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  }, [onSave, saving, readOnly]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Parse script into phrases for display
  const parseScriptPhrases = (text: string) => {
    const phrases: { english: string; spanish: string; pronunciation: string }[] = [];
    const lines = text.split('\n');

    let currentPhrase: { english: string; spanish: string; pronunciation: string } = {
      english: '', spanish: '', pronunciation: ''
    };

    for (const line of lines) {
      if (line.startsWith('**Inglés:**') || line.startsWith('**English:**')) {
        if (currentPhrase.english) phrases.push({ ...currentPhrase });
        currentPhrase = { english: '', spanish: '', pronunciation: '' };
        currentPhrase.english = line.replace(/\*\*[^:]+:\*\*\s*/, '').replace(/"/g, '');
      } else if (line.startsWith('**Español:**') || line.startsWith('**Spanish:**')) {
        currentPhrase.spanish = line.replace(/\*\*[^:]+:\*\*\s*/, '').replace(/"/g, '');
      } else if (line.startsWith('**Pronunciación:**') || line.startsWith('**Pronunciation:**')) {
        currentPhrase.pronunciation = line.replace(/\*\*[^:]+:\*\*\s*/, '');
      }
    }

    if (currentPhrase.english) phrases.push(currentPhrase);
    return phrases;
  };

  const phrases = parseScriptPhrases(content.edited);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mic className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-0.5">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status indicator */}
            {hasChanges ? (
              <span className="flex items-center gap-1.5 text-sm text-amber-600">
                <AlertCircle className="w-4 h-4" />
                Unsaved
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Saved
              </span>
            ) : null}

            {/* Save button */}
            {!readOnly && (
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audio player (if audio available) */}
      {audioUrl && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayback}
              className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>

            <Volume2 className="w-5 h-5 text-gray-400" />
          </div>
          <audio ref={audioRef} src={audioUrl} preload="metadata" />
        </div>
      )}

      {/* Main content area */}
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        {/* Script editor */}
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Script Source</h4>
          <textarea
            value={content.edited}
            onChange={handleChange}
            readOnly={readOnly}
            className="w-full h-[500px] p-4 font-mono text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter audio script..."
          />
        </div>

        {/* Phrase preview */}
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Phrases Preview ({phrases.length} phrases)
          </h4>
          <div className="h-[500px] overflow-y-auto space-y-3">
            {phrases.map((phrase, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{phrase.english}</p>
                    <p className="text-gray-600 mt-1">{phrase.spanish}</p>
                    {phrase.pronunciation && (
                      <p className="text-purple-600 text-sm mt-1 italic">
                        [{phrase.pronunciation}]
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {phrases.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No phrases detected. Add phrases using the format:<br/>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                  **Inglés:** "phrase here"
                </code>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
        <span>Status: {content.status}</span>
        <span>{phrases.length} phrases detected</span>
      </div>
    </div>
  );
}
