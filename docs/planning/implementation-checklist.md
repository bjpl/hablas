# Implementation Checklist - Content Review Improvements

**Project:** Hablas Content Review Enhancement
**Version:** 1.0
**Last Updated:** 2025-11-19

This checklist provides actionable tasks for implementing the strategic improvement plan.

---

## 🚀 Pre-Implementation (Week 0)

### **Setup & Planning**
- [ ] Approve strategic plan with stakeholders
- [ ] Schedule kickoff meeting with development team
- [ ] Assign developers to phases (recommend 2 developers)
- [ ] Set up project board (GitHub Projects, Jira, etc.)
- [ ] Create feature flag system in codebase

### **Baseline Measurement**
- [ ] Survey current editors (NPS, pain points, workflows)
- [ ] Record baseline metrics:
  - [ ] Average time to review a resource
  - [ ] Average time for bulk edits
  - [ ] Current error rate (% requiring rework)
  - [ ] Current satisfaction score
- [ ] Set up analytics tracking (PostHog, Mixpanel, or custom)
- [ ] Document current workflows (video recording recommended)

### **Infrastructure**
- [ ] Ensure PostgreSQL can handle version storage (if Phase 4)
- [ ] Set up staging environment for testing
- [ ] Configure CI/CD for automated testing
- [ ] Set up monitoring (Sentry, LogRocket, etc.)

---

## 📦 Phase 1: Editor UX Polish (Weeks 1-2)

### **Week 1: Monaco Editor Foundation**

#### **Day 1-2: Installation & Configuration**
- [ ] Install dependencies:
  ```bash
  npm install @monaco-editor/react@4.6.0
  npm install --save-dev monaco-editor-webpack-plugin
  ```
- [ ] Configure Next.js for Monaco (webpack config)
- [ ] Test Monaco loads in development mode
- [ ] Set up code splitting (lazy load Monaco)
- [ ] Create fallback component (textarea) for unsupported browsers

#### **Day 3: Replace Textarea in EditPanel**
- [ ] Update `components/content-review/EditPanel.tsx`
- [ ] Wrap Monaco in `<Suspense>` with loading state
- [ ] Test basic editing functionality
- [ ] Ensure autosave still works with Monaco
- [ ] Add feature flag: `features.monacoEditor`

**Acceptance Criteria:**
- [ ] Monaco editor renders without errors
- [ ] Typing works smoothly (no lag)
- [ ] Autosave triggers after edits
- [ ] Bundle size increase: <2MB (lazy loaded)
- [ ] Lighthouse score: >90 (desktop), >80 (mobile)

#### **Day 4: Syntax Highlighting for Markdown**
- [ ] Configure Monaco language: `markdown`
- [ ] Test syntax highlighting (headings, lists, bold, links)
- [ ] Add custom highlighting for HTML tags in markdown
- [ ] Test with sample educational content

**Test Content:**
```markdown
# Lesson 1: Greetings

**Objective:** Learn basic greetings for rideshare drivers.

- Hello = Hola
- Good morning = Buenos días
- Thank you = Gracias

<audio src="lesson1.mp3" />
```

**Acceptance Criteria:**
- [ ] Headings highlighted in blue
- [ ] Bold/italic text styled correctly
- [ ] Lists indented properly
- [ ] HTML tags visible but distinct

#### **Day 5: IntelliSense Auto-Completion**
- [ ] Create custom completion provider
- [ ] Add common phrases (gig economy terms):
  - `rideshare`, `delivery`, `gig worker`, `DoorDash`, `Uber`
- [ ] Add snippet suggestions:
  - `audio` → `<audio src=""></audio>`
  - `lesson` → `# Lesson X: Title\n\n**Objective:**`
- [ ] Test auto-complete with Ctrl+Space

**Code:**
```typescript
monaco.languages.registerCompletionItemProvider('markdown', {
  provideCompletionItems: () => ({
    suggestions: [
      {
        label: 'rideshare',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: 'rideshare',
        documentation: 'Transportation service via app'
      },
      // ... more suggestions
    ]
  })
});
```

**Acceptance Criteria:**
- [ ] Auto-complete dropdown appears when typing
- [ ] Suggestions relevant to educational content
- [ ] Snippets expand correctly
- [ ] No performance lag

---

### **Week 2: Keyboard Shortcuts & Metrics**

