# Hablas Content Review Tool - Strategic Improvement Plan

**Document Version:** 1.0
**Date:** 2025-11-19
**Status:** Strategic Planning Phase
**Target Users:** Admin editors reviewing educational content (Spanish/English)

---

## Executive Summary

This strategic plan outlines a comprehensive improvement roadmap for the Hablas content review system, focusing on enhancing editor experience, workflow efficiency, and collaboration capabilities. The plan is structured across 5 implementation phases over 8 weeks, with prioritized features based on impact and development effort.

**Key Metrics to Improve:**
- **Editor productivity:** Target 40% reduction in review time per resource
- **Error reduction:** Target 60% decrease in content errors via automated checks
- **User satisfaction:** Target NPS score increase from baseline to 8+/10
- **Mobile access:** Enable 80% of review tasks on mobile devices

---

## 1. Current State Analysis

### 1.1 Existing Components

#### **ContentReviewTool** (`/components/content-review/ContentReviewTool.tsx`)
- ✅ Side-by-side comparison view (original vs edited)
- ✅ Auto-save functionality (2-second delay)
- ✅ Manual save with visual feedback
- ✅ Diff highlighting toggle
- ✅ Status indicators (saving, success, error)
- ✅ Metadata display (category, last modified)
- ⚠️ **Limitations:** Basic textarea editing, no syntax highlighting, limited keyboard shortcuts

#### **TopicReviewTool** (`/components/content-review/TopicReviewTool.tsx`)
- ✅ Tab-based navigation for resource variations
- ✅ Batch save for multiple resources
- ✅ Keyboard shortcut (Ctrl+S)
- ✅ Unsaved changes tracking with visual badges
- ✅ Before-unload warning for unsaved work
- ⚠️ **Limitations:** No version history, no collaboration features, no advanced diff

#### **TripleComparisonView** (`/components/triple-comparison/components/TripleComparisonView.tsx`)
- ✅ Three-panel comparison (downloadable PDF, web, audio transcript)
- ✅ Selective panel comparison (2 at a time)
- ✅ Content synchronization controls
- ✅ DiffViewer integration
- ⚠️ **Limitations:** No inline editing in diff view, no audio playback controls, no merge conflict resolution

### 1.2 Technology Stack
- **Frontend:** React 18.3, Next.js 15.0, TypeScript 5.6
- **Styling:** Tailwind CSS 3.4
- **Icons:** Lucide React 0.548
- **Markdown:** react-markdown 10.1
- **State Management:** React hooks (useState, useCallback)
- **Testing:** Jest 30.2, React Testing Library 16.3

### 1.3 Critical Gaps Identified

| Gap Area | Impact | Priority |
|----------|--------|----------|
| **No advanced code editor** (Monaco) | High - Poor editing UX | P0 |
| **Limited keyboard shortcuts** | High - Slow workflow | P0 |
| **No inline diff editing** | High - Inefficient change review | P1 |
| **No spell check/grammar** | Medium - Quality issues | P1 |
| **No collaboration features** | Medium - Team inefficiency | P2 |
| **No version control** | Medium - Audit trail missing | P2 |
| **Limited mobile support** | Low - Desktop-only workflow | P3 |

---

## 2. Strategic Planning Areas

### 2.1 Editor Experience Enhancement (P0-P1)

#### **2.1.1 Monaco Editor Integration (P0)**
**Objective:** Replace basic textarea with VS Code-powered editor

**Features:**
- ✨ Syntax highlighting for Markdown, HTML, JSON
- ✨ IntelliSense auto-completion (suggest common phrases, tags)
- ✨ Multi-cursor editing (Alt+Click)
- ✨ Code folding for long documents
- ✨ Minimap for navigation
- ✨ Find & replace with regex support
- ✨ Bracket/quote auto-closing
- ✨ Customizable themes (light/dark/high-contrast)

**Implementation:**
```typescript
// Package: @monaco-editor/react (4.6.0)
import Editor from '@monaco-editor/react';

<Editor
  height="600px"
  defaultLanguage="markdown"
  value={content}
  onChange={handleChange}
  options={{
    minimap: { enabled: true },
    wordWrap: 'on',
    quickSuggestions: true,
    autoClosingBrackets: 'always',
    formatOnPaste: true,
    suggest: {
      snippetsPreventQuickSuggestions: false
    }
  }}
/>
```

**Development Estimate:** 3 days
**User Time Savings:** ~30% faster editing

#### **2.1.2 Enhanced Keyboard Shortcuts (P0)**
**Objective:** Power-user keyboard navigation

**Shortcuts:**
| Action | Shortcut | Impact |
|--------|----------|--------|
| Save current | `Ctrl+S` / `Cmd+S` | ✅ Exists |
| Save all | `Ctrl+Shift+S` | 🆕 High |
| Toggle diff | `Ctrl+D` | 🆕 High |
| Next resource | `Ctrl+]` | 🆕 Medium |
| Previous resource | `Ctrl+[` | 🆕 Medium |
| Command palette | `Ctrl+K` | 🆕 High |
| Find | `Ctrl+F` | 🆕 High |
| Replace | `Ctrl+H` | 🆕 Medium |
| Undo | `Ctrl+Z` | 🆕 High |
| Redo | `Ctrl+Shift+Z` | 🆕 High |
| Toggle preview | `Ctrl+P` | 🆕 Medium |

**Development Estimate:** 2 days
**User Time Savings:** ~15% faster navigation

#### **2.1.3 Word Count & Readability Metrics (P1)**
**Objective:** Content quality insights

**Metrics to Display:**
- Word count (total, selected)
- Character count (with/without spaces)
- Estimated reading time
- Sentence count
- Paragraph count
- Readability score (Flesch Reading Ease for English)
- Language detection confidence (Spanish vs English)

**Implementation:**
```typescript
// Package: reading-time, readability-metrics
import readingTime from 'reading-time';
import { fleschReadingEase } from 'readability-metrics';

const metrics = {
  words: content.split(/\s+/).length,
  chars: content.length,
  readingTime: readingTime(content).minutes,
  readability: fleschReadingEase(content),
  sentences: content.split(/[.!?]+/).length
};
```

**Development Estimate:** 2 days
**User Benefit:** Quality assurance, consistency checks

