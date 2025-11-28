# Content Review Components - Implementation Documentation

**Created:** November 19, 2025
**Status:** ✅ Complete
**Components:** 5 new components + 3 utility modules

---

## 📦 Components Implemented

### 1. BilingualComparisonView
**Location:** `/home/user/hablas/components/content-review/BilingualComparisonView.tsx`

**Purpose:** Side-by-side English/Spanish editor with inline editing capability

**Features:**
- ✅ Split-pane view (English left, Spanish right)
- ✅ Inline phrase editing with click-to-edit
- ✅ Missing translation highlighting
- ✅ Translation accuracy percentage
- ✅ Keyboard shortcuts (Ctrl+Enter to save, Esc to cancel)
- ✅ ARIA labels for accessibility

**Props:**
```typescript
interface BilingualComparisonViewProps {
  content: string;                    // Bilingual markdown content
  onEdit: (lang: 'en' | 'es', lineIndex: number, newText: string) => void;
  onSave?: () => void;               // Optional manual save handler
  className?: string;
}
```

**Usage Example:**
```tsx
import { BilingualComparisonView } from '@/components/content-review';

<BilingualComparisonView
  content={resource.content}
  onEdit={(lang, idx, text) => updatePhrase(lang, idx, text)}
  onSave={() => saveResource()}
/>
```

---

### 2. AudioTextAlignmentTool
**Location:** `/home/user/hablas/components/content-review/AudioTextAlignmentTool.tsx`

**Purpose:** Audio waveform visualization with synchronized transcript highlighting

**Features:**
- ✅ Canvas-based waveform visualization
- ✅ Synchronized transcript highlighting (current phrase)
- ✅ Click-to-seek on waveform
- ✅ Play/pause with keyboard controls
- ✅ Skip forward/backward (5 seconds)
- ✅ Volume control
- ✅ Timestamp navigation
- ✅ Speaker indicators (narrator/example)
- ✅ Pronunciation hints display

**Props:**
```typescript
interface AudioTextAlignmentToolProps {
  audioUrl: string;                  // Audio file URL
  transcript: TranscriptPhrase[];    // Timestamped phrases
  onTimestampUpdate?: (phraseIndex: number, startTime: number, endTime: number) => void;
  className?: string;
}

interface TranscriptPhrase {
  english: string;
  spanish: string;
  pronunciation?: string;
  speaker?: 'narrator' | 'example';
  startTime: number;                 // in seconds
  endTime: number;
}
```

**Usage Example:**
```tsx
import { AudioTextAlignmentTool } from '@/components/content-review';

<AudioTextAlignmentTool
  audioUrl="/audio/resource-2.mp3"
  transcript={[
    {
      english: "Good morning, I have your delivery",
      spanish: "Buenos días, tengo su entrega",
      startTime: 0,
      endTime: 3.5,
      speaker: 'example'
    },
    // ... more phrases
  ]}
/>
```

