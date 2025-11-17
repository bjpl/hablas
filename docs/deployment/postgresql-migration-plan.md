# PostgreSQL Migration Plan
## File-Based Storage to PostgreSQL Migration Strategy

**Document Version:** 1.0
**Date:** 2025-11-17
**Author:** Database Architect Agent
**Status:** Planning Phase

---

## Executive Summary

This document outlines the comprehensive migration strategy to move file-based storage (JSON files, content edits) to PostgreSQL database tables while maintaining data integrity, zero downtime, and providing rollback capabilities.

### Current State Analysis
- **Resource Files:** 25 JSON files (292KB total) in `/data/resources/`
- **Audio Files:** 69 audio files in `/public/audio/` (managed by Vercel Blob)
- **Content Edits:** Single JSON file (`content-edits.json`) tracking edit history
- **User Data:** Already in PostgreSQL (`users`, `refresh_tokens`, `auth_audit_log`)

---

## 1. Current File-Based Storage Patterns

### 1.1 Resource Storage (`/data/resources/`)

**Directory Structure:**
```
data/resources/
├── app-specific/       (7 files)
├── avanzado/          (10 files)
├── emergency/          (2 files)
├── intermedio/         (3 files)
└── principiante/       (3 files)
```

**Resource Schema (JSON):**
```json
{
  "id": "string",              // e.g., "adv-003"
  "title": "string",
  "description": "string",
  "level": "string",           // principiante|intermedio|avanzado
  "category": "string",
  "targetAudience": "string",
  "culturalContext": "string",
  "vocabulary": [              // Array of vocab items
    {
      "english": "string",
      "spanish": "string",
      "pronunciation": "string",
      "context": "string"
    }
  ],
  "phrases": [                 // Array of phrases
    {
      "english": "string",
      "spanish": "string",
      "pronunciation": "string",
      "context": "string"
    }
  ],
  "culturalNotes": [           // Array of cultural notes
    {
      "topic": "string",
      "note": "string",
      "colombianComparison": "string"
    }
  ],
  "practicalScenarios": [      // Array of scenarios
    {
      "situation": "string",
      "spanishResponse": "string",
      "englishTranslation": "string",
      "tips": "string"
    }
  ]
}
```

**Issues with Current Approach:**
- File I/O operations on every request
- No relational integrity or foreign keys
- Difficult to query/filter efficiently
- No transaction support for atomic updates
- Limited validation and constraints
- No indexing for fast lookups
- Manual serialization/deserialization overhead

### 1.2 Content Edits Storage (`/data/content-edits.json`)

**Current Schema:**
```json
{
  "edits": [
    {
      "id": "string",
      "resourceId": "string",
      "originalContent": "string",
      "editedContent": "string",
      "status": "pending|approved|rejected",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601",
      "editedBy": "string",
      "comments": "string"
    }
  ],
  "history": [
    {
      "id": "string",
      "contentEditId": "string",
      "content": "string",
      "timestamp": "ISO8601",
      "editedBy": "string",
      "changeDescription": "string"
    }
  ],
  "metadata": {
    "totalEdits": 0,
    "pendingEdits": 0,
    "approvedEdits": 0,
    "rejectedEdits": 0,
    "lastEditDate": ""
  }
}
```

**Issues:**
- Single file creates bottleneck
- Concurrent write conflicts
- No atomic updates
- History array grows unbounded
- Metadata must be recalculated manually

### 1.3 Media Files Storage

**Current Location:** `/public/audio/` + Vercel Blob Storage

**Approach:**
- Audio files uploaded to Vercel Blob via API
- URLs stored in resource JSON files
- File metadata not tracked in database

**Issues:**
- No metadata tracking (size, duration, quality)
- Orphaned files when resources deleted
- No versioning or backup tracking

---

## 2. Proposed PostgreSQL Schema

### 2.1 Resources Table