#### **2.1.4 Live Markdown Preview (P1)**
**Objective:** Real-time rendered preview

**Features:**
- Split-pane view (edit | preview)
- Synchronized scrolling
- Hot-reload on edit (debounced 300ms)
- Support for custom markdown extensions
- Preview themes matching final output

**Development Estimate:** 3 days
**User Benefit:** Visual feedback, fewer formatting errors

---

### 2.2 Comparison & Diff Improvements (P1-P2)

#### **2.2.1 Inline Diff Editing (P1) - GitHub-Style**
**Objective:** Edit directly in diff view with accept/reject

**Features:**
- ✨ Inline "Accept" / "Reject" buttons per change
- ✨ Edit individual hunks in-place
- ✨ Visual indicators (green/red backgrounds)
- ✨ "Accept All" / "Reject All" batch operations
- ✨ Conflict markers for manual resolution
- ✨ Keyboard shortcuts (`a` = accept, `r` = reject)

**Implementation:**
```typescript
// Package: react-diff-viewer-continued
import ReactDiffViewer from 'react-diff-viewer-continued';

<ReactDiffViewer
  oldValue={original}
  newValue={edited}
  splitView={true}
  useDarkTheme={false}
  showDiffOnly={false}
  renderContent={(str) => <EditableContent content={str} />}
  onLineNumberClick={(line) => handleInlineEdit(line)}
/>
```

**Development Estimate:** 5 days
**User Time Savings:** ~50% faster change review

#### **2.2.2 Word-Level & Character-Level Diffs (P1)**
**Objective:** Granular change detection

**Current:** Line-level diffs only
**Proposed:** Highlight individual word/character changes within lines

**Implementation:**
```typescript
// Package: diff-match-patch
import DiffMatchPatch from 'diff-match-patch';

const dmp = new DiffMatchPatch();
const diffs = dmp.diff_main(original, edited);
dmp.diff_cleanupSemantic(diffs); // Optimize for readability

// Render inline word changes
diffs.map(([type, text]) => (
  <span className={type === 1 ? 'bg-green-200' : type === -1 ? 'bg-red-200' : ''}>
    {text}
  </span>
));
```

**Development Estimate:** 3 days
**User Benefit:** Precise change identification

#### **2.2.3 Three-Way Merge for Conflicts (P2)**
**Objective:** Resolve conflicting edits from multiple sources

**Use Case:** When downloadable, web, and audio transcripts diverge

**Features:**
- Three-column view (Version A | Base | Version B)
- Automatic merge where possible
- Manual conflict resolution UI
- "Take Left" / "Take Right" / "Take Both" buttons
- Preview merged result before applying

**Development Estimate:** 7 days
**User Benefit:** Handle complex editing scenarios

#### **2.2.4 Syntax-Aware Diffing for Markdown (P2)**
**Objective:** Ignore formatting-only changes

**Features:**
- Ignore whitespace-only changes (configurable)
- Detect structural changes (headings, lists) vs content
- Smart indentation normalization
- Semantic equivalence detection (e.g., `**bold**` = `<strong>bold</strong>`)

**Development Estimate:** 4 days
**User Benefit:** Focus on meaningful edits

---

### 2.3 Workflow Automation (P1-P2)

#### **2.3.1 Command Palette (P1) - Cmd+K Interface**
**Objective:** Quick access to all actions

**Features:**
- ✨ Fuzzy search for commands
- ✨ Recently used commands
- ✨ Keyboard-first navigation
- ✨ Organized categories (Edit, Navigate, Review, Tools)
- ✨ Custom command aliases
- ✨ Execution history

**Commands:**
- "Save All Resources"
- "Compare Selected Panels"
- "Sync Web to Downloadable"
- "Run Spell Check"
- "Export Diff Report"
- "Toggle Preview Mode"
- "Find and Replace Across Resources"

**Implementation:**
```typescript
// Package: cmdk (Command Menu for React)
import { Command } from 'cmdk';

<Command>
  <Command.Input placeholder="Type a command..." />
  <Command.List>
    <Command.Group heading="Actions">
      <Command.Item onSelect={() => saveAll()}>
        Save All Resources
      </Command.Item>
      <Command.Item onSelect={() => runSpellCheck()}>
        Run Spell Check
      </Command.Item>
    </Command.Group>
  </Command.List>
</Command>
```

**Development Estimate:** 4 days
**User Time Savings:** ~25% faster task execution

#### **2.3.2 Batch Find & Replace Across Resources (P1)**
**Objective:** Edit multiple resources simultaneously

**Features:**
- ✨ Regex-powered find/replace
- ✨ Scope selection (current, all, selected tabs)
- ✨ Preview changes before applying
- ✨ Case-sensitive toggle
- ✨ Whole-word matching
- ✨ Replace history with undo
- ✨ Match count indicator

**UI Flow:**
1. Ctrl+Shift+H → Opens batch replace panel
2. Enter pattern: `\b(color)\b` → Preview: 23 matches across 5 resources
3. Enter replacement: `colour`
4. Review → Apply → Bulk update

**Development Estimate:** 5 days
**User Time Savings:** ~80% for bulk edits

#### **2.3.3 AI-Powered Translation Suggestions (P2)**
**Objective:** Assist with Spanish ↔ English translation

**Features:**
- ✨ Inline translation suggestions (powered by Anthropic Claude)
- ✨ Context-aware phrasing for gig economy terms
- ✨ One-click acceptance of suggestions
- ✨ Translation memory (reuse past translations)
- ✨ Confidence scores per suggestion
- ✨ Manual override capability

**Implementation:**
```typescript
// Using existing @anthropic-ai/sdk
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function suggestTranslation(text: string, sourceLang: string, targetLang: string) {
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Translate this ${sourceLang} text to ${targetLang} for gig economy workers:\n\n${text}`
    }]
  });

  return message.content[0].text;
}
```

**Development Estimate:** 6 days
**User Benefit:** Faster, more accurate translations

#### **2.3.4 Spell Check & Grammar (P1)**
**Objective:** Real-time language validation

**Features:**
- ✨ Underline spelling errors (red wavy)
- ✨ Underline grammar issues (blue wavy)
- ✨ Bilingual support (Spanish & English)
- ✨ Custom dictionary (gig economy terms: "rideshare", "DoorDash")
- ✨ Right-click suggestions
- ✨ "Add to Dictionary" option
- ✨ Ignore once/always

**Implementation:**
```typescript
// Package: @textlint/kernel, textlint-rule-spellchecker
// Or browser native: navigator.spellcheck

