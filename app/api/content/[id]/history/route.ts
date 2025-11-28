/**
 * Content Edit History API Route
 *
 * GET /api/content/[id]/history
 *
 * Returns the edit history for a specific resource, sorted by timestamp (newest first)
 */

import { NextResponse } from 'next/server';
import { resources, isResourceHidden } from '@/data/resources';
import fs from 'fs/promises';
import path from 'path';
import type { EditHistory, ContentEdit } from '@/lib/types/content-edits';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resourceId = parseInt(id);

    // Validate resourceId
    if (isNaN(resourceId)) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      );
    }

    // Find resource (return 404 for hidden resources on public API)
    const resource = resources.find(r => r.id === resourceId);
    if (!resource || isResourceHidden(resourceId)) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Read edit data
    const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');
    const editsData = await fs.readFile(editsPath, 'utf-8');
    const { edits, history } = JSON.parse(editsData);

    // Find current edit for this resource
    const currentEdit = edits.find(
      (edit: ContentEdit) => edit.resourceId === resourceId
    );

    // Filter and sort history entries by the contentEditId that matches the resourceId's edit
    const editHistory: EditHistory[] = currentEdit
      ? history
          .filter((h: EditHistory) => h.contentEditId === currentEdit.id)
          .sort((a: EditHistory, b: EditHistory) => {
            // Sort by timestamp, newest first
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          })
      : [];

    return NextResponse.json({
      resourceId,
      title: resource.title,
      editHistory,
      totalEntries: editHistory.length,
    });
  } catch (error) {
    console.error('Error fetching edit history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch edit history' },
      { status: 500 }
    );
  }
}
