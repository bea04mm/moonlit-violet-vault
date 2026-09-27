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
      className="flex flex-row h-[168px] sm:h-[192px] rounded-3xl overflow-hidden border w-full"
      style={{
        background: "var(--color-lunar-950)",
        borderColor: "color-mix(in srgb, var(--color-violet-500) 15%, transparent)",
      }}
    >
      {/* Cover image area */}
      <Skeleton className="w-28 sm:w-32 h-full shrink-0 rounded-none" />
      {/* Text area */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <Skeleton className="h-5 w-3/4 mt-1" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <div className="mt-auto space-y-2">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-4/5" />
        </div>
      </div>
    </div>
  );
}
