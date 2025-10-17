'use client'

export default function OfflineNotice() {
  return (
    <div
      className="bg-yellow-100 border-b border-yellow-300 px-4 py-2"
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-6xl mx-auto flex items-center gap-2">
        <svg
          className="w-5 h-5 text-yellow-700 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
          role="img"
        >
          <title>Advertencia</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-yellow-900 font-medium">
          Sin conexión - Solo puedes ver recursos descargados
        </p>
      </div>
    </div>
  )
}