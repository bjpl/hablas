# SPARC Specification: Topic-Based Multi-Resource Review System

**Project**: Hablas Language Learning Platform
**Feature**: Topic-Based Resource Review & Editing
**Version**: 1.0.0
**Date**: 2025-11-16
**Status**: Draft

---

## Executive Summary

The Hablas curriculum has 34 resources organized into topics with multiple variations. Admins need to review ALL resources for a topic simultaneously in their actual display formats (audio players, rendered PDFs, formatted transcripts), rather than editing individual resources by ID.

---

## 1. Requirements Analysis

### 1.1 Functional Requirements

#### FR-1: Topic Grouping Logic

**FR-1.1**: System shall automatically group resources by base topic name
- **Acceptance Criteria**:
  - Remove "- Var X" suffixes from titles to identify base topics
  - Handle variations like "Var 1", "Var 2", "Var 3", etc.
  - Support topic names in Spanish
  - Preserve category (repartidor/conductor/all) and level (basico/intermedio/avanzado) metadata

**FR-1.2**: System shall identify unique topics across all categories
- **Acceptance Criteria**:
  - Generate unique topic IDs from base names
  - Map resources to topics maintaining order
  - Support filtering by category and level
  - Handle edge cases (topics with no variations)

**FR-1.3**: System shall group related resource types
- **Acceptance Criteria**:
  - Audio files (.mp3) grouped with their transcripts (.txt)
  - PDF/Markdown content grouped by topic
  - Maintain variation ordering (Var 1 before Var 2)

#### FR-2: Display Requirements

**FR-2.1**: System shall render audio in full player format
- **Acceptance Criteria**:
  - Display audio player as students see it
  - Show metadata (duration, format, bitrate, sample rate)
  - Support playback controls (play, pause, seek, volume)
  - Display loading states and error handling

**FR-2.2**: System shall render PDF/Markdown in display format
- **Acceptance Criteria**:
  - Parse Markdown to rendered HTML
  - Display with proper formatting (headings, lists, bold, italic)
  - Support code blocks and tables
  - Clean box characters from content

**FR-2.3**: System shall display audio scripts in formatted view
- **Acceptance Criteria**:
  - Display transcripts with proper line breaks
  - Highlight timestamps if present
  - Show speaker labels if available
  - Enable side-by-side view with audio player

**FR-2.4**: System shall show all variations side-by-side
- **Acceptance Criteria**:
  - Grid layout showing all variations horizontally
  - Responsive design (stack on mobile, grid on desktop)
  - Synchronized scrolling across variations (optional)
  - Quick navigation between variations

#### FR-3: Editing Capabilities

**FR-3.1**: System shall enable inline transcript editing
- **Acceptance Criteria**:
  - Rich text editor for audio scripts
  - Real-time preview of changes
  - Character/word count display
  - Undo/redo support

**FR-3.2**: System shall enable PDF/Markdown content editing
- **Acceptance Criteria**:
  - Markdown editor with syntax highlighting
  - Live preview pane
  - Support Markdown shortcuts
  - Auto-save drafts

**FR-3.3**: System shall provide real-time preview
- **Acceptance Criteria**:
  - Preview updates on text change (debounced)
  - Show exactly as students will see content
  - Highlight unsaved changes
  - Display preview loading states

**FR-3.4**: System shall support individual and batch saves
- **Acceptance Criteria**:
  - Save button for each resource
  - "Save All" button for entire topic
  - Confirm before batch operations
  - Show save progress indicators
  - Handle partial failures gracefully

#### FR-4: Navigation Requirements

**FR-4.1**: Admin dashboard shall display topics, not resources
- **Acceptance Criteria**:
  - List view showing topic names
  - Display variation count per topic
  - Show category and level badges
  - Sort by topic name, category, level, or status

**FR-4.2**: System shall enable topic-based navigation
- **Acceptance Criteria**:
  - Click topic to review all variations
  - Breadcrumb navigation (Dashboard > Category > Topic)
  - Back button returns to topic list
  - Deep linking to specific topics

