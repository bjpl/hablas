/**
 * Content List API Route
 *
 * GET /api/content/list
 *
 * Returns a list of all editable resources with their current edit status
 */

import { NextResponse } from 'next/server';
import { visibleResources } from '@/data/resources';
import fs from 'fs/promises';
import path from 'path';
import type { ListResourcesResponse, ContentEdit } from '@/lib/types/content-edits';

export async function GET() {
  try {
    // Read content edits data
    const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');
    const editsData = await fs.readFile(editsPath, 'utf-8');
    const { edits, metadata } = JSON.parse(editsData);

    // Map only visible resources with edit status (excludes hidden resources pending review)
    const resourcesList = visibleResources.map(resource => {
      const currentEdit = edits.find(
        (edit: ContentEdit) => edit.resourceId === resource.id
      );

      return {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        category: resource.category,
        level: resource.level,
        hasEdit: !!currentEdit,
        lastEditDate: currentEdit?.updatedAt,
        editStatus: currentEdit?.status,
      };
    });

    const response: ListResourcesResponse = {
      resources: resourcesList,
      metadata,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching resource list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}
