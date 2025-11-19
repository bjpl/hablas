export default function PerfilPage() {
  return (
    <main className="min-h-screen p-4 mb-bottom-nav" id="main-content">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Mi Perfil</h1>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg mb-6">
          <p className="text-lg text-gray-700 mb-4">
            Esta sección está en construcción. Pronto podrás ver tu progreso y personalizar tu experiencia.
          </p>
          <p className="text-gray-600">
            Funciones planeadas:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-gray-600">
            <li>Seguimiento de progreso de aprendizaje</li>
            <li>Recursos guardados y favoritos</li>
            <li>Estadísticas de uso</li>
            <li>Logros y certificados</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
