'use client'

import { ReactNode } from 'react'
import { AudioProvider } from '@/lib/contexts/AudioContext'
import { AuthProvider } from '@/lib/contexts/AuthContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AudioProvider>
        {children}
      </AudioProvider>
    </AuthProvider>
  )
}
