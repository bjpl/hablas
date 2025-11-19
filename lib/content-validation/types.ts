/**
 * Shared types for content validation and review
 */

export interface BilingualPhrase {
  english: string;
  spanish: string;
  lineNumber: number;
  context?: string;
}

export interface AudioTimestamp {
  start: number;
  end: number;
  phraseIndex: number;
}

export interface TranscriptPhrase {
  english: string;
  spanish: string;
  pronunciation?: string;
  speaker?: 'narrator' | 'example';
  startTime: number;
  endTime: number;
}

export interface FormatDifference {
  type: 'addition' | 'deletion' | 'modification';
  line: number;
  content: string;
  suggestion?: string;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'colombian' | 'context' | 'scenario' | 'terminology';
  line: number;
  message: string;
  suggestion?: string;
  autoFix?: () => void;
}

export interface ContentVariation {
  id: string;
  name: string;
  content: string;
  isDirty: boolean;
  lastModified?: string;
}

export type ResourceCategory = 'repartidor' | 'conductor' | 'general';
export type ResourceLevel = 'basico' | 'intermedio' | 'avanzado';
