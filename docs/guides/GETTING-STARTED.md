# Getting Started: Mobile-First Implementation Guide

This guide walks you through implementing the mobile-first UI/UX enhancements for the Hablas platform, starting with the highest-priority features that deliver immediate value.

---

## Prerequisites

Before you begin, ensure you have:

- [x] Next.js 15+ project (✓ Current: 15.0.0)
- [x] React 18.3+ (✓ Current: 18.3.1)
- [x] Tailwind CSS configured (✓ Confirmed)
- [x] TypeScript setup (✓ Confirmed)
- [x] Development environment running (`npm run dev`)
- [x] Git for version control (✓ Confirmed)

---

## Day 1: Setup & Bottom Navigation (4 hours)

### Step 1.1: Create Mobile Components Directory (5 min)

```bash
mkdir -p /home/user/hablas/components/mobile
mkdir -p /home/user/hablas/hooks
```

### Step 1.2: Add Safe Area CSS Utilities (10 min)

**File:** `/home/user/hablas/app/globals.css`

Add to the end of the file (after existing utilities):

```css
@layer utilities {
  /* Safe area support for iOS notch/Android gesture bars */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
  }

  .h-safe-bottom {
    height: env(safe-area-inset-bottom, 0px);
  }

  .h-safe-top {
    height: env(safe-area-inset-top, 0px);
  }

  /* Account for bottom nav height in scrollable content */
  .mb-bottom-nav {
    margin-bottom: calc(4rem + env(safe-area-inset-bottom, 0px));
  }

  /* Prevent tap highlight on mobile */
  .no-tap-highlight {
    -webkit-tap-highlight-color: transparent;
  }
}
```

**Test:** Restart dev server, verify CSS compiles without errors

### Step 1.3: Create Bottom Navigation Component (2 hours)

**File:** `/home/user/hablas/components/mobile/BottomNav.tsx`

Copy the complete implementation from:
`/home/user/hablas/docs/component-examples/BottomNav-implementation.tsx`

**Or create from scratch:**

```tsx
'use client'

import { Home, BookOpen, Mic, Users, User } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Inicio', ariaLabel: 'Ir a inicio' },
  { href: '/recursos', icon: BookOpen, label: 'Recursos', ariaLabel: 'Ver recursos' },
  { href: '/practica', icon: Mic, label: 'Practicar', ariaLabel: 'Practicar inglés' },
  { href: '/comunidad', icon: Users, label: 'Comunidad', ariaLabel: 'Comunidad' },
  { href: '/perfil', icon: User, label: 'Perfil', ariaLabel: 'Mi perfil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg pb-safe"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-around h-16 max-w-6xl mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-2 py-1 rounded-lg transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-accent-green bg-green-50 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

**Test:** `npm run dev` → verify component renders without errors

### Step 1.4: Add to Layout (15 min)

**File:** `/home/user/hablas/app/layout.tsx`

Update the layout file:

```tsx
import BottomNav from '@/components/mobile/BottomNav' // Add import

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body className="min-h-screen bg-gray-50">
        <ErrorBoundary>
          <Providers>
            <a href="#main-content" className="skip-to-content">
              Saltar al contenido principal
            </a>
            {children}
            <BottomNav />  {/* Add this line */}
            <AdminNav />
          </Providers>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

**Test:**
1. Open http://localhost:3000
2. Verify bottom nav appears on all pages
3. Verify navigation works (clicking each tab)
4. Verify active state highlights correctly
5. Verify nav hides on /admin routes

### Step 1.5: Create Placeholder Pages (1 hour)

Since some routes don't exist yet, create placeholder pages:

**File:** `/home/user/hablas/app/recursos/page.tsx`

```tsx
export default function RecursosPage() {
  return (
    <main className="min-h-screen p-4 mb-bottom-nav">
      <h1 className="text-2xl font-bold mb-4">Recursos</h1>
      <p className="text-gray-600">Página de recursos en construcción...</p>
    </main>
  )
}
```

**File:** `/home/user/hablas/app/practica/page.tsx`

```tsx
export default function PracticaPage() {
  return (
    <main className="min-h-screen p-4 mb-bottom-nav">
      <h1 className="text-2xl font-bold mb-4">Practicar</h1>
      <p className="text-gray-600">Página de práctica en construcción...</p>
    </main>
  )
}
```

**File:** `/home/user/hablas/app/comunidad/page.tsx`

```tsx
export default function ComunidadPage() {
  return (
    <main className="min-h-screen p-4 mb-bottom-nav">
      <h1 className="text-2xl font-bold mb-4">Comunidad</h1>
      <p className="text-gray-600">Página de comunidad en construcción...</p>
    </main>
  )
}
```

**File:** `/home/user/hablas/app/perfil/page.tsx`

