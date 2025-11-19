# UI/UX Improvements Implementation Checklist

**Based on:** Modern UI/UX Patterns Research (2024-2025)
**Project:** Hablas Content Review Tool
**Last Updated:** November 2025

---

## Priority 1: High Impact, Quick Wins (Weeks 1-2)

### Week 1

#### ✅ Command Palette (Cmd+K) - 3-4 days
**Files to create/modify:**
- [ ] `/components/ui/command.tsx` - shadcn/ui command component
- [ ] `/lib/hooks/useCommandPalette.ts` - Command palette logic
- [ ] `/components/CommandPalette.tsx` - Main component
- [ ] `/app/layout.tsx` - Add global keyboard listener

**Dependencies:**
```bash
npx shadcn-ui@latest add command
npm install cmdk
```

**Shortcuts to implement:**
- [ ] `Cmd+K` - Open command palette
- [ ] `G+D` - Go to dashboard
- [ ] `G+R` - Go to resources
- [ ] `G+T` - Go to topics

**Acceptance criteria:**
- [ ] Opens with Cmd+K
- [ ] Fuzzy search works
- [ ] Shows recent commands
- [ ] Keyboard navigation (↑↓↵)
- [ ] Groups commands by category

---

#### ✅ Word-Level Diff Highlighting - 2-3 days
**Files to modify:**
- [ ] `/components/content-review/DiffHighlighter.tsx`
- [ ] `/components/triple-comparison/components/DiffViewer.tsx`

**Dependencies:**
```bash
npm install react-diff-viewer-continued
# OR
npm install diff-match-patch
```

**Implementation:**
```typescript
// Replace current line-level diff with:
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

<ReactDiffViewer
  oldValue={original}
  newValue={edited}
  splitView={true}
  compareMethod={DiffMethod.WORDS}
  showDiffOnly={false}
/>
```

**Acceptance criteria:**
- [ ] Word-level highlighting works
- [ ] Character-level for small changes
- [ ] Split/unified view toggle
- [ ] Shows change statistics
- [ ] Performance OK for large documents

---

### Week 2

#### ✅ Keyboard Shortcuts - 2 days
**Files to create/modify:**
- [ ] `/lib/hooks/useKeyboardShortcuts.ts` - Global shortcut manager
- [ ] `/components/ShortcutHelp.tsx` - Help overlay (Cmd+/)
- [ ] Update all action buttons with tooltips

**Shortcuts to add:**
- [ ] `Cmd+S` - Save (already exists, improve feedback)
- [ ] `Cmd+/` - Show keyboard shortcuts help
- [ ] `Cmd+K` - Command palette
- [ ] `Cmd+B` - Toggle bold (if rich text editor)
- [ ] `Esc` - Close modals/dialogs

**Acceptance criteria:**
- [ ] All shortcuts work cross-platform (Cmd on Mac, Ctrl on Windows)
- [ ] Help overlay shows all shortcuts
- [ ] Shortcuts shown in tooltips
- [ ] No conflicts with browser shortcuts
- [ ] Works with screen readers

---

#### ✅ Optimistic UI Updates - 3 days
**Files to modify:**
- [ ] `/components/content-review/hooks/useAutoSave.ts`
- [ ] `/components/content-review/hooks/useContentManager.ts`
- [ ] `/components/content-review/ContentReviewTool.tsx`

**New features:**
- [ ] Immediate UI update on edit
- [ ] Save to IndexedDB for backup
- [ ] Rollback on server error
- [ ] Conflict detection
- [ ] Better save status indicators

**Implementation:**
```typescript
// Add to useContentManager
const [localContent, setLocalContent] = useState(initialContent);
const [serverContent, setServerContent] = useState(initialContent);
const [isSaving, setIsSaving] = useState(false);
const [error, setError] = useState<Error | null>(null);

async function save(content: string) {
  setLocalContent(content); // Optimistic update
  setIsSaving(true);

  // Backup to IndexedDB
  await saveToIndexedDB(content);

  try {
    await saveToServer(content);
    setServerContent(content);
  } catch (err) {
    setError(err);
    setLocalContent(serverContent); // Rollback
  } finally {
    setIsSaving(false);
  }
}
```

**Acceptance criteria:**
- [ ] UI updates immediately on edit
- [ ] IndexedDB backup works
- [ ] Rollback on error
- [ ] Clear error messaging
- [ ] Draft recovery on page reload

---

## Priority 2: Medium Impact, Moderate Effort (Weeks 3-4)

### Week 3

#### ✅ Mobile Touch Optimization - 5 days
**Files to modify:**
- [ ] `/tailwind.config.js` - Add touch target sizes
- [ ] All button components
- [ ] `/components/AdminNav.tsx` - Make mobile-friendly
- [ ] `/app/admin/page.tsx` - Responsive dashboard

**Changes:**
1. **Minimum touch targets:**
```css
/* Add to tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    }
  }
}
```

