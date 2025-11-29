import { NextResponse } from 'next/server';
import { getAllTopicsWithHidden } from '@/lib/utils/topic-groups';

/**
 * GET /api/topics/list
 *
 * Returns all topics grouped by category with resource counts
 * Uses topic-groups.ts for consistent topic definitions (includes hidden resources for admin)
 */
export async function GET() {
  try {
    // Get all topics including hidden resources (for admin review)
    const allTopics = getAllTopicsWithHidden();

    // Group topics by category
    const categoryMap = new Map<string, {
      name: string;
      slug: string;
      count: number;
      topics: typeof allTopics;
    }>();

    for (const topic of allTopics) {
      const categorySlug = topic.category;
      const categoryNames: Record<string, string> = {
        'all': 'General',
        'repartidor': 'Repartidor',
        'conductor': 'Conductor',
      };
      const categoryName = categoryNames[categorySlug] || categorySlug;

      if (!categoryMap.has(categorySlug)) {
        categoryMap.set(categorySlug, {
          name: categoryName,
          slug: categorySlug,
          count: 0,
          topics: [],
        });
      }

      const category = categoryMap.get(categorySlug)!;
      category.topics.push(topic);
      category.count++;
    }

    const categories = Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const totalResources = allTopics.reduce((sum, topic) => sum + (topic.resourceCount || 0), 0);

    return NextResponse.json({
      categories,
      totalTopics: allTopics.length,
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
