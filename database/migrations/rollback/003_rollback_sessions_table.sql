-- Rollback Migration 003: Drop Sessions Table
-- Description: Safely rollback sessions table and related objects
-- Author: Database Architect
-- Date: 2025-11-17

BEGIN;

-- Drop triggers first
DROP TRIGGER IF EXISTS enforce_session_limit ON sessions;
DROP TRIGGER IF EXISTS check_session_expiry ON sessions;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;

-- Drop functions
DROP FUNCTION IF EXISTS enforce_max_sessions_per_user();
DROP FUNCTION IF EXISTS auto_revoke_expired_sessions();
DROP FUNCTION IF EXISTS cleanup_expired_sessions();

-- Drop indexes
DROP INDEX IF EXISTS idx_sessions_user_created;
DROP INDEX IF EXISTS idx_sessions_cleanup;
DROP INDEX IF EXISTS idx_sessions_last_activity;
DROP INDEX IF EXISTS idx_sessions_expires;
DROP INDEX IF EXISTS idx_sessions_active;
DROP INDEX IF EXISTS idx_sessions_user;
DROP INDEX IF EXISTS idx_sessions_token;

-- Drop table
DROP TABLE IF EXISTS sessions;

COMMIT;