2. **Responsive tables:**
- [ ] Desktop: Table view
- [ ] Mobile: Card view
- [ ] Use `useMediaQuery` hook

3. **Bottom navigation:**
- [ ] Create `/components/MobileBottomNav.tsx`
- [ ] Show on mobile only
- [ ] Use safe-area-inset for notched phones

**Acceptance criteria:**
- [ ] All buttons minimum 44x44px
- [ ] Tables usable on mobile
- [ ] Bottom nav on mobile
- [ ] Swipe gestures for navigation
- [ ] Works on iPhone and Android

---

#### ✅ shadcn/ui Migration - 3-4 days
**Files to create/modify:**
- [ ] Install shadcn/ui CLI: `npx shadcn-ui@latest init`
- [ ] Add components: `npx shadcn-ui@latest add [component]`

**Components to migrate:**
1. **Buttons:**
   ```bash
   npx shadcn-ui@latest add button
   ```
   - [ ] Replace custom buttons with shadcn Button
   - [ ] Variants: default, destructive, outline, ghost

2. **Dialog/Modal:**
   ```bash
   npx shadcn-ui@latest add dialog
   ```
   - [ ] Replace custom modals

3. **Form Fields:**
   ```bash
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add label
   npx shadcn-ui@latest add textarea
   ```
   - [ ] Replace form components

4. **Toast Notifications:**
   ```bash
   npx shadcn-ui@latest add toast
   ```
   - [ ] Add toast system for feedback

5. **Dropdown Menu:**
   ```bash
   npx shadcn-ui@latest add dropdown-menu
   ```
   - [ ] Replace action menus

**Acceptance criteria:**
- [ ] All new components use shadcn/ui
- [ ] Dark mode toggle works
- [ ] ARIA attributes present
- [ ] Keyboard navigation works
- [ ] Consistent styling

---

### Week 4

#### ✅ Loading States & Skeletons - 2 days
**Files to create:**
- [ ] `/components/ui/skeleton.tsx`
- [ ] `/components/skeletons/ResourceCardSkeleton.tsx`
- [ ] `/components/skeletons/DashboardSkeleton.tsx`
- [ ] `/components/skeletons/EditorSkeleton.tsx`

**Install:**
```bash
npx shadcn-ui@latest add skeleton
```

**Usage:**
```typescript
// While loading
{isLoading ? (
  <ResourceCardSkeleton count={5} />
) : (
  <ResourceList resources={resources} />
)}
```

**Acceptance criteria:**
- [ ] Skeletons match final layout
- [ ] Smooth transition to real content
- [ ] Shimmer animation
- [ ] Used on all loading states

---

#### ✅ Improved Save Status - 1 day
**Files to modify:**
- [ ] `/components/content-review/ContentReviewTool.tsx`
- [ ] `/components/triple-comparison/components/TripleComparisonView.tsx`

**New status indicator:**
```typescript
type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error' | 'offline';

function SaveStatusBadge({ status, lastSaved }: Props) {
  return (
    <div className="save-status">
      {status === 'saved' && (
        <>
          <CheckCircle className="text-green-600" />
          <span>Saved {formatRelativeTime(lastSaved)}</span>
        </>
      )}
      {status === 'saving' && (
        <>
          <Loader2 className="animate-spin text-blue-600" />
          <span>Saving...</span>
        </>
      )}
      {/* ... other statuses */}
    </div>
  );
}
```

**Acceptance criteria:**
- [ ] Shows all status states
- [ ] Includes timestamp
- [ ] Retry button on error
- [ ] Offline detection

---

## Priority 3: Long-term, High Value (Month 2+)

### Month 2

#### ✅ Monaco Editor Integration - 1 week
**Dependencies:**
```bash
npm install @monaco-editor/react
```

**Files to create:**
- [ ] `/components/editors/MonacoEditor.tsx`
- [ ] `/components/editors/EditorSelector.tsx` - Choose editor type

**Implementation:**
```typescript
import Editor from '@monaco-editor/react';
import { lazy, Suspense } from 'react';

const MonacoEditor = lazy(() => import('./MonacoEditor'));

function CodeEditor() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <MonacoEditor
        defaultLanguage="markdown"
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          wordWrap: 'on',
        }}
      />
    </Suspense>
  );
}
```

**Acceptance criteria:**
- [ ] Lazy loaded (code split)
- [ ] Syntax highlighting works
- [ ] Minimap enabled
- [ ] Find/replace works
- [ ] Keyboard shortcuts work
- [ ] < 4MB added to bundle (check with bundle analyzer)

---

#### ✅ Virtual Scrolling for Large Lists - 3 days
**Dependencies:**
```bash
npm install @tanstack/react-virtual
```

**Files to modify:**
- [ ] `/app/admin/page.tsx` - Resource list