```tsx
export default function PerfilPage() {
  return (
    <main className="min-h-screen p-4 mb-bottom-nav">
      <h1 className="text-2xl font-bold mb-4">Perfil</h1>
      <p className="text-gray-600">Página de perfil en construcción...</p>
    </main>
  )
}
```

**Test:**
1. Navigate to each page via bottom nav
2. Verify content doesn't hide behind nav (mb-bottom-nav class)
3. Verify scrolling works correctly

### Day 1 Checkpoint

✓ Bottom navigation implemented
✓ Safe area support added
✓ All routes accessible
✓ Active states working
✓ Mobile-friendly layout

**Commit:** `git commit -m "feat: Add mobile bottom navigation"`

---

## Day 2: Skeleton Loading States (4 hours)

### Step 2.1: Create Skeleton Components (2 hours)

**File:** `/home/user/hablas/components/mobile/SkeletonCard.tsx`

```tsx
export default function SkeletonCard() {
  return (
    <div className="card-resource animate-pulse" aria-busy="true" aria-label="Cargando recurso">
      {/* Icon placeholder */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-8 h-8 bg-gray-200 rounded" />
        <div className="w-16 h-6 bg-gray-200 rounded-full" />
      </div>

      {/* Title and description placeholders */}
      <div className="space-y-3 mb-4">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>

      {/* Tags placeholders */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
      </div>

      {/* Size placeholder */}
      <div className="h-4 w-16 bg-gray-200 rounded mb-4" />

      {/* Button placeholder */}
      <div className="h-12 bg-gray-200 rounded" />
    </div>
  )
}
```

**File:** `/home/user/hablas/components/mobile/SkeletonList.tsx`

```tsx
import SkeletonCard from './SkeletonCard'

interface SkeletonListProps {
  count?: number
}

export default function SkeletonList({ count = 6 }: SkeletonListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
```

### Step 2.2: Integrate with Existing Components (1 hour)

**File:** `/home/user/hablas/components/ResourceLibrary.tsx`

Update to use skeleton states:

```tsx
import SkeletonList from './mobile/SkeletonList'

// ... existing imports and code ...

export default function ResourceLibrary({ category, level, searchQuery }) {
  const [isLoading, setIsLoading] = useState(true)
  const [resources, setResources] = useState([])

  useEffect(() => {
    setIsLoading(true)
    // Simulate loading (replace with actual data fetching)
    setTimeout(() => {
      setResources(/* your filtered resources */)
      setIsLoading(false)
    }, 500)
  }, [category, level, searchQuery])

  if (isLoading) {
    return <SkeletonList count={6} />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map(resource => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  )
}
```

### Step 2.3: Add Skeleton for Resource Detail (1 hour)

**File:** `/home/user/hablas/components/mobile/SkeletonResourceDetail.tsx`

```tsx
export default function SkeletonResourceDetail() {
  return (
    <div className="max-w-4xl mx-auto p-4 mb-bottom-nav animate-pulse">
      {/* Back button */}
      <div className="mb-4 h-10 w-24 bg-gray-200 rounded" />

      {/* Title */}
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />

      {/* Metadata */}
      <div className="flex gap-4 mb-6">
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>

      {/* Audio player */}
      <div className="h-48 bg-gray-200 rounded-lg mb-6" />

      {/* Content */}
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  )
}
```

**Test:**
1. Add artificial delay to data loading
2. Verify skeleton appears immediately
3. Verify smooth transition to actual content
4. Check accessibility (aria-busy attribute)

### Day 2 Checkpoint

✓ Skeleton card component created
✓ Skeleton list component created
✓ Integrated with resource library
✓ Resource detail skeleton added
✓ Loading states feel smooth

**Commit:** `git commit -m "feat: Add skeleton loading states for better perceived performance"`

---

## Day 3: Enhanced Offline Indicator (3 hours)

### Step 3.1: Create Enhanced Offline Indicator (2 hours)

**File:** `/home/user/hablas/components/mobile/OfflineIndicator.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi, Download } from 'lucide-react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showNotice, setShowNotice] = useState(false)
  const [cachedResourcesCount, setCachedResourcesCount] = useState(0)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowNotice(true)
      setTimeout(() => setShowNotice(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowNotice(true)
      loadCachedCount()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load cached resources count
    loadCachedCount()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadCachedCount = async () => {
    // TODO: Implement actual cache counting
    // For now, mock value
    setCachedResourcesCount(5)
  }

  if (!showNotice && isOnline) return null

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 max-w-sm ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-gray-900 text-white'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Conectado</p>
              <p className="text-sm text-white/90">Contenido sincronizado</p>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Sin conexión</p>
              <p className="text-sm text-white/90 flex items-center gap-1">
                <Download className="w-3 h-3" />
                {cachedResourcesCount} recursos disponibles offline
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

### Step 3.2: Add to Layout (15 min)

**File:** `/home/user/hablas/app/layout.tsx`

```tsx
import OfflineIndicator from '@/components/mobile/OfflineIndicator' // Add import

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body className="min-h-screen bg-gray-50">
        <ErrorBoundary>
          <Providers>
            <OfflineIndicator />  {/* Add this line */}
            <a href="#main-content" className="skip-to-content">
              Saltar al contenido principal
            </a>
            {children}
            <BottomNav />
            <AdminNav />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

