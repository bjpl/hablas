import type { PracticalScenarioData } from '@/lib/types/resource-content';

interface PracticalScenarioProps {
  scenario: PracticalScenarioData;
}

export default function PracticalScenario({ scenario }: PracticalScenarioProps) {
  return (
    <div className="mb-8 p-6 bg-white rounded-xl border-2 border-blue-200 shadow-md">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{scenario.title}</h3>
      <p className="text-gray-700 italic mb-4">{scenario.situation}</p>

      <div className="space-y-3">
        {scenario.phrases.map((phrase, index) => (
          <div key={index} className="mb-3 p-3 bg-gray-50 rounded">
            <p className="text-lg font-semibold text-gray-900" lang="es">
              {phrase.spanish}
            </p>
            <p className="text-sm text-gray-600 italic">{phrase.pronunciation}</p>
            <p className="text-sm text-gray-700" lang="en">{phrase.english}</p>
          </div>
        ))}

        {scenario.tips && scenario.tips.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
            <h4 className="font-bold text-gray-900 mb-2">
              💡 Consejos prácticos
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
  );
}
