# Vercel Blob Storage - Quick Reference Card

## Configuration

```bash
# .env.local
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_YOUR_TOKEN_HERE
```

## API Endpoints

### Upload Audio
```
POST /api/audio/upload
Auth: Admin required
Body: multipart/form-data with 'file' field
Max Size: 10MB
Formats: MP3, WAV, OGG, WebM, AAC, M4A
```

### Get Audio
```
GET /api/audio/[id]
Auth: Optional (rate limited)
Returns: { success, url, contentType, size }
```

### Delete Audio
```
DELETE /api/audio/[id]
Auth: Admin required
Returns: { success }
```

## Client-Side Usage

### Upload File
```typescript
import { uploadAudioViaAPI, validateAudioFile } from '@/lib/audio/blob-storage';

// Validate
const validation = validateAudioFile(file);
if (!validation.valid) {
  alert(validation.error);
  return;
}

// Upload
const metadata = await uploadAudioViaAPI(file);
console.log(metadata.url); // https://blob.vercel-storage.com/...
```

### Get Audio URL
```typescript
import { getAudioURL } from '@/lib/audio/blob-storage';

const url = await getAudioURL('1234567890-lesson-1.mp3');
// Use in <audio> element
```

### Delete Audio
```typescript
import { deleteAudioViaAPI } from '@/lib/audio/blob-storage';

await deleteAudioViaAPI('1234567890-lesson-1.mp3');
```

## React Components

### Audio Uploader (Admin)
```tsx
import AudioUploader from '@/components/admin/AudioUploader';

<AudioUploader
  onUploadComplete={(url, pathname) => {
    console.log('Upload complete:', url);
  }}
  onUploadError={(error) => {
    console.error('Upload failed:', error);
  }}
/>
```

### Audio Player
```tsx
import AudioPlayer from '@/components/shared/AudioPlayer';

<AudioPlayer
  audioId="1234567890-lesson-1.mp3"
  title="Lesson 1: Greetings"
  showControls={true}
  autoplay={false}
/>
```

## Server-Side Usage

### Upload from Server
```typescript
import { uploadAudioFile } from '@/lib/audio/blob-storage';

const metadata = await uploadAudioFile(
  fileBuffer,
  'lesson-1.mp3'
);
```

### Get Metadata
```typescript
import { getAudioMetadata } from '@/lib/audio/blob-storage';

const info = await getAudioMetadata('audio/1234567890-lesson-1.mp3');
```

### List Files
```typescript
import { listAudioFiles } from '@/lib/audio/blob-storage';

const { files, cursor, hasMore } = await listAudioFiles({
  limit: 50
});
```

### Delete File
```typescript
import { deleteAudioFile } from '@/lib/audio/blob-storage';

await deleteAudioFile('audio/1234567890-lesson-1.mp3');
```

## Response Format

### Success
```json
{
  "success": true,
  "url": "https://blob.vercel-storage.com/audio/...",
  "pathname": "audio/1234567890-filename.mp3",
  "contentType": "audio/mpeg",
  "size": 1234567
}
```

### Error
```json
{
  "success": false,
  "error": "Invalid file",
  "details": "File size exceeds maximum allowed size of 10MB"
}
```

## Error Codes

| Code | Error | Cause |
|------|-------|-------|
| 400 | Invalid file | Validation failed |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not admin |
| 404 | Not found | File doesn't exist |
| 429 | Rate limited | Too many requests |
| 500 | Server error | Upload/retrieval failed |

## File Constraints

- **Max Size**: 10MB
- **Formats**: MP3, WAV, OGG, WebM, AAC, M4A
- **MIME Types**: audio/mpeg, audio/mp3, audio/wav, audio/ogg, audio/webm, audio/aac, audio/m4a
- **Extensions**: .mp3, .wav, .ogg, .webm, .aac, .m4a

## Setup Steps

1. **Create Blob Store**
   - Go to Vercel Dashboard → Storage
   - Create Blob Storage
   - Copy access token

2. **Configure Environment**
   ```bash
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   ```

3. **Restart Server**
   ```bash
   npm run dev
   ```

4. **Test Upload**
   - Login as admin
   - Use AudioUploader component
   - Upload test file

## Security

- ✅ Admin-only uploads
- ✅ File validation (type, size, extension)
- ✅ Rate limiting
- ✅ Path sanitization
- ✅ Error handling
- ✅ Authentication integration

## Troubleshooting

### "Storage not configured"
→ Add `BLOB_READ_WRITE_TOKEN` to `.env.local`

### "Rate limit exceeded"
→ Wait for rate limit reset or reduce requests

### "Invalid file type"
→ Convert to MP3, WAV, OGG, WebM, AAC, or M4A

### "File too large"
→ Compress audio or increase limit

## Documentation

- Full Setup: `/docs/setup/BLOB_STORAGE_SETUP.md`
- Implementation: `/docs/setup/BLOB_STORAGE_IMPLEMENTATION_SUMMARY.md`
- Vercel Docs: https://vercel.com/docs/storage/vercel-blob
