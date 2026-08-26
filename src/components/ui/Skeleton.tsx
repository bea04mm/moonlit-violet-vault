// src/components/ui/Skeleton.tsx
// Animated loading skeleton — used in Suspense fallbacks.

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded-2xl animate-pulse ${className}`}
      style={{
        background:
          "linear-gradient(90deg, var(--color-lunar-800) 0%, var(--color-lunar-700) 50%, var(--color-lunar-800) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 2s linear infinite",
      }}
      aria-hidden="true"
    />
  );
}

export function MediaCardSkeleton() {
  return (
    <div
      className="rounded-3xl overflow-hidden border"
      style={{
        background: "var(--color-lunar-900)",
        borderColor:
          "color-mix(in srgb, var(--color-violet-500) 15%, transparent)",
      }}
    >
      {/* Cover image area */}
      <Skeleton className="w-full aspect-[2/3]" />
      {/* Text area */}
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
