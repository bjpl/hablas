# Vercel Blob Storage Setup Guide

## Overview

This guide covers the complete setup of Vercel Blob Storage for Hablas audio file management. Vercel Blob Storage provides scalable, global CDN-backed storage ideal for audio files with automatic optimization and edge distribution.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Blob Store](#create-blob-store)
3. [Environment Configuration](#environment-configuration)
4. [Audio Upload Workflow](#audio-upload-workflow)
5. [Security Considerations](#security-considerations)
6. [Testing & Verification](#testing--verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Vercel account with active project
- Hablas deployed to Vercel
- Access to Vercel Dashboard
- Local development environment configured

## Create Blob Store

### Step 1: Access Vercel Dashboard

1. Navigate to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Hablas project
3. Click on the **Storage** tab in the project navigation

### Step 2: Create New Blob Store

1. Click **Create Database** or **Create Store**
2. Select **Blob** from the storage options
3. Configure the blob store:
   ```
   Name: hablas-audio-files
   Region: Select closest to your users (e.g., iad1 for US East)
   ```
4. Click **Create**

### Step 3: Note Store Details

After creation, you'll receive:
- `BLOB_READ_WRITE_TOKEN` - Authentication token for uploads/downloads
- Store ID and metadata
- Endpoint URL

## Environment Configuration

### Step 4: Configure Environment Variables

#### Production Environment (Vercel)

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```bash
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx

# Optional: Custom configuration
BLOB_STORE_NAME=hablas-audio-files
BLOB_MAX_FILE_SIZE=10485760  # 10MB in bytes
BLOB_ALLOWED_TYPES=audio/mpeg,audio/wav,audio/ogg
```

3. Set scope to **Production**, **Preview**, and **Development**
4. Click **Save**

#### Local Development (.env.local)

Create or update `.env.local`:

```bash
# Vercel Blob Storage (Development)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_dev_xxxxxxxxxx

# Database
DATABASE_URL=your_local_or_dev_database_url
DIRECT_URL=your_direct_database_connection

# Session
SESSION_SECRET=your_local_session_secret
```

**Note**: Never commit `.env.local` to version control

### Step 5: Update Code Configuration

The application uses `@vercel/blob` package. Verify installation:

```bash
npm install @vercel/blob
```

## Audio Upload Workflow

### Upload Implementation

The Hablas application implements a secure upload workflow:

#### 1. Client-Side Upload Flow

```typescript
// app/api/upload-audio/route.ts
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('audio') as File;

  // Validation
  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!file.type.startsWith('audio/')) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    return Response.json({ error: 'File too large' }, { status: 400 });
  }

  // Upload to Vercel Blob
  const blob = await put(file.name, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return Response.json({ url: blob.url });
}
```

#### 2. Database Storage

After successful upload, store metadata:

```typescript
// Store audio URL in database
await pool.query(
  'INSERT INTO topics (title, description, audio_url) VALUES ($1, $2, $3)',
  [title, description, blob.url]
);
```

#### 3. Client-Side Integration

```typescript
// Frontend upload component
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('audio', file);

  const response = await fetch('/api/upload-audio', {
    method: 'POST',
    body: formData,
  });

  const { url } = await response.json();
  return url;
};
```

### File Organization

Vercel Blob automatically organizes files with:
- Random suffixes for uniqueness
- CDN distribution for global access
- Automatic MIME type detection
- Edge caching for performance

## Security Considerations

### 1. Access Control

```typescript
// Implement authentication checks
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Proceed with upload
}
```

### 2. File Validation

Always validate:

```typescript
const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function validateAudioFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Allowed: MP3, WAV, OGG, WebM' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File too large. Maximum size: 10MB' };
  }

  return { valid: true };
}
```

### 3. Rate Limiting

Implement upload rate limits:

```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 uploads per hour
});

export async function POST(request: Request) {
  const session = await auth();
  const { success } = await ratelimit.limit(session.user.id);

  if (!success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Proceed with upload
}
```

### 4. Token Security

- Never expose `BLOB_READ_WRITE_TOKEN` in client-side code
- Use server-side API routes for all upload operations
- Rotate tokens periodically
- Use read-only tokens for public access if needed

### 5. Content Security Policy

Update `next.config.mjs`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; media-src 'self' https://*.public.blob.vercel-storage.com;"
          }
        ]
      }
    ];
  }
};
```

## Testing & Verification

### Local Testing

1. Start development server:
```bash
npm run dev
```

2. Test upload endpoint:
```bash
curl -X POST http://localhost:3000/api/upload-audio \
  -F "audio=@test-audio.mp3" \
  -H "Cookie: session-token=your_session_token"
```

3. Verify response contains blob URL

### Production Testing

1. Deploy to Vercel:
```bash
vercel --prod
```

2. Test upload through UI
3. Verify file accessible via returned URL
4. Check Vercel Dashboard → Storage → Blob for uploaded files

### Verification Checklist

- [ ] Environment variables configured in Vercel
- [ ] Local `.env.local` configured
- [ ] Upload API route returns valid blob URL
- [ ] Uploaded files accessible via CDN
- [ ] Database stores blob URL correctly
- [ ] Audio playback works in browser
- [ ] File validation working (type, size)
- [ ] Authentication required for uploads
- [ ] Rate limiting active

## Troubleshooting

### Common Issues

#### 1. Upload Fails with "Unauthorized"

**Cause**: Missing or invalid `BLOB_READ_WRITE_TOKEN`

**Solution**:
```bash
# Verify token in Vercel Dashboard
# Settings → Environment Variables → BLOB_READ_WRITE_TOKEN

# Redeploy after updating
vercel --prod
```

#### 2. File Not Accessible After Upload

**Cause**: Access set to 'private' instead of 'public'

**Solution**:
```typescript
// Update upload code
const blob = await put(file.name, file, {
  access: 'public', // Ensure public access
  addRandomSuffix: true,
});
```

#### 3. CORS Errors

**Cause**: Missing CORS headers

**Solution**:
```typescript
// Add CORS headers to API route
export async function POST(request: Request) {
  const response = await uploadHandler(request);

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');

  return response;
}
```

#### 4. Large File Upload Timeout

**Cause**: Default timeout too short

**Solution**:
```typescript
// vercel.json
{
  "functions": {
    "app/api/upload-audio/route.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 5. Token Not Found in Environment

**Cause**: Environment variables not loaded

**Solution**:
```bash
# Verify environment variables
vercel env ls

# Pull latest environment variables
vercel env pull .env.local
```

## Best Practices

1. **File Naming**: Use `addRandomSuffix: true` to prevent conflicts
2. **Cleanup**: Implement periodic cleanup of unused files
3. **Monitoring**: Track upload success/failure rates
4. **Backup**: Consider backing up critical audio files
5. **Optimization**: Use appropriate audio formats (MP3 for compatibility, OGG for size)

## Additional Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [@vercel/blob Package](https://www.npmjs.com/package/@vercel/blob)
- [Vercel Storage Pricing](https://vercel.com/docs/storage/vercel-blob/usage-and-pricing)
- [Audio File Best Practices](https://web.dev/audio-best-practices/)

## Support

For issues specific to Vercel Blob Storage:
- [Vercel Support](https://vercel.com/support)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

For Hablas-specific issues:
- Check application logs in Vercel Dashboard
- Review deployment logs
- Contact development team