**FR-4.3**: System shall filter topics by category and level
- **Acceptance Criteria**:
  - Category filter: all, repartidor, conductor
  - Level filter: all, basico, intermedio, avanzado
  - Combined filters work together
  - URL parameters reflect filter state

### 1.2 Non-Functional Requirements

#### NFR-1: Performance
- **NFR-1.1**: Topic list shall load in <500ms for 100 topics
- **NFR-1.2**: Topic review page shall render in <1s for 6 variations
- **NFR-1.3**: Auto-save shall trigger 2s after last edit
- **NFR-1.4**: Preview updates shall debounce at 300ms

#### NFR-2: Usability
- **NFR-2.1**: Interface shall be keyboard navigable
- **NFR-2.2**: All actions shall have visual feedback
- **NFR-2.3**: Error messages shall be actionable
- **NFR-2.4**: System shall support undo/redo for edits

#### NFR-3: Data Integrity
- **NFR-3.1**: System shall prevent data loss on page refresh
- **NFR-3.2**: Concurrent edits shall be detected and prevented
- **NFR-3.3**: All saves shall be atomic (all or nothing)
- **NFR-3.4**: Edit history shall be preserved

#### NFR-4: Security
- **NFR-4.1**: Only authenticated admins can edit content
- **NFR-4.2**: All API calls shall be authenticated
- **NFR-4.3**: Content changes shall be logged with timestamps and user IDs
- **NFR-4.4**: File uploads shall be validated (type, size)

---

## 2. Data Structures

### 2.1 TopicGroup Interface

```typescript
interface TopicGroup {
  id: string;                    // Unique topic identifier (slugified base name)
  baseName: string;              // Base topic name (without "- Var X")
  category: 'all' | 'repartidor' | 'conductor';
  level: 'basico' | 'intermedio' | 'avanzado';
  variations: TopicVariation[];  // All variations of this topic
  totalResources: number;        // Count of resources in topic
  editStatus: 'none' | 'partial' | 'complete'; // Edit completion status
  lastModified: string | null;   // ISO timestamp of last edit
}

interface TopicVariation {
  variationNumber: number;       // 1, 2, 3, etc.
  resources: TopicResource[];    // Resources for this variation
}

interface TopicResource {
  id: number;                    // Original resource ID
  title: string;
  type: 'pdf' | 'audio' | 'audio-script';
  downloadUrl: string;
  audioUrl?: string;             // For audio resources
  contentPath?: string;          // Server-side file path
  hasEdit: boolean;              // Whether resource has been edited
  editStatus?: 'pending' | 'approved' | 'rejected';
  lastEditDate?: string;         // ISO timestamp
}
```

### 2.2 Topic Grouping Algorithm

