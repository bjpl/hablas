/**
 * Topic Details API Route
 *
 * GET /api/topics/[slug]
 *
 * Returns a specific topic with all its resources, content, and edit metadata
 */

import { NextResponse } from 'next/server';
import { getTopicBySlug } from '@/lib/utils/topic-groups';
import { resources } from '@/data/resources';
import fs from 'fs/promises';
import path from 'path';
import type { TopicResourceWithContent, TopicDetailsResponse } from '@/lib/types/topics';
import type { ContentEdit } from '@/lib/types/content-edits';

/**
 * Load content from a resource's downloadUrl or contentPath
 */
async function loadResourceContent(resource: typeof resources[0]): Promise<string> {
  try {
    // Try to load from public folder via downloadUrl
    if (resource.downloadUrl) {
      const publicPath = path.join(process.cwd(), 'public', resource.downloadUrl);
      try {
        const content = await fs.readFile(publicPath, 'utf-8');
        return content;
      } catch {
        // File not in public folder, try generated-resources
      }
    }

    // Try to load from contentPath (absolute path during development)
    if (resource.contentPath) {
      try {
        const content = await fs.readFile(resource.contentPath, 'utf-8');
        return content;
      } catch {
        // contentPath not accessible
      }
    }

    // Try generated-resources folder based on downloadUrl pattern
    if (resource.downloadUrl?.startsWith('/generated-resources/')) {
      const generatedPath = path.join(process.cwd(), resource.downloadUrl);
      try {
        const content = await fs.readFile(generatedPath, 'utf-8');
        return content;
      } catch {
        // Not found in generated-resources
      }
    }

    return `[Content for "${resource.title}" - File not found]`;
  } catch (error) {
    console.error(`Error loading content for resource ${resource.id}:`, error);
    return `[Error loading content for "${resource.title}"]`;
  }
}

/**
 * Load edit status for resources from content-edits.json
 */
async function loadEditStatus(): Promise<Map<number, ContentEdit>> {
  const editMap = new Map<number, ContentEdit>();

  try {
    const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');
    const data = await fs.readFile(editsPath, 'utf-8');
    const parsed = JSON.parse(data);

    if (parsed.edits && Array.isArray(parsed.edits)) {
      for (const edit of parsed.edits) {
        editMap.set(edit.resourceId, edit);
      }
    }
  } catch {
    // No edits file or parse error - return empty map
  }

  return editMap;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get topic from topic-groups
    const topic = getTopicBySlug(slug);

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Get resource details for each resource ID in the topic
    const topicResources = resources.filter(r => topic.resourceIds.includes(r.id));

    // Load edit status
    const editStatusMap = await loadEditStatus();

    // Build enriched resources with content and edit status
    const enrichedResources: TopicResourceWithContent[] = await Promise.all(
      topicResources.map(async (resource) => {
        const content = await loadResourceContent(resource);
        const edit = editStatusMap.get(resource.id);

        return {
          resource,
          content,
          audioUrl: resource.audioUrl,
          hasEdit: !!edit,
          lastEditDate: edit?.updatedAt,
          editStatus: edit?.status,
        };
      })
    );

    // Calculate metadata
    const metadata = {
      totalEdits: enrichedResources.filter(r => r.hasEdit).length,
      pendingEdits: enrichedResources.filter(r => r.editStatus === 'pending').length,
      approvedEdits: enrichedResources.filter(r => r.editStatus === 'approved').length,
      rejectedEdits: enrichedResources.filter(r => r.editStatus === 'rejected').length,
    };

    const response: TopicDetailsResponse & { metadata: typeof metadata } = {
      topic,
      resources: enrichedResources,
      metadata,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    );
  }
}