**Implementation:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualResourceList({ resources }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: resources.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      {/* Virtual items */}
    </div>
  );
}
```

**Acceptance criteria:**
- [ ] Handles 1000+ items smoothly
- [ ] Maintains scroll position
- [ ] Works with search/filter
- [ ] Smooth scrolling

---

### Month 3+ (Optional/Future)

#### ✅ Block-Based Editor (BlockNote) - 1-2 weeks
**Dependencies:**
```bash
npm install @blocknote/core @blocknote/react
```

**Features:**
- [ ] Slash commands (/)
- [ ] Drag-and-drop blocks
- [ ] Rich formatting
- [ ] Image/media insertion

**Acceptance criteria:**
- [ ] Slash menu works
- [ ] Blocks reorderable
- [ ] Export to markdown
- [ ] Mobile-friendly

---

#### ✅ Collaborative Features - 1 month+
**Major features:**
- [ ] Real-time presence (who's viewing)
- [ ] Live cursors
- [ ] Suggestion mode
- [ ] Inline comments
- [ ] WebSocket integration

**Technologies:**
- [ ] WebSockets (ws or Socket.io)
- [ ] Operational Transformation or CRDT
- [ ] Conflict resolution UI

**This is a large undertaking - consider if needed**

---

## Testing Checklist

### Accessibility Testing
- [ ] Keyboard navigation works throughout
- [ ] Screen reader tested (NVDA/VoiceOver)
- [ ] Color contrast meets WCAG AA (use axe DevTools)
- [ ] Focus indicators visible
- [ ] ARIA attributes correct

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Performance Testing
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size analyzed
- [ ] No layout shifts (CLS < 0.1)

### Manual Testing
- [ ] All keyboard shortcuts work
- [ ] Command palette complete
- [ ] Diff viewer accurate
- [ ] Mobile touch targets adequate
- [ ] Save/autosave reliable
- [ ] Error states handled

---

## Dependencies to Install

```bash
# UI Components
npx shadcn-ui@latest init
npx shadcn-ui@latest add command button dialog input label textarea toast dropdown-menu skeleton

# Diff/Editor
npm install react-diff-viewer-continued
npm install @monaco-editor/react

# Utilities
npm install cmdk
npm install @tanstack/react-virtual
npm install idb  # IndexedDB wrapper

# Optional (Phase 3+)
npm install @blocknote/core @blocknote/react
```

---

## Bundle Size Impact Estimates

| Feature | Size Impact | Mitigation |
|---------|------------|------------|
| Command Palette | +50KB | Already small, no action needed |
| shadcn/ui components | +100KB | Tree-shaking, only import needed |
| react-diff-viewer | +80KB | Code split if needed |
| Monaco Editor | +3.8MB | **Lazy load required** |
| BlockNote | +500KB | Lazy load recommended |
| Virtual scrolling | +20KB | Minimal impact |

**Total estimated increase:** ~200KB (without Monaco/BlockNote)
**With Monaco (lazy loaded):** Initial +200KB, +3.8MB when editor opened

---

## Migration Strategy

### Week-by-week Plan:

**Week 1:** Command palette + word-level diff
- Most visible improvements
- Low risk
- Quick wins

**Week 2:** Keyboard shortcuts + optimistic saves
- Improves workflow
- Better reliability
- Low to medium complexity

**Week 3:** Mobile optimization
- Broader accessibility
- Medium complexity
- Test on real devices

**Week 4:** shadcn/ui migration + loading states
- Foundation for future
- Incremental migration OK
- Can be done component by component

**Month 2:** Monaco + virtual scrolling
- Advanced features
- Higher complexity
- Lazy load to minimize impact

**Month 3+:** Optional enhancements
- Based on user feedback
- Nice-to-have vs. must-have

---

## Success Metrics

### Quantitative:
- [ ] Lighthouse score: 85+ → 95+
- [ ] Time to Interactive: 3s → 2s
- [ ] Keyboard users: Can complete all tasks
- [ ] Mobile bounce rate: Decrease by 20%
- [ ] Save errors: Decrease by 50%

### Qualitative:
- [ ] User feedback: "Feels faster"
- [ ] Admin users: "More efficient workflow"
- [ ] Mobile users: "Works well on phone"
- [ ] Reviewers: "Easier to spot changes"

---

## Rollback Plan

For each feature:
1. **Feature flag** - Enable/disable without deploy
2. **A/B test** - Gradual rollout
3. **Monitoring** - Track errors and performance
4. **Quick revert** - Git revert or feature flag off

Example:
```typescript
// Feature flag
const FEATURES = {
  commandPalette: process.env.NEXT_PUBLIC_FEATURE_COMMAND_PALETTE === 'true',
  monacoEditor: process.env.NEXT_PUBLIC_FEATURE_MONACO === 'true',
};

// Usage
{FEATURES.commandPalette && <CommandPalette />}
```

---

## Notes

- All PRs should include accessibility testing
- Mobile test on real devices before release
- Performance budget: No feature should add >500KB to initial bundle
- Document all keyboard shortcuts in help overlay
- Keep existing functionality working during migration

---

## Questions?

Review full research document at: `/docs/research/modern-ui-ux-patterns-2024-2025.md`
