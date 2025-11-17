/**
 * Topic Grouping Utilities
 *
 * Functions for grouping resources by topic and handling variations.
 * Topics are extracted from resource titles by removing variation suffixes.
 */

import type { Resource } from '@/data/resources';
import type {
  TopicGroup,
  TopicGroupingOptions,
  TopicGroupingResult,
} from '@/lib/types/topic';

/**
 * Regular expression patterns for identifying variations in titles
 */
const VARIATION_PATTERNS = [
  /\s*-\s*Var\s+\d+$/i, // " - Var 1", " - Var 2", etc.
  /\s*-\s*Variación\s+\d+$/i, // " - Variación 1", etc.
  /\s*\(Var\s+\d+\)$/i, // " (Var 1)", etc.
  /\s*\(Variación\s+\d+\)$/i, // " (Variación 1)", etc.
];

/**
 * Extract base topic name from a resource title
 * Removes variation suffixes like "- Var 1", "- Var 2", etc.
 *
 * @param title - The full resource title
 * @returns The base topic name without variation suffix
 *
 * @example
 * getTopicName("Frases Esenciales para Entregas - Var 1")
 * // Returns: "Frases Esenciales para Entregas"
 */
export function getTopicName(title: string): string {
  let baseTopic = title;

  for (const pattern of VARIATION_PATTERNS) {
    baseTopic = baseTopic.replace(pattern, '');
  }

  return baseTopic.trim();
}

/**
 * Create URL-safe slug from topic name
 *
 * @param title - The topic name or full resource title
 * @returns URL-safe slug
 *
 * @example
 * getTopicSlug("Frases Esenciales para Entregas - Var 1")
 * // Returns: "frases-esenciales-para-entregas"
 */
export function getTopicSlug(title: string): string {
  const topicName = getTopicName(title);

  return topicName
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract variation number from resource title
 *
 * @param title - The resource title
 * @returns Variation number or 0 if none found
 *
 * @example
 * getVariationNumber("Frases Esenciales - Var 2")
 * // Returns: 2
 */
export function getVariationNumber(title: string): number {
  const match = title.match(/Var(?:iación)?\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Calculate total size of multiple resources
 *
 * @param resources - Array of resources
 * @returns Human-readable total size
 */
function calculateTotalSize(resources: Resource[]): string {
  let totalBytes = 0;

  for (const resource of resources) {
    // Parse size string like "31.0 KB", "1.5 MB"
    const match = resource.size.match(/^([\d.]+)\s*([KMGT]?B)$/i);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toUpperCase();

      const multipliers: Record<string, number> = {
        B: 1,
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024,
        TB: 1024 * 1024 * 1024 * 1024,
      };

      totalBytes += value * (multipliers[unit] || 1);
    }
  }

  // Convert back to human-readable
  if (totalBytes < 1024) return `${totalBytes} B`;
  if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
  if (totalBytes < 1024 * 1024 * 1024)
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Merge tags from multiple resources
 *
 * @param resources - Array of resources
 * @returns Unique tags
 */
function mergeTags(resources: Resource[]): string[] {
  const tagSet = new Set<string>();

  for (const resource of resources) {
    for (const tag of resource.tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet);
}

/**
 * Group resources by their base topic name
 *
 * @param resources - Array of resources to group
 * @param options - Grouping options
 * @returns Grouped topics with all variations
 *
 * @example
 * const result = groupResourcesByTopic(resources);
 * // Returns: { topics: [...], ungrouped: [...], ... }
 */
export function groupResourcesByTopic(
  resources: Resource[],
  options: TopicGroupingOptions = {}
): TopicGroupingResult {
  const {
    includeStandalone = false,
    sortVariations = 'asc',
    category,
    level,
  } = options;

  // Filter resources by category and level if specified
  let filteredResources = resources;

  if (category && category !== 'all') {
    filteredResources = filteredResources.filter((r) => r.category === category);
  }

  if (level) {
    filteredResources = filteredResources.filter((r) => r.level === level);
  }

  // Group by topic slug
  const topicMap = new Map<string, Resource[]>();
  const ungrouped: Resource[] = [];

  for (const resource of filteredResources) {
    const topicName = getTopicName(resource.title);
    const variationNum = getVariationNumber(resource.title);

    // Skip resources without variations unless includeStandalone is true
    if (variationNum === 0 && !includeStandalone) {
      ungrouped.push(resource);
      continue;
    }

    const slug = getTopicSlug(topicName);
    const existing = topicMap.get(slug) || [];
    topicMap.set(slug, [...existing, resource]);
  }

  // Convert to TopicGroup array
  const topics: TopicGroup[] = [];

  for (const [slug, groupResources] of topicMap.entries()) {
    if (groupResources.length === 0) continue;

    // Sort variations
    const sortedResources = [...groupResources].sort((a, b) => {
      const aVar = getVariationNumber(a.title);
      const bVar = getVariationNumber(b.title);
      return sortVariations === 'asc' ? aVar - bVar : bVar - aVar;
    });

    // Use the first resource as the template
    const template = sortedResources[0];

    topics.push({
      slug,
      name: getTopicName(template.title),
      category: template.category,
      level: template.level,
      resources: sortedResources,
      variations: sortedResources.length,
      tags: mergeTags(sortedResources),
      totalSize: calculateTotalSize(sortedResources),
    });
  }

  // Sort topics by name
  topics.sort((a, b) => a.name.localeCompare(b.name));

  return {
    topics,
    ungrouped,
    totalTopics: topics.length,
    totalVariations: topics.reduce((sum, topic) => sum + topic.variations, 0),
  };
}

/**
 * Find a specific topic by its slug
 *
 * @param slug - URL-safe topic identifier
 * @param resources - Array of resources to search
 * @param options - Grouping options
 * @returns The topic group or null if not found
 *
 * @example
 * const topic = getTopicBySlug("frases-esenciales-para-entregas", resources);
 * // Returns: TopicGroup with all variations
 */
export function getTopicBySlug(
  slug: string,
  resources: Resource[],
  options: TopicGroupingOptions = {}
): TopicGroup | null {
  const { topics } = groupResourcesByTopic(resources, options);
  return topics.find((topic) => topic.slug === slug) || null;
}

/**
 * Get all unique topics from resources
 *
 * @param resources - Array of resources
 * @param options - Grouping options
 * @returns Array of topic slugs
 */
export function getAllTopicSlugs(
  resources: Resource[],
  options: TopicGroupingOptions = {}
): string[] {
  const { topics } = groupResourcesByTopic(resources, options);
  return topics.map((topic) => topic.slug);
}

/**
 * Check if a title belongs to a specific topic
 *
 * @param title - Resource title to check
 * @param topicSlug - Topic slug to match against
 * @returns True if the title belongs to the topic
 */
export function isTitleInTopic(title: string, topicSlug: string): boolean {
  return getTopicSlug(title) === topicSlug;
}
