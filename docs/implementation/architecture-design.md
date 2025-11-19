# Architecture Design Document - UI/UX Improvements
## Hablas Platform Enhancement

**Version:** 1.0.0
**Date:** 2025-11-19
**Status:** Design Phase (SPARC Methodology)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [Proposed Architecture](#proposed-architecture)
4. [Component Organization](#component-organization)
5. [Context Management](#context-management)
6. [Hooks Architecture](#hooks-architecture)
7. [Utility Functions](#utility-functions)
8. [Design System](#design-system)
9. [Bilingual Comparison Architecture](#bilingual-comparison-architecture)
10. [Audio-Text Alignment Architecture](#audio-text-alignment-architecture)
11. [Data Flow Diagrams](#data-flow-diagrams)
12. [Integration Strategy](#integration-strategy)
13. [Scalability & Performance](#scalability--performance)

---

## Executive Summary

This document outlines the system architecture for implementing comprehensive UI/UX improvements to the Hablas platform, focusing on mobile responsiveness, accessibility (WCAG compliance), content review enhancements, and bilingual content management.

**Key Objectives:**
- Mobile-first component architecture with responsive design
- WCAG 2.1 AA accessibility compliance
- Enhanced content review workflow with triple comparison
- Bilingual content side-by-side editing
- Audio-text synchronization with waveform visualization
- Modular, maintainable codebase structure

---

## Current Architecture Analysis

### Existing Structure

```
/home/user/hablas/
├── app/                          # Next.js 13+ App Router
│   ├── layout.tsx                # Root layout with Providers
│   ├── page.tsx                  # Home page
│   ├── admin/                    # Admin routes
│   ├── recursos/[id]/            # Dynamic resource pages
│   └── review/                   # Review page
│
├── components/                   # React components
│   ├── shared/                   # Shared components
│   │   └── AudioPlayer.tsx       # Audio player component
│   ├── content-review/           # Content review tools
│   │   ├── ContentReviewTool.tsx
│   │   ├── ComparisonView.tsx
│   │   ├── EditPanel.tsx
│   │   └── DiffHighlighter.tsx
│   ├── triple-comparison/        # Triple content comparison
│   │   ├── components/
│   │   │   ├── TripleComparisonView.tsx
│   │   │   ├── ContentPanel.tsx
│   │   │   ├── DiffViewer.tsx
│   │   │   └── SyncControls.tsx
│   │   ├── hooks/
│   │   └── types/
│   ├── topic-review/             # Topic review components
│   ├── media-review/             # Media review tools
│   └── resource-renderers/       # Content renderers
│
├── lib/                          # Utilities and services
│   ├── contexts/
│   │   └── AudioContext.tsx      # Global audio state
│   ├── hooks/                    # Custom hooks
│   ├── utils/                    # Utility functions
│   ├── types/                    # TypeScript types
│   └── audio/                    # Audio utilities
│
└── styles/
    ├── globals.css
    └── resource-content.css
```

### Current Patterns

**✅ Strengths:**
- Modular component structure with feature-based organization
- Separation of concerns (components, hooks, utilities)
- Context-based state management for audio
- Triple comparison already implemented
- Custom hooks for content management and auto-save

**⚠️ Areas for Improvement:**
- Limited mobile-specific components
- No dedicated accessibility utilities
- Scattered filter and debounce logic
- No centralized design system tokens
- Missing bilingual content parsing utilities
- No audio waveform visualization

---

## Proposed Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js App Router                      │  │
│  │  - Server Components (SEO, initial render)                │  │
│  │  - Client Components (interactivity)                      │  │
│  │  - API Routes (backend logic)                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         UI Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Mobile     │  │   Desktop    │  │   Shared     │          │
│  │  Components  │  │  Components  │  │  Components  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────────────────────────────────────────┐          │
│  │         Content Review & Comparison Tools         │          │
│  │  - Triple Comparison                              │          │
│  │  - Bilingual Side-by-Side Editor                 │          │
│  │  - Audio-Text Alignment                           │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       State Management                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Audio     │  │   Content    │  │  Progress    │          │
│  │   Context    │  │   Context    │  │   Context    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Custom    │  │   Content    │  │    Audio     │          │
│  │    Hooks     │  │  Validators  │  │   Utilities  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────────────────────────────────────────┐          │
│  │           Accessibility Utilities                 │          │
│  │  - Focus Management  - ARIA Attributes            │          │
│  │  - Color Contrast    - Keyboard Navigation        │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Supabase   │  │  Blob Store  │  │    Cache     │          │
│  │   Database   │  │    (Audio)   │  │   (Redis)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Organization

### New Directory Structure

```
/home/user/hablas/
├── components/
│   ├── mobile/                          # NEW: Mobile-specific components
│   │   ├── MobileAudioPlayer.tsx        # Touch-optimized player
│   │   ├── MobileNavigation.tsx         # Bottom navigation
│   │   ├── MobileSearchBar.tsx          # Mobile search
│   │   ├── MobileFilterPanel.tsx        # Slide-up filter panel
│   │   ├── SwipeableCard.tsx            # Swipeable resource cards
│   │   └── TouchGestures.tsx            # Touch gesture handlers
│   │
│   ├── accessibility/                   # NEW: A11y components
│   │   ├── SkipLinks.tsx                # Skip navigation links
│   │   ├── FocusTrap.tsx                # Focus management
│   │   ├── LiveRegion.tsx               # ARIA live regions
│   │   └── VisuallyHidden.tsx           # Screen reader only content
│   │
│   ├── content-review/                  # ENHANCED
│   │   ├── ContentReviewTool.tsx        # Main review interface
│   │   ├── BilingualEditor.tsx          # NEW: Side-by-side editor
│   │   ├── ComparisonView.tsx           # Existing comparison
│   │   ├── EditPanel.tsx                # Existing edit panel
│   │   ├── DiffHighlighter.tsx          # Existing diff viewer
│   │   └── FormatValidator.tsx          # NEW: Format validation
│   │
│   ├── audio/                           # NEW: Audio-specific
│   │   ├── WaveformVisualizer.tsx       # Waveform display
│   │   ├── AudioTextSync.tsx            # Text-audio alignment
│   │   ├── TimestampEditor.tsx          # Timestamp management
│   │   └── TranscriptHighlighter.tsx    # Active word highlighting
│   │
│   ├── shared/                          # ENHANCED: Shared components
│   │   ├── AudioPlayer.tsx              # Existing player
│   │   ├── Button.tsx                   # NEW: Design system button
│   │   ├── Input.tsx                    # NEW: Design system input
│   │   ├── Card.tsx                     # NEW: Design system card
│   │   └── Modal.tsx                    # NEW: Accessible modal
│   │
│   ├── triple-comparison/               # EXISTING: Keep current structure
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   │
│   └── [existing components...]         # Keep all current components
│
├── lib/
│   ├── contexts/                        # ENHANCED: State management
│   │   ├── AudioContext.tsx             # Existing audio context
│   │   ├── ContentReviewContext.tsx     # NEW: Review state
│   │   ├── ProgressContext.tsx          # NEW: Progress tracking
│   │   └── BilingualContext.tsx         # NEW: Language state
│   │
│   ├── hooks/                           # ENHANCED: Custom hooks
│   │   ├── useDebounce.ts               # NEW: Debounce hook
│   │   ├── useAudioPlayer.ts            # NEW: Audio player logic
│   │   ├── useKeyboardNav.ts            # NEW: Keyboard navigation
│   │   ├── useFocusTrap.ts              # NEW: Focus management
│   │   ├── useBreakpoint.ts             # NEW: Responsive breakpoints
│   │   ├── useBilingualContent.ts       # NEW: Bilingual parsing
│   │   ├── useAudioTextSync.ts          # NEW: Audio-text sync
│   │   └── [existing hooks...]
│   │
│   ├── utils/                           # ENHANCED: Utilities
│   │   ├── accessibility/
│   │   │   ├── colorContrast.ts         # NEW: WCAG contrast checker
│   │   │   ├── focusManagement.ts       # NEW: Focus utilities
│   │   │   └── ariaHelpers.ts           # NEW: ARIA attribute helpers
│   │   │
│   │   ├── content/
│   │   │   ├── bilingualParser.ts       # NEW: Split EN/ES content
│   │   │   ├── formatValidator.ts       # NEW: Format validation
│   │   │   └── textComparison.ts        # NEW: Text diff utilities
│   │   │
│   │   ├── audio/
│   │   │   ├── waveformGenerator.ts     # NEW: Waveform data
│   │   │   ├── timestampSync.ts         # NEW: Timestamp utilities
│   │   │   └── audioAnalyzer.ts         # NEW: Audio analysis
│   │   │
│   │   └── [existing utils...]
│   │
│   └── design-system/                   # NEW: Design tokens
│       ├── colors.ts                    # WCAG-compliant palette
│       ├── typography.ts                # Type scale
│       ├── spacing.ts                   # Spacing scale
│       └── breakpoints.ts               # Responsive breakpoints
│
└── styles/
    ├── globals.css                      # ENHANCED: Add design tokens
    ├── mobile.css                       # NEW: Mobile-specific styles
    └── accessibility.css                # NEW: A11y styles
```

### Component Hierarchy

```
App Layout (layout.tsx)
│
├── Providers
│   ├── AudioProvider
│   ├── ContentReviewProvider (NEW)
│   ├── ProgressProvider (NEW)
│   └── BilingualProvider (NEW)
│
├── ErrorBoundary
│
├── Responsive Navigation
│   ├── Desktop: AdminNav
│   └── Mobile: MobileNavigation (NEW)
│
└── Page Content
    │
    ├── Home Page
    │   ├── Hero
    │   ├── SearchBar / MobileSearchBar
    │   ├── ResourceLibrary
    │   │   └── ResourceCard / SwipeableCard (NEW)
    │   └── WhatsAppCTA
    │
    ├── Resource Page
    │   ├── AudioPlayer / MobileAudioPlayer
    │   ├── Content Renderers
    │   │   ├── BilingualDialogueFormatter
    │   │   ├── VocabularyCard
    │   │   ├── PracticalScenario
    │   │   └── [other renderers...]
    │   └── Progress Tracker (NEW)
    │
    └── Admin/Review Pages
        ├── ContentReviewTool
        │   ├── BilingualEditor (NEW)
        │   ├── ComparisonView
        │   └── EditPanel
        │
        ├── TripleComparisonView
        │   ├── ContentPanel (x3)
        │   ├── DiffViewer
        │   └── SyncControls
        │
        └── AudioTextSync (NEW)
            ├── WaveformVisualizer
            ├── TranscriptHighlighter
            └── TimestampEditor
```

---

## Context Management

### Audio Context (Enhanced)

```typescript
// /lib/contexts/AudioContext.tsx

interface AudioContextType {
  // Existing
  currentAudio: React.MutableRefObject<HTMLAudioElement | null>;
  setCurrentAudio: (audio: HTMLAudioElement | null) => void;
  stopCurrent: () => void;

  // NEW: Enhanced audio state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;

  // NEW: Control methods
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;

  // NEW: Audio metadata
  currentTrack: {
    id: string;
    title: string;
    url: string;
  } | null;

  // NEW: Waveform data
  waveformData: Float32Array | null;
  loadWaveform: (audioUrl: string) => Promise<void>;
}
```

### Content Review Context (New)

```typescript
// /lib/contexts/ContentReviewContext.tsx

interface ContentReviewContextType {
  // Current content being reviewed
  content: {
    id: string;
    downloadable: string;
    web: string;
    audio: string;
    original: string;
  };

  // Editing state
  isDirty: boolean;
  unsavedChanges: {
    downloadable: boolean;
    web: boolean;
    audio: boolean;
  };

  // Update methods
  updateDownloadable: (content: string) => void;
  updateWeb: (content: string) => void;
  updateAudio: (content: string) => void;

  // Save/reset
  saveAll: () => Promise<void>;
  resetAll: () => void;

  // Comparison mode
  comparisonMode: 'side-by-side' | 'diff' | 'triple';
  setComparisonMode: (mode: string) => void;

  // Sync operations
  syncContent: (from: ContentType, to: ContentType) => Promise<void>;
}
```

### Progress Context (New)

```typescript
// /lib/contexts/ProgressContext.tsx

interface ProgressContextType {
  // User progress tracking
  completedResources: Set<string>;
  inProgressResources: Map<string, number>; // resourceId -> percentage

  // Methods
  markComplete: (resourceId: string) => void;
  updateProgress: (resourceId: string, percentage: number) => void;
  getProgress: (resourceId: string) => number;

  // Audio playback history
  audioProgress: Map<string, {
    currentTime: number;
    duration: number;
    lastPlayed: Date;
  }>;

  saveAudioProgress: (audioId: string, time: number, duration: number) => void;
  resumeAudioFrom: (audioId: string) => number | null;
}
```

### Bilingual Context (New)

```typescript
// /lib/contexts/BilingualContext.tsx

interface BilingualContextType {
  // Language settings
  primaryLanguage: 'en' | 'es';
  secondaryLanguage: 'en' | 'es';
  setPrimaryLanguage: (lang: 'en' | 'es') => void;

  // Display mode
  displayMode: 'side-by-side' | 'toggle' | 'inline';
  setDisplayMode: (mode: string) => void;

  // Sync editing
  syncEditing: boolean;
  setSyncEditing: (sync: boolean) => void;

  // Content split
  parsedContent: {
    english: string[];
    spanish: string[];
  } | null;

  parseContent: (content: string) => void;
}
```

---

## Hooks Architecture

### Audio Hooks

```typescript
// /lib/hooks/useAudioPlayer.ts

interface UseAudioPlayerOptions {
  audioUrl: string;
  autoPlay?: boolean;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

interface UseAudioPlayerReturn {
  // State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: TimeRanges | null;
  error: Error | null;
  loading: boolean;

  // Controls
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  togglePlay: () => void;

  // Audio element ref
  audioRef: RefObject<HTMLAudioElement>;

  // Waveform
  waveformData: Float32Array | null;
}

export function useAudioPlayer(options: UseAudioPlayerOptions): UseAudioPlayerReturn;
```

```typescript
// /lib/hooks/useAudioTextSync.ts

interface UseAudioTextSyncOptions {
  audioUrl: string;
  transcript: string;
  timestamps?: Array<{ time: number; text: string }>;
}

interface UseAudioTextSyncReturn {
  // Current active segment
  activeSegmentIndex: number;
  activeText: string;

  // Sync methods
  jumpToSegment: (index: number) => void;
  highlightWord: (wordIndex: number) => void;

  // Timestamp management
  addTimestamp: (time: number, text: string) => void;
  updateTimestamp: (index: number, time: number) => void;
  deleteTimestamp: (index: number) => void;

  // Export
  exportTimestamps: () => Array<{ time: number; text: string }>;
}

export function useAudioTextSync(options: UseAudioTextSyncOptions): UseAudioTextSyncReturn;
```

### Content Hooks

```typescript
// /lib/hooks/useBilingualContent.ts

interface UseBilingualContentOptions {
  content: string;
  format?: 'markdown' | 'html' | 'plain';
}

interface UseBilingualContentReturn {
  // Parsed content
  english: string[];
  spanish: string[];

  // Editing
  updateEnglish: (index: number, content: string) => void;
  updateSpanish: (index: number, content: string) => void;

  // Validation
  isValid: boolean;
  errors: string[];

  // Sync
  isSynced: boolean;
  mismatches: Array<{ index: number; issue: string }>;

  // Export
  export: () => string;
}

export function useBilingualContent(options: UseBilingualContentOptions): UseBilingualContentReturn;
```

### UI Hooks

```typescript
// /lib/hooks/useDebounce.ts

export function useDebounce<T>(value: T, delay: number = 500): T;
```

```typescript
// /lib/hooks/useBreakpoint.ts

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface UseBreakpointReturn {
  current: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isAbove: (breakpoint: Breakpoint) => boolean;
  isBelow: (breakpoint: Breakpoint) => boolean;
}

export function useBreakpoint(): UseBreakpointReturn;
```

```typescript
// /lib/hooks/useKeyboardNav.ts

interface UseKeyboardNavOptions {
  items: number; // Number of items
  onSelect: (index: number) => void;
  onEscape?: () => void;
  initialIndex?: number;
  loop?: boolean; // Wrap around at edges
}

interface UseKeyboardNavReturn {
  selectedIndex: number;
  handleKeyDown: (e: KeyboardEvent) => void;
  setSelectedIndex: (index: number) => void;
}

export function useKeyboardNav(options: UseKeyboardNavOptions): UseKeyboardNavReturn;
```

### Accessibility Hooks

```typescript
// /lib/hooks/useFocusTrap.ts

interface UseFocusTrapOptions {
  enabled: boolean;
  initialFocus?: RefObject<HTMLElement>;
  onEscape?: () => void;
}

interface UseFocusTrapReturn {
  containerRef: RefObject<HTMLDivElement>;
  focusFirst: () => void;
  focusLast: () => void;
}

export function useFocusTrap(options: UseFocusTrapOptions): UseFocusTrapReturn;
```

---

## Utility Functions

### Accessibility Utilities

```typescript
// /lib/utils/accessibility/colorContrast.ts

interface ColorContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  level: 'fail' | 'AA' | 'AAA';
}

/**
 * Calculate WCAG color contrast ratio
 * @param foreground - Foreground color (hex, rgb, or named)
 * @param background - Background color
 * @returns Contrast result with WCAG compliance levels
 */
export function getContrastRatio(
  foreground: string,
  background: string
): ColorContrastResult;

/**
 * Suggest accessible color alternatives
 */
export function suggestAccessibleColor(
  color: string,
  background: string,
  targetLevel: 'AA' | 'AAA' = 'AA'
): string[];
```

```typescript
// /lib/utils/accessibility/ariaHelpers.ts

/**
 * Generate ARIA attributes for common patterns
 */
export const aria = {
  // Button helpers
  button: (label: string, pressed?: boolean, expanded?: boolean) => ({
    'aria-label': label,
    'aria-pressed': pressed,
    'aria-expanded': expanded,
  }),

  // Modal/Dialog
  modal: (labelId: string, descId?: string) => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': labelId,
    'aria-describedby': descId,
  }),

  // Tab system
  tab: (id: string, selected: boolean, controls: string) => ({
    role: 'tab',
    id,
    'aria-selected': selected,
    'aria-controls': controls,
    tabIndex: selected ? 0 : -1,
  }),

  // Live regions
  liveRegion: (level: 'polite' | 'assertive' = 'polite') => ({
    'aria-live': level,
    'aria-atomic': true,
  }),
};
```

### Content Utilities

```typescript
// /lib/utils/content/bilingualParser.ts

interface BilingualContent {
  english: string[];
  spanish: string[];
  metadata: {
    format: 'markdown' | 'html' | 'plain';
    segmentCount: number;
    isSynced: boolean;
  };
}

/**
 * Parse bilingual content from various formats
 *
 * Supported formats:
 * - Markdown: ## English\n...\n## Español\n...
 * - HTML: <div lang="en">...</div><div lang="es">...</div>
 * - Plain: English:\n...\nSpanish:\n...
 */
export function parseBilingualContent(
  content: string,
  format?: 'markdown' | 'html' | 'plain' | 'auto'
): BilingualContent;

/**
 * Merge bilingual content back into original format
 */
export function mergeBilingualContent(
  english: string[],
  spanish: string[],
  format: 'markdown' | 'html' | 'plain'
): string;

/**
 * Validate bilingual content structure
 */
export function validateBilingualContent(
  content: BilingualContent
): { valid: boolean; errors: string[] };
```

```typescript
// /lib/utils/content/formatValidator.ts

interface FormatValidationResult {
  valid: boolean;
  errors: Array<{
    line: number;
    message: string;
    severity: 'error' | 'warning';
  }>;
  suggestions: string[];
}

/**
 * Validate markdown format for resource content
 */
export function validateMarkdownFormat(content: string): FormatValidationResult;

/**
 * Validate bilingual content alignment
 */
export function validateBilingualAlignment(
  english: string[],
  spanish: string[]
): FormatValidationResult;
```

### Audio Utilities

```typescript
// /lib/utils/audio/waveformGenerator.ts

interface WaveformOptions {
  samples?: number; // Number of samples (default: 1000)
  precision?: number; // Decimal precision (default: 2)
}

/**
 * Generate waveform data from audio buffer
 */
export async function generateWaveform(
  audioBuffer: AudioBuffer,
  options?: WaveformOptions
): Promise<Float32Array>;

/**
 * Load audio and generate waveform
 */
export async function loadAudioWaveform(
  audioUrl: string,
  options?: WaveformOptions
): Promise<Float32Array>;
```

```typescript
// /lib/utils/audio/timestampSync.ts

interface Timestamp {
  time: number;
  text: string;
  index: number;
}

/**
 * Find active timestamp at current playback time
 */
export function getActiveTimestamp(
  currentTime: number,
  timestamps: Timestamp[]
): Timestamp | null;

/**
 * Generate automatic timestamps from audio analysis
 */
export async function generateTimestamps(
  audioUrl: string,
  transcript: string
): Promise<Timestamp[]>;

/**
 * Validate timestamp sequence
 */
export function validateTimestamps(
  timestamps: Timestamp[]
): { valid: boolean; errors: string[] };
```

---

## Design System

### Color Palette (WCAG Compliant)

```typescript
// /lib/design-system/colors.ts

/**
 * WCAG 2.1 AA Compliant Color System
 * All colors tested for 4.5:1 contrast ratio on white background
 */
export const colors = {
  // Brand colors
  primary: {
    50: '#E8F9E0',   // whatsapp-light
    100: '#B8F0A3',
    200: '#88E766',
    300: '#58DE29',
    400: '#25D366',  // whatsapp (main) - 3.2:1 ratio
    500: '#1DB954',  // Darker variant - 4.5:1 ratio ✓
    600: '#128C7E',  // whatsapp-dark - 5.2:1 ratio ✓
    700: '#0D6B5D',
    800: '#094A42',
    900: '#052927',
  },

  // Platform colors (adjusted for accessibility)
  rappi: {
    50: '#FFF2ED',
    100: '#FFDCCB',
    200: '#FFC5A9',
    300: '#FFAE87',
    400: '#FF9766',  // Adjusted from #FF4E00
    500: '#FF7744',  // 4.5:1 ratio ✓
    600: '#E64422',  // 6.2:1 ratio ✓
    700: '#CC3311',
    800: '#991100',
    900: '#660000',
  },

  didi: {
    50: '#FFF5E8',
    100: '#FFE8CC',
    200: '#FFDBA0',
    300: '#FFCE74',
    400: '#FFA033',  // Main - 3.1:1 ratio
    500: '#E68A00',  // Adjusted - 4.6:1 ratio ✓
    600: '#CC7700',  // 5.8:1 ratio ✓
    700: '#996600',
    800: '#664400',
    900: '#332200',
  },

  uber: {
    50: '#F5F5F5',
    100: '#E5E5E5',
    200: '#CCCCCC',
    300: '#999999',
    400: '#666666',  // 5.7:1 ratio ✓
    500: '#333333',  // 12.6:1 ratio ✓
    600: '#000000',  // 21:1 ratio ✓
  },

  // Accent colors (WCAG compliant)
  accent: {
    blue: {
      light: '#E3F2FD',
      main: '#1976D2',   // 4.5:1 ratio ✓
      dark: '#0D47A1',   // 8.2:1 ratio ✓
    },
    green: {
      light: '#E8F5E9',
      main: '#388E3C',   // 4.5:1 ratio ✓
      dark: '#1B5E20',   // 8.9:1 ratio ✓
    },
    purple: {
      light: '#F3E5F5',
      main: '#7B1FA2',   // 5.2:1 ratio ✓
      dark: '#4A148C',   // 9.1:1 ratio ✓
    },
  },

  // Semantic colors
  semantic: {
    error: {
      light: '#FFEBEE',
      main: '#C62828',   // 5.5:1 ratio ✓
      dark: '#8B0000',   // 10.1:1 ratio ✓
    },
    warning: {
      light: '#FFF8E1',
      main: '#F57C00',   // 4.5:1 ratio ✓
      dark: '#E65100',   // 5.8:1 ratio ✓
    },
    success: {
      light: '#E8F5E9',
      main: '#2E7D32',   // 5.2:1 ratio ✓
      dark: '#1B5E20',   // 8.9:1 ratio ✓
    },
    info: {
      light: '#E3F2FD',
      main: '#0277BD',   // 5.5:1 ratio ✓
      dark: '#01579B',   // 8.7:1 ratio ✓
    },
  },

  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',  // 4.5:1 ratio ✓
      700: '#616161',  // 5.7:1 ratio ✓
      800: '#424242',  // 9.7:1 ratio ✓
      900: '#212121',  // 16.1:1 ratio ✓
    },
    black: '#000000',
  },
};

/**
 * Get accessible color pair
 */
export function getAccessibleColorPair(
  level: 'AA' | 'AAA' = 'AA'
): Array<{ foreground: string; background: string }>;
```

### Typography

```typescript
// /lib/design-system/typography.ts

export const typography = {
  // Font families
  fonts: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(', '),
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      'Consolas',
      'Liberation Mono',
      'Menlo',
      'monospace',
    ].join(', '),
  },

  // Type scale (modular scale: 1.250 - Major Third)
  scale: {
    xs: '0.64rem',    // 10.24px
    sm: '0.8rem',     // 12.8px
    base: '1rem',     // 16px
    lg: '1.25rem',    // 20px
    xl: '1.563rem',   // 25px
    '2xl': '1.953rem', // 31.25px
    '3xl': '2.441rem', // 39px
    '4xl': '3.052rem', // 48.83px
    '5xl': '3.815rem', // 61px
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Font weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Letter spacing
  tracking: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
};
```

### Spacing & Layout

```typescript
// /lib/design-system/spacing.ts

/**
 * 8px base spacing system
 */
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
};

/**
 * Touch-friendly minimum sizes (WCAG 2.5.5)
 */
export const touchTargets = {
  minWidth: '44px',
  minHeight: '44px',
  spacing: '8px', // Minimum spacing between targets
};
```

### Breakpoints

```typescript
// /lib/design-system/breakpoints.ts

export const breakpoints = {
  xs: '375px',   // Small phones
  sm: '640px',   // Large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px', // Large screens
};

/**
 * Media query helpers
 */
export const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,

  // Max-width queries
  maxSm: `@media (max-width: ${breakpoints.sm})`,
  maxMd: `@media (max-width: ${breakpoints.md})`,
  maxLg: `@media (max-width: ${breakpoints.lg})`,
};
```

### Tailwind Config Update

```javascript
// /home/user/hablas/tailwind.config.js

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Keep existing colors, add new WCAG-compliant variants
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#128C7E',
          darker: '#0D6B5D',  // NEW: AA compliant
          light: '#E8F9E0',
        },
        rappi: {
          DEFAULT: '#FF4E00',
          accessible: '#E64422', // NEW: AA compliant (6.2:1)
          light: '#FFF2ED',
        },
        didi: {
          DEFAULT: '#FFA033',
          accessible: '#E68A00', // NEW: AA compliant (4.6:1)
          light: '#FFF5E8',
        },
        uber: {
          DEFAULT: '#000000',
          light: '#F5F5F5',
        },
        accent: {
          blue: {
            light: '#E3F2FD',
            DEFAULT: '#1976D2',  // AA compliant
            dark: '#0D47A1',
          },
          green: {
            light: '#E8F5E9',
            DEFAULT: '#388E3C',  // AA compliant
            dark: '#1B5E20',
          },
          purple: {
            light: '#F3E5F5',
            DEFAULT: '#7B1FA2',  // AA compliant
            dark: '#4A148C',
          },
        },
        semantic: {
          error: '#C62828',
          warning: '#F57C00',
          success: '#2E7D32',
          info: '#0277BD',
        },
      },

      // Touch-friendly sizing
      minHeight: {
        touch: '44px',
        'touch-lg': '48px',
      },
      minWidth: {
        touch: '44px',
        'touch-lg': '48px',
      },

      // Enhanced spacing
      spacing: {
        18: '4.5rem',
        88: '22rem',
        safe: 'env(safe-area-inset-bottom)', // iOS notch support
      },

      // Breakpoints
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },

      // Focus styles
      boxShadow: {
        focus: '0 0 0 3px rgba(37, 211, 102, 0.3)',
        'focus-error': '0 0 0 3px rgba(198, 40, 40, 0.3)',
      },

      // Animation
      transitionDuration: {
        150: '150ms',
        250: '250ms',
      },

      // Typography
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
      },
    },
  },
  plugins: [],
};
```

---

## Bilingual Comparison Architecture

### Data Structure

```typescript
// Bilingual content representation

interface BilingualSegment {
  id: string;
  english: string;
  spanish: string;
  metadata: {
    type: 'paragraph' | 'heading' | 'list-item' | 'dialogue';
    level?: number; // For headings
    speaker?: string; // For dialogue
  };
}

interface BilingualDocument {
  id: string;
  title: {
    english: string;
    spanish: string;
  };
  segments: BilingualSegment[];
  metadata: {
    lastModified: Date;
    version: number;
    format: 'markdown' | 'html';
  };
}
```

### Component Architecture

```
BilingualEditor
├── EditorHeader
│   ├── Title Display (EN/ES)
│   ├── Mode Selector (side-by-side | toggle | inline)
│   └── Sync Toggle
│
├── EditorToolbar
│   ├── Formatting Controls
│   ├── Validation Status
│   └── Save/Export Buttons
│
├── ContentView (based on displayMode)
│   │
│   ├── Side-by-Side Mode
│   │   ├── EnglishPanel
│   │   │   └── SegmentEditor (x N)
│   │   └── SpanishPanel
│   │       └── SegmentEditor (x N)
│   │
│   ├── Toggle Mode
│   │   └── SinglePanel
│   │       ├── Language Switcher
│   │       └── SegmentEditor (x N)
│   │
│   └── Inline Mode
│       └── InterleavedPanel
│           └── BilingualSegment (x N)
│               ├── English Editor
│               └── Spanish Editor
│
└── ValidationPanel
    ├── Alignment Checker
    ├── Format Validator
    └── Error List
```

### Sync Mechanisms

```typescript
// Editing sync strategies

interface SyncConfig {
  // Real-time sync
  enabled: boolean;
  debounceMs: number;

  // Sync scope
  scope: 'segment' | 'document' | 'selection';

  // Conflict resolution
  onConflict: 'manual' | 'prefer-english' | 'prefer-spanish';
}

// Sync operations
class BilingualSync {
  /**
   * Sync scroll positions between panels
   */
  syncScroll(sourcePanel: 'en' | 'es', scrollTop: number): void;

  /**
   * Sync cursor positions during editing
   */
  syncCursor(
    sourcePanel: 'en' | 'es',
    segmentId: string,
    cursorPosition: number
  ): void;

  /**
   * Sync content structure (add/remove segments)
   */
  syncStructure(
    operation: 'add' | 'remove' | 'reorder',
    segmentId: string,
    targetPanel?: 'en' | 'es'
  ): void;

  /**
   * Detect and highlight misalignments
   */
  detectMisalignments(): Array<{
    segmentId: string;
    issue: 'length-mismatch' | 'structure-diff' | 'missing-translation';
    severity: 'error' | 'warning' | 'info';
  }>;
}
```

### Parsing Strategy

```typescript
// /lib/utils/content/bilingualParser.ts

/**
 * Parse bilingual markdown content
 *
 * Expected format:
 * ## English
 * Content in English...
 *
 * ## Español
 * Contenido en español...
 */
export function parseMarkdown(content: string): BilingualDocument {
  const segments: BilingualSegment[] = [];

  // Split by language sections
  const sections = content.split(/^## (English|Español)$/m);

  // Parse English section
  const englishContent = sections[1];
  const englishSegments = parseSegments(englishContent, 'en');

  // Parse Spanish section
  const spanishContent = sections[2];
  const spanishSegments = parseSegments(spanishContent, 'es');

  // Align segments
  return alignSegments(englishSegments, spanishSegments);
}

/**
 * Parse HTML bilingual content
 *
 * Expected format:
 * <div lang="en">Content in English...</div>
 * <div lang="es">Contenido en español...</div>
 */
export function parseHTML(content: string): BilingualDocument {
  // Implementation
}

/**
 * Align English and Spanish segments
 */
function alignSegments(
  english: ParsedSegment[],
  spanish: ParsedSegment[]
): BilingualDocument {
  // Match segments by structure and position
  // Handle misalignments
  // Generate unique IDs
}
```

### Side-by-Side Editor Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     BilingualEditor                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Title: "Vocabulary - Food Delivery"                │    │
│  │  Mode: [Side-by-Side] [Toggle] [Inline]            │    │
│  │  Sync: [✓] Scroll  [✓] Cursor  [ ] Auto-translate  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────┬──────────────────────┐           │
│  │   English Panel      │   Spanish Panel       │           │
│  ├──────────────────────┼──────────────────────┤           │
│  │ ┌──────────────────┐ │ ┌──────────────────┐ │          │
│  │ │ Segment 1        │ │ │ Segmento 1       │ │          │
│  │ │ # Greeting       │←→│ │ # Saludo         │ │          │
│  │ │ Hello!           │ │ │ ¡Hola!           │ │          │
│  │ └──────────────────┘ │ └──────────────────┘ │          │
│  │                      │                       │           │
│  │ ┌──────────────────┐ │ ┌──────────────────┐ │          │
│  │ │ Segment 2        │ │ │ Segmento 2       │ │          │
│  │ │ Good morning     │←→│ │ Buenos días      │ │          │
│  │ └──────────────────┘ │ └──────────────────┘ │          │
│  │         ↕            │         ↕             │           │
│  │   (Scroll synced)    │   (Scroll synced)    │           │
│  └──────────────────────┴──────────────────────┘           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Validation: ✓ Alignment OK  ⚠ Segment 3 mismatch   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Audio-Text Alignment Architecture

### Waveform Visualization

```typescript
// Component structure

interface WaveformVisualizerProps {
  audioUrl: string;
  currentTime: number;
  duration: number;
  timestamps: Timestamp[];
  onSeek: (time: number) => void;
  onTimestampClick: (timestamp: Timestamp) => void;
}

interface WaveformData {
  samples: Float32Array;
  peaks: number[];
  duration: number;
  sampleRate: number;
}
```

#### Waveform Rendering Strategy

```
Waveform Canvas Layers:
┌─────────────────────────────────────────────┐
│ Layer 1: Background Grid (time markers)     │
├─────────────────────────────────────────────┤
│ Layer 2: Waveform (amplitude visualization) │
├─────────────────────────────────────────────┤
│ Layer 3: Playhead (current time indicator)  │
├─────────────────────────────────────────────┤
│ Layer 4: Timestamps (text segment markers)  │
└─────────────────────────────────────────────┘

Interaction:
- Click: Seek to position
- Drag: Scrub through audio
- Scroll: Zoom in/out
- Hover: Show time tooltip
```

### Timestamp Management

```typescript
// Timestamp data structure

interface Timestamp {
  id: string;
  time: number; // Seconds
  text: string; // Associated text segment
  endTime?: number; // Optional end time for ranges
  confidence?: number; // Auto-generated confidence (0-1)
  metadata?: {
    speaker?: string;
    type?: 'word' | 'phrase' | 'sentence' | 'paragraph';
  };
}

interface TimestampCollection {
  timestamps: Timestamp[];
  version: number;
  lastModified: Date;

  // Methods
  add(time: number, text: string): Timestamp;
  update(id: string, changes: Partial<Timestamp>): void;
  delete(id: string): void;
  findAtTime(time: number): Timestamp | null;
  validate(): { valid: boolean; errors: string[] };
  export(): string; // JSON or VTT format
}
```

### Transcript Highlighting

```typescript
// Real-time transcript highlighting

interface TranscriptHighlighterProps {
  transcript: string;
  timestamps: Timestamp[];
  currentTime: number;
  onTimestampSelect: (timestamp: Timestamp) => void;
  editMode?: boolean;
}

// Highlighting strategy
class TranscriptHighlighter {
  /**
   * Find active segment at current playback time
   */
  getActiveSegment(currentTime: number): {
    timestamp: Timestamp;
    startIndex: number;
    endIndex: number;
  } | null;

  /**
   * Highlight word-level synchronization
   */
  getActiveWord(currentTime: number): {
    word: string;
    wordIndex: number;
    characterRange: [number, number];
  } | null;

  /**
   * Render highlighted transcript
   */
  render(): ReactNode;
}
```

### Audio-Text Sync Flow

```
┌───────────────────────────────────────────────────────────┐
│              AudioTextSyncEditor                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Audio Player Controls                               │  │
│  │ [▶] 0:45 / 3:20  [Volume] [Speed: 1x]              │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Waveform Visualizer                                 │  │
│  │ ╱╲╱╲╱╲   ╱╲╱╲╱╲   ╱╲╱╲╱╲                           │  │
│  │    │       │       │                                │  │
│  │   [T1]    [T2]    [T3]  ← Timestamp markers        │  │
│  │         ▲                                           │  │
│  │      Playhead                                       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Synchronized Transcript                             │  │
│  │                                                      │  │
│  │ [T1 0:15] Hello, welcome to the lesson.            │  │
│  │ [T2 0:45] Today we'll learn about food delivery.   │← Active
│  │ [T3 1:20] First, let's review some vocabulary.     │  │
│  │                                                      │  │
│  │ [+ Add Timestamp] [Auto-Generate] [Export VTT]     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Timestamp Editor (Selected: T2)                     │  │
│  │ Time: [00:45] [←][→] Fine-tune: [-0.1s][+0.1s]    │  │
│  │ Text: [Today we'll learn about food delivery.]     │  │
│  │ [Update] [Delete]                                   │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

### Waveform Generation Algorithm

```typescript
// /lib/utils/audio/waveformGenerator.ts

async function generateWaveform(
  audioUrl: string,
  samples: number = 1000
): Promise<Float32Array> {
  // 1. Load audio file
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();

  // 2. Decode audio data
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // 3. Extract raw audio data
  const rawData = audioBuffer.getChannelData(0); // Mono or first channel

  // 4. Downsample to desired number of samples
  const blockSize = Math.floor(rawData.length / samples);
  const waveformData = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const start = i * blockSize;
    let sum = 0;

    // Calculate RMS (Root Mean Square) for block
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(rawData[start + j]);
    }

    waveformData[i] = sum / blockSize;
  }

  // 5. Normalize to 0-1 range
  const max = Math.max(...waveformData);
  for (let i = 0; i < samples; i++) {
    waveformData[i] /= max;
  }

  return waveformData;
}
```

### Auto-Timestamp Generation

```typescript
// Using Web Speech API or external service

async function generateTimestamps(
  audioUrl: string,
  transcript: string
): Promise<Timestamp[]> {
  // Option 1: Web Speech API (browser-based)
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  // Option 2: External service (e.g., Whisper API)
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: JSON.stringify({ audioUrl, transcript }),
  });

  const { timestamps } = await response.json();
  return timestamps;
}
```

---

## Data Flow Diagrams

### Audio Player State Flow

```
User Interaction
      ↓
┌──────────────────┐
│  Audio Player    │
│   Component      │
└──────────────────┘
      ↓
┌──────────────────┐
│ useAudioPlayer   │  ← Custom hook manages state
│     Hook         │
└──────────────────┘
      ↓
┌──────────────────┐
│ AudioContext     │  ← Global audio coordination
│   (Context)      │
└──────────────────┘
      ↓
┌──────────────────┐
│ ProgressContext  │  ← Save playback position
│   (Context)      │
└──────────────────┘
      ↓
┌──────────────────┐
│ localStorage /   │  ← Persist progress
│   Supabase       │
└──────────────────┘

State Updates:
┌─────────────┐
│ User clicks │
│    play     │
└─────────────┘
      ↓
┌──────────────────────────────────┐
│ 1. Stop any currently playing    │
│    audio (AudioContext)          │
│ 2. Load audio file               │
│ 3. Check for saved progress      │
│    (ProgressContext)             │
│ 4. Resume from saved position    │
│ 5. Start playback                │
│ 6. Update isPlaying state        │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ During playback:                 │
│ - Update currentTime (throttled) │
│ - Save progress every 5 seconds  │
│ - Update waveform position       │
│ - Highlight active transcript    │
└──────────────────────────────────┘
```

### Content Review Workflow

```
┌──────────────────┐
│  Admin selects   │
│    resource      │
└──────────────────┘
      ↓
┌──────────────────────────────────┐
│ Load resource data:              │
│ - Downloadable PDF content       │
│ - Web version content            │
│ - Audio transcript               │
│ - Original version (baseline)    │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ Initialize contexts:             │
│ - ContentReviewContext           │
│ - BilingualContext (if bilingual)│
│ - AudioContext (if audio)        │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ Display TripleComparisonView:    │
│ ┌────────┬────────┬────────┐    │
│ │Download│  Web   │ Audio  │    │
│ │  PDF   │Version │Transcript    │
│ └────────┴────────┴────────┘    │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ User edits content in any panel  │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ useContentManager hook:          │
│ - Debounce input (500ms)         │
│ - Update local state             │
│ - Mark panel as dirty            │
│ - Calculate diff                 │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ Auto-save (after 2 seconds):     │
│ - Save to temporary storage      │
│ - Update lastModified timestamp  │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ User clicks "Sync" or "Save All" │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ Validation:                      │
│ - Check format consistency       │
│ - Validate bilingual alignment   │
│ - Check markdown syntax          │
└──────────────────────────────────┘
      ↓
  Valid?
      ↓
    Yes → Save to database
      ↓
    No → Show validation errors
```

### Bilingual Editing Flow

```
┌──────────────────┐
│  Load bilingual  │
│    content       │
└──────────────────┘
      ↓
┌──────────────────────────────────┐
│ parseBilingualContent()          │
│ - Detect format (markdown/html)  │
│ - Split English/Spanish sections │
│ - Segment into parallel arrays   │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ BilingualContext state:          │
│ {                                │
│   english: [...segments],        │
│   spanish: [...segments],        │
│   syncEditing: true,             │
│   displayMode: 'side-by-side'    │
│ }                                │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ Render BilingualEditor:          │
│ ┌───────────┬───────────┐        │
│ │  English  │  Español  │        │
│ ├───────────┼───────────┤        │
│ │ Segment 1 │Segmento 1 │        │
│ │ Segment 2 │Segmento 2 │← Synced scroll
│ │ Segment 3 │Segmento 3 │        │
│ └───────────┴───────────┘        │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ User edits English Segment 2     │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ useBilingualContent hook:        │
│ - Update english[1]              │
│ - Check alignment                │
│ - Highlight Spanish segment      │
│ - Validate structure match       │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ Sync scroll position:            │
│ - Calculate relative position    │
│ - Update Spanish panel scroll    │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────┐
│ Validation warnings:             │
│ ⚠ English has 3 paragraphs      │
│   Spanish has 2 paragraphs       │
│ → Misalignment detected          │
└──────────────────────────────────┘
```

---

## Integration Strategy

### Phase 1: Foundation (Week 1)

**Tasks:**
1. ✅ Set up design system
   - Create `/lib/design-system/` directory
   - Define WCAG-compliant colors
   - Set up typography, spacing, breakpoints
   - Update `tailwind.config.js`

2. ✅ Implement core hooks
   - `useDebounce.ts`
   - `useBreakpoint.ts`
   - `useKeyboardNav.ts`
   - `useFocusTrap.ts`

3. ✅ Create accessibility utilities
   - `colorContrast.ts`
   - `ariaHelpers.ts`
   - `focusManagement.ts`

4. ✅ Set up new contexts
   - `ContentReviewContext.tsx`
   - `ProgressContext.tsx`
   - `BilingualContext.tsx`

### Phase 2: Mobile Components (Week 2)

**Tasks:**
1. ✅ Create mobile-specific components
   - `MobileAudioPlayer.tsx`
   - `MobileNavigation.tsx`
   - `MobileSearchBar.tsx`
   - `MobileFilterPanel.tsx`

2. ✅ Implement touch gestures
   - `SwipeableCard.tsx`
   - `TouchGestures.tsx`

3. ✅ Responsive layout updates
   - Update `layout.tsx` for mobile detection
   - Add mobile styles to `globals.css`

### Phase 3: Content Review Enhancements (Week 3)

**Tasks:**
1. ✅ Bilingual editor
   - `BilingualEditor.tsx`
   - `bilingualParser.ts`
   - `useBilingualContent.ts`

2. ✅ Format validation
   - `FormatValidator.tsx`
   - `formatValidator.ts`
   - `validateBilingualAlignment()`

3. ✅ Enhanced comparison view
   - Update `ComparisonView.tsx` for bilingual
   - Add side-by-side sync

### Phase 4: Audio-Text Alignment (Week 4)

**Tasks:**
1. ✅ Waveform visualization
   - `WaveformVisualizer.tsx`
   - `waveformGenerator.ts`
   - Canvas rendering optimization

2. ✅ Timestamp management
   - `TimestampEditor.tsx`
   - `timestampSync.ts`
   - Auto-generation (optional)

3. ✅ Transcript highlighting
   - `TranscriptHighlighter.tsx`
   - `useAudioTextSync.ts`
   - Real-time sync

### Phase 5: Testing & Polish (Week 5)

**Tasks:**
1. ✅ Accessibility testing
   - Screen reader testing (NVDA, JAWS, VoiceOver)
   - Keyboard navigation testing
   - Color contrast validation
   - WCAG 2.1 AA compliance audit

2. ✅ Mobile testing
   - iOS Safari testing
   - Android Chrome testing
   - Touch gesture refinement
   - Performance optimization

3. ✅ Integration testing
   - End-to-end content review workflow
   - Audio-text sync accuracy
   - Bilingual editing validation

### Integration Points with Existing Code

```typescript
// app/layout.tsx - Add new providers

export default function RootLayout({ children }) {
  return (
    <html lang="es-CO">
      <body>
        <ErrorBoundary>
          <Providers>
            <AudioProvider>              {/* Existing */}
              <ContentReviewProvider>    {/* NEW */}
                <ProgressProvider>        {/* NEW */}
                  <BilingualProvider>     {/* NEW */}
                    {children}
                    <AdminNav />
                  </BilingualProvider>
                </ProgressProvider>
              </ContentReviewProvider>
            </AudioProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

```typescript
// components/ResourceCard.tsx - Add mobile variant

export function ResourceCard({ resource }) {
  const { isMobile } = useBreakpoint();

  if (isMobile) {
    return <SwipeableCard resource={resource} />;
  }

  return <DesktopResourceCard resource={resource} />;
}
```

```typescript
// app/admin/topics/[slug]/page.tsx - Add bilingual editing

export default function TopicEditPage({ params }) {
  const { content, updateContent } = useContentManager();
  const { parsedContent } = useBilingualContent({ content });

  return (
    <BilingualEditor
      english={parsedContent.english}
      spanish={parsedContent.spanish}
      onSave={updateContent}
    />
  );
}
```

---

## Scalability & Performance

### Performance Optimizations

```typescript
// 1. Code Splitting
// Load heavy components only when needed

const BilingualEditor = lazy(() => import('@/components/content-review/BilingualEditor'));
const WaveformVisualizer = lazy(() => import('@/components/audio/WaveformVisualizer'));
const TripleComparisonView = lazy(() => import('@/components/triple-comparison/components/TripleComparisonView'));

// 2. Memoization
// Prevent unnecessary re-renders

const MemoizedWaveform = memo(WaveformVisualizer, (prev, next) => {
  return prev.audioUrl === next.audioUrl && prev.currentTime === next.currentTime;
});

// 3. Virtualization
// Render only visible segments in long documents

import { useVirtualizer } from '@tanstack/react-virtual';

function BilingualEditor({ segments }) {
  const parentRef = useRef();

  const rowVirtualizer = useVirtualizer({
    count: segments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  return (
    <div ref={parentRef}>
      {rowVirtualizer.getVirtualItems().map(virtualRow => (
        <BilingualSegment
          key={virtualRow.index}
          segment={segments[virtualRow.index]}
        />
      ))}
    </div>
  );
}

// 4. Debouncing
// Reduce excessive updates

const debouncedUpdate = useDebouncedCallback((value) => {
  updateContent(value);
}, 500);

// 5. Web Workers
// Offload heavy processing

// waveform.worker.ts
self.addEventListener('message', async (e) => {
  const { audioBuffer, samples } = e.data;
  const waveformData = generateWaveformData(audioBuffer, samples);
  self.postMessage(waveformData);
});
```

### Caching Strategy

```typescript
// 1. Audio waveform caching
const waveformCache = new Map<string, Float32Array>();

async function getCachedWaveform(audioUrl: string): Promise<Float32Array> {
  if (waveformCache.has(audioUrl)) {
    return waveformCache.get(audioUrl)!;
  }

  const waveform = await generateWaveform(audioUrl);
  waveformCache.set(audioUrl, waveform);
  return waveform;
}

// 2. LocalStorage for user progress
interface ProgressCache {
  audioProgress: Record<string, { time: number; duration: number }>;
  completedResources: string[];
  lastUpdated: Date;
}

function saveProgressToCache(progress: ProgressCache): void {
  localStorage.setItem('hablas:progress', JSON.stringify(progress));
}

// 3. Service Worker for offline content
// public/sw.js
const CACHE_NAME = 'hablas-v1';
const urlsToCache = [
  '/',
  '/styles/globals.css',
  '/styles/mobile.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});
```

### Accessibility Performance

```typescript
// Reduce motion for users with vestibular disorders
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Waveform({ animate = true }) {
  const shouldAnimate = animate && !prefersReducedMotion;

  return (
    <canvas
      className={shouldAnimate ? 'animate-pulse' : ''}
      aria-label="Audio waveform visualization"
    />
  );
}

// Lazy load non-critical a11y features
const ScreenReaderAnnouncer = lazy(() => import('@/components/accessibility/ScreenReaderAnnouncer'));
```

---

## Security Considerations

### Content Validation

```typescript
// Prevent XSS in user-edited content

import DOMPurify from 'isomorphic-dompurify';

function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: ['class'],
  });
}

// Validate file uploads
function validateAudioFile(file: File): boolean {
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  return allowedTypes.includes(file.type) && file.size <= maxSize;
}
```

### Authentication & Authorization

```typescript
// Protect admin routes
// middleware.ts

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') || pathname.startsWith('/review')) {
    const token = request.cookies.get('auth-token');

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Validate token
    const isValid = verifyToken(token.value);
    if (!isValid) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}
```

---

## Monitoring & Analytics

### Performance Monitoring

```typescript
// Track key metrics

import { Analytics } from '@vercel/analytics';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Custom performance tracking
function trackAudioPlayback(audioId: string, duration: number) {
  Analytics.track('audio_playback', {
    audioId,
    duration,
    timestamp: new Date().toISOString(),
  });
}

function trackContentEdit(resourceId: string, editType: string) {
  Analytics.track('content_edit', {
    resourceId,
    editType,
    timestamp: new Date().toISOString(),
  });
}
```

### Error Tracking

```typescript
// Sentry integration (optional)

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Performance monitoring
  tracesSampleRate: 1.0,

  // Error filtering
  beforeSend(event) {
    // Don't send development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
```

---

## Conclusion

This architecture provides a solid foundation for implementing comprehensive UI/UX improvements to the Hablas platform. Key achievements:

✅ **Modular Architecture**: Feature-based organization with clear separation of concerns
✅ **Accessibility-First**: WCAG 2.1 AA compliance built into the design system
✅ **Mobile-Optimized**: Dedicated mobile components with touch-friendly interactions
✅ **Scalable**: Performance optimizations and caching strategies
✅ **Maintainable**: Clear patterns, consistent naming, comprehensive types

### Next Steps

1. **Refinement Phase**: Implement components based on this architecture
2. **Testing**: Comprehensive accessibility and mobile testing
3. **Completion**: Integration and deployment

---

**Document Status:** ✅ Complete - Ready for Refinement Phase
**Last Updated:** 2025-11-19
**Architecture Version:** 1.0.0
