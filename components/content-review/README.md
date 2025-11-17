# Content Review Components

Professional React components for reviewing and editing content with support for individual resources and topic-based batch operations.

## Components

### ContentReviewTool

Single resource review with side-by-side comparison and editing.

```tsx
import { ContentReviewTool } from '@/components/content-review';

<ContentReviewTool
  initialContent={{
    id: 'resource-1',
    original: 'Original content...',
    edited: 'Edited content...',
    metadata: {
      title: 'Resource Title',
      category: 'delivery',
    }
  }}
  onSave={async (content) => {
    await saveContent(content);
  }}
  autoSaveDelay={2000}
/>
```

### TopicReviewTool ⭐ NEW

Topic-based review with tabs for comparing multiple resource variations.

```tsx
import { TopicReviewTool } from '@/components/content-review';

<TopicReviewTool
  topicSlug="frases-esenciales-entregas"
  onSave={() => {
    console.log('All changes saved');
  }}
  onBack={() => {
    router.push('/admin/topics');
  }}
/>
```

## Features

### ContentReviewTool
- ✅ Side-by-side comparison view
- ✅ Real-time editing with auto-save
- ✅ Manual save controls
- ✅ Diff highlighting
- ✅ Keyboard shortcuts (Ctrl+S)
- ✅ Download/export functionality
- ✅ Responsive design

### TopicReviewTool
- ✅ **Tab-based navigation** between resource variations
- ✅ **Individual and batch save** operations
- ✅ **Unsaved changes tracking** with visual indicators
- ✅ **Keyboard shortcuts** (Ctrl+S for active resource)
- ✅ **Loading states** and error handling
- ✅ **Optimistic updates** for better UX
- ✅ **Browser warning** on navigation with unsaved changes
- ✅ **Audio playback** for resources with audio files

## Architecture

### State Management

**useContentManager Hook** (single resource)
- Manages individual content state
- Tracks dirty/clean status
- Provides update and reset functions

**useTopicManager Hook** (multiple resources)
- Fetches topic data with all resources
- Maintains edit state for each resource
- Handles individual and batch saves
- Tracks dirty resources across the topic

### API Integration

**Single Resource Save**
```
POST /api/content/save
{
  resourceId: number,
  editedContent: string
}
```

**Batch Save (Topic)**
```
POST /api/topics/[slug]/save
{
  updates: [
    { resourceId: 1, editedContent: "..." },
    { resourceId: 2, editedContent: "..." }
  ]
}
```

**Topic Details**
```
GET /api/topics/[slug]
Response: {
  topic: TopicGroup,
  resources: TopicResourceWithContent[]
}
```

## Layout Options

The TopicReviewTool uses a **tabs layout** for the following reasons:

1. **Easy Comparison**: Switch between variations with a single click
2. **Focused Editing**: Work on one resource at a time without clutter
3. **Visual Indicators**: Tab badges show unsaved changes
4. **Keyboard Navigation**: Quick switching with shortcuts
5. **Scalable**: Works well with 2-10+ variations

Alternative layouts considered:
- Grid: Good for visual comparison but limited editing space
- Accordion: Space-efficient but requires more clicks
- Split panels: Complex to manage with 3+ variations

## Usage Examples

### Basic Topic Review

```tsx
import { TopicReviewTool } from '@/components/content-review';

export default function TopicReviewPage({ params }) {
  return (
    <TopicReviewTool
      topicSlug={params.slug}
      onSave={() => {
        // Optional callback after successful save
        toast.success('Changes saved');
      }}
    />
  );
}
```

### With Navigation

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { TopicReviewTool } from '@/components/content-review';

export default function TopicEditor({ params }) {
  const router = useRouter();

  return (
    <TopicReviewTool
      topicSlug={params.slug}
      onSave={() => {
        // Refresh topic list or show notification
      }}
      onBack={() => {
        router.push('/admin/topics');
      }}
    />
  );
}
```

### Custom Save Handling

```tsx
import { TopicReviewTool } from '@/components/content-review';
import { revalidatePath } from 'next/cache';

export default function AdvancedTopicReview({ params }) {
  const handleSave = async () => {
    // Custom logic after save
    await logAuditEntry('topic_edited', params.slug);
    revalidatePath(`/topics/${params.slug}`);

    // Show notification
    showNotification('Changes published successfully');
  };

  return (
    <TopicReviewTool
      topicSlug={params.slug}
      onSave={handleSave}
    />
  );
}
```

## Keyboard Shortcuts

- **Ctrl+S / Cmd+S**: Save active resource (TopicReviewTool) or current content (ContentReviewTool)
- **Tab**: Navigate between tabs (TopicReviewTool)

## Testing

Comprehensive test coverage with:
- Component rendering tests
- State management tests
- API integration tests
- User interaction tests
- Keyboard shortcut tests
- Error handling tests

Run tests:
```bash
npm test TopicReviewTool
npm test useTopicManager
```

## Type Safety

Full TypeScript support with comprehensive type definitions:

```typescript
interface TopicReviewToolProps {
  topicSlug: string;
  onSave?: () => void;
  onBack?: () => void;
  className?: string;
}

interface ResourceEditState {
  resourceId: number;
  originalContent: string;
  editedContent: string;
  isDirty: boolean;
}
```

## Performance Optimizations

1. **Lazy Loading**: Resources loaded on-demand
2. **Debounced Auto-save**: Prevents excessive API calls
3. **Optimistic Updates**: Immediate UI feedback
4. **Memoized Callbacks**: Prevents unnecessary re-renders
5. **Efficient State Updates**: Only dirty resources trigger saves

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive design with touch support

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Focus management
- Semantic HTML structure
- Color contrast compliance

## Related Components

- `MediaReviewTool` - Review images, audio, and video
- `DiffHighlighter` - Visual diff display
- `ComparisonView` - Read-only content display
- `EditPanel` - Content editing interface

## API Documentation

See [/docs/api/topics.md](/docs/api/topics.md) for complete API reference.

## Contributing

When adding new features:
1. Update TypeScript types in `/lib/types/topics.ts`
2. Add comprehensive tests
3. Update this README
4. Follow existing code patterns
