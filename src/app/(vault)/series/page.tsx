// src/app/(vault)/series/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { getMediaList } from "@/lib/services/mediaService";
import { TabbedDashboard } from "@/components/media/TabbedDashboard";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import TvIcon from "@mui/icons-material/Tv";

export const metadata: Metadata = {
  title: "Series",
  description: "My TV series collection in the vault.",
};

async function SeriesList() {
  const series = await getMediaList({
    type: "series",
    sortBy: "date_added",
    sortOrder: "desc",
  });
  return (
    <TabbedDashboard type="series" items={series} />
  );
}

export default function SeriesPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <TvIcon fontSize="large" sx={{ color: "var(--color-violet-400)" }} />
          <h1
            className="text-4xl font-display font-bold text-gradient-violet"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Series
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--color-lunar-500)" }}>
          Every show you&apos;ve loved (or want to).
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <SeriesList />
      </Suspense>
    </div>
  );
}
