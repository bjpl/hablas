import type { Metadata, Viewport } from 'next'
import './globals.css'
import '@/styles/resource-content.css'
import { Providers } from './providers'
import ErrorBoundary from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Hablas - Aprende Inglés para Trabajo',
  description: 'Recursos gratuitos de inglés para conductores y domiciliarios en Colombia. Aprende inglés para trabajar con Uber, Rappi, DiDi y más.',
  keywords: 'inglés para Rappi, inglés para Uber, inglés domiciliarios, inglés conductores Colombia, recursos gratis inglés, aprender inglés trabajo',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hablas',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://hablas.co/',
    siteName: 'Hablas',
    title: 'Hablas - Aprende Inglés para Trabajo',
    description: 'Recursos gratuitos de inglés para conductores y domiciliarios en Colombia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hablas - Aprende Inglés para Trabajo',
    description: 'Recursos gratuitos de inglés para conductores y domiciliarios en Colombia',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#25D366',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-CO">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <ErrorBoundary>
          <Providers>
            <a href="#main-content" className="skip-to-content">
              Saltar al contenido principal
            </a>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}