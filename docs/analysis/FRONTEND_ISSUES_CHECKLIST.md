# Frontend Issues Checklist

Quick reference for all identified issues and their status.

---

## CRITICAL (Fix Immediately)

### TypeScript Errors
- [ ] Fix `createMockRequest` missing import in auth tests
- [ ] Fix `addToBlacklist` missing import in admin tests
- [ ] Fix type mismatch in ResourceCard test (string vs number)
- [ ] Fix read-only `NODE_ENV` assignments in ErrorBoundary tests
- [ ] Install or remove `pdfjs-dist` dependency
- [ ] Fix type mismatches in TripleComparisonView tests (15+ errors)
- [ ] Create proper test mock utilities

### Core Features Missing
- [ ] Implement Practice page (`/practica`)
  - [ ] Phrase playback interface
  - [ ] Recording functionality
  - [ ] Repetition exercises
  - [ ] Progress tracking
- [ ] Implement Profile page (`/perfil`)
  - [ ] Progress dashboard
  - [ ] Downloaded resources list
  - [ ] Statistics
  - [ ] Achievements
- [ ] Complete Community page (`/comunidad`)
  - [ ] Add actual WhatsApp group links
  - [ ] User discussions
  - [ ] Shared resources

### Component Issues
- [ ] Consolidate or document AudioPlayer components
  - [ ] `/components/AudioPlayer.tsx`
  - [ ] `/components/shared/AudioPlayer.tsx`
- [ ] Add error boundaries
  - [ ] ResourceLibrary
  - [ ] AudioPlayer
  - [ ] Search/Filter components
- [ ] Simplify audio URL resolution logic

---

## MAJOR (Should Fix Soon)

### Code Quality
- [ ] Refactor ResourceDetail.tsx (573 lines → split into smaller components)
  - [ ] Extract AudioSection
  - [ ] Extract DownloadControls
  - [ ] Extract Navigation
- [ ] Add JSDoc comments to all exported components
- [ ] Establish consistent code patterns
- [ ] Document complex hooks

### State Management
- [ ] Implement global state (Zustand/Jotai)
- [ ] Persist downloaded resources
- [ ] Persist search filters
- [ ] Persist audio playback positions
- [ ] Track offline resources

### Performance
- [ ] Add pagination to resources (12 per page)
- [ ] Throttle audio time updates (currently every frame)
- [ ] Debounce search input (300ms)
- [ ] Lazy load resource images
- [ ] Optimize re-renders in AudioPlayer

### Search & Discovery
- [ ] Add search result count
- [ ] Add "clear search" button
- [ ] Show suggested searches
- [ ] Add search history
- [ ] Improve search algorithm (fuzzy matching)

---

## MINOR (Nice to Have)

### UI/UX
- [ ] Remove artificial loading delay (300ms) in ResourceLibrary
- [ ] Add breadcrumbs to resource detail pages
- [ ] Stronger focus indicators
- [ ] Add dark mode support
- [ ] Fix color contrast on some tags
- [ ] Add haptic feedback on mobile (if available)

### Audio Player
- [ ] Make keyboard shortcuts more discoverable
- [ ] Add high contrast mode support
- [ ] Add playback speed presets
- [ ] Add audio visualization

### Resource Display
- [ ] Add syntax highlighting for code blocks
- [ ] Add toggle for Spanish-only/English-only view
- [ ] Improve bilingual content visual distinction
- [ ] Add resource preview on hover

### Offline Features
- [ ] Implement actual offline caching
- [ ] Create download manager UI
- [ ] Track offline resource usage
- [ ] Add offline sync status

### Progress Tracking
- [ ] Track completed resources
- [ ] Track audio completion percentage
- [ ] Track time spent learning
- [ ] Show overall progress
- [ ] Add study streaks
- [ ] Create achievement system

---

## DOCUMENTATION

- [ ] Add component usage examples
- [ ] Document AudioPlayer usage patterns
- [ ] Create development setup guide
- [ ] Add contribution guidelines
- [ ] Update README with current feature status
- [ ] Document state management patterns

---

## TESTING

- [ ] Fix all TypeScript errors in tests
- [ ] Create test utilities module
- [ ] Add tests for Practice page (when implemented)
- [ ] Add tests for Profile page (when implemented)
- [ ] Add integration tests for audio playback
- [ ] Test offline functionality
- [ ] Add accessibility tests

---

## ACCESSIBILITY

### Good (Keep)
- [x] Keyboard navigation
- [x] ARIA labels
- [x] Skip to content link
- [x] Semantic HTML
- [x] Focus management
- [x] Screen reader friendly

### Needs Work
- [ ] Improve focus indicators
- [ ] Add dark mode
- [ ] Fix color contrast issues
- [ ] Add more keyboard shortcuts
- [ ] Test with screen readers

---

## SECURITY

### Current Status (Good)
- [x] No sensitive data in client
- [x] Audio URLs validated
- [x] No XSS vulnerabilities
- [x] React-markdown used safely

### Maintain
- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Input sanitization

---

## ARCHITECTURE

- [ ] Consider moving resources.ts to database (1063 lines)
- [ ] Evaluate state management architecture
- [ ] Plan for scaling (100+ resources)
- [ ] Design API layer for future backend
- [ ] Plan offline-first architecture

---

## Priority Matrix

```
High Impact, Low Effort:
✅ Fix TypeScript errors
✅ Add error boundaries
✅ Remove artificial loading delay
✅ Add search result count

High Impact, High Effort:
🔥 Implement Practice page
🔥 Implement Profile page
🔥 Add global state management
🔥 Implement pagination

Low Impact, Low Effort:
💡 Add clear search button
💡 Improve focus indicators
💡 Add breadcrumbs
💡 Document code

Low Impact, High Effort:
📅 Implement full offline caching
📅 Add dark mode
📅 Complete Community features
```

---

**Last Updated**: November 27, 2025
**Total Items**: 85+
**Completed**: 0
**In Progress**: 0
**Blocked**: 0
