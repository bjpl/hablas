# Vercel Blob Storage Setup Guide

This guide explains how to set up Vercel Blob Storage for audio file management in the Hablas application.

## Overview

The application uses Vercel Blob Storage to store and serve audio files for lessons and exercises. This provides:

- Scalable cloud storage for audio files
- Global CDN delivery for fast audio streaming
- Simple API for upload/download operations
- Built-in security and access control

## Features

- **Audio Upload**: Admin-only endpoint for uploading audio files
- **Audio Download/Streaming**: Public endpoint for accessing audio files
- **File Validation**: Automatic validation of file type, size, and format
- **Rate Limiting**: Protection against abuse with configurable rate limits
- **Authentication**: Integration with existing auth middleware
- **Error Handling**: Comprehensive error handling and logging

## Setup Instructions

### 1. Create Vercel Blob Store

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database** or **Create Store**
4. Select **Blob Storage**
5. Choose your preferred region (select closest to your users)
6. Click **Create**

### 2. Get Access Token

1. After creating the blob store, you'll see the store dashboard
2. Click on the **Settings** tab
3. Under **Access Tokens**, click **Create Token**
4. Select **Read and Write** permissions
5. Copy the token (it will look like `vercel_blob_rw_...`)

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Vercel Blob Storage Token
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_YOUR_TOKEN_HERE
```

For production deployment on Vercel:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add `BLOB_READ_WRITE_TOKEN` with your token value
4. Select the appropriate environments (Production, Preview, Development)

### 4. Verify Installation

Check that the package is installed:

```bash
npm list @vercel/blob
```

If not installed, run:

```bash
npm install @vercel/blob
```

## API Endpoints

### Upload Audio File

**Endpoint**: `POST /api/audio/upload`

**Authentication**: Admin role required

**Request**:
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field

**Constraints**:
- Maximum file size: 10MB
- Allowed formats: MP3, WAV, OGG, WebM, AAC, M4A
- Admin authentication required

**Example** (using fetch):

```javascript
const formData = new FormData();
formData.append('file', audioFile);

const response = await fetch('/api/audio/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include', // Include auth cookies
});

const result = await response.json();
// result.url - Public URL for the uploaded file
// result.pathname - Blob storage pathname
```

**Response** (Success):
```json
{
  "success": true,
  "url": "https://blob.vercel-storage.com/audio/...",
  "pathname": "audio/1234567890-filename.mp3",
  "contentType": "audio/mpeg",
  "size": 1234567
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "Invalid file",
  "details": "File size exceeds maximum allowed size of 10MB"
}
```

### Get Audio File

**Endpoint**: `GET /api/audio/[id]`

**Authentication**: Optional (public endpoint with rate limiting)

**Parameters**:
- `id`: Audio file ID (filename from pathname)

**Example**:

```javascript
const response = await fetch('/api/audio/1234567890-lesson-1.mp3');
const result = await response.json();
// result.url - Public URL for streaming
```

**Response**:
```json
{
  "success": true,
  "url": "https://blob.vercel-storage.com/audio/...",
  "contentType": "audio/mpeg",
  "size": 1234567
}
```

### Delete Audio File

**Endpoint**: `DELETE /api/audio/[id]`

**Authentication**: Admin role required

**Parameters**:
- `id`: Audio file ID (filename from pathname)

**Example**:

```javascript
const response = await fetch('/api/audio/1234567890-lesson-1.mp3', {
  method: 'DELETE',
  credentials: 'include',
});

const result = await response.json();
```

## Client-Side Utilities

The application provides helper functions in `lib/audio/blob-storage.ts`:

### Upload Audio (Client-Side)

```typescript
import { uploadAudioViaAPI, validateAudioFile } from '@/lib/audio/blob-storage';

// Validate before upload
const validation = validateAudioFile(file);
if (!validation.valid) {
  console.error(validation.error);
  return;
}

// Upload
try {
  const metadata = await uploadAudioViaAPI(file);
  console.log('Uploaded:', metadata.url);
} catch (error) {
  console.error('Upload failed:', error);
}
```

### Get Audio URL (Client-Side)

```typescript
import { getAudioURL } from '@/lib/audio/blob-storage';

const url = await getAudioURL('1234567890-lesson-1.mp3');
// Use URL in <audio> element
```

### Delete Audio (Client-Side)

```typescript
import { deleteAudioViaAPI } from '@/lib/audio/blob-storage';

await deleteAudioViaAPI('1234567890-lesson-1.mp3');
```

## Server-Side Utilities

For server-side operations (API routes, server components):

```typescript
import {
  uploadAudioFile,
  deleteAudioFile,
  getAudioMetadata,
  listAudioFiles
} from '@/lib/audio/blob-storage';

