'use client'

import { useRequireAuth } from '@/lib/auth-client'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { session, status } = useRequireAuth()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Hablas.co - Admin Panel
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bienvenido al Panel de Administración
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
                <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-green-600 truncate">
                      Total Recursos
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      34
                    </dd>
                  </div>
                </div>

                <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-blue-600 truncate">
                      Categorías
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      3
                    </dd>
                  </div>
                </div>

                <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-purple-600 truncate">
                      Idiomas
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      2
                    </dd>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Acciones Rápidas
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/recursos"
                    className="block px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                  >
                    <div className="flex items-center">
                      <span className="text-green-600 mr-3">📚</span>
                      <div>
                        <p className="font-medium text-gray-900">Ver Recursos</p>
                        <p className="text-sm text-gray-600">Explorar biblioteca de aprendizaje</p>
                      </div>
                    </div>
                  </Link>

                  <div className="block px-4 py-3 bg-gray-50 rounded-lg opacity-50 cursor-not-allowed">
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-3">📊</span>
                      <div>
                        <p className="font-medium text-gray-900">Analytics</p>
                        <p className="text-sm text-gray-600">Próximamente - Estadísticas de uso</p>
                      </div>
                    </div>
                  </div>

                  <div className="block px-4 py-3 bg-gray-50 rounded-lg opacity-50 cursor-not-allowed">
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-3">⚙️</span>
                      <div>
                        <p className="font-medium text-gray-900">Configuración</p>
                        <p className="text-sm text-gray-600">Próximamente - Ajustes del sistema</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Este panel de administración está en desarrollo activo.
                  Nuevas funciones se agregarán en futuras actualizaciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
