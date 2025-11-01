'use client';

import { useState } from 'react';

/**
 * BilingualDialogueFormatter Component
 *
 * Formats bilingual audio script content for student learning.
 * - Hides production markers ([Speaker], [Tone], etc.)
 * - Color-codes English (blue) vs Spanish (green) dialogue
 * - Eliminates duplicate phrases (learning repetition)
 * - Includes collapsible technical specifications
 *
 * @param content - Raw audio script text
 */

interface BilingualDialogueFormatterProps {
  content: string;
}

export default function BilingualDialogueFormatter({ content }: BilingualDialogueFormatterProps) {
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

    // Main section headers (## with timestamps) - Clean display without timestamps
    if (line.startsWith('##')) {
      const headerText = line.replace(/^##\s*/, '').replace(/\[.*?\]/g, '').trim();
      // Skip if it's just metadata or intro sections students don't need
      if (headerText.match(/INTRODUCCIÓN|CONTENIDO PRINCIPAL/i)) {
        continue;
      }
      formatted.push(
        <h3 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-4 border-b-2 border-blue-600 pb-2 flex items-center gap-2">
          <span className="text-blue-600">🎯</span>
          {headerText}
        </h3>
      );
      continue;
    }

    // Subsection headers (### with timestamps or phrases) - Show ONLY phrase headers
    if (line.startsWith('###')) {
      const headerText = line.replace(/^###\s*/, '').replace(/\[.*?\]/g, '').trim();
      // Only show if it looks like a phrase header (FRASE, Frase)
      if (headerText.match(/FRASE|Frase/i)) {
        formatted.push(
          <div key={i} className="mt-8 mb-4">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md">
              <span className="text-3xl">🎯</span>
              <h4 className="text-xl font-bold text-white">
                {headerText}
              </h4>
            </div>
          </div>
        );
      }
      // Skip timestamp headers like ### [00:50] or ### [01:35]
      continue;
    }

    // Metadata (Duration, Target, Language, etc.) - SKIP (handled in collapsible sections)
    if (line.match(/^\*\*(Total Duration|Target|Language|Level|Category)\*\*/)) {
      // Skip - this info is in the collapsible "Technical Specifications" panel
      continue;
    }

    // Production directions (Speaker, Tone, Pause) - SKIP COMPLETELY (not for students)
    if (line.match(/^\*\*\[(Speaker|Tone|Pause|PAUSE|Sound effect):/i)) {
      // Skip - students don't need to see production directions
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
            <div key={i} className="my-6 p-6 rounded-xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 via-blue-25 to-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl shadow-md">
                  🇺🇸
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold text-blue-900 leading-relaxed mb-3" lang="en" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                    "{text}"
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                      English
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-900 text-xs font-semibold rounded-full">
                      🔁 Se repite 2x en audio
                    </span>
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
            <div key={i} className="my-6 p-6 rounded-xl border-2 border-green-500 bg-gradient-to-br from-green-50 via-green-25 to-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-2xl shadow-md">
                  🇪🇸
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold text-green-900 leading-relaxed mb-3" lang="es" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                    "{text}"
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                      Español
                    </span>
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

    // Regular paragraphs (instructions, explanations) - Only meaningful student content
    if (line.length > 0) {
      // Highlight instructor tips and learning advice
      if (line.match(/^(Frase número|Mi consejo|En los próximos|Cada frase|Escucha|Esta es LA frase|Esta frase|Cambia|Memoriza|Di esto|Siempre|Usa|Pregunta)/i)) {
        formatted.push(
          <div key={i} className="my-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg shadow-sm">
            <p className="text-base text-gray-800 leading-relaxed flex items-start gap-2">
              <span className="text-xl flex-shrink-0">💡</span>
              <span className="font-medium">{line.replace(/\*\*/g, '').replace(/^"/, '').replace(/"$/, '')}</span>
            </p>
          </div>
        );
      } else if (line.match(/En español:/i)) {
        // Spanish translations - highlight these
        formatted.push(
          <div key={i} className="my-3 p-3 bg-gradient-to-r from-green-100 to-green-50 border-l-4 border-green-500 rounded-lg">
            <p className="text-base text-green-900 font-semibold flex items-center gap-2">
              <span className="text-lg">🗣️</span>
              {line.replace(/\*\*/g, '')}
            </p>
          </div>
        );
      } else if (!line.startsWith('[') && !line.includes('**[') && !line.match(/^\d+:\d+/) && line.length > 20) {
        // Only show substantial content (not timestamps, script directions, or very short lines)
        formatted.push(
          <p key={i} className="text-gray-700 leading-relaxed my-3 text-base max-w-3xl">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      // Skip anything that looks like pure script direction
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Enhanced Color Guide */}
      <div className="p-5 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl shadow-lg">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="text-2xl">🎨</span>
          <span className="text-white font-bold text-lg">Guía de Aprendizaje:</span>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="text-2xl">🇺🇸</span>
            <span className="text-white font-semibold">Azul = English</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="text-2xl">🇪🇸</span>
            <span className="text-white font-semibold">Verde = Español</span>
          </div>
        </div>
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
