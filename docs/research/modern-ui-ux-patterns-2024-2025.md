# Modern UI/UX Patterns Research: Content Editing & Admin Dashboards (2024-2025)

**Research Date:** November 2025
**Project:** Hablas Content Review Tool
**Focus Areas:** Content editors, diff/comparison tools, admin dashboards, review workflows

---

## Executive Summary

This research document provides comprehensive analysis of modern UI/UX patterns for content editing, admin dashboards, and review tools based on industry-leading applications in 2024-2025. Key findings include the widespread adoption of command palettes (Cmd+K), block-based editors, advanced diff algorithms, and mobile-first design principles.

### Key Recommendations for Hablas:
1. Implement command palette (Cmd+K) for keyboard-first navigation
2. Upgrade to character/word-level diff highlighting
3. Add Monaco editor integration for advanced code editing
4. Implement optimistic UI updates with conflict resolution
5. Enhance mobile responsiveness with touch optimization
6. Add collaborative editing features with presence indicators

---

## 1. Modern Content Editors

### 1.1 VS Code / Monaco Editor Patterns

**Current Industry Leader:** Monaco Editor (powers VS Code)

#### Key Features:
- **Syntax highlighting** with language-specific grammar
- **IntelliSense** autocomplete
- **Minimap navigation** for large documents
- **Multi-cursor editing** for batch operations
- **Find/replace** with regex support
- **Code folding** for better organization
- **Diff editor mode** built-in

#### React Integration (2024 Best Practices):

```typescript
// Using @monaco-editor/react - most popular wrapper
import Editor from '@monaco-editor/react';

function CodeEditor() {
  return (
    <Editor
      height="90vh"
      defaultLanguage="markdown"
      theme="vs-dark"
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        wordWrap: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        readOnly: false,
        quickSuggestions: true,
      }}
      onChange={(value) => handleChange(value)}
    />
  );
}
```

#### Performance Considerations:
- **Bundle size:** ~4MB (use code splitting)
- **Lazy loading:** Load editor only when needed
- **Web Workers:** Offload syntax highlighting to workers
- **Virtual scrolling:** Handle large documents efficiently

#### Accessibility:
- Full keyboard navigation
- Screen reader support
- High contrast themes
- Customizable font sizes

**Recommendation for Hablas:**
- Use Monaco for advanced editing (code, JSON, markdown)
- Keep simple textarea for basic content
- Lazy load Monaco to reduce initial bundle size

---

### 1.2 Notion-Style Block-Based Editors

**Industry Leaders:** Notion, Craft, Coda

#### Core Concepts:
- **Block-based architecture:** Everything is a block (paragraph, heading, image, etc.)
- **Slash commands (/):** Quick insertion menu
- **Drag-and-drop:** Reorder blocks easily
- **Nested structures:** Blocks within blocks
- **Real-time collaboration:** Live cursors and presence

#### React Libraries (2024):

1. **BlockNote** (Recommended)
   - Built on Prosemirror and Tiptap
   - Notion-style UX out of the box
   - TypeScript support
   - Extensible block system

```typescript
import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/react";

export default function NotionEditor() {
  const editor = useMemo(() => BlockNoteEditor.create(), []);

  return (
    <BlockNoteView
      editor={editor}
      slashMenu={true}
      formattingToolbar={true}
    />
  );
}
```

2. **Novel** (Tiptap-based)
   - Lighter weight
   - AI autocomplete support
   - shadcn/ui integration

3. **Yoopta-Editor**
   - Highly customizable
   - Plugin system
   - Similar to Notion, Craft, Medium

#### Slash Command UX Patterns:

```typescript
// Typical slash menu structure
const slashCommands = [
  {
    title: 'Heading 1',
    icon: <Heading1Icon />,
    command: 'h1',
    keywords: ['heading', 'title', 'h1']
  },
  {
    title: 'Paragraph',
    icon: <TextIcon />,
    command: 'p',
    keywords: ['text', 'paragraph']
  },
  // ... more commands
];

// Fuzzy search implementation
function filterCommands(query: string) {
  return slashCommands.filter(cmd =>
    cmd.keywords.some(kw => kw.includes(query.toLowerCase()))
  );
}
```

#### Benefits:
- **Reduces UI clutter:** No toolbar needed
- **Accelerates writing:** Keyboard-first workflow
- **Encourages structure:** Natural document organization
- **Lower learning curve:** Discoverable features

**Recommendation for Hablas:**
- Consider BlockNote for rich content editing
- Implement slash commands for quick formatting
- Add drag-and-drop block reordering
- Keep it optional for users who prefer plain text

---

### 1.3 Google Docs / Medium Editor Patterns

#### Key UX Principles:

1. **Distraction-free writing**
   - Minimal UI by default
   - Contextual toolbar on selection
   - Full-screen mode available

2. **Inline formatting toolbar**
   - Appears on text selection
   - Position above/below selection
   - Keyboard shortcuts displayed

```typescript
// Floating toolbar implementation
function FloatingToolbar({ selection }: Props) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (selection) {
      const rect = selection.getBoundingClientRect();
      setPosition({
        top: rect.top - 50,
        left: rect.left + rect.width / 2
      });
    }
  }, [selection]);

  return (
    <div
      className="floating-toolbar"
      style={{ top: position.top, left: position.left }}
    >
      {/* Toolbar buttons */}
    </div>
  );
}
```

3. **Smart suggestions**
   - Grammar checking (Grammarly-style)
   - Autocomplete
   - Link previews
   - @mentions for collaboration

**Recommendation for Hablas:**
- Add floating toolbar for selection-based formatting
- Implement distraction-free mode toggle
- Consider grammar/spell checking integration

---

## 2. Diff/Comparison Tools

### 2.1 Advanced Diff Algorithms (2024)

**Current State:** Line-based diff (Myers algorithm)
**Industry Standard:** Character/word-level diff with syntax awareness

#### Diff Algorithm Hierarchy:

1. **Line-level** (Basic - current Hablas implementation)
   - Compares entire lines
   - Shows which lines changed
   - Limited granularity

2. **Word-level** (Intermediate - recommended)
   - Highlights changed words within lines
   - Better readability
   - Clear change identification

3. **Character-level** (Advanced)
   - Exact character changes
   - Most precise
   - Can be noisy for large changes

4. **Syntax-aware** (Semantic)
   - Understands code structure
   - Move detection
   - Refactoring-aware

#### Implementation with `diff-match-patch`:

```typescript
import { diff_match_patch } from 'diff-match-patch';

function computeWordLevelDiff(original: string, edited: string) {
  const dmp = new diff_match_patch();

  // Character-level diff
  const diffs = dmp.diff_main(original, edited);

  // Cleanup for better readability
  dmp.diff_cleanupSemantic(diffs);

  return diffs.map(([operation, text]) => ({
    type: operation === 1 ? 'added' :
          operation === -1 ? 'removed' : 'unchanged',
    content: text
  }));
}
```

#### Modern React Diff Libraries:

