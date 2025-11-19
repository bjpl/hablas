# UI/UX Quick Reference Guide
## Modern Patterns for Educational Platforms (2024-2025)

### 🎯 Quick Stats
- **82%** of users prefer dark mode
- **49%** use single-thumb interaction
- **27%** faster interaction with thumb-zone optimization
- **19%** session duration increase with microinteractions
- **4.5:1** minimum contrast ratio for WCAG AA compliance

---

## 🎨 Color System

### Primary Actions
```css
bg-primary-600 text-white     /* #2563eb - 7:1 contrast */
hover:bg-primary-700           /* #1d4ed8 - 10:1 contrast */
```

### States
```css
Success:  bg-success-600 text-white   /* #16a34a */
Warning:  bg-warning-600 text-white   /* #d97706 */
Error:    bg-error-600 text-white     /* #dc2626 */
Info:     bg-primary-600 text-white   /* #2563eb */
```

### Brands
```css
Rappi:    bg-[#fff5f3] text-[#cc3619]
Uber:     bg-gray-100 text-gray-900
DiDi:     bg-[#fff4ed] text-[#cc5200]
WhatsApp: bg-[#25d366] text-white
```

---

## 📱 Touch Targets

### Minimum Sizes
- **Buttons:** 48x48dp
- **Icons:** 44x44dp
- **Touch areas:** Add invisible padding if needed

### Example
```tsx
<button className="min-h-[48px] min-w-[48px] p-3">
  <Icon className="w-6 h-6" />
</button>
```

---

## 🎭 Microinteractions

### Loading States
```tsx
// Skeleton
<div className="animate-pulse bg-gray-200 h-6 rounded" />

// Spinner
<div className="animate-spin">⏳</div>
```

### Celebrations
```tsx
// Confetti on completion
<div className="animate-bounce text-6xl">🎉</div>

// Achievement unlock
<Toast icon="🏆" title="¡Nuevo logro!" />
```

### Hover Effects
```tsx
transition-all hover:scale-105 hover:shadow-lg
active:scale-95
```

---

## 🔍 Search Patterns

### Instant Feedback
```tsx
// Debounce 300ms
const debouncedSearch = useMemo(
  () => debounce(onSearch, 300),
  []
);
```

### Autocomplete
```tsx
{suggestions.map(s => (
  <button className="hover:bg-gray-50 p-3">
    🔍 {s}
  </button>
))}
```

### Empty State
```tsx
<div className="text-center py-12">
  <div className="text-6xl mb-4">🔍</div>
  <h3>No encontramos resultados</h3>
  <p>Intenta con otras palabras clave</p>
  <button>Ver todos los recursos</button>
</div>
```

---

## 🎵 Audio Player

### Essential Controls
- Play/Pause (large, 48x48dp)
- ±10 second skip buttons
- Speed: 0.5x, 0.75x, 1x, 1.25x, 1.5x
- Progress slider (scrubbing)
- Volume control

### Learning Features
```tsx
// A-B Loop
<button onClick={setPointA}>A: {formatTime(pointA)}</button>
<button onClick={setPointB}>B: {formatTime(pointB)}</button>

// Speed recommendation
const speed = level === 'basico' ? 0.75 : 1.0;
```

### Waveform
```tsx
// Simple bars animation
{isPlaying && (
  <div className="flex gap-1">
    {[1,2,3,4].map(i => (
      <div
        className="w-1 bg-green-500 animate-pulse"
        style={{ height: `${8 + i*4}px` }}
      />
    ))}
  </div>
)}
```

---

## 📊 Progress Tracking

### Progress Ring
```tsx
<svg className="w-24 h-24 -rotate-90">
  <circle r="40" stroke="#e5e7eb" fill="none" />
  <circle
    r="40"
    stroke="#10b981"
    strokeDasharray={`${progress * 2.51} 251`}
    fill="none"
  />
</svg>
```

