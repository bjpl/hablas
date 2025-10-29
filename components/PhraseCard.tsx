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
  const formalityLabels = {
    formal: 'Formal',
    informal: 'Informal',
    neutral: 'Neutral'
  }

  return (
    <div className="mb-6">
      {/* English phrase */}
      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
        {phrase.english}
      </h3>

      {/* Spanish translation */}
      <div className="mb-3">
        <p className="text-lg font-semibold text-gray-800 mb-1" lang="es">
          {phrase.spanish}
        </p>

        {/* Pronunciation */}
        <p className="text-sm text-gray-600 italic">
          {phrase.pronunciation}
        </p>
      </div>

      {/* Context/usage */}
      {phrase.context && (
        <p className="text-sm text-gray-700 mb-2">
          <span className="font-semibold">Uso:</span> {phrase.context}
        </p>
      )}

      {/* Example sentence */}
      {phrase.example && (
        <p className="text-sm text-gray-700 mb-2">
          <span className="font-semibold">Ejemplo:</span> {phrase.example}
        </p>
      )}

      {/* Tip */}
      {phrase.tip && (
        <p className="text-sm text-gray-700 mb-2">
          <span className="font-semibold">Consejo:</span> {phrase.tip}
        </p>
      )}

      {/* Formality badge */}
      {phrase.formality && (
        <span className="text-xs text-gray-600">
          ({formalityLabels[phrase.formality]})
        </span>
      )}
    </div>
  )
}