#### **Day 6-7: Keyboard Shortcut Framework**
- [ ] Create `contexts/KeyboardShortcuts.tsx` context provider
- [ ] Implement shortcut registration system
- [ ] Add shortcuts:
  - [ ] `Ctrl+S` / `Cmd+S` → Save current
  - [ ] `Ctrl+Shift+S` → Save all
  - [ ] `Ctrl+D` → Toggle diff
  - [ ] `Ctrl+]` → Next resource tab
  - [ ] `Ctrl+[` → Previous resource tab
  - [ ] `Ctrl+K` → Command palette (Phase 3)
  - [ ] `Ctrl+F` → Find
  - [ ] `Ctrl+H` → Replace
- [ ] Handle cross-platform (Mac vs Windows)
- [ ] Prevent browser defaults (e.g., Ctrl+S save page)

**Code:**
```typescript
const shortcuts = {
  'mod+s': () => handleSave(),
  'mod+shift+s': () => handleSaveAll(),
  'mod+d': () => toggleDiff(),
  'mod+]': () => nextTab(),
  'mod+[': () => prevTab(),
};

useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    const key = `${e.ctrlKey || e.metaKey ? 'mod+' : ''}${e.key}`;
    if (shortcuts[key]) {
      e.preventDefault();
      shortcuts[key]();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

**Acceptance Criteria:**
- [ ] All shortcuts work on Mac (Cmd) and Windows (Ctrl)
- [ ] Shortcuts listed in help panel (Ctrl+/ to show)
- [ ] No conflicts with browser shortcuts
- [ ] Visual feedback when shortcut triggered

#### **Day 8-9: Word Count & Readability Metrics**
- [ ] Install dependencies:
  ```bash
  npm install reading-time
  npm install syllable  # For readability scoring
  ```
- [ ] Create `components/content-review/EditorMetrics.tsx`
- [ ] Calculate metrics:
  - [ ] Word count (total, selected)
  - [ ] Character count (with/without spaces)
  - [ ] Estimated reading time
  - [ ] Sentence count
  - [ ] Paragraph count
  - [ ] Flesch Reading Ease score (English only)
  - [ ] Language detection (Spanish vs English)
- [ ] Display in collapsible panel or footer
- [ ] Update metrics in real-time (debounced 500ms)

**Code:**
```typescript
import readingTime from 'reading-time';

const metrics = useMemo(() => {
  const words = content.split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  const charsNoSpaces = content.replace(/\s/g, '').length;
  const sentences = content.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = content.split(/\n\n+/).filter(Boolean).length;
  const { minutes } = readingTime(content);

  // Simple language detection
  const spanishWords = content.match(/\b(el|la|de|en|y|un|por|para)\b/gi)?.length || 0;
  const englishWords = content.match(/\b(the|a|an|in|on|and|for|to)\b/gi)?.length || 0;
  const language = spanishWords > englishWords ? 'es' : 'en';

  return {
    words,
    chars,
    charsNoSpaces,
    sentences,
    paragraphs,
    readingTime: Math.ceil(minutes),
    language
  };
}, [content]);
```

**Acceptance Criteria:**
- [ ] Metrics update smoothly (no jank)
- [ ] Accurate word count (handles markdown syntax)
- [ ] Reading time reasonable (200-250 wpm)
- [ ] Language detection 90%+ accurate
- [ ] Panel collapsible to save space

#### **Day 10: Live Markdown Preview**
- [ ] Create `components/content-review/MarkdownPreview.tsx`
- [ ] Use `react-markdown` (already installed ✅)
- [ ] Add split-pane layout (edit | preview)
- [ ] Implement synchronized scrolling
- [ ] Debounce preview updates (300ms)
- [ ] Support custom markdown extensions (audio tags)
- [ ] Add preview theme selector (match final output)

**Code:**
```typescript
import ReactMarkdown from 'react-markdown';

// Synchronized scrolling
const editorRef = useRef<HTMLDivElement>(null);
const previewRef = useRef<HTMLDivElement>(null);