```sql
-- Migration 003: Create Resources Tables
BEGIN;

-- Main resources table
CREATE TABLE IF NOT EXISTS resources (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Legacy ID mapping
  legacy_id VARCHAR(50) UNIQUE NOT NULL,  -- Maps to old "adv-003" format

  -- Core Fields
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  level VARCHAR(20) NOT NULL,
  category VARCHAR(100) NOT NULL,
  target_audience VARCHAR(200),
  cultural_context VARCHAR(300),

  -- Status & Metadata
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT chk_level CHECK (level IN ('principiante', 'intermedio', 'avanzado', 'app-specific', 'emergency')),
  CONSTRAINT chk_title_length CHECK (char_length(title) >= 3)
);

-- Vocabulary items (one-to-many with resources)
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL,

  english_term VARCHAR(300) NOT NULL,
  spanish_term VARCHAR(300) NOT NULL,
  pronunciation VARCHAR(300),
  context TEXT,

  -- Display order
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_vocab_resource FOREIGN KEY (resource_id)
    REFERENCES resources(id) ON DELETE CASCADE
);

-- Phrases (one-to-many with resources)
CREATE TABLE IF NOT EXISTS phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL,

  english_phrase TEXT NOT NULL,
  spanish_phrase TEXT NOT NULL,
  pronunciation TEXT,
  context TEXT,

  -- Display order
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Audio
  audio_url VARCHAR(500),
  audio_duration_seconds INTEGER,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_phrase_resource FOREIGN KEY (resource_id)
    REFERENCES resources(id) ON DELETE CASCADE
);

-- Cultural notes (one-to-many with resources)
CREATE TABLE IF NOT EXISTS cultural_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL,

  topic VARCHAR(300) NOT NULL,
  note TEXT NOT NULL,
  colombian_comparison TEXT,

  -- Display order
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_note_resource FOREIGN KEY (resource_id)
    REFERENCES resources(id) ON DELETE CASCADE
);

-- Practical scenarios (one-to-many with resources)
CREATE TABLE IF NOT EXISTS practical_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL,

  situation TEXT NOT NULL,
  spanish_response TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  tips TEXT,

  -- Display order
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_scenario_resource FOREIGN KEY (resource_id)
    REFERENCES resources(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_resources_level ON resources(level);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_active ON resources(is_active) WHERE is_active = true;
CREATE INDEX idx_resources_published ON resources(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_resources_legacy ON resources(legacy_id);

CREATE INDEX idx_vocab_resource ON vocabulary(resource_id);
CREATE INDEX idx_vocab_order ON vocabulary(resource_id, display_order);

CREATE INDEX idx_phrases_resource ON phrases(resource_id);
CREATE INDEX idx_phrases_order ON phrases(resource_id, display_order);

CREATE INDEX idx_notes_resource ON cultural_notes(resource_id);
CREATE INDEX idx_notes_order ON cultural_notes(resource_id, display_order);

CREATE INDEX idx_scenarios_resource ON practical_scenarios(resource_id);
CREATE INDEX idx_scenarios_order ON practical_scenarios(resource_id, display_order);

-- Triggers
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE resources IS 'Learning resources with vocabulary, phrases, and cultural content';
COMMENT ON COLUMN resources.legacy_id IS 'Maps to original JSON file IDs (e.g., adv-003)';
COMMENT ON COLUMN resources.view_count IS 'Number of times resource has been viewed';

COMMIT;
```

### 2.2 Content Edits Tables

```sql
-- Migration 004: Create Content Edits Tables
BEGIN;

-- Content edits table
CREATE TABLE IF NOT EXISTS content_edits (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  resource_id UUID NOT NULL,
  user_id UUID NOT NULL,

  -- Content
  original_content JSONB,          -- Snapshot of original
  edited_content JSONB NOT NULL,   -- Modified content

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',

  -- Review
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_comments TEXT,

  -- Metadata
  comments TEXT,
  change_summary VARCHAR(500),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_edit_resource FOREIGN KEY (resource_id)
    REFERENCES resources(id) ON DELETE CASCADE,
  CONSTRAINT fk_edit_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_edit_reviewer FOREIGN KEY (reviewed_by)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_status CHECK (status IN ('pending', 'approved', 'rejected', 'draft')),
  CONSTRAINT chk_review_required CHECK (
    (status = 'approved' OR status = 'rejected') = (reviewed_by IS NOT NULL)
  )
);

-- Edit history (version control)
CREATE TABLE IF NOT EXISTS edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  content_edit_id UUID NOT NULL,
  user_id UUID,

  -- Content snapshot
  content_snapshot JSONB NOT NULL,
  change_description TEXT NOT NULL,

  -- Diff information
  fields_changed TEXT[],            -- Array of field names changed

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_history_edit FOREIGN KEY (content_edit_id)
    REFERENCES content_edits(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_edits_resource ON content_edits(resource_id);
CREATE INDEX idx_edits_user ON content_edits(user_id);
CREATE INDEX idx_edits_status ON content_edits(status);
CREATE INDEX idx_edits_pending ON content_edits(status, created_at)
  WHERE status = 'pending';
CREATE INDEX idx_edits_reviewer ON content_edits(reviewed_by)
  WHERE reviewed_by IS NOT NULL;

CREATE INDEX idx_history_edit ON edit_history(content_edit_id);
CREATE INDEX idx_history_user ON edit_history(user_id);
CREATE INDEX idx_history_created ON edit_history(created_at DESC);

-- Trigger
CREATE TRIGGER update_edits_updated_at
  BEFORE UPDATE ON content_edits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE content_edits IS 'Content editing requests with approval workflow';
COMMENT ON COLUMN content_edits.original_content IS 'JSONB snapshot of original resource state';
COMMENT ON COLUMN content_edits.edited_content IS 'JSONB with proposed changes';
COMMENT ON TABLE edit_history IS 'Version control history for content edits';

COMMIT;
```

### 2.3 Media Metadata Table

