# Quick Reference: Code Snippets for UI/UX Improvements

**Copy-paste ready code examples for Hablas UI/UX improvements**

---

## 1. Command Palette (Cmd+K)

### Install Dependencies
```bash
npx shadcn-ui@latest add command
npm install cmdk
```

### Complete Implementation

**File: `/components/CommandPalette.tsx`**

```typescript
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Home,
  FileText,
  Search,
  Settings,
  Plus,
  Save,
  BookOpen,
} from 'lucide-react';

interface Command {
  id: string;
  title: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  group: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle with Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const commands: Command[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      icon: <Home className="w-4 h-4" />,
      action: () => {
        router.push('/admin');
        setOpen(false);
      },
      keywords: ['dashboard', 'home', 'main'],
      group: 'Navigation',
    },
    {
      id: 'nav-resources',
      title: 'Browse Resources',
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        router.push('/admin/resources');
        setOpen(false);
      },
      keywords: ['resources', 'content', 'list'],
      group: 'Navigation',
    },
    {
      id: 'nav-topics',
      title: 'Browse Topics',
      icon: <BookOpen className="w-4 h-4" />,
      action: () => {
        router.push('/admin/topics');
        setOpen(false);
      },
      keywords: ['topics', 'categories'],
      group: 'Navigation',
    },
    // Actions
    {
      id: 'action-new',
      title: 'Create New Resource',
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        router.push('/admin/new');
        setOpen(false);
      },
      keywords: ['new', 'create', 'add'],
      group: 'Actions',
    },
    {
      id: 'action-search',
      title: 'Search Resources',
      icon: <Search className="w-4 h-4" />,
      action: () => {
        document.getElementById('search-input')?.focus();
        setOpen(false);
      },
      keywords: ['search', 'find', 'query'],
      group: 'Actions',
    },
  ], [router]);

  const groupedCommands = useMemo(() => {
    const groups = new Map<string, Command[]>();
    commands.forEach((cmd) => {
      const existing = groups.get(cmd.group) || [];
      groups.set(cmd.group, [...existing, cmd]);
    });
    return groups;
  }, [commands]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Array.from(groupedCommands.entries()).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((cmd) => (
              <CommandItem
                key={cmd.id}
                onSelect={cmd.action}
                className="flex items-center gap-2"
              >
                {cmd.icon}
                <span>{cmd.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
```

**Usage in layout:**

```typescript
// app/layout.tsx
import { CommandPalette } from '@/components/CommandPalette';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CommandPalette />
        {children}
      </body>
    </html>
  );
}
```

---

## 2. Word-Level Diff Viewer

### Install
```bash
npm install react-diff-viewer-continued
```

### Replace DiffHighlighter

**File: `/components/content-review/DiffHighlighter.tsx`**

```typescript
'use client';

import React from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

interface DiffHighlighterProps {
  original: string;
  edited: string;
  className?: string;
}

export const DiffHighlighter: React.FC<DiffHighlighterProps> = ({
  original,
  edited,
  className = '',
}) => {
  return (
    <div className={`diff-highlighter ${className}`}>
      <ReactDiffViewer
        oldValue={original}
        newValue={edited}
        splitView={true}
        compareMethod={DiffMethod.WORDS}
        showDiffOnly={false}
        leftTitle="Original"
        rightTitle="Edited"
        styles={{
          variables: {
            light: {
              diffViewerBackground: '#fff',
              addedBackground: '#e6ffed',
              addedColor: '#24292e',
              removedBackground: '#ffeef0',
              removedColor: '#24292e',
              wordAddedBackground: '#acf2bd',
              wordRemovedBackground: '#fdb8c0',
            },
          },
          line: {
            padding: '8px 4px',
          },
        }}
      />
    </div>
  );
};
```

**Optional: Split/Unified Toggle**

```typescript
import { useState } from 'react';
import { Columns2, Rows3 } from 'lucide-react';

export const DiffHighlighter: React.FC<DiffHighlighterProps> = ({
  original,
  edited,
}) => {
  const [splitView, setSplitView] = useState(true);

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setSplitView(!splitView)}
          className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded"
        >
          {splitView ? <Rows3 className="w-4 h-4" /> : <Columns2 className="w-4 h-4" />}
          {splitView ? 'Unified' : 'Split'}
        </button>
      </div>
      <ReactDiffViewer
        oldValue={original}
        newValue={edited}
        splitView={splitView}
        compareMethod={DiffMethod.WORDS}
      />
    </div>
  );
};
```

---

## 3. Keyboard Shortcuts System

### Global Shortcuts Hook

**File: `/lib/hooks/useKeyboardShortcuts.ts`**

```typescript
import { useEffect } from 'react';

interface ShortcutConfig {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Build key combination string
      let combo = '';
      if (modKey) combo += 'cmd+';
      if (e.shiftKey) combo += 'shift+';
      if (e.altKey) combo += 'alt+';
      combo += e.key.toLowerCase();

      // Check if we have a handler for this combo
      if (shortcuts[combo]) {
        e.preventDefault();
        shortcuts[combo]();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
```

### Shortcut Help Dialog

