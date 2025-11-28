# UI & Formatting Issues - Detailed Analysis
**Date:** November 10, 2025
**Focus:** Website rendering, responsive design, and visual presentation
**Status:** COMPLETE

---

## 1. Resource Page Rendering Issues

### 1.1 Table Rendering - MEDIUM PRIORITY

**Issue:** Markdown tables render without visible borders

**Location:**
- `app/recursos/[id]/ResourceDetail.tsx` lines 471-478
- Affects all resources with comparison tables

**Current Implementation:**
```tsx
table: ({ children }) => (
  <div className="overflow-x-auto mb-4">
    <table className="min-w-full divide-y divide-gray-200">
      {children}
    </table>
  </div>
)
```

**Problem:**
- `divide-y` creates horizontal dividers but no cell borders
- Makes data difficult to scan visually
- Appears incomplete/broken to users

**Recommended Fix:**
```tsx
table: ({ children }) => (
  <div className="overflow-x-auto mb-4">
    <table className="min-w-full border-collapse border border-gray-300">
      {children}
    </table>
  </div>
),
thead: ({ children }) => (
  <thead className="bg-gray-50">
    {children}
  </thead>
),
th: ({ children }) => (
  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
    {children}
  </th>
),
td: ({ children }) => (
  <td className="border border-gray-300 px-4 py-2">
    {children}
  </td>
)
```

**Impact:**
- Affects ~15 resources with tables
- Readability significantly improved
- Professional appearance restored

**Testing Required:**
- [ ] Test on desktop (1920px, 1366px)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px, 414px)
- [ ] Verify scrollable tables work with borders

---

### 1.2 Pronunciation Guides - HIGH PRIORITY

**Issue:** Pronunciation text too small on mobile devices

**Location:**
- `components/resource-renderers/PhraseList.tsx` line 25
- `components/resource-renderers/VocabularyCard.tsx` line 11

**Current Implementation:**
```tsx
// PhraseList.tsx
<p className="text-sm text-gray-600 italic">{phrase.pronunciation}</p>

// VocabularyCard.tsx
<p className="text-sm text-gray-600 italic mb-2">{item.pronunciation}</p>
```

**Problem:**
- `text-sm` = 14px on most screens, 12px on some mobile
- Pronunciation is CRITICAL learning content (not secondary)
- Users squint to read on mobile
- Inconsistent with importance of content

**Recommended Fix:**
```tsx
// PhraseList.tsx
<p className="text-base text-gray-600 italic leading-relaxed">
  {phrase.pronunciation}
</p>

// VocabularyCard.tsx
<p className="text-base text-gray-600 italic mb-2 leading-relaxed">
  {item.pronunciation}
</p>
```

**Impact:**
- Affects ALL resources (56 total)
- Improves core learning experience
- Better readability for primary audience
- May require layout adjustments

**Testing Required:**
- [ ] Verify doesn't break card layout on mobile
- [ ] Check spacing between elements
- [ ] Test with longest pronunciation strings
- [ ] Validate on actual iOS/Android devices

---

### 1.3 Code Blocks - MEDIUM PRIORITY

**Issue:** Audio script code blocks lack syntax highlighting

**Location:**
- `app/recursos/[id]/ResourceDetail.tsx` lines 458-462

**Current Implementation:**
```tsx
code: ({ children }) => (
  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
    {children}
  </code>
)
```

**Problem:**
- Audio scripts show as plain monospace text
- Hard to distinguish EN: vs SP: segments quickly
- Reduces scannability for users reviewing scripts

**Recommended Fix (Option A - Simple):**
```tsx
code: ({ children }) => {
  const text = String(children);
  const isLanguageTag = text.startsWith('EN:') || text.startsWith('SP:');

  return (
    <code className={`
      ${isLanguageTag ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}
      px-2 py-1 rounded text-sm font-mono
    `}>
      {children}
    </code>
  );
}
```

