'use client';

import { useState } from 'react';
import {
  Globe,
  MapPin,
  Users,
  Landmark,
  Calendar,
  Book,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Share2,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

export interface CulturalNote {
  id: string;
  title: string;
  category:
    | 'customs'
    | 'traditions'
    | 'history'
    | 'food'
    | 'etiquette'
    | 'language'
    | 'holidays'
    | 'social';
  region?: string;
  country?: string;
  description: string;
  details?: string[];
  doAndDont?: {
    do: string[];
    dont: string[];
  };
  funFacts?: string[];
  relatedTerms?: string[];
  sources?: {
    title: string;
    url: string;
  }[];
  importance?: 'essential' | 'helpful' | 'interesting';
}

interface CulturalNotesProps {
  note: CulturalNote;
  onBookmark?: (noteId: string) => void;
  onShare?: (noteId: string) => void;
  isBookmarked?: boolean;
  className?: string;
}

export default function CulturalNotes({
  note,
  onBookmark,
  onShare,
  isBookmarked = false,
  className = ''
}: CulturalNotesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'customs':
        return <Users className="w-5 h-5" />;
      case 'traditions':
        return <Landmark className="w-5 h-5" />;
      case 'history':
        return <Book className="w-5 h-5" />;
      case 'food':
        return <Globe className="w-5 h-5" />;
      case 'etiquette':
        return <Users className="w-5 h-5" />;
      case 'holidays':
        return <Calendar className="w-5 h-5" />;
      case 'social':
        return <Users className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'customs':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'traditions':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'history':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'food':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'etiquette':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'holidays':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'social':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getImportanceBadge = (importance?: string) => {
    switch (importance) {
      case 'essential':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Essential
          </span>
        );
      case 'helpful':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Helpful
          </span>
        );
      case 'interesting':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Interesting
          </span>
        );
      default:
        return null;
    }
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(note.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(note.id);
    } else if (navigator.share) {
      navigator.share({
        title: note.title,
        text: note.description,
        url: window.location.href
      }).catch(() => {
        // Silently handle share cancellation
      });
    }
  };

  return (
    <div
      className={`cultural-note bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      role="article"
      aria-label={`Cultural note: ${note.title}`}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                  note.category
                )}`}
              >
                {getCategoryIcon(note.category)}
                {note.category}
              </span>
              {note.importance && getImportanceBadge(note.importance)}
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {note.title}
            </h3>

            {(note.region || note.country) && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>
                  {note.region}
                  {note.region && note.country && ', '}
                  {note.country}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            {onShare && (
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Share cultural note"
              >
                <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            {onBookmark && (
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'bg-indigo-100 dark:bg-indigo-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-label={
                  isBookmarked ? 'Remove bookmark' : 'Bookmark cultural note'
                }
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Bookmark className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {note.description}
        </p>
      </div>

      {/* Expandable Details */}
      {(note.details ||
        note.doAndDont ||
        note.funFacts ||
        note.relatedTerms ||
        note.sources) && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            aria-expanded={isExpanded}
            aria-controls={`cultural-note-details-${note.id}`}
          >
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {isExpanded ? 'Hide Details' : 'Show More Details'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {isExpanded && (
            <div
              id={`cultural-note-details-${note.id}`}
              className="px-6 pb-6 space-y-6"
            >
              {/* Detailed Information */}
              {note.details && note.details.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Additional Information
                  </h4>
                  <ul className="space-y-2">
                    {note.details.map((detail, index) => (
                      <li
                        key={index}
                        className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-indigo-600 dark:text-indigo-400 shrink-0">
                          •
                        </span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Do's and Don'ts */}
              {note.doAndDont && (
                <div className="grid md:grid-cols-2 gap-4">
                  {note.doAndDont.do && note.doAndDont.do.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                        ✓ Do's
                      </h4>
                      <ul className="space-y-2">
                        {note.doAndDont.do.map((item, index) => (
                          <li
                            key={index}
                            className="text-sm text-green-800 dark:text-green-200"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {note.doAndDont.dont && note.doAndDont.dont.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                        ✗ Don'ts
                      </h4>
                      <ul className="space-y-2">
                        {note.doAndDont.dont.map((item, index) => (
                          <li
                            key={index}
                            className="text-sm text-red-800 dark:text-red-200"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Fun Facts */}
              {note.funFacts && note.funFacts.length > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                    💡 Fun Facts
                  </h4>
                  <ul className="space-y-2">
                    {note.funFacts.map((fact, index) => (
                      <li
                        key={index}
                        className="text-sm text-indigo-800 dark:text-indigo-200"
                      >
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Terms */}
              {note.relatedTerms && note.relatedTerms.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Related Terms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {note.relatedTerms.map((term, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources */}
              {note.sources && note.sources.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Learn More
                  </h4>
                  <ul className="space-y-2">
                    {note.sources.map((source, index) => (
                      <li key={index}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {source.title}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