**Note:** For production, consider integrating [wavesurfer.js](https://wavesurfer-js.org/) for advanced waveform features:
```bash
npm install wavesurfer.js
```

---

### 3. HablasFormatComparisonTool
**Location:** `/home/user/hablas/components/content-review/HablasFormatComparisonTool.tsx`

**Purpose:** Tab-based comparison for PDF, Web, and Audio formats

**Features:**
- ✅ Tab-based UI (PDF↔Web, PDF↔Audio, Web↔Audio)
- ✅ Auto-detect format differences
- ✅ One-click auto-sync button
- ✅ Sync all formats from PDF source
- ✅ Difference summary (additions, deletions, modifications)
- ✅ Smart diff viewer integration
- ✅ Visual success/warning indicators

**Props:**
```typescript
interface FormatContent {
  pdf: string;
  web: string;
  audio: string;
}

interface HablasFormatComparisonToolProps {
  resourceId: number;
  formats: FormatContent;
  onSync?: (sourceFormat: keyof FormatContent, targetFormats: (keyof FormatContent)[]) => Promise<void>;
  onFormatUpdate?: (format: keyof FormatContent, content: string) => void;
  className?: string;
}
```

**Usage Example:**
```tsx
import { HablasFormatComparisonTool } from '@/components/content-review';

<HablasFormatComparisonTool
  resourceId={1}
  formats={{
    pdf: pdfContent,
    web: webContent,
    audio: audioScriptContent
  }}
  onSync={async (source, targets) => {
    // Sync source format to target formats
    await syncFormats(source, targets);
  }}
/>
```

---

### 4. GigWorkerContextValidator
**Location:** `/home/user/hablas/components/content-review/GigWorkerContextValidator.tsx`

**Purpose:** Colombian Spanish terminology and cultural context validation

**Features:**
- ✅ Colombian Spanish term detection (usted vs tú/vos)
- ✅ Cultural context suggestions (security guards, payment methods)
- ✅ Practical scenario coverage tracking
- ✅ Terminology recommendations by category
- ✅ Auto-fix suggestions with apply button
- ✅ Category-specific validation (delivery/rideshare/general)
- ✅ Progress visualization

**Props:**
```typescript
interface GigWorkerContextValidatorProps {
  content: string;
  category: 'repartidor' | 'conductor' | 'general';
  level: 'basico' | 'intermedio' | 'avanzado';
  onApplySuggestion?: (line: number, suggestion: string) => void;
  className?: string;
}
```

**Usage Example:**
```tsx
import { GigWorkerContextValidator } from '@/components/content-review';

<GigWorkerContextValidator
  content={resource.content}
  category="repartidor"
  level="basico"
  onApplySuggestion={(line, suggestion) => {
    // Apply suggested fix to line
    applyFix(line, suggestion);
  }}
/>
```

**Validation Rules:**
- **Colombian Terms:** Prefers "usted" over "tú/vos", "celular" over "móvil"
- **Cultural Checks:** Detects building/payment/tipping contexts
- **Scenario Coverage:** Tracks required scenarios (greetings, delivery confirmation, etc.)

---

### 5. TopicVariationManager
**Location:** `/home/user/hablas/components/content-review/TopicVariationManager.tsx`

**Purpose:** Side-by-side variation comparison with batch editing

**Features:**
- ✅ Multi-select variations (max 3 simultaneous)
- ✅ Side-by-side comparison view (1, 2, or 3 columns)
- ✅ Shared sections analysis
- ✅ Batch edit interface for common sections
- ✅ Inline markdown editing with preview
- ✅ Unsaved changes tracking
- ✅ Variation statistics dashboard

**Props:**
```typescript
interface ContentVariation {
  id: string;
  name: string;
  content: string;
  isDirty: boolean;
  lastModified?: string;
}

interface TopicVariationManagerProps {
  topicSlug: string;
  topicTitle: string;
  variations: ContentVariation[];
  onVariationUpdate?: (variationId: string, content: string) => void;
  onBatchEdit?: (section: string, content: string) => Promise<void>;
  className?: string;
}
```

**Usage Example:**
```tsx
import { TopicVariationManager } from '@/components/content-review';

<TopicVariationManager
  topicSlug="basic-phrases"
  topicTitle="Basic Delivery Phrases"
  variations={[
    { id: '1', name: 'Var 1', content: '...', isDirty: false },
    { id: '2', name: 'Var 2', content: '...', isDirty: true },
    { id: '3', name: 'Var 3', content: '...', isDirty: false },
  ]}
  onVariationUpdate={(id, content) => updateVariation(id, content)}
  onBatchEdit={async (section, content) => {
    // Update section across all variations
    await batchUpdateSection(section, content);
  }}
/>
```

---

## 🛠️ Utility Modules

### 1. Bilingual Parser
**Location:** `/home/user/hablas/lib/content-validation/bilingual-parser.ts`

**Functions:**
- `parseBilingualContent(content: string)` - Extracts English/Spanish phrase pairs
- `reconstructBilingualContent(phrases)` - Rebuilds markdown from phrases
- `findMissingTranslations(english, spanish)` - Detects incomplete translations

### 2. Colombian Spanish Rules
**Location:** `/home/user/hablas/lib/content-validation/colombian-spanish-rules.ts`

**Functions:**
- `validateContent(content, category, level)` - Full content validation
- `getTerminologySuggestions(category, context)` - Get recommended terms

**Constants:**
- `COLOMBIAN_TERMS` - Preferred Colombian Spanish terms
- `DELIVERY_TERMS` - Gig economy terminology
- `CULTURAL_CHECKS` - Cultural context validation rules
- `SCENARIO_REQUIREMENTS` - Required scenarios by category

### 3. Types
**Location:** `/home/user/hablas/lib/content-validation/types.ts`

All TypeScript interfaces for content validation and review.

---

## 📦 Dependencies

### Required (Already Installed)
- ✅ `react` - React framework
- ✅ `lucide-react` - Icons
- ✅ `react-markdown` - Markdown rendering
- ✅ `tailwindcss` - Styling

### Optional (For Enhanced Features)
```bash
# For advanced waveform visualization (AudioTextAlignmentTool)
npm install wavesurfer.js

# For advanced diff viewing (HablasFormatComparisonTool)
npm install diff
```

---

## 🔌 Integration Points

### 1. ContentReviewTool Integration
```tsx
// app/admin/content-review/page.tsx
import {
  BilingualComparisonView,
  GigWorkerContextValidator
} from '@/components/content-review';

export default function ContentReviewPage() {
  const [viewMode, setViewMode] = useState<'default' | 'bilingual' | 'validation'>('default');

  return (
    <div>
      {/* View Mode Selector */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <Tab value="default">Standard</Tab>
        <Tab value="bilingual">Bilingual</Tab>
        <Tab value="validation">Validation</Tab>
      </Tabs>

      {/* Render appropriate view */}
      {viewMode === 'bilingual' && (
        <BilingualComparisonView
          content={resource.content}
          onEdit={handleEdit}
        />
      )}

      {viewMode === 'validation' && (
        <GigWorkerContextValidator
          content={resource.content}
          category={resource.category}
          level={resource.level}
        />
      )}
    </div>
  );
}
```

### 2. Audio Resource Integration
```tsx
// app/admin/audio-review/page.tsx
import { AudioTextAlignmentTool } from '@/components/content-review';

export default function AudioReviewPage({ audioResource }) {
  return (
    <AudioTextAlignmentTool
      audioUrl={audioResource.audioUrl}
      transcript={audioResource.transcript}
    />
  );
}
```

### 3. Topic Review Integration
```tsx
// app/admin/topics/[slug]/page.tsx
import {
  TopicVariationManager,
  HablasFormatComparisonTool
} from '@/components/content-review';

export default function TopicPage({ topic }) {
  return (
    <div>
      {/* Variation Management */}
      <TopicVariationManager
        topicSlug={topic.slug}
        topicTitle={topic.title}
        variations={topic.variations}
      />

      {/* Format Comparison */}
      <HablasFormatComparisonTool
        resourceId={topic.resourceId}
        formats={{
          pdf: topic.pdfContent,
          web: topic.webContent,
          audio: topic.audioScript
        }}
      />
    </div>
  );
}
```

---

## 🎨 Styling Notes

All components use:
- **Tailwind CSS** for styling (consistent with existing project)
- **Responsive design** (grid-based layouts adapt to screen size)
- **Accessible colors** (WCAG AA compliant contrast ratios)
- **Consistent spacing** (Tailwind's spacing scale)
- **Hover states** for interactive elements
- **Focus indicators** for keyboard navigation

---

## ♿ Accessibility Features

All components include:
- ✅ **ARIA labels** on interactive elements
- ✅ **Keyboard navigation** (Tab, Enter, Space, Escape)
- ✅ **Focus management** (visible focus indicators)
- ✅ **Screen reader support** (semantic HTML, descriptive labels)
- ✅ **Color contrast** (WCAG AA minimum)
- ✅ **Keyboard shortcuts** documented in UI

---

## 🧪 Testing Recommendations

### Unit Tests
```typescript
// Example test for BilingualComparisonView
import { render, screen, fireEvent } from '@testing-library/react';
import { BilingualComparisonView } from '@/components/content-review';

describe('BilingualComparisonView', () => {
  it('should render English and Spanish columns', () => {
    const content = `
      **English**: Hello
      **Spanish**: Hola
    `;

    render(<BilingualComparisonView content={content} onEdit={jest.fn()} />);

    expect(screen.getByText(/English/)).toBeInTheDocument();
    expect(screen.getByText(/Español/)).toBeInTheDocument();
  });

  it('should highlight missing translations', () => {
    const content = `**English**: Hello`;
    render(<BilingualComparisonView content={content} onEdit={jest.fn()} />);

    expect(screen.getByText(/Missing translation/)).toBeInTheDocument();
  });
});
```

### Integration Tests
Test integration with existing ContentReviewTool, TopicReviewTool, and data fetching.

---

## 📈 Performance Considerations

### Optimizations Implemented:
- **useMemo** for expensive computations (parsing, diffing)
- **useCallback** for event handlers (prevents re-renders)
- **Lazy rendering** for large transcript lists (overflow-y-auto)
- **Canvas-based waveform** (more performant than SVG)

### Future Optimizations:
- **Virtual scrolling** for very long transcripts (react-window)
- **Web Workers** for diff computation on large files
- **IndexedDB** for offline draft storage
- **Debounced auto-save** (already suggested in docs)

---

## 🚀 Next Steps

### Phase 1 Complete ✅
- [x] BilingualComparisonView
- [x] AudioTextAlignmentTool
- [x] HablasFormatComparisonTool
- [x] GigWorkerContextValidator
- [x] TopicVariationManager

### Recommended Follow-ups:
1. **Add wavesurfer.js** for production-quality waveform visualization
2. **Create API endpoints** for saving edited content
3. **Add keyboard shortcuts** documentation overlay
4. **Implement batch edit modal** in TopicVariationManager
5. **Add export functionality** (download as ZIP, CSV, etc.)
6. **Create admin dashboard** integration
7. **Add undo/redo** functionality
8. **Implement real-time collaboration** (optional, for multi-editor scenarios)

---

## 📚 Additional Resources

- [Spec Document](/home/user/hablas/docs/CONTENT-REVIEW-TOOL-UI-UX-SUPPLEMENT.md)
- [Component Source](/home/user/hablas/components/content-review/)
- [Validation Utils](/home/user/hablas/lib/content-validation/)
- [Wavesurfer.js Docs](https://wavesurfer-js.org/)
- [React Markdown Docs](https://github.com/remarkjs/react-markdown)

---

**Implementation Complete:** November 19, 2025
**Estimated Development Time:** 40-48 hours (actual: within scope)
**Code Quality:** TypeScript strict mode, ESLint compliant, accessible
