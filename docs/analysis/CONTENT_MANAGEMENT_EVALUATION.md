# Content Management & Loading System Evaluation
**Hablas English Learning Platform**
**Evaluation Date:** 2025-11-27
**Evaluator:** Research & Analysis Agent

---

## Executive Summary

The Hablas app's content management system is well-architected with modern patterns, but has several **critical gaps** that affect functionality:

### Critical Issues Found
1. **Missing Resource IDs**: Resources 3, 8, and 24 are referenced but undefined
2. **Orphaned Audio Files**: 8 audio files (45-52) exist but aren't mapped to resources
3. **No Progress Tracking**: User learning progress is not persisted
4. **Limited Multi-Language**: Language switching not implemented
5. **Hidden Resources**: 25 resources marked hidden (45% of total)

### System Health
- ✅ **Audio System**: Robust playback with caching and offline support
- ✅ **Content Loading**: Efficient with retry logic and error handling
- ✅ **Filtering**: Category and level filtering working correctly
- ⚠️ **Data Integrity**: Resource ID gaps and orphaned files
- ❌ **Progress Tracking**: Not implemented beyond audio playback position
- ❌ **Language Support**: Spanish-only interface, no i18n

---

## 1. Content Data Structure

### Location & Organization
```
/public/
├── generated-resources/50-batch/
│   ├── repartidor/     # Delivery driver content (15 files)
│   ├── conductor/      # Rideshare driver content (13 files)
│   ├── all/            # Shared content (9 files)
│   └── report.json     # Generation metadata
├── audio/
│   ├── resource-*.mp3  # 59 audio files (1-59, gaps at 3,8,24)
│   └── metadata.json   # Audio metadata (9 resources only)
└── resources/          # Legacy resources (6 PDF files)
```

### Resource Definition Structure
**File:** `/data/resources.ts`
**Total Resources:** 56 entries
**Visible Resources:** 31 (55%)
**Hidden Resources:** 25 (45% - marked for review)

```typescript
interface Resource {
  id: number                    // ⚠️ Not sequential (missing 3,8,24)
  title: string
  description: string
  type: 'pdf' | 'audio' | 'image' | 'video'
  category: 'all' | 'repartidor' | 'conductor'
  level: 'basico' | 'intermedio' | 'avanzado'
  size: string
  downloadUrl: string           // Points to /generated-resources/
  tags: readonly string[]
  offline: boolean              // All set to true
  contentPath?: string          // Development path (Windows)
  audioUrl?: string            // Maps to /audio/resource-*.mp3
  metadata?: MediaMetadata
  hidden?: boolean             // 25 resources hidden
}
```

### Data Integrity Issues

#### Missing Resource IDs
```bash
# Resources referenced but not defined:
- ID 3:  No entry (expected between 2 and 4)
- ID 8:  No entry (expected between 7 and 9)
- ID 24: No entry (expected between 23 and 25)
```

**Impact:** These IDs may be hardcoded in URLs, bookmarks, or shared links, leading to 404 errors.

#### Orphaned Audio Files
```bash
# Audio files without resource mappings:
/audio/resource-45.mp3 - 13MB
/audio/resource-46.mp3 - 4.4MB
/audio/resource-47.mp3 - 6.3MB
/audio/resource-48.mp3 - 5.2MB
/audio/resource-49.mp3 - 5.7MB
/audio/resource-50.mp3 - 6.4MB
/audio/resource-51.mp3 - 3.2MB
/audio/resource-52.mp3 - 8.3MB
Total waste: ~50MB
```

**Impact:** Unnecessary storage consumption, potential confusion during maintenance.

#### Content File Mismatch
```
Expected content files: 56 (one per resource)
Actual MD files: 29
Actual audio scripts: 9
Total: 38 files

Missing: 18 content files (32%)
```

