'use client'

import { Home, BookOpen, Mic, Users, User } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Inicio', ariaLabel: 'Ir a inicio', comingSoon: false },
  { href: '/recursos', icon: BookOpen, label: 'Recursos', ariaLabel: 'Ver recursos', comingSoon: false },
  { href: '/practica', icon: Mic, label: 'Practicar', ariaLabel: 'Practicar inglés - Próximamente', comingSoon: true },
  { href: '/comunidad', icon: Users, label: 'Comunidad', ariaLabel: 'Comunidad', comingSoon: false },
  { href: '/perfil', icon: User, label: 'Perfil', ariaLabel: 'Mi perfil', comingSoon: false },
]

export default function BottomNav() {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg pb-safe md:hidden"
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
              className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-2 py-1 rounded-lg transition-all duration-200 active:scale-95 no-tap-highlight ${
                isActive
                  ? 'text-accent-green bg-green-50 font-semibold'
                  : item.comingSoon
                  ? 'text-gray-400 cursor-pointer'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
              {item.comingSoon && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  SOON
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
