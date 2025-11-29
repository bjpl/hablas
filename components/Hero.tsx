'use client'

import { ArrowRight, MessageCircle, TrendingUp } from 'lucide-react'

interface StatCardProps {
  value: string
  label: string
  icon: string
  color: 'rappi' | 'green' | 'blue' | 'purple'
}

function StatCard({ value, label, icon, color }: StatCardProps) {
  const colorClasses = {
    rappi: 'bg-gradient-to-br from-rappi/10 to-rappi/5 border-rappi/20 text-rappi',
    green: 'bg-gradient-to-br from-green-600/10 to-green-600/5 border-green-600/20 text-green-600',
    blue: 'bg-gradient-to-br from-blue-600/10 to-blue-600/5 border-blue-600/20 text-blue-600',
    purple: 'bg-gradient-to-br from-purple-600/10 to-purple-600/5 border-purple-600/20 text-purple-600',
  }

  return (
    <div
      className={`${colorClasses[color]} rounded-xl p-5 border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
      role="listitem"
    >
      <div className="text-3xl mb-2" aria-hidden="true">{icon}</div>
      <div className={`text-2xl md:text-3xl font-bold mb-1 ${color === 'rappi' ? 'text-rappi' : color === 'green' ? 'text-green-600' : color === 'blue' ? 'text-blue-600' : 'text-purple-600'}`}>
        {value}
      </div>
      <div className="text-xs md:text-sm text-gray-700 font-medium">{label}</div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-green-50 px-4 py-16 md:py-24" aria-labelledby="hero-heading">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-whatsapp/5 rounded-full blur-3xl -z-10" aria-hidden="true"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-blue/5 rounded-full blur-3xl -z-10" aria-hidden="true"></div>

      <div className="max-w-5xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-6 animate-fade-in">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-gray-200">
            <span className="text-green-600" aria-hidden="true">✓</span>
            <span className="text-sm font-medium text-gray-700">
              100% Gratis • Sin datos • Offline
            </span>
          </span>
        </div>

        {/* Main headline with gradient */}
        <h1
          id="hero-heading"
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-center bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent leading-normal pb-1 animate-fade-in"
        >
          Aprende Inglés Para Tu Trabajo
        </h1>

        {/* Subtitle with emphasis */}
        <p className="text-xl sm:text-2xl text-center mb-8 text-gray-700 max-w-3xl mx-auto animate-fade-in">
          Recursos gratuitos diseñados para{' '}
          <span className="font-bold text-rappi">repartidores</span> y{' '}
          <span className="font-bold text-uber">conductores</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
          <a href="#recursos" className="btn-primary group">
            Explorar Recursos
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </a>
          <a href="#community" className="btn-secondary">
            <MessageCircle className="w-5 h-5" />
            Únete al Grupo
          </a>
        </div>

        {/* Statistics with enhanced cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 animate-fade-in" role="list" aria-label="Estadísticas de la plataforma">
          <StatCard value="500+" label="Frases útiles" icon="💬" color="rappi" />
          <StatCard value="24/7" label="Grupos WhatsApp" icon="📱" color="green" />
          <StatCard value="100%" label="Gratis" icon="🎁" color="blue" />
          <StatCard value="Offline" label="Sin datos" icon="📶" color="purple" />
        </div>

        {/* Value proposition */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border-l-4 border-accent-blue p-6 max-w-3xl mx-auto shadow-lg animate-fade-in">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-blue" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                ¿Por qué inglés?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Los clientes extranjeros <strong>pagan mejor</strong>, dan{' '}
                <strong>mejores propinas</strong> y califican mejor cuando puedes
                comunicarte en inglés básico. Mejora tus ingresos hoy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}