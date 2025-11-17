/**
 * User Database Operations Tests
 */

import { db } from '../../lib/db/pool';
import {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  listUsers,
  validateCredentials,
  hashPassword,
  comparePassword,
} from '../../lib/db/users';
import type { UserCreateInput, UserRole } from '../../database/types';

describe('User Database Operations', () => {
  beforeAll(async () => {
    await db.initialize();
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    // Clean up test users
    await db.query("DELETE FROM users WHERE email LIKE '%@test.com'");
  });

  describe('Password Hashing', () => {
    it('should hash passwords', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should validate correct passwords', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);
      const isValid = await comparePassword('WrongPassword', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('User Creation', () => {
    it('should create a new user', async () => {
      const input: UserCreateInput = {
        email: 'test1@test.com',
        password: 'Test123!@#',
        name: 'Test User 1',
        role: 'viewer' as UserRole,
      };

      const user = await createUser(input);

      expect(user).toHaveProperty('id');
      expect(user.email).toBe(input.email);
      expect(user.name).toBe(input.name);
      expect(user.role).toBe(input.role);
      expect(user).not.toHaveProperty('password_hash');
    });

    it('should prevent duplicate emails', async () => {
      const input: UserCreateInput = {
        email: 'duplicate@test.com',
        password: 'Test123!@#',
        name: 'Test User',
        role: 'viewer' as UserRole,
      };

      await createUser(input);

      await expect(createUser(input)).rejects.toThrow();
    });
  });

  describe('User Retrieval', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await createUser({
        email: 'retrieve@test.com',
        password: 'Test123!@#',
        name: 'Retrieve User',
        role: 'viewer' as UserRole,
      });
      userId = user.id;
    });

    it('should get user by ID', async () => {
      const user = await getUserById(userId);

      expect(user).not.toBeNull();
      expect(user?.id).toBe(userId);
      expect(user?.email).toBe('retrieve@test.com');
    });

    it('should get user by email', async () => {
      const user = await getUserByEmail('retrieve@test.com');

      expect(user).not.toBeNull();
      expect(user?.id).toBe(userId);
    });

    it('should return null for non-existent user', async () => {
      const user = await getUserById('non-existent-id');
      expect(user).toBeNull();
    });
  });

  describe('User Update', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await createUser({
        email: 'update@test.com',
        password: 'Test123!@#',
        name: 'Update User',
        role: 'viewer' as UserRole,
      });
      userId = user.id;
    });

    it('should update user name', async () => {
      const updated = await updateUser({
        id: userId,
        name: 'Updated Name',
      });

      expect(updated.name).toBe('Updated Name');
    });

    it('should update user role', async () => {
      const updated = await updateUser({
        id: userId,
        role: 'editor' as UserRole,
      });

      expect(updated.role).toBe('editor');
    });

    it('should update password', async () => {
      const newPassword = 'NewPass123!@#';

      await updateUser({
        id: userId,
        password: newPassword,
      });

      const result = await validateCredentials('update@test.com', newPassword);
      expect(result.valid).toBe(true);
    });
  });

  describe('User Deletion', () => {
    it('should soft delete user', async () => {
      const user = await createUser({
        email: 'delete@test.com',
        password: 'Test123!@#',
        name: 'Delete User',
        role: 'viewer' as UserRole,
      });

      await deleteUser(user.id);

      // User should still exist but be inactive
      const result = await db.query(
        'SELECT is_active FROM users WHERE id = $1',
        [user.id]
      );
      expect(result.rows[0].is_active).toBe(false);
    });
  });

  describe('User Listing', () => {
    beforeEach(async () => {
      // Create test users
      await createUser({
        email: 'list1@test.com',
        password: 'Test123!@#',
        name: 'List User 1',
        role: 'viewer' as UserRole,
      });

      await createUser({
        email: 'list2@test.com',
        password: 'Test123!@#',
        name: 'List User 2',
        role: 'editor' as UserRole,
      });
    });

    it('should list all users', async () => {
      const { users, total } = await listUsers();

      expect(users.length).toBeGreaterThanOrEqual(2);
      expect(total).toBeGreaterThanOrEqual(2);
    });

    it('should filter by role', async () => {
      const { users } = await listUsers(50, 0, 'editor' as UserRole);

      expect(users.length).toBeGreaterThanOrEqual(1);
      expect(users.every(u => u.role === 'editor')).toBe(true);
    });

    it('should paginate results', async () => {
      const { users } = await listUsers(1, 0);

      expect(users.length).toBe(1);
    });
  });

  describe('Credential Validation', () => {
    beforeEach(async () => {
      await createUser({
        email: 'auth@test.com',
        password: 'Test123!@#',
        name: 'Auth User',
        role: 'viewer' as UserRole,
      });
    });

    it('should validate correct credentials', async () => {
      const result = await validateCredentials('auth@test.com', 'Test123!@#');

      expect(result.valid).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('auth@test.com');
    });

    it('should reject incorrect password', async () => {
      const result = await validateCredentials('auth@test.com', 'WrongPassword');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject non-existent user', async () => {
      const result = await validateCredentials('nonexistent@test.com', 'Test123!@#');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should log authentication events', async () => {
      await validateCredentials('auth@test.com', 'WrongPassword');

      const logs = await db.query(
        "SELECT * FROM auth_audit_log WHERE event_type = 'failed_login' ORDER BY created_at DESC LIMIT 1"
      );

      expect(logs.rows.length).toBe(1);
      expect(logs.rows[0].success).toBe(false);
    });
  });
});
