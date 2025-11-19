/**
 * Bottom Navigation Bar - Mobile-First Implementation
 *
 * Location: /home/user/hablas/components/mobile/BottomNav.tsx
 *
 * Features:
 * - Thumb-friendly navigation (optimized for one-handed use)
 * - Safe area support (iOS notch, Android gesture bar)
 * - Active state indication
 * - Accessibility support (ARIA labels, keyboard navigation)
 * - Smooth transitions
 *
 * Usage:
 * Import in app/layout.tsx after children and before AdminNav
 */

'use client'

import { Home, BookOpen, Mic, Users, User } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

// Navigation configuration
const NAV_ITEMS = [
  {
    href: '/',
    icon: Home,
    label: 'Inicio',
    ariaLabel: 'Ir a página de inicio'
  },
  {
    href: '/recursos',
    icon: BookOpen,
    label: 'Recursos',
    ariaLabel: 'Ver recursos de aprendizaje'
  },
  {
    href: '/practica',
    icon: Mic,
    label: 'Practicar',
    ariaLabel: 'Practicar inglés'
  },
  {
    href: '/comunidad',
    icon: Users,
    label: 'Comunidad',
    ariaLabel: 'Comunidad de estudiantes'
  },
  {
    href: '/perfil',
    icon: User,
    label: 'Perfil',
    ariaLabel: 'Mi perfil y configuración'
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Hide bottom nav on admin routes and full-screen experiences
  const shouldHide = pathname?.startsWith('/admin') ||
                     pathname?.startsWith('/player') ||
                     pathname?.includes('/fullscreen')

  if (shouldHide) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg pb-safe"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-around h-16 max-w-6xl mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center
                min-w-[64px] min-h-[48px]
                px-2 py-1 rounded-lg
                transition-all duration-200
                active:scale-95
                focus-visible:ring-2 focus-visible:ring-accent-green focus-visible:ring-offset-2
                ${
                  isActive
                    ? 'text-accent-green bg-green-50 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`}
                aria-hidden="true"
              />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Invisible padding for iOS home indicator */}
      <div className="h-safe-bottom" aria-hidden="true" />
    </nav>
  )
}

/**
 * CSS Additions Required
 *
 * Add to app/globals.css:
 *
 * @layer utilities {
 *   // Safe area support for iOS notch/Android gesture bars
 *   .pb-safe {
 *     padding-bottom: env(safe-area-inset-bottom, 0px);
 *   }
 *
 *   .h-safe-bottom {
 *     height: env(safe-area-inset-bottom, 0px);
 *   }
 *
 *   // Account for bottom nav in scrollable content
 *   .mb-bottom-nav {
 *     margin-bottom: calc(4rem + env(safe-area-inset-bottom, 0px));
 *   }
 * }
 *
 *
 * Layout Integration
 *
 * Update app/layout.tsx:
 *
 * import BottomNav from '@/components/mobile/BottomNav'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="es-CO">
 *       <body className="min-h-screen bg-gray-50">
 *         <ErrorBoundary>
 *           <Providers>
 *             {children}
 *             <BottomNav />  // Add here
 *             <AdminNav />
 *           </Providers>
 *         </ErrorBoundary>
 *       </body>
 *     </html>
 *   )
 * }
 *
 *
 * Page Content Spacing
 *
 * For pages with scrollable content, add bottom margin:
 *
 * <main className="mb-bottom-nav">
 *   // Your page content
 * </main>
 *
 *
 * Testing Checklist
 *
 * - [ ] Navigation works on all 5 tabs
 * - [ ] Active state shows correctly
 * - [ ] Icons are clear and recognizable
 * - [ ] Text labels are readable (not too small)
 * - [ ] Touch targets are at least 48x48px
 * - [ ] Safe area respected on iPhone X+ and Android gesture nav
 * - [ ] Hides on admin routes
 * - [ ] Keyboard navigation works (tab through items)
 * - [ ] Screen reader announces labels correctly
 * - [ ] Active scale animation feels responsive (not laggy)
 * - [ ] Works in both portrait and landscape
 * - [ ] No overlap with content
 * - [ ] Border shadow visible but not distracting
 *
 *
 * Future Enhancements
 *
 * 1. Badge for notifications (e.g., new resources)
 * 2. Haptic feedback on navigation
 * 3. Custom icons for branding
 * 4. Animation on route change
 * 5. Persistent state across navigation
 */
