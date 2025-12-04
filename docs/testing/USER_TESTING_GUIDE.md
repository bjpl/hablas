# Hablas.co User Testing Guide

**Last Updated:** November 29, 2024
**Production URL:** https://hablas.co

---

## Quick Links

| Area | URL | Description |
|------|-----|-------------|
| Homepage | [hablas.co](https://hablas.co) | Main landing page |
| Resources | [hablas.co/recursos/1](https://hablas.co/recursos/1) | Resource detail pages |
| Admin Login | [hablas.co/admin/login](https://hablas.co/admin/login) | Admin authentication |
| Admin Dashboard | [hablas.co/admin](https://hablas.co/admin) | Content management |
| Topic Management | [hablas.co/admin/topics](https://hablas.co/admin/topics) | Topic editor |
| Content Editor | [hablas.co/admin/edit/1](https://hablas.co/admin/edit/1) | Triple comparison view |

---

## 1. Public User Flows

### 1.1 Homepage & Navigation

**URL:** [https://hablas.co](https://hablas.co)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Hero Section Display | Load homepage | Hero text displays without clipping on letters like "g", "j", "y" |
| CTA Buttons | Click "Explorar Recursos" | Navigates to resources section |
| Mobile Menu | Open hamburger menu on mobile | Menu opens smoothly, all links visible |
| Topic Navigation | Click topic cards | Navigates to filtered resource list |

### 1.2 Resource Detail Pages

**URL Pattern:** [https://hablas.co/recursos/{id}](https://hablas.co/recursos/1)

**Test Resources:**
- [Resource 1](https://hablas.co/recursos/1)
- [Resource 2](https://hablas.co/recursos/2)
- [Resource 4](https://hablas.co/recursos/4)
- [Resource 5](https://hablas.co/recursos/5)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| PDF Download | Click download button | PDF downloads with proper formatting |
| Audio Playback | Click play on audio player | Audio plays without 500 errors |
| Playback Controls | Test play/pause, seek, speed | All controls function correctly |
| Mobile Layout | View on mobile device | Content readable, controls accessible |

### 1.3 Audio Player Testing

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Audio Load | Navigate to resource with audio | Audio loads without console errors |
| Play/Pause | Click play button | Audio plays, button toggles to pause |
| Speed Control | Change playback speed (0.75x, 1x, 1.25x, 1.5x) | Speed changes appropriately |
| Volume Toggle | Click mute/unmute | Audio mutes and unmutes |
| Seek Bar | Click on progress bar | Audio seeks to clicked position |

---

## 2. Authentication Flows

### 2.1 Admin Login

**URL:** [https://hablas.co/admin/login](https://hablas.co/admin/login)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Valid Login | Enter valid credentials, submit | Redirects to admin dashboard |
| Invalid Login | Enter wrong password | Error message displays |
| Session Persistence | Login, close browser, reopen | Session maintained (httpOnly cookie) |
| Logout | Click logout button | Redirects to login, session cleared |

### 2.2 Cookie Security Verification

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Cookie Flags | Check DevTools > Application > Cookies | `httpOnly: true`, `secure: true`, `sameSite: strict` |
| Cookie Name | Inspect auth cookie | Named `auth_token` or similar |
| Expiration | Check cookie expiration | Reasonable expiration (7 days default) |

---

## 3. Admin Dashboard Flows

### 3.1 Content List

**URL:** [https://hablas.co/admin](https://hablas.co/admin)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Resource List | Load admin dashboard | All resources displayed with status |
| Search/Filter | Use search or filter controls | Results filter correctly |
| Edit Navigation | Click edit button on resource | Opens content editor |

### 3.2 Topic Management

**URL:** [https://hablas.co/admin/topics](https://hablas.co/admin/topics)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Topic List | Load topics page | All topics displayed |
| Topic Navigation | Click on a topic | Topic details/edit view opens |
| Save Changes | Make changes, save | Changes persist after reload |

---

## 4. Triple Comparison View (Content Editor)

### 4.1 Access

**URL Pattern:** [https://hablas.co/admin/edit/{id}](https://hablas.co/admin/edit/1)

**Test Editors:**
- [Edit Resource 1](https://hablas.co/admin/edit/1)
- [Edit Resource 2](https://hablas.co/admin/edit/2)
- [Edit Resource 4](https://hablas.co/admin/edit/4)

### 4.2 Panel Testing

| Panel | Test | Expected Result |
|-------|------|-----------------|
| **PDF Preview** | Load editor | Real PDF renders with zoom controls |
| **PDF Preview** | Zoom in/out | PDF zooms smoothly |
| **PDF Preview** | Page navigation | Pages change correctly |
| **PDF Preview** | Download button | PDF downloads to device |
| **Web Content** | Toggle view modes | Source/Preview/Split modes work |
| **Web Content** | Edit content | Changes reflect in preview |
| **Web Content** | Save changes | Content persists after reload |
| **Audio Transcript** | Play audio | Audio plays with sync highlighting |
| **Audio Transcript** | Edit transcript | Can modify transcript text |
| **Audio Transcript** | Save transcript | Changes persist |

### 4.3 Comparison Features

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Panel Selection | Check 2 panel checkboxes | Diff viewer appears below |
| Diff Display | Compare PDF vs Web | Side-by-side diff shows |
| Sync Controls | Use sync buttons | Content syncs between panels |
| Save All | Click "Save All Changes" | All modified content saves |

---

## 5. Mobile Testing Checklist

**Test on:** iOS Safari, Android Chrome

| Area | Test | Expected Result |
|------|------|-----------------|
| Homepage | Tap navigation | Touch targets 44x44px minimum |
| Resources | Scroll content | Smooth scrolling, no jank |
| Audio Player | Use controls | Controls accessible without zoom |
| Admin | Login on mobile | Form usable, keyboard doesn't obscure |
| Editor | Edit content | Can edit and save on mobile |

---

## 6. Performance Checklist

| Metric | Target | How to Test |
|--------|--------|-------------|
| LCP | < 2.5s | Lighthouse or PageSpeed Insights |
| FID | < 100ms | Lighthouse or PageSpeed Insights |
| CLS | < 0.1 | Lighthouse or PageSpeed Insights |
| Audio Load | < 3s | Network tab in DevTools |
| PDF Render | < 2s | Visual observation |

---

## 7. Error Scenarios

| Scenario | How to Test | Expected Behavior |
|----------|-------------|-------------------|
| Missing Audio | Visit resource with no audio file | Graceful fallback, no 500 error |
| Invalid Resource ID | Visit [/recursos/9999](https://hablas.co/recursos/9999) | 404 page displays |
| Session Expired | Wait for session timeout | Redirect to login with message |
| Network Error | Disable network during save | Error message, retry option |

---

## 8. Known Issues & Fixes Applied

| Issue | Status | Commit |
|-------|--------|--------|
| Audio 500 errors in production | Fixed | `4ab9785f` |
| Typography G/J clipping | Fixed | Previous session |
| PDF downloads | Fixed | `f91201c4` |
| Duplicate download buttons | Fixed | Previous session |
| Triple comparison redesign | Fixed | `26987ce0` |

---

## 9. Bug Report Template

```markdown
**URL:** [paste URL]
**Browser/Device:** [e.g., Chrome 120 / iPhone 15]
**Steps to Reproduce:**
1.
2.
3.

**Expected:**

**Actual:**

**Screenshot/Video:** [attach if possible]
```

---

## 10. Contact

For technical issues, create an issue in the GitHub repository or contact the development team.