1. **react-diff-viewer-continued** (Recommended)
   - Word-level highlighting
   - Split/unified view
   - Line numbers
   - Syntax highlighting support

```typescript
import ReactDiffViewer from 'react-diff-viewer-continued';

<ReactDiffViewer
  oldValue={original}
  newValue={edited}
  splitView={true}
  showDiffOnly={false}
  useDarkTheme={false}
  leftTitle="Original"
  rightTitle="Edited"
  compareMethod={DiffMethod.WORDS}
/>
```

2. **Monaco Diff Editor**
   - Built into Monaco
   - Inline diff view
   - Side-by-side view
   - Advanced navigation

---

### 2.2 GitHub PR Diff Viewer Patterns

#### Key Features:

1. **Inline Comments**
   - Click on line number to add comment
   - Thread discussions
   - Suggested changes feature
   - Resolve/unresolve threads

```typescript
// GitHub-style inline comment component
function DiffLineWithComments({
  lineNumber,
  content,
  comments,
  onAddComment
}: Props) {
  const [showCommentForm, setShowCommentForm] = useState(false);

  return (
    <div className="diff-line-container">
      <button
        className="line-number"
        onClick={() => setShowCommentForm(true)}
      >
        {lineNumber}
      </button>
      <div className="line-content">{content}</div>

      {showCommentForm && (
        <CommentForm onSubmit={onAddComment} />
      )}

      {comments.length > 0 && (
        <CommentThread comments={comments} />
      )}
    </div>
  );
}
```

2. **Split vs Unified View**
   - Toggle between layouts
   - Preference persistence
   - Mobile: unified only

3. **File Tree Navigation**
   - Collapse/expand files
   - Jump to file
   - Filter by file type
   - Review status per file

4. **Suggested Changes**
   - Inline code suggestions
   - One-click apply
   - Batch apply multiple suggestions

```markdown
<!-- GitHub suggested change syntax -->
```suggestion
const newCode = "improved";
```
```

#### 2024 Improvements:

- **Outdated comments handling:** Comments move with code
- **Semantic diff algorithms:** Understands code structure
- **Move detection:** Shows relocated code
- **Commit Cruncher algorithm:** 3x more change types detected

**Recommendation for Hablas:**
- Upgrade to word/character-level diff
- Add inline comment capability for review
- Implement split/unified view toggle
- Add file navigation for multi-file resources

---

### 2.3 Visual Diff Tools

**Industry Leaders:** Beyond Compare, Kaleidoscope, Meld

#### Visual Enhancements:

1. **Color Coding Standards**
   ```css
   .diff-added {
     background: #e6ffed; /* Light green */
     color: #22863a; /* Dark green text */
   }
   .diff-removed {
     background: #ffeef0; /* Light red */
     color: #cb2431; /* Dark red text */
   }
   .diff-modified {
     background: #e1f0ff; /* Light blue */
     color: #0366d6; /* Dark blue text */
   }
   ```

2. **Minimap Overview**
   - Bird's eye view of all changes
   - Click to navigate
   - Visual density indicator

3. **Change Summary**
   - Stats header: +X additions, -Y deletions, ~Z modifications
   - Percentage changed
   - File size comparison

4. **Ignore Options**
   - Whitespace changes
   - Case changes
   - Line ending changes
   - Comments only

**Recommendation for Hablas:**
- Add change statistics header
- Implement minimap for large documents
- Add whitespace ignore option
- Use consistent color scheme

---

## 3. Admin Dashboard Patterns

### 3.1 Linear Design System

**Why Linear is Referenced:** Industry leader in clean, fast, keyboard-first UX

#### Core Principles:

1. **Keyboard-First Navigation**
   - Every action has a shortcut
   - Shortcuts are discoverable
   - Consistent patterns (G+key for navigation)

```typescript
// Linear-style keyboard shortcuts
const shortcuts = {
  // Navigation (G+key)
  'g i': () => router.push('/inbox'),
  'g v': () => router.push('/current-cycle'),
  'g b': () => router.push('/backlog'),

  // Actions (O+key for "open")
  'o i': () => openIssueMenu(),
  'o p': () => openProjectMenu(),

  // Global
  'cmd+k': () => openCommandPalette(),
  'cmd+/': () => showShortcutHelp(),
};

// Keyboard shortcut hook
function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      const key = getKeyCombo(e);
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
}
```

2. **Command Palette (Cmd+K)**
   - Single entry point for all actions
   - Fuzzy search
   - Recently used items
   - Context-aware suggestions
   - Keyboard navigation

```typescript
// Command palette implementation
interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  keywords: string[];
  action: () => void;
  group: 'navigation' | 'actions' | 'resources';
}

function CommandPalette({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  const filteredCommands = useMemo(() => {
    if (!query) return recentCommands;

    return allCommands.filter(cmd =>
      cmd.keywords.some(kw =>
        kw.toLowerCase().includes(query.toLowerCase())
      ) ||
      cmd.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(s => Math.min(s + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(s => Math.max(s - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filteredCommands[selected]?.action();
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, selected, filteredCommands]);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <input
        type="text"
        placeholder="Type a command or search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      <CommandList>
        {filteredCommands.map((cmd, i) => (
          <CommandItem
            key={cmd.id}
            selected={i === selected}
            onClick={cmd.action}
          >
            {cmd.icon}
            <span>{cmd.title}</span>
            {cmd.subtitle && <span className="subtitle">{cmd.subtitle}</span>}
          </CommandItem>
        ))}
      </CommandList>
    </Dialog>
  );
}
```

3. **Visual Design**
   - Dark mode default
   - Bold typography
   - Complex gradients
   - Glassmorphism effects
   - Subtle animations

