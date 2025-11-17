/**
 * Permission Management
 * Role-based access control utilities
 */

import type { UserRole, Permission } from './types';
import { PERMISSIONS } from './types';

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  return PERMISSIONS[role][permission];
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission {
  return PERMISSIONS[role];
}

/**
 * Check if user can edit content
 */
export function canEdit(role: UserRole): boolean {
  return hasPermission(role, 'canEdit');
}

/**
 * Check if user can approve content
 */
export function canApprove(role: UserRole): boolean {
  return hasPermission(role, 'canApprove');
}

/**
 * Check if user can delete content
 */
export function canDelete(role: UserRole): boolean {
  return hasPermission(role, 'canDelete');
}

/**
 * Check if user can view dashboard
 */
export function canViewDashboard(role: UserRole): boolean {
  return hasPermission(role, 'canViewDashboard');
}

/**
 * Check if user can manage users
 */
export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, 'canManageUsers');
}

/**
 * Validate role hierarchy (for role assignment)
 */
export function canAssignRole(assignerRole: UserRole, targetRole: UserRole): boolean {
  // Only admins can assign any role
  if (assignerRole !== 'admin') {
    return false;
  }

  return true;
}

/**
 * Get human-readable role name
 */
export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    editor: 'Editor',
    viewer: 'Viewer',
  };

  return roleNames[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    admin: 'Full access to all features including user management',
    editor: 'Can edit content but needs approval for publishing',
    viewer: 'Can view admin dashboard but cannot edit content',
  };

  return descriptions[role];
}
