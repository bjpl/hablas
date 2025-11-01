/**
 * Enhanced Audio Player - Example Usage
 * Demonstrates all features for language learning app
 */

import AudioPlayer from '@/components/AudioPlayer';
import { useState, useEffect } from 'react';
import { preloadAudio, isAudioCached, clearAudioCache } from '@/lib/audio-utils';

// Example 1: Simple Inline Player (for cards/lists)
export function SimpleAudioExample() {
  return (
    <div className="p-4 bg-white rounded-lg border">
      <h3 className="font-semibold mb-2">Saludos Básicos</h3>
      <p className="text-sm text-gray-600 mb-3">
        Listen to basic greetings in Colombian Spanish
      </p>
      <AudioPlayer
        audioUrl="/audio/saludos-basicos.mp3"
        label="Play basic greetings"
      />
    </div>
  );
}

// Example 2: Enhanced Player (for detail pages)
export function EnhancedAudioExample() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <AudioPlayer
        audioUrl="/audio/saludos-basicos.mp3"
        title="Saludos Básicos - Colombian Spanish"
        enhanced={true}
        resourceId={1}
        metadata={{
          duration: "2:30",
          narrator: "María García",
          accent: "Colombiano (Bogotá)"
        }}
      />

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold mb-2">Práctica Recomendada:</h4>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Escucha a velocidad 0.5x para aprender pronunciación</li>
          <li>Usa el botón "Repetir" para practicar frases difíciles</li>
          <li>Descarga para estudiar sin conexión</li>
        </ul>
      </div>
    </div>
  );
}