const spellCheckConfig = {
  language: ['en-US', 'es-MX'],
  customDict: ['rideshare', 'gig', 'DoorDash', 'Uber', 'deliveries'],
  ignoreWords: ['hablas']
};
```

**Development Estimate:** 4 days
**User Benefit:** 60% error reduction

#### **2.3.5 Macro Recording (P3)**
**Objective:** Automate repetitive editing tasks

**Features:**
- Record sequence of edits/commands
- Save macros with custom names
- Replay macros across resources
- Share macros with team

**Use Case:** Standardize formatting (e.g., "Convert all h3 → h2")

**Development Estimate:** 5 days
**User Benefit:** 90% time savings for repetitive tasks

---

### 2.4 Collaboration Features (P2-P3)

#### **2.4.1 Real-Time Collaborative Editing (P3)**
**Objective:** Multiple editors on same resource

**Features:**
- ✨ Live cursors showing other users' positions
- ✨ Presence indicators (who's viewing/editing)
- ✨ Conflict-free replicated data types (CRDTs)
- ✨ Operation transformation for concurrent edits
- ✨ User avatars and color-coded cursors
- ✨ Activity notifications ("Alice edited line 47")

**Implementation:**
```typescript
// Package: yjs + y-monaco (CRDT for Monaco)
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { WebsocketProvider } from 'y-websocket';

const ydoc = new Y.Doc();
const provider = new WebsocketProvider('ws://localhost:1234', 'hablas-room', ydoc);
const ytext = ydoc.getText('monaco');

const binding = new MonacoBinding(
  ytext,
  monacoEditor.getModel(),
  new Set([monacoEditor]),
  provider.awareness
);
```

**Development Estimate:** 10 days
**Infrastructure:** WebSocket server, state sync
**User Benefit:** Real-time team collaboration

#### **2.4.2 Comments & Annotations (P2)**
**Objective:** In-line feedback and discussion

**Features:**
- ✨ Highlight text → Add comment
- ✨ Thread replies on comments
- ✨ Resolve/unresolve comments
- ✨ @mentions for assignments
- ✨ Comment filtering (all, unresolved, mine)
- ✨ Export comment report

**UI Design:**
```
[Line 47] "Check translation accuracy"
  └─ @maria: Verified with native speaker ✓
     └─ @carlos: Approved [Resolve]
```

**Development Estimate:** 7 days
**User Benefit:** Async review feedback

#### **2.4.3 Suggested Edits (P2) - Google Docs Style**
**Objective:** Propose changes without direct editing

**Features:**
- "Suggest mode" toggle
- Edits appear as tracked changes
- Approve/reject individual suggestions
- Batch approve/reject
- Suggestion comments
- Author attribution

**Development Estimate:** 6 days
**User Benefit:** Non-destructive editing workflow

#### **2.4.4 Approval Workflow (P2)**
**Objective:** Structured content review process

**Workflow States:**
1. **Draft** → Editor creates/edits
2. **Review** → Assigned reviewer checks
3. **Approved** → Changes accepted
4. **Published** → Content goes live

**Features:**
- ✨ State badges (visual indicators)
- ✨ Transition buttons ("Submit for Review", "Approve", "Request Changes")
- ✨ Assignment to specific reviewers
- ✨ Review deadline tracking
- ✨ Email notifications on state changes
- ✨ Approval history log

**Development Estimate:** 8 days
**User Benefit:** Clear review accountability

#### **2.4.5 Activity Feed (P3)**
**Objective:** Audit trail and team visibility

**Features:**
- Timeline of all edits, comments, approvals
- Filter by user, resource, date
- Real-time updates
- "Who edited what, when" view
- Export activity logs

**Development Estimate:** 4 days
**User Benefit:** Transparency and compliance

---

### 2.5 Version Control & History (P2)

#### **2.5.1 Git-Style Version History (P2)**
**Objective:** Persistent content versioning

**Features:**
- ✨ Auto-commit on each save
- ✨ Manual commit with custom messages
- ✨ Branch creation for experimental edits
- ✨ Merge branches back to main
- ✨ Tag important versions (e.g., "v1.0-production")
- ✨ Diff any two versions

**Implementation:**
```typescript
// Store versions in PostgreSQL with JSON content
interface ContentVersion {
  id: string;
  resourceId: string;
  content: string;
  message: string;
  author: string;
  timestamp: Date;
  parentVersion?: string; // For branching
}

// API endpoints
POST /api/resources/:id/versions  // Create new version
GET  /api/resources/:id/versions  // List versions
GET  /api/resources/:id/versions/:versionId/diff  // Compare
POST /api/resources/:id/versions/:versionId/restore  // Rollback
```

**Development Estimate:** 6 days
**User Benefit:** Safety net, experimentation

#### **2.5.2 Visual Timeline of Changes (P2)**
**Objective:** Graphical version history

**Features:**
- Timeline slider to scrub through versions
- Visual preview of each version
- Heatmap showing edit intensity (lines changed)
- Author avatars on timeline
- Click to load any version

**UI Mockup:**
```
[Timeline Slider]
●─────●──●─────────●───────●───────● [Now]
v1.0  v1.1 v1.2   v2.0   v2.1   v2.2

