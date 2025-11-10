'use client'

import { ReactNode } from 'react'
import { AudioProvider } from '@/lib/contexts/AudioContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AudioProvider>
      {children}
    </AudioProvider>
  )
}