### Step 3.3: Test Offline Behavior (45 min)

**Test scenarios:**
1. Open app in Chrome DevTools
2. Open Network tab
3. Toggle "Offline" checkbox
4. Verify offline indicator appears
5. Toggle back to "Online"
6. Verify "Connected" message appears briefly
7. Test on actual mobile device (airplane mode)

### Day 3 Checkpoint

✓ Enhanced offline indicator created
✓ Shows cached resources count
✓ Smooth transitions
✓ Works on real devices
✓ Accessibility support

**Commit:** `git commit -m "feat: Add enhanced offline indicator with cached resources count"`

---

## Day 4-5: Mini Audio Player (8 hours)

### Step 4.1: Enhance Audio Context (3 hours)

**File:** `/home/user/hablas/lib/contexts/AudioContext.tsx`

Extend the existing context:

```tsx
'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

interface AudioContextType {
  currentAudio: HTMLAudioElement | null
  currentTitle: string | null
  currentArtwork: string | null
  currentMetadata: any | null
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number
  volume: number
  isLooping: boolean
  setCurrentAudio: (audio: HTMLAudioElement | null, title?: string, artwork?: string, metadata?: any) => void
  togglePlay: () => void
  stopAudio: () => void
  seekTo: (time: number) => void
  skipTime: (seconds: number) => void
  changePlaybackRate: (rate: number) => void
  toggleLoop: () => void
  setVolume: (volume: number) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentAudio, setCurrentAudioState] = useState<HTMLAudioElement | null>(null)
  const [currentTitle, setCurrentTitle] = useState<string | null>(null)
  const [currentArtwork, setCurrentArtwork] = useState<string | null>(null)
  const [currentMetadata, setCurrentMetadata] = useState<any | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolumeState] = useState(1)
  const [isLooping, setIsLooping] = useState(false)

  // Update currentTime regularly
  useEffect(() => {
    if (!currentAudio) return

    const interval = setInterval(() => {
      setCurrentTime(currentAudio.currentTime)
      setDuration(currentAudio.duration)
    }, 100)

    return () => clearInterval(interval)
  }, [currentAudio])

  // Media Session API for lock screen controls
  useEffect(() => {
    if (!currentAudio || !('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTitle || 'Hablas Audio',
      artist: 'Hablas - Aprende Inglés',
      album: currentMetadata?.category || 'Recursos',
      artwork: [
        {
          src: currentArtwork || '/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        }
      ]
    })

    navigator.mediaSession.setActionHandler('play', () => {
      currentAudio.play()
      setIsPlaying(true)
    })

    navigator.mediaSession.setActionHandler('pause', () => {
      currentAudio.pause()
      setIsPlaying(false)
    })

    navigator.mediaSession.setActionHandler('seekbackward', () => {
      skipTime(-10)
    })

    navigator.mediaSession.setActionHandler('seekforward', () => {
      skipTime(10)
    })

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'

  }, [currentAudio, currentTitle, currentArtwork, currentMetadata, isPlaying])

  const setCurrentAudio = useCallback((audio: HTMLAudioElement | null, title?: string, artwork?: string, metadata?: any) => {
    // Stop previous audio
    if (currentAudio && currentAudio !== audio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }

    setCurrentAudioState(audio)
    setCurrentTitle(title || null)
    setCurrentArtwork(artwork || null)
    setCurrentMetadata(metadata || null)
    setIsPlaying(!!audio && !audio.paused)

    if (audio) {
      setDuration(audio.duration)
      setCurrentTime(audio.currentTime)
    }
  }, [currentAudio])

  const togglePlay = useCallback(() => {
    if (!currentAudio) return

    if (isPlaying) {
      currentAudio.pause()
      setIsPlaying(false)
    } else {
      currentAudio.play()
      setIsPlaying(true)
    }
  }, [currentAudio, isPlaying])

  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }
    setCurrentAudioState(null)
    setCurrentTitle(null)
    setCurrentArtwork(null)
    setCurrentMetadata(null)
    setIsPlaying(false)
  }, [currentAudio])

  const seekTo = useCallback((time: number) => {
    if (currentAudio) {
      currentAudio.currentTime = time
      setCurrentTime(time)
    }
  }, [currentAudio])

  const skipTime = useCallback((seconds: number) => {
    if (currentAudio) {
      const newTime = Math.max(0, Math.min(currentAudio.duration, currentAudio.currentTime + seconds))
      currentAudio.currentTime = newTime
      setCurrentTime(newTime)
    }
  }, [currentAudio])

  const changePlaybackRate = useCallback((rate: number) => {
    if (currentAudio) {
      currentAudio.playbackRate = rate
      setPlaybackRate(rate)
    }
  }, [currentAudio])

  const toggleLoop = useCallback(() => {
    if (currentAudio) {
      currentAudio.loop = !isLooping
      setIsLooping(!isLooping)
    }
  }, [currentAudio, isLooping])

  const setVolume = useCallback((vol: number) => {
    if (currentAudio) {
      currentAudio.volume = vol
      setVolumeState(vol)
    }
  }, [currentAudio])

  return (
    <AudioContext.Provider value={{
      currentAudio,
      currentTitle,
      currentArtwork,
      currentMetadata,
      isPlaying,
      currentTime,
      duration,
      playbackRate,
      volume,
      isLooping,
      setCurrentAudio,
      togglePlay,
      stopAudio,
      seekTo,
      skipTime,
      changePlaybackRate,
      toggleLoop,
      setVolume
    }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudioContext() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider')
  }
  return context
}
```

