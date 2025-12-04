# Enhanced Audio Player - Usage Guide

## Overview

The enhanced AudioPlayer component provides advanced controls optimized for language learning on budget Android devices with offline support.

## Features

### 1. Advanced Playback Controls
- **Play/Pause**: Large, thumb-friendly button (min 44px touch target)
- **Playback Speed**: 0.5x, 0.75x, 1x, 1.25x, 1.5x for practice
- **Loop Toggle**: Repeat audio for pronunciation practice
- **Skip Controls**: Skip forward/backward 10 seconds
- **Progress Bar**: Seek to any position in audio

### 2. Volume Management
- **Volume Slider**: Fine-grained control (0-100%)
- **Mute Toggle**: Quick mute/unmute button
- **Visual Indicators**: Icons change based on volume level

### 3. Offline Support
- **Download Button**: Cache audio for offline use
- **Preloading**: Background preloading for current resource
- **Service Worker Caching**: Automatic caching of played audio
- **Cache Status**: Visual indicator when audio is cached

### 4. Mobile Optimization
- **Touch-Friendly**: All buttons min 44px (Apple/Android guidelines)
- **Responsive Design**: Adapts to screen size
- **Network Resilience**: Handles 3G/4G interruptions
- **Error Recovery**: Graceful fallback on network errors

### 5. Position Persistence
- **Auto-Save**: Saves playback position every 2 seconds
- **Auto-Restore**: Resumes from last position on reload
- **Auto-Clear**: Clears position when audio completes

## Usage Examples

### Basic Usage (Simple Player)

```tsx
import AudioPlayer from '@/components/AudioPlayer';

function ResourceCard() {
  return (
    <AudioPlayer
      audioUrl="/audio/lesson-1.mp3"
      label="Play lesson 1 audio"
    />
  );
}
```

### Enhanced Player (Full Controls)

```tsx
import AudioPlayer from '@/components/AudioPlayer';

function ResourceDetailPage() {
  return (
    <AudioPlayer
      audioUrl="/audio/lesson-1.mp3"
      title="Saludos Básicos"
      enhanced={true}
      resourceId={1}
      metadata={{
        duration: "2:30",
        narrator: "María García",
        accent: "Colombiano"
      }}
    />
  );
}
```

### With Autoplay

```tsx
<AudioPlayer
  audioUrl="/audio/lesson-1.mp3"
  title="Greetings"
  enhanced={true}
  autoplay={true}
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `audioUrl` | `string` | - | URL to audio file (mp3, wav, ogg) |
| `label` | `string` | "Reproducir audio" | ARIA label for accessibility |
| `className` | `string` | "" | Additional CSS classes |
| `autoplay` | `boolean` | `false` | Auto-play on load |
| `title` | `string` | - | Audio title (for enhanced mode) |
| `metadata` | `AudioMetadata` | - | Audio metadata (duration, narrator, etc.) |
| `resourceId` | `number` | - | Resource ID for preloading |
| `enhanced` | `boolean` | `false` | Show full controls UI |

## Audio Utilities

### Preload Audio

```typescript
import { preloadAudio } from '@/lib/audio-utils';

// Preload in background
await preloadAudio('/audio/lesson-1.mp3', {
  priority: 'high',
  resourceId: 1
});
```

### Check Cache Status

```typescript
import { isAudioCached } from '@/lib/audio-utils';

const status = await isAudioCached('/audio/lesson-1.mp3');
console.log(status.isCached); // true/false
console.log(status.isPreloading); // true/false
```

### Download for Offline

```typescript
import { downloadAudio } from '@/lib/audio-utils';

const result = await downloadAudio(
  '/audio/lesson-1.mp3',
  'lesson-1-greetings.mp3'
);

if (result.success) {
  console.log('Downloaded successfully!');
}
```

### Position Management

```typescript
import {
  savePlaybackPosition,
  getPlaybackPosition,
  clearPlaybackPosition
} from '@/lib/audio-utils';

// Save position
savePlaybackPosition('/audio/lesson-1.mp3', 45.5);

// Get saved position
const position = getPlaybackPosition('/audio/lesson-1.mp3');

// Clear position
clearPlaybackPosition('/audio/lesson-1.mp3');
```

### Clear Audio Cache

```typescript
import { clearAudioCache, getCachedAudioSize } from '@/lib/audio-utils';

// Check cache size
const size = await getCachedAudioSize();
console.log(`Cache: ${(size / 1024 / 1024).toFixed(2)} MB`);

// Clear cache
await clearAudioCache();
```

## Service Worker Integration

The Service Worker automatically:
- Caches audio files on first play
- Uses cache-first strategy for offline support
- Handles network failures gracefully
- Separates audio cache from other assets

### Manual Cache Control

```typescript
// Cache specific audio files
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.postMessage({
    type: 'CACHE_URLS',
    urls: ['/audio/lesson-1.mp3', '/audio/lesson-2.mp3']
  });
}

// Clear audio cache
navigator.serviceWorker.controller.postMessage({
  type: 'CLEAR_AUDIO_CACHE'
});
```

## Mobile Optimization Tips

### 1. Lazy Load Audio
Only load audio when user navigates to resource detail page

```tsx
// Preload on hover or focus
<div
  onMouseEnter={() => preloadAudio(audioUrl)}
  onFocus={() => preloadAudio(audioUrl)}
>
  <AudioPlayer audioUrl={audioUrl} />
</div>
```

### 2. Batch Downloads
Download multiple lessons for offline study sessions

```typescript
const lessons = ['/audio/lesson-1.mp3', '/audio/lesson-2.mp3'];

await Promise.all(
  lessons.map(url => downloadAudio(url))
);
```

### 3. Network-Aware Preloading
Only preload on WiFi to save data

```typescript
if ('connection' in navigator) {
  const connection = (navigator as any).connection;

  if (connection.effectiveType === '4g' || connection.type === 'wifi') {
    await preloadAudio(audioUrl);
  }
}
```

## Accessibility Features

- **ARIA Labels**: All controls have descriptive labels
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Announces playback state changes
- **Focus Indicators**: Clear focus rings on all controls
- **Touch Targets**: Minimum 44px for easy tapping

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers with Service Worker support

## Performance

- **Optimized for 3G/4G**: Graceful degradation on slow networks
- **Lazy Loading**: Audio only loads when needed
- **Memory Efficient**: Blobs cleaned up after use
- **Battery Friendly**: Pauses on background/sleep

## Known Limitations

1. **iOS Safari**: Autoplay requires user interaction
2. **Cache Size**: Browser may limit cache to ~50MB
3. **Offline Mode**: Requires prior visit while online
4. **Position Persistence**: Uses localStorage (5MB limit)

## Troubleshooting

### Audio Won't Play
- Check file format (MP3 recommended)
- Verify file path is correct
- Check browser console for errors
- Test on different network (WiFi vs mobile data)

### Download Fails
- Verify sufficient storage space
- Check browser permissions
- Try clearing cache and retry
- Ensure Service Worker is active

### Position Not Saving
- Check localStorage is not full
- Verify browser allows localStorage
- Check private/incognito mode restrictions

## Future Enhancements

- [ ] Variable speed with pitch correction
- [ ] A-B loop for phrase practice
- [ ] Waveform visualization
- [ ] Automatic quality adjustment based on network
- [ ] Background audio playback
- [ ] Playlist support
