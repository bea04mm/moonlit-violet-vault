/**
 * Movies gallery — server-fetched list rendered in a TabbedDashboard
 * with tabs for Want to Watch, Watching, Watched, and Other.
 * 
 * @packageDocumentation
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { getMediaList } from "@/lib/services/mediaService";
import { TabbedDashboard, TabbedDashboardLoading } from "@/components/media/TabbedDashboard";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import MovieIcon from "@mui/icons-material/Movie";

/**
 * Metadata configuration for the movies gallery page.
 */
export const metadata: Metadata = {
  title: "Movies",
  description: "My movie collection in the vault.",
};

/**
 * The header node displayed at the top of the movies gallery.
 */
const headerNode = (
  <div className="pt-2">
    <div className="flex items-center gap-3 mb-2">
      <MovieIcon fontSize="large" sx={{ color: "var(--color-violet-400)" }} />
      <h1
        className="text-4xl font-display font-bold text-gradient-violet"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Movies
      </h1>
    </div>
    <p className="text-sm" style={{ color: "var(--color-lunar-500)" }}>
      Cinematic collection.
    </p>
  </div>
);

/**
 * Server component that fetches the list of movies and renders them in a TabbedDashboard.
 */
async function MoviesList() {
  /**
   * The complete list of movies fetched from the media service.
   */
  const movies = await getMediaList({
    type: "movie",
    sortBy: "date_added",
    sortOrder: "desc",
  });
  return (
    <TabbedDashboard type="movie" items={movies} headerNode={headerNode} />
  );
}

/**
 * Renders the Movies gallery page, wrapping the movie list in a Suspense boundary with a skeleton fallback.
 */
export default function MoviesPage() {
  return (
    <div className="animate-fade-in -mt-8">
      <Suspense
        fallback={
          <div>
            <TabbedDashboardLoading
              headerNode={headerNode}
              tabs={["Want to Watch", "Watching", "Watched", "Other"]}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
              {[...Array(9)].map((_, i) => (
                <MediaCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <MoviesList />
      </Suspense>
    </div>
  );
}