```typescript
/**
 * Group resources by topic
 *
 * Algorithm:
 * 1. Extract base topic name (remove "- Var X" suffix)
 * 2. Create topic ID (slugify base name + category + level)
 * 3. Parse variation number from title
 * 4. Determine resource role (main content vs. audio vs. transcript)
 * 5. Group by topic ID
 * 6. Sort variations by number
 * 7. Calculate edit status
 */
function groupResourcesByTopic(resources: Resource[]): TopicGroup[] {
  const topicMap = new Map<string, TopicGroup>();

  resources.forEach(resource => {
    // Extract base name and variation number
    const { baseName, variationNumber } = parseTopicName(resource.title);

    // Generate topic ID
    const topicId = generateTopicId(baseName, resource.category, resource.level);

    // Get or create topic group
    let topicGroup = topicMap.get(topicId);
    if (!topicGroup) {
      topicGroup = {
        id: topicId,
        baseName,
        category: resource.category,
        level: resource.level,
        variations: [],
        totalResources: 0,
        editStatus: 'none',
        lastModified: null,
      };
      topicMap.set(topicId, topicGroup);
    }

    // Get or create variation
    let variation = topicGroup.variations.find(v => v.variationNumber === variationNumber);
    if (!variation) {
      variation = {
        variationNumber,
        resources: [],
      };
      topicGroup.variations.push(variation);
    }

    // Determine resource type
    const resourceType = determineResourceType(resource);

    // Add resource to variation
    variation.resources.push({
      id: resource.id,
      title: resource.title,
      type: resourceType,
      downloadUrl: resource.downloadUrl,
      audioUrl: resource.audioUrl,
      contentPath: resource.contentPath,
      hasEdit: resource.hasEdit || false,
      editStatus: resource.editStatus,
      lastEditDate: resource.lastEditDate,
    });

    topicGroup.totalResources++;
  });

  // Sort variations and calculate edit status
  topicMap.forEach(topicGroup => {
    topicGroup.variations.sort((a, b) => a.variationNumber - b.variationNumber);
    topicGroup.editStatus = calculateEditStatus(topicGroup);
    topicGroup.lastModified = getLatestEditDate(topicGroup);
  });

  return Array.from(topicMap.values());
}

/**
 * Parse topic name to extract base name and variation number
 */
function parseTopicName(title: string): { baseName: string; variationNumber: number } {
  const varMatch = title.match(/^(.+?)\s*-\s*Var\s+(\d+)$/i);

  if (varMatch) {
    return {
      baseName: varMatch[1].trim(),
      variationNumber: parseInt(varMatch[2], 10),
    };
  }

  // No variation number found - treat as Var 1
  return {
    baseName: title.trim(),
    variationNumber: 1,
  };
}

/**
 * Generate unique topic ID from base name, category, and level
 */
function generateTopicId(baseName: string, category: string, level: string): string {
  const slug = baseName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return `${category}-${level}-${slug}`;
}

/**
 * Determine resource type based on file extension and tags
 */
function determineResourceType(resource: Resource): 'pdf' | 'audio' | 'audio-script' {
  // Check if it's an audio script
  if (resource.downloadUrl.endsWith('-audio-script.txt') ||
      resource.tags.includes('pronunciación')) {
    return 'audio-script';
  }

  // Check if it has audio
  if (resource.audioUrl) {
    return 'audio';
  }

  // Default to PDF/Markdown
  return 'pdf';
}

/**
 * Calculate overall edit status for topic group
 */
function calculateEditStatus(topicGroup: TopicGroup): 'none' | 'partial' | 'complete' {
  const allResources = topicGroup.variations.flatMap(v => v.resources);
  const editedCount = allResources.filter(r => r.hasEdit).length;

  if (editedCount === 0) return 'none';
  if (editedCount === allResources.length) return 'complete';
  return 'partial';
}

/**
 * Get latest edit date across all resources in topic
 */
function getLatestEditDate(topicGroup: TopicGroup): string | null {
  const allResources = topicGroup.variations.flatMap(v => v.resources);
  const editDates = allResources
    .map(r => r.lastEditDate)
    .filter(Boolean) as string[];

  if (editDates.length === 0) return null;

  return editDates.sort().reverse()[0];
}
```

---

## 3. API Endpoint Specifications

### 3.1 GET /api/topics/list

**Purpose**: Retrieve all topics with metadata

**Request**: None

**Response**:
```typescript
interface ListTopicsResponse {
  topics: TopicGroup[];
  metadata: {
    totalTopics: number;
    totalResources: number;
    editedResources: number;
    categories: string[];
    levels: string[];
  };
}
```

**Logic**:
1. Load all resources from `data/resources.ts`
2. Load edit data from `data/content-edits.json`
3. Group resources by topic using `groupResourcesByTopic()`
4. Calculate metadata statistics
5. Return topic list with metadata

**Error Handling**:
- 500: Failed to load resources or edits
- 200: Success (empty array if no topics)

---

### 3.2 GET /api/topics/[topicId]

**Purpose**: Retrieve detailed topic data with all variations and content

**Request Parameters**:
- `topicId`: Topic identifier (URL parameter)

**Response**:
```typescript
interface GetTopicResponse {
  topic: TopicGroup;
  contentData: {
    [resourceId: number]: {
      originalContent: string;
      editedContent?: string;
      audioUrl?: string;
      metadata: MediaMetadata;
    };
  };
}
```

