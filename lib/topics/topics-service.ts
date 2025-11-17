/**
 * Topics Service
 *
 * Service layer for managing topics and their relationships with resources
 */

import fs from 'fs';
import path from 'path';
import type { Topic, TopicCategory, TopicResource, TopicWithResources } from '@/lib/types/topics';

const DATA_DIR = path.join(process.cwd(), 'data', 'resources');

/**
 * Get all resources from the data directory
 */
function getAllResources() {
  const resources: any[] = [];

  function readDirectory(dir: string) {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        readDirectory(fullPath);
      } else if (item.isFile() && item.name.endsWith('.json')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const resource = JSON.parse(content);
          resources.push(resource);
        } catch (error) {
          console.error(`Error reading ${fullPath}:`, error);
        }
      }
    }
  }

  readDirectory(DATA_DIR);
  return resources;
}

/**
 * Extract topics from resources
 */
export function extractTopicsFromResources(): Topic[] {
  const resources = getAllResources();
  const topicsMap = new Map<string, Topic>();

  for (const resource of resources) {
    const slug = resource.subcategory || resource.category || 'general';
    const name = slug.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    if (!topicsMap.has(slug)) {
      topicsMap.set(slug, {
        id: slug,
        slug,
        name,
        description: resource.description || `Resources for ${name}`,
        category: resource.category || 'general',
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
 * Get resources for a specific topic
 */
export function getResourcesForTopic(topicSlug: string): TopicResource[] {
  const resources = getAllResources();
  const topicResources: TopicResource[] = [];

  for (const resource of resources) {
    const resourceTopic = resource.subcategory || resource.category;

    if (resourceTopic === topicSlug) {
      topicResources.push({
        id: resource.id,
        resourceId: parseInt(resource.id.split('-')[1]) || 0,
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
 */
export function enrichResourcesWithEditStatus(resources: TopicResource[]): TopicResource[] {
  try {
    const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');

    if (!fs.existsSync(editsPath)) {
      return resources;
    }

    const editsContent = fs.readFileSync(editsPath, 'utf-8');
    const edits = JSON.parse(editsContent);

    return resources.map(resource => {
      const resourceEdits = edits.filter((edit: any) =>
        edit.resourceId === resource.resourceId
      );

      if (resourceEdits.length === 0) {
        return resource;
      }

      const latestEdit = resourceEdits[resourceEdits.length - 1];

      return {
        ...resource,
        hasEdit: true,
        editStatus: latestEdit.status,
        lastEditDate: latestEdit.updatedAt || latestEdit.createdAt,
      };
    });
  } catch (error) {
    console.error('Error enriching resources with edit status:', error);
    return resources;
  }
}