[Preview]
Version 2.1 (2025-11-15)
Author: Maria Lopez
Changes: +47 lines, -12 lines
```

**Development Estimate:** 5 days
**User Benefit:** Easy version navigation

#### **2.5.3 Restore Previous Versions (P2)**
**Objective:** Undo major mistakes

**Features:**
- One-click restore to any version
- Preview before restore
- Create new branch from old version
- Restore notification to team

**Development Estimate:** 3 days
**User Benefit:** Mistake recovery

#### **2.5.4 Blame View (P3)**
**Objective:** See who changed each line

**Features:**
- Line-by-line author attribution
- Click author → View full commit
- Filter by author
- Blame heatmap (age of changes)

**Development Estimate:** 4 days
**User Benefit:** Accountability, context

---

### 2.6 Mobile Admin Experience (P3)

#### **2.6.1 Responsive Layout (P3)**
**Objective:** Functional mobile interface

**Features:**
- ✨ Single-column layout on mobile
- ✨ Collapsible panels
- ✨ Touch-friendly buttons (min 44px tap targets)
- ✨ Horizontal scrolling for wide content
- ✨ Adaptive font sizes

**Development Estimate:** 5 days
**User Benefit:** 80% of tasks mobile-accessible

#### **2.6.2 Read-Only Review Mode (P3)**
**Objective:** Quick mobile reviews without editing

**Features:**
- Diff view optimized for small screens
- Approve/reject buttons
- Comment addition (short messages)
- Swipe to next resource

**Development Estimate:** 3 days
**User Benefit:** Review on-the-go

#### **2.6.3 Quick Approval/Rejection (P3)**
**Objective:** Fast decision-making

**Features:**
- Large "Approve" / "Request Changes" buttons
- Optional quick comment templates
- Batch approve mode

**Development Estimate:** 2 days
**User Benefit:** Mobile workflow efficiency

---

## 3. Prioritization Framework

### Priority Definitions

| Priority | Criteria | Timeframe | Examples |
|----------|----------|-----------|----------|
| **P0 (Critical)** | Must-have for basic efficiency, high ROI | Week 1-2 | Monaco editor, enhanced shortcuts |
| **P1 (High)** | Major workflow improvements, medium-high ROI | Week 3-4 | Inline diff editing, spell check, command palette |
| **P2 (Medium)** | Nice-to-have enhancements, medium ROI | Week 5-6 | Collaboration features, version history |
| **P3 (Low)** | Future considerations, lower ROI | Month 2+ | Real-time collab, mobile optimization |

### Priority Matrix

```
High Impact │ P0: Monaco Editor     │ P1: Inline Diff Edit
            │ P0: Keyboard Shortcuts│ P1: Spell Check
            │                       │ P1: Command Palette
────────────┼───────────────────────┼─────────────────────
Low Impact  │ P2: Version History   │ P3: Mobile UI
            │ P2: Comments/Annot.   │ P3: Real-time Collab
            │ P2: Approval Workflow │ P3: Activity Feed
            └───────────────────────┴─────────────────────
             Low Effort              High Effort