**Logic**:
1. Parse `topicId` from URL
2. Find topic in grouped resources
3. Load content for all resources in topic
4. Load audio metadata if applicable
5. Return topic with content data

**Error Handling**:
- 404: Topic not found
- 500: Failed to load content
- 200: Success

---

### 3.3 POST /api/topics/[topicId]/save

**Purpose**: Save edits for one or more resources in a topic

**Request Body**:
```typescript
interface SaveTopicEditsRequest {
  edits: Array<{
    resourceId: number;
    editedContent: string;
  }>;
  editedBy: string;
  comment?: string;
}
```

**Response**:
```typescript
interface SaveTopicEditsResponse {
  success: boolean;
  savedResources: number[];
  failedResources?: Array<{
    resourceId: number;
    error: string;
  }>;
  timestamp: string;
}
```

**Logic**:
1. Validate request (authenticate, check resource IDs)
2. Begin atomic transaction
3. For each edit:
   - Load current edit data
   - Create new edit entry or update existing
   - Update edit history
   - Save content to file (if needed)
4. Commit transaction
5. Return results

**Error Handling**:
- 401: Unauthorized
- 400: Invalid request (missing resourceId or content)
- 404: Resource not found
- 500: Save failed (rollback all changes)
- 207: Partial success (some saves failed)
- 200: All saves successful

---

### 3.4 GET /api/topics/[topicId]/history

**Purpose**: Retrieve edit history for all resources in a topic

**Request Parameters**:
- `topicId`: Topic identifier (URL parameter)

**Response**:
```typescript
interface GetTopicHistoryResponse {
  topicId: string;
  baseName: string;
  history: Array<{
    resourceId: number;
    resourceTitle: string;
    edits: Array<{
      id: string;
      timestamp: string;
      editedBy: string;
      status: 'pending' | 'approved' | 'rejected';
      comment?: string;
      contentPreview: string; // First 200 chars
    }>;
  }>;
}
```

**Logic**:
1. Find topic by ID
2. Load edit history for all resources in topic
3. Sort by timestamp (newest first)
4. Generate content previews
5. Return organized history

**Error Handling**:
- 404: Topic not found
- 500: Failed to load history
- 200: Success (empty array if no history)

---

## 4. Component Hierarchy

### 4.1 Page Components

```
/app/admin/topics/page.tsx
└── TopicsDashboard
    ├── TopicsHeader
    │   └── CreateTopicButton (future)
    ├── TopicsStats
    │   ├── StatCard (Total Topics)
    │   ├── StatCard (Total Resources)
    │   ├── StatCard (Edited Resources)
    │   └── StatCard (Pending Edits)
    ├── TopicsFilters
    │   ├── SearchInput
    │   ├── CategoryFilter
    │   └── LevelFilter
    └── TopicsList
        └── TopicCard (for each topic)
            ├── TopicHeader
            ├── VariationBadges
            ├── EditStatusBadge
            └── ReviewButton

/app/admin/topics/[topicId]/page.tsx
└── TopicReviewPage
    ├── TopicReviewHeader
    │   ├── BackButton
    │   ├── TopicTitle
    │   └── SaveAllButton
    ├── VariationTabs
    │   └── VariationTab (for each variation)
    └── ResourceGrid
        └── ResourceReviewPanel (for each resource)
            ├── ResourceHeader
            ├── ResourceRenderer (routes by type)
            │   ├── AudioReview (for audio)
            │   ├── AudioScriptReview (for transcripts)
            │   └── PDFReview (for PDF/Markdown)
            └── SaveButton
```

### 4.2 Shared Components

```
/components/topics/
├── TopicCard.tsx
├── TopicFilters.tsx
├── VariationTabs.tsx
└── ResourceReviewPanel.tsx

/components/topic-review/
├── AudioReview.tsx (extends existing)
├── AudioScriptReview.tsx
├── PDFReview.tsx (extends existing)
└── ResourceRenderer.tsx (router component)
```