### Step 4.2: Create Mini Audio Player (3 hours)

Copy the complete implementation from:
`/home/user/hablas/docs/component-examples/MiniAudioPlayer-implementation.tsx`

### Step 4.3: Update Layout & Test (2 hours)

**File:** `/home/user/hablas/app/layout.tsx`

```tsx
import MiniAudioPlayer from '@/components/mobile/MiniAudioPlayer' // Add import

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body className="min-h-screen bg-gray-50">
        <ErrorBoundary>
          <Providers>
            <OfflineIndicator />
            {children}
            <MiniAudioPlayer />  {/* Add before BottomNav */}
            <BottomNav />
            <AdminNav />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

**Test:**
1. Play audio from any resource
2. Verify mini player appears
3. Navigate to different pages
4. Verify audio continues playing
5. Test lock screen controls (on mobile device)
6. Test expand to full player
7. Test playback controls (play/pause/skip/speed)

### Day 4-5 Checkpoint

✓ Audio context enhanced
✓ Mini player component created
✓ Lock screen controls working
✓ Background playback functional
✓ Full player modal working

**Commit:** `git commit -m "feat: Add persistent mini audio player with lock screen controls"`

---

## Week 1 Wrap-Up

### Completed Features

1. ✓ Bottom Navigation Bar
2. ✓ Skeleton Loading States
3. ✓ Enhanced Offline Indicator
4. ✓ Persistent Mini Audio Player

### Testing Checklist

- [ ] All features work on Chrome mobile
- [ ] All features work on Safari iOS
- [ ] Navigation is smooth and responsive
- [ ] Touch targets are at least 48x48px
- [ ] Offline mode works correctly
- [ ] Audio playback persists across navigation
- [ ] Lock screen controls work (test on real device)
- [ ] Accessibility: Screen reader navigation
- [ ] Accessibility: Keyboard navigation
- [ ] Performance: 60fps scrolling

### Performance Audit

Run Lighthouse audit:

```bash
npm run build
npm run start
# In Chrome DevTools: Lighthouse → Mobile → Run audit
```

**Target scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

---

## Next Steps (Week 2+)

**Week 2: Enhanced UX**
- Pull-to-Refresh component
- Bottom Sheet modals
- Swipeable cards

**Week 3: Offline Features**
- Download queue manager
- Storage management
- Smart caching

**Week 4: Performance**
- Image lazy loading
- Virtualized lists
- Bundle optimization

---

## Troubleshooting

### Bottom Nav Not Showing
- Check z-index (should be z-50)
- Verify `fixed bottom-0` classes
- Check if pathname matches /admin (should hide)

### Audio Player Not Persisting
- Verify AudioContext is in Providers
- Check if setCurrentAudio is being called
- Verify audio element has src attribute

### Safe Area Not Working
- Check viewport meta tag in layout
- Verify env() CSS is supported (iOS 11.2+)
- Test on actual device (doesn't work in emulator)

### TypeScript Errors
- Run `npm run typecheck`
- Ensure all imports are correct
- Check AudioContext types match usage

---

## Getting Help

**Documentation:**
- `/home/user/hablas/docs/mobile-ux-enhancements.md` - Complete spec
- `/home/user/hablas/docs/mobile-quick-start.md` - Quick reference
- `/home/user/hablas/docs/MOBILE-UX-SUMMARY.md` - Executive summary

**Examples:**
- `/home/user/hablas/docs/component-examples/` - Ready-to-use components

**Debugging:**
- Use React DevTools to inspect component tree
- Check browser console for errors
- Use Network tab to monitor offline behavior
- Test on real devices, not just browser emulators

---

Good luck with the implementation! 🚀
