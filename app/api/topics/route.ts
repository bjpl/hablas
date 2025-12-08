/**
 * Topics List API Route
 *
 * GET /api/topics
 *
 * Returns a list of all topic groups with resource counts
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getTopics } from '@/lib/utils/topic-groups';
import type { TopicsListResponse } from '@/lib/types/topics';
import { createLogger } from '@/lib/utils/logger';

const topicsLogger = createLogger('api:topics');

export async function GET(request: NextRequest) {
  try {
    // Get optional category filter from query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as 'all' | 'repartidor' | 'conductor' | null;

    // Get topics (filtered if category provided)
    const topics = getTopics(category || undefined);

    const response: TopicsListResponse = {
      topics,
    };

    return NextResponse.json(response);
  } catch (error) {
    topicsLogger.error('Error fetching topics', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