```sql
-- Migration 005: Create Media Metadata Table
BEGIN;

CREATE TABLE IF NOT EXISTS media_metadata (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys (nullable for orphaned files)
  resource_id UUID,
  phrase_id UUID,

  -- File Information
  file_type VARCHAR(20) NOT NULL,  -- audio, video, image
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT NOT NULL,

  -- Storage
  storage_provider VARCHAR(50) NOT NULL,  -- vercel-blob, local, s3
  storage_url VARCHAR(1000) NOT NULL,
  storage_path VARCHAR(500),

  -- Audio/Video Metadata
  duration_seconds INTEGER,
  bitrate_kbps INTEGER,
  sample_rate_hz INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_orphaned BOOLEAN DEFAULT false,

  -- Checksums
  md5_hash VARCHAR(32),
  sha256_hash VARCHAR(64),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT fk_media_resource FOREIGN KEY (resource_id)
    REFERENCES resources(id) ON DELETE SET NULL,
  CONSTRAINT fk_media_phrase FOREIGN KEY (phrase_id)
    REFERENCES phrases(id) ON DELETE SET NULL,
  CONSTRAINT chk_file_type CHECK (file_type IN ('audio', 'video', 'image', 'document')),
  CONSTRAINT chk_storage CHECK (storage_provider IN ('vercel-blob', 'local', 's3')),
  CONSTRAINT chk_size CHECK (file_size_bytes > 0)
);

-- Indexes
CREATE INDEX idx_media_resource ON media_metadata(resource_id);
CREATE INDEX idx_media_phrase ON media_metadata(phrase_id);
CREATE INDEX idx_media_type ON media_metadata(file_type);
CREATE INDEX idx_media_provider ON media_metadata(storage_provider);
CREATE INDEX idx_media_orphaned ON media_metadata(is_orphaned) WHERE is_orphaned = true;
CREATE INDEX idx_media_active ON media_metadata(is_active) WHERE is_active = true;

-- Trigger
CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON media_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE media_metadata IS 'Metadata tracking for all media files';
COMMENT ON COLUMN media_metadata.is_orphaned IS 'Flag for files without resource/phrase association';

COMMIT;
```

---

## 3. Migration Strategy

### 3.1 Migration Phases

**Phase 1: Schema Creation (2 hours)**
- ✓ Run migration 003: Resources tables
- ✓ Run migration 004: Content edits tables
- ✓ Run migration 005: Media metadata table
- Verify all tables created successfully
- Test foreign key relationships

**Phase 2: Data Migration (4 hours)**
- Parse all JSON resource files
- Transform data to PostgreSQL schema
- Insert resources with transaction safety
- Validate data integrity
- Create legacy_id mapping

**Phase 3: Parallel Operation (1 week)**
- Run both file-based and database systems
- Write to both simultaneously
- Compare results for consistency
- Monitor performance metrics
- Identify and fix discrepancies

**Phase 4: Cutover (1 day)**
- Stop writes to file system
- Final data sync verification
- Update all API routes to use database
- Deploy code changes
- Monitor for issues

