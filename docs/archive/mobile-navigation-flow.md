# Mobile Navigation Flow & Component Hierarchy

## Screen Layout Overview

```
┌─────────────────────────────────────┐
│         Status Bar (Safe Area)       │  <- env(safe-area-inset-top)
├─────────────────────────────────────┤
│                                     │
│                                     │
│         Main Content Area           │
│         (Scrollable)                │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│     Mini Audio Player (Optional)     │  <- Sticky, z-50
├─────────────────────────────────────┤
│      Bottom Navigation Bar          │  <- Sticky, z-50
├─────────────────────────────────────┤
│    Gesture Bar (Safe Area)          │  <- env(safe-area-inset-bottom)
└─────────────────────────────────────┘
```

## Bottom Navigation Structure

```
┌─────────────────────────────────────────────────────────┐
│  [🏠]      [📚]      [🎤]      [👥]      [👤]         │
│ Inicio   Recursos  Practicar  Comunidad  Perfil        │
└─────────────────────────────────────────────────────────┘
   ↓          ↓          ↓          ↓          ↓
   │          │          │          │          │
   │          │          │          │          └─→ Profile Settings
   │          │          │          │              - Progress stats
   │          │          │          │              - Downloads
   │          │          │          │              - Preferences
   │          │          │          │
   │          │          │          └────────────→ Community
   │          │          │                         - WhatsApp groups
   │          │          │                         - Forum
   │          │          │                         - Leaderboard
   │          │          │
   │          │          └──────────────────────→ Practice
   │          │                                    - Speaking exercises
   │          │                                    - Pronunciation
   │          │                                    - Quizzes
   │          │
   │          └─────────────────────────────────→ Resources Library
   │                                               - Browse all
   │                                               - Filter by category
   │                                               - Search
   │                                               - Downloaded
   │
   └────────────────────────────────────────────→ Home / Feed
                                                   - Featured content
                                                   - Continue learning
                                                   - Quick actions
                                                   - Community updates
```

## User Flow: Listen to Audio Lesson

```
┌──────────────┐
│   Home Page  │
└──────┬───────┘
       │ Tap "Recursos" in bottom nav
       ↓
┌──────────────────┐
│ Resources List   │
│ ┌──────────────┐│
│ │ Resource Card││  <- Pull down to refresh
│ ├──────────────┤│
│ │ Resource Card││  <- Tap card
│ ├──────────────┤│
│ │ Resource Card││  <- OR swipe right to save
│ └──────────────┘│
└──────┬───────────┘
       │ Tap card
       ↓
┌──────────────────┐
│ Resource Detail  │
│ ┌──────────────┐│
│ │ Audio Player ││  <- Tap play
│ ├──────────────┤│
│ │ Transcript   ││  <- Scrollable content
│ │ Vocabulary   ││
│ │ Practice     ││
│ └──────────────┘│
└──────┬───────────┘
       │ Play audio
       ↓
┌──────────────────────────────────────┐
│        Mini Player Appears           │
│  [⏸] "Greetings for Delivery"  [×] │  <- Sticky at bottom
└──────┬───────────────────────────────┘
       │ Navigate to different page
       ↓
┌──────────────────┐
│   Any Other Page │  <- Audio continues playing
│                  │
│ Mini player:     │
│  [⏸] Track...   │  <- Still visible, still playing
└──────┬───────────┘
       │ Tap mini player to expand
       ↓
┌──────────────────────────────────────┐
│      Full Player (Bottom Sheet)      │
│                                      │
│        [Album Art]                   │
│                                      │
│    "Greetings for Delivery"          │
│    Voz: María (Acento Americano)     │
│                                      │
│    [═════▶══════]  2:34 / 5:12       │
│                                      │
│     [⏪]    [⏸]    [⏩]              │
│                                      │
│  Velocidad: [0.5x] [1x] [1.5x] [2x] │
│                                      │
│  [🔁 Repetir]  [📥 Descargar]       │
└──────────────────────────────────────┘
```

## User Flow: Offline Download

