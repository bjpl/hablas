/**
 * Content Detail API Route
 *
 * GET /api/content/[id]
 *
 * Returns the original and edited content for a specific resource
 */

import { NextResponse } from 'next/server';
import { resources, isResourceHidden } from '@/data/resources';
import fs from 'fs/promises';
import path from 'path';
import type { GetContentResponse, ContentEdit, EditHistory } from '@/lib/types/content-edits';
import { createLogger } from '@/lib/utils/logger';

const contentDetailLogger = createLogger('api:content:detail');

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

    // Find resource (return 404 for hidden resources on public API)
    const resource = resources.find(r => r.id === resourceId);
    if (!resource || isResourceHidden(resourceId)) {
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

    // Gather media metadata
    const metadata: Record<string, unknown> = {
      format: path.extname(resource.downloadUrl).slice(1),
    };

    // Add audio-specific metadata if available
    if (resource.type === 'audio' && resource.audioUrl) {
      try {
        const audioPath = path.join(process.cwd(), 'public', resource.audioUrl);
        const audioStats = await fs.stat(audioPath);
        metadata.size = audioStats.size;
        // Note: Duration would require audio parsing library (e.g., music-metadata)
        // For now, we'll leave it as optional
      } catch (err) {
        contentDetailLogger.warn('Could not read audio metadata', { error: err });
      }
    }

    const response: GetContentResponse = {
      resourceId,
      title: resource.title,
      type: resource.type,
      originalContent,
      editedContent: currentEdit?.editedContent,
      currentEdit,
      editHistory,
      audioUrl: resource.audioUrl,
      downloadUrl: resource.downloadUrl,
      metadata,
    };

    return NextResponse.json(response);
  } catch (error) {
    contentDetailLogger.error('Error fetching content', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
