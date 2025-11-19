import SkeletonCard from './SkeletonCard'

/**
 * SkeletonList Component
 *
 * Displays a grid of skeleton cards while resources are loading
 * Matches the layout of the actual ResourceLibrary grid
 *
 * @param count - Number of skeleton cards to display (default: 6)
 */
interface SkeletonListProps {
  count?: number
}

export default function SkeletonList({ count = 6 }: SkeletonListProps) {
  return (
    <section className="mb-8" aria-label="Cargando recursos">
      <div className="mb-6">
        {/* Heading skeleton */}
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
      </div>

      {/* Screen reader announcement */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        Cargando recursos de aprendizaje...
      </div>

      {/* Grid of skeleton cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Cargando lista de recursos">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </section>
  )
}
