/**
 * Content Review API Route
 *
 * POST /api/content/[id]/review
 *
 * Handles approval/rejection of content edits
 */

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { ContentEdit } from '@/lib/types/content-edits';

interface ReviewRequest {
  action: 'approve' | 'reject';
  reviewedBy?: string;
  comments?: string;
}

interface ReviewResponse {
  success: boolean;
  edit: ContentEdit;
  message: string;
}

export async function POST(
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

    // Parse request body
    const body: ReviewRequest = await request.json();
    const { action, reviewedBy, comments } = body;

    // Validate action parameter
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Read content edits file
    const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');
    let editsData: { edits: ContentEdit[]; history: any[] };

    try {
      const fileContent = await fs.readFile(editsPath, 'utf-8');
      editsData = JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading content-edits.json:', error);
      return NextResponse.json(
        { error: 'Failed to read content edits data' },
        { status: 500 }
      );
    }

    // Find the edit for this resource
    const editIndex = editsData.edits.findIndex(
      (edit: ContentEdit) => edit.resourceId === resourceId
    );

    if (editIndex === -1) {
      return NextResponse.json(
        { error: 'No edit found for this resource' },
        { status: 404 }
      );
    }

    const edit = editsData.edits[editIndex];

    // Check if edit is already reviewed
    if (edit.status !== 'pending') {
      return NextResponse.json(
        { error: `Edit is already ${edit.status}` },
        { status: 400 }
      );
    }

    // Update the edit
    const updatedEdit: ContentEdit = {
      ...edit,
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedBy: reviewedBy || 'Anonymous Reviewer',
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(comments && { comments }),
    };

    // Update the edits array
    editsData.edits[editIndex] = updatedEdit;

    // Write back to file
    try {
      await fs.writeFile(
        editsPath,
        JSON.stringify(editsData, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error writing content-edits.json:', error);
      return NextResponse.json(
        { error: 'Failed to save review' },
        { status: 500 }
      );
    }

    // Return success response
    const response: ReviewResponse = {
      success: true,
      edit: updatedEdit,
      message: `Edit ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error processing review:', error);
    return NextResponse.json(
      { error: 'Failed to process review' },
      { status: 500 }
    );
  }
}
