# Accessibility Guide for Hablas

## Overview

Hablas is committed to providing an inclusive, accessible English learning platform for all users, including those with disabilities. This guide documents our accessibility features and best practices.

## WCAG 2.1 AA Compliance

Hablas meets WCAG 2.1 Level AA standards across all four principles:

### Perceivable
Users can perceive all information and UI components.

### Operable
Users can operate all interface components and navigation.

### Understandable
Users can understand information and UI operation.

### Robust
Content works with current and future assistive technologies.

## Key Accessibility Features

### 1. Error Boundary Protection
- Graceful error handling prevents full app crashes
- User-friendly error messages in Spanish
- Recovery options: retry, reload, return home
- Development error details for debugging

### 2. Screen Reader Support
- Comprehensive ARIA labels on all interactive elements
- Live regions announce dynamic content changes
- Semantic HTML for proper document structure
- Screen reader-only content for additional context

### 3. Keyboard Navigation
- Full keyboard accessibility (no mouse required)
- Skip-to-content link for quick navigation
- Logical tab order throughout application
- Visible focus indicators on all interactive elements

### 4. Visual Accessibility
- High contrast text (minimum 4.5:1 ratio)
- Clear focus indicators
- Minimum 44x44px touch targets
- Supports browser zoom up to 200%
- Responsive design for all screen sizes

### 5. Motion & Animation
- Respects `prefers-reduced-motion` setting
- Animations disabled for users with motion sensitivity
- Smooth scroll behavior can be disabled

### 6. Language Support
- Primary language: Spanish (es-CO)
- English phrases properly marked with `lang="en"`
- Ensures correct pronunciation by screen readers

## Using Hablas with Assistive Technology

### Screen Readers

**Recommended Screen Readers:**
- NVDA (Windows) - Free
- JAWS (Windows) - Commercial
- VoiceOver (iOS/macOS) - Built-in
- TalkBack (Android) - Built-in

**Navigation Tips:**
- Use heading navigation to jump between sections
- Resource cards are marked as articles
- Filter buttons announce pressed/not pressed state
- Search results count announced automatically

### Keyboard-Only Navigation

**Essential Keyboard Shortcuts:**
- `Tab` - Move to next interactive element
- `Shift + Tab` - Move to previous element
- `Enter` / `Space` - Activate buttons and links
- `Escape` - Close dialogs and modals

**Quick Navigation:**
- First tab press reveals "Skip to content" link
- Press Enter on skip link to jump to main content
- Tab through resource filters
- Use Enter to activate filter buttons

### Mobile Accessibility

**Touch Gestures (iOS VoiceOver):**
- Swipe right - Next element
- Swipe left - Previous element
- Double tap - Activate element
- Two-finger Z - Undo action
- Rotor gesture - Quick navigation settings

**Touch Gestures (Android TalkBack):**
- Swipe right/left - Navigate elements
- Double tap - Activate
- Swipe down then right - Read from top
- Local context menu - Two-finger tap

## Testing Accessibility

### Manual Testing Checklist

**Keyboard Navigation:**
- [ ] Tab through all interactive elements
- [ ] Focus visible on all elements
- [ ] Skip link works correctly
- [ ] No keyboard traps
- [ ] Logical tab order

**Screen Reader:**
- [ ] All images have alt text or are properly hidden
- [ ] Form labels properly associated
- [ ] Headings provide document structure
- [ ] Live regions announce changes
- [ ] Button/link purpose clear from label

**Visual:**
- [ ] Color contrast meets 4.5:1 minimum
- [ ] Text resizes to 200% without breaking
- [ ] Focus indicators clearly visible
- [ ] No information conveyed by color alone

**Mobile:**
- [ ] Touch targets minimum 44x44px
- [ ] Pinch zoom enabled
- [ ] Screen reader gestures work
- [ ] Portrait and landscape modes work

### Automated Testing

**Install Testing Tools:**
```bash
npm install --save-dev @axe-core/react eslint-plugin-jsx-a11y
```

**Run Tests:**
```bash
# Accessibility linting
npm run lint:a11y

# Automated accessibility tests
npm run test:a11y

# Lighthouse audit
lighthouse https://hablas.app --only-categories=accessibility
```

## Accessibility Implementation

### Components

**ErrorBoundary** (`components/ErrorBoundary.tsx`)
- Catches runtime errors
- Provides accessible error UI
- ARIA alerts for error states

**Hero** (`components/Hero.tsx`)
- Statistics with descriptive labels
- Semantic list markup
- Proper heading hierarchy

