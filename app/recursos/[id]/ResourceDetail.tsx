'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { resources } from '@/data/resources'
import ReactMarkdown from 'react-markdown'
import AudioPlayer from '@/components/AudioPlayer'
import BilingualDialogueFormatter from '@/components/resource-renderers/BilingualDialogueFormatter'
import VocabularyCard from '@/components/resource-renderers/VocabularyCard'
import CulturalNote from '@/components/resource-renderers/CulturalNote'
import PracticalScenario from '@/components/resource-renderers/PracticalScenario'
import PhraseList from '@/components/resource-renderers/PhraseList'
import type { JsonResourceContent } from '@/lib/types/resource-content'

export default function ResourceDetail({ id, initialContent = '' }: { id: string; initialContent?: string }) {
  const router = useRouter()
  const [content, setContent] = useState<string>(initialContent)
  const [jsonContent, setJsonContent] = useState<JsonResourceContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioMetadata, setAudioMetadata] = useState<any>(null)
  const [downloadingResource, setDownloadingResource] = useState(false)
  const [downloadingAudio, setDownloadingAudio] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)

  const resourceId = parseInt(id)
  const resource = resources.find(r => r.id === resourceId)

  // BasePath for GitHub Pages
  const basePath = process.env.NODE_ENV === 'production' ? '/hablas' : ''

  useEffect(() => {
    if (!resource) {
      setError('Recurso no encontrado')
      return
    }

    // If we have initial content from server, parse it immediately
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent)
        if (parsed && typeof parsed === 'object' && parsed.type) {
          setJsonContent(parsed)
        } else {
          setContent(initialContent)
        }
      } catch {
        setContent(initialContent)
      }

      // Extract audio metadata if this is an audio resource
      if (resource.type === 'audio') {
        extractAudioMetadata(initialContent)
      }
    }

    // Load audio metadata if this is an audio resource
    if (resource.type === 'audio') {
      const basePath = process.env.NODE_ENV === 'production' ? '/hablas' : ''
      fetch(`${basePath}/audio/metadata.json`)
        .then(res => res.json())
        .then(data => {
          if (data.resources && data.resources[resourceId]) {
            setAudioMetadata(data.resources[resourceId])
          }
        })
        .catch(err => console.log('Audio metadata not available'))
    }
  }, [resource, initialContent])

  // Extract audio metadata from script content
  const extractAudioMetadata = (scriptContent: string) => {
    const metadata: any = {}

    // Extract duration
    const durationMatch = scriptContent.match(/\*\*Total Duration\*\*:\s*([^\n]+)/i)
    if (durationMatch) metadata.duration = durationMatch[1].trim()

    // Extract voice info
    const narratorMatch = scriptContent.match(/\*\*Spanish Narrator\*\*:\s*([^\n]+)/i)
    if (narratorMatch) metadata.narrator = narratorMatch[1].split(',')[0].trim()

    // Extract accent info
    const accentMatch = scriptContent.match(/accent.*?\(([^)]+)\)/i)
    if (accentMatch) metadata.accent = accentMatch[1].trim()

    // Default values
    if (!metadata.duration) metadata.duration = 'Duración variable'
    if (!metadata.narrator) metadata.narrator = 'Voz profesional bilingüe'
    if (!metadata.accent) metadata.accent = 'Latinoamericano neutral'

    setAudioMetadata(metadata)
  }

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
      <header className="bg-white shadow-md sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-accent-blue hover:text-blue-700 font-semibold transition-colors duration-200 flex items-center gap-2"
            aria-label="Volver al inicio"
          >
            <span className="text-xl">←</span> Volver
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold line-clamp-1 text-gray-900">{resource.title}</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Enhanced Resource metadata card */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100">
          <div className="flex items-start gap-6 mb-6">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg transform hover:rotate-6 transition-transform duration-300">
              {typeIcons[resource.type]}
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-700 bg-clip-text text-transparent leading-tight">{resource.title}</h2>
              <p className="text-gray-700 mb-6 text-lg leading-relaxed font-medium">{resource.description}</p>

              <div className="flex flex-wrap gap-3 mb-5">
                <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm rounded font-semibold">
                  {levelLabels[resource.level]}
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-800 text-sm rounded font-semibold">
                  {categoryLabels[resource.category]}
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded font-medium">
                  {resource.size}
                </span>
                {resource.offline && (
                  <span className="px-4 py-2 bg-purple-100 text-purple-800 text-sm rounded font-semibold">
                    Disponible offline
                  </span>
                )}
              </div>

              {/* Tags */}
              {resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-lg border border-gray-200 font-medium hover:bg-gray-100 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Download buttons */}
          <div className="space-y-3">
            {/* Success message */}
            {downloadSuccess && (
              <div className="p-3 bg-green-100 border-l-4 border-green-500 rounded flex items-center gap-2 animate-fade-in">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 font-medium text-sm">{downloadSuccess}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Resource content download */}
              <button
                onClick={async () => {
                  setDownloadingResource(true);
                  setDownloadSuccess(null);
                  try {
                    // Fetch the resource content first, then download
                    const resourceUrl = `${basePath}${resource.downloadUrl}`;
                    const response = await fetch(resourceUrl);
                    if (!response.ok) throw new Error('Resource not found');
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Hablas_${resource.id}_${resource.title.replace(/[^a-z0-9]/gi, '_').substring(0, 40)}.md`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    setDownloadSuccess('✓ Recurso descargado exitosamente');
                    setTimeout(() => setDownloadSuccess(null), 3000);
                  } catch (err) {
                    console.error('Download failed:', err);
                    setDownloadSuccess('❌ Error al descargar - intenta de nuevo');
                    setTimeout(() => setDownloadSuccess(null), 3000);
                  } finally {
                    setDownloadingResource(false);
                  }
                }}
                disabled={downloadingResource}
                className={`inline-flex items-center justify-center gap-3 flex-1 px-8 py-4 text-white text-center rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                  downloadingResource
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-accent-green hover:bg-green-700 transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {downloadingResource ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Descargando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Descargar Recurso</span>
                    <span className="text-xs opacity-80">({resource.size})</span>
                  </>
                )}
              </button>

              {/* Audio download if available */}
              {resource.audioUrl && (
                <button
                  onClick={async () => {
                    if (!resource.audioUrl) return;
                    setDownloadingAudio(true);
                    setDownloadSuccess(null);
                    try {
                      // Fetch and download audio with basePath
                      const audioUrl = `${basePath}${resource.audioUrl}`;
                      const response = await fetch(audioUrl);
                      if (!response.ok) throw new Error('Audio not found');
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `Hablas_${resource.id}_Audio.mp3`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                      setDownloadSuccess('✓ Audio descargado exitosamente');
                      setTimeout(() => setDownloadSuccess(null), 3000);
                    } catch (err) {
                      console.error('Audio download failed:', err);
                      setDownloadSuccess('❌ Error al descargar audio');
                      setTimeout(() => setDownloadSuccess(null), 3000);
                    } finally {
                      setDownloadingAudio(false);
                    }
                  }}
                  disabled={downloadingAudio}
                  className={`inline-flex items-center justify-center gap-3 flex-1 px-8 py-4 text-white text-center rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                    downloadingAudio
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-accent-blue hover:bg-blue-700 transform hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {downloadingAudio ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Descargando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      <span>Descargar Audio</span>
                      <span className="text-xs opacity-80">(MP3)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Audio Player - Show above content for audio resources */}
        {!loading && !error && resource.audioUrl && (
          <div className="mb-8">
            <div className="bg-white rounded shadow-md p-6 border border-gray-200">
              <AudioPlayer
                title={resource.title}
                audioUrl={`${basePath}${resource.audioUrl}`}
                metadata={audioMetadata}
                resourceId={resource.id}
                enhanced={true}
              />
            </div>
          </div>
        )}

        {/* Content display */}
        <div className="bg-white rounded shadow-md p-6 sm:p-8 border border-gray-200">
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-accent-blue"></div>
              <p className="mt-6 text-gray-600 font-medium text-lg">Cargando contenido...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <p className="font-bold text-red-600 text-xl mb-2">{error}</p>
              <p className="text-sm text-gray-600">Intenta descargar el recurso directamente</p>
            </div>
          )}

          {!loading && !error && (jsonContent || content) && (
            <div className="prose prose-sm sm:prose max-w-none">
              {jsonContent ? (
                // Render JSON structured content
                <div className="space-y-6">
                  {/* Vocabulary Section */}
                  {jsonContent.vocabulary && jsonContent.vocabulary.length > 0 && (
                    <section aria-labelledby="vocabulary-section">
                      <h2 id="vocabulary-section" className="text-2xl font-bold mb-4 text-gray-900">
                        Vocabulario
                      </h2>
                      <div className="space-y-4">
                        {jsonContent.vocabulary.map((item, index) => (
                          <VocabularyCard key={index} item={item} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Cultural Notes Section */}
                  {jsonContent.culturalNotes && jsonContent.culturalNotes.length > 0 && (
                    <section aria-labelledby="cultural-section" className="mt-8">
                      <h2 id="cultural-section" className="text-2xl font-bold mb-4 text-gray-900">
                        Notas Culturales
                      </h2>
                      <div className="space-y-4">
                        {jsonContent.culturalNotes.map((note, index) => (
                          <CulturalNote key={index} note={note} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Practical Scenarios Section */}
                  {jsonContent.scenarios && jsonContent.scenarios.length > 0 && (
                    <section aria-labelledby="scenarios-section" className="mt-8">
                      <h2 id="scenarios-section" className="text-2xl font-bold mb-4 text-gray-900">
                        Escenarios Prácticos
                      </h2>
                      <div className="space-y-6">
                        {jsonContent.scenarios.map((scenario, index) => (
                          <PracticalScenario key={index} scenario={scenario} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Phrases Section */}
                  {jsonContent.phrases && jsonContent.phrases.length > 0 && (
                    <section aria-labelledby="phrases-section" className="mt-8">
                      <h2 id="phrases-section" className="text-2xl font-bold mb-4 text-gray-900">
                        Frases Útiles
                      </h2>
                      <div className="space-y-3">
                        {jsonContent.phrases.map((phrase, index) => (
                          <PhraseList key={index} phrase={phrase} />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              ) : resource.type === 'audio' ? (
                // Audio content: bilingual dialogue formatter
                <BilingualDialogueFormatter content={content} />
              ) : (
                // Render all content as clean markdown (boxes already cleaned server-side)
                <div className="resource-content">
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
                      ol: ({ children, ...props }) => (
                        <ol {...props} className="mb-4 space-y-2 pl-6" style={{ listStyleType: 'decimal', listStylePosition: 'outside' }}>
                          {children}
                        </ol>
                      ),
                      li: ({ children, ...props }) => (
                        <li {...props} className="ml-0 pl-2 text-gray-700">
                          {children}
                        </li>
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
                          <table className="min-w-full border-collapse border border-gray-300">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-gray-50">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-gray-300 px-4 py-2">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 transition-colors"
          >
            ← Volver a recursos
          </button>

          {/* Next/Previous resource navigation */}
          <div className="flex gap-3 w-full sm:w-auto">
            {resourceId > 1 && (
              <button
                onClick={() => router.push(`/recursos/${resourceId - 1}`)}
                className="flex-1 sm:flex-none px-6 py-3 bg-accent-blue text-white rounded font-semibold hover:bg-blue-700 transition-colors"
              >
                ← Anterior
              </button>
            )}
            {resourceId < resources.length && (
              <button
                onClick={() => router.push(`/recursos/${resourceId + 1}`)}
                className="flex-1 sm:flex-none px-6 py-3 bg-accent-blue text-white rounded font-semibold hover:bg-blue-700 transition-colors"
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