4. **Pattern-Based Shortcuts**
   - **G+key:** Go to location (navigation)
   - **O+key:** Open menu (actions)
   - **Cmd+K:** Command palette
   - **/** Focus search

**Recommendation for Hablas:**
- Implement command palette (highest priority)
- Add keyboard shortcuts for common actions
- Create shortcut help overlay (Cmd+?)
- Follow Linear's pattern conventions

---

### 3.2 Vercel Dashboard Patterns

#### Key Features (2025):

1. **Real-time Updates**
   - Live deployment status
   - WebSocket connections
   - Optimistic UI updates
   - Background sync

2. **Status Indicators**
   - Color-coded states (building, success, error)
   - Loading skeletons
   - Progress bars
   - Time estimates

```typescript
// Vercel-style deployment status
function DeploymentStatus({ status, progress }: Props) {
  const statusConfig = {
    building: {
      color: 'yellow',
      icon: <Loader className="animate-spin" />,
      message: 'Building...'
    },
    ready: {
      color: 'green',
      icon: <CheckCircle />,
      message: 'Deployment ready'
    },
    error: {
      color: 'red',
      icon: <XCircle />,
      message: 'Build failed'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`status-indicator status-${config.color}`}>
      {config.icon}
      <span>{config.message}</span>
      {progress && <ProgressBar value={progress} />}
    </div>
  );
}
```

3. **Minimal Design**
   - Ample white space
   - Clean lines
   - Limited color palette
   - Focus on content

4. **Progressive Disclosure**
   - Summary view by default
   - Expand for details
   - Lazy load heavy content
   - Infinite scroll for lists

**Recommendation for Hablas:**
- Add real-time save status updates
- Implement loading skeletons
- Use progressive disclosure for resource details
- Add deployment-style progress indicators

---

### 3.3 Stripe Dashboard Patterns

#### Core Strengths:

1. **Data Density with Clarity**
   - Lots of information, not cluttered
   - Strategic use of whitespace
   - Clear visual hierarchy
   - Scannable layouts

2. **Contextual Actions**
   - Hover to reveal actions
   - Inline editing
   - Bulk operations
   - Smart defaults

3. **Powerful Filtering**
   - Multiple filter types
   - Saved filter sets
   - URL state persistence
   - Real-time results

```typescript
// Stripe-style advanced filters
interface Filter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
}

function AdvancedFilters() {
  const [filters, setFilters] = useState<Filter[]>([]);

  function addFilter() {
    setFilters([...filters, {
      field: 'status',
      operator: 'equals',
      value: ''
    }]);
  }

  function applyFilters() {
    // Update URL params
    const params = new URLSearchParams();
    filters.forEach((filter, i) => {
      params.set(`filter[${i}][field]`, filter.field);
      params.set(`filter[${i}][op]`, filter.operator);
      params.set(`filter[${i}][value]`, filter.value);
    });
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="filters-panel">
      {filters.map((filter, i) => (
        <FilterRow
          key={i}
          filter={filter}
          onChange={(updated) => {
            const newFilters = [...filters];
            newFilters[i] = updated;
            setFilters(newFilters);
          }}
        />
      ))}
      <button onClick={addFilter}>Add filter</button>
      <button onClick={applyFilters}>Apply</button>
    </div>
  );
}
```

4. **Smart Tables**
   - Sortable columns
   - Resizable columns
   - Column visibility toggle
   - Row selection
   - Sticky headers

**Recommendation for Hablas:**
- Improve table UX with sorting/filtering
- Add column customization
- Implement bulk actions
- Add URL-based filter state

---

### 3.4 Tailwind UI & shadcn/ui Patterns (2024-2025)

#### shadcn/ui Philosophy:

**Not a component library** - You own the code
- Copy components into your codebase
- Full customization freedom
- No dependency constraints
- AI-friendly architecture

#### Key Benefits:

1. **Accessibility First**
   - Built on Radix UI primitives
   - ARIA attributes included
   - Keyboard navigation
   - Screen reader support

2. **Tailwind CSS Styling**
   - Utility-first approach
   - Easy theming
   - Dark mode support
   - Responsive by default

3. **TypeScript Native**
   - Full type safety
   - Better DX
   - IDE autocomplete

#### Popular Components for Admin:

```typescript
// shadcn/ui Command component (Cmd+K palette)
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Resources</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

#### 2024-2025 Updates:

- **New CLI (August 2024):** Complete rewrite
- **Themes:** Installable theme presets
- **Hooks & Utilities:** More than just components
- **AI Integration:** Works seamlessly with AI tools

**Recommendation for Hablas:**
- Adopt shadcn/ui for new components
- Use Command component for palette
- Leverage Radix UI for accessibility
- Implement dark mode theming

---

## 4. Review Workflow UX

### 4.1 Figma Comment & Review Mode

#### Key Patterns:

1. **Pin Comments to Location**
   - Click anywhere to add comment
   - Visual pin indicators
   - Thread discussions
   - Resolve system

2. **Review Mode Toggle**
   - Switch between edit/review
   - Different cursors
   - Limited interactions in review
   - Focus on feedback

3. **Presence Indicators**
   - Who's viewing
   - Live cursors
   - User avatars
   - Activity status

```typescript
// Presence system implementation
interface User {
  id: string;
  name: string;
  avatar: string;
  cursor?: { x: number; y: number };
}

function PresenceIndicators({ users }: { users: User[] }) {
  return (
    <div className="presence-container">
      {/* User avatars */}
      <div className="user-avatars">
        {users.slice(0, 3).map(user => (
          <Avatar key={user.id} src={user.avatar} alt={user.name} />
        ))}
        {users.length > 3 && (
          <div className="avatar-overflow">+{users.length - 3}</div>
        )}
      </div>

      {/* Live cursors */}
      {users.map(user => user.cursor && (
        <Cursor
          key={user.id}
          x={user.cursor.x}
          y={user.cursor.y}
          color={getUserColor(user.id)}
          label={user.name}
        />
      ))}
    </div>
  );
}
```

**Recommendation for Hablas:**
- Add comment pinning to content
- Implement review mode toggle
- Consider multi-user presence (future)

---

### 4.2 Google Docs Suggestion Mode

#### Core Features:

1. **Suggestion Tracking**
   - All edits become suggestions
   - Accept/reject individual changes
   - Batch accept/reject
   - Attribution to editor

2. **Version History**
   - Timeline view
   - Restore previous versions
   - Compare versions
   - Named versions

3. **Conflict Resolution**
   - Real-time conflict detection
   - Manual merge UI
   - Last-write-wins option
   - Operational transformation

```typescript
// Suggestion mode implementation
interface Suggestion {
  id: string;
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  oldContent?: string;
  author: User;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

function SuggestionMode({ content, suggestions, onChange }: Props) {
  const [mode, setMode] = useState<'editing' | 'suggesting'>('editing');

  function handleEdit(newContent: string) {
    if (mode === 'suggesting') {
      // Create suggestion instead of direct edit
      const diff = computeDiff(content, newContent);
      const suggestion: Suggestion = {
        id: generateId(),
        type: 'replace',
        position: diff.position,
        content: diff.newText,
        oldContent: diff.oldText,
        author: currentUser,
        timestamp: new Date(),
        status: 'pending'
      };
      addSuggestion(suggestion);
    } else {
      // Direct edit
      onChange(newContent);
    }
  }

  return (
    <div>
      <ModeToggle value={mode} onChange={setMode} />
      <Editor
        content={content}
        suggestions={suggestions}
        onEdit={handleEdit}
      />
    </div>
  );
}
```

**Recommendation for Hablas:**
- Add suggestion/approval workflow
- Implement version history
- Add conflict resolution UI
- Track editor attribution

---

### 4.3 Content Approval Workflows

**Patterns from WordPress, Contentful, Strapi:**

#### Status States:

```typescript
type ContentStatus =
  | 'draft'          // Initial state
  | 'in-review'      // Submitted for review
  | 'changes-requested' // Needs revision
  | 'approved'       // Ready to publish
  | 'published'      // Live
  | 'archived';      // Retired

interface ContentWorkflow {
  status: ContentStatus;
  transitions: {
    [K in ContentStatus]?: ContentStatus[];
  };
  permissions: {
    [K in ContentStatus]: string[]; // roles that can access
  };
}

const workflow: ContentWorkflow = {
  status: 'draft',
  transitions: {
    'draft': ['in-review'],
    'in-review': ['approved', 'changes-requested', 'draft'],
    'changes-requested': ['in-review', 'draft'],
    'approved': ['published', 'draft'],
    'published': ['archived', 'draft'],
    'archived': ['draft']
  },
  permissions: {
    'draft': ['editor', 'admin'],
    'in-review': ['reviewer', 'admin'],
    'changes-requested': ['editor', 'admin'],
    'approved': ['admin'],
    'published': ['admin'],
    'archived': ['admin']
  }
};
```

#### Review Checklist:

```typescript
interface ReviewChecklist {
  items: {
    id: string;
    label: string;
    required: boolean;
    checked: boolean;
    notes?: string;
  }[];
  canApprove: boolean; // All required items checked
}

function ReviewChecklistComponent({ checklist, onChange }: Props) {
  const requiredComplete = checklist.items
    .filter(item => item.required)
    .every(item => item.checked);

  return (
    <div className="review-checklist">
      <h3>Review Checklist</h3>
      {checklist.items.map(item => (
        <div key={item.id} className="checklist-item">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(e) => {
              onChange({
                ...checklist,
                items: checklist.items.map(i =>
                  i.id === item.id
                    ? { ...i, checked: e.target.checked }
                    : i
                )
              });
            }}
          />
          <label>
            {item.label}
            {item.required && <span className="required">*</span>}
          </label>
          {item.checked && (
            <input
              type="text"
              placeholder="Add notes..."
              value={item.notes || ''}
              onChange={(e) => {
                onChange({
                  ...checklist,
                  items: checklist.items.map(i =>
                    i.id === item.id
                      ? { ...i, notes: e.target.value }
                      : i
                  )
                });
              }}
            />
          )}
        </div>
      ))}

      <button
        disabled={!requiredComplete}
        onClick={onApprove}
      >
        Approve for Publishing
      </button>
    </div>
  );
}
```

**Recommendation for Hablas:**
- Implement status-based workflow
- Add review checklists
- Create approval process
- Add change request feedback loop

---

## 5. Editor Features & Patterns

### 5.1 Autosave Strategies

#### Modern Best Practices (2024):

1. **Debouncing** (Current Hablas implementation)
   ```typescript
   // Simple debounce - waits for typing to stop
   const debouncedSave = useDebouncedCallback(
     (content) => saveContent(content),
     2000 // 2 second delay
   );
   ```

   **Pros:** Simple, reduces server load
   **Cons:** Data loss if browser crashes during delay

2. **Throttling with Immediate Debounce**
   ```typescript
   // Saves at most every X seconds, but also on typing stop
   function useSmartAutoSave(content, saveInterval = 5000) {
     const lastSaveRef = useRef(Date.now());
     const timeoutRef = useRef<NodeJS.Timeout>();

     useEffect(() => {
       const now = Date.now();
       const timeSinceLastSave = now - lastSaveRef.current;

       // Clear existing timeout
       if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
       }

       if (timeSinceLastSave >= saveInterval) {
         // Save immediately if enough time passed
         saveContent(content);
         lastSaveRef.current = now;
       } else {
         // Debounce, but max wait is remaining interval time
         const remainingTime = saveInterval - timeSinceLastSave;
         timeoutRef.current = setTimeout(() => {
           saveContent(content);
           lastSaveRef.current = Date.now();
         }, Math.min(2000, remainingTime));
       }
     }, [content]);
   }
   ```

   **Pros:** Balance between saves and server load
   **Cons:** More complex

3. **Optimistic Updates** (Recommended)
   ```typescript
   function useOptimisticSave() {
     const [localContent, setLocalContent] = useState(initialContent);
     const [serverContent, setServerContent] = useState(initialContent);
     const [isSaving, setIsSaving] = useState(false);
     const [error, setError] = useState<Error | null>(null);

     async function save(content: string) {
       // Update UI immediately (optimistic)
       setLocalContent(content);
       setIsSaving(true);
       setError(null);

       try {
         await saveToServer(content);
         setServerContent(content); // Confirm save
       } catch (err) {
         setError(err);
         // Revert to last known good state
         setLocalContent(serverContent);
         showErrorNotification('Failed to save. Your changes have been reverted.');
       } finally {
         setIsSaving(false);
       }
     }

     return { localContent, isSaving, error, save };
   }
   ```

   **Pros:** Best UX, immediate feedback
   **Cons:** Requires rollback on failure

4. **IndexedDB Backup** (Belt and suspenders)
   ```typescript
   import { openDB } from 'idb';

   async function saveToDraft(content: string) {
     const db = await openDB('content-drafts', 1, {
       upgrade(db) {
         db.createObjectStore('drafts');
       }
     });

     await db.put('drafts', {
       content,
       timestamp: Date.now()
     }, 'current');
   }

   async function restoreDraft() {
     const db = await openDB('content-drafts', 1);
     const draft = await db.get('drafts', 'current');
     return draft;
   }

   // Use with autosave
   function useAutoSaveWithBackup(content: string) {
     useEffect(() => {
       // Save to IndexedDB immediately (no network)
       saveToDraft(content);

       // Debounce server save
       const timeout = setTimeout(() => {
         saveToServer(content);
       }, 2000);

       return () => clearTimeout(timeout);
     }, [content]);
   }
   ```

   **Pros:** Survives crashes, offline support
   **Cons:** Additional complexity

#### Conflict Resolution:

```typescript
interface ConflictResolution {
  localVersion: string;
  serverVersion: string;
  lastSyncedVersion: string;
  timestamp: Date;
}

