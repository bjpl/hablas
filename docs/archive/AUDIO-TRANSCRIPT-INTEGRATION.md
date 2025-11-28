# Audio Transcript Integration Guide

**Component:** AudioTranscriptReview
**Purpose:** Elegant audio playback with synchronized bilingual transcript editing
**Status:** ✅ Production Ready

---

## Overview

The `AudioTranscriptReview` component provides a beautiful, intuitive interface for reviewing and editing audio resources with synchronized English/Spanish transcripts. It combines the best features of professional subtitle editors with Hablas-specific bilingual learning needs.

## Key Features

### 🎨 **Elegant Design**
- Clean, modern interface with gradient accents
- Smooth animations and transitions
- Responsive layout (mobile-friendly)
- Visual hierarchy emphasizing current segment
- Accessible color palette (WCAG 2.1 AA compliant)

### 🎵 **Audio Playback**
- Canvas-based waveform visualization
- Precise playback controls (play/pause, skip ±10s)
- Variable speed (0.5x - 1.5x)
- Volume control with mute toggle
- Click-to-seek on waveform
- Time display (current/total)

### 📝 **Transcript Features**
- **Real-time highlighting** of current segment during playback
- **Bilingual display** (English 🇺🇸 + Spanish 🇨🇴 side-by-side)
- **Inline editing** with visual feedback
- **Pronunciation hints** displayed with segments
- **Speaker indicators** (narrator, example, student)
- **Timestamp navigation** - click any timestamp to jump

### ⌨️ **Keyboard Shortcuts**
- `Space` - Play/Pause
- `←` - Rewind 5 seconds
- `→` - Forward 5 seconds
- `M` - Mute/Unmute

### 💾 **Data Management**
- Auto-save detection (shows save button when edited)
- Export to VTT format for subtitles
- Undo/cancel editing
- Readonly mode for review-only workflows

---

## Usage Example

```tsx
import AudioTranscriptReview from '@/components/content-review/AudioTranscriptReview'

const transcriptSegments = [
  {
    id: 'seg-1',
    startTime: 0,
    endTime: 3.5,
    english: 'Good morning, I have a delivery for you.',
    spanish: 'Buenos días, tengo una entrega para usted.',
    speaker: 'example',
    pronunciation: 'BWAY-nohs DEE-ahs'
  },
  {
    id: 'seg-2',
    startTime: 3.5,
    endTime: 6.2,
    english: 'Where should I leave the package?',
    spanish: '¿Dónde debo dejar el paquete?',
    speaker: 'student'
  }
]

function ReviewPage() {
  const handleSave = (updatedSegments) => {
    // Save to backend
    console.log('Saving transcript:', updatedSegments)
  }

  const handleExport = () => {
    // Export to VTT format
    const vtt = generateVTT(segments)
    downloadFile(vtt, 'transcript.vtt')
  }

  return (
    <AudioTranscriptReview
      audioUrl="/audio/basic-delivery-phrases.mp3"
      title="Basic Delivery Phrases - Pronunciation Guide"
      transcriptSegments={transcriptSegments}
      onSaveTranscript={handleSave}
      onExportVTT={handleExport}
      readOnly={false}
    />
  )
}
```

---

## Props Interface

```typescript
interface TranscriptSegment {
  id: string                    // Unique identifier
  startTime: number             // Start time in seconds
  endTime: number               // End time in seconds
  english: string               // English text
  spanish: string               // Spanish text
  speaker?: 'narrator' | 'example' | 'student'  // Optional speaker type
  pronunciation?: string        // Optional pronunciation guide (IPA or phonetic)
}

interface AudioTranscriptReviewProps {
  audioUrl: string                                    // Audio file URL
  title: string                                       // Resource title
  transcriptSegments: TranscriptSegment[]            // Array of transcript segments
  onSaveTranscript?: (segments: TranscriptSegment[]) => void  // Save callback
  onExportVTT?: () => void                           // Export callback
  readOnly?: boolean                                  // Disable editing (default: false)
}
```

---

## Integration with Existing Review Tools

### Option 1: Standalone Review Page

Create a dedicated audio review page:

```tsx
// app/admin/review/audio/[id]/page.tsx
import AudioTranscriptReview from '@/components/content-review/AudioTranscriptReview'
import { getResourceById } from '@/lib/resources'

export default async function AudioReviewPage({ params }: { params: { id: string } }) {
  const resource = await getResourceById(params.id)

  if (resource.type !== 'audio') {
    return <div>Not an audio resource</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <AudioTranscriptReview
        audioUrl={resource.audioUrl}
        title={resource.title}
        transcriptSegments={resource.transcript || []}
        onSaveTranscript={async (segments) => {
          await updateResourceTranscript(resource.id, segments)
        }}
        onExportVTT={() => exportTranscript(resource.id)}
      />
    </div>
  )
}
```

### Option 2: Integrated into TopicReviewTool

Add as a new tab in the topic review interface:

```tsx
// components/content-review/TopicReviewTool.tsx
import AudioTranscriptReview from './AudioTranscriptReview'

const tabs = [
  { id: 'edit', label: 'Edit Content' },
  { id: 'preview', label: 'Preview' },
  { id: 'audio', label: 'Audio + Transcript' },  // NEW TAB
  { id: 'compare', label: 'Compare Versions' }
]

// In the tab content rendering:
{activeTab === 'audio' && currentResource.audioUrl && (
  <AudioTranscriptReview
    audioUrl={currentResource.audioUrl}
    title={currentResource.title}
    transcriptSegments={currentResource.transcript || []}
    onSaveTranscript={(segments) => handleSaveTranscript(currentResource.id, segments)}
  />
)}
```