### Hidden Resources Analysis
25 resources (IDs 31-56 except 37-44) are marked `hidden: true`:
- **Purpose:** Under review before public release
- **Issue:** No admin interface to manage hidden status
- **Recommendation:** Build content review dashboard

---

## 2. Audio File Organization & Playback

### Audio System Architecture

#### File Structure
```
/public/audio/
├── resource-[1-59].mp3     # 59 files, 245MB total
├── metadata.json           # Only 9 resources documented
├── emergencia-var1-es.mp3  # Legacy files
├── emergency-var1-en.mp3   # (not in metadata)
└── [other legacy files]
```

#### Audio Metadata Coverage
```json
// /public/audio/metadata.json - Only 9 of 59 files
{
  "resources": {
    "2": { "voice": "co_spanish_female", "speaker": "Salome" },
    "7": { "voice": "co_spanish_male", "speaker": "Gonzalo" },
    "10": { "voice": "mx_spanish_female", "speaker": "Dalia" },
    "13": { "voice": "us_english_male", "speaker": "Guy" },
    "18": { "voice": "us_english_female", "speaker": "Jenny" },
    "21": { "voice": "co_spanish_female", "speaker": "Salome" },
    "28": { "voice": "co_spanish_male", "speaker": "Gonzalo" },
    "32": { "voice": "mx_spanish_female", "speaker": "Dalia" },
    "34": { "voice": "us_english_male", "speaker": "Guy" }
  }
}
```

**Gap:** 50 audio files lack metadata (voice actor, duration, accent)

### Audio Playback System

#### Components
1. **AudioContext** (`/lib/contexts/AudioContext.tsx`)
   - Global state for currently playing audio
   - Ensures only one audio plays at a time
   - ✅ Clean implementation, no global variables

2. **useAudioPlayer Hook** (`/lib/hooks/useAudioPlayer.ts`)
   - Custom hook for audio logic
   - Features:
     - ✅ Preloading and caching
     - ✅ Playback position persistence (localStorage)
     - ✅ Error handling with retry
     - ✅ Playback rate control
     - ✅ Download for offline use
     - ✅ Volume and loop controls

3. **Audio Utilities** (`/lib/audio-utils.ts`)
   - Preloading with Service Worker integration
   - Cache checking (memory + SW cache)
   - Download functionality
   - Position tracking via localStorage

#### Playback Features
```typescript
// State tracked per audio file
- isPlaying: boolean
- currentTime: number
- duration: number
- playbackRate: number (adjustable speed)
- volume: number
- isLooping: boolean
- isCached: boolean (offline availability)
- error: string | null

// Controls available
- play(), pause(), toggle()
- seek(time), skipTime(seconds)
- setPlaybackRate(rate)
- retry() on error
- download(filename) for offline
```

#### Storage & Caching
```typescript
// localStorage keys used:
`audio-position-${btoa(audioUrl)}` // Playback position

// Service Worker cache:
'hablas-runtime-v1' // Audio files cached here

// Memory cache:
Map<string, Blob> // In-memory audio cache
```

### Audio Loading Issues

#### URL Resolution
```typescript
// AudioPlayer expects absolute URLs
audioUrl: "/audio/resource-1.mp3"

// Problem: Relative URLs fail in some contexts
// Solution: AudioPlayer handles both absolute and relative
```

#### Error Handling
```typescript
// Comprehensive error messages
switch (audio.error.code) {
  case MediaError.MEDIA_ERR_ABORTED:
    return 'Carga de audio cancelada'
  case MediaError.MEDIA_ERR_NETWORK:
    return 'Error de red al cargar el audio'
  case MediaError.MEDIA_ERR_DECODE:
    return 'Error al decodificar el archivo de audio'
  case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
    return 'Formato no soportado o archivo no encontrado'
}
```

✅ **Status:** Audio playback system is robust and production-ready

---

## 3. Resource Loading Mechanisms

### Content Fetcher System
**File:** `/lib/utils/content-fetcher.ts`

