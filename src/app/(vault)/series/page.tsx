/**
 * TV Series gallery — server-fetched list with tabs:
 * Watching, Want to Watch, Waiting (returning series), Ended, and Other.
 * 
 * @packageDocumentation
 */
import { Suspense } from "react";
import type { Metadata } from "next";
import { getMediaList } from "@/lib/services/mediaService";
import { TabbedDashboard, TabbedDashboardLoading } from "@/components/media/TabbedDashboard";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import TvIcon from "@mui/icons-material/Tv";

/**
 * Metadata configuration for the TV series gallery page.
 */
export const metadata: Metadata = {
  title: "Series",
  description: "My TV series collection in the vault.",
};

/**
 * The header node displayed at the top of the TV series gallery.
 */
const headerNode = (
  <div className="pt-2">
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
      Television collection.
    </p>
  </div>
);

/**
 * Server component that fetches the list of TV series and renders them in a TabbedDashboard.
 */
async function SeriesList() {
  /**
   * The complete list of TV series fetched from the media service.
   */
  const series = await getMediaList({
    type: "series",
    sortBy: "date_added",
    sortOrder: "desc",
  });
  return (
    <TabbedDashboard type="series" items={series} headerNode={headerNode} />
  );
}

/**
 * Renders the TV Series gallery page, wrapping the series list in a Suspense boundary with a skeleton fallback.
 */
export default function SeriesPage() {
  return (
    <div className="animate-fade-in -mt-8">
      <Suspense
        fallback={
          <div>
            <TabbedDashboardLoading
              headerNode={headerNode}
              tabs={["Watching", "Want to Watch", "Waiting", "Ended", "Other"]}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
              {[...Array(9)].map((_, i) => (
                <MediaCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <SeriesList />
      </Suspense>
    </div>
  );
}
