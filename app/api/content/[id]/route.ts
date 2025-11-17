/**
 * Content Detail API Route
 *
 * GET /api/content/[id]
 *
 * Returns the original and edited content for a specific resource
 */

import { NextResponse } from 'next/server';
import { resources } from '@/data/resources';
import fs from 'fs/promises';
import path from 'path';
import type { GetContentResponse, ContentEdit, EditHistory } from '@/lib/types/content-edits';

// Helper function to clean box characters
function cleanBoxCharacters(text: string): string {
  return text
    .replace(/[┌┐└┘├┤┬┴┼─│═║╔╗╚╝╠╣╦╩╬]/g, '')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resourceId = parseInt(id);

    // Find resource
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Read original content
    const publicPath = path.join(process.cwd(), 'public', resource.downloadUrl);
    const rawContent = await fs.readFile(publicPath, 'utf-8');
    const originalContent = cleanBoxCharacters(rawContent);

    // Read edit data
    const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');
    const editsData = await fs.readFile(editsPath, 'utf-8');
    const { edits, history } = JSON.parse(editsData);

    // Find current edit for this resource
    const currentEdit = edits.find(
      (edit: ContentEdit) => edit.resourceId === resourceId
    );

    // Find edit history for this resource
    const editHistory = currentEdit
      ? history.filter(
          (h: EditHistory) => h.contentEditId === currentEdit.id
        )
      : [];

    const response: GetContentResponse = {
      resourceId,
      title: resource.title,
      originalContent,
      editedContent: currentEdit?.editedContent,
      currentEdit,
      editHistory,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
