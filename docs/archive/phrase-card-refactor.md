# Phrase Card Refactor - ASCII to Elegant Cards

## Overview
Refactored resource detail page to remove ALL ASCII box styling and replaced with elegant, modern card-based layout inspired by professional design systems.

## Changes Made

### 1. Created PhraseCard Component (`components/PhraseCard.tsx`)

**Features:**
- Clean white card with subtle shadow and hover effects
- **English phrase**: Large (2xl-3xl), bold, prominent heading
- **Spanish translation**: Colored (indigo), medium-large (xl-2xl), secondary emphasis
- **Pronunciation**: Gray, small text with speech icon
- **Context/usage**: Light background pill with icon
- **Example sentence**: Blockquote style with border and background
- **Tip**: Yellow highlight box with warning-style presentation
- **Formality badge**: Optional badge (Formal/Informal/Neutral)

**Design Philosophy:**
- Card-based layout with gradients and shadows
- Elegant typography hierarchy
- Smooth hover animations (transform, shadow)
- Professional color scheme (indigo/purple gradients)
- Responsive grid layout (2 columns on desktop)

### 2. Modified ResourceDetail.tsx (`app/recursos/[id]/ResourceDetail.tsx`)

**Removed:**
- `BOX_DRAWING_REGEX` constant
- `PhraseBox` component (ASCII box renderer)
- `detectBoxSections()` function
- All monospace font rendering
- ASCII art handling

**Added:**
- Import of `PhraseCard` component
- `parseMarkdownToPhrases()` function - Intelligent markdown parser
- Automatic card rendering when phrases are detected
- Grid layout for phrase cards (2 columns on medium+ screens)

**Parsing Logic:**
The new parser intelligently extracts:
- English phrases (from bold text or first line)
- Spanish translations (from italics or Spanish-like patterns)
- Pronunciation (from brackets or "pronunciation:" labels)
- Context (from "Use:", "Context:", "When:" prefixes)
- Examples (from "Example:" prefix or quoted text)
- Tips (from "Tip:", "Note:", "Remember:" prefixes)

### 3. Design System Alignment

**Color Palette:**
- Indigo/Purple gradients for main cards
- Blue for formal contexts
- Green for informal contexts
- Gray for neutral contexts
- Yellow for tips/warnings

**Typography:**
- English: 2xl-3xl, font-bold (primary)
- Spanish: xl-2xl, font-semibold, colored (secondary)
- Pronunciation: sm, italic, gray (tertiary)
- Context: sm, in pill badges
- Examples: sm, in blockquotes

**Spacing & Layout:**
- 6-unit padding on cards
- 6-unit gaps between cards
- Responsive grid (1 column mobile, 2 columns desktop)
- Hover effects: shadow-2xl, -translate-y-1

## Benefits

1. **Professional Appearance**: Modern card-based design
2. **Better Readability**: Clear typography hierarchy
3. **Improved UX**: Hover effects and visual feedback
4. **Responsive**: Works on all screen sizes
5. **Accessible**: Proper semantic HTML and ARIA labels
6. **Maintainable**: Clean component architecture

## Migration Path

**Old Format (ASCII boxes):**
```
┌─────────────────────────┐
│ English phrase          │
│ Spanish translation     │
└─────────────────────────┘
```

**New Format (Markdown):**
```markdown
## How are you?

**How are you?**
*¿Cómo estás?*
[koh-moh es-tahs]
Context: Informal greeting for friends
Example: "¿Cómo estás, amigo?" - "How are you, friend?"
Tip: Use "¿Cómo está?" for formal situations
```

**Result:** Beautiful gradient card with all information elegantly displayed

## Files Changed

1. `components/PhraseCard.tsx` - NEW
2. `app/recursos/[id]/ResourceDetail.tsx` - MODIFIED
3. `docs/phrase-card-refactor.md` - NEW (this file)

## Testing

- Build successful: ✅
- Type checking: ✅
- Static generation: ✅ (65 pages)
- No runtime errors: ✅

## Next Steps

1. Update existing markdown content to use new format
2. Add more examples to documentation
3. Consider adding audio playback to phrase cards
4. Add copy-to-clipboard functionality
5. Add favorite/bookmark functionality