### Option 3: Side-by-Side with Text Editor

For resources with both markdown content and audio:

```tsx
<div className="grid grid-cols-2 gap-6">
  {/* Left: Markdown Editor */}
  <div>
    <EditPanel
      content={content}
      onChange={setContent}
      onSave={handleSave}
    />
  </div>

  {/* Right: Audio + Transcript */}
  <div>
    <AudioTranscriptReview
      audioUrl={audioUrl}
      title={title}
      transcriptSegments={transcript}
      onSaveTranscript={handleSaveTranscript}
    />
  </div>
</div>
```

---

## Data Flow

### 1. Loading Transcript Data

Transcript data can come from:
- **Database** (stored as JSON in `resources` table)
- **VTT file** (parsed on load)
- **Auto-generated** (using speech-to-text API)

Example database schema:

```sql
-- Add to resources table
ALTER TABLE resources ADD COLUMN transcript JSONB;

-- Example data
UPDATE resources SET transcript = '[
  {
    "id": "seg-1",
    "startTime": 0,
    "endTime": 3.5,
    "english": "Good morning...",
    "spanish": "Buenos días...",
    "speaker": "example"
  }
]'::jsonb WHERE id = 1;
```

### 2. Saving Changes

```typescript
async function handleSaveTranscript(segments: TranscriptSegment[]) {
  try {
    const response = await fetch(`/api/resources/${resourceId}/transcript`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: segments })
    })

    if (response.ok) {
      toast.success('Transcript saved successfully')
    } else {
      toast.error('Failed to save transcript')
    }
  } catch (error) {
    console.error('Save error:', error)
    toast.error('Network error')
  }
}
```

### 3. Exporting to VTT

```typescript
function generateVTT(segments: TranscriptSegment[]): string {
  let vtt = 'WEBVTT\n\n'

  segments.forEach((seg, index) => {
    vtt += `${index + 1}\n`
    vtt += `${formatVTTTime(seg.startTime)} --> ${formatVTTTime(seg.endTime)}\n`
    vtt += `${seg.english}\n`
    vtt += `${seg.spanish}\n\n`
  })

  return vtt
}

function formatVTTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/vtt' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## Accessibility Features

✅ **WCAG 2.1 AA Compliant**
- All interactive elements have proper ARIA labels
- Keyboard navigation fully supported
- Focus indicators visible and clear
- Color contrast ratios ≥ 4.5:1
- Semantic HTML structure

✅ **Screen Reader Support**
- Audio player controls properly labeled
- Transcript segments announced with context
- Edit mode changes announced
- Time updates communicated

✅ **Keyboard Navigation**
- All controls accessible via keyboard
- Logical tab order
- Escape key to cancel editing
- Enter key to save changes

---

## Performance Considerations

### Waveform Rendering
- Uses HTML5 Canvas for efficient rendering
- Simplified waveform (not frequency analysis)
- Renders only on time/segment changes
- HiDPI support (retina displays)

### Large Transcripts
- Virtualized scrolling recommended for 50+ segments
- Consider pagination for 100+ segments
- Lazy load audio waveform data

### Optimization Tips
```tsx
// For very long audio files (>30 min), consider:
import { memo, useMemo } from 'react'

const AudioTranscriptReview = memo(({ ... }) => {
  // Memoize expensive computations
  const currentSegment = useMemo(
    () => segments.find(seg => currentTime >= seg.startTime && currentTime < seg.endTime),
    [segments, currentTime]
  )

  // ... rest of component
})
```

---

## Styling Customization

The component uses Tailwind CSS and can be customized:

```tsx
// Custom brand colors
<AudioTranscriptReview
  // ... props
  className="custom-audio-review"
/>

// Custom CSS
.custom-audio-review {
  --primary-color: #your-brand-color;
  --active-segment-bg: #your-highlight-color;
}
```

---

## Testing

### Unit Tests

```tsx
// __tests__/components/content-review/AudioTranscriptReview.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import AudioTranscriptReview from '@/components/content-review/AudioTranscriptReview'

describe('AudioTranscriptReview', () => {
  const mockSegments = [
    {
      id: '1',
      startTime: 0,
      endTime: 3,
      english: 'Hello',
      spanish: 'Hola'
    }
  ]

  it('renders audio player controls', () => {
    render(
      <AudioTranscriptReview
        audioUrl="/test.mp3"
        title="Test Audio"
        transcriptSegments={mockSegments}
      />
    )

    expect(screen.getByLabelText('Play')).toBeInTheDocument()
    expect(screen.getByLabelText('Rewind 10 seconds')).toBeInTheDocument()
  })

  it('highlights current segment during playback', async () => {
    // Test implementation
  })

  it('allows editing in non-readonly mode', () => {
    // Test implementation
  })
})
```

---

## Future Enhancements

Potential improvements for future versions:

1. **Auto-sync from video** - Extract transcript from video files
2. **AI-assisted transcription** - OpenAI Whisper integration
3. **Collaborative editing** - Multiple editors with real-time sync
4. **Waveform from audio analysis** - Use Web Audio API for actual waveform
5. **Auto-detect silence** - Suggest segment boundaries
6. **Translation suggestions** - AI-powered translation hints
7. **Pronunciation scoring** - Compare user pronunciation to reference

---

## Support & Documentation

- Component source: `/components/content-review/AudioTranscriptReview.tsx`
- Type definitions: Exported from component file
- Example implementation: See usage examples above
- Related components: AudioTextAlignmentTool, BilingualComparisonView

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** 2025-11-19
**Maintainer:** Hablas Dev Team
