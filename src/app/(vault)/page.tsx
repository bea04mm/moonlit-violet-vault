/**
 * Main dashboard — the first page seen after login.
 * Displays: stat cards (totals per type, currently watching/reading), a FavoritesCarousel,
 * and a "Recently Added" grid.
 * Uses `force-dynamic` to always fetch fresh data from Supabase on each request.
 * 
 * @packageDocumentation
 */
export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { getVaultStats, getRecentlyAdded, getFavorites } from "@/lib/services/mediaService";
import { MediaGrid } from "@/components/media/MediaGrid";
import MovieIcon from "@mui/icons-material/Movie";
import TvIcon from "@mui/icons-material/Tv";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import NightlightIcon from "@mui/icons-material/Nightlight";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { FavoritesCarousel } from "@/components/media/FavoritesCarousel";

/**
 * Metadata configuration for the main dashboard page.
 */
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Personal media sanctuary overview.",
};

/**
 * Reusable component to render a statistic card with an icon, label, and value.
 */
async function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div
      className="glass-card rounded-3xl p-6 flex flex-col gap-2 min-h-45"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <span className="text-3xl flex items-center justify-center w-12 h-12 rounded-xl bg-[color-mix(in_srgb,var(--color-violet-500)_15%,transparent)] text-violet-400" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p
          className="text-3xl font-display font-bold"
          style={{
            color: "var(--color-violet-300)",
            fontFamily: "var(--font-display)",
          }}
        >
          {value}
        </p>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-lunar-200)" }}
        >
          {label}
        </p>
        {sub && (
          <p className="text-xs mt-1" style={{ color: "var(--color-lunar-500)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Renders the main Dashboard page after all dashboard data has loaded.
 */
export default async function DashboardPage() {
  const [stats, favoriteItems, recentItems] = await Promise.all([
    getVaultStats(),
    getFavorites(),
    getRecentlyAdded(3),
  ]);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero header */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-2">
          <AutoAwesomeIcon fontSize="large" sx={{ color: "var(--color-violet-400)" }} />
          <h1
            className="text-4xl font-display font-bold text-gradient-violet"
            style={{ fontFamily: "var(--font-display)" }}
          >
            My Vault
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--color-lunar-500)" }}>
          All movies, series, books, and recipes — beautifully organised.
        </p>
      </div>

      {/* Stats */}
      <section aria-labelledby="stats-heading" className="mb-7">
        <h2
          id="stats-heading"
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "var(--color-lunar-600)" }}
        >
          Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            icon={<MovieIcon fontSize="large" />}
            label="Movies"
            value={stats.totalMovies}
            sub={`${stats.watchedMovies} watched`}
          />
          <StatCard
            icon={<TvIcon fontSize="large" />}
            label="Series"
            value={stats.totalSeries}
            sub={`${stats.currentlyWatching} watching`}
          />
          <StatCard
            icon={<MenuBookIcon fontSize="large" />}
            label="Books"
            value={stats.totalBooks}
            sub={`${stats.readBooks} read`}
          />
          <StatCard
            icon={<RestaurantMenuIcon fontSize="large" />}
            label="Recipes"
            value={stats.totalRecipes}
            sub={`${stats.cookedRecipes} cooked`}
          />
          <StatCard
            icon={<NightlightIcon fontSize="large" />}
            label="Currently enjoying"
            value={stats.currentlyWatching + stats.currentlyReading}
          />
        </div>
      </section>

      <section aria-labelledby="favorites-heading" className="mb-4 animate-fade-in">
        <h2
          id="favorites-heading"
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "var(--color-lunar-600)" }}
        >
          Favorites
        </h2>
        {favoriteItems.length === 0 ? (
          <div className="p-8 text-center text-lunar-500 bg-(--color-lunar-900) rounded-3xl border border-lunar-800 text-sm">
            No favorites yet. Click the heart on favorite movies or books!
          </div>
        ) : (
          <FavoritesCarousel items={favoriteItems} />
        )}
      </section>

      <section aria-labelledby="recent-heading" className="animate-fade-in">
        <h2
          id="recent-heading"
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "var(--color-lunar-600)" }}
        >
          Recently Added
        </h2>
        <MediaGrid
          items={recentItems}
          emptyMessage="My vault is empty. Import from Goodreads or add something!"
        />
      </section>
    </div>
  );
}