```

---

## 4. Implementation Phases

### **Phase 1: Editor UX Polish** (Weeks 1-2) - P0 Focus

**Goal:** Transform editing experience with professional-grade tools

**Features:**
1. ✅ Monaco Editor integration (3 days)
2. ✅ Enhanced keyboard shortcuts (2 days)
3. ✅ Word count & readability metrics (2 days)
4. ✅ Live markdown preview (3 days)

**Timeline:**
- Day 1-3: Monaco editor implementation + testing
- Day 4-5: Keyboard shortcuts framework
- Day 6-7: Metrics calculation engine
- Day 8-10: Preview pane + sync scrolling

**Deliverables:**
- Updated `EditPanel.tsx` with Monaco
- New `KeyboardShortcuts.tsx` context provider
- New `EditorMetrics.tsx` component
- New `MarkdownPreview.tsx` component

**Success Metrics:**
- [ ] Editing speed: +30% (measured via task completion time)
- [ ] User satisfaction: 8+/10 on editor UX survey
- [ ] Feature adoption: 80%+ use Monaco over plain textarea

**Risks & Mitigation:**
- **Risk:** Monaco bundle size (~2MB)
  **Mitigation:** Code splitting, lazy loading
- **Risk:** Browser compatibility issues
  **Mitigation:** Fallback to textarea on unsupported browsers

---

### **Phase 2: Advanced Diff & Comparison** (Weeks 3-4) - P1 Focus

**Goal:** Enable efficient change review and content synchronization

**Features:**
1. ✅ Inline diff editing with accept/reject (5 days)
2. ✅ Word-level & character-level diffs (3 days)
3. ✅ Enhanced comparison controls (2 days)

**Timeline:**
- Day 11-15: Inline diff editor implementation
- Day 16-18: Granular diff algorithm
- Day 19-20: Comparison UI improvements

**Deliverables:**
- Updated `DiffHighlighter.tsx` → `InlineDiffEditor.tsx`
- New `GranularDiff.tsx` component
- Enhanced `TripleComparisonView.tsx` controls

**Success Metrics:**
- [ ] Review speed: +50% (measured via changes reviewed per hour)
- [ ] Accuracy: 95%+ acceptance of suggested changes
- [ ] Error reduction: 40% fewer missed edits

**Risks & Mitigation:**
- **Risk:** Complex state management for inline edits
  **Mitigation:** Use reducer pattern, comprehensive testing
- **Risk:** Performance issues with large documents
  **Mitigation:** Virtual scrolling, diff chunking

---

### **Phase 3: Workflow Automation** (Weeks 5-6) - P1-P2 Mix

**Goal:** Accelerate repetitive tasks and ensure content quality

**Features:**
1. ✅ Command palette (Cmd+K) (4 days)
2. ✅ Batch find & replace (5 days)
3. ✅ Spell check & grammar (4 days)
4. ⚠️ AI translation suggestions (6 days) - Optional if time allows

**Timeline:**
- Day 21-24: Command palette framework
- Day 25-29: Batch find/replace engine
- Day 30-33: Spell check integration
- Day 34-39: AI translation (if prioritized)

**Deliverables:**
- New `CommandPalette.tsx` component
- New `BatchReplace.tsx` panel
- New `SpellCheckProvider.tsx` context
- Optional: New `AITranslationSuggestions.tsx`

**Success Metrics:**
- [ ] Task execution speed: +25% via command palette
- [ ] Bulk edit time: -80% for multi-resource changes
- [ ] Error detection: 60% spelling/grammar errors caught

**Risks & Mitigation:**
- **Risk:** AI translation costs
  **Mitigation:** Rate limiting, caching, manual override
- **Risk:** Spell check false positives
  **Mitigation:** Custom dictionary, ignore list

---

### **Phase 4: Collaboration & Approval** (Weeks 7-8) - P2 Focus

**Goal:** Enable team coordination and structured review workflows

**Features:**
1. ✅ Comments & annotations (7 days)
2. ✅ Approval workflow (8 days)
3. ✅ Version history (6 days)
4. ⚠️ Activity feed (4 days) - If time allows

**Timeline:**
- Day 40-46: Comments system + threading
- Day 47-54: Workflow states + transitions
- Day 55-60: Version storage + timeline

**Deliverables:**
- New `CommentThread.tsx` component
- New `WorkflowStatus.tsx` component
- New `VersionHistory.tsx` panel
- Database migrations for comments, versions

**Success Metrics:**
- [ ] Review cycle time: -30% with structured workflow
- [ ] Collaboration clarity: 90%+ reviewers understand context
- [ ] Audit compliance: 100% version tracking

**Risks & Mitigation:**
- **Risk:** Database performance with version storage
  **Mitigation:** Indexing, content compression, archiving old versions
- **Risk:** Workflow complexity confusing users
  **Mitigation:** Progressive disclosure, onboarding tutorials

---

### **Phase 5: Mobile Optimization** (Month 2+) - P3 Future Work

**Goal:** Enable mobile admin workflows

**Features:**
1. Responsive layout redesign
2. Read-only review mode
3. Quick approval actions
4. Touch gesture controls

**Timeline:** 10 days (deferred to Month 2)

**Success Metrics:**
- [ ] Mobile task completion: 80% of review tasks
- [ ] Mobile user adoption: 40%+ of reviewers

---

## 5. Cost-Benefit Analysis

### 5.1 Development Costs

| Phase | Features | Dev Days | Cost (@$800/day) |
|-------|----------|----------|------------------|
| Phase 1 | Editor UX Polish | 10 | $8,000 |
| Phase 2 | Advanced Diff | 10 | $8,000 |
| Phase 3 | Workflow Automation | 13-19 | $10,400 - $15,200 |
| Phase 4 | Collaboration | 21-25 | $16,800 - $20,000 |
| Phase 5 | Mobile (Future) | 10 | $8,000 |
| **TOTAL** | **All Phases** | **64-74** | **$51,200 - $59,200** |

**Phase 1-2 Only (MVP):** 20 days = **$16,000**
**Phase 1-3 (Recommended):** 33-39 days = **$26,400 - $31,200**

### 5.2 Operational Costs

| Item | Monthly Cost | Notes |
|------|--------------|-------|
| AI Translation API | $50 - $200 | Based on volume (Claude API) |
| WebSocket Server (Collab) | $30 - $100 | If Phase 4 implemented |
| Database Storage (Versions) | $20 - $50 | PostgreSQL storage increase |
| **TOTAL** | **$100 - $350/mo** | Phase 3-4 only |

### 5.3 Return on Investment (ROI)

#### **Time Savings per Editor**
Assume 10 active admin editors, each reviewing 20 resources/week:

| Improvement | Time Saved per Resource | Weekly Savings (10 editors × 20 resources) | Annual Value (@$40/hr) |
|-------------|-------------------------|---------------------------------------------|------------------------|
| Monaco Editor | 3 min | 100 hours/week | $208,000 |
| Inline Diff | 5 min | 166 hours/week | $346,000 |
| Spell Check | 2 min | 66 hours/week | $137,000 |
| Batch Replace | 10 min (bulk tasks) | 50 hours/week | $104,000 |
| Command Palette | 1 min | 33 hours/week | $68,000 |
| **TOTAL** | **21 min/resource** | **415 hours/week** | **$863,000/year** |

**ROI Calculation:**
- **Investment:** $26,400 - $31,200 (Phases 1-3)
- **Annual Return:** $863,000
- **ROI:** **2,667% - 3,171%**
- **Payback Period:** **11-13 days** 🚀

#### **Error Reduction Impact**
- Current error rate: ~5% (1 in 20 resources requires rework)
- Post-improvement: ~2% (spell check, diff tools)
- **Avoided rework:** 3% × 200 resources/week × 15 min rework time = 90 hours/week
- **Annual value:** 90 hrs/week × 52 weeks × $40/hr = **$187,200**

#### **User Satisfaction Impact**
- Current NPS: ~6/10 (baseline survey needed)
- Target NPS: 9/10
- **Benefit:** Higher editor retention, reduced training costs

**Total Annual Benefit:** $863,000 + $187,200 = **$1,050,000**

---

## 6. Technology Recommendations

### 6.1 Core Dependencies

| Package | Version | Purpose | Bundle Size |
|---------|---------|---------|-------------|
| `@monaco-editor/react` | ^4.6.0 | VS Code editor | ~2MB (lazy) |
| `diff-match-patch` | ^1.0.5 | Granular diffing | ~50KB |
| `react-diff-viewer-continued` | ^3.3.1 | Diff UI | ~100KB |
| `cmdk` | ^1.0.0 | Command palette | ~20KB |
| `reading-time` | ^1.5.0 | Reading metrics | ~5KB |
| `yjs` + `y-monaco` | ^13.6.0 | Real-time collab | ~150KB |
| `@textlint/kernel` | ^13.0.0 | Spell check | ~200KB |

**Total Bundle Impact:** ~2.5MB (with code splitting: <500KB initial)

### 6.2 State Management

**Recommendation:** Continue with React hooks + Context API for now

**Rationale:**
- Current complexity doesn't warrant Redux/Zustand
- Context API sufficient for editor state, save status
- If collaboration features added (Phase 4), consider **Zustand** for:
  - Simpler syntax than Context
  - Better DevTools
  - Middleware support

**Future Migration (if needed):**
```typescript
// Zustand store for editor state
import create from 'zustand';

interface EditorStore {
  content: string;
  isDirty: boolean;
  updateContent: (text: string) => void;
  save: () => Promise<void>;
}

