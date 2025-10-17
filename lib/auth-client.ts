/**
 * Client-side authentication utilities for static export
 *
 * Since we use static export for GitHub Pages, we can't use middleware.
 * This provides client-side authentication checks for admin routes.
 */

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useRequireAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/admin/login')
    }
  }, [session, status, router])

  return { session, status }
}

export function useIsAuthenticated() {
  const { data: session, status } = useSession()

  return {
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    session
  }
}