**ResourceCard** (`components/ResourceCard.tsx`)
- Article semantic markup
- Descriptive link and button labels
- Icon-only buttons with aria-labels
- Decorative emojis hidden from screen readers

**ResourceLibrary** (`components/ResourceLibrary.tsx`)
- Live region for result count
- Proper heading associations
- Complementary tips section

**SearchBar** (`components/SearchBar.tsx`)
- Labeled input field
- Clear button with context
- Live hints for suggestions

**InstallPrompt** (`components/InstallPrompt.tsx`)
- Dialog role with proper labeling
- Focus managed appropriately
- Descriptive button labels

**WhatsAppCTA** (`components/WhatsAppCTA.tsx`)
- Article markup for groups
- Descriptive call-to-action
- Group rules clearly labeled

**OfflineNotice** (`components/OfflineNotice.tsx`)
- Alert role for importance
- Live region for dynamic appearance
- High contrast warning colors

### CSS Utilities

**Screen Reader Only** (`.sr-only`)
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Reduced Motion**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Focus Indicators**
```css
*:focus-visible {
  outline: 2px solid #25D366;
  outline-offset: 2px;
}
```

## Best Practices for Contributors

### Writing Accessible HTML

**DO:**
```jsx
// Descriptive button
<button aria-label="Descargar Saludos Básicos">
  <span aria-hidden="true">📥</span>
</button>

// Semantic structure
<article>
  <h3>Resource Title</h3>
  <p>Description</p>
</article>

// Hidden decorative content
<span aria-hidden="true">🎉</span>
```

**DON'T:**
```jsx
// Generic button
<button>📥</button>

// Non-semantic divs
<div>
  <div>Title</div>
  <div>Description</div>
</div>

// Decorative content read by screen readers
<span>🎉</span>
```

### ARIA Best Practices

**When to Use ARIA:**
- When semantic HTML isn't sufficient
- For dynamic content updates (live regions)
- To enhance existing semantics
- For custom interactive widgets

**ARIA Rules:**
1. Use semantic HTML first
2. Don't change native semantics
3. All interactive ARIA controls must be keyboard accessible
4. Don't use `role="presentation"` or `aria-hidden="true"` on focusable elements
5. All interactive elements must have accessible names

### Testing Workflow

**Before Committing:**
1. Run automated accessibility tests
2. Test keyboard navigation
3. Verify focus indicators visible
4. Check color contrast
5. Test with screen reader

**Code Review Checklist:**
- [ ] Semantic HTML used appropriately
- [ ] ARIA attributes necessary and correct
- [ ] Keyboard navigation works
- [ ] Focus management proper
- [ ] Color contrast sufficient
- [ ] Alt text descriptive

## Reporting Accessibility Issues

### How to Report

If you discover an accessibility issue:

1. **Check Existing Issues:** Search for similar reports
2. **Describe the Problem:** What's not accessible?
3. **Specify Context:**
   - Browser and version
   - Assistive technology used
   - Operating system
   - Steps to reproduce
4. **Suggest Solution:** If possible

### Issue Template

```markdown
## Accessibility Issue

**Component:** [Component name]
**Issue Type:** [Keyboard, Screen Reader, Visual, etc.]
**WCAG Criterion:** [e.g., 1.4.3 Contrast]

**Description:**
[Describe the accessibility barrier]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Issue occurs]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What currently happens]

**Environment:**
- Browser: [e.g., Chrome 120]
- Screen Reader: [e.g., NVDA 2023.3]
- OS: [e.g., Windows 11]

**Suggested Fix:**
[If you have a solution]
```

## Resources

### Standards & Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Articles](https://webaim.org/articles/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Chrome DevTools
- [Pa11y](https://pa11y.org/) - Automated testing

### Screen Readers
- [NVDA](https://www.nvaccess.org/) - Free, Windows
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) - Windows
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) - Built-in, iOS/macOS
- [TalkBack](https://support.google.com/accessibility/android/answer/6283677) - Built-in, Android

### Learning Resources
- [WebAIM Training](https://webaim.org/training/)
- [Deque University](https://dequeuniversity.com/)
- [A11y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Commitment

Hablas is committed to maintaining and improving accessibility. We:

- Follow WCAG 2.1 AA standards
- Test with assistive technologies
- Include accessibility in design process
- Welcome feedback from users with disabilities
- Continuously audit and improve
- Train team members on accessibility

## Contact

For accessibility questions or concerns:
- **GitHub Issues:** Report accessibility bugs
- **Email:** accessibility@hablas.app (if available)
- **Community:** Join our WhatsApp groups for support

---

**Last Updated:** 2025-10-17
**WCAG Level:** AA
**Standard:** WCAG 2.1
