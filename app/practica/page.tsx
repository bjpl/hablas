import Link from 'next/link'
import { Mic, BookOpen, Users, ArrowRight } from 'lucide-react'

export default function PracticaPage() {
  return (
    <main className="min-h-screen p-4 mb-bottom-nav bg-gradient-to-br from-white via-blue-50 to-green-50" id="main-content">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Coming Soon Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 border-2 border-yellow-400 shadow-md">
            <span className="text-yellow-600" aria-hidden="true">🚧</span>
            <span className="text-sm font-bold text-yellow-800">
              PRÓXIMAMENTE
            </span>
          </span>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            Sección de Práctica
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Estamos construyendo ejercicios interactivos para que practiques tu inglés
          </p>
        </div>

        {/* Coming Soon Info Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
            <span className="text-blue-500">⏳</span>
            ¿Qué estamos preparando?
          </h2>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <span className="text-green-500 text-xl flex-shrink-0">✓</span>
              <span className="text-gray-700">Ejercicios interactivos de pronunciación con retroalimentación en tiempo real</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 text-xl flex-shrink-0">✓</span>
              <span className="text-gray-700">Simulaciones de conversaciones reales con clientes</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 text-xl flex-shrink-0">✓</span>
              <span className="text-gray-700">Quizzes adaptativos según tu nivel de inglés</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 text-xl flex-shrink-0">✓</span>
              <span className="text-gray-700">Sistema de progreso y logros para mantener tu motivación</span>
            </li>
          </ul>
        </div>

        {/* Alternative Options */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
            Mientras tanto, puedes:
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Resources Card */}
            <Link href="/">
              <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-blue-400 cursor-pointer group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Explorar Recursos</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Accede a frases útiles, audios y materiales de aprendizaje
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                  <span>Ver recursos</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>

            {/* Community Card */}
            <Link href="/comunidad">
              <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-green-400 cursor-pointer group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Únete a la Comunidad</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Practica con otros conductores y repartidores en WhatsApp
                </p>
                <div className="flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
                  <span>Ver grupos</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Notification Request */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">¿Quieres ser el primero en saber?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Únete a nuestros grupos de WhatsApp para recibir notificaciones cuando lancemos la sección de práctica
          </p>
          <Link href="/comunidad">
            <button className="bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl active:scale-95">
              Unirme Ahora
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
