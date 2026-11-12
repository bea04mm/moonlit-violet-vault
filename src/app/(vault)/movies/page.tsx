/**
 * Movies gallery — server-fetched list rendered in a TabbedDashboard
 * with tabs for Want to Watch, Watching, Watched, and Other.
 *
 * @packageDocumentation
 */

import { Suspense } from "react"
import type { Metadata } from "next"
import { getMediaList } from "@/lib/services/mediaService"
import { TabbedDashboard, TabbedDashboardLoading } from "@/components/media/TabbedDashboard"
import { MediaCardSkeleton } from "@/components/ui/Skeleton"

/**
 * Metadata configuration for the movies gallery page.
 */
export const metadata: Metadata = {
  title: "Movies",
  description: "Movie collection in the vault.",
}

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
  })
  return (
    <TabbedDashboard
      type="movie"
      items={movies}
      title="Movies"
      accent="cinema log"
      description="Personal film collection & watchlist."
    />
  )
}

/**
 * Renders the Movies gallery page, wrapping the movie list in a Suspense boundary with a skeleton fallback.
 */
export default function MoviesPage() {
  return (
    <div className="animate-fade-in">
      <Suspense
        fallback={
          <div>
            <TabbedDashboardLoading
              title="Movies"
              accent="cinema log"
              description="Personal film collection & watchlist."
              tabs={["Want to Watch", "Watching", "Watched", "Other"]}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
  )
}
