# Mobile-First UI/UX Enhancements for Hablas Platform

## Executive Summary

This document provides comprehensive mobile-first design recommendations for the Hablas platform, specifically targeting Colombian gig workers (Rappi/Uber/DiDi drivers) who primarily access the platform on Android smartphones with intermittent connectivity and limited time for learning.

**Target User Context:**
- **Device:** Primarily Android smartphones (mid-range, ~4-6GB RAM)
- **Network:** Mobile data (3G/4G), often intermittent during deliveries
- **Usage Pattern:** 5-15 minute learning sessions between gigs
- **Environment:** Noisy streets, distracting environments, one-handed operation
- **Language:** Spanish primary, learning English
- **Tech Literacy:** Moderate, familiar with WhatsApp/social media patterns

---

## 1. Navigation Patterns

### 1.1 Bottom Navigation Bar (Primary)

**Implementation:** Sticky bottom navigation with 5 core sections

```tsx
// components/mobile/BottomNav.tsx
'use client'

import { Home, BookOpen, Mic, Users, User } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Inicio', ariaLabel: 'Ir a inicio' },
  { href: '/recursos', icon: BookOpen, label: 'Recursos', ariaLabel: 'Ver recursos de aprendizaje' },
  { href: '/practica', icon: Mic, label: 'Practicar', ariaLabel: 'Practicar inglés' },
  { href: '/comunidad', icon: Users, label: 'Comunidad', ariaLabel: 'Comunidad de estudiantes' },
  { href: '/perfil', icon: User, label: 'Perfil', ariaLabel: 'Mi perfil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe"
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
                  ? 'text-accent-green bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} aria-hidden="true" />
              <span className={`text-xs mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
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

**CSS Updates (app/globals.css):**
```css
@layer utilities {
  /* Safe area support for iOS notch/Android gesture bars */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
  }

  /* Account for bottom nav height */
  .mb-bottom-nav {
    margin-bottom: calc(4rem + env(safe-area-inset-bottom, 0px));
  }
}
```

**Layout Integration (app/layout.tsx):**
```tsx
import BottomNav from '@/components/mobile/BottomNav'

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
            <BottomNav />
            <AdminNav />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

### 1.2 Pull-to-Refresh

**Implementation:** Native-feeling pull-to-refresh for resource lists

```tsx
// components/mobile/PullToRefresh.tsx
'use client'

import { useState, useRef, useCallback, ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  threshold?: number
}

export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing || window.scrollY > 0) return

    const currentY = e.touches[0].clientY
    const distance = currentY - touchStartY.current

    if (distance > 0 && distance < threshold * 2) {
      setPullDistance(distance)
      setIsPulling(true)
    }
  }, [isRefreshing, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    setIsPulling(false)
    setPullDistance(0)
  }, [pullDistance, threshold, isRefreshing, onRefresh])

  const pullProgress = Math.min(pullDistance / threshold, 1)
  const rotation = pullProgress * 360

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div
        className={`absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 ${
          isPulling || isRefreshing ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          height: `${Math.min(pullDistance, threshold)}px`,
          transform: `translateY(-${threshold - pullDistance}px)`
        }}
        aria-live="polite"
        aria-label={isRefreshing ? 'Actualizando contenido' : 'Desliza para actualizar'}
      >
        <RefreshCw
          className={`w-6 h-6 text-accent-green ${isRefreshing ? 'animate-spin' : ''}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      </div>

      {children}
    </div>
  )
}
```

**Usage Example:**
```tsx
// app/page.tsx
<PullToRefresh onRefresh={async () => {
  await refetchResources()
  // Optionally show toast: "Recursos actualizados"
}}>
  <ResourceLibrary {...props} />
</PullToRefresh>
```

---

## 2. Touch-Optimized Interactions

### 2.1 Swipeable Resource Cards

**Implementation:** Tinder-style swipe cards for quick browsing

```tsx
// components/mobile/SwipeableCard.tsx
'use client'

import { useState, useRef, ReactNode } from 'react'
import { Heart, BookmarkPlus, Share2 } from 'lucide-react'

