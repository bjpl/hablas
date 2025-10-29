'use client';

import { useState } from 'react';
import { Volume2, Copy, RotateCw, Check } from 'lucide-react';

export interface VocabularyItem {
  id: string;
  english: string;
  spanish: string;
  pronunciation: string;
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase';
  context?: string;
  usageNotes?: string;
  examples?: {
    english: string;
    spanish: string;
  }[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
}

interface VocabularyCardProps {
  item: VocabularyItem;
  onPronounce?: (text: string, language: 'en' | 'es') => void;
  className?: string;
  autoFlip?: boolean;
}

export default function VocabularyCard({
  item,
  onPronounce,
  className = '',
  autoFlip = false
}: VocabularyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState<'english' | 'spanish' | null>(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePronounce = (text: string, language: 'en' | 'es') => {
    if (onPronounce) {
      onPronounce(text, language);
    } else {
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'en' ? 'en-US' : 'es-ES';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleCopy = async (text: string, type: 'english' | 'spanish') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div
      className={`vocabulary-card-container perspective-1000 ${className}`}
      role="article"
      aria-label={`Vocabulary card: ${item.english}`}
    >
      <div
        className={`vocabulary-card relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Side - English */}
        <div className="vocabulary-card-face vocabulary-card-front absolute w-full h-full backface-hidden">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
            {/* Header with badges and flip button */}
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="flex flex-wrap gap-2">
                {item.difficulty && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                      item.difficulty
                    )}`}
                  >
                    {item.difficulty}
                  </span>
                )}
                {item.partOfSpeech && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {item.partOfSpeech}
                  </span>
                )}
                {item.category && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {item.category}
                  </span>
                )}
              </div>
              <button
                onClick={handleFlip}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
                aria-label="Flip card to see Spanish translation"
              >
                <RotateCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* English term */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                    {item.english}
                  </h3>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handlePronounce(item.english, 'en')}
                      className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 transition-colors"
                      aria-label={`Pronounce ${item.english} in English`}
                    >
                      <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </button>
                    <button
                      onClick={() => handleCopy(item.english, 'english')}
                      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                      aria-label={`Copy ${item.english} to clipboard`}
                    >
                      {copied === 'english' ? (
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {item.context && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {item.context}
                  </p>
                )}
              </div>
            </div>

            {/* Usage notes */}
            {item.usageNotes && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Usage: </span>
                  {item.usageNotes}
                </p>
              </div>
            )}

            {/* Examples */}
            {item.examples && item.examples.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Examples
                </p>
                <div className="space-y-2">
                  {item.examples.slice(0, 2).map((example, index) => (
                    <p
                      key={index}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      "{example.english}"
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Flip hint */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click the rotate icon to see Spanish translation
              </p>
            </div>
          </div>
        </div>

        {/* Back Side - Spanish */}
        <div className="vocabulary-card-face vocabulary-card-back absolute w-full h-full backface-hidden rotate-y-180">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-indigo-900/20 rounded-xl shadow-lg border border-indigo-200 dark:border-indigo-700 p-6 h-full flex flex-col">
            {/* Header with flip button */}
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  Español
                </span>
              </div>
              <button
                onClick={handleFlip}
                className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors shrink-0"
                aria-label="Flip card to see English translation"
              >
                <RotateCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>

            {/* Spanish term */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-3xl md:text-4xl font-bold text-indigo-900 dark:text-indigo-100 leading-tight">
                    {item.spanish}
                  </h3>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handlePronounce(item.spanish, 'es')}
                      className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 transition-colors"
                      aria-label={`Pronounce ${item.spanish} in Spanish`}
                    >
                      <Volume2 className="w-5 h-5 text-indigo-700 dark:text-indigo-300" />
                    </button>
                    <button
                      onClick={() => handleCopy(item.spanish, 'spanish')}
                      className="p-2 rounded-lg bg-white/70 hover:bg-white dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                      aria-label={`Copy ${item.spanish} to clipboard`}
                    >
                      {copied === 'spanish' ? (
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Pronunciation guide */}
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">
                    Pronunciation
                  </p>
                  <p className="text-lg font-mono text-indigo-900 dark:text-indigo-100">
                    [{item.pronunciation}]
                  </p>
                </div>
              </div>
            </div>

            {/* Examples in Spanish */}
            {item.examples && item.examples.length > 0 && (
              <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-700">
                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-2">
                  Ejemplos
                </p>
                <div className="space-y-2">
                  {item.examples.slice(0, 2).map((example, index) => (
                    <p
                      key={index}
                      className="text-sm text-indigo-900 dark:text-indigo-100"
                    >
                      "{example.spanish}"
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* English reference */}
            <div className="mt-4 text-center">
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                English: {item.english}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for 3D flip effect */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .vocabulary-card {
          min-height: 320px;
        }
        @media (min-width: 768px) {
          .vocabulary-card {
            min-height: 380px;
          }
        }
      `}</style>
    </div>
  );
}