### Streak Counter
```tsx
<div className="flex items-center gap-2">
  <span className="text-2xl">🔥</span>
  <div>
    <div className="text-xs">Racha</div>
    <div className="font-bold text-orange-600">{days} días</div>
  </div>
</div>
```

---

## 👆 Mobile Gestures

### Swipe Actions
```tsx
// Swipe right to bookmark
// Swipe left to dismiss
onTouchEnd={() => {
  const distance = touchStart - touchEnd;
  if (distance > 100) onDismiss();
  if (distance < -100) onBookmark();
}}
```

### Pull to Refresh
```tsx
// Pull down when scrollY === 0
{pullDistance > 60 && <RefreshIcon />}
```

### Long Press
```tsx
// 500ms timeout for context menu
const timer = setTimeout(() => {
  navigator.vibrate(50);
  showContextMenu();
}, 500);
```

---

## 🎮 Gamification

### Achievements
```tsx
const achievements = [
  { id: 'first', icon: '🎯', name: 'Primera Lección' },
  { id: 'streak5', icon: '🔥', name: 'Racha 5 Días' },
  { id: 'audio10', icon: '🎧', name: 'Maestro Audio' }
];
```

### Progress Stats
```tsx
<div className="grid grid-cols-2 gap-4">
  <Stat value={totalMinutes} label="minutos" />
  <Stat value={completed} label="recursos" />
</div>
```

---

## 🎯 Bottom Navigation

### Thumb-Friendly Tabs
```tsx
<nav className="fixed bottom-0 left-0 right-0">
  <div className="flex justify-around">
    {tabs.map(tab => (
      <button className="flex flex-col items-center py-2">
        <span className="text-2xl">{tab.icon}</span>
        <span className="text-xs">{tab.label}</span>
      </button>
    ))}
  </div>
</nav>
```

### Filter Drawer
```tsx
// Bottom sheet for filters
<div className={`
  fixed inset-x-0 bottom-0 bg-white rounded-t-2xl
  transform transition-transform
  ${isOpen ? 'translate-y-0' : 'translate-y-full'}
`}>
  {/* Filters */}
  <button className="w-full bg-blue-600 text-white py-4">
    Aplicar
  </button>
</div>
```

---

## ✅ Accessibility Checklist

- [ ] All buttons are 48x48dp minimum
- [ ] Color contrast is 4.5:1 for text (AA)
- [ ] Focus indicators visible (ring-2)
- [ ] ARIA labels on interactive elements
- [ ] Skip-to-content link for keyboard users
- [ ] Semantic HTML (nav, main, article)
- [ ] Alt text on images
- [ ] Form labels properly associated
- [ ] Keyboard navigation works
- [ ] Screen reader tested

---

## 🚀 Quick Implementation Priority

### Week 1-2 (Quick Wins)
1. Loading skeletons
2. Enhanced empty states
3. Celebration animations
4. Active filter badges
5. Progress rings

### Week 3-4 (Search)
1. Autocomplete
2. Clickable tags
3. Sort controls
4. Search history

### Week 5-6 (Audio)
1. A-B loop
2. Waveform visualization
3. Synced transcripts
4. Speed recommendations

### Week 7-8 (Mobile)
1. Bottom navigation
2. Filter drawer
3. Swipe gestures
4. Pull-to-refresh

---

## 📚 Resources

**Tools:**
- InclusiveColors.com - Color palette generator
- AccessiblePalette.com - WCAG color checker
- Lighthouse - Performance & accessibility audit
- Wave - Accessibility evaluation

**Inspiration:**
- Duolingo - Gamification patterns
- Khan Academy - Progress tracking
- Coursera - Card-based layouts
- Babbel - Audio learning UX

**Guidelines:**
- WCAG 2.1 - Accessibility standards
- Material Design - Touch targets
- iOS HIG - Mobile patterns
- Nielsen Norman Group - UX research