export const useEditorStore = create<EditorStore>((set) => ({
  content: '',
  isDirty: false,
  updateContent: (text) => set({ content: text, isDirty: true }),
  save: async () => {
    // Save logic
    set({ isDirty: false });
  }
}));
```

### 6.3 Data Fetching

**Recommendation:** Upgrade to **React Query (TanStack Query)**

**Current:** Manual `useEffect` + `fetch`
**Proposed:** React Query for automatic caching, refetching, optimistic updates

**Benefits:**
- Automatic background refetching
- Cache invalidation on save
- Optimistic updates for better UX
- Built-in loading/error states

**Implementation:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch resource
const { data: resource, isLoading } = useQuery({
  queryKey: ['resource', resourceId],
  queryFn: () => fetchResource(resourceId),
});

// Save with optimistic update
const queryClient = useQueryClient();
const saveMutation = useMutation({
  mutationFn: saveResource,
  onMutate: async (newContent) => {
    // Optimistic update
    await queryClient.cancelQueries(['resource', resourceId]);
    const previous = queryClient.getQueryData(['resource', resourceId]);
    queryClient.setQueryData(['resource', resourceId], newContent);
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['resource', resourceId], context.previous);
  },
});
```

### 6.4 UI Component Library

**Recommendation:** **Radix UI** or **Shadcn/ui** (built on Radix)

**Current:** Custom components with Tailwind
**Proposed:** Accessible, unstyled primitives

**Why Radix/Shadcn:**
- Accessibility built-in (ARIA, keyboard nav)
- Unstyled = full Tailwind control
- Tree-shakeable (no bundle bloat)
- Components needed: Dialog, Dropdown, Tooltip, Popover

**Example:**
```typescript
// Shadcn command palette (uses cmdk under the hood)
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"

// Already styled with Tailwind, copy-paste ready
```

### 6.5 Testing Strategy

**Current:** Jest + React Testing Library ✅
**Enhancements:**

1. **Visual Regression Testing:** Add **Playwright** or **Chromatic**
   - Catch UI regressions in diff views
   - Screenshot comparison

2. **E2E Testing:** Add **Playwright**
   ```typescript
   // Test full review workflow
   test('editor can review and save resource', async ({ page }) => {
     await page.goto('/admin/review/resource-123');
     await page.getByRole('textbox', { name: 'Edit content' }).fill('New content');
     await page.getByRole('button', { name: 'Save' }).click();
     await expect(page.getByText('Saved successfully')).toBeVisible();
   });
   ```

3. **Accessibility Testing:** Integrate **jest-axe** (already installed ✅)
   ```typescript
   import { axe } from 'jest-axe';

   test('ContentReviewTool has no a11y violations', async () => {
     const { container } = render(<ContentReviewTool />);
     const results = await axe(container);
     expect(results).toHaveNoViolations();
   });
   ```

### 6.6 Performance Optimization

**Strategies:**

1. **Code Splitting:**
   ```typescript
   // Lazy load Monaco
   const MonacoEditor = lazy(() => import('@monaco-editor/react'));

   <Suspense fallback={<TextareaFallback />}>
     <MonacoEditor />
   </Suspense>
   ```

2. **Virtual Scrolling:** For long resource lists
   ```typescript
   import { useVirtualizer } from '@tanstack/react-virtual';
   ```

3. **Debouncing:** Already implemented for autosave ✅
   - Extend to spell check, metrics calculation

4. **Web Workers:** For expensive operations
   - Diff calculation (large documents)
   - Spell check processing

---

## 7. Success Metrics & KPIs

### 7.1 Performance Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| **Time to review resource** | 10 min | 6 min (-40%) | Task timing analytics |
| **Time to apply bulk changes** | 30 min | 6 min (-80%) | Before/after batch replace |
| **Editor load time** | N/A | <2s | Lighthouse, Web Vitals |
| **Autosave latency** | 2s | 1s | Performance.now() tracking |

### 7.2 Quality Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| **Spelling errors caught** | ~0% (manual) | 60%+ | Spell check detections |
| **Formatting errors** | ~5% | 2% | QA review post-release |
| **Content consistency** | ~80% | 95%+ | Triple-comparison sync rate |
| **Rollback requests** | ~2/month | <1/month | Version history usage |

### 7.3 Adoption Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Monaco editor usage** | 80%+ | Feature flag analytics |
| **Command palette usage** | 60%+ | Command execution logs |
| **Keyboard shortcut usage** | 50%+ | Shortcut telemetry |
| **Collaboration features** | 70%+ (if built) | Comment/approval activity |

### 7.4 User Satisfaction

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| **Editor UX NPS** | 6/10 | 9/10 | Monthly survey |
| **Feature request volume** | High | -50% | Support ticket tracking |
| **Training time (new editors)** | 2 hours | 1 hour | Onboarding analytics |
| **Editor retention** | Baseline | +20% | HR data (if applicable) |

### 7.5 Tracking Implementation

**Recommended:** Add lightweight analytics

```typescript
// analytics.ts
export function trackEvent(category: string, action: string, label?: string) {
  // Send to analytics platform (e.g., PostHog, Mixpanel)
  fetch('/api/analytics/track', {
    method: 'POST',
    body: JSON.stringify({ category, action, label, timestamp: Date.now() })
  });
}

// Usage
trackEvent('Editor', 'Keyboard Shortcut', 'Ctrl+S');
trackEvent('Diff', 'Inline Accept', 'Line 47');
trackEvent('Command Palette', 'Execute', 'Save All');
```

---

## 8. Detailed Roadmap

### 8.1 Week-by-Week Breakdown

#### **Week 1: Monaco Editor Foundation**
- [ ] **Day 1-2:** Install `@monaco-editor/react`, configure webpack/Next.js
- [ ] **Day 3:** Replace textarea in `EditPanel.tsx` with Monaco
- [ ] **Day 4:** Add syntax highlighting for Markdown
- [ ] **Day 5:** Implement IntelliSense for common phrases
- [ ] **Milestone:** Monaco editor live in `ContentReviewTool`

#### **Week 2: Keyboard Shortcuts & Metrics**
- [ ] **Day 6-7:** Build keyboard shortcut framework (context provider)
- [ ] **Day 8:** Add shortcuts: Save, Diff Toggle, Navigation
- [ ] **Day 9:** Implement word count, readability metrics
- [ ] **Day 10:** Build live markdown preview pane
- [ ] **Milestone:** Phase 1 complete, user testing begins