const handleEditorScroll = () => {
  if (!editorRef.current || !previewRef.current) return;
  const scrollPercentage =
    editorRef.current.scrollTop /
    (editorRef.current.scrollHeight - editorRef.current.clientHeight);
  previewRef.current.scrollTop =
    scrollPercentage *
    (previewRef.current.scrollHeight - previewRef.current.clientHeight);
};
```

**Acceptance Criteria:**
- [ ] Preview renders markdown correctly
- [ ] Scrolling synchronized (±5% tolerance)
- [ ] Updates smoothly (debounced, no lag)
- [ ] Supports headings, lists, bold, links, images
- [ ] Custom audio tags render as player
- [ ] Toggle preview on/off (Ctrl+P)

---

### **Phase 1 Testing & Launch**

#### **Integration Testing**
- [ ] Monaco editor loads in <2 seconds
- [ ] Keyboard shortcuts work in all browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Metrics calculation accurate across 10+ test documents
- [ ] Preview syncs correctly for long documents (5000+ words)
- [ ] No accessibility regressions (run `jest-axe`)

#### **Performance Testing**
- [ ] Lighthouse score: Desktop >90, Mobile >80
- [ ] Bundle size (Monaco lazy loaded): Initial <500KB
- [ ] Time to Interactive: <3s on 3G
- [ ] Memory usage: <100MB for typical document

#### **User Acceptance Testing**
- [ ] 5+ editors test new features
- [ ] Collect feedback via survey
- [ ] NPS score: 8+/10 target
- [ ] Adoption rate: 80%+ prefer Monaco

#### **Launch Checklist**
- [ ] Feature flag enabled for 100% of users
- [ ] Monitoring dashboards live (errors, performance)
- [ ] Documentation updated (keyboard shortcuts, metrics)
- [ ] Announcement to editors (email, Slack)
- [ ] Feedback channel open (Slack, form)

---

## 🔍 Phase 2: Advanced Diff & Comparison (Weeks 3-4)

### **Week 3: Inline Diff Editing**

#### **Day 11-12: Integrate react-diff-viewer-continued**
- [ ] Install dependency:
  ```bash
  npm install react-diff-viewer-continued
  ```
- [ ] Update `components/content-review/DiffHighlighter.tsx`
- [ ] Replace line-by-line diff with `ReactDiffViewer`
- [ ] Configure split-view mode
- [ ] Style with Tailwind to match existing design

**Code:**
```typescript
import ReactDiffViewer from 'react-diff-viewer-continued';

<ReactDiffViewer
  oldValue={original}
  newValue={edited}
  splitView={true}
  useDarkTheme={false}
  showDiffOnly={false}
  leftTitle="Original"
  rightTitle="Edited"
  styles={{
    variables: {
      light: {
        diffViewerBackground: '#fff',
        addedBackground: '#e6ffed',
        removedBackground: '#ffeef0',
      }
    }
  }}
/>
```

**Acceptance Criteria:**
- [ ] Diff renders for documents up to 10,000 lines
- [ ] Performance: <500ms to render diff
- [ ] Colors match design system (green/red)
- [ ] Line numbers visible

#### **Day 13-14: Accept/Reject Buttons**
- [ ] Add "Accept" / "Reject" buttons per change
- [ ] Implement change application logic
- [ ] Update edited content when accepting
- [ ] Add "Accept All" / "Reject All" batch operations
- [ ] Show confirmation before batch operations

**State Management:**
```typescript
interface DiffHunk {
  lineNumber: number;
  type: 'added' | 'removed' | 'modified';
  oldContent: string;
  newContent: string;
  accepted?: boolean;
}

const [hunks, setHunks] = useState<DiffHunk[]>([]);

const acceptChange = (lineNumber: number) => {
  setHunks(prev => prev.map(h =>
    h.lineNumber === lineNumber ? { ...h, accepted: true } : h
  ));
  // Apply change to edited content
  updateContent(applyHunk(content, hunk));
};
```

**Acceptance Criteria:**
- [ ] Individual accept/reject works
- [ ] Batch operations confirm before applying
- [ ] Content updates immediately
- [ ] Visual feedback (green checkmark on accept)
- [ ] Undo capability (Ctrl+Z)

#### **Day 15: Keyboard Shortcuts for Diff**
- [ ] Add shortcuts:
  - [ ] `a` → Accept current change
  - [ ] `r` → Reject current change
  - [ ] `j` → Next change
  - [ ] `k` → Previous change
  - [ ] `Shift+A` → Accept all
  - [ ] `Shift+R` → Reject all
- [ ] Highlight current change with border
- [ ] Show shortcut hints in UI

**Acceptance Criteria:**
- [ ] Shortcuts work when diff view focused
- [ ] Visual indicator for current change
- [ ] Shortcut hints visible on hover

---

### **Week 4: Granular Diffs & Comparison**

#### **Day 16-17: Word-Level & Char-Level Diff**
- [ ] Install dependency:
  ```bash
  npm install diff-match-patch
  ```
- [ ] Create `utils/granularDiff.ts`
- [ ] Implement word-level diff algorithm
- [ ] Implement character-level diff for small changes
- [ ] Create custom diff renderer for inline display

**Code:**
```typescript
import DiffMatchPatch from 'diff-match-patch';

