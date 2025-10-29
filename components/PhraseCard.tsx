'use client'

interface PhraseCardData {
  english: string
  spanish: string
  pronunciation: string
  context?: string
  example?: string
  tip?: string
  formality?: 'formal' | 'informal' | 'neutral'
}

interface PhraseCardProps {
  phrase: PhraseCardData
}

export default function PhraseCard({ phrase }: PhraseCardProps) {
  const formalityColors = {
    formal: 'from-blue-50 to-blue-100 border-blue-300',
    informal: 'from-green-50 to-green-100 border-green-300',
    neutral: 'from-gray-50 to-gray-100 border-gray-300'
  }

  const formalityLabels = {
    formal: 'Formal',
    informal: 'Informal',
    neutral: 'Neutral'
  }

  const bgGradient = phrase.formality
    ? formalityColors[phrase.formality]
    : 'from-indigo-50 to-purple-100 border-indigo-300'

  return (
    <div
      className={`bg-gradient-to-br ${bgGradient} rounded-xl p-6 border-2 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      {/* English phrase - Large and bold */}
      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
        {phrase.english}
      </h3>

      {/* Spanish translation - Colored and prominent */}
      <div className="mb-4">
        <p className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-2" lang="es">
          {phrase.spanish}
        </p>

        {/* Pronunciation - Gray and smaller */}
        <p className="text-sm text-gray-600 italic flex items-center gap-2">
          <span aria-hidden="true">🗣️</span>
          <span>{phrase.pronunciation}</span>
        </p>
      </div>

      {/* Context/usage - Light background pill */}
      {phrase.context && (
        <div className="mb-4">
          <span className="inline-block px-4 py-2 bg-white bg-opacity-70 rounded-full text-sm text-gray-700 font-medium border border-gray-300 shadow-sm">
            💡 {phrase.context}
          </span>
        </div>
      )}

      {/* Example sentence - Blockquote style */}
      {phrase.example && (
        <blockquote className="my-4 pl-4 border-l-4 border-indigo-400 bg-white bg-opacity-50 rounded-r-lg p-4 shadow-inner">
          <p className="text-sm text-gray-800 italic leading-relaxed">
            <span className="font-semibold not-italic text-indigo-900">Ejemplo:</span> {phrase.example}
          </p>
        </blockquote>
      )}

      {/* Tip - Yellow highlight box */}
      {phrase.tip && (
        <div className="mt-4 bg-yellow-100 bg-opacity-80 rounded-lg p-4 border-2 border-yellow-300 shadow-md">
          <p className="text-sm text-yellow-900 leading-relaxed flex items-start gap-2">
            <span className="text-lg" aria-hidden="true">💡</span>
            <span className="flex-1">
              <span className="font-bold">Consejo:</span> {phrase.tip}
            </span>
          </p>
        </div>
      )}

      {/* Formality badge */}
      {phrase.formality && (
        <div className="mt-4 flex justify-end">
          <span className="px-3 py-1.5 bg-white bg-opacity-80 rounded-full text-xs font-semibold text-gray-700 border border-gray-300 shadow-sm">
            {formalityLabels[phrase.formality]}
          </span>
        </div>
      )}
    </div>
  )
}
