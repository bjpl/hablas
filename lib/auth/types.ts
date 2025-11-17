/**
 * Authentication Type Definitions
 * Centralized type definitions for the authentication system
 */

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  password: string; // bcrypt hashed
  role: UserRole;
  name: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  authenticated: boolean;
  user?: UserSession;
  role?: UserRole;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: UserSession;
  token?: string;
  error?: string;
}

// Permission definitions
export const PERMISSIONS = {
  admin: {
    canEdit: true,
    canApprove: true,
    canDelete: true,
    canViewDashboard: true,
    canManageUsers: true,
  },
  editor: {
    canEdit: true,
    canApprove: false,
    canDelete: false,
    canViewDashboard: true,
    canManageUsers: false,
  },
  viewer: {
    canEdit: false,
    canApprove: false,
    canDelete: false,
    canViewDashboard: true,
    canManageUsers: false,
  },
} as const;

export type Permission = typeof PERMISSIONS[UserRole];
