import { NextResponse } from 'next/server';
import {
  extractTopicsFromResources,
  groupTopicsByCategory,
} from '@/lib/topics/topics-service';

/**
 * GET /api/topics/list
 *
 * Returns all topics grouped by category with resource counts
 */
export async function GET() {
  try {
    const topics = extractTopicsFromResources();
    const categories = groupTopicsByCategory(topics);
    const totalResources = topics.reduce((sum, topic) => sum + (topic.resourceCount || 0), 0);

    return NextResponse.json({
      categories,
      totalTopics: topics.length,
      totalResources,
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