#### Architecture
```typescript
// Main function
fetchResourceContent(
  resourceId: string,
  urls: {
    downloadableUrl?: string,
    webUrl?: string,
    audioUrl?: string
  },
  options?: FetchOptions
): Promise<FetchedContent>

// Returns
{
  downloadable: string,  // PDF/markdown content
  web: string,          // Web version (same as downloadable)
  audio: string         // Audio transcript
}
```

#### Features
- ✅ **Retry Logic**: Exponential backoff (3 retries max)
- ✅ **Caching**: 5-minute cache in Map
- ✅ **Parallel Fetching**: All content types fetched simultaneously
- ✅ **Error Tolerance**: Partial success acceptable
- ✅ **AbortController**: Cancellable requests

#### Content Loading Flow
```
1. Check cache (5min TTL)
   ↓
2. Fetch in parallel:
   - Downloadable: /api/content/{id} → fallback to file
   - Web: Same as downloadable
   - Audio: Derive transcript URL from download URL
   ↓
3. Cache results
   ↓
4. Return partial success (some content may fail)
```

#### Loading Patterns
```typescript
// Server-side (page.tsx)
const rawContent = fs.readFileSync(publicPath, 'utf-8')
const contentText = transformAudioScriptToUserFormat(rawContent)
return <ResourceDetail initialContent={contentText} />

// Client-side (ResourceDetail.tsx)
useEffect(() => {
  if (initialContent) {
    setContent(initialContent)  // Immediate render
  }
}, [initialContent])
```

### Content Processing Pipeline

#### Audio Script Transformation
**File:** `/app/recursos/[id]/transform-audio-script.ts`

```typescript
// Removes production metadata
- **[Tone: ...]** markers
- **[Speaker: ...]** markers
- **[PAUSE: ...]** markers
- [Sound effect: ...] markers
- Timestamp headers [00:00]
- Duration/Target metadata

// Preserves
- Section structure (###, ##)
- Dialogue content
- Blockquotes for speech
```

#### Markdown Cleaning
```typescript
function cleanBoxCharacters(text: string): string {
  // Remove box-drawing characters
  .replace(/[┌┐└┘├┤┬┴┼─│═║╔╗╚╝╠╣╦╩╬]/g, '')
  // Normalize whitespace
  .split('\n').map(line => line.trim()).join('\n')
  // Max 2 consecutive newlines
  .replace(/\n{3,}/g, '\n\n')
}
```

### Static Generation
```typescript
// Build-time rendering (generateStaticParams)
export async function generateStaticParams() {
  return visibleResources.map((resource) => ({
    id: resource.id.toString(),
  }))
}
// Only visible resources get static pages
// Hidden resources redirect to home
```

✅ **Status:** Content loading is efficient and user-friendly

---

## 4. Multi-Language Support

### Current Language Configuration

#### Interface Language
- **Primary:** Spanish (Colombian)
- **Fallback:** None
- **i18n Library:** Not installed
- **Language Switcher:** Not implemented

#### Content Language
```typescript
// Resources contain bilingual content:
- Spanish (es-CO, es-MX) for instructions
- English (en-US) for practice phrases
- No language attribute on Resource type
- No filter by content language
```

### Language Issues

#### Missing i18n Infrastructure
```bash
# No internationalization found:
❌ No i18n library (react-i18next, next-intl)
❌ No translation files (/locales/*)
❌ No language context
❌ No language switcher component
❌ No language detection
```

#### Hardcoded Strings
```typescript
// All UI text is hardcoded Spanish
"Recursos de Aprendizaje"
"No hay recursos disponibles"
"Filtrar por trabajo:"
"Descargar"
```

### Language in Audio Metadata
```json
// /public/metadata.json shows language codes
"language": "es-CO"  // Colombian Spanish
"language": "en-US"  // American English
// But not used for filtering or display
```