### 4.3 Component Responsibilities

#### TopicsDashboard
- Fetch topics from API
- Manage filter state
- Handle search queries
- Navigate to topic review page

#### TopicCard
- Display topic metadata
- Show variation count
- Display edit status badge
- Handle click to review

#### TopicReviewPage
- Fetch topic data and content
- Manage edit state for all resources
- Handle individual saves
- Handle batch save
- Navigate back to dashboard

#### ResourceReviewPanel
- Display resource in review format
- Route to appropriate renderer (audio/PDF/script)
- Handle content editing
- Trigger save operations

#### ResourceRenderer
- Determine resource type
- Route to appropriate review component
- Pass props to child component

#### AudioReview
- Display audio player
- Load audio metadata
- Manage transcript editing
- Sync audio with transcript

#### AudioScriptReview
- Display transcript in editable format
- Highlight changes
- Character/word count
- Auto-save support

#### PDFReview
- Parse Markdown to HTML
- Display rendered preview
- Provide Markdown editor
- Live preview updates

---

## 5. User Workflows

### 5.1 Browse Topics Workflow

```
1. Admin navigates to /admin/topics
2. System loads all topics
3. System displays topics dashboard:
   - Stats cards (totals)
   - Filter controls
   - Topic cards grid
4. Admin applies filters (category, level, search)
5. System filters topics in real-time
6. Admin sees filtered results
```

**Edge Cases**:
- No topics match filters → Show empty state
- Loading error → Show error with retry button
- Slow network → Show loading skeleton

---

### 5.2 Review Topic Workflow

```
1. Admin clicks topic card
2. System navigates to /admin/topics/[topicId]
3. System loads:
   - Topic metadata
   - All variations
   - All resource content
   - Edit history
4. System displays topic review page:
   - Header with topic name
   - Variation tabs (if multiple)
   - Resource grid (all resources for current variation)
5. Admin reviews resources side-by-side:
   - Audio plays in player
   - PDFs render as HTML
   - Transcripts show formatted
```

**Edge Cases**:
- Topic not found → 404 page
- Content load failure → Show error per resource
- Missing audio file → Show placeholder
- Corrupt content → Show warning, allow editing

---

### 5.3 Edit Single Resource Workflow

```
1. Admin clicks into resource editor (within resource panel)
2. System displays appropriate editor:
   - Audio: Transcript editor
   - PDF: Markdown editor
   - Audio Script: Plain text editor
3. Admin makes changes
4. System shows unsaved indicator
5. Admin clicks "Save" button
6. System validates content
7. System saves to database
8. System updates UI:
   - Remove unsaved indicator
   - Show success message
   - Update edit status badge
```

**Edge Cases**:
- Validation error → Show inline error
- Network failure → Retry with exponential backoff
- Content too large → Show warning, trim if needed
- Concurrent edit detected → Show conflict, let user choose

---

### 5.4 Batch Save Workflow

```
1. Admin edits multiple resources in topic
2. System tracks unsaved changes (count badge)
3. Admin clicks "Save All" button
4. System displays confirmation modal:
   - List of resources to be saved
   - Preview of changes
5. Admin confirms
6. System saves all resources in parallel
7. System shows progress indicator:
   - Saving 1/3...
   - Saving 2/3...
   - Saving 3/3...
8. System displays results:
   - Success count
   - Failed count (if any)
   - Option to retry failures
```

**Edge Cases**:
- Some saves fail → Show partial success, highlight failures
- All saves fail → Show error, keep all edits
- User cancels mid-save → Stop pending saves, keep successful
- Network drops → Queue saves, retry on reconnect

---

### 5.5 Navigate Between Variations Workflow

```
1. Admin reviewing topic with multiple variations
2. System displays variation tabs:
   - Var 1 (active)
   - Var 2
   - Var 3
3. Admin clicks "Var 2" tab
4. System:
   - Saves unsaved changes in Var 1 (auto-save)
   - Loads content for Var 2
   - Updates URL (shallow route)
5. System displays Var 2 resources
6. Admin can navigate back/forward using tabs or browser
```