// Upload from server
const metadata = await uploadAudioFile(fileBuffer, 'lesson-1.mp3');

// Get metadata
const info = await getAudioMetadata('audio/1234567890-lesson-1.mp3');

// List all audio files
const { files, cursor, hasMore } = await listAudioFiles({ limit: 50 });

// Delete file
await deleteAudioFile('audio/1234567890-lesson-1.mp3');
```

## Security Features

### Authentication & Authorization

- Upload endpoint requires admin authentication
- Delete endpoint requires admin authentication
- Download endpoint is public but rate-limited
- Uses existing auth middleware (`requireRole`, `checkAuth`)

### File Validation

- Maximum file size: 10MB
- Allowed MIME types: `audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/ogg`, `audio/webm`, `audio/aac`, `audio/m4a`
- Filename sanitization to prevent path traversal
- Extension validation

### Rate Limiting

- Integrated with application's rate limiter
- Per-user limits for authenticated requests
- Per-IP limits for anonymous requests
- Configurable via `SECURITY_CONFIG.RATE_LIMIT`

### Error Handling

- Comprehensive error messages
- Proper HTTP status codes
- Detailed logging for debugging
- Rate limit headers in responses

## File Organization

Audio files are stored with the following structure:

```
audio/
  ├── 1234567890-lesson-1.mp3
  ├── 1234567891-exercise-1.mp3
  └── 1234567892-dialogue-1.mp3
```

Format: `audio/{timestamp}-{sanitized-filename}`

## Rate Limit Headers

All API responses include rate limit information:

```
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-11-17T20:30:00.000Z
```

## Error Codes

| Status Code | Error | Description |
|------------|-------|-------------|
| 400 | Invalid file | File validation failed |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Audio not found | File doesn't exist |
| 413 | Payload too large | File exceeds 10MB |
| 429 | Rate limit exceeded | Too many requests |
| 500 | Upload/Retrieval failed | Server error |

## Testing

### Test Upload Endpoint

```bash
# Using curl (requires authentication cookie)
curl -X POST http://localhost:3000/api/audio/upload \
  -F "file=@test-audio.mp3" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

### Test Download Endpoint

```bash
# Using curl
curl http://localhost:3000/api/audio/1234567890-test.mp3
```

### Test Delete Endpoint

```bash
# Using curl (requires authentication cookie)
curl -X DELETE http://localhost:3000/api/audio/1234567890-test.mp3 \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] Vercel Blob Store created
- [ ] `BLOB_READ_WRITE_TOKEN` configured in Vercel project settings
- [ ] Environment variable added to all environments (Production, Preview)
- [ ] Rate limiting configured appropriately for production traffic
- [ ] File size limits verified
- [ ] CDN caching configured (automatic with Vercel Blob)

### Monitoring

Monitor blob storage usage in Vercel Dashboard:

1. Storage tab → Your blob store
2. View metrics: storage used, bandwidth, requests
3. Set up alerts for quota limits
4. Review access logs for security

### Best Practices

1. **Organize Files**: Use consistent naming conventions
2. **Clean Up**: Regularly delete unused audio files
3. **Monitor Usage**: Keep track of storage and bandwidth
4. **Backup**: Consider backing up critical audio files
5. **CDN**: Leverage Vercel's global CDN for fast delivery
6. **Compression**: Use compressed audio formats (MP3, AAC) to save space

## Troubleshooting

### "Storage not configured" Error

**Cause**: `BLOB_READ_WRITE_TOKEN` not set

**Solution**: Add token to environment variables and restart server

### "Rate limit exceeded" Error

**Cause**: Too many requests in short period

**Solution**: Wait for rate limit reset time or increase limits in config

### "Invalid file type" Error

**Cause**: File type not in allowed list

**Solution**: Convert audio to supported format (MP3, WAV, OGG, etc.)

### "File size exceeds maximum" Error

**Cause**: File larger than 10MB

**Solution**: Compress audio file or increase limit in code

### Upload Fails Silently

**Cause**: Network error or CORS issue

**Solution**: Check browser console, verify CORS settings

## Support

For issues or questions:

1. Check Vercel Blob documentation: https://vercel.com/docs/storage/vercel-blob
2. Review application logs for detailed error messages
3. Check Vercel Dashboard for storage metrics and errors
4. Verify environment variables are correctly set

## Additional Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Blob SDK Reference](https://vercel.com/docs/storage/vercel-blob/using-blob-sdk)
- [Rate Limiting Guide](/docs/setup/RATE_LIMITING.md)
- [Authentication Guide](/docs/setup/AUTH_SETUP.md)
