/**
 * Topics Service
 *
 * Service layer for managing topics and their relationships with resources
 *
 * NOTE: This service now uses the main resources.ts file with proper hidden filtering
 * instead of reading from data/resources/*.json files which contain hidden resources.
 */

import type { Topic, TopicCategory, TopicResource, TopicWithResources } from '@/lib/types/topics';
import { visibleResources, type Resource } from '@/data/resources';

/**
 * Get all visible resources (excludes hidden resources)
 * Uses the main resources.ts file with proper filtering
 */
function getAllResources(): Resource[] {
  return visibleResources;
}

/**
 * Extract topics from resources
 * Groups resources by category to create topics
 */
export function extractTopicsFromResources(): Topic[] {
  const resources = getAllResources();
  const topicsMap = new Map<string, Topic>();

  for (const resource of resources) {
    // Use category as the topic grouping (all, repartidor, conductor)
    const slug = resource.category || 'all';
    const name = slug.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    if (!topicsMap.has(slug)) {
      topicsMap.set(slug, {
        id: slug,
        slug,
        name,
        description: `Resources for ${name}`,
        category: resource.category || 'all',
        level: resource.level || 'intermedio',
        resourceIds: [],
        resourceCount: 0,
      });
    }

    const topic = topicsMap.get(slug)!;
    topic.resourceCount = (topic.resourceCount || 0) + 1;
  }

  return Array.from(topicsMap.values());
}

/**
 * Group topics by category
 */
export function groupTopicsByCategory(topics: Topic[]): TopicCategory[] {
  const categoriesMap = new Map<string, TopicCategory>();

  for (const topic of topics) {
    if (!categoriesMap.has(topic.category)) {
      categoriesMap.set(topic.category, {
        name: topic.category.charAt(0).toUpperCase() + topic.category.slice(1),
        slug: topic.category,
        count: 0,
        topics: [],
      });
    }

    const category = categoriesMap.get(topic.category)!;
    category.topics.push(topic);
    category.count++;
  }

  return Array.from(categoriesMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/**
 * Get resources for a specific topic (by category)
 */
export function getResourcesForTopic(topicSlug: string): TopicResource[] {
  const resources = getAllResources();
  const topicResources: TopicResource[] = [];

  for (const resource of resources) {
    // Match by category
    if (resource.category === topicSlug) {
      topicResources.push({
        id: resource.id,
        resourceId: resource.id,
        title: resource.title,
        description: resource.description,
        content: '', // Would need to be loaded separately
        hasEdit: false, // Would need to check content-edits.json
        editStatus: undefined,
      });
    }
  }

  return topicResources;
}

/**
 * Get topic with its resources
 */
export function getTopicWithResources(topicSlug: string): TopicWithResources | null {
  const topics = extractTopicsFromResources();
  const topic = topics.find(t => t.slug === topicSlug);

  if (!topic) {
    return null;
  }

  const resources = getResourcesForTopic(topicSlug);

  return {
    ...topic,
    resources,
  };
}

/**
 * Get edit status for resources
 * Note: This is a simplified version that returns resources as-is
 * Edit status can be loaded separately if needed
 */
export function enrichResourcesWithEditStatus(resources: TopicResource[]): TopicResource[] {
  // Return resources as-is - edit status can be loaded separately via API if needed
  return resources;
}
