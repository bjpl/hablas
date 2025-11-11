import type { VocabularyItem } from '@/lib/types/resource-content';

interface VocabularyCardProps {
  item: VocabularyItem;
}

export default function VocabularyCard({ item }: VocabularyCardProps) {
  return (
    <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <h4 className="text-xl font-bold text-gray-900 mb-2">{item.word}</h4>
      <p className="text-base text-gray-600 italic mb-2 leading-relaxed">{item.pronunciation}</p>
      <p className="text-base text-gray-800 mb-2">{item.translation}</p>
      {item.context && (
        <p className="text-sm text-gray-700 mt-3">
          <span className="font-semibold text-gray-900">Contexto:</span> {item.context}
        </p>
      )}
      {item.example && (
        <p className="text-sm text-gray-700 mt-2 italic">
          <span className="font-semibold text-gray-900">Ejemplo:</span> {item.example}
        </p>
      )}
    </div>
  );
}
