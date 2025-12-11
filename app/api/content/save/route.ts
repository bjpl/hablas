/**
 * Content Save API Route
 *
 * POST /api/content/save
 *
 * Saves edited content and tracks edit history
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type {
  SaveContentRequest,
  SaveContentResponse,
  ContentEdit,
  EditHistory,
} from '@/lib/types/content-edits';
import { createLogger } from '@/lib/utils/logger';
import { requireRole } from '@/lib/auth/middleware-helper';

const contentSaveLogger = createLogger('api:content:save');

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require editor or admin role to save content
    await requireRole(request, 'editor');

    const body: SaveContentRequest = await request.json();
    const { resourceId, editedContent, status = 'pending', editedBy, comments } = body;

    // Validate input
    if (!resourceId || !editedContent) {
      return NextResponse.json(
        { error: 'Missing required fields: resourceId and editedContent' },
        { status: 400 }
      );
    }

    // Read current edits data
    const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');
    const editsData = await fs.readFile(editsPath, 'utf-8');
    const data = JSON.parse(editsData);

    const timestamp = new Date().toISOString();

    // Check if edit already exists for this resource
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
        editedBy,
        changeDescription: 'Content updated',
      };
      data.history.push(historyEntry);

      // Update edit
      data.edits[existingEditIndex] = {
        ...existingEdit,
        editedContent,
        status,
        updatedAt: timestamp,
        editedBy: editedBy || existingEdit.editedBy,
        comments: comments || existingEdit.comments,
      };
    } else {
      // Create new edit
      editId = `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newEdit: ContentEdit = {
        id: editId,
        resourceId,
        originalContent: '', // Will be populated when needed
        editedContent,
        status,
        createdAt: timestamp,
        updatedAt: timestamp,
        editedBy,
        comments,
      };

      data.edits.push(newEdit);

      // Add initial history entry
      const historyEntry: EditHistory = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        contentEditId: editId,
        content: editedContent,
        timestamp,
        editedBy,
        changeDescription: 'Initial edit created',
      };
      data.history.push(historyEntry);

      // Update metadata
      data.metadata.totalEdits++;
      if (status === 'pending') {
        data.metadata.pendingEdits++;
      } else if (status === 'approved') {
        data.metadata.approvedEdits++;
      }
    }

    // Update last edit date
    data.metadata.lastEditDate = timestamp;

    // Save back to file
    await fs.writeFile(editsPath, JSON.stringify(data, null, 2), 'utf-8');

    const response: SaveContentResponse = {
      success: true,
      editId,
      message: 'Content saved successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    contentSaveLogger.error('Error saving content', error as Error);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}
