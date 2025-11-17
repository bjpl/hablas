/**
 * User Database Operations
 * PostgreSQL-based user management with prepared statements
 */

import bcrypt from 'bcryptjs';
import { query, transaction } from './pool';
import type {
  UserModel,
  UserPublic,
  UserCreateInput,
  UserUpdateInput,
  UserRole,
  AuthAuditLogCreateInput,
} from '../../database/types';
import { NotFoundError, UniqueConstraintError } from '../../database/types';

const SALT_ROUNDS = 12;

/**
 * Convert database row to UserPublic (remove sensitive fields)
 */
function toPublicUser(user: UserModel): UserPublic {
  const { password_hash, ...publicUser } = user;
  return publicUser;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<UserPublic | null> {
  const result = await query<UserModel>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );

  return result.rows[0] ? toPublicUser(result.rows[0]) : null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<UserPublic | null> {
  const result = await query<UserModel>(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );

  return result.rows[0] ? toPublicUser(result.rows[0]) : null;
}

/**
 * Get user with password hash (for authentication)
 */
export async function getUserWithPassword(email: string): Promise<UserModel | null> {
  const result = await query<UserModel>(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );

  return result.rows[0] || null;
}

/**
 * Create a new user
 */
export async function createUser(input: UserCreateInput): Promise<UserPublic> {
  const hashedPassword = await hashPassword(input.password);

  try {
    const result = await query<UserModel>(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.email, hashedPassword, input.name, input.role]
    );

    return toPublicUser(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      throw new UniqueConstraintError('email');
    }
    throw error;
  }
}

/**
 * Update user
 */
export async function updateUser(input: UserUpdateInput): Promise<UserPublic> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (input.email !== undefined) {
    updates.push(`email = $${paramCount++}`);
    values.push(input.email);
  }

  if (input.password !== undefined) {
    const hashedPassword = await hashPassword(input.password);
    updates.push(`password_hash = $${paramCount++}`);
    values.push(hashedPassword);
  }

  if (input.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(input.name);
  }

  if (input.role !== undefined) {
    updates.push(`role = $${paramCount++}`);
    values.push(input.role);
  }

  if (input.is_active !== undefined) {
    updates.push(`is_active = $${paramCount++}`);
    values.push(input.is_active);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(input.id);

  const result = await query<UserModel>(
    `UPDATE users
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User', input.id);
  }

  return toPublicUser(result.rows[0]);
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  );
}

/**
 * Delete user (soft delete by setting is_active = false)
 */
export async function deleteUser(userId: string): Promise<void> {
  const result = await query(
    'UPDATE users SET is_active = false WHERE id = $1',
    [userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError('User', userId);
  }
}

/**
 * Hard delete user (permanent)
 */
export async function hardDeleteUser(userId: string): Promise<void> {
  const result = await query(
    'DELETE FROM users WHERE id = $1',
    [userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError('User', userId);
  }
}

/**
 * List all users with pagination
 */
export async function listUsers(
  limit: number = 50,
  offset: number = 0,
  role?: UserRole
): Promise<{ users: UserPublic[]; total: number }> {
  // Get total count
  const countQuery = role
    ? 'SELECT COUNT(*) FROM users WHERE role = $1'
    : 'SELECT COUNT(*) FROM users';
  const countParams = role ? [role] : [];
  const countResult = await query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count, 10);

  // Get paginated users
  const usersQuery = role
    ? 'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3'
    : 'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2';
  const usersParams = role ? [role, limit, offset] : [limit, offset];
  const usersResult = await query<UserModel>(usersQuery, usersParams);

  return {
    users: usersResult.rows.map(toPublicUser),
    total,
  };
}

/**
 * Get user role
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const result = await query<{ role: UserRole }>(
    'SELECT role FROM users WHERE id = $1',
    [userId]
  );

  return result.rows[0]?.role || null;
}

/**
 * Log authentication event
 */
export async function logAuthEvent(event: AuthAuditLogCreateInput): Promise<void> {
  await query(
    `INSERT INTO auth_audit_log (
      user_id, event_type, success, error_message, ip_address, user_agent
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      event.user_id || null,
      event.event_type,
      event.success,
      event.error_message || null,
      event.ip_address || null,
      event.user_agent || null,
    ]
  );
}

/**
 * Validate user credentials
 */
export async function validateCredentials(
  email: string,
  password: string,
  metadata?: { ip_address?: string; user_agent?: string }
): Promise<{ valid: boolean; user?: UserPublic; error?: string }> {
  const user = await getUserWithPassword(email);

  if (!user) {
    await logAuthEvent({
      event_type: 'failed_login',
      success: false,
      error_message: 'Invalid email',
      ...metadata,
    });
    return { valid: false, error: 'Invalid email or password' };
  }

  if (!user.is_active) {
    await logAuthEvent({
      user_id: user.id,
      event_type: 'failed_login',
      success: false,
      error_message: 'Account disabled',
      ...metadata,
    });
    return { valid: false, error: 'Account is disabled' };
  }

  const passwordMatch = await comparePassword(password, user.password_hash);

  if (!passwordMatch) {
    await logAuthEvent({
      user_id: user.id,
      event_type: 'failed_login',
      success: false,
      error_message: 'Invalid password',
      ...metadata,
    });
    return { valid: false, error: 'Invalid email or password' };
  }

  // Success - update last login and log event
  await updateLastLogin(user.id);
  await logAuthEvent({
    user_id: user.id,
    event_type: 'login',
    success: true,
    ...metadata,
  });

  return { valid: true, user: toPublicUser(user) };
}
