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
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200 shadow-lg hover:shadow-2xl transition-all duration-300 my-6">
      {/* English - Primary phrase */}
      {data.english && (
        <div className="mb-6">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wide rounded-full mb-3">
            English
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {data.english}
          </h3>
        </div>
      )}

      {/* Spanish translation */}
      {data.spanish && (
        <div className="mb-5 bg-white bg-opacity-60 rounded-xl p-5 border border-indigo-100">
          <p className="text-xl md:text-2xl font-semibold text-indigo-700 mb-2" lang="es">
            🗣️ {data.spanish}
          </p>

          {/* Pronunciation */}
          {data.pronunciation && (
            <p className="text-sm text-gray-600 italic mt-2 font-mono">
              🔊 {data.pronunciation}
            </p>
          )}
        </div>
      )}

      {/* Context - When to use */}
      {data.context && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4">
          <p className="text-sm text-gray-800 leading-relaxed">
            <span className="font-bold text-green-700">Usa cuando:</span> {data.context}
          </p>
        </div>
      )}

      {/* Example */}
      {data.example && (
        <div className="mb-4 bg-purple-50 border-l-4 border-purple-400 rounded-r-lg p-4">
          <p className="text-sm text-gray-800 leading-relaxed">
            <span className="font-bold text-purple-700">Ejemplo real:</span> {data.example}
          </p>
        </div>
      )}

      {/* Tip */}
      {data.tip && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 flex gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div className="flex-1">
            <p className="text-sm text-gray-900 leading-relaxed">
              <span className="font-bold text-yellow-800">TIP:</span> {data.tip}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