**Edge Cases**:
- Unsaved changes in current variation → Prompt before switch
- Variation load fails → Show error, stay on current
- Deep link to specific variation → Load that variation first

---

## 6. Technical Constraints

### 6.1 Data Constraints
- Resources file is TypeScript, not database
- Edit data stored in JSON file
- No database transactions available
- File I/O is synchronous bottleneck

### 6.2 Performance Constraints
- Large topics (6+ variations, 18+ resources) must load in <2s
- Concurrent edits from multiple admins not currently supported
- Audio files can be large (1-5 MB each)
- Markdown parsing can be expensive for long documents

### 6.3 Browser Constraints
- Must work on modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile support (responsive design)
- No IE11 support required
- Audio playback must work across browsers

### 6.4 Development Constraints
- Next.js 13+ App Router
- React Server Components where possible
- TypeScript strict mode
- Tailwind CSS for styling

---

## 7. Validation Checklist

Before marking specification as complete:

- [x] All requirements are testable with clear pass/fail criteria
- [x] Acceptance criteria defined for each requirement
- [x] Edge cases documented for each workflow
- [x] API endpoints fully specified (request/response/errors)
- [x] Data structures defined with TypeScript interfaces
- [x] Component hierarchy established
- [x] User workflows documented step-by-step
- [x] Performance metrics specified
- [x] Security requirements addressed
- [x] Error handling strategies defined
- [x] Dependencies identified
- [x] Constraints documented

---

## 8. Dependencies

### 8.1 Existing Components
- `ContentReviewTool` - For transcript editing
- `AudioPlayer` - For audio playback
- `MediaReviewTool` - Base for resource review

### 8.2 Existing APIs
- `GET /api/content/[id]` - Load individual resource content
- `POST /api/content/save` - Save individual resource edits

### 8.3 Data Files
- `data/resources.ts` - Resource definitions
- `data/content-edits.json` - Edit tracking

### 8.4 Libraries
- `react-markdown` or `marked` - Markdown parsing
- `lucide-react` - Icons
- `tailwindcss` - Styling

---

## 9. Acceptance Criteria Summary

### 9.1 Topic Grouping
- ✅ Resources grouped by base topic name
- ✅ Variations sorted numerically
- ✅ Audio scripts paired with audio files
- ✅ Category and level preserved

### 9.2 Display
- ✅ Audio plays as students see it
- ✅ PDFs render as formatted HTML
- ✅ Transcripts show with proper formatting
- ✅ All variations visible side-by-side

### 9.3 Editing
- ✅ Inline editing for all content types
- ✅ Real-time preview of changes
- ✅ Individual save per resource
- ✅ Batch save for entire topic
- ✅ Auto-save support

### 9.4 Navigation
- ✅ Dashboard shows topics, not resources
- ✅ Click topic to review all variations
- ✅ Filter by category and level
- ✅ Search by topic name
- ✅ Breadcrumb navigation

---

## 10. Open Questions

1. **Topic Naming Consistency**: Should we enforce consistent variation naming?
   - Current: "Frases Esenciales para Entregas - Var 1", "Frases Esenciales para Entregas - Var 2"
   - Some resources have "Pronunciación:", "Audio:" prefixes
   - **Decision Needed**: Standardize naming convention?

2. **Concurrent Edits**: How to handle two admins editing same topic?
   - Current: No conflict detection
   - Options: Lock topic, last-write-wins, merge conflicts
   - **Decision Needed**: Implement locking or optimistic concurrency?

3. **Audio Metadata**: Extract duration, bitrate, sample rate?
   - Requires audio parsing library (e.g., `music-metadata`)
   - Adds dependency and processing time
   - **Decision Needed**: Worth the complexity?

4. **Preview Sync**: Should scrolling sync across variations?
   - Nice-to-have for comparing content
   - Complex to implement reliably
   - **Decision Needed**: Defer to v2?

5. **Edit Approval Workflow**: Should topic-level approval be added?
   - Currently: Individual resource approval
   - Could add: Approve entire topic at once
   - **Decision Needed**: Include in v1 or defer?

