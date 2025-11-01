/**
 * Resource Content Type Definitions
 *
 * Consolidated interfaces for JSON-structured learning content.
 * Used across resource renderers for type safety and consistency.
 */

export interface VocabularyItem {
  word: string;
  pronunciation: string;
  translation: string;
  context?: string;
  example?: string;
}

export interface CulturalNoteData {
  title: string;
  content: string;
  importance: 'high' | 'medium' | 'low';
  region?: string;
}

export interface PracticalScenarioData {
  title: string;
  situation: string;
  phrases: Array<{
    spanish: string;
    pronunciation: string;
    english: string;
  }>;
  tips?: string[];
}

export interface PhraseData {
  spanish: string;
  pronunciation: string;
  english: string;
  formality?: 'formal' | 'informal' | 'neutral';
  context?: string;
}

export interface JsonResourceContent {
  type: 'vocabulary' | 'cultural' | 'scenarios' | 'phrases';
  vocabulary?: VocabularyItem[];
  culturalNotes?: CulturalNoteData[];
  scenarios?: PracticalScenarioData[];
  phrases?: PhraseData[];
}
