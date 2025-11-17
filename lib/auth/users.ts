/**
 * User Management
 * Handles user authentication, password hashing, and user data
 */

import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';
import type { User, UserSession, LoginCredentials } from './types';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const SALT_ROUNDS = 10;

/**
 * Load users from JSON file
 */
async function loadUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    console.error('Error loading users:', error);
    return [];
  }
}

/**
 * Save users to JSON file
 */
async function saveUsers(users: User[]): Promise<void> {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving users:', error);
    throw new Error('Failed to save users');
  }
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

/**
 * Validate user credentials
 */
export async function validateCredentials(
  credentials: LoginCredentials
): Promise<{ valid: boolean; user?: User; error?: string }> {
  const { email, password } = credentials;

  // Validate input
  if (!email || !password) {
    return { valid: false, error: 'Email and password are required' };
  }

  // Load users
  const users = await loadUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return { valid: false, error: 'Invalid email or password' };
  }

  // Verify password
  const passwordMatch = await comparePassword(password, user.password);

  if (!passwordMatch) {
    return { valid: false, error: 'Invalid email or password' };
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  await saveUsers(users);

  return { valid: true, user };
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const users = await loadUsers();
  return users.find(u => u.id === id) || null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await loadUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Get user role
 */
export async function getUserRole(userId: string): Promise<'admin' | 'editor' | 'viewer' | null> {
  const user = await getUserById(userId);
  return user ? user.role : null;
}

/**
 * Convert User to UserSession (remove sensitive data)
 */
export function toUserSession(user: User): UserSession {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }

  return { valid: true };
}

/**
 * Create a new user (admin only)
 */
export async function createUser(
  email: string,
  password: string,
  role: 'admin' | 'editor' | 'viewer',
  name: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error };
  }

  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { success: false, error: 'User with this email already exists' };
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const users = await loadUsers();
  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    password: hashedPassword,
    role,
    name,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);

  return { success: true, user: newUser };
}

/**
 * Initialize default admin user if no users exist
 */
export async function initializeDefaultAdmin(): Promise<void> {
  const users = await loadUsers();

  if (users.length === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hablas.co';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

    console.log('🔐 No users found. Creating default admin user...');

    const result = await createUser(
      adminEmail,
      adminPassword,
      'admin',
      'Admin User'
    );

    if (result.success) {
      console.log(`✅ Default admin created: ${adminEmail}`);
      console.log('⚠️  Please change the default password immediately!');
    } else {
      console.error('❌ Failed to create default admin:', result.error);
    }
  }
}