interface SwipeableCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  className?: string
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  className = ''
}: SwipeableCardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [velocity, setVelocity] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0, time: 0 })

  const SWIPE_THRESHOLD = 100
  const VELOCITY_THRESHOLD = 0.5

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    startPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startPos.current.x
    const deltaY = touch.clientY - startPos.current.y

    // Only allow horizontal swipes or upward swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) || deltaY < 0) {
      setPosition({ x: deltaX, y: deltaY })
    }
  }

  const handleTouchEnd = () => {
    const timeElapsed = (Date.now() - startPos.current.time) / 1000
    const velocityX = position.x / timeElapsed
    const velocityY = position.y / timeElapsed
    setVelocity({ x: velocityX, y: velocityY })

    // Check if swipe threshold met
    if (Math.abs(position.x) > SWIPE_THRESHOLD || Math.abs(velocityX) > VELOCITY_THRESHOLD) {
      if (position.x > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (position.x < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    } else if (position.y < -SWIPE_THRESHOLD || velocityY < -VELOCITY_THRESHOLD) {
      if (onSwipeUp) {
        onSwipeUp()
      }
    }

    // Reset position
    setPosition({ x: 0, y: 0 })
    setIsDragging(false)
  }

  const rotation = position.x * 0.03 // Subtle rotation based on swipe
  const opacity = 1 - Math.abs(position.x) / (SWIPE_THRESHOLD * 3)

  return (
    <div className="relative">
      {/* Swipe indicators */}
      <div
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-0 transition-opacity duration-200"
        style={{ opacity: Math.max(0, position.x / SWIPE_THRESHOLD) }}
      >
        <div className="bg-green-500 text-white p-3 rounded-full shadow-lg">
          <Heart className="w-6 h-6" fill="currentColor" />
        </div>
      </div>

      <div
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-0 transition-opacity duration-200"
        style={{ opacity: Math.max(0, -position.x / SWIPE_THRESHOLD) }}
      >
        <div className="bg-blue-500 text-white p-3 rounded-full shadow-lg">
          <BookmarkPlus className="w-6 h-6" />
        </div>
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 -top-4 z-0 transition-opacity duration-200"
        style={{ opacity: Math.max(0, -position.y / SWIPE_THRESHOLD) }}
      >
        <div className="bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">Compartir</span>
        </div>
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative z-10 transition-all duration-200 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${className}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
          opacity,
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {children}
      </div>

      {/* Swipe instruction hint (show once) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500 text-center">
        <p>← Guardar | Ver → | ↑ Compartir</p>
      </div>
    </div>
  )
}
```

### 2.2 Long-Press Contextual Menu

```tsx
// hooks/useLongPress.ts
import { useCallback, useRef, useState } from 'react'

interface UseLongPressOptions {
  onLongPress: () => void
  onClick?: () => void
  delay?: number
}

export function useLongPress({
  onLongPress,
  onClick,
  delay = 500
}: UseLongPressOptions) {
  const [isPressed, setIsPressed] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const preventClickRef = useRef(false)

  const start = useCallback(() => {
    preventClickRef.current = false
    setIsPressed(true)

    timeoutRef.current = setTimeout(() => {
      preventClickRef.current = true
      onLongPress()

      // Haptic feedback (if available)
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }, delay)
  }, [onLongPress, delay])

  const clear = useCallback(() => {
    setIsPressed(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleClick = useCallback(() => {
    if (!preventClickRef.current && onClick) {
      onClick()
    }
  }, [onClick])

  return {
    isPressed,
    handlers: {
      onTouchStart: start,
      onTouchEnd: clear,
      onTouchMove: clear,
      onMouseDown: start,
      onMouseUp: clear,
      onMouseLeave: clear,
      onClick: handleClick,
    }
  }
}
```

**Usage Example:**
```tsx
// components/ResourceCard.tsx
const { isPressed, handlers } = useLongPress({
  onLongPress: () => setShowContextMenu(true),
  onClick: () => router.push(`/recursos/${resource.id}`)
})

return (
  <div
    {...handlers}
    className={`card-resource ${isPressed ? 'scale-95 shadow-sm' : ''}`}
  >
    {/* Card content */}
  </div>
)
```

---

## 3. Content Consumption Patterns

### 3.1 Bottom Sheet Modals

**Implementation:** Native-feeling bottom sheets for resource previews

```tsx
// components/mobile/BottomSheet.tsx
'use client'

import { ReactNode, useEffect, useState, useRef } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  snapPoints?: number[] // e.g., [0.3, 0.6, 0.9] = 30%, 60%, 90% of screen
  defaultSnap?: number
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.9],
  defaultSnap = 0
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const delta = e.touches[0].clientY - dragStartY
    if (delta > 0) { // Only allow dragging down
      setDragOffset(delta)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    // Determine if should close or snap to next point
    if (dragOffset > 100) {
      if (currentSnap === 0) {
        onClose()
      } else {
        setCurrentSnap(currentSnap - 1)
      }
    }

    setDragOffset(0)
  }

  const handleExpandToggle = () => {
    if (currentSnap < snapPoints.length - 1) {
      setCurrentSnap(currentSnap + 1)
    } else {
      setCurrentSnap(0)
    }
  }

  if (!isOpen) return null

  const heightPercentage = snapPoints[currentSnap] * 100
  const currentHeight = `${heightPercentage}vh`

  const sheet = (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: isOpen ? 0.5 : 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full bg-white rounded-t-2xl shadow-2xl transition-all duration-300 ease-out flex flex-col"
        style={{
          height: currentHeight,
          transform: `translateY(${dragOffset}px)`,
          maxHeight: '95vh'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
      >
        {/* Drag handle */}
        <div className="flex items-center justify-center py-3 border-b border-gray-200">
          <div
            className="w-12 h-1.5 bg-gray-300 rounded-full cursor-grab active:cursor-grabbing"
            onClick={handleExpandToggle}
            aria-label="Arrastrar para ajustar tamaño"
          />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(sheet, document.body)
}
```

**Usage Example:**
```tsx
const [previewOpen, setPreviewOpen] = useState(false)

<BottomSheet
  isOpen={previewOpen}
  onClose={() => setPreviewOpen(false)}
  title="Vista Previa"
  snapPoints={[0.4, 0.8]}
>
  <ResourcePreview resource={resource} />
</BottomSheet>
```

### 3.2 Skeleton Loading States

```tsx
// components/mobile/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="card-resource animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-8 h-8 bg-gray-200 rounded" />
        <div className="w-16 h-6 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
      </div>
      <div className="mt-4 h-12 bg-gray-200 rounded" />
    </div>
  )
}
```

---

## 4. Persistent Audio Mini-Player

**Implementation:** Sticky mini-player at bottom (above nav)

```tsx
// components/mobile/MiniAudioPlayer.tsx
'use client'

import { Play, Pause, X, ChevronUp } from 'lucide-react'
import { useAudioContext } from '@/lib/contexts/AudioContext'
import { useState } from 'react'
import BottomSheet from './BottomSheet'

export default function MiniAudioPlayer() {
  const { currentAudio, currentTitle, isPlaying, togglePlay, stopAudio } = useAudioContext()
  const [showFullPlayer, setShowFullPlayer] = useState(false)

  if (!currentAudio) return null

  return (
    <>
      {/* Mini Player */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-gradient-to-r from-accent-green to-green-600 text-white shadow-lg pb-safe">
        <div className="flex items-center gap-3 px-4 py-3 max-w-6xl mx-auto">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex-shrink-0 w-10 h-10 bg-white text-accent-green rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          {/* Track info */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setShowFullPlayer(true)}
          >
            <p className="font-medium text-sm truncate">{currentTitle || 'Reproduciendo audio'}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${currentAudio.currentTime / currentAudio.duration * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Expand */}
          <button
            onClick={() => setShowFullPlayer(true)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Expandir reproductor"
          >
            <ChevronUp className="w-6 h-6" />
          </button>

          {/* Close */}
          <button
            onClick={stopAudio}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Cerrar reproductor"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Full Player Bottom Sheet */}
      <BottomSheet
        isOpen={showFullPlayer}
        onClose={() => setShowFullPlayer(false)}
        title={currentTitle}
        snapPoints={[0.6, 0.9]}
      >
        <AudioPlayerFull />
      </BottomSheet>
    </>
  )
}
```

**Context Updates (lib/contexts/AudioContext.tsx):**
```tsx
interface AudioContextType {
  currentAudio: HTMLAudioElement | null
  currentTitle: string | null
  isPlaying: boolean
  setCurrentAudio: (audio: HTMLAudioElement | null, title?: string) => void
  togglePlay: () => void
  stopAudio: () => void
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentAudio, setCurrentAudioState] = useState<HTMLAudioElement | null>(null)
  const [currentTitle, setCurrentTitle] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const setCurrentAudio = useCallback((audio: HTMLAudioElement | null, title?: string) => {
    // Stop previous audio
    if (currentAudio && currentAudio !== audio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }

    setCurrentAudioState(audio)
    setCurrentTitle(title || null)
    setIsPlaying(!!audio && !audio.paused)
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
    setIsPlaying(false)
  }, [currentAudio])

  return (
    <AudioContext.Provider value={{
      currentAudio,
      currentTitle,
      isPlaying,
      setCurrentAudio,
      togglePlay,
      stopAudio
    }}>
      {children}
    </AudioContext.Provider>
  )
}
```

---

## 5. Offline-First Features

### 5.1 Download Queue Manager

```tsx
// components/mobile/DownloadQueue.tsx
'use client'

import { useState, useEffect } from 'react'
import { Download, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { getDownloadQueue, removeFromQueue } from '@/lib/offline-storage'

interface QueueItem {
  id: number
  title: string
  type: string
  size: string
  status: 'pending' | 'downloading' | 'completed' | 'failed'
  progress: number
}

export default function DownloadQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [storageUsed, setStorageUsed] = useState({ used: 0, available: 0 })

  useEffect(() => {
    loadQueue()
    checkStorageUsage()
  }, [])

  const loadQueue = async () => {
    const items = await getDownloadQueue()
    setQueue(items)
  }

  const checkStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      setStorageUsed({
        used: estimate.usage || 0,
        available: estimate.quota || 0
      })
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Storage indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Almacenamiento usado</span>
          <span className="text-sm text-blue-700">
            {formatBytes(storageUsed.used)} / {formatBytes(storageUsed.available)}
          </span>
        </div>
        <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(storageUsed.used / storageUsed.available) * 100}%` }}
          />
        </div>
      </div>

      {/* Queue items */}
      <div className="space-y-2">
        {queue.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Download className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay descargas pendientes</p>
          </div>
        ) : (
          queue.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {/* Status icon */}
                <div className="flex-shrink-0 mt-1">
                  {item.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {item.status === 'failed' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {item.status === 'downloading' && (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {item.status === 'pending' && (
                    <Download className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.type} • {item.size}</p>

                  {item.status === 'downloading' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Descargando...</span>
                        <span className="text-xs text-gray-600">{item.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromQueue(item.id)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Eliminar de la cola"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

### 5.2 Offline Mode Indicator

```tsx
// components/mobile/OfflineIndicator.tsx
'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showNotice, setShowNotice] = useState(false)

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
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showNotice) return null

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-gray-900 text-white'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5" />
            <span className="font-medium">Conectado</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">Sin conexión - Modo offline</span>
          </>
        )}
      </div>
    </div>
  )
}
```

---

## 6. Performance Optimizations

### 6.1 Image Lazy Loading with Blur Placeholder

```tsx
// components/mobile/LazyImage.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Generate tiny blur placeholder (can be pre-generated at build time)
  const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4='

  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Imagen no disponible</span>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  )
}
```

### 6.2 Virtualized List for Long Resource Lists

```tsx
// components/mobile/VirtualizedList.tsx
'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  renderItem: (item: T, index: number) => ReactNode
  overscan?: number
  className?: string
}