**File: `/components/ShortcutHelp.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Shortcut {
  keys: string;
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: 'Cmd+K', description: 'Open command palette', category: 'Navigation' },
  { keys: 'G then D', description: 'Go to dashboard', category: 'Navigation' },
  { keys: 'G then R', description: 'Go to resources', category: 'Navigation' },

  // Actions
  { keys: 'Cmd+S', description: 'Save changes', category: 'Actions' },
  { keys: 'Cmd+/', description: 'Show keyboard shortcuts', category: 'Actions' },
  { keys: 'Esc', description: 'Close dialog', category: 'Actions' },

  // Editing
  { keys: 'Cmd+B', description: 'Bold', category: 'Editing' },
  { keys: 'Cmd+I', description: 'Italic', category: 'Editing' },
  { keys: 'Cmd+Z', description: 'Undo', category: 'Editing' },
];

export function ShortcutHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const grouped = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 4. Optimistic Updates with Rollback

### Enhanced Auto-Save Hook

**File: `/components/content-review/hooks/useAutoSave.ts`**

```typescript
import { useEffect, useRef, useState } from 'react';
import { openDB } from 'idb';

interface UseOptimisticSaveOptions<T> {
  content: T | null;
  onSave: (content: T) => Promise<void>;
  delay?: number;
}

export function useOptimisticSave<T>({
  content,
  onSave,
  delay = 2000,
}: UseOptimisticSaveOptions<T>) {
  const [localContent, setLocalContent] = useState(content);
  const [serverContent, setServerContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // IndexedDB backup
  async function saveToIndexedDB(data: T) {
    try {
      const db = await openDB('content-drafts', 1, {
        upgrade(db) {
          db.createObjectStore('drafts');
        },
      });
      await db.put('drafts', {
        content: data,
        timestamp: Date.now(),
      }, 'current');
    } catch (err) {
      console.error('Failed to save to IndexedDB:', err);
    }
  }

  // Restore from IndexedDB
  async function restoreFromIndexedDB(): Promise<T | null> {
    try {
      const db = await openDB('content-drafts', 1);
      const draft = await db.get('drafts', 'current');
      return draft?.content || null;
    } catch (err) {
      console.error('Failed to restore from IndexedDB:', err);
      return null;
    }
  }

  // Auto-save effect
  useEffect(() => {
    if (!content) return;

    // Immediate IndexedDB backup
    saveToIndexedDB(content);
    setLocalContent(content);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounced server save
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      setError(null);

      try {
        await onSave(content);
        setServerContent(content);
      } catch (err) {
        setError(err as Error);
        // Rollback to last known good state
        setLocalContent(serverContent);
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, onSave, delay]);

  return {
    localContent,
    serverContent,
    isSaving,
    error,
    restoreFromIndexedDB,
  };
}
```

---

## 5. Mobile Touch Optimization

### Tailwind Config Updates

**File: `tailwind.config.js`**

```javascript
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
  },
  plugins: [],
}
```

### Touch-Friendly Button

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function TouchButton({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        min-h-touch min-w-touch
        px-4 py-2 rounded-lg font-medium
        flex items-center justify-center gap-2
        transition-colors duration-200
        ${variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300'
        }
      `}
    >
      {children}
    </button>
  );
}
```

### Mobile Bottom Navigation

**File: `/components/MobileBottomNav.tsx`**

```typescript
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Plus, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/admin' },
  { icon: Search, label: 'Search', path: '/admin/search' },
  { icon: Plus, label: 'Create', path: '/admin/new' },
  { icon: User, label: 'Profile', path: '/admin/profile' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex justify-around items-center p-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = pathname === path;
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`
                flex flex-col items-center gap-1 p-2 min-w-touch min-h-touch
                ${isActive ? 'text-blue-600' : 'text-gray-600'}
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

**Add to global CSS:**

```css
/* globals.css */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## 6. Save Status Indicator

**File: `/components/SaveStatusIndicator.tsx`**

```typescript
'use client';

import { CheckCircle, Loader2, XCircle, Circle, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error' | 'offline';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
  onRetry?: () => void;
}

export function SaveStatusIndicator({
  status,
  lastSaved,
  onRetry,
}: SaveStatusIndicatorProps) {
  const config = {
    saved: {
      icon: CheckCircle,
      text: 'All changes saved',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    saving: {
      icon: Loader2,
      text: 'Saving...',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      animate: true,
    },
    unsaved: {
      icon: Circle,
      text: 'Unsaved changes',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    error: {
      icon: XCircle,
      text: 'Failed to save',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    offline: {
      icon: WifiOff,
      text: 'Offline - will sync when online',
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${current.bg}`}>
      <Icon className={`w-4 h-4 ${current.color} ${current.animate ? 'animate-spin' : ''}`} />
      <span className={`text-sm font-medium ${current.color}`}>
        {current.text}
      </span>
      {status === 'saved' && lastSaved && (
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(lastSaved, { addSuffix: true })}
        </span>
      )}
      {status === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-red-700 hover:text-red-900 font-medium underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
```

---

## 7. Loading Skeletons

### Install
```bash
npx shadcn-ui@latest add skeleton
```

### Resource Card Skeleton

**File: `/components/skeletons/ResourceCardSkeleton.tsx`**

```typescript
import { Skeleton } from '@/components/ui/skeleton';

interface ResourceCardSkeletonProps {
  count?: number;
}

export function ResourceCardSkeleton({ count = 3 }: ResourceCardSkeletonProps) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-3/4" /> {/* Title */}
              <Skeleton className="h-4 w-full" />  {/* Description line 1 */}
              <Skeleton className="h-4 w-2/3" />  {/* Description line 2 */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" /> {/* Category badge */}
                <Skeleton className="h-6 w-20" /> {/* Level badge */}
              </div>
            </div>
            <Skeleton className="h-8 w-16" /> {/* Action button */}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Dashboard Skeleton

**File: `/components/skeletons/DashboardSkeleton.tsx`**

```typescript
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full" /> {/* Search bar */}
        </div>
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Usage:**

```typescript
function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    fetchResources().then(data => {
      setResources(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return <ResourceList resources={resources} />;
}
```

---

## 8. Toast Notifications

### Install
```bash
npx shadcn-ui@latest add toast
```

### Usage

**File: `/components/SomeComponent.tsx`**

```typescript
import { useToast } from '@/components/ui/use-toast';

function ContentEditor() {
  const { toast } = useToast();

  async function saveContent() {
    try {
      await api.save();
      toast({
        title: 'Content saved',
        description: 'Your changes have been saved successfully.',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: error.message,
        variant: 'destructive',
        action: (
          <button onClick={saveContent} className="underline">
            Retry
          </button>
        ),
      });
    }
  }

  return <button onClick={saveContent}>Save</button>;
}
```

### Undo Toast

```typescript
function deleteResource(id: string) {
  const previousData = resources.find(r => r.id === id);

  // Optimistically remove
  setResources(resources.filter(r => r.id !== id));

  // Show toast with undo
  toast({
    title: 'Resource deleted',
    description: `"${previousData.title}" has been deleted.`,
    action: (
      <button
        onClick={() => {
          setResources([...resources, previousData]);
          toast({
            title: 'Resource restored',
          });
        }}
        className="underline"
      >
        Undo
      </button>
    ),
    duration: 5000,
  });

  // Actually delete after timeout
  setTimeout(() => {
    api.delete(id);
  }, 5000);
}
```

---

## 9. Responsive Table → Card View

```typescript
'use client';

import { useMediaQuery } from '@/lib/hooks/useMediaQuery';

function ResourceList({ resources }: Props) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <div className="space-y-4">
        {resources.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    );
  }

  return (
    <table className="min-w-full">
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {resources.map(resource => (
          <ResourceRow key={resource.id} resource={resource} />
        ))}
      </tbody>
    </table>
  );
}

function ResourceCard({ resource }: Props) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
          {resource.category}
        </span>
        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
          {resource.level}
        </span>
      </div>
      <button className="w-full bg-blue-600 text-white py-2 rounded">
        Edit
      </button>
    </div>
  );
}
```

### useMediaQuery Hook

**File: `/lib/hooks/useMediaQuery.ts`**

```typescript
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
```

---

## 10. Dark Mode Toggle

### Install
```bash
npx shadcn-ui@latest add dropdown-menu
```

### Theme Provider

**File: `/components/ThemeProvider.tsx`**

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

const ThemeProviderContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: 'system',
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
```

