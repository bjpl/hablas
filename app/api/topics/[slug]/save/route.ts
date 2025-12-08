/**
 * Topic Batch Save API Route
 *
 * POST /api/topics/[slug]/save
 *
 * Saves multiple resource edits for a topic in a single transaction
 */

import { NextResponse } from 'next/server';
import { getTopicBySlug } from '@/lib/utils/topic-groups';
import fs from 'fs/promises';
import path from 'path';
import type { BatchSaveRequest, BatchSaveResponse } from '@/lib/types/topics';
import type { ContentEdit, EditHistory } from '@/lib/types/content-edits';
import { createLogger } from '@/lib/utils/logger';

const topicSaveLogger = createLogger('api:topics:save');

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Verify topic exists
    const topic = getTopicBySlug(slug);
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body: BatchSaveRequest = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate that all resource IDs belong to this topic
    const invalidResources = updates.filter(
      u => !topic.resourceIds.includes(u.resourceId)
    );

    if (invalidResources.length > 0) {
      return NextResponse.json(
        {
          error: 'Some resource IDs do not belong to this topic',
          invalidIds: invalidResources.map(r => r.resourceId)
        },
        { status: 400 }
      );
    }

    // Load current edits data
    const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');
    let data: {
      edits: ContentEdit[];
      history: EditHistory[];
      metadata: any;
    };

    try {
      const editsData = await fs.readFile(editsPath, 'utf-8');
      data = JSON.parse(editsData);
    } catch (error) {
      // Initialize if file doesn't exist
      data = {
        edits: [],
        history: [],
        metadata: {
          totalEdits: 0,
          pendingEdits: 0,
          approvedEdits: 0,
          rejectedEdits: 0,
          lastEditDate: new Date().toISOString(),
        },
      };
    }

    const timestamp = new Date().toISOString();
    const editIds: string[] = [];
    const errors: Array<{ resourceId: number; error: string }> = [];
    let savedCount = 0;

    // Process each update
    for (const update of updates) {
      try {
        const { resourceId, editedContent } = update;

        // Find existing edit
        const existingEditIndex = data.edits.findIndex(
          (edit: ContentEdit) => edit.resourceId === resourceId
        );

        let editId: string;

        if (existingEditIndex >= 0) {
          // Update existing edit
          const existingEdit = data.edits[existingEditIndex];
          editId = existingEdit.id;

          // Add to history
          const historyEntry: EditHistory = {
            id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            contentEditId: editId,
            content: editedContent,
            timestamp,
            changeDescription: `Batch update from topic: ${topic.name}`,
          };
          data.history.push(historyEntry);

          // Update edit
          data.edits[existingEditIndex] = {
            ...existingEdit,
            editedContent,
            status: 'pending',
            updatedAt: timestamp,
          };
        } else {
          // Create new edit
          editId = `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          const newEdit: ContentEdit = {
            id: editId,
            resourceId,
            originalContent: '', // Will be populated when needed
            editedContent,
            status: 'pending',
            createdAt: timestamp,
            updatedAt: timestamp,
          };

          data.edits.push(newEdit);

          // Add initial history entry
          const historyEntry: EditHistory = {
            id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            contentEditId: editId,
            content: editedContent,
            timestamp,
            changeDescription: `Initial edit from topic: ${topic.name}`,
          };
          data.history.push(historyEntry);

          // Update metadata
          data.metadata.totalEdits++;
          data.metadata.pendingEdits++;
        }

        editIds.push(editId);
        savedCount++;
      } catch (error) {
        topicSaveLogger.error('Error saving resource', error as Error, { resourceId: update.resourceId });
        errors.push({
          resourceId: update.resourceId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Update last edit date
    data.metadata.lastEditDate = timestamp;

    // Save back to file
    await fs.writeFile(editsPath, JSON.stringify(data, null, 2), 'utf-8');

    const response: BatchSaveResponse = {
      success: savedCount > 0,
      saved: savedCount,
      editIds,
      ...(errors.length > 0 && { errors }),
    };

    return NextResponse.json(response);
  } catch (error) {
    topicSaveLogger.error('Error in batch save', error as Error);
    return NextResponse.json(
      { error: 'Failed to save batch updates' },
      { status: 500 }
    );
  }
}
