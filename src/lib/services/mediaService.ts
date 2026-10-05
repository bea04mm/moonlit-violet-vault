/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @module
 * 
 * Business-logic layer that sits between the repository and the UI.
 * This service orchestrates multiple repository calls, performs aggregations,
 * and computes derived data (analytics, vault stats, "Wrapped" summary).
 *
 * All functions here are async server-side functions — they call the media
 * repository which itself calls Supabase. Never import this file in Client Components;
 * use server actions in `lib/actions/` as the boundary instead.
 */

import { getMediaRepository, type MediaFilters } from "@/lib/repositories/mediaRepository";
import type { MediaItem } from "@/lib/supabase/database.types";

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

/**
 * Aggregated counts shown on the main vault dashboard.
 * All fields are plain numbers so they can be safely passed as props to Client Components.
 */
export interface VaultStats {
  totalMovies: number;
  totalSeries: number;
  totalBooks: number;
  totalRecipes: number;
  watchedMovies: number;
  readBooks: number;
  cookedRecipes: number;
  /**
   * Series + movies currently being watched.
   */
  currentlyWatching: number;
  /**
   * Books currently being read.
   */
  currentlyReading: number;
}

/**
 * Business logic layer — sits between repositories and UI.
 * Handles aggregation, formatting helpers, and domain logic.
 */
export async function getVaultStats(): Promise<VaultStats> {
  /**
   * The repository instance used for data access.
   */
  const repo = await getMediaRepository();
  const [
    totalMovies,
    totalSeries,
    totalBooks,
    totalRecipes,
    watchedMovies,
    readBooks,
    cookedRecipes,
    currentlyWatching,
    currentlyReading,
  ] = await Promise.all([
    repo.count({ type: "movie" }),
    repo.count({ type: "series" }),
    repo.count({ type: "book" }),
    repo.count({ type: "recipe" }),
    repo.count({ type: "movie", status: "watched" }),
    repo.count({ type: "book", status: "read" }),
    repo.count({ type: "recipe", status: "cooked" }),
    repo.count({ status: "watching" }),
    repo.count({ status: "reading" }),
  ]);

  return {
    totalMovies,
    totalSeries,
    totalBooks,
    totalRecipes,
    watchedMovies,
    readBooks,
    cookedRecipes,
    currentlyWatching,
    currentlyReading,
  };
}

/**
 * Fetches a list of media items based on filters.
 */
export async function getMediaList(filters?: MediaFilters): Promise<MediaItem[]> {
  /**
   * The repository instance used for data access.
   */
  const repo = await getMediaRepository();
  return repo.findAll(filters);
}

/**
 * Fetches a single media item by ID.
 */
export async function getMediaItem(id: string): Promise<MediaItem | null> {
  /**
   * The repository instance used for data access.
   */
  const repo = await getMediaRepository();
  return repo.findById(id);
}

/**
 * Fetches the most recently added items.
 */
export async function getRecentlyAdded(limit = 6): Promise<MediaItem[]> {
  /**
   * The repository instance used for data access.
   */
  const repo = await getMediaRepository();
  return repo.findAll({ sortBy: "date_added", sortOrder: "desc", limit });
}

/**
 * Fetches the users favorite items.
 */
export async function getFavorites(): Promise<MediaItem[]> {
  /**
   * The repository instance used for data access.
   */
  const repo = await getMediaRepository();
  return repo.findAll({ isFavorite: true, sortBy: "date_added", sortOrder: "desc" });
}

/**
 * Fetches items currently being watched or read.
 */
export async function getCurrentlyConsuming(): Promise<MediaItem[]> {
  /**
   * The repository instance used for data access.
   */
  const repo = await getMediaRepository();
  const [watching, reading] = await Promise.all([
    repo.findAll({ status: "watching" }),
    repo.findAll({ status: "reading" }),
  ]);
  return [...watching, ...reading];
}

/**
 * Aggregated analytics data.
 */
