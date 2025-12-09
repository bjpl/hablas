-- Migration 004: Add Performance Indexes
-- Description: Add functional indexes for case-insensitive email lookup and session token queries
-- Dependencies: 001_create_users_table.sql, 003_create_sessions_table.sql
-- Author: Performance Optimization Agent
-- Date: 2025-12-09

BEGIN;

-- Functional index for case-insensitive email lookup
-- Addresses: lib/db/users.ts queries using LOWER(email) = LOWER($1)
-- Impact: Prevents full table scans on every login/lookup
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));

-- Composite index for session token lookups (access_token_hash OR refresh_token_hash)
-- Addresses: lib/db/sessions.ts token blacklist checks
CREATE INDEX IF NOT EXISTS idx_sessions_access_token ON sessions(access_token_hash)
  WHERE access_token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token_hash)
  WHERE refresh_token_hash IS NOT NULL;

-- Composite index for active session queries by user
-- Addresses: lib/auth/session.ts getUserSessions() and cleanup queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_active_expires
  ON sessions(user_id, is_active, expires_at DESC)
  WHERE revoked_at IS NULL;

-- Index for token blacklist table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'token_blacklist') THEN
    CREATE INDEX IF NOT EXISTS idx_token_blacklist_token ON token_blacklist(token_hash);
    CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist(expires_at)
      WHERE expires_at > CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Analyze tables to update statistics after index creation
ANALYZE users;
ANALYZE sessions;

-- Add comments
COMMENT ON INDEX idx_users_email_lower IS 'Functional index for case-insensitive email lookup - critical for login performance';
COMMENT ON INDEX idx_sessions_access_token IS 'Partial index for access token lookups';
COMMENT ON INDEX idx_sessions_refresh_token IS 'Partial index for refresh token lookups';
COMMENT ON INDEX idx_sessions_user_active_expires IS 'Composite index for user session management queries';

COMMIT;