**Recommended Fix (Option B - Full Highlighting):**
```tsx
// Install: npm install react-syntax-highlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

code: ({ children, className }) => {
  const match = /language-(\w+)/.exec(className || '');
  return match ? (
    <SyntaxHighlighter
      style={tomorrow}
      language={match[1]}
      PreTag="div"
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
      {children}
    </code>
  );
}
```

**Impact:**
- Affects 8 audio script resources
- Significantly improves script readability
- More professional appearance
- Option B adds ~50KB to bundle size

---

### 1.4 Long Titles - MEDIUM PRIORITY

**Issue:** Resource titles overflow or truncate poorly on mobile

**Location:**
- `app/recursos/[id]/ResourceDetail.tsx` line 143

**Current Implementation:**
```tsx
<h1 className="text-xl font-bold line-clamp-1 text-gray-900">
  {resource.title}
</h1>
```

**Problem:**
- Titles like "Frases Esenciales para Entregas - Var 1" (48 chars) get cut to "Frases Esenciales para..."
- Users can't see full resource name
- `line-clamp-1` too aggressive for mobile

**Affected Resources (60+ characters):**
1. "Professional Communication Essentials" (41 chars) ✅ OK
2. "Airport Rideshare - Essential Procedures and Communication" (59 chars) ⚠️ CUTS
3. "Platform Ratings System - Mastery Guide" (40 chars) ✅ OK
4. "Medical Emergencies - Critical Communication" (44 chars) ✅ OK
5. "Vehicle Accident Procedures" (27 chars) ✅ OK
6. "Cross-Cultural Professional Communication" (41 chars) ✅ OK
7. "Earnings Optimization Communication" (35 chars) ✅ OK
8. "Professional Boundaries and Self-Protection" (43 chars) ✅ OK

**Actually only 1 resource affected:** Airport Rideshare

**Recommended Fix:**
```tsx
<h1 className="text-xl font-bold line-clamp-2 text-gray-900 leading-tight">
  {resource.title}
</h1>
```

**Impact:**
- Affects 1 resource significantly, prevents future issues
- Shows up to 2 lines of title
- Better UX for understanding content

---

### 1.5 Cultural Notes Spacing - LOW PRIORITY

**Issue:** Inconsistent padding/spacing in CulturalNote component

**Location:**
- `components/resource-renderers/CulturalNote.tsx` lines 15-24

**Current Implementation:**
```tsx
<div className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
  <h3 className="text-xl font-bold text-gray-900 mb-1">
    {note.title}
  </h3>
  <div className="text-sm text-gray-600 mb-2">
    {importanceLabels[note.importance]}
    {note.region && ` • ${note.region}`}
  </div>
  <p className="text-gray-700 leading-relaxed">{note.content}</p>
</div>
```

**Problem:**
- `mb-1` between title and metadata feels cramped
- `mb-2` between metadata and content too tight
- On mobile (<640px), padding could be reduced

**Recommended Fix:**
```tsx
<div className="mb-6 p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
  <h3 className="text-xl font-bold text-gray-900 mb-2">
    {note.title}
  </h3>
  <div className="text-sm text-gray-600 mb-3">
    {importanceLabels[note.importance]}
    {note.region && ` • ${note.region}`}
  </div>
  <p className="text-gray-700 leading-relaxed">{note.content}</p>
</div>
```

**Impact:**
- Affects ~30 cultural notes across resources
- Minor improvement in breathing room
- More professional appearance

---

## 2. Mobile Responsiveness Issues

### 2.1 Table Overflow - HIGH PRIORITY

**Issue:** Tables overflow viewport on narrow screens

**Problem:**
- Tables wider than 375px push content offscreen
- No visual indication that table is scrollable
- Users miss important content

**Current Implementation:**
```tsx
table: ({ children }) => (
  <div className="overflow-x-auto mb-4">
    <table className="min-w-full divide-y divide-gray-200">
      {children}
    </table>
  </div>
)
```