---

## 11. Next Steps (Pseudocode Phase)

1. Design topic grouping algorithm in detail
2. Define API endpoint logic with error handling
3. Design component state management
4. Plan data loading strategies (parallel vs. sequential)
5. Design caching and performance optimizations
6. Create UI/UX wireframes
7. Define testing strategy

---

## Appendix A: Example Topic Structure

### Example: "Frases Esenciales para Entregas"

**Topic Group**:
```json
{
  "id": "repartidor-basico-frases-esenciales-para-entregas",
  "baseName": "Frases Esenciales para Entregas",
  "category": "repartidor",
  "level": "basico",
  "variations": [
    {
      "variationNumber": 1,
      "resources": [
        {
          "id": 1,
          "title": "Frases Esenciales para Entregas - Var 1",
          "type": "pdf",
          "downloadUrl": "/generated-resources/50-batch/repartidor/basic_phrases_1.md",
          "audioUrl": "/audio/resource-1.mp3",
          "hasEdit": false
        },
        {
          "id": 2,
          "title": "Pronunciación: Entregas - Var 1",
          "type": "audio-script",
          "downloadUrl": "/generated-resources/50-batch/repartidor/basic_audio_1-audio-script.txt",
          "audioUrl": "/audio/resource-2.mp3",
          "hasEdit": false
        }
      ]
    },
    {
      "variationNumber": 2,
      "resources": [
        {
          "id": 4,
          "title": "Frases Esenciales para Entregas - Var 2",
          "type": "pdf",
          "downloadUrl": "/generated-resources/50-batch/repartidor/basic_phrases_2.md",
          "audioUrl": "/audio/resource-4.mp3",
          "hasEdit": true,
          "editStatus": "pending",
          "lastEditDate": "2025-11-15T10:30:00Z"
        },
        {
          "id": 7,
          "title": "Pronunciación: Entregas - Var 2",
          "type": "audio-script",
          "downloadUrl": "/generated-resources/50-batch/repartidor/basic_audio_2-audio-script.txt",
          "audioUrl": "/audio/resource-7.mp3",
          "hasEdit": false
        }
      ]
    }
  ],
  "totalResources": 4,
  "editStatus": "partial",
  "lastModified": "2025-11-15T10:30:00Z"
}
```

---

## Appendix B: Resources Distribution Analysis

**Total Resources**: 34

**By Category**:
- Repartidor: 10 resources
- Conductor: 14 resources
- All: 10 resources

**By Level**:
- Basico: 20 resources
- Intermedio: 14 resources
- Avanzado: 0 resources (from original batch)

**Identified Topics** (estimated):
1. Frases Esenciales para Entregas (repartidor, basico) - 4 variations
2. Pronunciación: Entregas (repartidor, basico) - 2 variations
3. Situaciones Complejas en Entregas (repartidor, intermedio) - 2 variations
4. Conversaciones con Clientes (repartidor, basico) - 2 variations
5. Saludos y Confirmación de Pasajeros (conductor, basico) - 3 variations
6. Direcciones y Navegación GPS (conductor, basico) - 3 variations
7. Audio: Direcciones en Inglés (conductor, basico) - 2 variations
8. Small Talk con Pasajeros (conductor, intermedio) - 2 variations
9. Manejo de Situaciones Difíciles (conductor, intermedio) - 1 variation
10. Diálogos Reales con Pasajeros (conductor, basico) - 1 variation
11. Saludos Básicos en Inglés (all, basico) - 2 variations
12. Números y Direcciones (all, basico) - 2 variations
13. Tiempo y Horarios (all, basico) - 1 variation
14. Servicio al Cliente en Inglés (all, intermedio) - 1 variation
15. Manejo de Quejas y Problemas (all, intermedio) - 1 variation
16. Frases de Emergencia (all, basico) - 1 variation
17. Protocolos de Seguridad (all, intermedio) - 1 variation

**Estimated Topics**: ~17 unique topics

---

**End of Specification Document**
