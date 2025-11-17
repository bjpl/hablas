# Vercel Blob Storage Setup Guide

## Overview

This guide covers the complete setup of Vercel Blob Storage for Hablas audio file management. Vercel Blob Storage provides scalable, global CDN-backed storage ideal for audio files with automatic optimization and edge distribution.

**Implementation Status**: Audio upload/download API and components are already implemented in:
- `/app/api/audio/upload/route.ts` - Upload endpoint with admin auth and rate limiting
- `/app/api/audio/download/route.ts` - Download/fetch endpoint
- `/components/admin/AudioUploader.tsx` - Admin upload interface
- `/components/shared/AudioPlayer.tsx` - Public playback component
- `/lib/audio/blob-storage.ts` - Helper utilities

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Blob Store](#create-blob-store)
3. [Environment Configuration](#environment-configuration)
4. [Audio Upload Workflow](#audio-upload-workflow)
5. [Security Considerations](#security-considerations)
6. [Testing & Verification](#testing--verification)
7. [Pricing and Limits](#pricing-and-limits)
8. [Best Practices](#best-practices)
9. [Maintenance and Cleanup](#maintenance-and-cleanup)
10. [Troubleshooting](#troubleshooting)

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

### Current Implementation

The Hablas application implements a secure, production-ready upload workflow:

#### 1. Server-Side Upload Flow (Implemented)

```typescript
// app/api/audio/upload/route.ts
import { put } from '@vercel/blob';
import { requireRole } from '@/lib/auth/middleware-helper';
import { checkRateLimit } from '@/lib/utils/rate-limiter';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav',
  'audio/ogg', 'audio/webm', 'audio/aac', 'audio/m4a'
];

export async function POST(request: NextRequest) {
  // 1. Authentication: Require admin role
  const authResult = await requireRole(request, 'admin');
  if (!authResult.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // 2. Rate limiting: Prevent abuse
  const rateLimit = await checkRateLimit(authResult.user.id, 'API');
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // 3. Verify blob token configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { success: false, error: 'Storage not configured' },
      { status: 500 }
    );
  }

  // 4. Parse and validate file
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file || file.size > MAX_FILE_SIZE ||
      !ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: 'Invalid file' },
      { status: 400 }
    );
  }

  // 5. Sanitize filename and upload
  const sanitizedFilename = sanitizeFilename(file.name);
  const pathname = `audio/${Date.now()}-${sanitizedFilename}`;

  const blob = await put(pathname, file, {
    access: 'public',
    contentType: file.type,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
  });

  // 6. Return success with metadata
  return NextResponse.json({
    success: true,
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType,
    size: file.size,
  }, { status: 201 });
}
```

**Key Features Implemented:**
- Admin-only access control
- Rate limiting per user
- Comprehensive file validation (size, type, extension)
- Filename sanitization (prevents path traversal)
- Timestamped filenames (prevents conflicts)
- Detailed error responses with HTTP status codes

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

**Quick Start Checklist:**
- [ ] Environment variables configured in Vercel
- [ ] Local `.env.local` configured (for development)
- [ ] Blob store created in Vercel dashboard
- [ ] `@vercel/blob` package installed (`npm list @vercel/blob`)
- [ ] Application redeployed after env var changes

**Functional Testing:**
- [ ] Upload API route returns valid blob URL
- [ ] Uploaded files accessible via CDN
- [ ] Database stores blob URL correctly
- [ ] Audio playback works in browser
- [ ] File validation working (type, size, extension)
- [ ] Authentication required for uploads (admin only)
- [ ] Rate limiting active and enforced
- [ ] Error handling returns appropriate status codes
- [ ] CDN caching working (check x-vercel-cache header)

**Testing Commands:**

```bash
# 1. Test upload via cURL (requires admin auth token)
curl -X POST https://your-domain.vercel.app/api/audio/upload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@test-audio.mp3"

# Expected success response:
# {"success":true,"url":"https://...blob.vercel-storage.com/audio/...","pathname":"audio/...","contentType":"audio/mpeg","size":2457600}

# 2. Test direct blob access (should work without auth)
curl -I "https://abc123.public.blob.vercel-storage.com/audio/test.mp3"

# Expected headers:
# HTTP/2 200
# content-type: audio/mpeg
# cache-control: public, max-age=31536000
# x-vercel-cache: HIT (or MISS on first access)

# 3. Test rate limiting (rapid requests)
for i in {1..10}; do
  curl -X POST https://your-domain.vercel.app/api/audio/upload \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
    -F "file=@test.mp3"
  sleep 0.5
done

# Expected after limit: 429 Too Many Requests

# 4. Test invalid file type
curl -X POST https://your-domain.vercel.app/api/audio/upload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@test.pdf"

# Expected: 400 Bad Request with error message

# 5. Test unauthenticated access
curl -X POST https://your-domain.vercel.app/api/audio/upload \
  -F "file=@test.mp3"

# Expected: 401 Unauthorized
```

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

## Pricing and Limits

### Vercel Blob Pricing Tiers

#### Hobby Plan (Free)
- **Storage**: 1 GB included
- **Bandwidth**: 100 GB/month
- **Operations**: Unlimited reads/writes
- **Overage Costs**:
  - Storage: $0.15/GB/month
  - Bandwidth: $0.15/GB

#### Pro Plan ($20/month)
- **Storage**: 100 GB included
- **Bandwidth**: 1 TB/month
- **Operations**: Unlimited reads/writes
- **Overage Costs**:
  - Storage: $0.10/GB/month
  - Bandwidth: $0.10/GB

#### Enterprise Plan
- Custom pricing based on usage
- Dedicated support and SLA
- Contact Vercel sales

### Usage Estimation for Hablas

**Assumptions:**
- Average audio file: 2 MB (3-minute MP3 at 128kbps)
- Monthly uploads: 100 files
- Monthly plays: 1,000 listens

**Calculations:**

```
Storage Used:
  100 uploads × 2 MB = 200 MB/month cumulative
  Annual storage: ~2.4 GB (with cleanup)

Bandwidth Used:
  1,000 plays × 2 MB = 2 GB/month

Total Monthly Cost (Hobby Plan):
  Storage: 200 MB (within free 1 GB)
  Bandwidth: 2 GB (within free 100 GB)
  Cost: $0/month
```

**Scaling Considerations:**
- Hobby plan sufficient for small-medium deployments
- Upgrade to Pro at ~500 GB storage or heavy bandwidth
- Monitor usage in Vercel Dashboard → Storage → Blob

### Monitoring Usage

**Vercel Dashboard:**
1. Navigate to Storage → Blob
2. View real-time metrics:
   - Total storage used
   - Bandwidth consumption
   - Number of operations
   - Cost projections

**Set Up Alerts:**
```bash
# Configure notifications for approaching limits
# Settings → Notifications → Usage Alerts

Alert thresholds:
- 80% of storage quota
- 80% of bandwidth quota
- Unexpected cost increases
```

### Current Implementation Constraints

**File Upload Limits (Configurable in `/app/api/audio/upload/route.ts`):**
- Maximum file size: **10 MB**
- Allowed formats: MP3, WAV, OGG, WebM, AAC, M4A
- Allowed MIME types: audio/mpeg, audio/wav, audio/ogg, etc.
- Filename sanitization: Enforced to prevent security issues
- Storage path: `audio/[timestamp]-[filename]`

**Rate Limiting (Configured in `/lib/utils/rate-limiter.ts`):**
- Applied per user ID
- Prevents upload abuse
- Returns 429 status when exceeded
- Headers include remaining quota and reset time

## Best Practices

### 1. File Naming and Organization

**Current Implementation:**
```typescript
// Files stored as: audio/[timestamp]-[sanitized-filename]
const timestamp = Date.now();
const sanitizedFilename = sanitizeFilename(file.name);
const pathname = `audio/${timestamp}-${sanitizedFilename}`;
```

**Recommendations:**
- ✅ Timestamp prefix ensures uniqueness (already implemented)
- ✅ Filename sanitization prevents path traversal (already implemented)
- Consider organizing by date for easier management:
  ```typescript
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const pathname = `audio/${year}/${month}/${timestamp}-${sanitizedFilename}`;
  ```
- Consider organizing by topic ID for better association:
  ```typescript
  const pathname = `audio/topics/${topicId}/${timestamp}-${sanitizedFilename}`;
  ```

### 2. Access Control and Security

**Current Implementation:**
- Files stored with `access: 'public'` for CDN delivery
- Upload restricted to admin users only (`requireRole(request, 'admin')`)
- Rate limiting prevents abuse

**Recommendations:**
- ✅ Keep public access for easy CDN delivery and performance
- ✅ Maintain admin-only upload permissions
- ✅ Continue using rate limiting
- Consider signed URLs for private content (future enhancement if needed)
- Never expose `BLOB_READ_WRITE_TOKEN` in client-side code

### 3. File Validation

**Current Implementation:**
```typescript
// Triple validation: size, MIME type, extension
const validation = validateFile(file);
if (!validation.valid) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}
```

**Additional Recommendations:**
- ✅ Server-side validation is comprehensive
- Consider validating file headers (magic bytes) for extra security
- Consider audio quality validation (sample rate, bitrate)
- Implement malware scanning for enterprise deployments

### 4. Performance Optimization

**CDN Caching (Automatic):**
```
Vercel automatically sets cache headers:
cache-control: public, max-age=31536000, immutable
```

**Recommendations:**
- ✅ Leverage automatic CDN caching (no action needed)
- ✅ Audio files cached at edge for fast global delivery
- Use progressive download for large files (already supported by HTML5 audio)
- Consider audio compression before upload:
  ```typescript
  // Example: Compress audio to 128kbps MP3
  // Can be implemented client-side or server-side
  ```
- Implement lazy loading in AudioPlayer component (already implemented)

### 5. Error Handling and Logging

**Current Implementation:**
```typescript
try {
  const blob = await put(pathname, file, {...});
  return NextResponse.json({ success: true, url: blob.url });
} catch (error) {
  console.error('Audio upload error:', error);
  return NextResponse.json(
    { success: false, error: 'Upload failed', details: error.message },
    { status: 500 }
  );
}
```

**Recommendations:**
- ✅ Comprehensive error handling implemented
- ✅ Detailed error messages for debugging
- ✅ Appropriate HTTP status codes
- Add structured logging for production monitoring:
  ```typescript
  import { logger } from '@/lib/logger';

  logger.info('Audio upload success', {
    userId: authResult.user.id,
    filename: sanitizedFilename,
    size: file.size,
    blobUrl: blob.url,
  });
  ```

### 6. Security Best Practices

**Token Security:**
- ✅ Never commit tokens to version control
- ✅ Use environment variables for all environments
- ✅ Store in Vercel dashboard for production
- Rotate tokens periodically (quarterly recommended)
- Use separate dev/production tokens if possible

**Upload Security:**
- ✅ Server-side validation enforced
- ✅ Filename sanitization prevents path traversal
- ✅ Rate limiting prevents abuse
- ✅ Admin-only access enforced
- ✅ HTTPS only (automatic with Vercel)

### 7. Monitoring and Maintenance

**Implement Logging:**
```typescript
console.log('Audio upload:', {
  userId: authResult.user.id,
  filename: sanitizedFilename,
  size: file.size,
  contentType: file.type,
  blobUrl: blob.url,
  timestamp: new Date().toISOString(),
});
```

**Track Metrics:**
- Upload success/failure rates
- Average file sizes
- Storage usage trends
- Bandwidth consumption
- Rate limit hits

## Maintenance and Cleanup

### Regular Cleanup Tasks

#### 1. Identify Orphaned Files

Files uploaded but not referenced in database:

```typescript
// scripts/cleanup-orphaned-blobs.ts
import { list, del } from '@vercel/blob';
import { query } from '@/lib/db/pool';

async function cleanupOrphanedBlobs() {
  // Get all blob URLs
  const { blobs } = await list({ prefix: 'audio/' });

  // Get all database audio URLs
  const { rows } = await query(
    'SELECT DISTINCT audio_url FROM topics WHERE audio_url IS NOT NULL'
  );
  const dbUrls = new Set(rows.map(r => r.audio_url));

  // Find orphaned blobs
  const orphaned = blobs.filter(blob => !dbUrls.has(blob.url));

  // Delete orphaned blobs
  for (const blob of orphaned) {
    console.log(`Deleting orphaned blob: ${blob.pathname}`);
    await del(blob.url);
  }

  console.log(`Cleaned up ${orphaned.length} orphaned blobs`);
}
```

**Schedule Cleanup:**
```bash
# Add to package.json scripts
"cleanup:blobs": "tsx scripts/cleanup-orphaned-blobs.ts"

# Run monthly via cron or Vercel Cron Jobs
```

#### 2. Remove Duplicate Files

```bash
# List all files and identify duplicates by size/name pattern
vercel blob list --json | jq '.blobs[] | {pathname: .pathname, size: .size}'
```

#### 3. Archive Old Files

For files older than retention period:

```typescript
async function archiveOldBlobs(daysOld: number = 365) {
  const { blobs } = await list({ prefix: 'audio/' });
  const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

  const oldBlobs = blobs.filter(blob => {
    const uploadedAt = new Date(blob.uploadedAt).getTime();
    return uploadedAt < cutoffDate;
  });

  console.log(`Found ${oldBlobs.length} blobs older than ${daysOld} days`);
  // Archive or delete as needed
}
```

### Backup Strategy

**Weekly Backup Script:**
```bash
#!/bin/bash
# scripts/backup-blobs.sh

BACKUP_DIR="./backups/blobs/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# Download all blobs
vercel blob list --json | jq -r '.blobs[].url' | while read url; do
  filename=$(basename "$url")
  curl -o "$BACKUP_DIR/$filename" "$url"
  echo "Backed up: $filename"
done

# Optional: Sync to S3 for long-term storage
aws s3 sync "$BACKUP_DIR" s3://your-backup-bucket/hablas-blobs/$(date +%Y-%m-%d)/
```

### Monitoring Storage Usage

**Create Monitoring Script:**
```typescript
// scripts/monitor-blob-usage.ts
import { list } from '@vercel/blob';

async function monitorBlobUsage() {
  const { blobs } = await list();

  const totalSize = blobs.reduce((sum, blob) => sum + blob.size, 0);
  const totalSizeGB = (totalSize / 1024 / 1024 / 1024).toFixed(2);

  const stats = {
    totalFiles: blobs.length,
    totalSizeGB,
    averageFileSizeMB: ((totalSize / blobs.length) / 1024 / 1024).toFixed(2),
  };

  console.log('Blob Storage Statistics:', stats);

  // Alert if approaching limits
  if (parseFloat(totalSizeGB) > 0.8) { // 80% of 1GB free tier
    console.warn('WARNING: Approaching storage limit!');
    // Send notification (email, Slack, etc.)
  }
}
```

**Schedule Monitoring:**
```bash
# Add to package.json
"monitor:blobs": "tsx scripts/monitor-blob-usage.ts"

# Run daily via cron
0 6 * * * cd /path/to/hablas && npm run monitor:blobs
```

## Quick Reference

### Environment Variables Required

```bash
# Production (Vercel Dashboard)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_YourProductionTokenHere

# Development (.env.local)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_YourDevTokenHere
```

### API Endpoints

**Upload Audio:**
```bash
POST /api/audio/upload
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
Body: file=<audio-file>

Response: {
  "success": true,
  "url": "https://...blob.vercel-storage.com/audio/...",
  "pathname": "audio/1234567890-filename.mp3",
  "contentType": "audio/mpeg",
  "size": 2457600
}
```

**Download/Fetch Audio:**
```bash
GET /api/audio/download?id=audio/1234567890-filename.mp3

Response: Audio file stream or redirect to blob URL
```

### File Constraints

- **Max size**: 10 MB (configurable)
- **Formats**: MP3, WAV, OGG, WebM, AAC, M4A
- **Storage path**: `audio/[timestamp]-[sanitized-filename]`
- **Access**: Public (CDN cached)
- **Authentication**: Required for upload (admin only)

### Useful Commands

```bash
# List all blobs
vercel blob list

# List blobs with prefix
vercel blob list --prefix audio/

# Delete specific blob
vercel blob delete audio/1234567890-filename.mp3

# Check environment variables
vercel env ls

# Add environment variable
vercel env add BLOB_READ_WRITE_TOKEN

# Pull environment variables locally
vercel env pull .env.local

# Redeploy with latest env vars
vercel --prod
```

### Components Reference

**Upload Component:**
- Location: `/components/admin/AudioUploader.tsx`
- Usage: Admin interface for uploading audio
- Features: Drag-drop, progress bar, validation

**Player Component:**
- Location: `/components/shared/AudioPlayer.tsx`
- Usage: Public audio playback
- Features: Custom controls, progress bar, time display

**API Routes:**
- Upload: `/app/api/audio/upload/route.ts`
- Download: `/app/api/audio/download/route.ts`

**Utilities:**
- Storage helpers: `/lib/audio/blob-storage.ts`
- Validation: Built into upload route
- Sanitization: Built into upload route

## Additional Resources

### Official Documentation
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [@vercel/blob NPM Package](https://www.npmjs.com/package/@vercel/blob)
- [Vercel Storage Pricing](https://vercel.com/docs/storage/vercel-blob/usage-and-pricing)
- [Vercel Blob SDK Reference](https://vercel.com/docs/storage/vercel-blob/using-blob-sdk)

### Best Practices
- [Audio File Optimization](https://web.dev/audio-best-practices/)
- [CDN Best Practices](https://web.dev/content-delivery-networks/)
- [Security Headers](https://web.dev/security-headers/)

### Vercel Platform
- [Environment Variables Guide](https://vercel.com/docs/projects/environment-variables)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Deployment Best Practices](https://vercel.com/docs/deployments/overview)

## Support

### Vercel-Specific Issues
- [Vercel Support](https://vercel.com/support)
- [Vercel Community Discussions](https://github.com/vercel/vercel/discussions)
- [Vercel Status Page](https://www.vercel-status.com/)

### Hablas-Specific Issues
1. Check application logs in Vercel Dashboard → Deployments → Functions
2. Review runtime logs for blob upload errors
3. Verify environment variables are set correctly
4. Test locally with `.env.local` configuration
5. Check rate limiting logs in database
6. Review authentication middleware logs

### Getting Help
- Open issue in project repository
- Check existing documentation in `/docs`
- Review test reports in `/__tests__/auth`
- Contact development team with:
  - Error messages and stack traces
  - Steps to reproduce
  - Environment (production/preview/development)
  - Deployment URL and timestamp

---

**Document Version**: 2.0.0
**Last Updated**: 2025-11-17
**Maintainer**: Hablas Development Team
**Status**: Production Ready
