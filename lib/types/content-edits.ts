/**
 * Content Edit Type Definitions
 *
 * Defines the structure for tracking content edits, history, and metadata
 * across the content review system.
 */

export interface ContentEdit {
  id: string;
  resourceId: number;
  originalContent: string;
  editedContent: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  editedBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

export interface EditHistory {
  id: string;
  contentEditId: string;
  content: string;
  timestamp: string;
  editedBy?: string;
  changeDescription?: string;
}

export interface ContentEditMetadata {
  totalEdits: number;
  pendingEdits: number;
  approvedEdits: number;
  rejectedEdits: number;
  lastEditDate: string;
}

export interface SaveContentRequest {
  resourceId: number;
  editedContent: string;
  status?: 'pending' | 'approved';
  editedBy?: string;
  comments?: string;
}

export interface SaveContentResponse {
  success: boolean;
  editId: string;
  message: string;
}

export interface GetContentResponse {
  resourceId: number;
  title: string;
  originalContent: string;
  editedContent?: string;
  currentEdit?: ContentEdit;
  editHistory: EditHistory[];
}

export interface ListResourcesResponse {
  resources: Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    level: string;
    hasEdit: boolean;
    lastEditDate?: string;
    editStatus?: 'pending' | 'approved' | 'rejected';
  }>;
  metadata: ContentEditMetadata;
}
