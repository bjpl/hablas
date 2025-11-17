/**
 * Topic Grouping Type Definitions
 *
 * Data structures for organizing resources by topic with variations.
 * Topics group multiple resource variations (Var 1, Var 2, etc.) under a single theme.
 */

import type { Resource } from '@/data/resources';

/**
 * A group of resources sharing the same base topic
 * Example: "Frases Esenciales para Entregas" groups Var 1, Var 2, etc.
 */
export interface TopicGroup {
  /** URL-safe topic identifier (e.g., "frases-esenciales-para-entregas") */
  slug: string;

  /** Display name for the topic (e.g., "Frases Esenciales para Entregas") */
  name: string;

  /** Category this topic belongs to */
  category: 'all' | 'repartidor' | 'conductor';

  /** Difficulty level for this topic */
  level: 'basico' | 'intermedio' | 'avanzado';

  /** All resources (variations) for this topic */
  resources: Resource[];

  /** Count of variations (Var 1, 2, etc.) */
  variations: number;

  /** Primary tags from the resources */
  tags: string[];

  /** Total size of all variations combined */
  totalSize: string;
}

/**
 * Options for topic grouping behavior
 */
export interface TopicGroupingOptions {
  /** Whether to include resources without variation numbers */
  includeStandalone?: boolean;

  /** Sort order for variations within a topic */
  sortVariations?: 'asc' | 'desc';

  /** Filter by category */
  category?: 'all' | 'repartidor' | 'conductor';

  /** Filter by level */
  level?: 'basico' | 'intermedio' | 'avanzado';
}

/**
 * Result of topic grouping operation
 */
export interface TopicGroupingResult {
  /** All topic groups found */
  topics: TopicGroup[];

  /** Resources that don't match any topic pattern */
  ungrouped: Resource[];

  /** Total number of topics */
  totalTopics: number;

  /** Total number of variations across all topics */
  totalVariations: number;
}