#### **Week 3: Inline Diff Editing**
- [ ] **Day 11-12:** Integrate `react-diff-viewer-continued`
- [ ] **Day 13-14:** Build accept/reject buttons per change
- [ ] **Day 15:** Add keyboard shortcuts for diff actions
- [ ] **Milestone:** Inline diff editing functional

#### **Week 4: Granular Diffs & Comparison**
- [ ] **Day 16-17:** Implement word-level/char-level diff algorithm
- [ ] **Day 18:** Update `DiffHighlighter` with granular view
- [ ] **Day 19-20:** Enhance `TripleComparisonView` controls
- [ ] **Milestone:** Phase 2 complete, advanced diffing live

#### **Week 5: Command Palette & Batch Operations**
- [ ] **Day 21-22:** Install `cmdk`, build command palette UI
- [ ] **Day 23-24:** Wire up commands (Save All, Diff, etc.)
- [ ] **Day 25-26:** Build batch find & replace engine
- [ ] **Day 27:** Add replace preview and confirmation
- [ ] **Milestone:** Command palette and batch replace live

#### **Week 6: Spell Check & AI Features**
- [ ] **Day 28-29:** Integrate spell check for English/Spanish
- [ ] **Day 30:** Build custom dictionary for gig economy terms
- [ ] **Day 31-32:** (Optional) Implement AI translation suggestions
- [ ] **Day 33:** Testing and bug fixes
- [ ] **Milestone:** Phase 3 complete, workflow automation ready

#### **Week 7-8: Collaboration (If Prioritized)**
- [ ] **Day 34-37:** Build comments & annotations system
- [ ] **Day 38-41:** Implement approval workflow states
- [ ] **Day 42-45:** Add version history and timeline
- [ ] **Day 46-47:** Testing, documentation, training
- [ ] **Milestone:** Phase 4 complete, collaboration features live

### 8.2 Feature Flags for Phased Rollout

**Strategy:** Enable features progressively for testing

```typescript
// featureFlags.ts
export const features = {
  monacoEditor: { enabled: true, rollout: 100 },         // Phase 1
  inlineDiff: { enabled: true, rollout: 50 },            // Phase 2, 50% rollout
  commandPalette: { enabled: false, rollout: 0 },        // Phase 3, not yet
  aiTranslations: { enabled: false, rollout: 0 },        // Future
  realTimeCollab: { enabled: false, rollout: 0 },        // Phase 4, deferred
};

// Usage
if (features.monacoEditor.enabled && Math.random() * 100 < features.monacoEditor.rollout) {
  return <MonacoEditor />;
} else {
  return <TextareaEditor />;
}
```

### 8.3 Rollback Plan

**If issues arise:**
1. Feature flags allow instant disable (no deployment)
2. Keep original `textarea` implementation as fallback
3. Version control for quick code revert
4. Monitoring dashboard for error spikes

---

## 9. Risk Assessment & Mitigation

### 9.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Monaco bundle size slows page load** | Medium | High | Code splitting, lazy loading, fallback |
| **Diff algorithm performance on large docs** | Medium | Medium | Web Workers, virtualization, chunking |
| **Browser compatibility issues** | Low | Medium | Feature detection, polyfills, fallback |
| **Real-time collab conflicts (CRDT)** | High | High | Extensive testing, conflict UI, manual override |
| **Database performance (version storage)** | Medium | Medium | Indexing, archiving, compression |

### 9.2 User Adoption Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Editors resist new UI** | Medium | High | Gradual rollout, training, optional features |
| **Learning curve for advanced features** | High | Medium | Tooltips, onboarding tour, documentation |
| **Keyboard shortcuts not discoverable** | Medium | Low | Command palette, shortcut cheat sheet |
| **Collaboration features too complex** | Medium | Medium | Progressive disclosure, simple defaults |

### 9.3 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Development timeline overruns** | Medium | Medium | Agile sprints, MVP first, defer P3 features |
| **Budget constraints** | Low | High | Phase 1-2 only (~$16K), delay Phase 4 |
| **Scope creep** | High | Medium | Strict prioritization, feature freeze after Phase 3 |

---

## 10. Next Steps & Recommendations

### 10.1 Immediate Actions (This Week)

1. **✅ Approve this strategic plan** with stakeholders
2. **✅ Baseline measurement:** Survey editors (current pain points, NPS)
3. **✅ Set up analytics tracking** for current tool usage
4. **✅ Install Phase 1 dependencies** (`@monaco-editor/react`, etc.)
5. **✅ Create feature flag system** in codebase

### 10.2 Recommended Approach

**Option A: Full Investment (Phases 1-3)**
- **Cost:** $26,400 - $31,200
- **Timeline:** 6 weeks
- **ROI:** 2,667% annually
- **Recommendation:** ⭐ **BEST VALUE** - Maximum impact, manageable scope

**Option B: MVP Only (Phases 1-2)**
- **Cost:** $16,000
- **Timeline:** 4 weeks
- **ROI:** ~1,800% annually (editor + diff only)
- **Recommendation:** If budget-constrained, start here

**Option C: Phased Rollout (1 → 2 → 3 over 3 months)**
- **Cost:** Same as Option A, spread over time
- **Timeline:** 12 weeks (with gaps for feedback)
- **Recommendation:** If risk-averse, allows iteration

### 10.3 Decision Matrix

| Factor | Option A (Full) | Option B (MVP) | Option C (Phased) |
|--------|-----------------|----------------|-------------------|
| **Time to Value** | 6 weeks | 4 weeks | 12 weeks |
| **Risk** | Medium | Low | Low |
| **Editor Impact** | High | Medium | High |
| **Flexibility** | Low | High | High |
| **Our Recommendation** | ✅ **YES** | If budget-limited | If time allows |

### 10.4 Success Criteria for Go-Live

**Phase 1 (Editor UX):**
- [ ] Monaco editor loads in <2s
- [ ] Keyboard shortcuts work in all browsers (Chrome, Firefox, Safari, Edge)
- [ ] No accessibility regressions (axe tests pass)
- [ ] 80%+ editors prefer Monaco over textarea (survey)

**Phase 2 (Advanced Diff):**
- [ ] Inline diff supports documents up to 10,000 lines
- [ ] Word-level diff accuracy: 95%+ (manual QA)
- [ ] Accept/reject actions have <200ms latency
- [ ] 90%+ editors use inline diff (analytics)

