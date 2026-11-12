/**
 * Main dashboard — the first page seen after login.
 * Displays: stat cards (totals per type, currently watching/reading), a FavoritesCarousel,
 * and a "Recently Added" grid.
 * Uses `force-dynamic` to always fetch fresh data from Supabase on each request.
 * Scoped with Suspense so the dashboard skeleton only loads here and never leaks to other pages.
 *
 * @packageDocumentation
 */
export const dynamic = "force-dynamic"
import { Suspense } from "react"
import type { Metadata } from "next"
import { getVaultStats, getRecentlyAdded, getFavorites } from "@/lib/services/mediaService"
import { MediaGrid } from "@/components/media/MediaGrid"
import { MediaCardSkeleton } from "@/components/ui/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import MovieIcon from "@mui/icons-material/Movie"
import TvIcon from "@mui/icons-material/Tv"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import NightlightIcon from "@mui/icons-material/Nightlight"
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu"
import { FavoritesCarousel } from "@/components/media/FavoritesCarousel"

/**
 * Metadata configuration for the main dashboard page.
 */
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Personal media sanctuary overview.",
}

/**
 * Reusable static component to render an overview statistic card with an icon, label, and value.
 * Intentionally clean without hover animations.
 */
async function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: number
  sub?: string
}) {
  return (
    <div className="bg-surface hover:bg-surface-hover border-border hover:border-primary shadow-card hover:shadow-card-hover flex flex-col justify-between rounded-xl border p-4 transition-all duration-300 ease-out hover:-translate-y-1 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-muted text-xs font-semibold">{label}</span>
        <span
          className="text-primary bg-primary/15 border-primary/30 flex h-8 w-8 items-center justify-center rounded-lg border"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <div>
        <p className="font-display text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {value}
        </p>
        {sub && <p className="text-muted mt-1 truncate font-mono text-[11px]">{sub}</p>}
      </div>
    </div>
  )
}

/**
 * Skeleton fallback for the main dashboard view while data is streaming.
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <section aria-label="Loading overview" className="mb-6">
        <h2 className="text-muted mb-3 font-mono text-[11px] font-medium tracking-wider uppercase">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border border-violet-500/20 bg-violet-950/30"
            />
          ))}
        </div>
      </section>

      <section aria-label="Loading favorites" className="mb-6">
        <h2 className="text-muted mb-3 font-mono text-[11px] font-medium tracking-wider uppercase">
          Favorites
        </h2>
        <div className="flex overflow-hidden px-[calc(7.5vw-1rem)] pb-4 sm:px-[calc((100%-26rem)/2)] md:px-0">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="mr-4 h-40 w-[85vw] shrink-0 sm:h-48 sm:w-92 md:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)]"
            >
              <MediaCardSkeleton />
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Loading recently added">
        <h2 className="text-muted mb-3 font-mono text-[11px] font-medium tracking-wider uppercase">
          Recently Added
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <MediaCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  )
}

/**
 * Async content component that loads all dashboard datasets in parallel.
 */
async function DashboardContent() {
  const [stats, favoriteItems, recentItems] = await Promise.all([
    getVaultStats(),
    getFavorites(),
    getRecentlyAdded(3),
  ])

  return (
    <div className="animate-fade-in space-y-8">
      {/* Stats */}
      <section aria-labelledby="stats-heading">
        <h2
          id="stats-heading"
          className="text-muted mb-3 font-mono text-[11px] font-semibold tracking-wider uppercase"
        >
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            icon={<MovieIcon fontSize="small" />}
            label="Movies"
            value={stats.totalMovies}
            sub={`${stats.watchedMovies} watched`}
          />
          <StatCard
            icon={<TvIcon fontSize="small" />}
            label="Series"
            value={stats.totalSeries}
            sub={`${stats.currentlyWatching} watching`}
          />
          <StatCard
            icon={<MenuBookIcon fontSize="small" />}
            label="Books"
            value={stats.totalBooks}
            sub={`${stats.readBooks} read`}
          />
          <StatCard
            icon={<RestaurantMenuIcon fontSize="small" />}
            label="Recipes"
            value={stats.totalRecipes}
            sub={`${stats.cookedRecipes} cooked`}
          />
          <StatCard
            icon={<NightlightIcon fontSize="small" />}
            label="In Progress"
            value={stats.currentlyWatching + stats.currentlyReading}
            sub="Active focus"
          />
        </div>
      </section>

      <section aria-labelledby="favorites-heading" className="animate-fade-in">
        <h2
          id="favorites-heading"
          className="text-muted mb-3 font-mono text-[11px] font-semibold tracking-wider uppercase"
        >
          Favorites
        </h2>
        {favoriteItems.length === 0 ? (
          <div className="text-muted bg-surface border-border rounded-xl border p-8 text-center text-xs">
            No favorites yet. Add your favorite movies or books to see them highlighted here.
          </div>
        ) : (
          <FavoritesCarousel items={favoriteItems} />
        )}
      </section>

      <section aria-labelledby="recent-heading" className="animate-fade-in">
        <h2
          id="recent-heading"
          className="text-muted mb-3 font-mono text-[11px] font-semibold tracking-wider uppercase"
        >
          Recently Added
        </h2>
        <MediaGrid
          items={recentItems}
          emptyMessage="Vault is empty. Import from Goodreads or add something!"
        />
      </section>
    </div>
  )
}

/**
 * Renders the main Dashboard page with an isolated Suspense boundary so the dashboard
 * skeleton only applies to the root route and never leaks to other vault pages.
 */
export default function DashboardPage() {
  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Vault"
        accent="curated library"
        description="All movies, series, books, and recipes in one focused space."
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