function detectConflict(
  local: string,
  server: string,
  lastSynced: string
): boolean {
  return local !== lastSynced && server !== lastSynced;
}

function ConflictResolver({ conflict, onResolve }: Props) {
  const [resolution, setResolution] = useState<'local' | 'server' | 'manual'>('manual');

  if (resolution === 'manual') {
    return (
      <div className="conflict-resolver">
        <h3>Conflict Detected</h3>
        <p>The content was modified by another user while you were editing.</p>

        <div className="conflict-options">
          <button onClick={() => setResolution('local')}>
            Keep My Changes
          </button>
          <button onClick={() => setResolution('server')}>
            Use Server Version
          </button>
        </div>

        <div className="conflict-diff">
          <h4>Your Version:</h4>
          <pre>{conflict.localVersion}</pre>

          <h4>Server Version:</h4>
          <pre>{conflict.serverVersion}</pre>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (resolution !== 'manual') {
      const resolvedContent = resolution === 'local'
        ? conflict.localVersion
        : conflict.serverVersion;
      onResolve(resolvedContent);
    }
  }, [resolution]);

  return null;
}
```

**Recommendation for Hablas:**
- Upgrade to optimistic updates
- Add IndexedDB backup for safety
- Implement conflict detection
- Show clear save status indicators

---

### 5.2 Keyboard Shortcuts

#### Standard Shortcuts (Cross-platform):

```typescript
const standardShortcuts = {
  // Editing
  'Cmd+B': 'Bold',
  'Cmd+I': 'Italic',
  'Cmd+U': 'Underline',
  'Cmd+K': 'Insert link',
  'Cmd+Z': 'Undo',
  'Cmd+Shift+Z': 'Redo',

  // Navigation
  'Cmd+F': 'Find',
  'Cmd+G': 'Find next',
  'Cmd+Shift+G': 'Find previous',

  // File operations
  'Cmd+S': 'Save',
  'Cmd+P': 'Print',
  'Cmd+O': 'Open',

  // Application
  'Cmd+K': 'Command palette',
  'Cmd+/': 'Show shortcuts',
  'Esc': 'Close dialog',
};
```

#### Discoverability Patterns:

1. **Tooltip Hints**
   ```typescript
   <button title="Save (Cmd+S)">
     <Save />
     Save
   </button>
   ```

2. **Shortcut Help Overlay** (Cmd+/)
   ```typescript
   function ShortcutHelp() {
     const shortcuts = Object.entries(standardShortcuts);
     const grouped = groupBy(shortcuts, ([_, desc]) =>
       getCategory(desc)
     );

     return (
       <Dialog>
         <h2>Keyboard Shortcuts</h2>
         {Object.entries(grouped).map(([category, shortcuts]) => (
           <div key={category}>
             <h3>{category}</h3>
             <table>
               {shortcuts.map(([key, desc]) => (
                 <tr key={key}>
                   <td><kbd>{key}</kbd></td>
                   <td>{desc}</td>
                 </tr>
               ))}
             </table>
           </div>
         ))}
       </Dialog>
     );
   }
   ```

3. **In-app Hints**
   - First-time user tutorials
   - Contextual tips
   - Progressive disclosure

**Recommendation for Hablas:**
- Add comprehensive keyboard shortcuts
- Create shortcut help overlay
- Show shortcuts in tooltips
- Follow platform conventions

---

### 5.3 Command Palettes (Cmd+K)

**Why Command Palettes Matter:**
- Single entry point for all actions
- Keyboard-first workflow
- Reduced UI clutter
- Discoverable features
- Context-aware

#### Implementation Guide:

```typescript
// Complete command palette system
import { useCommandPalette } from '@/hooks/useCommandPalette';

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  keywords: string[];
  action: () => void | Promise<void>;
  group: string;
  shortcut?: string;
  condition?: () => boolean; // Show only if true
}