// Example 3: Multiple Players with Preloading
export function MultipleAudioExample() {
  const lessons = [
    {
      id: 1,
      title: 'Saludos Básicos',
      audioUrl: '/audio/saludos-basicos.mp3',
      duration: '2:30'
    },
    {
      id: 2,
      title: 'Presentaciones',
      audioUrl: '/audio/presentaciones.mp3',
      duration: '3:15'
    },
    {
      id: 3,
      title: 'Números y Fechas',
      audioUrl: '/audio/numeros-fechas.mp3',
      duration: '4:00'
    }
  ];

  // Preload next lesson on mount
  useEffect(() => {
    if (lessons[1]) {
      preloadAudio(lessons[1].audioUrl, { priority: 'low' });
    }
  }, []);

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold mb-4">Lecciones de Audio</h2>

      {lessons.map((lesson, index) => (
        <div
          key={lesson.id}
          className="bg-white rounded-lg border p-4"
          onMouseEnter={() => {
            // Preload on hover for desktop
            if (index < lessons.length - 1) {
              preloadAudio(lessons[index + 1].audioUrl);
            }
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold">{lesson.title}</h3>
              <p className="text-sm text-gray-600">Duración: {lesson.duration}</p>
            </div>
          </div>

          <AudioPlayer
            audioUrl={lesson.audioUrl}
            label={`Play ${lesson.title}`}
          />
        </div>
      ))}
    </div>
  );
}

// Example 4: Offline Download Manager
export function OfflineDownloadExample() {
  const [lessons] = useState([
    { id: 1, title: 'Saludos Básicos', audioUrl: '/audio/saludos-basicos.mp3' },
    { id: 2, title: 'Presentaciones', audioUrl: '/audio/presentaciones.mp3' },
    { id: 3, title: 'Números y Fechas', audioUrl: '/audio/numeros-fechas.mp3' }
  ]);

  const [cacheStatus, setCacheStatus] = useState<Record<number, boolean>>({});
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    // Check cache status for all lessons
    Promise.all(
      lessons.map(async (lesson) => {
        const status = await isAudioCached(lesson.audioUrl);
        return { id: lesson.id, cached: status.isCached };
      })
    ).then(results => {
      const statusMap: Record<number, boolean> = {};
      results.forEach(r => {
        statusMap[r.id] = r.cached;
      });
      setCacheStatus(statusMap);
    });
  }, [lessons]);

  const handleClearCache = async () => {
    await clearAudioCache();
    setCacheStatus({});
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white rounded-lg border p-4 mb-4">
        <h3 className="font-semibold mb-2">Gestión de Descargas</h3>
        <p className="text-sm text-gray-600 mb-3">
          Descarga lecciones para estudiar sin conexión
        </p>

        <div className="space-y-2">
          {lessons.map(lesson => (
            <div key={lesson.id} className="flex items-center justify-between">
              <span className="text-sm">{lesson.title}</span>
              {cacheStatus[lesson.id] ? (
                <span className="text-xs text-green-600 font-medium">
                  ✓ Descargado
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  No descargado
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleClearCache}
          className="mt-4 w-full px-4 py-2 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 text-sm font-medium"
        >
          Limpiar Caché
        </button>
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
        <p className="text-xs text-blue-800">
          💡 <strong>Consejo:</strong> Descarga lecciones mientras estés en WiFi
          para ahorrar datos móviles
        </p>
      </div>
    </div>
  );
}

// Example 5: Network-Aware Loading
export function NetworkAwareExample() {
  const [shouldPreload, setShouldPreload] = useState(true);

  useEffect(() => {
    // Check network connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      // Only preload on WiFi or fast 4G
      if (connection.effectiveType !== '4g' && connection.type !== 'wifi') {
        setShouldPreload(false);
      }

      // Listen for connection changes
      connection.addEventListener('change', () => {
        const isGoodConnection =
          connection.effectiveType === '4g' || connection.type === 'wifi';
        setShouldPreload(isGoodConnection);
      });
    }
  }, []);

  return (
    <div className="p-4">
      {!shouldPreload && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Conexión lenta detectada. La precarga está deshabilitada para
            ahorrar datos.
          </p>
        </div>
      )}

      <AudioPlayer
        audioUrl="/audio/saludos-basicos.mp3"
        title="Saludos Básicos"
        enhanced={true}
      />
    </div>
  );
}

// Example 6: Practice Loop Mode
export function PracticeLoopExample() {
  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white rounded-lg border p-4">
        <div className="mb-4">
          <h3 className="font-semibold text-lg">Práctica de Pronunciación</h3>
          <p className="text-sm text-gray-600 mt-1">
            Usa el modo de repetición para practicar frases difíciles
          </p>
        </div>

        <AudioPlayer
          audioUrl="/audio/pronunciacion-dificil.mp3"
          title="Trabalenguas Colombiano"
          enhanced={true}
          metadata={{
            duration: "0:45",
            narrator: "María García",
            accent: "Colombiano"
          }}
        />

        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-sm mb-2">Pasos para Practicar:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Activa el botón "Repetir"</li>
            <li>Reduce la velocidad a 0.5x o 0.75x</li>
            <li>Escucha y repite después del audio</li>
            <li>Aumenta la velocidad gradualmente</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Example 7: Complete Resource Detail Page
export function CompleteResourceExample() {
  const [isCached, setIsCached] = useState(false);

  const audioUrl = '/audio/saludos-basicos.mp3';

  useEffect(() => {
    // Check if audio is cached
    isAudioCached(audioUrl).then(status => {
      setIsCached(status.isCached);
    });

    // Preload audio in background
    preloadAudio(audioUrl, { priority: 'high' });
  }, [audioUrl]);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Saludos Básicos en Colombia</h1>
        <p className="text-gray-600">
          Aprende las formas más comunes de saludar en Colombia
        </p>
      </div>

      {/* Audio Player */}
      <AudioPlayer
        audioUrl={audioUrl}
        title="Audio de la Lección"
        enhanced={true}
        resourceId={1}
        metadata={{
          duration: "2:30",
          narrator: "María García",
          accent: "Colombiano (Bogotá)",
          voice: "Femenino"
        }}
      />

      {/* Offline Status */}
      {isCached && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✓ Este audio está disponible sin conexión
          </p>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Frases de la Lección:</h2>
        <ul className="space-y-2">
          <li className="text-sm">
            <span className="font-medium">Buenos días</span> - Good morning
          </li>
          <li className="text-sm">
            <span className="font-medium">Buenas tardes</span> - Good afternoon
          </li>
          <li className="text-sm">
            <span className="font-medium">Buenas noches</span> - Good evening/night
          </li>
        </ul>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <h3 className="font-semibold mb-2">Consejos de Estudio:</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Escucha el audio completo primero</li>
          <li>Usa velocidad lenta (0.5x) para palabras nuevas</li>
          <li>Activa "Repetir" para practicar pronunciación</li>
          <li>Descarga para practicar en el bus o metro</li>
        </ul>
      </div>
    </div>
  );
}
