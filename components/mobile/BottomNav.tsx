'use client'

import { Home, BookOpen, Mic, Users, User } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Inicio', ariaLabel: 'Ir a inicio' },
  { href: '/recursos', icon: BookOpen, label: 'Recursos', ariaLabel: 'Ver recursos' },
  { href: '/practica', icon: Mic, label: 'Practicar', ariaLabel: 'Practicar inglés' },
  { href: '/comunidad', icon: Users, label: 'Comunidad', ariaLabel: 'Comunidad' },
  { href: '/perfil', icon: User, label: 'Perfil', ariaLabel: 'Mi perfil' },
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
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-2 py-1 rounded-lg transition-all duration-200 active:scale-95 no-tap-highlight ${
                isActive
                  ? 'text-accent-green bg-green-50 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