**What Works:**
- ✅ `overflow-x-auto` allows scrolling
- ✅ `min-w-full` ensures table doesn't shrink

**What's Missing:**
- ❌ No shadow/fade indicator for scrollable content
- ❌ No touch-friendly scroll indicators

**Recommended Fix:**
```tsx
table: ({ children }) => (
  <div className="relative mb-4">
    <div className="overflow-x-auto shadow-inner-sides">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        {children}
      </table>
    </div>
    <style jsx>{`
      .shadow-inner-sides {
        background:
          linear-gradient(90deg, white 30%, rgba(255,255,255,0)),
          linear-gradient(90deg, rgba(255,255,255,0), white 70%);
        background-size: 40px 100%;
        background-position: 0 0, 100% 0;
        background-repeat: no-repeat;
      }
      .shadow-inner-sides::before,
      .shadow-inner-sides::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        width: 20px;
        pointer-events: none;
      }
      .shadow-inner-sides::before {
        left: 0;
        background: linear-gradient(90deg, rgba(0,0,0,0.1), transparent);
      }
      .shadow-inner-sides::after {
        right: 0;
        background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1));
      }
    `}</style>
  </div>
)
```

**Impact:**
- Affects 10 resources with tables
- Much better mobile UX
- Users understand content is scrollable

---

### 2.2 Navigation Button Stacking - LOW PRIORITY

**Issue:** Previous/Next buttons stack awkwardly on very small screens

**Location:**
- `app/recursos/[id]/ResourceDetail.tsx` lines 498-515

**Current Implementation:**
```tsx
<div className="flex gap-3 w-full sm:w-auto">
  {resourceId > 1 && (
    <button className="flex-1 sm:flex-none px-6 py-3...">
      ← Anterior
    </button>
  )}
  {resourceId < resources.length && (
    <button className="flex-1 sm:flex-none px-6 py-3...">
      Siguiente →
    </button>
  )}
</div>
```

**Problem:**
- On 320px screens, buttons become cramped
- Text wraps inside buttons
- Not visually appealing

**Recommended Fix:**
```tsx
<div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
  {resourceId > 1 && (
    <button className="w-full xs:w-auto px-6 py-3 bg-accent-blue text-white rounded font-semibold hover:bg-blue-700 transition-colors">
      ← Anterior
    </button>
  )}
  {resourceId < resources.length && (
    <button className="w-full xs:w-auto px-6 py-3 bg-accent-blue text-white rounded font-semibold hover:bg-blue-700 transition-colors">
      Siguiente →
    </button>
  )}
</div>
```

**Note:** Requires adding `xs` breakpoint to Tailwind config:
```js
// tailwind.config.js
theme: {
  extend: {
    screens: {
      'xs': '400px',
    }
  }
}
```

---

### 2.3 Download Buttons - MEDIUM PRIORITY

**Issue:** Download buttons lack progress indicators

**Location:**
- `app/recursos/[id]/ResourceDetail.tsx` lines 207-318

**Current Implementation:**
```tsx
{downloadingResource ? (
  <>
    <svg className="animate-spin h-5 w-5">...</svg>
    Descargando...
  </>
) : (
  <>
    <svg className="w-5 h-5">...</svg>
    <span>Descargar Recurso</span>
    <span className="text-xs opacity-80">({resource.size})</span>
  </>
)}
```

**What Works:**
- ✅ Shows loading spinner
- ✅ Disables button during download
- ✅ Shows file size

**What's Missing:**
- ❌ No progress percentage
- ❌ No cancel option
- ❌ No download speed/time estimate

**Recommended Enhancement:**
```tsx
const [downloadProgress, setDownloadProgress] = useState(0);

// In download handler:
const xhr = new XMLHttpRequest();
xhr.open('GET', resourceUrl, true);
xhr.responseType = 'blob';

xhr.onprogress = (event) => {
  if (event.lengthComputable) {
    const percentComplete = (event.loaded / event.total) * 100;
    setDownloadProgress(Math.round(percentComplete));
  }
};

// UI:
{downloadingResource ? (
  <>
    <svg className="animate-spin h-5 w-5">...</svg>
    <span>Descargando... {downloadProgress}%</span>
  </>
) : (
  // Normal state
)}
```

