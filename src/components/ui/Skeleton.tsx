/**
 * Reusable animated placeholder components for loading states.
 *
 * @packageDocumentation
 */
import { PageHeader } from "@/components/layout/PageHeader"

/**
 * The properties available to customize a generic Skeleton.
 */
export interface SkeletonProps {
  className?: string
}

/**
 * A basic generic loading placeholder with a subtle violet pulsing animation.
 *
 * @param props - Customization properties.
 * @param props.className - Tailwind classes to specify width, height, and overrides.
 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg border border-violet-500/20 bg-violet-500/10 dark:border-violet-500/30 dark:bg-violet-950/40 ${className}`}
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

/**
 * Shared row of stat-card skeletons reused across Dashboard, Analytics, and Franchise views.
 */
export function StatsRibbonSkeleton({
  count = 4,
  gridClass,
  compact = false,
}: {
  count?: number
  gridClass: string
  compact?: boolean
}) {
  return (
    <div aria-hidden="true" className={gridClass}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-surface/90 flex flex-col justify-between space-y-2.5 rounded-xl border border-violet-500/25 p-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className={compact ? "h-4 w-4 rounded-md" : "h-8 w-8 rounded-lg"} />
          </div>
          <Skeleton className="h-7 w-14" />
          {!compact && <Skeleton className="h-2.5 w-24" />}
        </div>
      ))}
    </div>
  )
}

/**
 * Suspense fallback skeleton matching the Franchises Hub layout.
 */
export function FranchisesIndexSkeleton() {
  return (
    <div className="space-y-8 pb-16" aria-label="Loading franchises">
      <PageHeader
        title="Franchises"
        accent="cinematic sagas"
        description="Curated chronological viewing checklists and master timelines for legendary cinematic universes."
        action={<Skeleton className="h-10 w-36 shrink-0 rounded-xl" />}
      />

      <StatsRibbonSkeleton gridClass="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" compact={false} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-full rounded-xl sm:flex-1" />
        <Skeleton className="h-10 w-44 shrink-0 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-surface/90 flex flex-col justify-between rounded-2xl border border-violet-500/25 p-5"
          >
            <div>
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded-md" />
                <div className="flex items-center gap-1">
                  <Skeleton className="h-6 w-6 rounded-sm" />
                  <Skeleton className="h-6 w-6 rounded-sm" />
                </div>
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-2/3" />
              <div className="mt-4 flex items-center gap-1.5 py-1">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-16 w-11 shrink-0 rounded-md" />
                ))}
              </div>
            </div>
            <div className="border-border/50 mt-5 space-y-3 border-t pt-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Suspense fallback skeleton matching an individual franchise checklist dashboard.
 */
export function FranchiseDetailSkeleton() {
  return (
    <div className="space-y-6 pb-16" aria-label="Loading franchise checklist">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </div>

      <div className="border-border mb-6 flex flex-col justify-between gap-4 border-b pb-4 lg:flex-row lg:items-end">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2.5">
            <Skeleton className="h-9 w-72 max-w-full rounded-xl" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-96 max-w-full" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-xl" />
          <Skeleton className="h-8 w-36 rounded-xl" />
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      <StatsRibbonSkeleton gridClass="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4" />

      <div className="bg-surface/90 space-y-4 rounded-2xl border border-violet-500/25 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-9 w-full rounded-xl sm:w-80" />
          <Skeleton className="h-9 w-64 rounded-xl" />
        </div>
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-72 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      <div className="bg-surface/90 overflow-hidden rounded-2xl border border-violet-500/25">
        <div className="border-border bg-background/70 flex items-center justify-between border-b px-4 py-3 sm:px-5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3.5 w-52" />
        </div>
        <div className="divide-border divide-y">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-3.5">
                <Skeleton className="h-3 w-6" />
                <Skeleton className="hidden h-11 w-8 rounded-sm sm:block" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48 sm:w-64" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-5">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="hidden h-5 w-16 rounded-md md:block" />
                <Skeleton className="h-6 w-6 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Suspense fallback skeleton matching the Analytics dashboard layout.
 */
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading analytics">
      {/* Vault Wrapped Launcher */}
      <div className="bg-surface/90 flex items-center justify-between rounded-xl border border-violet-500/25 p-5 sm:p-6">
        <div className="space-y-2.5">
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-3.5 w-80 max-w-full" />
        </div>
        <Skeleton className="hidden h-9 w-9 shrink-0 rounded-full sm:block" />
      </div>

      {/* Time Invested */}
      <div className="space-y-3 pt-2">
        <Skeleton className="h-3 w-28" />
        <StatsRibbonSkeleton gridClass="grid grid-cols-2 gap-3 sm:grid-cols-4" compact />
      </div>

      {/* Distributions */}
      <div className="space-y-3 pt-2">
        <Skeleton className="h-3 w-28" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-surface/90 flex flex-col justify-between rounded-xl border border-violet-500/25 p-5"
            >
              <div>
                <Skeleton className="mb-4 h-3.5 w-36" />
                <div className="flex h-60 items-center justify-center">
                  {i === 0 ? (
                    <Skeleton className="h-40 w-40 rounded-full" />
                  ) : (
                    <div className="flex h-44 w-full items-end justify-around gap-3 px-4">
                      {["h-24", "h-36", "h-16", "h-28", "h-12"].map((heightClass, j) => (
                        <Skeleton key={j} className={`${heightClass} w-10 rounded-t-md`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="border-border-subtle mt-3 flex flex-wrap justify-center gap-3 border-t pt-3">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-3.5 w-16" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Loading skeleton matching MediaDetail across movies, series, books, and recipes.
 */
export function MediaDetailSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-2 pb-24 sm:px-6 md:pb-6 lg:py-4"
      aria-label="Loading item details"
    >
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      <div className="flex w-full flex-col items-start gap-8 md:flex-row lg:gap-16">
        <div className="flex w-full shrink-0 flex-col gap-5 md:w-1/3 lg:w-1/4">
          <Skeleton className="aspect-2/3 w-full rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        <div className="flex w-full flex-1 flex-col gap-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-3/4 rounded-xl" />
            <div className="flex gap-3">
              <Skeleton className="h-6 w-14 rounded-md" />
              <Skeleton className="h-6 w-40 rounded-md" />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-md" />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>

          <div className="border-border flex gap-6 border-b pb-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="space-y-2.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Loading skeleton matching the recipe editor form.
 */
export function RecipeFormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2" aria-label="Loading recipe editor">
      <div className="border-border mb-6 space-y-2 border-b pb-4">
        <Skeleton className="h-9 w-48 rounded-xl" />
        <Skeleton className="h-3.5 w-72" />
      </div>
      <div className="bg-surface/90 space-y-5 rounded-xl border border-violet-500/25 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className={i >= 2 ? "h-28 w-full rounded-xl" : "h-10 w-full rounded-xl"} />
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/**
 * Loading skeleton matching the full-screen Vault Wrapped presentation intro.
 */
export function WrappedSkeleton() {
  return (
    <div
      className="flex min-h-[75vh] flex-col items-center justify-center space-y-6 px-6 py-8 text-center"
      aria-label="Loading Vault Wrapped"
    >
      <Skeleton className="h-16 w-16 rounded-xl" />
      <Skeleton className="h-12 w-72 rounded-xl" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <Skeleton className="mt-4 h-10 w-40 rounded-lg" />
    </div>
  )
}
