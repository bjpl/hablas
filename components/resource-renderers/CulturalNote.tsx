import type { CulturalNoteData } from '@/lib/types/resource-content';

interface CulturalNoteProps {
  note: CulturalNoteData;
}

const importanceLabels = {
  high: 'Alta importancia',
  medium: 'Importancia media',
  low: 'Información adicional'
} as const;

export default function CulturalNote({ note }: CulturalNoteProps) {
  return (
    <div className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
      <h3 className="text-xl font-bold text-gray-900 mb-1">
        {note.title}
      </h3>
      <div className="text-sm text-gray-600 mb-2">
        {importanceLabels[note.importance]}
        {note.region && ` • ${note.region}`}
      </div>
      <p className="text-gray-700 leading-relaxed">{note.content}</p>
    </div>
  );
}