---

## 3. Accessibility Issues

### 3.1 Missing Skip Links - MEDIUM PRIORITY

**Issue:** No "Skip to main content" link for keyboard users

**Location:**
- `app/layout.tsx` or `app/recursos/[id]/page.tsx`

**Impact:**
- Keyboard users must tab through entire header on every page
- WCAG 2.1 Level A requirement (2.4.1 Bypass Blocks)

**Recommended Fix:**
```tsx
// Add to top of page
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-blue focus:text-white focus:rounded"
>
  Saltar al contenido principal
</a>

// Add id to main content:
<main id="main-content" className="min-h-screen bg-gray-50">
```

---

### 3.2 Focus Indicators - MEDIUM PRIORITY

**Issue:** Some interactive elements lack visible focus indicators

**Problem:**
- Default browser outlines disabled in some places
- Keyboard navigation unclear

**Recommended Fix:**
```css
/* Add to globals.css */
*:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  border-radius: 2px;
}

button:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
```

---

## 4. Component-Specific Issues

### 4.1 PracticalScenario Component

**Location:** `components/resource-renderers/PracticalScenario.tsx`

**Minor Issues:**
1. Tips section could have better visual hierarchy
2. Phrase pronunciation could be larger (same issue as 1.2)

**Recommended Enhancements:**
```tsx
<div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 shadow-sm">
  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
    💡 <span>Consejos prácticos</span>
  </h4>
  <ul className="space-y-2 text-sm text-gray-700">
    {scenario.tips.map((tip, index) => (
      <li key={index} className="flex gap-2">
        <span className="text-yellow-600 font-bold">•</span>
        <span>{tip}</span>
      </li>
    ))}
  </ul>
</div>
```

---

## Priority Summary

### Immediate (This Week):
1. ✅ Fix table borders (1 hour)
2. ✅ Increase pronunciation text size (30 min)
3. ✅ Add table scroll indicators for mobile (1 hour)

### Short-term (Next 2 Weeks):
4. ⭐ Add skip links (1 hour)
5. ⭐ Fix focus indicators (30 min)
6. ⭐ Fix title truncation (30 min)
7. ⭐ Add download progress indicators (2 hours)

### Medium-term (Month 1):
8. 🔵 Add syntax highlighting to code blocks (2 hours)
9. 🔵 Improve cultural notes spacing (30 min)
10. 🔵 Fix navigation button stacking (1 hour)

---

## Testing Checklist

### Desktop Testing (Chrome, Firefox, Safari):
- [ ] Tables render with visible borders
- [ ] Tables are scrollable when needed
- [ ] Pronunciation text is readable
- [ ] All interactive elements have focus indicators
- [ ] Download buttons show progress
- [ ] Long titles display properly

### Tablet Testing (iPad, Android tablet):
- [ ] Layout adapts correctly (768px, 1024px)
- [ ] Touch targets are ≥44x44px
- [ ] Tables scroll smoothly
- [ ] Navigation works intuitively

### Mobile Testing (iPhone, Android):
- [ ] Layout works on small screens (375px, 414px)
- [ ] Text is readable without zooming
- [ ] Tables indicate scrollability
- [ ] Buttons don't overlap or wrap awkwardly
- [ ] Download experience is smooth

### Accessibility Testing:
- [ ] Keyboard navigation works completely
- [ ] Skip links function correctly
- [ ] Focus indicators are visible
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA (4.5:1)

---

**Report Status:** ✅ COMPLETE
**Next Action:** Begin implementing Priority 1 fixes
**Estimated Fix Time:** 3-5 hours for all high-priority issues
