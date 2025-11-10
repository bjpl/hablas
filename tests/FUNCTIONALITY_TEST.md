# Hablas Platform - Systematic Functionality Test Plan

## Test Environment
- Build Status: npm run build
- Dev Server: npm run dev
- Platform: https://bjpl.github.io/hablas/
- Date: 2025-11-01
- Tester Role: QA Specialist

## Test Scenarios

### 1. RESOURCE BROWSING
- [ ] Homepage loads successfully
- [ ] All 59 resources display
- [ ] Search functionality works
- [ ] Category filter (repartidor/conductor/all) works
- [ ] Level filter (basico/intermedio/avanzado) works
- [ ] Resource cards display correct information (title, description, type icon)

### 2. RESOURCE DETAIL PAGES
- [ ] Click Resource #1 (PDF) - content loads
- [ ] Click Resource #2 (Audio) - content loads, audio player shows
- [ ] Click Resource #3 (Image) - content loads
- [ ] Navigation works (Back button/Previous/Next)
- [ ] Resource metadata displays correctly

### 3. AUDIO FUNCTIONALITY
- [ ] Audio player appears on audio resources
- [ ] Play/Pause button works
- [ ] Progress bar functional
- [ ] Speed control works (if available)
- [ ] Volume control works
- [ ] Download audio button works

### 4. DOWNLOAD FUNCTIONALITY
- [ ] "Descargar Recurso" button downloads file
- [ ] "Descargar Audio" button downloads audio
- [ ] Files download with correct filenames
- [ ] Downloads complete successfully

### 5. CONTENT DISPLAY
- [ ] Bilingual dialogue displays (blue/green boxes)
- [ ] No production markers visible ([Speaker], [Tone], etc.)
- [ ] Table of Contents numbered correctly
- [ ] Collapsible sections function properly
- [ ] Markdown renders correctly

### 6. BUILD & DEPLOYMENT
- [ ] npm run build completes successfully
- [ ] npm run typecheck passes
- [ ] npm test passes (or note failing tests)
- [ ] No console errors during dev
- [ ] No TypeScript errors blocking build

---

## Test Results (To be filled during testing)

