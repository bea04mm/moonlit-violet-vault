// src/app/(vault)/page.tsx
// Dashboard — the home page of the vault. Fetches stats and recent items server-side.

import { Suspense } from "react";
import type { Metadata } from "next";
import { getVaultStats, getRecentlyAdded } from "@/lib/services/mediaService";
import { MediaGrid } from "@/components/media/MediaGrid";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import MovieIcon from "@mui/icons-material/Movie";
import TvIcon from "@mui/icons-material/Tv";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import NightlightIcon from "@mui/icons-material/Nightlight";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Personal media sanctuary overview.",
};

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
      className="glass-card rounded-3xl p-6 flex flex-col gap-2"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <span className="text-3xl flex items-center justify-center w-12 h-12 rounded-xl bg-[color-mix(in_srgb,var(--color-violet-500)_15%,transparent)] text-[var(--color-violet-400)]" aria-hidden="true">
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

async function DashboardStats() {
  const stats = await getVaultStats();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
        icon={<NightlightIcon fontSize="large" />}
        label="Currently enjoying"
        value={stats.currentlyWatching + stats.currentlyReading}
      />
    </div>
  );
}

async function RecentItems() {
  const items = await getRecentlyAdded(6);
  return (
    <MediaGrid
      items={items}
      emptyMessage="My vault is empty. Import from Goodreads or add something!"
    />
  );
}

export default function DashboardPage() {
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
          All movies, series, and books — beautifully organised.
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
        <Suspense
          fallback={
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl h-36 animate-pulse"
                  style={{ background: "var(--color-lunar-900)" }}
                />
              ))}
            </div>
          }
        >
          <DashboardStats />
        </Suspense>
      </section>

      {/* Recently added */}
      <section aria-labelledby="recent-heading">
        <h2
          id="recent-heading"
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "var(--color-lunar-600)" }}
        >
          Recently Added
        </h2>
        <Suspense
          fallback={
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <MediaCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <RecentItems />
        </Suspense>
      </section>
    </div>
  );
}