### Theme Toggle Button

```typescript
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Update tailwind.config.js:**

```javascript
module.exports = {
  darkMode: 'class', // Enable dark mode
  // ... rest of config
}
```

---

## Testing Helpers

### Accessibility Testing

```bash
npm install @axe-core/react
```

**Usage in development:**

```typescript
// app/layout.tsx
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### Performance Monitoring

```typescript
// lib/performance.ts
export function measurePerformance(name: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`${name} took ${duration.toFixed(2)}ms`);
      return duration;
    };
  }
  return () => 0;
}

// Usage
function ExpensiveComponent() {
  const endMeasure = measurePerformance('ExpensiveComponent render');

  useEffect(() => {
    endMeasure();
  });

  return <div>...</div>;
}
```

---

## Quick Commands Reference

```bash
# Install shadcn/ui
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add command button dialog input toast skeleton

# Install utilities
npm install cmdk @tanstack/react-virtual idb date-fns

# Install diff viewer
npm install react-diff-viewer-continued

# Install Monaco (optional - large bundle)
npm install @monaco-editor/react

# Install BlockNote (optional)
npm install @blocknote/core @blocknote/react

# Development
npm run dev

# Build
npm run build

# Analyze bundle
npm install @next/bundle-analyzer
# Add to next.config.js
```

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [cmdk (Command Menu)](https://cmdk.paco.me)
- [React Diff Viewer](https://github.com/aeaton/react-diff-viewer-continued)
- [TanStack Virtual](https://tanstack.com/virtual)
- [IDB (IndexedDB wrapper)](https://github.com/jakearchibald/idb)

---

**All code is ready to copy-paste into your Hablas project!**
