# Topic Review Components

Production-ready React components for previewing and editing topic resources in their actual display formats.

## Components

### 1. AudioResourcePreview

Full audio player with transcript editing capabilities.

**Features:**
- Integrated AudioPlayer component (as students see it)
- Display audio metadata (duration, voice, accent, narrator)
- Side-by-side transcript editing and preview
- Toggle between edited and original transcript views
- Real-time character count and change tracking
- Save/discard controls with loading states

**Usage:**
```tsx
import { AudioResourcePreview } from '@/components/topic-review';

<AudioResourcePreview
  resourceId={123}
  title="Greetings Audio"
  audioUrl="/audio/greetings.mp3"
  originalTranscript="Original transcript text..."
  editedTranscript="Edited transcript text..."
  metadata={{
    duration: "2:30",
    narrator: "María García",
    accent: "Mexican Spanish"
  }}
  onSave={async (resourceId, content) => {
    await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify({ resourceId, content })
    });
  }}
  onDiscard={() => console.log('Changes discarded')}
  isDirty={true}
/>
```

### 2. PDFResourcePreview

Markdown/PDF content preview with side-by-side editing.

**Features:**
- Three view modes: Split, Edit only, Preview only
- Live markdown rendering using react-markdown
- Original vs edited content comparison
- Toggle between edited and original preview
- Line and character count with change tracking
- Styled prose rendering matching site design

**Usage:**
```tsx
import { PDFResourcePreview } from '@/components/topic-review';

<PDFResourcePreview
  resourceId={456}
  title="Grammar Lesson PDF"
  originalContent="# Original markdown\n\nContent here..."
  editedContent="# Edited markdown\n\nNew content..."
  onSave={async (resourceId, content) => {
    await saveContent(resourceId, content);
  }}
  onDiscard={() => console.log('Changes discarded')}
  isDirty={true}
/>
```

### 3. ResourcePreviewPanel

Container component that renders the appropriate preview based on resource type.

**Features:**
- Automatic component selection based on type
- Resource type badge display
- Consistent styling across all resource types
- Placeholder support for image/video types (coming soon)

**Usage:**
```tsx
import { ResourcePreviewPanel } from '@/components/topic-review';

const resource = {
  id: 789,
  title: "Spanish Greetings",
  type: "audio", // "audio" | "pdf" | "markdown" | "image" | "video"
  originalContent: "Transcript...",
  editedContent: "Edited transcript...",
  audioUrl: "/audio/greetings.mp3",
  metadata: {
    duration: "2:30",
    narrator: "María García"
  }
};

<ResourcePreviewPanel
  resource={resource}
  onSave={async (resourceId, content) => {
    await saveResource(resourceId, content);
  }}
  className="my-4"
/>
```

### 4. TopicHeader

Topic navigation header with batch save functionality.

**Features:**
- Back navigation to topics list
- Topic metadata display (ID, resource count, edited count)
- Unsaved changes indicator
- Batch save all button with loading state
- Success/error status display
- Review progress bar

**Usage:**
```tsx
import { TopicHeader } from '@/components/topic-review';

<TopicHeader
  topicName="Basic Greetings"
  topicId="greeting-001"
  totalResources={5}
  editedResources={3}
  hasUnsavedChanges={true}
  onSaveAll={async () => {
    await Promise.all(pendingEdits.map(edit => saveEdit(edit)));
  }}
  backUrl="/admin/content/topics"
/>
```

## Complete Example

Here's how to use all components together in a topic review page:

```tsx
'use client';

import { useState, useEffect } from 'react';
import {
  TopicHeader,
  ResourcePreviewPanel
} from '@/components/topic-review';

export default function TopicReviewPage({ params }: { params: { topicId: string } }) {
  const [topic, setTopic] = useState(null);
  const [resources, setResources] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchTopicData(params.topicId);
  }, [params.topicId]);

  const fetchTopicData = async (topicId: string) => {
    const response = await fetch(`/api/topics/${topicId}`);
    const data = await response.json();
    setTopic(data.topic);
    setResources(data.resources);
  };

  const handleSaveResource = async (resourceId: number, content: string) => {
    await fetch(`/api/resources/${resourceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    setHasUnsavedChanges(false);
  };

  const handleSaveAll = async () => {
    const promises = resources
      .filter(r => r.editedContent)
      .map(r => handleSaveResource(r.id, r.editedContent));

    await Promise.all(promises);
    setHasUnsavedChanges(false);
  };

  if (!topic) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopicHeader
        topicName={topic.name}
        topicId={topic.id}
        totalResources={resources.length}
        editedResources={resources.filter(r => r.editedContent).length}
        hasUnsavedChanges={hasUnsavedChanges}
        onSaveAll={handleSaveAll}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {resources.map(resource => (
          <ResourcePreviewPanel
            key={resource.id}
            resource={resource}
            onSave={handleSaveResource}
          />
        ))}
      </div>
    </div>
  );
}
```

## Styling

All components use Tailwind CSS with the following design system:

- **Audio resources**: Purple accent (`purple-100`, `purple-600`)
- **PDF/Markdown resources**: Blue accent (`blue-100`, `blue-600`)
- **Status indicators**: Orange for unsaved, green for success, red for errors
- **Consistent spacing**: `gap-4` for sections, `px-6 py-4` for headers
- **Responsive design**: Grid layouts adapt to mobile/tablet/desktop

## TypeScript Support

All components are fully typed with TypeScript interfaces:

- `AudioResourcePreviewProps`
- `PDFResourcePreviewProps`
- `ResourcePreviewPanelProps`
- `TopicHeaderProps`

Import types from component files as needed.

## API Integration

Components expect these API endpoints:

- `POST /api/resources/:id` - Save resource edits
- `GET /api/topics/:id` - Fetch topic and resources
- `POST /api/topics/:id/save-all` - Batch save all edits

Implement these endpoints to match your backend structure.

## Dependencies

- `react-markdown` - Markdown rendering (already installed)
- `lucide-react` - Icons
- `@/components/AudioPlayer` - Existing audio player component
- `@/lib/types/content-edits` - Type definitions

## File Locations

```
components/topic-review/
├── AudioResourcePreview.tsx    - Audio player with transcript editing
├── PDFResourcePreview.tsx      - Markdown/PDF content editing
├── ResourcePreviewPanel.tsx    - Resource type router
├── TopicHeader.tsx             - Navigation and batch controls
├── index.ts                    - Barrel exports
└── README.md                   - This file
```
