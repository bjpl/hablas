export default function ComunidadPage() {
  return (
    <main className="min-h-screen p-4 mb-bottom-nav" id="main-content">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Comunidad</h1>
        <div className="bg-green-50 border-l-4 border-accent-green p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900">Únete a Nuestros Grupos de WhatsApp</h2>
          <p className="text-gray-700 mb-4">
            Practica inglés con otros conductores y repartidores en nuestros grupos activos de WhatsApp.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="font-bold text-lg mb-2">Grupo Principiantes</h3>
            <p className="text-gray-600 mb-4">Para quienes están empezando con el inglés</p>
            <p className="text-sm text-gray-500">523 miembros</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="font-bold text-lg mb-2">Práctica Diaria</h3>
            <p className="text-gray-600 mb-4">Practica con otros conductores y repartidores</p>
            <p className="text-sm text-gray-500">341 miembros</p>
          </div>
        </div>
      </div>
    </main>
  )
}
