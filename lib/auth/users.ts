/**
 * User Management
 * Handles user authentication, password hashing, and user data
 */

import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';
import type { User, UserSession, LoginCredentials } from './types';
import { SECURITY_CONFIG } from '@/lib/config/security';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const SALT_ROUNDS = 10;

/**
 * Load users from JSON file or environment variables (for Vercel)
 */
async function loadUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist (Vercel serverless), check environment variables
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      console.log('📁 File system unavailable - using environment variables for admin user');

      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      const isHashed = process.env.ADMIN_PASSWORD.startsWith('$2a$') ||
                       process.env.ADMIN_PASSWORD.startsWith('$2b$');

      const passwordHash = isHashed
        ? process.env.ADMIN_PASSWORD
        : await hashPassword(process.env.ADMIN_PASSWORD);

      // Create admin user from environment variables
      const adminUser: User = {
        id: 'user_env_admin',
        email: process.env.ADMIN_EMAIL,
        password: passwordHash,
        role: 'admin',
        name: 'Admin User',
        createdAt: new Date().toISOString(),
      };
      return [adminUser];
    }

    // No file and no env vars - return empty array
    console.error('Error loading users:', error);
    return [];
  }
}

/**
 * Save users to JSON file (skips on Vercel serverless)
 */
async function saveUsers(users: User[]): Promise<void> {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    // On Vercel serverless, filesystem is read-only - skip save
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      console.log('⚠️ Serverless environment - skipping user save to file system');
      return; // Skip file save on Vercel
    }
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
 * Validate password strength using security policy
 */
export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  const result = SECURITY_CONFIG.PASSWORD.validate(password);

  if (!result.valid) {
    return { valid: false, error: result.errors[0] }; // Return first error
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
    const adminEmail = SECURITY_CONFIG.ADMIN.getDefaultEmail();
    const adminPassword = SECURITY_CONFIG.ADMIN.getDefaultPassword();

    console.log('🔐 No users found. Creating default admin user...');

    const result = await createUser(
      adminEmail,
      adminPassword,
      'admin',
      'Admin User'
    );

    if (result.success) {
      console.log(`✅ Default admin created: ${adminEmail}`);

      // In production, if password was auto-generated, show it once
      if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) {
        console.log('⚠️  IMPORTANT: Save this password - it will not be shown again!');
        console.log(`   Password: ${adminPassword}`);
        console.log('⚠️  For security, set ADMIN_PASSWORD in environment variables');
      } else if (process.env.ADMIN_PASSWORD) {
        console.log('⚠️  Using ADMIN_PASSWORD from environment variables');
      } else {
        console.log('⚠️  Using auto-generated secure password (check logs above)');
      }
    } else {
      console.error('❌ Failed to create default admin:', result.error);
    }
  }
}