// Define all commands
const commands: Command[] = [
  // Navigation
  {
    id: 'nav-dashboard',
    title: 'Go to Dashboard',
    icon: <Home />,
    keywords: ['home', 'dashboard', 'main'],
    action: () => router.push('/admin'),
    group: 'Navigation',
    shortcut: 'g d'
  },
  {
    id: 'nav-resources',
    title: 'Go to Resources',
    icon: <FileText />,
    keywords: ['resources', 'content', 'list'],
    action: () => router.push('/admin/resources'),
    group: 'Navigation',
    shortcut: 'g r'
  },

  // Actions
  {
    id: 'action-new-resource',
    title: 'Create New Resource',
    icon: <Plus />,
    keywords: ['new', 'create', 'add', 'resource'],
    action: () => openNewResourceDialog(),
    group: 'Actions'
  },
  {
    id: 'action-save',
    title: 'Save Changes',
    icon: <Save />,
    keywords: ['save', 'commit'],
    action: () => saveCurrentDocument(),
    group: 'Actions',
    shortcut: 'Cmd+S',
    condition: () => hasUnsavedChanges
  },

  // Settings
  {
    id: 'settings-theme',
    title: 'Toggle Dark Mode',
    icon: <Moon />,
    keywords: ['theme', 'dark', 'light', 'mode'],
    action: () => toggleTheme(),
    group: 'Settings'
  },

  // Search
  {
    id: 'search-resources',
    title: 'Search Resources...',
    icon: <Search />,
    keywords: ['search', 'find', 'query'],
    action: () => openSearchDialog(),
    group: 'Search',
    shortcut: 'Cmd+Shift+F'
  }
];

// Hook implementation
function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentCommands, setRecentCommands] = useLocalStorage<string[]>(
    'recent-commands',
    []
  );

  // Fuzzy search
  const filteredCommands = useMemo(() => {
    if (!query) {
      // Show recent commands
      return commands.filter(cmd => recentCommands.includes(cmd.id));
    }

    const lowerQuery = query.toLowerCase();
    return commands
      .filter(cmd => cmd.condition?.() ?? true)
      .filter(cmd =>
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => {
        // Prioritize title matches over keyword matches
        const aTitle = a.title.toLowerCase().startsWith(lowerQuery);
        const bTitle = b.title.toLowerCase().startsWith(lowerQuery);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return 0;
      });
  }, [query, recentCommands]);

  // Group commands
  const groupedCommands = useMemo(() => {
    const groups = new Map<string, Command[]>();
    filteredCommands.forEach(cmd => {
      const existing = groups.get(cmd.group) || [];
      groups.set(cmd.group, [...existing, cmd]);
    });
    return groups;
  }, [filteredCommands]);

  // Execute command
  async function executeCommand(cmd: Command) {
    // Add to recent
    setRecentCommands(prev => [
      cmd.id,
      ...prev.filter(id => id !== cmd.id).slice(0, 9)
    ]);

    // Close palette
    setIsOpen(false);
    setQuery('');

    // Run action
    await cmd.action();
  }

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    groupedCommands,
    executeCommand
  };
}