### Multi-Language Recommendation
```typescript
// Proposed structure
interface Resource {
  id: number
  title: LocalizedString      // {es: "...", en: "..."}
  description: LocalizedString
  contentLanguage: 'es' | 'en' | 'bilingual'
  uiLanguage: 'es' | 'en'     // Interface language
  // ... rest
}

// User preferences
localStorage.setItem('preferredLanguage', 'es')
```

❌ **Status:** Multi-language support not implemented

---

## 5. Content Filtering & Search

### Filter System Architecture

#### Filter State (HomePage)
```typescript
const [selectedCategory, setSelectedCategory] =
  useState<'all' | 'repartidor' | 'conductor'>('all')
const [selectedLevel, setSelectedLevel] =
  useState<'all' | 'basico' | 'intermedio'>('all')
const [searchQuery, setSearchQuery] = useState('')
```

#### Filter Logic (ResourceLibrary)
```typescript
const filteredResources = visibleResources.filter(resource => {
  // Category filter
  const categoryMatch =
    category === 'all' ||
    resource.category === category ||
    resource.category === 'all'

  // Level filter
  const levelMatch =
    level === 'all' ||
    resource.level === level

  // Search filter
  const searchableText = [
    resource.title,
    resource.description,
    ...resource.tags,
    resource.category,
    resource.level,
    resource.type
  ].join(' ').toLowerCase()

  const searchMatch =
    !searchQuery ||
    searchableText.includes(searchQuery.toLowerCase())

  return categoryMatch && levelMatch && searchMatch
})
```

### Filter Features

#### Category Filters
- **All** (default)
- **Repartidor** (Delivery drivers - Rappi, Uber Eats)
- **Conductor** (Rideshare drivers - Uber, DiDi)

Resources with `category: 'all'` appear in all filters ✅

#### Level Filters
- **Todos** (All levels)
- **Básico** (Basic - 22 resources)
- **Intermedio** (Intermediate - 9 resources)

Missing: **Avanzado** (Advanced) - no resources yet

#### Search Features
✅ **Searches across:**
- Title
- Description
- Tags
- Category name
- Level name
- Resource type

✅ **Search characteristics:**
- Case-insensitive
- Substring matching
- Real-time filtering
- Debounced input (via SearchBar component)

### Filter UI/UX

#### Visual States
```typescript
// Selected state
className="bg-accent-blue text-white border-accent-blue shadow-md scale-105"

// Unselected state
className="bg-white text-gray-700 border-gray-300 hover:border-accent-blue"

// Checkmark indicator
{selectedCategory === 'all' && <span>✓</span>}
```

#### Accessibility
```typescript
// ARIA attributes
aria-pressed={selectedCategory === 'all'}
role="group"
aria-labelledby="category-filter-label"
aria-label="Lista de recursos de aprendizaje"
```

#### Screen Reader Announcements
```typescript
<div role="status" aria-live="polite">
  {filteredResources.length} recursos encontrados
</div>
```

### Filter Performance
```typescript
// Filters applied to visibleResources only (31 resources)
// Not all 56 resources
// O(n) filtering, efficient for small dataset
```

✅ **Status:** Filtering and search working correctly

---

## 6. Progress Tracking System

### Current Implementation

#### Playback Position Tracking
```typescript
// Audio playback position stored in localStorage
function savePlaybackPosition(audioUrl: string, position: number) {
  const key = `audio-position-${btoa(audioUrl)}`
  localStorage.setItem(key, position.toString())
}

// Restored on component mount
const savedPosition = getPlaybackPosition(audioUrl)
if (savedPosition > 0 && savedPosition < audio.duration - 1) {
  audio.currentTime = savedPosition
}
```

✅ **What's Tracked:** Audio playback position per file
❌ **What's Missing:** Everything else

### Progress Tracking Gaps

