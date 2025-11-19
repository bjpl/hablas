/**
 * SkeletonCard Component
 *
 * Loading placeholder for ResourceCard component
 * Provides visual feedback during data loading to improve perceived performance
 */
export default function SkeletonCard() {
  return (
    <article className="card-resource flex flex-col h-full animate-pulse" aria-busy="true" aria-label="Cargando recurso">
      {/* Type icon placeholder */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded" />
        <div className="w-16 h-6 bg-gray-200 rounded-full" />
      </div>

      {/* Title placeholder */}
      <div className="mb-3">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-6 bg-gray-200 rounded w-1/2" />
      </div>

      {/* Description placeholder */}
      <div className="mb-4 flex-grow">
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>

      {/* Tags placeholder */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-7 bg-gray-200 rounded-full w-20" />
        <div className="h-7 bg-gray-200 rounded-full w-24" />
        <div className="h-7 bg-gray-200 rounded-full w-16" />
      </div>

      {/* Size placeholder */}
      <div className="h-4 bg-gray-200 rounded w-16 mb-4" />

      {/* Button placeholder */}
      <div className="mt-auto">
        <div className="h-12 bg-gray-200 rounded w-full" />
      </div>
    </article>
  )
}
