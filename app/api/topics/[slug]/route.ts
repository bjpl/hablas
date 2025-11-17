import { NextResponse } from 'next/server';
import {
  getTopicWithResources,
  enrichResourcesWithEditStatus,
} from '@/lib/topics/topics-service';

/**
 * GET /api/topics/[slug]
 *
 * Returns a specific topic with all its resources and edit metadata
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const topicData = getTopicWithResources(slug);

    if (!topicData) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Enrich resources with edit status
    const enrichedResources = enrichResourcesWithEditStatus(topicData.resources);

    // Calculate metadata
    const metadata = {
      totalEdits: enrichedResources.filter(r => r.hasEdit).length,
      pendingEdits: enrichedResources.filter(r => r.editStatus === 'pending').length,
      approvedEdits: enrichedResources.filter(r => r.editStatus === 'approved').length,
      rejectedEdits: enrichedResources.filter(r => r.editStatus === 'rejected').length,
    };

    return NextResponse.json({
      ...topicData,
      resources: enrichedResources,
      metadata,
    });
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    );
  }
}