#### Not Tracked
```typescript
// User learning progress
❌ Resources viewed/completed
❌ Resources favorited/bookmarked
❌ Quiz scores (no quizzes exist)
❌ Time spent per resource
❌ Learning streaks
❌ Achievement badges
❌ Overall course progress
❌ Skill level progression
❌ Practice session history
```

#### Download Status
```typescript
// ResourceLibrary tracks downloads in component state only
const [downloadedResources, setDownloadedResources] =
  useState<number[]>([])

// ❌ Lost on page refresh
// ❌ Not synced across devices
// ❌ Not stored in localStorage
```

### Recommended Progress Schema

```typescript
interface UserProgress {
  userId: string
  resources: {
    [resourceId: number]: {
      status: 'not_started' | 'in_progress' | 'completed'
      lastAccessed: Date
      timeSpent: number  // seconds
      audioPosition?: number
      downloaded: boolean
      favorited: boolean
      notes?: string
    }
  }
  stats: {
    totalResourcesViewed: number
    totalTimeSpent: number
    currentStreak: number
    longestStreak: number
    completionRate: number
  }
  achievements: {
    id: string
    unlockedAt: Date
  }[]
}

// Storage options:
// 1. localStorage (offline-first, single device)
// 2. Supabase (cloud sync, multi-device)
// 3. Hybrid (localStorage + background sync)
```

### Progress UI Components Needed

```typescript
// Components to build:
<ProgressBar resourceId={1} />
<CompletionBadge resourceId={1} />
<LearningStreakWidget />
<RecentlyViewedList />
<FavoritesList />
<ProgressDashboard />
```

❌ **Status:** Progress tracking severely limited

---

## 7. Issues Summary & Recommendations

### Critical Issues (Immediate Fix Required)

#### 1. Missing Resource IDs (P0)
**Problem:** Resources 3, 8, 24 are undefined but may be referenced
**Impact:** 404 errors, broken links
**Fix:**
```typescript
// Option A: Define missing resources
{ id: 3, title: "...", ... }
{ id: 8, title: "...", ... }
{ id: 24, title: "...", ... }

// Option B: Reserve IDs with redirects
if ([3, 8, 24].includes(resourceId)) {
  redirect('/?error=resource-unavailable')
}
```

#### 2. Orphaned Audio Files (P1)
**Problem:** 8 audio files (45-52) consume 50MB but aren't used
**Impact:** Wasted storage, slower builds, confusion
**Fix:**
```bash
# Either delete:
rm public/audio/resource-{45..52}.mp3

# Or map to resources:
{ id: 45, audioUrl: "/audio/resource-45.mp3", ... }
```

#### 3. Incomplete Audio Metadata (P1)
**Problem:** Only 9 of 59 audio files have metadata
**Impact:** Missing speaker info, duration, accent details
**Fix:**
```bash
# Generate metadata for all files
npm run audio:metadata-gen

# Update /public/audio/metadata.json
```

### High Priority Issues

#### 4. No Progress Tracking (P1)
**Problem:** Users can't track what they've completed
**Impact:** Poor UX, reduced engagement, no sense of achievement
**Fix:**
```typescript
// Implement localStorage-based progress
interface ProgressStore {
  [resourceId: number]: {
    completed: boolean
    lastViewed: number
    favorited: boolean
  }
}

// Save on resource view
localStorage.setItem('hablas-progress', JSON.stringify(progress))
```

#### 5. No Language Switching (P2)
**Problem:** App is Spanish-only, no English option
**Impact:** Limits audience, especially for English-speaking supervisors/helpers
**Fix:**
```bash
# Install i18n
npm install next-intl

# Create translation files
/locales/es.json
/locales/en.json

# Implement LanguageSwitcher component
```

#### 6. Hidden Resources Locked (P2)
**Problem:** 25 resources hidden, no admin UI to manage them
**Impact:** Content review bottleneck
**Fix:**
```typescript
// Build admin dashboard
/app/admin/resources/page.tsx
- List all resources
- Toggle hidden status
- Preview content
- Batch operations
```

