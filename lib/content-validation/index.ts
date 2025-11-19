/**
 * Content Validation Utilities
 * Export all validation utilities and types
 */

// Types
export type {
  BilingualPhrase,
  AudioTimestamp,
  TranscriptPhrase,
  FormatDifference,
  ValidationIssue,
  ContentVariation,
  ResourceCategory,
  ResourceLevel,
} from './types';

// Bilingual parsing utilities
export {
  parseBilingualContent,
  reconstructBilingualContent,
  findMissingTranslations,
} from './bilingual-parser';

// Colombian Spanish validation
export {
  COLOMBIAN_TERMS,
  DELIVERY_TERMS,
  CULTURAL_CHECKS,
  SCENARIO_REQUIREMENTS,
  validateContent,
  getTerminologySuggestions,
} from './colombian-spanish-rules';
