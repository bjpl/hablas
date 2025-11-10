'use client'

export default function Hero() {
  return (
    <section className="bg-white px-4 py-12" aria-labelledby="hero-heading">
      <div className="max-w-4xl mx-auto text-center">
        <h1 id="hero-heading" className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
          Aprende Inglés Para Tu Trabajo
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-6">
          Recursos gratuitos para conductores y domiciliarios
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8" role="list" aria-label="Estadísticas de la plataforma">
          <div className="bg-white rounded-lg p-4 shadow-sm" role="listitem">
            <div className="text-2xl font-bold text-rappi" aria-label="Más de 500 frases útiles">500+</div>
            <div className="text-sm text-gray-700">Frases útiles</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm" role="listitem">
            <div className="text-2xl font-bold text-green-600" aria-label="Grupos de WhatsApp disponibles 24 horas, 7 días a la semana">24/7</div>
            <div className="text-sm text-gray-700">Grupos WhatsApp</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm" role="listitem">
            <div className="text-2xl font-bold text-blue-600" aria-label="100 por ciento gratis">100%</div>
            <div className="text-sm text-gray-700">Gratis</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm" role="listitem">
            <div className="text-2xl font-bold text-purple-600" aria-label="Funciona sin conexión">Offline</div>
            <div className="text-sm text-gray-700">Sin datos</div>
          </div>
        </div>

        <div className="bg-gray-50 border-l-4 border-gray-400 p-4 text-left" role="note" aria-label="Beneficios del inglés">
          <p className="text-sm text-gray-700">
            <strong>¿Por qué inglés?</strong> Los clientes extranjeros pagan mejor,
            dan mejores propinas y califican mejor cuando puedes comunicarte en inglés básico.
          </p>
        </div>
      </div>
    </section>
  )
}