**Phase 5: Cleanup (3 days)**
- Archive JSON files (don't delete)
- Remove file I/O code paths
- Update documentation
- Performance optimization
- Remove fallback code

### 3.2 Zero-Downtime Strategy

**Dual-Write Pattern:**
```typescript
// During parallel operation phase
async function saveResource(data: ResourceData) {
  const errors: Error[] = [];

  // Write to database (primary)
  try {
    await db.query('INSERT INTO resources ...', params);
  } catch (error) {
    errors.push(error);
    console.error('DB write failed:', error);
  }

  // Write to file system (backup)
  try {
    await fs.writeFile(jsonPath, JSON.stringify(data));
  } catch (error) {
    errors.push(error);
    console.error('File write failed:', error);
  }

  // If both fail, throw error
  if (errors.length === 2) {
    throw new Error('Both storage systems failed');
  }
}
```

**Read Strategy:**
```typescript
async function getResource(id: string) {
  try {
    // Try database first
    const result = await db.query('SELECT * FROM resources WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      return transformToResourceFormat(result.rows[0]);
    }
  } catch (error) {
    console.error('DB read failed, falling back to file:', error);
  }

  // Fallback to file system
  return readResourceFromFile(id);
}
```

### 3.3 Data Transformation Scripts

**Script 1: JSON to PostgreSQL Migrator**
```typescript
// scripts/migrate-resources-to-db.ts

import { db } from '@/lib/db/pool';
import fs from 'fs/promises';
import path from 'path';

interface JSONResource {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  targetAudience?: string;
  culturalContext?: string;
  vocabulary: Array<{
    english: string;
    spanish: string;
    pronunciation?: string;
    context?: string;
  }>;
  phrases: Array<{
    english: string;
    spanish: string;
    pronunciation?: string;
    context?: string;
  }>;
  culturalNotes: Array<{
    topic: string;
    note: string;
    colombianComparison?: string;
  }>;
  practicalScenarios: Array<{
    situation: string;
    spanishResponse: string;
    englishTranslation: string;
    tips?: string;
  }>;
}

async function migrateResources() {
  const resourcesDir = path.join(process.cwd(), 'data', 'resources');
  const stats = {
    total: 0,
    success: 0,
    failed: 0,
    errors: [] as Array<{ file: string; error: string }>
  };

  async function processDirectory(dir: string) {
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        await processDirectory(fullPath);
      } else if (item.isFile() && item.name.endsWith('.json')) {
        stats.total++;

        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const resource: JSONResource = JSON.parse(content);

          await migrateResource(resource);
          stats.success++;
          console.log(`✓ Migrated: ${resource.id}`);
        } catch (error) {
          stats.failed++;
          stats.errors.push({
            file: fullPath,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          console.error(`✗ Failed: ${fullPath}`, error);
        }
      }
    }
  }

  await processDirectory(resourcesDir);

  console.log('\nMigration Summary:');
  console.log(`Total: ${stats.total}`);
  console.log(`Success: ${stats.success}`);
  console.log(`Failed: ${stats.failed}`);

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach(e => console.log(`  ${e.file}: ${e.error}`));
  }
}

async function migrateResource(resource: JSONResource) {
  return db.transaction(async (client) => {
    // Insert main resource
    const resourceResult = await client.query(`
      INSERT INTO resources (
        legacy_id, title, description, level, category,
        target_audience, cultural_context, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING id
    `, [
      resource.id,
      resource.title,
      resource.description,
      resource.level,
      resource.category,
      resource.targetAudience,
      resource.culturalContext
    ]);

    const resourceId = resourceResult.rows[0].id;

    // Insert vocabulary
    for (let i = 0; i < resource.vocabulary.length; i++) {
      const vocab = resource.vocabulary[i];
      await client.query(`
        INSERT INTO vocabulary (
          resource_id, english_term, spanish_term,
          pronunciation, context, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        resourceId,
        vocab.english,
        vocab.spanish,
        vocab.pronunciation,
        vocab.context,
        i
      ]);
    }

    // Insert phrases
    for (let i = 0; i < resource.phrases.length; i++) {
      const phrase = resource.phrases[i];
      await client.query(`
        INSERT INTO phrases (
          resource_id, english_phrase, spanish_phrase,
          pronunciation, context, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        resourceId,
        phrase.english,
        phrase.spanish,
        phrase.pronunciation,
        phrase.context,
        i
      ]);
    }

    // Insert cultural notes
    for (let i = 0; i < resource.culturalNotes.length; i++) {
      const note = resource.culturalNotes[i];
      await client.query(`
        INSERT INTO cultural_notes (
          resource_id, topic, note,
          colombian_comparison, display_order
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        resourceId,
        note.topic,
        note.note,
        note.colombianComparison,
        i
      ]);
    }

    // Insert practical scenarios
    for (let i = 0; i < resource.practicalScenarios.length; i++) {
      const scenario = resource.practicalScenarios[i];
      await client.query(`
        INSERT INTO practical_scenarios (
          resource_id, situation, spanish_response,
          english_translation, tips, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        resourceId,
        scenario.situation,
        scenario.spanishResponse,
        scenario.englishTranslation,
        scenario.tips,
        i
      ]);
    }

    return resourceId;
  });
}

// Run migration
migrateResources()
  .then(() => {
    console.log('\n✅ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
```

**Script 2: Content Edits Migrator**
```typescript
// scripts/migrate-content-edits-to-db.ts

import { db } from '@/lib/db/pool';
import fs from 'fs/promises';
import path from 'path';

interface ContentEdit {
  id: string;
  resourceId: string;
  originalContent: string;
  editedContent: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  editedBy?: string;
  comments?: string;
}

interface EditHistory {
  id: string;
  contentEditId: string;
  content: string;
  timestamp: string;
  editedBy?: string;
  changeDescription: string;
}

async function migrateContentEdits() {
  const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');
  const content = await fs.readFile(editsPath, 'utf-8');
  const data = JSON.parse(content);

  const stats = {
    edits: 0,
    history: 0,
    errors: [] as string[]
  };

  await db.transaction(async (client) => {
    // Migrate edits
    for (const edit of data.edits as ContentEdit[]) {
      try {
        // Get resource UUID from legacy_id
        const resourceResult = await client.query(
          'SELECT id FROM resources WHERE legacy_id = $1',
          [edit.resourceId]
        );

        if (resourceResult.rows.length === 0) {
          console.warn(`Resource not found: ${edit.resourceId}`);
          continue;
        }

        const resourceId = resourceResult.rows[0].id;

        // Get user UUID if editedBy provided
        let userId = null;
        if (edit.editedBy) {
          const userResult = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [edit.editedBy]
          );
          userId = userResult.rows[0]?.id || null;
        }

        await client.query(`
          INSERT INTO content_edits (
            id, resource_id, user_id, original_content,
            edited_content, status, created_at, updated_at, comments
          ) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, $9)
        `, [
          edit.id,
          resourceId,
          userId,
          edit.originalContent,
          edit.editedContent,
          edit.status,
          edit.createdAt,
          edit.updatedAt,
          edit.comments
        ]);

        stats.edits++;
      } catch (error) {
        stats.errors.push(`Edit ${edit.id}: ${error}`);
      }
    }

    // Migrate history
    for (const historyEntry of data.history as EditHistory[]) {
      try {
        let userId = null;
        if (historyEntry.editedBy) {
          const userResult = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [historyEntry.editedBy]
          );
          userId = userResult.rows[0]?.id || null;
        }

        await client.query(`
          INSERT INTO edit_history (
            id, content_edit_id, user_id, content_snapshot,
            change_description, created_at
          ) VALUES ($1, $2, $3, $4::jsonb, $5, $6)
        `, [
          historyEntry.id,
          historyEntry.contentEditId,
          userId,
          historyEntry.content,
          historyEntry.changeDescription,
          historyEntry.timestamp
        ]);

        stats.history++;
      } catch (error) {
        stats.errors.push(`History ${historyEntry.id}: ${error}`);
      }
    }
  });

  console.log('\nMigration Summary:');
  console.log(`Edits migrated: ${stats.edits}`);
  console.log(`History entries migrated: ${stats.history}`);
  console.log(`Errors: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach(e => console.log(`  ${e}`));
  }
}