export interface AnalyticsData {
  timeInvested: {
    moviesHours: number;
    seriesHours: number;
    booksHours: number;
    booksPages: number;
  };
  libraryDistribution: {
    name: string;
    value: number;
    fill: string;
  }[];
  statusDistribution: {
    name: string;
    value: number;
    fill: string;
  }[];
}

/**
 * Declaration for calculateSeriesWatchedMinutes.
 */
function calculateSeriesWatchedMinutes(item: MediaItem): number {
  if (item.season_progress && Object.values(item.season_progress).some((s: any) => s.episodes)) {
    /**
     * Declaration for mins.
     */
    let mins = 0;
    Object.values(item.season_progress).forEach((season: any) => {
      if (season.episodes) {
        Object.values(season.episodes).forEach((ep: any) => {
          if (ep.watched) {
            mins += ep.runtime_minutes || item.runtime_minutes || 45;
          }
        });
      }
    });
    return mins;
  }
  // Fallback estimate
  const epRuntime = item.runtime_minutes || 45;
  return (item.episodes_seen || 0) * epRuntime;
}

/**
 * Builds all analytics data from the full vault in a single pass.
 * Aggregates time invested, library distribution, and status breakdown
 * for rendering in AnalyticsCharts.
 */
export async function getAnalyticsData(): Promise<AnalyticsData> {
  /**
   * The repository instance used for data access.
   */
  const repo = await getMediaRepository();
  /**
   * Declaration for allItems.
   */
  const allItems = await repo.findAll();

  /**
   * Declaration for moviesHours.
   */
  let moviesHours = 0;
  /**
   * Declaration for seriesHours.
   */
  let seriesHours = 0;
  /**
   * Declaration for booksPages.
   */
  let booksPages = 0;
  /**
   * Declaration for booksHours.
   */
  let booksHours = 0;
  
  /**
   * Declaration for totalMovies.
   */
  let totalMovies = 0;
  /**
   * Declaration for totalSeries.
   */
  let totalSeries = 0;
  /**
   * Declaration for totalBooks.
   */
  let totalBooks = 0;
  /**
   * Declaration for totalRecipes.
   */
  let totalRecipes = 0;

  /**
   * Declaration for statusMap.
   */
  const statusMap: Record<string, number> = {
    "Completed": 0,
    "In Progress": 0,
    "Plan to Watch/Read": 0,
    "Dropped / On Hold": 0,
  };

  allItems.forEach(item => {
    // 1. Time Invested
    if (item.type === "movie" && item.status === "watched") {
      moviesHours += (item.runtime_minutes || 120) / 60;
    }
    if (item.type === "series") {
      seriesHours += calculateSeriesWatchedMinutes(item) / 60;
    }
    if (item.type === "book") {
      booksPages += item.pages_read || 0;
      booksHours += (item.reading_time_minutes || 0) / 60;
    }

    // 2. Library Distribution
    if (item.type === "movie") totalMovies++;
    if (item.type === "series") totalSeries++;
    if (item.type === "book") totalBooks++;
    if (item.type === "recipe") totalRecipes++;

    // 3. Status Distribution
    if (["watched", "read", "cooked"].includes(item.status)) statusMap["Completed"]++;
    else if (["watching", "reading"].includes(item.status)) statusMap["In Progress"]++;
    else if (["want_to_watch", "want_to_read", "want_to_cook"].includes(item.status)) statusMap["Plan to Watch/Read"]++;
    else statusMap["Dropped / On Hold"]++;
  });

  return {
    timeInvested: {
      moviesHours: Math.round(moviesHours),
      seriesHours: Math.round(seriesHours),
      booksHours: Math.round(booksHours),
      booksPages,
    },
    libraryDistribution: [
      { name: "Movies", value: totalMovies, fill: "var(--color-violet-500)" },
      { name: "Series", value: totalSeries, fill: "var(--color-starlight-400)" },
      { name: "Books", value: totalBooks, fill: "var(--color-lunar-400)" },
      { name: "Recipes", value: totalRecipes, fill: "var(--color-blossom-500)" },
    ].filter(d => d.value > 0),
    statusDistribution: [
      { name: "Completed", value: statusMap["Completed"], fill: "var(--color-violet-400)" },
      { name: "In Progress", value: statusMap["In Progress"], fill: "var(--color-starlight-500)" },
      { name: "Plan to", value: statusMap["Plan to Watch/Read"], fill: "var(--color-lunar-500)" },
      { name: "Dropped/Hold", value: statusMap["Dropped / On Hold"], fill: "var(--color-lunar-800)" },
    ].filter(d => d.value > 0)
  };
}

