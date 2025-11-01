'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()

      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show install prompt after a delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000) // Show after 3 seconds
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    await deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    console.log(`User response to install prompt: ${outcome}`)

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)

    // Don't show again this session
    sessionStorage.setItem('hablas-install-dismissed', 'true')
  }

  // Don't show if dismissed this session
  useEffect(() => {
    if (sessionStorage.getItem('hablas-install-dismissed')) {
      setShowPrompt(false)
    }
  }, [])

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up"
      role="dialog"
      aria-labelledby="install-prompt-title"
      aria-describedby="install-prompt-description"
    >
      <div className="bg-white rounded shadow-lg p-4 max-w-md mx-auto border border-gray-300">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 id="install-prompt-title" className="font-bold text-lg mb-1 text-gray-900">
              Instala Hablas en tu teléfono
            </h3>
            <p id="install-prompt-description" className="text-sm text-gray-700 mb-3">
              Accede rápido a todos los recursos sin necesidad de internet. Perfecto para cuando estás trabajando!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 bg-accent-green text-white rounded font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-green focus:ring-offset-2"
                aria-label="Instalar aplicación ahora"
              >
                Instalar ahora
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="Cerrar sugerencia de instalación"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