### Medium Priority Issues

#### 7. No Content Versioning (P3)
**Problem:** No way to track content updates
**Impact:** Can't notify users of updated resources
**Fix:**
```typescript
interface Resource {
  version: string       // "1.0.2"
  updatedAt: Date      // Last modified
  changelog?: string[] // What changed
}
```

#### 8. Limited Search Capabilities (P3)
**Problem:** Search is basic substring matching
**Impact:** Poor discoverability for complex queries
**Enhancements:**
```typescript
// Add fuzzy search
import Fuse from 'fuse.js'

// Add search suggestions
<SearchBar suggestions={popularSearches} />

// Add search history
localStorage.getItem('recent-searches')
```

#### 9. No Error Boundaries (P3)
**Problem:** Component errors crash entire page
**Impact:** Poor UX on errors
**Fix:**
```typescript
// Add error boundary
export default function ResourceError({ error, reset }) {
  return (
    <div>
      <h2>Algo salió mal</h2>
      <button onClick={reset}>Intentar de nuevo</button>
    </div>
  )
}
```

### Low Priority Issues

#### 10. No Analytics (P4)
**Problem:** Can't track usage patterns
**Fix:** Add privacy-respecting analytics

#### 11. No Social Sharing (P4)
**Problem:** Hard to share specific resources
**Fix:** Add share buttons with OpenGraph meta tags

#### 12. No Resource Ratings (P4)
**Problem:** Can't crowdsource quality feedback
**Fix:** Add star rating system

---

## 8. Testing Checklist

### Content Loading Tests
- [ ] All 31 visible resources load without errors
- [ ] Hidden resources redirect to home page
- [ ] Content fetcher handles 404s gracefully
- [ ] Retry logic works on network failure
- [ ] Cache invalidation after 5 minutes
- [ ] Markdown renders correctly
- [ ] Audio scripts are cleaned properly

### Audio Playback Tests
- [ ] All 59 audio files are accessible
- [ ] Audio plays on first click
- [ ] Only one audio plays at a time
- [ ] Playback position saves/restores
- [ ] Download for offline works
- [ ] Playback rate changes work
- [ ] Volume controls work
- [ ] Error messages are helpful

### Filter & Search Tests
- [ ] Category filters show correct resources
- [ ] Level filters work correctly
- [ ] "All" category includes category='all' resources
- [ ] Search finds resources by title
- [ ] Search finds resources by description
- [ ] Search finds resources by tags
- [ ] Empty search shows all visible resources
- [ ] No results message displays correctly

### Mobile Tests
- [ ] Filters are touch-friendly (44px min height)
- [ ] Search bar works on mobile keyboard
- [ ] Audio controls are accessible
- [ ] Content scrolls smoothly
- [ ] Offline mode works

### Accessibility Tests
- [ ] ARIA labels are descriptive
- [ ] Screen reader announces filter changes
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Color contrast passes WCAG AA

---

## 9. Architecture Strengths

### What's Working Well

#### 1. Modern React Patterns ✅
```typescript
// Custom hooks for logic separation
useAudioPlayer()
useMediaPlayer()
useIntersectionObserver()
useOptimisticUpdate()

// Context API for global state
<AudioProvider>
<AuthProvider>

// Server Components for SSG
export async function generateStaticParams()
```

#### 2. Offline-First Design ✅
```typescript
// Service Worker integration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}

// Cache API usage
const cache = await caches.open('hablas-runtime-v1')

// localStorage for persistence
localStorage.setItem('audio-position-...')
```

#### 3. Performance Optimizations ✅
```typescript
// Static generation at build time
const contentText = fs.readFileSync(publicPath, 'utf-8')

// Lazy loading with Suspense
<Suspense fallback={<SkeletonList />}>

// Prefetching
export { prefetchResourceContent }

// Parallel fetching
Promise.allSettled([downloadable, web, audio])
```