export default function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className = ''
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollTop(container.scrollTop)
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })

    container.addEventListener('scroll', handleScroll, { passive: true })
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      resizeObserver.disconnect()
    }
  }, [])

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, idx) =>
            renderItem(item, startIndex + idx)
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 7. Modern Mobile Patterns

### 7.1 Story-Style Content Carousel

```tsx
// components/mobile/StoryCarousel.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

interface Story {
  id: number
  title: string
  content: string
  media?: string
  duration?: number
}

interface StoryCarouselProps {
  stories: Story[]
  autoAdvance?: boolean
  onComplete?: () => void
}

export default function StoryCarousel({
  stories,
  autoAdvance = true,
  onComplete
}: StoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  const currentStory = stories[currentIndex]
  const duration = currentStory.duration || 5000

  useEffect(() => {
    if (!autoAdvance || isPaused) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = (elapsed / duration) * 100

      if (newProgress >= 100) {
        handleNext()
      } else {
        setProgress(newProgress)
      }
    }, 50)

    intervalRef.current = interval

    return () => clearInterval(interval)
  }, [currentIndex, isPaused, autoAdvance, duration])

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setProgress(0)
    } else {
      onComplete?.()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setProgress(0)
    }
  }

  const handleTap = (e: React.TouchEvent) => {
    const { clientX } = e.touches[0]
    const { width } = e.currentTarget.getBoundingClientRect()

    if (clientX < width / 3) {
      handlePrevious()
    } else if (clientX > (width * 2) / 3) {
      handleNext()
    } else {
      setIsPaused(!isPaused)
    }
  }

  return (
    <div className="relative h-screen bg-black">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
        {stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Story content */}
      <div
        className="h-full w-full flex items-center justify-center p-6"
        onTouchStart={handleTap}
      >
        {currentStory.media && (
          <img
            src={currentStory.media}
            alt={currentStory.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="relative z-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">{currentStory.title}</h2>
          <p className="text-lg leading-relaxed">{currentStory.content}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-20 left-0 right-0 z-10 flex items-center justify-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-3 bg-white/20 rounded-full backdrop-blur-sm disabled:opacity-30 active:scale-95 transition-transform"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-3 bg-white/20 rounded-full backdrop-blur-sm active:scale-95 transition-transform"
          aria-label={isPaused ? 'Continuar' : 'Pausar'}
        >
          {isPaused ? <Play className="w-6 h-6 text-white ml-0.5" /> : <Pause className="w-6 h-6 text-white" />}
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === stories.length - 1}
          className="p-3 bg-white/20 rounded-full backdrop-blur-sm disabled:opacity-30 active:scale-95 transition-transform"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Counter */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 text-white text-sm font-medium">
        {currentIndex + 1} / {stories.length}
      </div>
    </div>
  )
}
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Implement BottomNav component
- [ ] Add safe area CSS utilities
- [ ] Update layout to include MiniAudioPlayer
- [ ] Implement OfflineIndicator
- [ ] Add skeleton loading states

### Phase 2: Touch Interactions (Week 3-4)
- [ ] Implement PullToRefresh
- [ ] Add SwipeableCard for resource browsing
- [ ] Implement useLongPress hook
- [ ] Add BottomSheet component
- [ ] Implement haptic feedback (where available)

### Phase 3: Audio Experience (Week 5)
- [ ] Build MiniAudioPlayer component
- [ ] Update AudioContext with full controls
- [ ] Add lock screen media session API
- [ ] Implement background playback
- [ ] Add playback position persistence

### Phase 4: Offline Features (Week 6-7)
- [ ] Implement DownloadQueue component
- [ ] Add storage management UI
- [ ] Implement smart pre-caching
- [ ] Add sync status indicators
- [ ] Build offline resource viewer

### Phase 5: Performance (Week 8)
- [ ] Implement LazyImage component
- [ ] Add VirtualizedList for resource library
- [ ] Optimize bundle size (code splitting)
- [ ] Add progressive enhancement
- [ ] Implement reduced motion preferences

### Phase 6: Modern Patterns (Week 9-10)
- [ ] Build StoryCarousel for featured content
- [ ] Add card stack interface
- [ ] Implement gesture-based navigation
- [ ] Add micro-interactions
- [ ] Polish animations and transitions

---

## 9. Testing Strategy

### 9.1 Device Testing Matrix

| Device Category | Models | Screen Size | OS Version | Priority |
|----------------|--------|-------------|------------|----------|
| Low-end Android | Samsung A03, Moto E | 6.5" | Android 11+ | High |
| Mid-range Android | Samsung A54, Xiaomi Redmi | 6.4-6.6" | Android 12+ | Critical |
| High-end Android | Samsung S23, Pixel 7 | 6.1-6.7" | Android 13+ | Medium |
| iOS | iPhone SE, iPhone 14 | 4.7-6.1" | iOS 15+ | Medium |

### 9.2 Performance Benchmarks

**Target Metrics:**
- First Contentful Paint (FCP): < 1.5s on 3G
- Largest Contentful Paint (LCP): < 2.5s on 3G
- Time to Interactive (TTI): < 3.5s on 3G
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Bundle size: < 200KB initial (gzipped)

### 9.3 User Testing Scenarios

1. **Quick Learning Session** (5 min)
   - Open app → Browse resources → Play audio → Close app
   - Test: Can user complete without frustration?

2. **Offline Usage** (10 min)
   - Download 3 resources → Go offline → Access content
   - Test: Is offline experience seamless?

3. **Audio Learning** (15 min)
   - Play audio → Switch apps → Return to app
   - Test: Does audio persist correctly?

4. **Discovery** (10 min)
   - Search → Filter → Browse → Save favorite
   - Test: Is navigation intuitive?

---

## 10. Accessibility Considerations

### 10.1 Touch Target Sizes
- Minimum: 44x44px (iOS), 48x48px (Android)
- Implemented: 44px minimum throughout

### 10.2 Screen Reader Support
- All interactive elements have aria-labels
- Semantic HTML elements (nav, main, article)
- Live regions for dynamic content (aria-live)

### 10.3 Keyboard Navigation
- Skip to content link
- Focus visible indicators
- Logical tab order

### 10.4 Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Analytics & Monitoring

### Key Metrics to Track

1. **Engagement Metrics**
   - Daily active users (DAU)
   - Session duration
   - Resources viewed per session
   - Audio completion rate
   - Return user rate

2. **Performance Metrics**
   - Page load times
   - Audio load times
   - Offline cache hit rate
   - Error rates

3. **Mobile-Specific Metrics**
   - Install-to-home-screen rate
   - Offline usage percentage
   - Network speed distribution
   - Device/OS distribution
   - Touch vs click interaction ratio

**Implementation:**
```tsx
// lib/analytics.ts
export function trackMobileInteraction(action: string, data?: any) {
  // Track swipe gestures
  if (action.startsWith('swipe_')) {
    analytics.track('Mobile Gesture', { action, ...data })
  }

  // Track offline usage
  if (!navigator.onLine) {
    analytics.track('Offline Usage', { action, ...data })
  }

  // Track audio engagement
  if (action.startsWith('audio_')) {
    analytics.track('Audio Interaction', { action, ...data })
  }
}
```

---

## 12. Next Steps

1. **Review with stakeholders** - Validate mobile-first approach
2. **Prototype key interactions** - Build clickable prototypes
3. **User testing** - Test with real gig workers in Colombia
4. **Iterate based on feedback** - Refine patterns
5. **Phased rollout** - Start with Phase 1, measure, iterate

---

## Appendix: Quick Reference

### Component Checklist
- [ ] BottomNav - Navigation bar
- [ ] PullToRefresh - Refresh gesture
- [ ] SwipeableCard - Swipe interactions
- [ ] BottomSheet - Modal presentations
- [ ] MiniAudioPlayer - Persistent player
- [ ] DownloadQueue - Offline management
- [ ] OfflineIndicator - Network status
- [ ] SkeletonCard - Loading states
- [ ] LazyImage - Image optimization
- [ ] VirtualizedList - List performance
- [ ] StoryCarousel - Story-style content

### Hook Checklist
- [ ] useLongPress - Long press detection
- [ ] useSwipe - Swipe gesture detection
- [ ] useAudioContext - Global audio state
- [ ] useOfflineStatus - Network monitoring
- [ ] useStorageEstimate - Storage usage

### Utility Checklist
- [ ] Haptic feedback helper
- [ ] Network speed detection
- [ ] Device capability detection
- [ ] Touch vs mouse detection
- [ ] Safe area calculations
