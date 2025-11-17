'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Edit2, Settings, X, LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

/**
 * Admin Navigation Component
 *
 * Provides quick access to admin features throughout the app
 * Features:
 * - Floating action button (FAB)
 * - Keyboard shortcut (Ctrl+E / Cmd+E)
 * - Only visible in admin mode (?admin=true)
 */
export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setShowMenu(false);
    router.push('/');
  };

  useEffect(() => {
    // Legacy: Check for admin mode in URL or localStorage for backward compatibility
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');

    // If old admin param is used, redirect to login
    if (adminParam === 'true' && !isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Keyboard shortcut handler (Ctrl+E or Cmd+E)
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowMenu(prev => !prev);
      }

      // ESC to close menu
      if (e.key === 'Escape' && showMenu) {
        setShowMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showMenu]);

  // Don't render if not authenticated
  if (!isAuthenticated || !user) return null;

  // Don't show on admin pages themselves
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      {/* Floating Action Button */}
      {!isAdminPage && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="group relative bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110"
            aria-label="Admin menu"
            title="Admin menu (Ctrl+E)"
          >
            {showMenu ? (
              <X className="w-6 h-6" />
            ) : (
              <Settings className="w-6 h-6" />
            )}

            {/* Tooltip */}
            <span className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Admin Menu (Ctrl+E)
            </span>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute bottom-full right-0 mb-4 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[240px] overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                </div>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="text-xs text-blue-600 font-medium mt-1 capitalize">{user.role}</p>
              </div>

              <div className="py-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dashboard</p>
                    <p className="text-xs text-gray-500">Manage all resources</p>
                  </div>
                </Link>

                <Link
                  href="/review"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Content Editor</p>
                    <p className="text-xs text-gray-500">Review and edit content</p>
                  </div>
                </Link>

                {/* If on a resource page, show quick edit link */}
                {pathname?.startsWith('/recursos/') && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link
                      href={`/admin/edit${pathname.replace('/recursos', '')}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors bg-blue-50 border-l-4 border-blue-600"
                      onClick={() => setShowMenu(false)}
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Edit This Resource</p>
                        <p className="text-xs text-blue-700">Quick access to editor</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>

              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 font-medium w-full"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Mode Indicator */}
      {!isAdminPage && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-blue-100 border border-blue-300 rounded-lg px-3 py-2 shadow-sm">
            <p className="text-xs font-medium text-blue-800">
              Authenticated as {user.role}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
