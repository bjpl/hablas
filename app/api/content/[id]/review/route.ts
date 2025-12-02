/**
 * Content Review API Route
 *
 * POST /api/content/[id]/review
 *
 * Handles:
 * - Content approval/rejection
 * - Audio verification status
 * - Re-generation requests
 */

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { ContentEdit } from '@/lib/types/content-edits';

type ReviewAction = 'approve' | 'reject' | 'verify-audio' | 'request-regeneration';

interface VerificationIssue {
  id: string;
  type: string;
  phraseIndex?: number;
  phrase?: string;
  description: string;
  timestamp?: number;
  severity: 'low' | 'medium' | 'high';
}

interface ReviewRequest {
  action: ReviewAction;
  reviewedBy?: string;
  comments?: string;
  // Audio verification fields
  verified?: boolean;
  verifiedPhrases?: number[];
  totalPhrases?: number;
  // Re-generation fields
  issues?: VerificationIssue[];
}

interface ReviewResponse {
  success: boolean;
  message: string;
  edit?: ContentEdit;
  verification?: {
    verified: boolean;
    verifiedPhrases: number[];
    totalPhrases: number;
    verifiedAt: string;
  };
}

// Path to audio verifications data
const VERIFICATIONS_PATH = path.join(process.cwd(), 'data', 'audio-verifications.json');
const REGENERATION_REQUESTS_PATH = path.join(process.cwd(), 'data', 'regeneration-requests.json');

async function ensureFile(filePath: string, defaultContent: object) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
  }
}

async function readJsonFile<T>(filePath: string, defaultContent: T): Promise<T> {
  await ensureFile(filePath, defaultContent as object);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function writeJsonFile(filePath: string, data: unknown) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resourceId = parseInt(id);

    if (isNaN(resourceId)) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      );
    }

    const body: ReviewRequest = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'verify-audio':
        return handleAudioVerification(resourceId, body);

      case 'request-regeneration':
        return handleRegenerationRequest(resourceId, body);

      case 'approve':
      case 'reject':
        return handleContentReview(resourceId, body);

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing review:', error);
    return NextResponse.json(
      { error: 'Failed to process review' },
      { status: 500 }
    );
  }
}

/**
 * Handle audio verification status updates
 */
async function handleAudioVerification(
  resourceId: number,
  body: ReviewRequest
): Promise<NextResponse> {
  const { verified, verifiedPhrases = [], totalPhrases = 0, reviewedBy } = body;

  const verifications = await readJsonFile<Record<string, any>>(
    VERIFICATIONS_PATH,
    { verifications: {}, metadata: { lastUpdated: null } }
  );

  const verification = {
    resourceId,
    verified: verified ?? false,
    verifiedPhrases,
    totalPhrases,
    verifiedBy: reviewedBy || 'admin',
    verifiedAt: new Date().toISOString(),
    progress: totalPhrases > 0 ? Math.round((verifiedPhrases.length / totalPhrases) * 100) : 0,
  };

  verifications.verifications[resourceId] = verification;
  verifications.metadata.lastUpdated = new Date().toISOString();

  await writeJsonFile(VERIFICATIONS_PATH, verifications);

  const response: ReviewResponse = {
    success: true,
    message: verified ? 'Audio verified successfully' : 'Verification progress saved',
    verification: {
      verified: verification.verified,
      verifiedPhrases: verification.verifiedPhrases,
      totalPhrases: verification.totalPhrases,
      verifiedAt: verification.verifiedAt,
    },
  };

  return NextResponse.json(response);
}

/**
 * Handle TTS regeneration requests
 */
async function handleRegenerationRequest(
  resourceId: number,
  body: ReviewRequest
): Promise<NextResponse> {
  const { issues = [], reviewedBy } = body;

  if (issues.length === 0) {
    return NextResponse.json(
      { error: 'No issues provided for regeneration request' },
      { status: 400 }
    );
  }

  const requests = await readJsonFile<{ requests: any[]; metadata: any }>(
    REGENERATION_REQUESTS_PATH,
    { requests: [], metadata: { totalRequests: 0, lastUpdated: null } }
  );

  const request = {
    id: `regen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    resourceId,
    issues,
    status: 'pending',
    requestedBy: reviewedBy || 'admin',
    requestedAt: new Date().toISOString(),
    priority: issues.some(i => i.severity === 'high') ? 'high'
             : issues.some(i => i.severity === 'medium') ? 'medium'
             : 'low',
  };

  requests.requests.push(request);
  requests.metadata.totalRequests++;
  requests.metadata.lastUpdated = new Date().toISOString();

  await writeJsonFile(REGENERATION_REQUESTS_PATH, requests);

  const response: ReviewResponse = {
    success: true,
    message: `Regeneration request submitted with ${issues.length} issue(s)`,
  };

  return NextResponse.json(response);
}

/**
 * Handle content approval/rejection
 */
async function handleContentReview(
  resourceId: number,
  body: ReviewRequest
): Promise<NextResponse> {
  const { action, reviewedBy, comments } = body;

  const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');

  let editsData: { edits: ContentEdit[]; history: any[]; metadata: any };

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

  if (edit.status !== 'pending') {
    return NextResponse.json(
      { error: `Edit is already ${edit.status}` },
      { status: 400 }
    );
  }

  const updatedEdit: ContentEdit = {
    ...edit,
    status: action === 'approve' ? 'approved' : 'rejected',
    reviewedBy: reviewedBy || 'Anonymous Reviewer',
    reviewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...(comments && { comments }),
  };

  editsData.edits[editIndex] = updatedEdit;

  // Update metadata
  if (action === 'approve') {
    editsData.metadata.approvedEdits = (editsData.metadata.approvedEdits || 0) + 1;
    editsData.metadata.pendingEdits = Math.max(0, (editsData.metadata.pendingEdits || 1) - 1);
  } else {
    editsData.metadata.pendingEdits = Math.max(0, (editsData.metadata.pendingEdits || 1) - 1);
  }

  try {
    await fs.writeFile(editsPath, JSON.stringify(editsData, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing content-edits.json:', error);
    return NextResponse.json(
      { error: 'Failed to save review' },
      { status: 500 }
    );
  }

  const response: ReviewResponse = {
    success: true,
    edit: updatedEdit,
    message: `Edit ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
  };

  return NextResponse.json(response);
}

/**
 * GET /api/content/[id]/review
 *
 * Get verification status for a resource
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resourceId = parseInt(id);

    if (isNaN(resourceId)) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      );
    }

    const verifications = await readJsonFile<Record<string, any>>(
      VERIFICATIONS_PATH,
      { verifications: {}, metadata: { lastUpdated: null } }
    );

    const verification = verifications.verifications[resourceId];

    if (!verification) {
      return NextResponse.json({
        resourceId,
        verified: false,
        verifiedPhrases: [],
        totalPhrases: 0,
        progress: 0,
      });
    }

    return NextResponse.json(verification);
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}
