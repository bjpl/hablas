# Multimedia Content Review System

## Overview

Fully integrated multimedia review system that extends the existing ContentReviewTool with support for audio, image, and video content.

## Integration Strategy

### ✅ INTEGRATED with Existing System

- **Uses existing `data/resources.ts`** - No changes to resource structure
- **Wraps existing `ContentReviewTool`** - Reuses text editing for transcripts
- **Extends existing API routes** - `/api/content/[id]` now includes media metadata
- **Maintains authentication** - Uses existing auth middleware
- **Preserves file structure** - Files stay in `/public/generated-resources/` and `/public/audio/`

### 🎯 Smart Component Routing

The `MediaReviewTool` intelligently routes based on `resource.type`:

```typescript
// Audio files → AudioReview (player + transcript editing)
type: 'audio' → AudioReview + ContentReviewTool

// PDF/Markdown → Existing ContentReviewTool
type: 'pdf' → ContentReviewTool (no changes)

// Images → ImageReview (viewer with zoom/rotate)
type: 'image' → ImageReview

// Videos → VideoReview (player with controls)
type: 'video' → VideoReview
```

## File Structure

```
/components/media-review/
├── MediaReviewTool.tsx        # Main wrapper - routes by media type
├── AudioReview.tsx            # Audio player + transcript editor
├── AudioPlayer.tsx            # Reusable audio player component
├── ImageReview.tsx            # Image viewer with zoom/rotate
├── VideoReview.tsx            # Video player with controls
└── index.ts                   # Exports

/lib/types/
└── media.ts                   # Media type definitions

/lib/hooks/
├── useMediaPlayer.ts          # Audio/video playback hook
└── useMediaUpload.ts          # Media file upload hook

/app/api/media/[id]/
└── route.ts                   # Media streaming API

/app/admin/edit/[id]/
└── page.tsx                   # Updated to use MediaReviewTool
```

## Usage

### Admin Edit Page (Updated)

```typescript
import { MediaReviewTool } from '@/components/media-review';

<MediaReviewTool 
  resource={resource}  // Full Resource from data/resources.ts
  onSave={handleSave}  // Save edited content
/>
```

### Audio Review Component

```typescript
import { AudioReview } from '@/components/media-review';

<AudioReview
  resource={resource}
  transcript={content}
  onTranscriptEdit={handleSave}
/>
```

Features:
- ✅ Audio player with play/pause, seek, volume
- ✅ Waveform progress bar
- ✅ Audio metadata display (duration, bitrate, format)
- ✅ **Reuses existing ContentReviewTool for transcript editing**
- ✅ Side-by-side layout (player | transcript editor)

### Image Review Component

```typescript
import { ImageReview } from '@/components/media-review';

<ImageReview resource={resource} />
```

Features:
- ✅ Image viewer with zoom controls (50% - 200%)
- ✅ Rotation controls (90° increments)
- ✅ Image metadata display
- ✅ Responsive layout

### Video Review Component

```typescript
import { VideoReview } from '@/components/media-review';

<VideoReview resource={resource} />
```

Features:
- ✅ Video player with custom controls
- ✅ Play/pause, seek, volume, mute
- ✅ Time display and progress bar
- ✅ Video metadata display

## API Routes

### GET /api/media/[id]

Streams media files with proper headers:

```typescript
const response = await fetch('/api/media/1');
// Returns audio/video/image file with correct Content-Type
```

### GET /api/content/[id] (Updated)

Now includes media metadata:

```json
{
  "resourceId": 1,
  "title": "Frases Esenciales",
  "type": "audio",
  "originalContent": "transcript text...",
  "audioUrl": "/audio/resource-1.mp3",
  "downloadUrl": "/generated-resources/...",
  "metadata": {
    "format": "mp3",
    "size": 1234567,
    "duration": 120
  }
}
```

## Integration Points

### ✅ Data Layer
- Uses existing `Resource` interface from `data/resources.ts`
- Extends with `MediaResource` for optional metadata
- All 34+ resources supported out of the box

### ✅ API Layer
- Enhanced `/api/content/[id]` to include media metadata
- New `/api/media/[id]` for media streaming
- Maintains existing `/api/content/save` for edits

### ✅ Authentication
- All media routes use existing auth middleware
- Respects role-based permissions (admin/editor/viewer)
- Protected routes return 401 for unauthorized access

### ✅ Component Layer
- **Wraps** existing `ContentReviewTool` (doesn't replace!)
- Audio transcripts use existing text editor
- PDF/text content uses existing flow
- New components for audio/image/video only

### ✅ Admin System
- Updated `/app/admin/edit/[id]/page.tsx` to use `MediaReviewTool`
- Backward compatible with existing resources
- Shows media type badge in header

## Testing the Integration

### 1. Test Audio Resources (IDs: 1, 2, 4, 6, 7, 9, 10, etc.)

```bash
# Navigate to admin edit page
http://localhost:3000/admin/edit/1
```

Expected:
- Audio player loads and plays MP3
- Transcript shown in ContentReviewTool (right side)
- Can edit transcript and save
- Audio metadata displays correctly

### 2. Test PDF/Text Resources (IDs: 1, 4, 6, etc.)

```bash
http://localhost:3000/admin/edit/1
```

Expected:
- Existing ContentReviewTool loads normally
- Side-by-side original/edited view
- All existing features work (save, diff, etc.)

### 3. Test Image Resources (if any)

Expected:
- Image viewer with zoom/rotate controls
- Metadata display

### 4. Test Video Resources (if any)

Expected:
- Video player with playback controls
- Metadata display

## Hooks

### useMediaPlayer

```typescript
const { state, play, pause, seek, setVolume } = useMediaPlayer({
  src: '/audio/resource-1.mp3',
  onTimeUpdate: (time) => console.log(time),
  onEnded: () => console.log('Finished'),
});
```

### useMediaUpload

```typescript
const { uploadFile, uploading, progress } = useMediaUpload({
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['audio/*', 'video/*', 'image/*'],
  onProgress: (p) => console.log(`${p.percentage}%`),
});

await uploadFile(file, resourceId);
```

## Benefits

### 🎯 No Breaking Changes
- Existing resources work exactly as before
- ContentReviewTool still used for all text content
- API routes enhanced, not replaced

### ⚡ Efficient Reuse
- Audio transcripts use existing ContentReviewTool
- No duplicate code for text editing
- Existing hooks and utilities preserved

### 🔄 Extensible Architecture
- Easy to add new media types
- Component-based routing
- Type-safe interfaces

### 🎨 Consistent UX
- Same edit/save flow across all media types
- Familiar navigation and controls
- Unified header design

## Future Enhancements

1. **Waveform Visualization** - Add visual audio waveform
2. **Audio Duration Metadata** - Parse MP3 files for duration
3. **Media Upload UI** - File upload component
4. **Batch Processing** - Edit multiple resources
5. **Version History** - Track media file versions

## Support

All components integrate seamlessly with:
- ✅ Existing Resource interface
- ✅ Existing API routes
- ✅ Existing authentication system
- ✅ Existing ContentReviewTool
- ✅ Existing admin dashboard

**No migration needed** - Deploy and use immediately with all 34+ resources!