```
┌──────────────┐
│ Resources    │
└──────┬───────┘
       │ Long press card
       ↓
┌──────────────────────┐
│  Context Menu        │
│  ┌────────────────┐ │
│  │ Ver Recurso    │ │
│  ├────────────────┤ │
│  │ Descargar      │ │  <- Tap download
│  ├────────────────┤ │
│  │ Compartir      │ │
│  └────────────────┘ │
└──────┬───────────────┘
       │ Tap "Descargar"
       ↓
┌──────────────────────┐
│  Download Queue      │
│  ┌────────────────┐ │
│  │ ✓ Resource 1   │ │  <- Completed
│  ├────────────────┤ │
│  │ ⏳ Resource 2  │ │  <- Downloading (45%)
│  │ [████░░░░]     │ │
│  ├────────────────┤ │
│  │ ⏸ Resource 3   │ │  <- Queued
│  └────────────────┘ │
│                      │
│  Storage: 234MB/512MB│
│  [██████░░░░]  46%   │
└──────────────────────┘
       │
       │ Download completes
       ↓
┌──────────────────────┐
│  Notification        │
│  "✓ Resource 2       │
│   descargado"        │
└──────────────────────┘
       │
       │ Go offline
       ↓
┌──────────────────────────────────────┐
│          Resources (Offline)         │
│  ┌────────────────────────────────┐ │
│  │ [📥] Resource 1  (Downloaded)  │ │  <- Accessible
│  ├────────────────────────────────┤ │
│  │ [📥] Resource 2  (Downloaded)  │ │  <- Accessible
│  ├────────────────────────────────┤ │
│  │ [🌐] Resource 3  (Online only) │ │  <- Grayed out
│  └────────────────────────────────┘ │
│                                      │
│  [🔌 Sin conexión - Mostrando solo  │
│   contenido descargado]              │
└──────────────────────────────────────┘
```

## Component Hierarchy

```
App Layout
├── ErrorBoundary
│   └── Providers
│       ├── AudioContextProvider
│       │   └── children (pages)
│       │       ├── Home Page
│       │       │   ├── Hero
│       │       │   ├── PullToRefresh
│       │       │   │   └── ResourceLibrary
│       │       │   │       └── VirtualizedList
│       │       │   │           └── ResourceCard
│       │       │   │               └── SwipeableCard
│       │       │   ├── SearchBar
│       │       │   ├── FilterButtons
│       │       │   └── WhatsAppCTA
│       │       │
│       │       ├── Resource Detail Page
│       │       │   ├── ResourceHeader
│       │       │   ├── AudioPlayer (enhanced)
│       │       │   ├── ResourceContent
│       │       │   │   ├── Transcript
│       │       │   │   ├── VocabularyCard
│       │       │   │   └── PracticalScenario
│       │       │   └── ActionButtons
│       │       │
│       │       └── ... other pages
│       │
│       ├── MiniAudioPlayer (persistent)
│       │   ├── MiniPlayerBar
│       │   │   ├── PlayPauseButton
│       │   │   ├── TrackInfo
│       │   │   ├── ProgressBar
│       │   │   └── ExpandButton
│       │   │
│       │   └── BottomSheet (when expanded)
│       │       └── FullPlayerView
│       │           ├── Artwork
│       │           ├── TrackInfo
│       │           ├── SeekBar
│       │           ├── PlaybackControls
│       │           ├── SpeedControls
│       │           └── AdditionalOptions
│       │
│       ├── BottomNav (persistent)
│       │   └── NavItems (5x)
│       │       ├── Home
│       │       ├── Resources
│       │       ├── Practice
│       │       ├── Community
│       │       └── Profile
│       │
│       ├── OfflineIndicator (conditional)
│       │   └── StatusBanner
│       │
│       └── InstallPrompt (conditional)
│           └── PWA Install Banner
│
└── Analytics
    └── SpeedInsights
```

## Touch Interaction Zones (Portrait Mode)

```
┌─────────────────────────────────────┐  ← Top: 0-20% (Hard to reach)
│                                     │    - Status bar
│         Header Area                 │    - Back button (if any)
│                                     │
├─────────────────────────────────────┤  ← Upper Middle: 20-50% (Moderate reach)
│                                     │    - Secondary content
│         Content Area                │    - Scrollable lists
│         (Easy scroll zone)          │    - Read-only content
│                                     │
├─────────────────────────────────────┤  ← Lower Middle: 50-75% (Easy reach)
│                                     │    - Primary content
│      Primary Interaction Zone       │    - Interactive elements
│      (One-handed thumb reach)       │    - Action buttons
│                                     │
├─────────────────────────────────────┤  ← Bottom: 75-100% (Easiest reach)
│    [Mini Audio Player]              │    - Most important controls
│    [⏸] Track Name... [×]           │    - Navigation
├─────────────────────────────────────┤    - Floating actions
│  [🏠] [📚] [🎤] [👥] [👤]         │
└─────────────────────────────────────┘
```

## Gesture Map

```
┌─────────────────────────────────────┐
│                                     │
│          ↓ Pull Down                │  = Refresh content
│                                     │
│     ← Swipe Left   Swipe Right →   │  = Navigate cards
│                                     │
│          ↑ Swipe Up                 │  = Share / Quick action
│                                     │
│     👆 Tap          👆👆 Double tap │  = Select / Like
│                                     │
│     ☝️ Long press                   │  = Context menu
│                                     │
└─────────────────────────────────────┘
```

