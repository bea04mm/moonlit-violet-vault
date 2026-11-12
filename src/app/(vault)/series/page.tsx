/**
 * TV Series gallery — server-fetched list with tabs:
 * Watching, Want to Watch, Waiting (returning series), Ended, and Other.
 *
 * @packageDocumentation
 */
import { Suspense } from "react"
import type { Metadata } from "next"
import { getMediaList } from "@/lib/services/mediaService"
import { TabbedDashboard, TabbedDashboardLoading } from "@/components/media/TabbedDashboard"
import { MediaCardSkeleton } from "@/components/ui/Skeleton"

/**
 * Metadata configuration for the TV series gallery page.
 */
export const metadata: Metadata = {
  title: "Series",
  description: "TV series collection in the vault.",
}

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
  })
  return (
    <TabbedDashboard
      type="series"
      items={series}
      title="Series"
      accent="tv & seasons"
      description="TV shows and seasonal trackers."
    />
  )
}

/**
 * Renders the TV Series gallery page, wrapping the series list in a Suspense boundary with a skeleton fallback.
 */
export default function SeriesPage() {
  return (
    <div className="animate-fade-in">
      <Suspense
        fallback={
          <div>
            <TabbedDashboardLoading
              title="Series"
              accent="tv & seasons"
              description="TV shows and seasonal trackers."
              tabs={["Watching", "Want to Watch", "Waiting", "Ended", "Other"]}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
  )
}
