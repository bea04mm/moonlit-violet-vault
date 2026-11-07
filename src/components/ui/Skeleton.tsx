/**
 * Reusable animated placeholder components for loading states.
 *
 * @packageDocumentation
 */
/**
 * The properties available to customize a generic Skeleton.
 */
export interface SkeletonProps {
  className?: string
}

/**
 * A basic generic loading placeholder with a shimmering animation.
 *
 * @param props - Customization properties.
 * @param props.className - Tailwind classes to specify width, height, and overrides.
 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg border border-violet-500/20 bg-violet-950/30 dark:border-violet-500/30 dark:bg-violet-950/40 ${className}`}
      aria-hidden="true"
    />
  )
}

/**
 * Animated loading skeleton — used in Suspense fallbacks.
 */
export function MediaCardSkeleton() {
  return (
    <div className="bg-surface/90 flex h-40 w-full flex-row overflow-hidden rounded-xl border border-violet-500/25 sm:h-48">
      {/* Cover image area */}
      <Skeleton className="h-full w-28 shrink-0 rounded-none border-none sm:w-32" />
      {/* Text area */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="mt-1 h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <div className="mt-auto space-y-2">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-4/5" />
        </div>
      </div>
    </div>
  )
}
