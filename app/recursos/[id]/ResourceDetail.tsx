'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { resources } from '@/data/resources'
import ReactMarkdown from 'react-markdown'
import AudioPlayer from '@/components/AudioPlayer'

// Types for JSON content structures
interface VocabularyItem {
  word: string
  pronunciation: string
  translation: string
  context?: string
  example?: string
}

interface CulturalNoteData {
  title: string
  content: string
  importance: 'high' | 'medium' | 'low'
  region?: string
}

interface PracticalScenarioData {
  title: string
  situation: string
  phrases: Array<{ spanish: string; pronunciation: string; english: string }>
  tips?: string[]
}

interface PhraseData {
  spanish: string
  pronunciation: string
  english: string
  formality?: 'formal' | 'informal' | 'neutral'
  context?: string
}

interface JsonResourceContent {
  type: 'vocabulary' | 'cultural' | 'scenarios' | 'phrases'
  vocabulary?: VocabularyItem[]
  culturalNotes?: CulturalNoteData[]
  scenarios?: PracticalScenarioData[]
  phrases?: PhraseData[]
}

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

  // Component: VocabularyCard - Simple text display
  const VocabularyCard = ({ item }: { item: VocabularyItem }) => (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2" lang="es">{item.word}</h3>
      <p className="text-gray-600 italic mb-1">
        {item.pronunciation}
      </p>
      <p className="text-lg text-gray-800 mb-2" lang="en">
        {item.translation}
      </p>
      {item.context && (
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-semibold">Contexto:</span> {item.context}
        </p>
      )}
      {item.example && (
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Ejemplo:</span> {item.example}
        </p>
      )}
    </div>
  )

  // Component: CulturalNote - Simple text display
  const CulturalNote = ({ note }: { note: CulturalNoteData }) => {
    const importanceLabels = {
      high: 'Alta importancia',
      medium: 'Importancia media',
      low: 'Información adicional'
    }

    return (
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {note.title}
        </h3>
        <div className="text-sm text-gray-600 mb-2">
          {importanceLabels[note.importance]}
          {note.region && ` • ${note.region}`}
        </div>
        <p className="text-gray-700 leading-relaxed">{note.content}</p>
      </div>
    )
  }

  // Component: PracticalScenario - Simple text display
  const PracticalScenario = ({ scenario }: { scenario: PracticalScenarioData }) => {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{scenario.title}</h3>
        <p className="text-gray-700 italic mb-4">{scenario.situation}</p>

        <div className="space-y-3">
          {scenario.phrases.map((phrase, index) => (
            <div key={index} className="mb-3">
              <p className="text-lg font-semibold text-gray-900" lang="es">
                {phrase.spanish}
              </p>
              <p className="text-sm text-gray-600 italic">{phrase.pronunciation}</p>
              <p className="text-sm text-gray-700" lang="en">{phrase.english}</p>
            </div>
          ))}

          {scenario.tips && scenario.tips.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold text-gray-900 mb-2">
                Consejos prácticos
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {scenario.tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Component: PhraseList - Simple text display
  const PhraseList = ({ phrase }: { phrase: PhraseData }) => {
    const formalityLabels = {
      formal: 'Formal',
      informal: 'Informal',
      neutral: 'Neutral'
    }

    return (
      <div className="mb-4">
        <div className="mb-2">
          <p className="text-lg font-bold text-gray-900" lang="es">
            {phrase.spanish}
            {phrase.formality && (
              <span className="ml-2 text-xs font-normal text-gray-600">
                ({formalityLabels[phrase.formality]})
              </span>
            )}
          </p>
          <p className="text-sm text-gray-600 italic">{phrase.pronunciation}</p>
        </div>
        <p className="text-base text-gray-800" lang="en">
          {phrase.english}
        </p>
        {phrase.context && (
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-semibold">Uso:</span> {phrase.context}
          </p>
        )}
      </div>
    )
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
        {/* Resource metadata card */}
        <div className="bg-white rounded shadow-md p-6 sm:p-8 mb-8 border border-gray-200">
          <div className="flex items-start gap-6 mb-6">
            <span className="text-5xl transition-transform hover:scale-110 duration-200">{typeIcons[resource.type]}</span>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-3 text-gray-900 leading-tight">{resource.title}</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">{resource.description}</p>

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
                          <table className="min-w-full divide-y divide-gray-200">
                            {children}
                          </table>
                        </div>
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

// Bilingual Dialogue Formatter Component for Audio Scripts
function BilingualDialogueFormatter({ content }: { content: string }) {
  const [showTechSpecs, setShowTechSpecs] = useState(false);
  const [showLearningOutcomes, setShowLearningOutcomes] = useState(false);

  const lines = content.split('\n');
  const formatted = [];
  let lastDialogue = { text: '', language: '', index: -1 };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      formatted.push(<div key={i} className="h-3" />);
      continue;
    }

    // Main section headers (## with timestamps)
    if (line.startsWith('##')) {
      const headerText = line.replace(/^##\s*/, '').replace(/\[.*?\]/g, '').trim();
      formatted.push(
        <h3 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-4 border-b-2 border-blue-600 pb-2 flex items-center gap-2">
          <span className="text-blue-600">🎯</span>
          {headerText}
        </h3>
      );
      continue;
    }

    // Subsection headers (### with timestamps or phrases)
    if (line.startsWith('###')) {
      const headerText = line.replace(/^###\s*/, '').replace(/\[.*?\]/g, '').trim();
      formatted.push(
        <h4 key={i} className="text-lg font-semibold text-blue-700 mt-6 mb-3 border-l-4 border-blue-400 pl-4">
          {headerText}
        </h4>
      );
      continue;
    }

    // Metadata (Duration, Target, Language, etc.)
    if (line.match(/^\*\*(Total Duration|Target|Language|Level|Category)\*\*/)) {
      const parts = line.split(':');
      formatted.push(
        <div key={i} className="text-sm bg-blue-50 text-blue-800 px-4 py-2 rounded border-l-4 border-blue-500 mb-2 flex gap-2">
          <span className="font-bold">{parts[0].replace(/\*\*/g, '')}:</span>
          {parts[1] && <span className="font-normal">{parts[1]}</span>}
        </div>
      );
      continue;
    }

    // Production directions (Speaker, Tone, Pause) - de-emphasized
    if (line.match(/^\*\*\[(Speaker|Tone|Pause|PAUSE|Sound effect):/i)) {
      formatted.push(
        <div key={i} className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded border-l-2 border-gray-300 my-2 font-mono">
          <span className="opacity-60">{line.replace(/\*\*/g, '')}</span>
        </div>
      );
      continue;
    }

    // Dialogue detection (quoted text)
    if (line.startsWith('"') && line.endsWith('"')) {
      const text = line.slice(1, -1);

      // Check context from previous lines (look for Speaker markers)
      let speakerContext = 'unknown';
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        const prevLine = lines[j].trim();
        if (prevLine.includes('[Speaker: English')) {
          speakerContext = 'english';
          break;
        }
        if (prevLine.includes('[Speaker: Spanish')) {
          speakerContext = 'spanish';
          break;
        }
      }

      // Declare language flags
      let isEnglish = false;
      let isSpanish = false;

      // Priority 1: Use speaker context if available (most reliable)
      if (speakerContext === 'english') {
        isEnglish = true;
        isSpanish = false;
      } else if (speakerContext === 'spanish') {
        isEnglish = false;
        isSpanish = true;
      } else {
        // Priority 2: Strong Spanish indicators (characters and common words)
        const hasSpanishChars = /[¿¡áéíóúüñÁÉÍÓÚÜÑ]/.test(text);
        const hasSpanishWords = /\b(hola|tengo|su|entrega|está?|dónde|qué|cómo|puedo|favor|gracias|por|para|cuando|llegas|cliente|pedido|confirmar|siempre|evita|protege|frase|número|uno|dos|tres)\b/i.test(text);

        // Priority 3: English indicators (only if NOT Spanish)
        const hasEnglishWords = /\b(delivery|order|customer|address|thank|sorry|problem|wait|here|there|where|what|how|michael|your|from)\b/i.test(text);

        // Determine language (Spanish takes priority)
        isSpanish = hasSpanishChars || hasSpanishWords;
        isEnglish = !isSpanish && hasEnglishWords;
      }

      // Check if this is a duplicate of the last dialogue (repeated for learning)
      const isDuplicate = lastDialogue.text === text && i - lastDialogue.index < 10;

      if (isEnglish) {
        if (!isDuplicate) {
          formatted.push(
            <div key={i} className="my-4 p-5 rounded-lg border-l-4 border-blue-600 bg-gradient-to-r from-blue-50 to-blue-25 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">🇺🇸</span>
                <div className="flex-1">
                  <p className="text-lg font-bold text-blue-900 leading-relaxed" lang="en">
                    {text}
                  </p>
                  <div className="text-xs text-blue-600 mt-2 font-semibold uppercase tracking-wide flex items-center gap-2">
                    English / Inglés
                    <span className="bg-blue-200 px-2 py-0.5 rounded text-blue-900">🔁 Se repite 2x en audio</span>
                  </div>
                </div>
              </div>
            </div>
          );
          lastDialogue = { text, language: 'english', index: i };
        }
      } else if (isSpanish) {
        if (!isDuplicate) {
          formatted.push(
            <div key={i} className="my-4 p-5 rounded-lg border-l-4 border-green-600 bg-gradient-to-r from-green-50 to-green-25 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">🇪🇸</span>
                <div className="flex-1">
                  <p className="text-lg font-bold text-green-900 leading-relaxed" lang="es">
                    {text}
                  </p>
                  <div className="text-xs text-green-600 mt-2 font-semibold uppercase tracking-wide">
                    Español / Spanish
                  </div>
                </div>
              </div>
            </div>
          );
          lastDialogue = { text, language: 'spanish', index: i };
        }
      } else {
        // Neutral/unknown language
        if (!isDuplicate) {
          formatted.push(
            <div key={i} className="my-4 p-4 rounded-lg border-l-4 border-gray-400 bg-gray-50">
              <p className="text-base text-gray-800 leading-relaxed">
                {text}
              </p>
            </div>
          );
          lastDialogue = { text, language: 'neutral', index: i };
        }
      }
      continue;
    }

    // Dividers
    if (line === '---') {
      formatted.push(<hr key={i} className="my-6 border-t-2 border-gray-200" />);
      continue;
    }

    // Regular paragraphs (instructions, explanations)
    if (line.length > 0) {
      formatted.push(
        <p key={i} className="text-gray-700 leading-relaxed my-2 text-base">
          {line.replace(/\*\*/g, '')}
        </p>
      );
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Color guide */}
      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg shadow-sm">
        <p className="text-sm text-yellow-900 flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span className="font-bold">Guía de colores:</span>{' '}
          <span className="text-blue-700 font-semibold">Azul = Inglés</span>
          <span className="text-gray-400">|</span>
          <span className="text-green-700 font-semibold">Verde = Español</span>
        </p>
      </div>

      {/* Technical Specifications (Collapsible) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <button
          onClick={() => setShowTechSpecs(!showTechSpecs)}
          className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎙️</span>
            <span className="font-bold text-gray-900 text-lg">Especificaciones Técnicas del Audio</span>
          </div>
          <svg
            className={`w-6 h-6 text-gray-600 transition-transform duration-200 ${showTechSpecs ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showTechSpecs && (
          <div className="p-6 bg-white space-y-4 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎤</span>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Narrador en Español</h4>
                  <p className="text-sm text-gray-700">Acento latinoamericano neutral (Colombiano o Mexicano preferido)</p>
                  <p className="text-xs text-gray-500 mt-1">Tono: Cálido, alentador • Edad: 30-45 años</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🇺🇸</span>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Hablante Nativo en Inglés</h4>
                  <p className="text-sm text-gray-700">Acento norteamericano general (General American)</p>
                  <p className="text-xs text-gray-500 mt-1">Tono: Amigable profesional • Enunciación clara</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>⚙️</span> Especificaciones de Producción
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500 mb-1">Frecuencia</div>
                  <div className="font-semibold text-gray-900">44.1kHz</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500 mb-1">Formato</div>
                  <div className="font-semibold text-gray-900">MP3, 128kbps</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500 mb-1">Duración</div>
                  <div className="font-semibold text-gray-900">~7:15 min</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500 mb-1">Tamaño</div>
                  <div className="font-semibold text-gray-900">~7MB</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">✓ Optimizado para móviles</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">✓ Uso offline</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">✓ Control de velocidad</span>
                <span className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">✓ Pausas para aprendizaje</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Learning Outcomes (Collapsible) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <button
          onClick={() => setShowLearningOutcomes(!showLearningOutcomes)}
          className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <span className="font-bold text-gray-900 text-lg">¿Qué Aprenderás?</span>
          </div>
          <svg
            className={`w-6 h-6 text-gray-600 transition-transform duration-200 ${showLearningOutcomes ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showLearningOutcomes && (
          <div className="p-6 bg-white animate-slide-down">
            <p className="text-sm text-gray-600 mb-4 italic">Al completar este audio, los repartidores podrán:</p>
            <div className="space-y-3">
              {[
                { icon: '👋', text: 'Saludar clientes profesionalmente en inglés' },
                { icon: '✓', text: 'Confirmar identidad del cliente y detalles de entrega' },
                { icon: '🏢', text: 'Manejar problemas de acceso cortésmente' },
                { icon: '📦', text: 'Completar entregas sin contacto con comunicación apropiada' },
                { icon: '🙏', text: 'Agradecer a clientes apropiadamente' },
                { icon: '💪', text: 'Aumentar confianza en interacciones con clientes' },
                { icon: '💰', text: 'Mejorar potencial de propinas usando inglés profesional' },
              ].map((outcome, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors">
                  <span className="text-2xl flex-shrink-0">{outcome.icon}</span>
                  <p className="text-gray-800 font-medium">{outcome.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-blue-900">💡 Consejo:</span> Escucha el audio completo primero. Luego, repítelo mientras manejas o esperas pedidos. La repetición es la clave del éxito.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {formatted}
    </div>
  );
}
