# Audio Download Fix Summary

## Issue Identified
The audio files were not downloading correctly on the hablas.co site due to incorrect URL path configurations leftover from when the site was hosted on GitHub Pages.

## Root Cause
The site was previously hosted at `https://bjpl.github.io/hablas/` which required a `/hablas` base path prefix for all resources. After migrating to the custom domain `hablas.co`, these path prefixes were causing the audio URLs to be incorrectly constructed as `/hablas/audio/...` instead of `/audio/...`.

## Files Fixed

### 1. **ResourceDetail.tsx** (`app/recursos/[id]/ResourceDetail.tsx`)
- Removed the conditional `basePath` logic that was adding `/hablas` in production
- Changed from: `const basePath = process.env.NODE_ENV === 'production' ? '/hablas' : ''`
- Changed to: `const basePath = ''`
- Updated metadata fetch URL from `${basePath}/audio/metadata.json` to `/audio/metadata.json`

### 2. **Service Worker** (`public/sw.js`)
- Updated cache names to v3 to force cache refresh
- Removed `/hablas/` prefix from all precache URLs
- Updated offline fallback path from `/hablas/index.html` to `/index.html`
- Removed special handling for `/hablas/` URLs in fetch event

### 3. **Manifest** (`public/manifest.json`)
- Updated `start_url` from `/hablas/` to `/`
- Updated icon paths from `/hablas/icon-*.png` to `/icon-*.png`

### 4. **Layout** (`app/layout.tsx`)
- Updated manifest path from `/hablas/manifest.json` to `/manifest.json`
- Updated OpenGraph URL from `https://bjpl.github.io/hablas/` to `https://hablas.co/`
- Updated apple-touch-icon path from `/hablas/icon-192.png` to `/icon-192.png`

### 5. **Service Worker Registration** (`lib/utils/serviceWorkerRegistration.ts`)
- Updated service worker URL from `/hablas/sw/service-worker.js` to `/sw.js`

### 6. **Main Page** (`app/page.tsx`)
- Updated service worker registration from `/hablas/sw.js` with scope `/hablas/` to just `/sw.js`

### 7. **Cleanup**
- Deleted old service worker directory at `public/sw/` which contained outdated configuration

## Testing Required

After deploying these changes, please test:

1. **Clear browser cache and service worker**:
   - Open DevTools → Application → Storage → Clear site data
   - Or in Chrome: Settings → Privacy → Clear browsing data

2. **Test audio playback**:
   - Navigate to any resource with audio (e.g., resource ID 1-34)
   - Click the play button to ensure audio loads and plays correctly

3. **Test audio download**:
   - Click the "Descargar" button in the audio player
   - Verify the audio file downloads successfully
   - Check that the downloaded file plays correctly

4. **Test offline functionality**:
   - Let some audio files cache
   - Go offline (DevTools → Network → Offline)
   - Verify cached audio still plays

5. **Test across browsers**:
   - Chrome/Edge
   - Firefox
   - Safari (if available)
   - Mobile browsers

## Deployment Steps

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to your hosting service (the site should be configured for hablas.co)

3. The service worker cache version has been incremented, so users will automatically get the updated version

## Expected Result

After these fixes, all audio files should:
- Play correctly when the play button is clicked
- Download successfully when the download button is clicked
- Have correct URLs without the `/hablas/` prefix
- Work properly with the custom domain hablas.co

## Notes

- The audio files themselves are correctly placed in `/public/audio/` directory
- The resource data in `data/resources.ts` already had the correct paths
- The issue was purely in the client-side URL construction
- Service worker cache has been versioned to ensure users get the updates