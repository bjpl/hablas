'use client';

/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions
 */

import { useAuth } from '@/lib/contexts/AuthContext';
import type { Permission } from '@/lib/auth/types';

interface PermissionGateProps {
  children: React.ReactNode;
  permission: keyof Permission;
  fallback?: React.ReactNode;
}

export default function PermissionGate({
  children,
  permission,
  fallback
}: PermissionGateProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}