const dmp = new DiffMatchPatch();

function wordLevelDiff(text1: string, text2: string) {
  const diffs = dmp.diff_main(text1, text2);
  dmp.diff_cleanupSemantic(diffs);
  return diffs;
}

function renderInlineDiff(diffs: Diff[]) {
  return diffs.map(([type, text], idx) => {
    if (type === 1) {
      return <span key={idx} className="bg-green-200">{text}</span>;
    } else if (type === -1) {
      return <span key={idx} className="bg-red-200 line-through">{text}</span>;
    } else {
      return <span key={idx}>{text}</span>;
    }
  });
}
```

**Acceptance Criteria:**
- [ ] Word-level diff highlights individual words
- [ ] Character-level diff for changes <10 chars
- [ ] Visual distinction (green add, red remove)
- [ ] Readable formatting (not overwhelming)

#### **Day 18: Update DiffHighlighter Component**
- [ ] Add toggle: Line-level vs Word-level diff
- [ ] Update UI with new granular diff
- [ ] Test with various content types
- [ ] Ensure performance (memoization, virtualization)

**Acceptance Criteria:**
- [ ] Toggle between diff modes works
- [ ] Word-level diff more accurate than line-level
- [ ] Performance: <1s for 1000-line documents

#### **Day 19-20: Enhanced TripleComparisonView**
- [ ] Update `TripleComparisonView.tsx` with new diff
- [ ] Add sync preview before applying
- [ ] Improve panel selection UI (checkboxes → radio?)
- [ ] Add "Copy to All" button for syncing

**Acceptance Criteria:**
- [ ] Triple comparison uses granular diff
- [ ] Sync preview shows what will change
- [ ] One-click sync to all panels
- [ ] No data loss during sync

---

### **Phase 2 Testing & Launch**

#### **Integration Testing**
- [ ] Inline diff works for 100+ test cases
- [ ] Word-level diff accuracy: 95%+
- [ ] Accept/reject updates content correctly
- [ ] Keyboard shortcuts functional
- [ ] Triple comparison sync verified

#### **Performance Testing**
- [ ] Diff calculation: <1s for 10,000-line docs
- [ ] UI rendering: 60 FPS during scrolling
- [ ] Memory usage: <200MB for large diffs

#### **User Testing**
- [ ] 5+ editors test inline diff
- [ ] Measure review speed improvement (target: +50%)
- [ ] NPS for diff features: 8+/10

#### **Launch**
- [ ] Feature flag: `features.inlineDiff` enabled
- [ ] Documentation: Inline diff guide
- [ ] Training video: 2-minute demo
- [ ] Announcement with GIF/video

---

## ⚙️ Phase 3: Workflow Automation (Weeks 5-6)

### **Week 5: Command Palette & Batch Operations**

#### **Day 21-22: Command Palette (Cmd+K)**
- [ ] Install dependency:
  ```bash
  npm install cmdk
  ```
- [ ] Create `components/content-review/CommandPalette.tsx`
- [ ] Implement fuzzy search
- [ ] Add commands:
  - [ ] Save All Resources
  - [ ] Save Current Resource
  - [ ] Sync Web to Downloadable
  - [ ] Sync Downloadable to Web
  - [ ] Toggle Diff View
  - [ ] Toggle Preview
  - [ ] Run Spell Check
  - [ ] Export Diff Report
  - [ ] Next Resource Tab
  - [ ] Previous Resource Tab
- [ ] Keyboard shortcut: `Ctrl+K` / `Cmd+K`
- [ ] Show recent commands

**Code:**
```typescript
import { Command } from 'cmdk';