// Component
function CommandPalette() {
  const {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    groupedCommands,
    executeCommand
  } = useCommandPalette();

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Flatten for navigation
  const allCommands = Array.from(groupedCommands.values()).flat();

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, allCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allCommands[selectedIndex]) {
          executeCommand(allCommands[selectedIndex]);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allCommands]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="command-palette"
    >
      <div className="command-palette-header">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Type a command or search..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          autoFocus
        />
        <kbd>Esc</kbd>
      </div>

      <div className="command-palette-results">
        {groupedCommands.size === 0 ? (
          <div className="no-results">
            No commands found for "{query}"
          </div>
        ) : (
          Array.from(groupedCommands.entries()).map(([group, commands]) => (
            <div key={group} className="command-group">
              <div className="group-label">{group}</div>
              {commands.map((cmd, i) => {
                const globalIndex = allCommands.indexOf(cmd);
                return (
                  <button
                    key={cmd.id}
                    className={`command-item ${globalIndex === selectedIndex ? 'selected' : ''}`}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                  >
                    {cmd.icon && <span className="command-icon">{cmd.icon}</span>}
                    <div className="command-content">
                      <div className="command-title">{cmd.title}</div>
                      {cmd.subtitle && (
                        <div className="command-subtitle">{cmd.subtitle}</div>
                      )}
                    </div>
                    {cmd.shortcut && (
                      <kbd className="command-shortcut">{cmd.shortcut}</kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div className="command-palette-footer">
        <div className="footer-hint">
          <kbd>↑</kbd> <kbd>↓</kbd> to navigate
          <kbd>↵</kbd> to select
          <kbd>Esc</kbd> to close
        </div>
      </div>
    </Dialog>
  );
}
```

**Styling (Tailwind CSS):**

```css
.command-palette {
  @apply fixed inset-0 z-50 flex items-start justify-center pt-[20vh];
  background: rgba(0, 0, 0, 0.5);
}

.command-palette > div {
  @apply bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden;
}

.command-palette-header {
  @apply flex items-center gap-3 px-4 py-3 border-b border-gray-200;
}

.search-icon {
  @apply w-5 h-5 text-gray-400;
}

.command-palette-header input {
  @apply flex-1 text-lg outline-none;
}

.command-palette-results {
  @apply max-h-96 overflow-y-auto;
}

.command-group {
  @apply py-2;
}

.group-label {
  @apply px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide;
}

.command-item {
  @apply w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 transition-colors;
}

.command-item.selected {
  @apply bg-blue-50;
}

.command-icon {
  @apply w-5 h-5 text-gray-600;
}

.command-content {
  @apply flex-1;
}

.command-title {
  @apply text-sm font-medium text-gray-900;
}

.command-subtitle {
  @apply text-xs text-gray-500;
}

.command-shortcut {
  @apply px-2 py-1 text-xs font-mono bg-gray-100 rounded;
}

.command-palette-footer {
  @apply px-4 py-2 border-t border-gray-200 bg-gray-50;
}

.footer-hint {
  @apply flex items-center gap-2 text-xs text-gray-600;
}

.footer-hint kbd {
  @apply px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono;
}
```

**Recommendation for Hablas:**
- Implement command palette as highest priority
- Start with essential commands
- Add search functionality
- Track recent commands
- Make it context-aware

---

### 5.4 Distraction-Free Mode

#### Implementation:

```typescript
function DistractionFreeMode() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  // Toggle fullscreen
  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  // Auto-hide toolbar
  const { showToolbar: autoShowToolbar } = useAutoHideToolbar({
    delay: 2000,
    enabled: isFullscreen
  });

  return (
    <div className={`editor-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Toolbar - auto-hides in fullscreen */}
      <div className={`toolbar ${isFullscreen && !autoShowToolbar ? 'hidden' : ''}`}>
        <button onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}
          {isFullscreen ? 'Exit' : 'Focus Mode'}
        </button>
      </div>

      {/* Editor - centered in fullscreen */}
      <div className="editor-wrapper">
        <Editor />
      </div>
    </div>
  );
}

// Auto-hide hook
function useAutoHideToolbar({ delay, enabled }: Props) {
  const [showToolbar, setShowToolbar] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) {
      setShowToolbar(true);
      return;
    }

    function handleMouseMove() {
      setShowToolbar(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setShowToolbar(false);
      }, delay);
    }

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, delay]);

  return { showToolbar };
}
```

**CSS for Distraction-Free:**

```css
.editor-container.fullscreen {
  @apply fixed inset-0 z-50 bg-white;
}

.editor-container.fullscreen .editor-wrapper {
  @apply max-w-4xl mx-auto py-20 px-8;
}

.editor-container.fullscreen .toolbar {
  @apply fixed top-0 inset-x-0 transition-transform duration-300;
}

.editor-container.fullscreen .toolbar.hidden {
  @apply -translate-y-full;
}

/* Smooth transitions */
.toolbar {
  @apply transition-all duration-300;
}
```

**Recommendation for Hablas:**
- Add fullscreen/focus mode toggle
- Auto-hide UI elements
- Keep essential shortcuts accessible
- Center content in fullscreen

---

## 6. Status & Feedback Patterns

### 6.1 Save Status Indicators

**Modern Patterns (2024):**

```typescript
type SaveStatus =
  | 'saved'           // All changes persisted
  | 'saving'          // Save in progress
  | 'unsaved'         // Local changes not saved
  | 'error'           // Save failed
  | 'offline';        // Network unavailable

function SaveStatusIndicator({ status, lastSaved }: Props) {
  const config = {
    saved: {
      icon: <CheckCircle className="text-green-600" />,
      text: 'All changes saved',
      color: 'green'
    },
    saving: {
      icon: <Loader2 className="text-blue-600 animate-spin" />,
      text: 'Saving...',
      color: 'blue'
    },
    unsaved: {
      icon: <Circle className="text-yellow-600" />,
      text: 'Unsaved changes',
      color: 'yellow'
    },
    error: {
      icon: <XCircle className="text-red-600" />,
      text: 'Failed to save',
      color: 'red'
    },
    offline: {
      icon: <WifiOff className="text-gray-600" />,
      text: 'Offline - will sync when online',
      color: 'gray'
    }
  };

  const current = config[status];

  return (
    <div className={`save-status status-${current.color}`}>
      {current.icon}
      <span>{current.text}</span>
      {status === 'saved' && lastSaved && (
        <span className="last-saved">
          {formatRelativeTime(lastSaved)}
        </span>
      )}
      {status === 'error' && (
        <button onClick={retry} className="retry-button">
          Retry
        </button>
      )}
    </div>
  );
}
```

**Placement Options:**
1. **Header bar** - Persistent visibility
2. **Bottom bar** - Non-intrusive
3. **Floating badge** - Minimal
4. **Inline with title** - Contextual

**Recommendation for Hablas:**
- Show persistent save status in header
- Add timestamp for last save
- Include retry button on errors
- Handle offline gracefully

---

### 6.2 Toast Notifications vs Inline Feedback

#### When to Use Each:

**Toast Notifications:**
- ✅ Success confirmations (saved, deleted, etc.)
- ✅ Non-critical errors
- ✅ Background tasks completed
- ✅ Undo actions

**Inline Feedback:**
- ✅ Form validation errors
- ✅ Critical errors that block workflow
- ✅ Required field indicators
- ✅ Character limits

#### Implementation:

```typescript
// Toast system with shadcn/ui
import { useToast } from "@/components/ui/use-toast"

function useContentSave() {
  const { toast } = useToast();

  async function saveContent(content: string) {
    try {
      await api.saveContent(content);

      toast({
        title: "Content saved",
        description: "All changes have been saved successfully.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
        action: <button onClick={() => saveContent(content)}>Retry</button>
      });
    }
  }

  return { saveContent };
}

// Inline validation
function FormField({ value, onChange, required }: Props) {
  const [error, setError] = useState<string>('');

  function validate(val: string) {
    if (required && !val) {
      setError('This field is required');
      return false;
    }
    setError('');
    return true;
  }

  return (
    <div className="form-field">
      <label>
        Title {required && <span className="required">*</span>}
      </label>
      <input
        value={value}
        onChange={e => {
          onChange(e.target.value);
          validate(e.target.value);
        }}
        className={error ? 'error' : ''}
      />
      {error && (
        <div className="error-message">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
```

**Recommendation for Hablas:**
- Use toasts for save confirmations
- Inline errors for validation
- Add undo to destructive toasts
- Limit toast duration to 3-5 seconds

---

### 6.3 Progress Indicators

**Types:**

1. **Determinate** (known duration)
   ```typescript
   function ProgressBar({ current, total }: Props) {
     const percentage = (current / total) * 100;

     return (
       <div className="progress-bar">
         <div className="progress-track">
           <div
             className="progress-fill"
             style={{ width: `${percentage}%` }}
           />
         </div>
         <span className="progress-label">
           {current} of {total} ({Math.round(percentage)}%)
         </span>
       </div>
     );
   }
   ```

2. **Indeterminate** (unknown duration)
   ```typescript
   function Spinner() {
     return (
       <div className="spinner-container">
         <Loader2 className="animate-spin" />
         <span>Processing...</span>
       </div>
     );
   }
   ```

3. **Loading Skeletons** (Content placeholder)
   ```typescript
   function ResourceListSkeleton() {
     return (
       <div className="resource-list">
         {[...Array(5)].map((_, i) => (
           <div key={i} className="resource-card skeleton">
             <div className="skeleton-title" />
             <div className="skeleton-text" />
             <div className="skeleton-text short" />
           </div>
         ))}
       </div>
     );
   }
   ```

**Recommendation for Hablas:**
- Use skeletons for initial page loads
- Progress bars for uploads/processing
- Spinners for quick operations
- Always provide cancel option for long operations

---

## 7. Mobile/Responsive Admin

### 7.1 Touch Optimization

**Minimum Touch Target Sizes (2024):**
- **iOS:** 44x44 pixels
- **Android:** 48x48 pixels
- **Web (WCAG):** 44x44 pixels

```css
/* Touch-friendly button */
.touch-target {
  @apply min-w-[44px] min-h-[44px] p-3;
}

/* Increased tap area without visual change */
.touch-expanded {
  position: relative;
}

.touch-expanded::before {
  content: '';
  position: absolute;
  inset: -8px; /* Expand by 8px in all directions */
  cursor: pointer;
}
```

#### Thumb-Friendly Zones:

```typescript
// Mobile navigation should be bottom-aligned
function MobileNav() {
  return (
    <nav className="mobile-nav">
      {/* Fixed to bottom */}
      <div className="nav-container">
        <NavButton icon={<Home />} label="Home" />
        <NavButton icon={<Search />} label="Search" />
        <NavButton icon={<Plus />} label="Create" />
        <NavButton icon={<User />} label="Profile" />
      </div>
    </nav>
  );
}
```

```css
.mobile-nav {
  @apply fixed bottom-0 inset-x-0 z-40;
  @apply bg-white border-t border-gray-200;
  /* Safe area for notched phones */
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-container {
  @apply flex justify-around items-center p-2;
}
```

---

### 7.2 Responsive Breakpoints (2024 Standards)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '375px',   // Small phones
      'sm': '640px',   // Large phones
      'md': '768px',   // Tablets
      'lg': '1024px',  // Laptops
      'xl': '1280px',  // Desktops
      '2xl': '1536px', // Large desktops
    }
  }
}
```

#### Responsive Admin Dashboard:

```typescript
function ResponsiveAdminDashboard() {
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  return (
    <div className="admin-dashboard">
      {/* Mobile: Hamburger menu */}
      {isMobile ? (
        <MobileHeader />
      ) : (
        <DesktopHeader />
      )}

      {/* Mobile: Stack stats vertically */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={100} />
        <StatCard title="Pending" value={25} />
        <StatCard title="Approved" value={60} />
        <StatCard title="Rejected" value={15} />
      </div>

      {/* Mobile: Card view, Desktop: Table */}
      {isMobile ? (
        <ResourceCardList resources={resources} />
      ) : (
        <ResourceTable resources={resources} />
      )}
    </div>
  );
}
```

---

### 7.3 Mobile Gestures

**Standard Gestures:**
- **Swipe:** Navigate between items
- **Pull-to-refresh:** Update content
- **Long-press:** Show context menu
- **Pinch-to-zoom:** Enlarge content

```typescript
// Swipe gesture hook
function useSwipeGesture(onSwipeLeft?: () => void, onSwipeRight?: () => void) {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const minSwipeDistance = 50;

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd() {
    if (touchStartX.current - touchEndX.current > minSwipeDistance) {
      onSwipeLeft?.();
    }

    if (touchEndX.current - touchStartX.current > minSwipeDistance) {
      onSwipeRight?.();
    }
  }

  function onTouchMove(e: TouchEvent) {
    touchEndX.current = e.touches[0].clientX;
  }

  return { onTouchStart, onTouchMove, onTouchEnd };
}

// Usage
function MobileResourceViewer({ resources, currentIndex }: Props) {
  const swipeHandlers = useSwipeGesture(
    () => setCurrentIndex(i => Math.min(i + 1, resources.length - 1)),
    () => setCurrentIndex(i => Math.max(i - 1, 0))
  );

  return (
    <div {...swipeHandlers}>
      <Resource data={resources[currentIndex]} />
    </div>
  );
}
```

---

### 7.4 Progressive Web App (PWA) Patterns

**Offline Support:**

```typescript
// Service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('SW registered:', registration);
    })
    .catch(error => {
      console.error('SW registration failed:', error);
    });
}

// Offline indicator
function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="offline-banner">
      <WifiOff className="w-4 h-4" />
      You're offline. Changes will sync when you're back online.
    </div>
  );
}
```

**Recommendation for Hablas:**
- Make admin dashboard PWA-ready
- Support offline editing with sync
- Add install prompt for mobile users
- Optimize for touch throughout

---

## 8. Accessibility (A11y) Best Practices

### 8.1 Keyboard Navigation

**Requirements:**
- All interactive elements focusable
- Logical tab order
- Focus indicators visible
- Skip links for main content

```typescript
// Focus management
function Modal({ isOpen, onClose, children }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen) return;

    // Store previous focus
    previousFocus.current = document.activeElement as HTMLElement;

    // Focus first element in modal
    const firstFocusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    firstFocusable?.focus();

    // Restore focus on close
    return () => {
      previousFocus.current?.focus();
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {children}
    </div>
  );
}
```

---

### 8.2 Screen Reader Support

**ARIA Attributes:**

```typescript
// Accessible button with loading state
function SaveButton({ isSaving, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={isSaving}
      aria-busy={isSaving}
      aria-label={isSaving ? 'Saving content' : 'Save content'}
    >
      {isSaving ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Save aria-hidden="true" />
          <span>Save</span>
        </>
      )}
    </button>
  );
}

// Accessible form field
function FormField({ label, error, required, ...props }: Props) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
        {...props}
      />
      {error && (
        <div id={errorId} role="alert" className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}
```

---

### 8.3 Color Contrast & Visual Design

**WCAG 2.1 Requirements:**
- **AA (minimum):** 4.5:1 for normal text, 3:1 for large text
- **AAA (enhanced):** 7:1 for normal text, 4.5:1 for large text

```css
/* Good contrast examples */
.button-primary {
  background: #0066cc; /* Blue */
  color: #ffffff;      /* White */
  /* Contrast ratio: 8.59:1 (AAA) */
}

.text-primary {
  color: #1a1a1a;     /* Almost black */
  background: #ffffff; /* White */
  /* Contrast ratio: 17.42:1 (AAA) */
}

.text-secondary {
  color: #666666;     /* Gray */
  background: #ffffff; /* White */
  /* Contrast ratio: 5.74:1 (AA) */
}

/* Don't rely on color alone */
.status-error {
  color: #dc2626; /* Red */
  /* Also use icon */
}
.status-error::before {
  content: '⚠';
  margin-right: 0.5rem;
}
```

**Recommendation for Hablas:**
- Audit all text/background color combos
- Add focus indicators to all interactive elements
- Include skip links
- Test with screen readers
- Provide text alternatives for icons

---

## 9. Performance Optimization

### 9.1 Code Splitting

```typescript
// Lazy load heavy editors
const MonacoEditor = lazy(() => import('./MonacoEditor'));
const BlockNoteEditor = lazy(() => import('./BlockNoteEditor'));

function ContentEditor({ type }: Props) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      {type === 'code' ? (
        <MonacoEditor />
      ) : (
        <BlockNoteEditor />
      )}
    </Suspense>
  );
}
```

---

### 9.2 Virtual Scrolling

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualResourceList({ resources }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: resources.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated row height
    overscan: 5, // Render 5 extra rows for smooth scrolling
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ResourceCard resource={resources[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 9.3 Image Optimization

```typescript
import Image from 'next/image';