migrateContentEdits()
  .then(() => {
    console.log('\n✅ Content edits migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
```

---

## 4. Data Integrity Verification

### 4.1 Validation Queries

**Check Resource Count:**
```sql
-- Compare counts
SELECT
  (SELECT COUNT(*) FROM resources) as db_count,
  25 as expected_count,
  (SELECT COUNT(*) FROM resources) = 25 as counts_match;
```

**Verify Foreign Key Relationships:**
```sql
-- Check orphaned vocabulary
SELECT COUNT(*) FROM vocabulary v
WHERE NOT EXISTS (SELECT 1 FROM resources r WHERE r.id = v.resource_id);

-- Check orphaned phrases
SELECT COUNT(*) FROM phrases p
WHERE NOT EXISTS (SELECT 1 FROM resources r WHERE r.id = p.resource_id);
```

**Validate Data Completeness:**
```sql
-- Resources with vocabulary
SELECT
  r.legacy_id,
  r.title,
  COUNT(v.id) as vocab_count,
  COUNT(p.id) as phrase_count,
  COUNT(cn.id) as note_count
FROM resources r
LEFT JOIN vocabulary v ON r.id = v.resource_id
LEFT JOIN phrases p ON r.id = p.resource_id
LEFT JOIN cultural_notes cn ON r.id = cn.resource_id
GROUP BY r.id, r.legacy_id, r.title
ORDER BY r.legacy_id;
```

**Compare JSON and Database Data:**
```typescript
// scripts/verify-migration.ts

async function verifyMigration() {
  const discrepancies = [];

  // Read all JSON files
  const jsonResources = await readAllJSONResources();

  for (const jsonResource of jsonResources) {
    const dbResource = await db.query(`
      SELECT r.*,
        (SELECT json_agg(v) FROM vocabulary v WHERE v.resource_id = r.id) as vocabulary,
        (SELECT json_agg(p) FROM phrases p WHERE p.resource_id = r.id) as phrases,
        (SELECT json_agg(cn) FROM cultural_notes cn WHERE cn.resource_id = r.id) as notes,
        (SELECT json_agg(ps) FROM practical_scenarios ps WHERE ps.resource_id = r.id) as scenarios
      FROM resources r
      WHERE r.legacy_id = $1
    `, [jsonResource.id]);

    if (dbResource.rows.length === 0) {
      discrepancies.push({ type: 'missing', id: jsonResource.id });
      continue;
    }

    // Compare vocabulary count
    if (jsonResource.vocabulary.length !== dbResource.rows[0].vocabulary.length) {
      discrepancies.push({
        type: 'vocab_count',
        id: jsonResource.id,
        json: jsonResource.vocabulary.length,
        db: dbResource.rows[0].vocabulary.length
      });
    }

    // Compare phrases count
    if (jsonResource.phrases.length !== dbResource.rows[0].phrases.length) {
      discrepancies.push({
        type: 'phrase_count',
        id: jsonResource.id,
        json: jsonResource.phrases.length,
        db: dbResource.rows[0].phrases.length
      });
    }
  }

  return discrepancies;
}
```

### 4.2 Checksums and Validation

```typescript
function generateResourceChecksum(resource: any): string {
  const crypto = require('crypto');
  const normalized = JSON.stringify(resource, Object.keys(resource).sort());
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// Store checksums before migration
const checksumMap = new Map<string, string>();

// Validate after migration
for (const [id, originalChecksum] of checksumMap) {
  const dbResource = await fetchResourceFromDB(id);
  const dbChecksum = generateResourceChecksum(dbResource);

  if (originalChecksum !== dbChecksum) {
    console.error(`Checksum mismatch for ${id}`);
  }
}
```

---

## 5. Rollback Strategy

### 5.1 Rollback Scenarios

**Scenario 1: Migration Script Fails**
- All operations in transactions
- Automatic rollback on error
- JSON files remain unchanged
- No user impact

**Scenario 2: Data Corruption Detected**
```sql
-- Drop all new tables and start over
BEGIN;
DROP TABLE IF EXISTS edit_history CASCADE;
DROP TABLE IF EXISTS content_edits CASCADE;
DROP TABLE IF EXISTS media_metadata CASCADE;
DROP TABLE IF EXISTS practical_scenarios CASCADE;
DROP TABLE IF EXISTS cultural_notes CASCADE;
DROP TABLE IF EXISTS phrases CASCADE;
DROP TABLE IF EXISTS vocabulary CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
COMMIT;
```

**Scenario 3: Performance Issues After Cutover**
```typescript
// Emergency: Revert to file-based system
async function emergencyRollback() {
  // 1. Stop accepting new writes
  await toggleMaintenanceMode(true);

  // 2. Export all DB data back to JSON
  await exportDatabaseToJSON();

  // 3. Deploy previous code version
  await deployCodeVersion(previousVersion);

  // 4. Resume operations
  await toggleMaintenanceMode(false);
}
```

### 5.2 Backup Strategy

**Before Migration:**
```bash
# Backup JSON files
tar -czf data-backup-$(date +%Y%m%d-%H%M%S).tar.gz data/

# Backup database (if tables already exist)
pg_dump -h localhost -U postgres -d hablas --schema-only > schema-backup.sql
pg_dump -h localhost -U postgres -d hablas --data-only > data-backup.sql

# Backup to S3 or similar
aws s3 cp data-backup-*.tar.gz s3://hablas-backups/
```

**During Parallel Operation:**
```bash
# Daily database backups
pg_dump -h localhost -U postgres -d hablas -F c -f daily-backup-$(date +%Y%m%d).dump

# Keep JSON files synchronized as backup
rsync -av data/ data-backup-$(date +%Y%m%d)/
```

---

## 6. Updated API Routes

### 6.1 Resources API

**Before (File-based):**
```typescript
// app/api/topics/[slug]/route.ts
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const resources = getAllResources(); // Reads JSON files
  const filtered = resources.filter(r => r.category === params.slug);
  return NextResponse.json(filtered);
}
```

**After (Database):**
```typescript
// app/api/topics/[slug]/route.ts
import { db } from '@/lib/db/pool';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const result = await db.query(`
    SELECT
      r.*,
      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'english', v.english_term,
            'spanish', v.spanish_term,
            'pronunciation', v.pronunciation,
            'context', v.context
          ) ORDER BY v.display_order
        ) FROM vocabulary v WHERE v.resource_id = r.id),
        '[]'::json
      ) as vocabulary,
      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'english', p.english_phrase,
            'spanish', p.spanish_phrase,
            'pronunciation', p.pronunciation,
            'context', p.context
          ) ORDER BY p.display_order
        ) FROM phrases p WHERE p.resource_id = r.id),
        '[]'::json
      ) as phrases
    FROM resources r
    WHERE r.category = $1 AND r.is_active = true
    ORDER BY r.title
  `, [slug]);

  return NextResponse.json(result.rows);
}
```

### 6.2 Content Edits API

**Before (File-based):**
```typescript
// Reads/writes single JSON file
const editsData = await fs.readFile('data/content-edits.json', 'utf-8');
const data = JSON.parse(editsData);
data.edits.push(newEdit);
await fs.writeFile('data/content-edits.json', JSON.stringify(data));
```

**After (Database):**
```typescript
// app/api/content/save/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const { resourceId, editedContent, userId, comments } = body;

  const result = await db.transaction(async (client) => {
    // Insert edit
    const editResult = await client.query(`
      INSERT INTO content_edits (
        resource_id, user_id, edited_content, comments, status
      ) VALUES (
        (SELECT id FROM resources WHERE legacy_id = $1),
        $2, $3, $4, 'pending'
      ) RETURNING id
    `, [resourceId, userId, editedContent, comments]);

    // Create history entry
    await client.query(`
      INSERT INTO edit_history (
        content_edit_id, user_id, content_snapshot, change_description
      ) VALUES ($1, $2, $3, $4)
    `, [
      editResult.rows[0].id,
      userId,
      editedContent,
      'Initial edit created'
    ]);

    return editResult.rows[0].id;
  });

  return NextResponse.json({ success: true, editId: result });
}
```

---

## 7. Performance Optimization

### 7.1 Query Optimization

**Materialized Views for Complex Queries:**
```sql
-- Materialized view for resource summaries
CREATE MATERIALIZED VIEW resource_summaries AS
SELECT
  r.id,
  r.legacy_id,
  r.title,
  r.level,
  r.category,
  COUNT(DISTINCT v.id) as vocab_count,
  COUNT(DISTINCT p.id) as phrase_count,
  COUNT(DISTINCT cn.id) as note_count,
  r.view_count,
  r.updated_at
FROM resources r
LEFT JOIN vocabulary v ON r.id = v.resource_id
LEFT JOIN phrases p ON r.id = p.resource_id
LEFT JOIN cultural_notes cn ON r.id = cn.resource_id
WHERE r.is_active = true
GROUP BY r.id;

-- Create index
CREATE INDEX idx_resource_summaries_category ON resource_summaries(category);

-- Refresh strategy (daily or on-demand)
REFRESH MATERIALIZED VIEW CONCURRENTLY resource_summaries;
```

**Connection Pooling:**
```typescript
// Already configured in lib/db/pool.ts
const pool = new Pool({
  max: 20,                      // Maximum 20 connections
  idleTimeoutMillis: 30000,     // 30s idle timeout
  connectionTimeoutMillis: 2000 // 2s connection timeout
});
```

**Prepared Statements:**
```typescript
// Reusable prepared statements
const PREPARED_QUERIES = {
  getResourceByLegacyId: `
    SELECT * FROM resources WHERE legacy_id = $1
  `,
  getResourceWithDetails: `
    SELECT r.*, ... (complex join query)
    FROM resources r
    WHERE r.id = $1
  `
};

// Use consistently
const resource = await db.query(
  PREPARED_QUERIES.getResourceByLegacyId,
  [legacyId]
);
```

### 7.2 Caching Strategy

**Redis Cache Layer:**
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getResourceCached(id: string) {
  // Try cache first
  const cached = await redis.get(`resource:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Query database
  const resource = await db.query('SELECT ...', [id]);

  // Cache for 1 hour
  await redis.setex(
    `resource:${id}`,
    3600,
    JSON.stringify(resource.rows[0])
  );

  return resource.rows[0];
}
```

**Next.js Data Cache:**
```typescript
// Use Next.js 15 caching
export async function getResources() {
  return await fetch('http://localhost:3000/api/resources', {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

```typescript
// tests/db/resources.test.ts

describe('Resource Database Operations', () => {
  beforeAll(async () => {
    await db.initialize();
  });

  afterAll(async () => {
    await db.close();
  });

  it('should create resource with vocabulary', async () => {
    const resource = await createResource({
      legacyId: 'test-001',
      title: 'Test Resource',
      vocabulary: [
        { english: 'hello', spanish: 'hola' }
      ]
    });

    expect(resource.id).toBeDefined();
    expect(resource.vocabulary).toHaveLength(1);
  });

  it('should handle concurrent edits', async () => {
    const promises = Array.from({ length: 10 }, (_, i) =>
      createEdit({ resourceId: 'test-001', content: `Edit ${i}` })
    );

    const results = await Promise.all(promises);
    expect(results).toHaveLength(10);
  });

  it('should maintain referential integrity', async () => {
    const resource = await createResource({ legacyId: 'test-002' });
    await db.query('DELETE FROM resources WHERE id = $1', [resource.id]);

    // Vocabulary should be cascade deleted
    const vocab = await db.query(
      'SELECT * FROM vocabulary WHERE resource_id = $1',
      [resource.id]
    );
    expect(vocab.rows).toHaveLength(0);
  });
});
```

### 8.2 Integration Tests

```typescript
// tests/integration/migration.test.ts

describe('Migration Integration', () => {
  it('should match JSON and DB resource counts', async () => {
    const jsonCount = await countJSONResources();
    const dbCount = await db.query('SELECT COUNT(*) FROM resources');

    expect(dbCount.rows[0].count).toBe(jsonCount);
  });

  it('should preserve all vocabulary items', async () => {
    const jsonResources = await readAllJSONResources();
    const totalVocab = jsonResources.reduce(
      (sum, r) => sum + r.vocabulary.length,
      0
    );

    const dbVocab = await db.query('SELECT COUNT(*) FROM vocabulary');
    expect(dbVocab.rows[0].count).toBe(totalVocab);
  });
});
```

### 8.3 Load Testing

```bash
# Using Artillery for load testing
artillery quick --count 100 --num 10 http://localhost:3000/api/resources

# Expected results:
# - 95th percentile < 200ms
# - 99th percentile < 500ms
# - 0% error rate
```

---

## 9. Monitoring and Observability

### 9.1 Database Metrics

**Query Performance Monitoring:**
```sql
-- Slow query log (PostgreSQL)
ALTER DATABASE hablas SET log_min_duration_statement = 1000; -- Log queries > 1s

-- Most expensive queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Connection Pool Monitoring:**
```typescript
// Monitor pool health
setInterval(() => {
  const stats = db.getStats();
  console.log('Pool stats:', {
    total: stats.totalCount,
    idle: stats.idleCount,
    waiting: stats.waitingCount,
    utilization: (stats.totalCount - stats.idleCount) / stats.totalCount
  });
}, 60000); // Every minute
```

### 9.2 Application Metrics

**Custom Metrics:**
```typescript
import { Counter, Histogram } from 'prom-client';

const queryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration',
  labelNames: ['operation', 'table']
});

const queriesTotal = new Counter({
  name: 'db_queries_total',
  help: 'Total database queries',
  labelNames: ['operation', 'table', 'status']
});

// Instrument queries
async function instrumentedQuery(query: string, params: any[]) {
  const timer = queryDuration.startTimer({ operation: 'select', table: 'resources' });

  try {
    const result = await db.query(query, params);
    queriesTotal.inc({ operation: 'select', table: 'resources', status: 'success' });
    return result;
  } catch (error) {
    queriesTotal.inc({ operation: 'select', table: 'resources', status: 'error' });
    throw error;
  } finally {
    timer();
  }
}
```

---

## 10. Timeline and Milestones

### Week 1: Preparation
- **Day 1-2:** Schema design review and approval
- **Day 3:** Create migration scripts
- **Day 4-5:** Set up test environment and run migrations
- **Milestone:** Schema validated and migration scripts tested

### Week 2: Initial Migration
- **Day 1:** Run migration on test database
- **Day 2-3:** Data validation and integrity checks
- **Day 4:** Fix any migration issues
- **Day 5:** Performance testing
- **Milestone:** All data successfully migrated to test environment

### Week 3: Parallel Operation
- **Day 1-2:** Deploy dual-write code to staging
- **Day 3-4:** Monitor and compare results
- **Day 5:** Fix discrepancies
- **Milestone:** Both systems running consistently

### Week 4: Production Cutover
- **Day 1:** Final production migration
- **Day 2:** Switch all reads to database
- **Day 3-4:** Monitor performance and fix issues
- **Day 5:** Decommission file-based code paths
- **Milestone:** Production fully on PostgreSQL

---

## 11. Success Criteria

### Functional Requirements
- ✅ All 25 resources migrated successfully
- ✅ All vocabulary, phrases, notes, scenarios preserved
- ✅ Content edit history intact
- ✅ API response format unchanged (backward compatibility)
- ✅ All tests passing

### Performance Requirements
- ✅ API response time < 200ms (95th percentile)
- ✅ Database query time < 100ms (95th percentile)
- ✅ Support 100+ concurrent users
- ✅ Zero data loss during cutover
- ✅ 99.9% uptime during migration

### Data Integrity Requirements
- ✅ Checksum validation passes for all resources
- ✅ Foreign key relationships valid
- ✅ No orphaned records
- ✅ Edit history complete and ordered
- ✅ Media file associations correct

---

## 12. Post-Migration Tasks

### Immediate (Week 5)
- Archive JSON files to S3/backup storage
- Remove file I/O code from codebase
- Update documentation
- Train team on database operations
- Set up monitoring dashboards

### Short-term (Month 1)
- Optimize slow queries
- Implement caching layer
- Add database backups automation
- Create admin tools for data management
- Performance tuning

### Long-term (Quarter 1)
- Implement full-text search (PostgreSQL FTS)
- Add advanced analytics queries
- Create reporting dashboards
- Implement audit logging
- Plan for scaling (replication, read replicas)

---

## 13. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Data loss during migration | Low | Critical | Use transactions, checksums, backups |
| Performance degradation | Medium | High | Load testing, indexing, caching |
| Downtime during cutover | Low | High | Parallel operation, gradual rollout |
| Schema design issues | Medium | Medium | Thorough review, test environment |
| Migration script bugs | Medium | High | Unit tests, dry runs, rollback plan |
| Concurrent write conflicts | Low | Medium | Database locking, transaction isolation |

---

## 14. Contact and Support

**Database Team:**
- Database Architect: [Database Architect Agent]
- Migration Lead: [Migration Planner Agent]
- DevOps Support: [CI/CD Engineer Agent]

**Escalation Path:**
1. Database Architect (schema/design issues)
2. Migration Lead (data integrity issues)
3. DevOps Support (deployment issues)

**Emergency Contacts:**
- On-call DBA: [Contact Info]
- System Administrator: [Contact Info]

---

## Appendix A: SQL Migration Files

See:
- `/database/migrations/003_create_resources_tables.sql`
- `/database/migrations/004_create_content_edits_tables.sql`
- `/database/migrations/005_create_media_metadata_table.sql`

## Appendix B: Migration Scripts

See:
- `/scripts/migrate-resources-to-db.ts`
- `/scripts/migrate-content-edits-to-db.ts`
- `/scripts/verify-migration.ts`

## Appendix C: Rollback Procedures

See:
- `/docs/deployment/rollback-procedures.md`

---

**Document Control:**
- Version: 1.0
- Last Updated: 2025-11-17
- Next Review: Before Phase 1 execution
- Approved By: [Pending]

