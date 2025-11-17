'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Edit2, Settings, X } from 'lucide-react';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Check for admin mode in URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const adminMode = adminParam === 'true' || localStorage.getItem('adminMode') === 'true';

    setIsAdmin(adminMode);

    // Save admin mode to localStorage
    if (adminParam === 'true') {
      localStorage.setItem('adminMode', 'true');
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

  // Don't render if not in admin mode
  if (!isAdmin) return null;

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
                <p className="text-sm font-semibold text-gray-900">Admin Tools</p>
                <p className="text-xs text-gray-500 mt-1">Content Management</p>
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
                  onClick={() => {
                    localStorage.removeItem('adminMode');
                    setIsAdmin(false);
                    setShowMenu(false);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Exit Admin Mode
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Mode Indicator */}
      <div className="fixed top-4 right-4 z-40">
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2 shadow-sm">
          <p className="text-xs font-medium text-yellow-800">
            Admin Mode Active
          </p>
        </div>
      </div>
    </>
  );
}