function OptimizedImage({ src, alt }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL="data:image/..." // Low quality placeholder
      loading="lazy"
      quality={85} // Balance between size and quality
    />
  );
}
```

**Recommendation for Hablas:**
- Lazy load Monaco/BlockNote editors
- Use virtual scrolling for long resource lists
- Optimize images with Next.js Image component
- Code split routes and heavy components

---

## 10. Actionable Recommendations for Hablas

### Priority 1: High Impact, Quick Wins

1. **Command Palette (Cmd+K)** - Week 1
   - Implement using shadcn/ui Command component
   - Add navigation, actions, and search commands
   - Enable with Cmd+K shortcut
   - **Impact:** Massive productivity boost for power users

2. **Word-Level Diff Highlighting** - Week 1
   - Upgrade from line-level to word/character-level
   - Use `react-diff-viewer-continued` library
   - Add split/unified view toggle
   - **Impact:** Better change visibility, faster reviews

3. **Keyboard Shortcuts** - Week 2
   - Add Cmd+S (save), Cmd+/ (help), Cmd+K (palette)
   - Create shortcut help overlay
   - Show shortcuts in tooltips
   - **Impact:** Faster workflows, better UX

4. **Optimistic UI Updates** - Week 2
   - Implement optimistic saves with rollback
   - Add IndexedDB backup for crash recovery
   - Improve save status indicators
   - **Impact:** Feels faster, prevents data loss

### Priority 2: Medium Impact, Moderate Effort

5. **Mobile Optimization** - Week 3-4
   - Increase touch target sizes to 44x44px
   - Implement bottom navigation for mobile
   - Add swipe gestures for navigation
   - Make tables responsive (card view on mobile)
   - **Impact:** Better mobile experience

6. **shadcn/ui Component Migration** - Week 3-4
   - Replace custom components with shadcn/ui
   - Improve accessibility automatically
   - Add dark mode support
   - **Impact:** Better accessibility, consistent design

7. **Loading States & Skeletons** - Week 4
   - Add loading skeletons for page loads
   - Improve progress indicators
   - Add better error states
   - **Impact:** Perceived performance improvement

### Priority 3: Long-term, High Value

8. **Monaco Editor Integration** - Month 2
   - Add Monaco for advanced editing
   - Lazy load to prevent bundle bloat
   - Enable syntax highlighting for code
   - **Impact:** Professional-grade editing

9. **Block-Based Editor (Optional)** - Month 2-3
   - Integrate BlockNote for rich content
   - Add slash commands for formatting
   - Enable drag-and-drop blocks
   - **Impact:** Modern editing experience

10. **Collaborative Features** - Month 3+
    - Add presence indicators
    - Implement suggestion mode
    - Add inline comments
    - Real-time collaboration (WebSockets)
    - **Impact:** Team collaboration

---

## 11. Code Examples & Snippets

### Complete Mini-Component Library

See inline code examples throughout this document for:
- ✅ Command Palette implementation
- ✅ Keyboard shortcut system
- ✅ Autosave with optimistic updates
- ✅ Conflict resolution UI
- ✅ Diff viewer upgrades
- ✅ Mobile gesture handlers
- ✅ Accessibility patterns
- ✅ Progressive disclosure
- ✅ Loading states
- ✅ Virtual scrolling

---

## 12. Resources & References

### Design Systems
- [Linear Design System](https://linear.app)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Tailwind UI](https://tailwindui.com)

### Libraries
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- [BlockNote](https://www.blocknotejs.org/)
- [react-diff-viewer-continued](https://github.com/aeaton/react-diff-viewer-continued)
- [diff-match-patch](https://github.com/google/diff-match-patch)

### Documentation
- [GitHub Code Review](https://github.com/features/code-review)
- [Figma Help Center](https://help.figma.com)
- [Notion Help](https://www.notion.so/help)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Articles
- [Command Palette Interfaces](https://philipcdavis.com/writing/command-palette-interfaces)
- [How to Build a Remarkable Command Palette](https://blog.superhuman.com/how-to-build-a-remarkable-command-palette/)
- [Designing Keyboard Shortcuts](https://golsteyn.com/writing/designing-keyboard-shortcuts/)

---

## Conclusion

Modern content editing and admin dashboard UX in 2024-2025 prioritizes:
1. **Keyboard-first workflows** (command palettes, shortcuts)
2. **Visual clarity** (advanced diffs, clear status indicators)
3. **Performance** (optimistic updates, lazy loading)
4. **Accessibility** (WCAG 2.1, screen readers, keyboard navigation)
5. **Mobile responsiveness** (touch optimization, PWA)

For Hablas specifically, the highest-impact improvements are:
- **Command palette** for power users
- **Word-level diff** for better reviews
- **Keyboard shortcuts** for efficiency
- **Optimistic saves** for reliability
- **Mobile optimization** for broader access

Implementing these patterns will bring Hablas to parity with industry-leading tools while maintaining its unique focus on language learning content review.

---

**Next Steps:**
1. Review this document with the team
2. Prioritize recommendations based on resources
3. Create implementation tickets
4. Begin with Priority 1 items
5. Iterate and gather user feedback
