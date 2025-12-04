/**
 * Database Type Definitions
 * Type-safe database models and query builders
 */

// Base timestamp fields
export interface Timestamps {
  created_at: Date;
  updated_at: Date;
}

// User Role enum
export type UserRole = 'admin' | 'editor' | 'viewer';

// User table model
export interface UserModel extends Timestamps {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  last_login: Date | null;
}

// User without sensitive fields (for API responses)
export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
}

// User creation input
export interface UserCreateInput {
  email: string;
  password: string; // Plain text, will be hashed
  name: string;
  role: UserRole;
}

// User update input (all fields optional except id)
export interface UserUpdateInput {
  id: string;
  email?: string;
  password?: string; // Plain text, will be hashed
  name?: string;
  role?: UserRole;
  is_active?: boolean;
}

// Refresh Token model
export interface RefreshTokenModel {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  ip_address: string | null;
  user_agent: string | null;
  revoked_at: Date | null;
  created_at: Date;
}

// Refresh Token creation input
export interface RefreshTokenCreateInput {
  user_id: string;
  token: string; // Plain text, will be hashed
  expires_at: Date;
  ip_address?: string;
  user_agent?: string;
}

// Auth Audit Log event types
export type AuthEventType =
  | 'login'
  | 'logout'
  | 'token_refresh'
  | 'password_change'
  | 'failed_login'
  | 'account_locked'
  | 'suspicious_activity'
  | 'registration'
  | 'password_reset';

// Auth Audit Log model
export interface AuthAuditLogModel {
  id: string;
  user_id: string | null;
  event_type: AuthEventType;
  success: boolean;
  error_message: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

// Auth Audit Log creation input
export interface AuthAuditLogCreateInput {
  user_id?: string;
  event_type: AuthEventType;
  success: boolean;
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
}

// Query result wrapper
export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

// Database connection config
export interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  max?: number; // Max pool size
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Pool client type (re-exported from pg for type safety)
import type { PoolClient } from 'pg';
export type { PoolClient };

// Transaction callback type - now type-safe with PoolClient
export type TransactionCallback<T> = (client: PoolClient) => Promise<T>;

// Query parameter types for type-safe queries
export type QueryParamValue = string | number | boolean | null | Date | Buffer | undefined;
export type QueryParams = QueryParamValue[];

// Database error types
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public detail?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class UniqueConstraintError extends DatabaseError {
  constructor(field: string) {
    super(`Duplicate value for field: ${field}`, '23505', field);
    this.name = 'UniqueConstraintError';
  }
}

export class ForeignKeyError extends DatabaseError {
  constructor(constraint: string) {
    super(`Foreign key constraint violated: ${constraint}`, '23503', constraint);
    this.name = 'ForeignKeyError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}