/**
 * Data for the Vault Wrapped slideshow.
 */
export interface VaultWrappedData {
  year: number;
  totalFinished: number;
  moviesFinished: number;
  seriesFinished: number;
  booksFinished: number;
  recipesFinished: number;
  moviesHours: number;
  seriesHours: number;
  booksPages: number;
  topGenres: { name: string; count: number }[];
  topItems: MediaItem[];
}

/**
 * Fetches and calculates stats for a given year Vault Wrapped.
 */
export async function getVaultWrappedStats(year: number): Promise<VaultWrappedData> {
  /**
   * The repository instance used for data access.
   */
  const repo = await getMediaRepository();
  /**
   * Complete list of all items fetched to calculate the Wrapped summary.
   */
  const allItems = await repo.findAll();

  // For the sake of the portfolio presentation, we summarize all "completed" items.
  // In a real app with strict date_read columns, we would filter by `year`.
  const finishedItems = allItems.filter(item => ["watched", "read", "cooked"].includes(item.status));

  /**
   * Total number of finished movies.
   */
  let moviesFinished = 0;
  /**
   * Total number of finished series.
   */
  let seriesFinished = 0;
  /**
   * Total number of finished books.
   */
  let booksFinished = 0;
  /**
   * Total number of finished recipes.
   */
  let recipesFinished = 0;
  
  /**
   * Declaration for moviesHours.
   */
  let moviesHours = 0;
  /**
   * Declaration for seriesHours.
   */
  let seriesHours = 0;
  /**
   * Declaration for booksPages.
   */
  let booksPages = 0;
  
  /**
   * Map accumulating counts to determine top genres.
   */
  const genreCount: Record<string, number> = {};
  /**
   * Array collecting the user's top-rated or favorite items.
   */
  const topItems: MediaItem[] = [];

  finishedItems.forEach(item => {
    if (item.type === "movie") {
      moviesFinished++;
      moviesHours += (item.runtime_minutes || 120) / 60;
    }
    if (item.type === "series") {
      seriesFinished++;
      seriesHours += calculateSeriesWatchedMinutes(item) / 60;
    }
    if (item.type === "book") {
      booksFinished++;
      booksPages += item.total_pages || item.pages_read || 300;
    }
    if (item.type === "recipe") {
      recipesFinished++;
    }

    // Tally genres
    if (item.genres && Array.isArray(item.genres)) {
      item.genres.forEach(g => {
        if (!g) return;
        // Clean up genre string (e.g. remove spaces around)
        const cleanG = g.trim();
        genreCount[cleanG] = (genreCount[cleanG] || 0) + 1;
      });
    }

    // Top items: favorites or highly rated (4.5+)
    if (item.is_favorite || (item.user_rating && item.user_rating >= 4.5)) {
      topItems.push(item);
    }
  });

  // Sort genres by frequency
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Sort top items by rating (desc) and take top 6
  topItems.sort((a, b) => (b.user_rating || 0) - (a.user_rating || 0));

  return {
    year,
    totalFinished: finishedItems.length,
    moviesFinished,
    seriesFinished,
    booksFinished,
    recipesFinished,
    moviesHours: Math.round(moviesHours),
    seriesHours: Math.round(seriesHours),
    booksPages,
    topGenres,
    topItems: topItems.slice(0, 6)
  };
}