function CommandPalette({ open, onClose }: Props) {
  return (
    <Command.Dialog open={open} onOpenChange={onClose}>
      <Command.Input placeholder="Type a command..." />
      <Command.List>
        <Command.Group heading="Actions">
          <Command.Item onSelect={saveAll}>
            <Save className="mr-2" />
            Save All Resources
            <kbd className="ml-auto">⌘⇧S</kbd>
          </Command.Item>
          <Command.Item onSelect={toggleDiff}>
            <GitCompare className="mr-2" />
            Toggle Diff View
            <kbd className="ml-auto">⌘D</kbd>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
```

**Acceptance Criteria:**
- [ ] Opens with Cmd+K
- [ ] Fuzzy search works ("sv al" → "Save All")
- [ ] Recently used commands at top
- [ ] Keyboard navigation (arrows, Enter)
- [ ] Command execution triggers correctly
- [ ] Response time: <100ms

#### **Day 23-24: Wire Up Command Actions**
- [ ] Connect commands to existing functions
- [ ] Add new commands for Phase 3 features
- [ ] Implement command history (localStorage)
- [ ] Add command aliases ("sync" → "Sync Web to Downloadable")

**Acceptance Criteria:**
- [ ] All commands functional
- [ ] Aliases work
- [ ] History persists across sessions

#### **Day 25-26: Batch Find & Replace Engine**
- [ ] Create `components/content-review/BatchReplace.tsx`
- [ ] Implement regex find functionality
- [ ] Add scope selector (current, all, selected tabs)
- [ ] Build preview panel showing all matches
- [ ] Add replace confirmation step

**UI Flow:**
1. Ctrl+Shift+H → Opens batch replace panel
2. Find: `\b(color)\b`, Scope: All resources
3. Preview: 23 matches across 5 resources
4. Replace with: `colour`
5. [Preview Changes] → Shows diff
6. [Apply to All] → Bulk update

**Code:**
```typescript
interface Match {
  resourceId: string;
  resourceTitle: string;
  lineNumber: number;
  matchText: string;
  context: string; // Surrounding text
}

const findMatches = (pattern: string, scope: string[]): Match[] => {
  const regex = new RegExp(pattern, 'gi');
  const matches: Match[] = [];

  scope.forEach(resourceId => {
    const content = getResourceContent(resourceId);
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const match = line.match(regex);
      if (match) {
        matches.push({
          resourceId,
          resourceTitle: getResourceTitle(resourceId),
          lineNumber: idx + 1,
          matchText: match[0],
          context: line
        });
      }
    });
  });

  return matches;
};
```

**Acceptance Criteria:**
- [ ] Regex patterns work (including capture groups)
- [ ] Case-sensitive toggle functional
- [ ] Whole-word matching option
- [ ] Preview shows all matches with context
- [ ] Replace updates all resources atomically
- [ ] Undo capability (restore all on error)

#### **Day 27: Replace Preview & Confirmation**
- [ ] Build preview diff for each match
- [ ] Add "Review Each" mode (step through matches)
- [ ] Implement "Replace All" with progress indicator
- [ ] Add undo history (last 10 operations)

**Acceptance Criteria:**
- [ ] Preview accurate for all matches
- [ ] Review mode allows accept/reject per match
- [ ] Progress bar for batch operations
- [ ] Undo restores all changed resources

---

### **Week 6: Spell Check & AI Features**

#### **Day 28-29: Spell Check Integration**
- [ ] Evaluate options:
  - Browser native (`<textarea spellcheck>`)
  - `@textlint/kernel` (advanced)
  - Anthropic Claude API (AI-powered)
- [ ] Choose: Browser native + custom dictionary
- [ ] Create custom dictionary for gig economy:
  - `rideshare`, `gig`, `DoorDash`, `Uber`, `Lyft`, `deliveries`, `app-based`, `hablas`
- [ ] Add underline styling (red wavy for spelling, blue for grammar)
- [ ] Implement right-click suggestions

**Code:**
```typescript
// Monaco spell check decoration
const decorations = [];
const spellErrors = checkSpelling(content);

spellErrors.forEach(error => {
  decorations.push({
    range: new monaco.Range(
      error.line, error.startColumn,
      error.line, error.endColumn
    ),
    options: {
      inlineClassName: 'spell-error', // CSS: wavy red underline
      hoverMessage: { value: `Spelling: Did you mean "${error.suggestions[0]}"?` }
    }
  });
});

