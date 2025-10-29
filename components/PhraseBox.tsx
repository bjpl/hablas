'use client'

interface PhraseBoxProps {
  content: string
}

export default function PhraseBox({ content }: PhraseBoxProps) {
  // Parse the cleaned box content
  const lines = content.split('\n').filter(l => l.trim())

  const data: any = {}
  let currentSection = ''

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('**English**:')) {
      data.english = trimmed.replace('**English**:', '').replace(/[""]/g, '"').trim()
    } else if (trimmed.startsWith('🗣️ **Español**:')) {
      data.spanish = trimmed.replace('🗣️ **Español**:', '').trim()
    } else if (trimmed.startsWith('🔊 **Pronunciación**:')) {
      data.pronunciation = trimmed.replace('🔊 **Pronunciación**:', '').replace(/[\[\]]/g, '').trim()
    } else if (trimmed.startsWith('**Usa cuando**:')) {
      currentSection = 'context'
      data.context = trimmed.replace('**Usa cuando**:', '').trim()
    } else if (trimmed.startsWith('**Ejemplo real**:')) {
      currentSection = 'example'
      data.example = trimmed.replace('**Ejemplo real**:', '').trim()
    } else if (trimmed.startsWith('💡 **TIP**:')) {
      currentSection = 'tip'
      data.tip = trimmed.replace('💡 **TIP**:', '').trim()
    } else if (currentSection && !trimmed.startsWith('**')) {
      // Continue previous section
      data[currentSection] += ' ' + trimmed
    }
  }

  return (
    <div className="my-6">
      {/* English - Primary phrase */}
      {data.english && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            English
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
            {data.english}
          </h3>
        </div>
      )}

      {/* Spanish translation */}
      {data.spanish && (
        <div className="mb-4">
          <p className="text-lg md:text-xl font-semibold text-gray-800 mb-1" lang="es">
            {data.spanish}
          </p>

          {/* Pronunciation */}
          {data.pronunciation && (
            <p className="text-sm text-gray-600 italic">
              {data.pronunciation}
            </p>
          )}
        </div>
      )}

      {/* Context - When to use */}
      {data.context && (
        <p className="mb-3 text-sm text-gray-700">
          <span className="font-semibold">Usa cuando:</span> {data.context}
        </p>
      )}

      {/* Example */}
      {data.example && (
        <p className="mb-3 text-sm text-gray-700">
          <span className="font-semibold">Ejemplo real:</span> {data.example}
        </p>
      )}

      {/* Tip */}
      {data.tip && (
        <p className="text-sm text-gray-700">
          <span className="font-semibold">TIP:</span> {data.tip}
        </p>
      )}
    </div>
  )
}
