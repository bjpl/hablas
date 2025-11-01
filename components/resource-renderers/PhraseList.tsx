import type { PhraseData } from '@/lib/types/resource-content';

interface PhraseListProps {
  phrase: PhraseData;
}

const formalityLabels = {
  formal: 'Formal',
  informal: 'Informal',
  neutral: 'Neutral'
} as const;

export default function PhraseList({ phrase }: PhraseListProps) {
  return (
    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
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
  );
}
