/**
 * Authentication Middleware Helper
 * Utilities for checking authentication in API routes and middleware
 */

import type { NextRequest } from 'next/server';
import { verifyToken, getUserFromToken } from './jwt';
import { getTokenFromRequest } from './cookies';
import type { AuthResult, UserSession } from './types';

/**
 * Check authentication from request
 */
export async function checkAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Get token from cookies
    const token = getTokenFromRequest(request);

    if (!token) {
      return {
        authenticated: false,
        error: 'No authentication token found',
      };
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      return {
        authenticated: false,
        error: 'Invalid or expired token',
      };
    }

    // Extract user session
    const user = getUserFromToken(token);

    if (!user) {
      return {
        authenticated: false,
        error: 'Could not extract user from token',
      };
    }

    return {
      authenticated: true,
      user,
      role: user.role,
    };
  } catch (error) {
    console.error('Authentication check failed:', error);
    return {
      authenticated: false,
      error: 'Authentication check failed',
    };
  }
}

/**
 * Require authentication for API route
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const authResult = await checkAuth(request);

  if (!authResult.authenticated) {
    throw new Error(authResult.error || 'Authentication required');
  }

  return authResult;
}

/**
 * Require specific role for API route
 */
export async function requireRole(
  request: NextRequest,
  requiredRole: 'admin' | 'editor' | 'viewer'
): Promise<AuthResult> {
  const authResult = await requireAuth(request);

  if (!authResult.role) {
    throw new Error('User role not found');
  }

  // Check role hierarchy: admin > editor > viewer
  const roleHierarchy = { admin: 3, editor: 2, viewer: 1 };
  const userRoleLevel = roleHierarchy[authResult.role];
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (userRoleLevel < requiredRoleLevel) {
    throw new Error(`Insufficient permissions. Required: ${requiredRole}`);
  }

  return authResult;
}

/**
 * Check if user has specific permission
 */
export async function checkPermission(
  request: NextRequest,
  permission: 'canEdit' | 'canApprove' | 'canDelete' | 'canViewDashboard' | 'canManageUsers'
): Promise<boolean> {
  const authResult = await checkAuth(request);

  if (!authResult.authenticated || !authResult.role) {
    return false;
  }

  const { PERMISSIONS } = await import('./types');
  return PERMISSIONS[authResult.role][permission];
}

/**
 * Extract user session from request
 */
export async function getUserSession(request: NextRequest): Promise<UserSession | null> {
  const authResult = await checkAuth(request);
  return authResult.user || null;
}
