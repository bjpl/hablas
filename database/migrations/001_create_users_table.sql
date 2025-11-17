-- Migration 001: Create Users Table
-- Description: Create the core users table with authentication and authorization
-- Dependencies: None
-- Author: Database Migration Specialist
-- Date: 2025-01-16

BEGIN;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  -- Profile
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer',

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT chk_role CHECK (role IN ('admin', 'editor', 'viewer')),
  CONSTRAINT chk_email_format CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
  ),
  CONSTRAINT chk_password_hash CHECK (length(password_hash) >= 60)
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add table and column comments
COMMENT ON TABLE users IS 'User accounts with authentication and authorization';
COMMENT ON COLUMN users.id IS 'Unique user identifier (UUID v4)';
COMMENT ON COLUMN users.email IS 'User email address (unique, validated)';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash with cost factor 10-12';
COMMENT ON COLUMN users.role IS 'RBAC role: admin, editor, or viewer';
COMMENT ON COLUMN users.is_active IS 'Account status (false = disabled)';
COMMENT ON COLUMN users.last_login IS 'Last successful login timestamp';

COMMIT;