## State Flow: Audio Playback

```
[Idle]
  │
  │ User taps play button
  ↓
[Loading]
  │
  ├──→ [Error] ──→ Show error message, retry option
  │
  │ Audio loaded
  ↓
[Playing]
  ├──→ Mini player appears
  ├──→ Lock screen controls active
  ├──→ Background playback enabled
  │
  │ User navigates to different page
  ↓
[Playing (Background)]
  ├──→ Mini player stays visible
  ├──→ Playback continues
  ├──→ Position saved every 2 seconds
  │
  │ User minimizes app
  ↓
[Playing (Background - App Minimized)]
  ├──→ Notification controls active
  ├──→ Lock screen controls active
  ├──→ Playback continues
  │
  │ Phone call incoming
  ↓
[Paused (Auto)]
  ├──→ Audio paused automatically
  ├──→ Position saved
  │
  │ Call ends
  ↓
[Paused]
  │
  │ User taps play
  ↓
[Playing]
  │
  │ Track ends
  ↓
[Completed]
  ├──→ If looping: go to [Playing]
  ├──→ If queue: play next
  └──→ Else: go to [Idle]
```

## Data Flow: Offline Resources

```
┌──────────────┐
│   User       │
└──────┬───────┘
       │ Request download
       ↓
┌──────────────────┐
│ Download Queue   │
│ Manager          │
└──────┬───────────┘
       │
       ├──→ Check storage availability
       │
       ├──→ Check network connection
       │    ├─→ WiFi? → Start immediately
       │    └─→ Mobile data? → Ask confirmation
       │
       ↓
┌──────────────────┐
│ Service Worker   │
│ (Cache API)      │
└──────┬───────────┘
       │
       ├──→ Download audio file
       ├──→ Download transcript
       ├──→ Download metadata
       │
       ↓
┌──────────────────┐
│ IndexedDB        │
│ (Offline Storage)│
└──────┬───────────┘
       │
       ├──→ Store files
       ├──→ Store metadata
       ├──→ Update cache manifest
       │
       ↓
┌──────────────────┐
│ Update UI        │
└──────┬───────────┘
       │
       ├──→ Show download complete
       ├──→ Update storage indicator
       ├──→ Mark resource as downloaded
       │
       ↓
┌──────────────────┐
│ User goes offline│
└──────┬───────────┘
       │
       ↓
┌──────────────────────────────┐
│ Service Worker intercepts    │
│ requests:                    │
│  - Cached files → return     │
│  - Uncached → show offline   │
└──────────────────────────────┘
```

## Navigation State Management

```
Bottom Nav (Persistent)
├── Home (/)
│   └── State: Featured content, continue learning
│
├── Resources (/recursos)
│   ├── State: Filters, search query, scroll position
│   └── Sub-routes:
│       └── /recursos/[id] → Resource detail
│
├── Practice (/practica)
│   ├── State: Current exercise, progress
│   └── Sub-routes:
│       ├── /practica/speaking
│       ├── /practica/pronunciation
│       └── /practica/quiz
│
├── Community (/comunidad)
│   ├── State: Selected group, chat history
│   └── Sub-routes:
│       ├── /comunidad/grupos
│       ├── /comunidad/foro
│       └── /comunidad/leaderboard
│
└── Profile (/perfil)
    ├── State: User data, preferences
    └── Sub-routes:
        ├── /perfil/progreso
        ├── /perfil/descargas
        └── /perfil/configuracion
```

## Responsive Breakpoints

```
Mobile Portrait (Default)
├── Width: 320px - 428px
├── Navigation: Bottom nav
├── Content: Single column
└── Touch targets: 48x48px minimum

Mobile Landscape
├── Width: 568px - 926px
├── Navigation: Bottom nav (compressed)
├── Content: Single column (wider)
└── Safe areas: Left/right notches

Tablet Portrait
├── Width: 768px - 834px
├── Navigation: Bottom nav + sidebar (optional)
├── Content: Two columns (optional)
└── Touch targets: 48x48px minimum

Tablet Landscape
├── Width: 1024px - 1366px
├── Navigation: Top nav + sidebar
├── Content: Two/three columns
└── Touch targets: 44x44px minimum

Desktop
├── Width: 1440px+
├── Navigation: Top nav + sidebar
├── Content: Multi-column layout
└── Mouse targets: Standard (no minimum)
```

---

This navigation flow provides a comprehensive view of how users interact with the mobile-first Hablas platform, emphasizing one-handed operation, persistent audio playback, and seamless offline access.
