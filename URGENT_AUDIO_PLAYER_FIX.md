# URGENT: Audio Player Not Loading - Diagnosis & Fix

## Problem

Audio player stuck showing "Cargando audio..." on live site (https://bjpl.github.io/hablas/recursos/9)

## Root Cause Analysis

### What We Know ✅
1. ✅ Audio files exist on server (curl shows 200 OK, 3.7 MB)
2. ✅ AudioUrl fields in resources.ts (59/59)
3. ✅ Audio element in HTML: `<audio src="/hablas/audio/resource-9.mp3">`
4. ✅ AudioPlayer component code is correct
5. ✅ Build successful, deployed to GitHub Pages

### What's Wrong ❌
The `loadedmetadata` and `canplay` events aren't firing, so `setIsLoading(false)` never gets called.

## Likely Causes

### 1. Missing Error Event Listener ⚠️
**Issue**: No `addEventListener('error')` in useEffect (line 115-119)
**Result**: If audio fails to load, error handler won't fire and component stays in loading state
**Fix**: Add error event listener

### 2. CORS or Security Policy 🔒
**Issue**: GitHub Pages may have strict CORS or CSP
**Result**: Audio element can't load cross-origin or is blocked
**Fix**: Check response headers, may need CORS configuration

### 3. Event Listener Timing ⏱️
**Issue**: Events added after audio already loaded
**Result**: Events never fire because they already happened
**Fix**: Check audio.readyState before adding listeners

## Immediate Fix

Add error event listener and better initialization in AudioPlayer.tsx:

```typescript
// Around line 115, ADD:
audio.addEventListener('error', handleError);

// Around line 110-113, REPLACE handleCanPlay with:
const handleCanPlay = () => {
  console.log('Audio can play:', audioUrl); // Debug log
  setIsLoading(false);
  setError(null);
};

// Around line 90-100, ADD readyState check:
const handleLoadedMetadata = () => {
  console.log('Metadata loaded:', {
    duration: audio.duration,
    readyState: audio.readyState,
    url: audioUrl
  });
  setDuration(audio.duration);
  setIsLoading(false);
  setError(null);
};

// After event listeners (line 119), ADD:
// Check if audio already loaded (in case events already fired)
if (audio.readyState >= 1) {
  console.log('Audio already has metadata, readyState:', audio.readyState);
  handleLoadedMetadata();
}

// In cleanup (line 126-128), ADD:
audio.removeEventListener('error', handleError);
```

## Testing Plan

After fix:
1. Build locally
2. Test on localhost
3. Check browser console for debug logs
4. Deploy to GitHub Pages
5. Verify audio player shows controls (not "Cargando")

## Alternative Quick Fix

If the above doesn't work, add a timeout failsafe:

```typescript
// After setting isLoading(true) on line 71, ADD:
// Failsafe: if audio doesn't load in 5 seconds, show error
const loadTimeout = setTimeout(() => {
  if (isLoading) {
    console.warn('Audio load timeout after 5s');
    setIsLoading(false);
    setError('Audio tardó demasiado en cargar. Intenta de nuevo.');
  }
}, 5000);

// In cleanup, clear timeout:
clearTimeout(loadTimeout);
```

## Priority

**CRITICAL** - Blocks all audio functionality on live site

## Time to Fix

15-30 minutes (add event listener + test + deploy)

---

**Next Step**: Implement the missing error event listener fix in AudioPlayer.tsx