editor.deltaDecorations([], decorations);
```

**Acceptance Criteria:**
- [ ] Spelling errors underlined in real-time
- [ ] Right-click shows suggestions
- [ ] Custom dictionary works (no false positives for gig terms)
- [ ] Bilingual support (Spanish + English)
- [ ] "Add to Dictionary" option functional

#### **Day 30: Custom Dictionary & Grammar**
- [ ] Implement "Add to Dictionary" feature
- [ ] Store custom words in localStorage
- [ ] Add basic grammar checks:
  - Double spaces
  - Capitalization after periods
  - Common mistakes (it's vs its, their vs there)
- [ ] Grammar errors styled with blue underline

**Acceptance Criteria:**
- [ ] Custom dictionary persists across sessions
- [ ] Grammar checks catch 80%+ common errors
- [ ] No performance impact (<50ms per check)

#### **Day 31-32: AI Translation Suggestions (Optional)**
- [ ] Create `utils/aiTranslation.ts`
- [ ] Use existing `@anthropic-ai/sdk` (already installed ✅)
- [ ] Implement translation suggestion API
- [ ] Add inline suggestion UI (like GitHub Copilot)
- [ ] Cache translations to reduce API costs

**Code:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

async function suggestTranslation(
  text: string,
  sourceLang: 'en' | 'es',
  targetLang: 'en' | 'es'
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Translate this ${sourceLang} text to ${targetLang} for gig economy workers learning English:\n\n${text}\n\nProvide only the translation, no explanation.`
    }]
  });

  return message.content[0].text;
}
```

**Acceptance Criteria:**
- [ ] Translation suggestions appear inline
- [ ] One-click acceptance
- [ ] Confidence scores displayed
- [ ] API costs <$50/month (with caching)
- [ ] Response time: <2s

#### **Day 33: Testing & Bug Fixes**
- [ ] Integration testing for all Phase 3 features
- [ ] Performance testing (command palette <100ms)
- [ ] User testing with 5+ editors
- [ ] Bug fixes and polish

---

### **Phase 3 Testing & Launch**

#### **Integration Testing**
- [ ] Command palette functional in all views
- [ ] Batch replace works for 100+ resources
- [ ] Spell check catches 90%+ errors
- [ ] AI translations accurate (90%+ acceptance rate)

#### **Performance Testing**
- [ ] Command palette: <100ms response
- [ ] Batch find: <5s for 1000 resources
- [ ] Spell check: <50ms per keystroke
- [ ] AI translation: <2s per request

#### **User Testing**
- [ ] Measure workflow speed improvement (+25% target)
- [ ] NPS for automation features: 8+/10
- [ ] Adoption: 60%+ use command palette

#### **Launch**
- [ ] Feature flags enabled
- [ ] Documentation: Command palette guide
- [ ] Video tutorial: Batch find & replace
- [ ] Announcement with use cases

---

## 🤝 Phase 4: Collaboration & Approval (Weeks 7-8)

*This phase is P2 (Medium Priority). Implement after Phases 1-3 if timeline/budget allows.*

### **Week 7: Comments & Annotations**

#### **Database Schema**
- [ ] Create migration: `resource_comments` table
- [ ] Add columns: id, resource_id, parent_comment_id, author_id, content, line_number, resolved, created_at
- [ ] Create indexes: resource_id, created_at
- [ ] Test migration in staging

#### **API Endpoints**
- [ ] `POST /api/resources/:id/comments` - Create comment
- [ ] `GET /api/resources/:id/comments` - List comments
- [ ] `PATCH /api/comments/:id` - Update comment (resolve, edit)
- [ ] `DELETE /api/comments/:id` - Delete comment

#### **UI Components**
- [ ] Create `CommentThread.tsx` component
- [ ] Build comment creation modal
- [ ] Implement @mentions (autocomplete users)
- [ ] Add resolve/unresolve button
- [ ] Show unresolved count badge

**Acceptance Criteria:**
- [ ] Comments appear inline at correct line
- [ ] Threading works (replies nest properly)
- [ ] @mentions notify users (email)
- [ ] Resolve status updates in real-time

---

### **Week 8: Approval Workflow & Version History**

#### **Workflow States**
- [ ] Database migration: Add `status` column to `resources` table
  - States: `draft`, `in_review`, `approved`, `published`
- [ ] API endpoints for state transitions
- [ ] UI for state badges and transition buttons
- [ ] Email notifications on state changes

#### **Version History**
- [ ] Database migration: `content_versions` table
- [ ] Auto-commit on each save
- [ ] Manual commit with message option
- [ ] Version timeline UI
- [ ] Restore previous version functionality

**Acceptance Criteria:**
- [ ] All state transitions logged
- [ ] Version history stores all changes
- [ ] Restore works without data loss
- [ ] Timeline UI intuitive

---

## 📱 Phase 5: Mobile Optimization (Month 2+)

*This phase is P3 (Low Priority). Defer to Month 2+ based on demand.*

### **Responsive Layout**
- [ ] Update layouts with mobile-first design
- [ ] Collapsible panels for small screens
- [ ] Touch-friendly buttons (min 44px)
- [ ] Test on iOS Safari, Android Chrome

### **Mobile-Specific Features**
- [ ] Read-only review mode
- [ ] Quick approve/reject buttons
- [ ] Comment addition (simplified)
- [ ] Swipe gestures (next/prev resource)

**Acceptance Criteria:**
- [ ] 80%+ of tasks functional on mobile
- [ ] Usability score: 4+/5 stars

---

## 📊 Post-Launch Monitoring (Ongoing)

### **Week 1 After Launch**
- [ ] Monitor error rates (target: <0.1%)
- [ ] Track adoption metrics (feature flags analytics)
- [ ] Collect user feedback (survey, Slack)
- [ ] Hotfix critical bugs within 24 hours

### **Week 2-4 After Launch**
- [ ] Measure time savings (before/after comparison)
- [ ] Calculate ROI (time saved × hourly rate)
- [ ] Conduct NPS survey (target: 9+/10)
- [ ] Iterate based on feedback

### **Month 2-3**
- [ ] Publish case study (metrics, testimonials)
- [ ] Plan Phase 4 (if approved)
- [ ] Optimize performance based on analytics
- [ ] Add requested features to backlog

---

## 🎓 Training & Documentation

### **User Training**
- [ ] Create video tutorials (5-10 minutes each):
  - [ ] Monaco editor basics
  - [ ] Keyboard shortcuts cheat sheet
  - [ ] Inline diff editing workflow
  - [ ] Command palette power-user guide
  - [ ] Batch find & replace tutorial
- [ ] Schedule live training sessions (1 hour)
- [ ] Create interactive onboarding tour (product tour library)

### **Developer Documentation**
- [ ] Architecture diagram (components, data flow)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Code comments for complex logic
- [ ] Testing guidelines
- [ ] Deployment runbook

---

## ✅ Definition of Done

**For Each Feature:**
- [ ] Code implemented and reviewed (PR approved)
- [ ] Unit tests written (80%+ coverage)
- [ ] Integration tests passing
- [ ] Accessibility tested (jest-axe, manual keyboard nav)
- [ ] Performance tested (Lighthouse, profiling)
- [ ] Documentation updated (user guide, API docs)
- [ ] Feature flag configured
- [ ] Deployed to staging and tested
- [ ] Stakeholder demo completed
- [ ] Deployed to production

**For Each Phase:**
- [ ] All features meet DoD
- [ ] User testing completed (5+ users)
- [ ] NPS survey conducted
- [ ] Metrics baseline vs target compared
- [ ] Retrospective held (team feedback)
- [ ] Next phase planned (if applicable)

---

## 🚨 Rollback Procedures

### **If Critical Bug Discovered:**
1. **Immediate:** Disable feature flag (0% rollout)
2. **Within 1 hour:** Hotfix deployed or revert commit
3. **Within 24 hours:** Root cause analysis, fix merged
4. **Within 48 hours:** Re-enable with monitoring

### **If Performance Degrades:**
1. Check monitoring dashboards (Sentry, Lighthouse)
2. Profile slow code paths (React DevTools, Chrome Profiler)
3. Optimize or roll back
4. Test fix in staging before re-deploy

### **If User Adoption Low (<50%):**
1. Conduct user interviews (why not adopted?)
2. Improve onboarding/training
3. Simplify UI if too complex
4. Consider UX redesign

---

**End of Implementation Checklist**

*Refer to the full strategic plan for context and rationale.*
