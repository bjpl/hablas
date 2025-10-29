'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { resources } from '@/data/resources'
import ReactMarkdown from 'react-markdown'
import AudioPlayer from '@/components/AudioPlayer'
import PhraseCard from '@/components/PhraseCard'

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

export default function ResourceDetail({ id }: { id: string }) {
  const router = useRouter()
  const [content, setContent] = useState<string>('')
  const [jsonContent, setJsonContent] = useState<JsonResourceContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [audioMetadata, setAudioMetadata] = useState<any>(null)

  const resourceId = parseInt(id)
  const resource = resources.find(r => r.id === resourceId)

  useEffect(() => {
    if (!resource) {
      setError('Recurso no encontrado')
      setLoading(false)
      return
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

    // Fetch the content (add basePath for GitHub Pages)
    const basePath = process.env.NODE_ENV === 'production' ? '/hablas' : ''
    fetch(`${basePath}${resource.downloadUrl}`)
      .then(response => {
        if (!response.ok) throw new Error('Error loading content')
        return response.text()
      })
      .then(text => {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(text)
          if (parsed && typeof parsed === 'object' && parsed.type) {
            setJsonContent(parsed)
          } else {
            // Clean box-drawing characters but PRESERVE markdown structure
            const cleaned = text
              .replace(/[─│┌┐└┘├┤┬┴┼╔╗╚╝╠╣╦╩╬═║]/g, '')  // Remove box chars
              .split('\n')
              .map(line => line.trim())                    // Trim each line
              .join('\n')                                  // Keep ALL lines (empty lines = markdown structure!)
            setContent(cleaned)
          }
        } catch {
          // Not JSON, clean box-drawing characters but PRESERVE markdown structure
          const cleaned = text
            .replace(/[─│┌┐└┘├┤┬┴┼╔╗╚╝╠╣╦╩╬═║]/g, '')
            .split('\n')
            .map(line => line.trim())
            .join('\n')                                  // Keep ALL lines (empty lines = markdown structure!)
          setContent(cleaned)
        }

        // Extract audio metadata if this is an audio resource
        if (resource.type === 'audio') {
          extractAudioMetadata(text)
        }

        setLoading(false)
      })
      .catch(err => {
        setError('No se pudo cargar el contenido')
        setLoading(false)
        console.error('Error loading resource:', err)
      })
  }, [resource])

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

  // Function: Parse markdown into structured phrase cards
  const parseMarkdownToPhrases = (text: string): Array<any> => {
    const phrases: Array<any> = []

    // Split by headings or phrase blocks
    const sections = text.split(/\n#{1,3}\s+/).filter(s => s.trim())

    for (const section of sections) {
      const lines = section.split('\n').filter(l => l.trim())

      if (lines.length === 0) continue

      const phraseData: any = {}

      // Extract structured data from markdown patterns
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // English phrase (bold or first line)
        if (line.match(/^\*\*(.+?)\*\*/) || (!phraseData.english && i === 0)) {
          phraseData.english = line.replace(/^\*\*|\*\*$/g, '').trim()
        }
        // Spanish translation (italics or contains common Spanish words)
        else if (line.match(/^\*(.+?)\*/) || line.match(/^[A-ZÁÉÍÓÚÑ]/)) {
          phraseData.spanish = line.replace(/^\*|\*$/g, '').trim()
        }
        // Pronunciation (contains phonetic markers)
        else if (line.match(/\[.+?\]/) || line.toLowerCase().includes('pronunciation')) {
          phraseData.pronunciation = line.replace(/[\[\]]/g, '').replace(/pronunciation:?/gi, '').trim()
        }
        // Context (starts with "Use:" or "Context:")
        else if (line.match(/^(Use|Context|When):/i)) {
          phraseData.context = line.replace(/^(Use|Context|When):?\s*/i, '').trim()
        }
        // Example (starts with "Example:" or contains quotes)
        else if (line.match(/^Example:/i) || line.match(/[""].*[""]/)) {
          phraseData.example = line.replace(/^Example:?\s*/i, '').replace(/[""]/g, '"').trim()
        }
        // Tip (starts with "Tip:" or "Note:")
        else if (line.match(/^(Tip|Note|Remember):/i)) {
          phraseData.tip = line.replace(/^(Tip|Note|Remember):?\s*/i, '').trim()
        }
      }

      // Only add if we have at least english and spanish
      if (phraseData.english && phraseData.spanish) {
        phrases.push(phraseData)
      }
    }

    return phrases
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
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

          {/* Download button */}
          <a
            href={resource.downloadUrl}
            download
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-accent-green text-white text-center rounded font-semibold hover:bg-green-700 transition-colors"
          >
            Descargar recurso
          </a>
        </div>

        {/* Audio Player - Show above content for audio resources */}
        {!loading && !error && resource.type === 'audio' && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
              <AudioPlayer
                title={resource.title}
                audioUrl={audioMetadata?.file ? `/hablas${audioMetadata.file}` : `/hablas/audio/resource-${resourceId}.mp3`}
                metadata={audioMetadata}
                resourceId={resource.id}
                enhanced={true}
              />
            </div>
          </div>
        )}

        {/* Content display */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200">
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
                // Audio content: display as plain text with formatting
                <div className="resource-content">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {content}
                  </pre>
                </div>
              ) : (() => {
                // Parse markdown content into phrase cards
                const phrases = parseMarkdownToPhrases(content)

                // If we successfully parsed phrases, render as simple text
                if (phrases.length > 0) {
                  return (
                    <div className="space-y-6">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Frases Útiles
                        </h2>
                        <p className="text-gray-600">
                          Aprende estas expresiones comunes y mejora tu español conversacional
                        </p>
                      </div>

                      <div className="space-y-4">
                        {phrases.map((phrase, index) => (
                          <PhraseList key={index} phrase={phrase} />
                        ))}
                      </div>
                    </div>
                  )
                }

                // Fallback to regular markdown rendering
                return (
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
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-2">
                          {children}
                        </ol>
                      ),
                      pre: ({ children }) => (
                        <div className="resource-content">
                          <pre className="whitespace-pre-wrap bg-transparent border-none p-0 mb-6 font-sans text-base leading-relaxed">
                            {children}
                          </pre>
                        </div>
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
                )
              })()}
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
