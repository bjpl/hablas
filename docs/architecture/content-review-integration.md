# Content Review Tool Integration - Architecture Documentation

## Overview

This document describes the complete integration of the content review tool into the Hablas language learning platform. The integration provides a comprehensive admin interface for reviewing, editing, and managing learning resources across the application.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   AdminNav   │  │    Admin     │  │    Edit      │      │
│  │  Component   │  │  Dashboard   │  │    Page      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Resource    │  │   Content    │                        │
│  │   Detail     │  │  Review Tool │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                      API Layer (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ GET /api/    │  │ GET /api/    │  │ POST /api/   │      │
│  │ content/list │  │ content/[id] │  │ content/save │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  resources.ts │  │  content-    │                        │
│  │   (source)   │  │  edits.json  │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. AdminNav Component (`/components/AdminNav.tsx`)

**Purpose**: Floating navigation widget providing quick access to admin tools throughout the app.

**Features**:
- Floating action button (FAB) for quick access
- Keyboard shortcut support (Ctrl+E / Cmd+E)
- Context-aware menu (shows "Edit This Resource" on resource pages)
- Admin mode toggle via URL parameter `?admin=true`
- Persistent admin mode via localStorage

**Key Implementation Details**:
```typescript
// Admin mode detection
const urlParams = new URLSearchParams(window.location.search);
const adminParam = urlParams.get('admin');
const adminMode = adminParam === 'true' || localStorage.getItem('adminMode') === 'true';

// Keyboard shortcut handler
const handleKeyPress = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
    e.preventDefault();
    setShowMenu(prev => !prev);
  }
};
```

**Integration**: Added to root layout (`/app/layout.tsx`) for global availability.

### 2. Admin Dashboard (`/app/admin/page.tsx`)

**Purpose**: Central hub for managing all content resources.

**Features**:
- Statistics dashboard showing:
  - Total resources
  - Pending edits
  - Approved edits
  - Total edits
- Resource list with edit status indicators
- Advanced filtering:
  - Search by title/description
  - Filter by category
  - Filter by level
  - Filter by edit status
- Direct links to edit pages

**Data Flow**:
```
Dashboard → GET /api/content/list → Returns:
  - resources[] (with edit status)
  - metadata (statistics)
```

### 3. Edit Page (`/app/admin/edit/[id]/page.tsx`)

**Purpose**: Resource-specific editing interface.

**Features**:
- Loads specific resource content
- Integrates ContentReviewTool component
- Auto-save functionality
- Navigation back to dashboard
- Error handling with retry capability

**Data Flow**:
```
Edit Page → GET /api/content/[id] → Returns:
  - originalContent
  - editedContent (if exists)
  - currentEdit
  - editHistory[]

Edit Page → POST /api/content/save → Saves:
  - resourceId
  - editedContent
  - status (pending/approved)
```

### 4. Resource Detail Integration (`/app/recursos/[id]/ResourceDetail.tsx`)

**Purpose**: Adds admin editing capability to existing resource pages.

**Features**:
- "Edit Content" button in header (admin mode only)
- Admin mode detection
- Direct link to edit page for current resource

**UI Pattern**:
```
[← Volver] [Resource Title]           [Edit Content →]
                                      (only in admin mode)
```

## API Routes

### GET /api/content/list

**Purpose**: Retrieve all resources with edit status

**Response**:
```typescript
{
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
  metadata: {
    totalEdits: number;
    pendingEdits: number;
    approvedEdits: number;
    rejectedEdits: number;
    lastEditDate: string;
  };
}
```

### GET /api/content/[id]

**Purpose**: Get original and edited content for specific resource

**Response**:
```typescript
{
  resourceId: number;
  title: string;
  originalContent: string;
  editedContent?: string;
  currentEdit?: ContentEdit;
  editHistory: EditHistory[];
}
```

### POST /api/content/save

**Purpose**: Save edited content and track history

**Request**:
```typescript
{
  resourceId: number;
  editedContent: string;
  status?: 'pending' | 'approved';
  editedBy?: string;
  comments?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  editId: string;
  message: string;
}
```

## Data Structures

### ContentEdit Type

```typescript
interface ContentEdit {
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
```

### EditHistory Type

```typescript
interface EditHistory {
  id: string;
  contentEditId: string;
  content: string;
  timestamp: string;
  editedBy?: string;
  changeDescription?: string;
}
```

## Data Storage

### File: `/data/content-edits.json`

**Purpose**: Persistent storage for content edits and history

**Structure**:
```json
{
  "edits": [
    {
      "id": "edit-123-abc",
      "resourceId": 1,
      "editedContent": "...",
      "status": "pending",
      "createdAt": "2025-11-17T00:00:00Z",
      "updatedAt": "2025-11-17T01:00:00Z"
    }
  ],
  "history": [
    {
      "id": "hist-456-def",
      "contentEditId": "edit-123-abc",
      "content": "...",
      "timestamp": "2025-11-17T01:00:00Z"
    }
  ],
  "metadata": {
    "totalEdits": 1,
    "pendingEdits": 1,
    "approvedEdits": 0,
    "rejectedEdits": 0,
    "lastEditDate": "2025-11-17T01:00:00Z"
  }
}
```

## User Flows

### 1. Entering Admin Mode

```
User → Navigates to any page with ?admin=true
     → AdminNav component detects parameter
     → Sets localStorage.setItem('adminMode', 'true')
     → Admin UI elements become visible
     → Floating action button appears
```

### 2. Editing a Resource from Dashboard

```
User → Opens /admin dashboard
     → Browses/searches resources
     → Clicks "Edit" button on resource
     → Redirects to /admin/edit/[id]
     → ContentReviewTool loads with content
     → User makes edits
     → Auto-save or manual save
     → Edits saved to content-edits.json
```

### 3. Editing a Resource from Resource Page

```
User → Views resource at /recursos/[id]
     → (In admin mode) Sees "Edit Content" button
     → Clicks button
     → Redirects to /admin/edit/[id]
     → Same editing flow as above
```

### 4. Quick Access via Keyboard Shortcut

```
User → (In admin mode) Presses Ctrl+E
     → AdminNav menu opens
     → User selects tool:
        - Dashboard
        - Content Editor
        - Edit This Resource (if on resource page)
```

## Security Considerations

### Current Implementation (Demo Mode)

- Admin mode activated via URL parameter `?admin=true`
- Stored in localStorage for persistence
- **Note**: This is a demo implementation

### Production Recommendations

1. **Authentication Layer**:
   - Implement NextAuth.js or similar
   - Require user login for admin access
   - Role-based access control (RBAC)

2. **API Route Protection**:
   ```typescript
   // Example middleware
   import { getServerSession } from "next-auth";

   export async function GET(request: Request) {
     const session = await getServerSession();
     if (!session || session.user.role !== 'admin') {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
     // ... rest of handler
   }
   ```

3. **CSRF Protection**:
   - Implement CSRF tokens for POST requests
   - Use Next.js built-in CSRF protection

4. **Rate Limiting**:
   - Add rate limiting to prevent abuse
   - Use middleware or API route handlers

## File Organization

```
/mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas/
├── app/
│   ├── admin/
│   │   ├── page.tsx                    # Admin dashboard
│   │   └── edit/
│   │       └── [id]/
│   │           └── page.tsx            # Edit page for specific resource
│   ├── api/
│   │   └── content/
│   │       ├── list/
│   │       │   └── route.ts            # List resources API
│   │       ├── [id]/
│   │       │   └── route.ts            # Get content API
│   │       └── save/
│   │           └── route.ts            # Save content API
│   ├── recursos/
│   │   └── [id]/
│   │       ├── page.tsx                # Resource page wrapper
│   │       └── ResourceDetail.tsx      # Updated with edit button
│   ├── review/
│   │   └── page.tsx                    # Standalone review tool
│   └── layout.tsx                      # Updated with AdminNav
├── components/
│   ├── AdminNav.tsx                    # Global admin navigation
│   └── content-review/
│       ├── ContentReviewTool.tsx       # Main review component
│       ├── ComparisonView.tsx
│       ├── EditPanel.tsx
│       └── DiffHighlighter.tsx
├── lib/
│   └── types/
│       └── content-edits.ts            # TypeScript type definitions
├── data/
│   ├── resources.ts                    # Source resource data
│   └── content-edits.json              # Edit tracking storage
└── docs/
    └── architecture/
        └── content-review-integration.md  # This file
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Components**: React with Tailwind CSS
- **Icons**: Lucide React
- **Storage**: File-based JSON (edits), TypeScript module (resources)
- **State Management**: React hooks (useState, useEffect)

## Performance Considerations

1. **Server-Side Rendering**:
   - Resource pages use SSG (generateStaticParams)
   - Content loaded at build time
   - Admin pages use client-side rendering for interactivity

2. **Data Loading**:
   - API routes use file system operations
   - Small JSON file for edits (minimal I/O)
   - Consider migrating to database for scale

3. **Client-Side Caching**:
   - Admin dashboard caches resource list
   - localStorage for admin mode persistence
   - Edit pages fetch fresh data on mount

## Future Enhancements

1. **Database Integration**:
   - Migrate from JSON to PostgreSQL/MongoDB
   - Add proper indexing for search
   - Enable concurrent editing

2. **Real-time Collaboration**:
   - WebSocket integration for live updates
   - Multi-user editing support
   - Conflict resolution

3. **Approval Workflow**:
   - Review queue for pending edits
   - Approval/rejection with comments
   - Email notifications

4. **Version Control**:
   - Git-like diff viewing
   - Rollback to previous versions
   - Branch/merge for content

5. **Analytics**:
   - Edit frequency tracking
   - Popular resources for editing
   - User activity monitoring

6. **Content Validation**:
   - Grammar checking
   - Format validation
   - Duplicate detection

## Testing Strategy

### Unit Tests
- Test API route handlers
- Test utility functions (cleanBoxCharacters, etc.)
- Test TypeScript types

### Integration Tests
- Test API endpoints with mock data
- Test component interactions
- Test save/load workflows

### E2E Tests
- Test full edit workflow
- Test admin mode activation
- Test keyboard shortcuts
- Test filtering and search

## Deployment Notes

1. **Environment Variables**:
   - None currently required
   - Add authentication secrets for production

2. **Build Process**:
   - Static generation for resource pages
   - Client-side bundles for admin pages
   - API routes deployed as serverless functions

3. **CDN Considerations**:
   - Static assets cached at edge
   - API routes bypass CDN
   - Admin pages served fresh

## Support and Maintenance

### Monitoring
- Monitor API response times
- Track edit success/failure rates
- Log errors to monitoring service

### Backup Strategy
- Regular backups of content-edits.json
- Version control for code changes
- Database backups (when migrated)

### Documentation
- Keep this architecture doc updated
- Document API changes
- Maintain type definitions

## Contact

For questions or issues regarding this integration:
- Architecture decisions: System Architect
- Implementation: Development Team
- Documentation: Documentation Team

---

**Document Version**: 1.0
**Last Updated**: 2025-11-17
**Author**: System Architecture Designer