**Phase 3 (Workflow Automation):**
- [ ] Command palette responds in <100ms
- [ ] Batch replace handles 100+ resources without timeout
- [ ] Spell check detects 80%+ common errors (test corpus)
- [ ] 60%+ editors adopt command palette (analytics)

---

## 11. Conclusion

This strategic improvement plan transforms the Hablas content review tool from a basic editing interface into a **world-class content management platform**. By prioritizing high-impact features (Monaco editor, inline diff editing, workflow automation) in the first 6 weeks, we deliver **exceptional ROI (2,667%)** and **dramatic productivity gains (40% faster reviews)**.

The phased approach allows for iterative feedback, risk mitigation, and budget flexibility. Phases 1-3 represent the **sweet spot** of value vs. effort, while Phases 4-5 (collaboration, mobile) can be deferred to future iterations based on user demand.

**Key Takeaways:**
- ✅ **$26K-$31K investment** → **$1M+ annual return**
- ✅ **6-week timeline** for Phases 1-3
- ✅ **40% faster reviews**, 60% fewer errors
- ✅ Built on proven technologies (Monaco, React Query, Radix UI)
- ✅ Scalable architecture for future enhancements

**Recommendation:** **Proceed with Phases 1-3** (Option A) for maximum impact. Begin with stakeholder approval, baseline surveys, and Phase 1 kickoff within 1 week.

---

## Appendix A: Technology Stack Comparison

### Editor Options Evaluated

| Editor | Pros | Cons | Decision |
|--------|------|------|----------|
| **Monaco** | VS Code quality, IntelliSense, syntax highlighting | 2MB bundle size | ✅ **Selected** |
| CodeMirror 6 | Lighter (~800KB), extensible | Less feature-rich | ❌ |
| Textarea | Native, lightweight | No features | ❌ (fallback only) |
| Slate | React-native, customizable | Requires building everything | ❌ |

### Diff Library Comparison

| Library | Pros | Cons | Decision |
|---------|------|------|----------|
| **react-diff-viewer-continued** | Maintained, feature-rich | ~100KB | ✅ **Primary** |
| **diff-match-patch** | Google-backed, granular | Low-level (no UI) | ✅ **For algorithms** |
| Monaco Diff Editor | Integrated with Monaco | Limited customization | ⚠️ Evaluate |

### State Management

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Context API** | Built-in, sufficient for current scope | Verbose for complex state | ✅ **Keep for now** |
| Zustand | Simple, modern, DevTools | Learning curve | ⚠️ Future migration |
| Redux Toolkit | Industry standard, powerful | Overkill for this app | ❌ |

---

## Appendix B: Sample UI Mockups

### Monaco Editor with Metrics Panel

```
┌─────────────────────────────────────────────────────────────┐
│ Content Review Tool                    [Diff] [Save]        │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Original ─────────────┐ ┌─ Edit (Monaco) ──────────────┐│
│ │ # Getting Started      │ │  1  # Getting Started        ││
│ │                        │ │  2                           ││
│ │ Welcome to Hablas...   │ │  3  Welcome to Hablas...     ││
│ │                        │ │  4                           ││
│ │ [Read-only preview]    │ │  5  [Editing with syntax     ││
│ │                        │ │      highlighting, auto-     ││
│ │                        │ │      complete suggestions]   ││
│ │                        │ │                              ││
│ └────────────────────────┘ └──────────────────────────────┘│
│                                                             │
│ 📊 Metrics: 247 words • 1,345 chars • ~2 min read • ✓ En   │
└─────────────────────────────────────────────────────────────┘
```

### Inline Diff with Accept/Reject

```
┌─────────────────────────────────────────────────────────────┐
│ Changes Comparison                                          │
├─────────────────────────────────────────────────────────────┤
│  23  │ - Learn English for rideshare drivers.              │
│      │ [Reject] [Edit]                                      │
│  24  │ + Learn English for gig economy workers.            │
│      │ [✓ Accept] [Edit]                                    │
│      │                                                      │
│  47  │ - This course includes 10 lessons.                  │
│      │ [Reject] [Edit]                                      │
│  48  │ + This course includes 15 comprehensive lessons.    │
│      │ [✓ Accept] [Edit]                                    │
│      │                                                      │
│      │ [Accept All] [Reject All]                            │
└─────────────────────────────────────────────────────────────┘
```

### Command Palette (Cmd+K)

```
┌─────────────────────────────────────────────────────────────┐
│ ⌘K  Type a command...                                   [×] │
├─────────────────────────────────────────────────────────────┤
│ 🔍 save all                                                 │
│                                                             │
│ Actions                                                     │
│   💾 Save All Resources                    Ctrl+Shift+S    │
│   💾 Save Current Resource                 Ctrl+S          │
│   🔄 Sync Web to Downloadable                              │
│                                                             │
│ Navigation                                                  │
│   ➡️  Next Resource Tab                     Ctrl+]          │
│   ⬅️  Previous Resource Tab                 Ctrl+[          │
│                                                             │
│ Tools                                                       │
│   ✓ Run Spell Check                                        │
│   🌍 AI Translation Suggestions                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Appendix C: Database Schema for Version History

```sql
-- Content versions table
CREATE TABLE content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id),
  content TEXT NOT NULL,
  content_hash VARCHAR(64) NOT NULL, -- SHA256 for deduplication
  commit_message VARCHAR(500),
  author_id UUID NOT NULL REFERENCES users(id),
  parent_version_id UUID REFERENCES content_versions(id), -- For branching
  branch_name VARCHAR(100) DEFAULT 'main',
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_resource_versions (resource_id, created_at DESC),
  INDEX idx_content_hash (content_hash) -- Deduplication
);

-- Version tags (e.g., "v1.0-production")
CREATE TABLE version_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES content_versions(id),
  tag_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(version_id, tag_name)
);

-- Comments on resources
CREATE TABLE resource_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id),
  parent_comment_id UUID REFERENCES resource_comments(id), -- Threading
  author_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  line_number INT, -- For inline comments
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_resource_comments (resource_id, created_at DESC)
);
```

---

**End of Strategic Improvement Plan**

*For questions or clarifications, contact the planning team.*