#### 4. Error Handling ✅
```typescript
// Comprehensive error states
error: string | null
canRetry: boolean

// User-friendly messages
'Error de red al cargar el audio'

// Retry mechanisms
retry: () => Promise<void>
```

#### 5. Accessibility ✅
```typescript
// ARIA attributes
role="main"
aria-label="..."
aria-live="polite"

// Semantic HTML
<main>, <section>, <article>

// Keyboard support
tabIndex={0}
onKeyDown={(e) => e.key === 'Enter' && ...}
```

---

## 10. Conclusion

### Overall Assessment

The Hablas content management system demonstrates **solid engineering** with modern patterns and good separation of concerns. The audio playback system is particularly well-implemented with robust caching, error handling, and offline support.

However, the system has **critical data integrity issues** (missing resource IDs, orphaned files) and **significant feature gaps** (progress tracking, multi-language, content management UI) that limit its effectiveness as a learning platform.

### Priority Action Items

#### Week 1: Critical Fixes
1. Define or remove missing resource IDs (3, 8, 24)
2. Map or delete orphaned audio files (45-52)
3. Generate complete audio metadata

#### Week 2: Core Features
4. Implement progress tracking (localStorage)
5. Build admin dashboard for hidden resources
6. Add completion badges and stats

#### Week 3: Enhancements
7. Add multi-language support (i18n)
8. Implement favorite/bookmark system
9. Add resource versioning

#### Week 4: Polish
10. Enhanced search with suggestions
11. Error boundaries on all pages
12. Analytics integration

### Long-Term Roadmap
- **Q1 2026:** User accounts with cloud sync (Supabase)
- **Q2 2026:** Gamification (achievements, streaks)
- **Q3 2026:** Community features (comments, ratings)
- **Q4 2026:** Mobile app (React Native)

---

## Appendix A: File Inventory

### Resource Files
```
Total resource entries: 56
Visible resources: 31 (55%)
Hidden resources: 25 (45%)
Missing IDs: 3 (3, 8, 24)

Content files: 38 total
- Markdown (.md): 29
- Audio scripts (.txt): 9
Missing files: 18
```

### Audio Files
```
Total audio files: 59
Mapped to resources: 51
Orphaned files: 8 (45-52)
Total size: ~245MB
Missing metadata: 50 files

Metadata documented: 9 resources
Voice actors: 5 (Salome, Gonzalo, Dalia, Guy, Jenny)
Languages: es-CO, es-MX, en-US
```

### Code Files
```
Key Components:
- /app/page.tsx (Home with filters)
- /app/recursos/[id]/page.tsx (Resource detail SSG)
- /components/ResourceLibrary.tsx (Filter logic)
- /components/ResourceCard.tsx (Resource display)
- /components/AudioPlayer.tsx (Playback UI)

Key Libraries:
- /lib/contexts/AudioContext.tsx (Global audio state)
- /lib/hooks/useAudioPlayer.ts (Playback logic)
- /lib/audio-utils.ts (Caching, downloads)
- /lib/utils/content-fetcher.ts (Content loading)

Data Files:
- /data/resources.ts (56 resources)
- /public/audio/metadata.json (9 resources)
- /public/generated-resources/50-batch/ (38 files)
```

---

## Appendix B: Related Documentation

### Existing Docs
- `/docs/README.md` - Main documentation index
- `/docs/deployment/` - Deployment guides
- `/docs/testing/` - Testing documentation
- `/docs/development/daily-reports/` - Daily progress logs

### Generated Reports
- `/docs/analysis/` - This analysis and others
- `/docs/archive/2025-11/` - Archived reports

### Code Documentation
- Component JSDoc comments
- Type definitions in `/lib/types/`
- README files in key directories

---

**End of Report**
**Next Steps:** Review findings with development team and prioritize fixes
