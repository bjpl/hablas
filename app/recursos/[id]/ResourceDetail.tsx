'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { resources } from '@/data/resources'
import ReactMarkdown from 'react-markdown'

export default function ResourceDetail({ id }: { id: string }) {
  const router = useRouter()
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const resourceId = parseInt(id)
  const resource = resources.find(r => r.id === resourceId)

  useEffect(() => {
    if (!resource) {
      setError('Recurso no encontrado')
      setLoading(false)
      return
    }

    // Fetch the content
    fetch(resource.downloadUrl)
      .then(response => {
        if (!response.ok) throw new Error('Error loading content')
        return response.text()
      })
      .then(text => {
        setContent(text)
        setLoading(false)
      })
      .catch(err => {
        setError('No se pudo cargar el contenido')
        setLoading(false)
        console.error('Error loading resource:', err)
      })
  }, [resource])

  if (!resource) {
    return (
      <main className="min-h-screen p-4 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Recurso no encontrado</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-opacity-90"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    )
  }

  const typeIcons = {
    pdf: '📄',
    audio: '🎧',
    image: '🖼️',
    video: '🎥'
  }

  const levelLabels = {
    basico: 'Básico',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado'
  }

  const categoryLabels = {
    all: 'Todos',
    repartidor: 'Repartidor',
    conductor: 'Conductor'
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-accent-blue hover:text-blue-700 font-medium"
            aria-label="Volver al inicio"
          >
            ← Volver
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold line-clamp-1">{resource.title}</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Resource metadata card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-4xl">{typeIcons[resource.type]}</span>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{resource.title}</h2>
              <p className="text-gray-600 mb-4">{resource.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                  {levelLabels[resource.level]}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                  {categoryLabels[resource.category]}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {resource.size}
                </span>
                {resource.offline && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    📱 Disponible offline
                  </span>
                )}
              </div>

              {/* Tags */}
              {resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Download button */}
          <a
            href={resource.downloadUrl}
            download
            className="inline-block w-full sm:w-auto px-6 py-3 bg-accent-green text-white text-center rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            📥 Descargar recurso
          </a>
        </div>

        {/* Content display */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
              <p className="mt-4 text-gray-600">Cargando contenido...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-red-600">
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-2">Intenta descargar el recurso directamente</p>
            </div>
          )}

          {!loading && !error && content && (
            <div className="prose prose-sm sm:prose max-w-none">
              {resource.type === 'audio' ? (
                // Audio content: display as plain text with formatting
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {content}
                </pre>
              ) : (
                // Markdown content
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-bold mt-4 mb-2 text-gray-800">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 text-gray-700 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 space-y-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 space-y-2">
                        {children}
                      </ol>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto mb-4 border border-gray-200">
                        {children}
                      </pre>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {children}
                      </code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-accent-blue pl-4 italic my-4 text-gray-700">
                        {children}
                      </blockquote>
                    ),
                    hr: () => (
                      <hr className="my-8 border-gray-300" />
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full divide-y divide-gray-200">
                          {children}
                        </table>
                      </div>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              )}
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            ← Volver a recursos
          </button>

          {/* Next/Previous resource navigation */}
          <div className="flex gap-2">
            {resourceId > 1 && (
              <button
                onClick={() => router.push(`/recursos/${resourceId - 1}`)}
                className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                ← Anterior
              </button>
            )}
            {resourceId < resources.length && (
              <button
                onClick={() => router.push(`/recursos/${resourceId + 1}`)}
                className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Siguiente →
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
