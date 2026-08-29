// src/lib/services/mediaService.ts
// Business logic layer — sits between repositories and UI.
// Handles aggregation, formatting helpers, and domain logic.

import { getMediaRepository, type MediaFilters } from "@/lib/repositories/mediaRepository";
import type { MediaItem, MediaType, MediaStatus } from "@/lib/supabase/database.types";



// --- Aggregated stats for dashboard ---
export interface VaultStats {
  totalMovies: number;
  totalSeries: number;
  totalBooks: number;
  watchedMovies: number;
  readBooks: number;
  currentlyWatching: number;
  currentlyReading: number;
}

export async function getVaultStats(): Promise<VaultStats> {
  const repo = await getMediaRepository();
  const [
    totalMovies,
    totalSeries,
    totalBooks,
    watchedMovies,
    readBooks,
    currentlyWatching,
    currentlyReading,
  ] = await Promise.all([
    repo.count({ type: "movie" }),
    repo.count({ type: "series" }),
    repo.count({ type: "book" }),
    repo.count({ type: "movie", status: "watched" }),
    repo.count({ type: "book", status: "read" }),
    repo.count({ status: "watching" }),
    repo.count({ status: "reading" }),
  ]);

  return {
    totalMovies,
    totalSeries,
    totalBooks,
    watchedMovies,
    readBooks,
    currentlyWatching,
    currentlyReading,
  };
}

export async function getMediaList(filters?: MediaFilters): Promise<MediaItem[]> {
  const repo = await getMediaRepository();
  return repo.findAll(filters);
}

export async function getMediaItem(id: string): Promise<MediaItem | null> {
  const repo = await getMediaRepository();
  return repo.findById(id);
}

export async function getRecentlyAdded(limit = 6): Promise<MediaItem[]> {
  const repo = await getMediaRepository();
  return repo.findAll({ sortBy: "date_added", sortOrder: "desc", limit });
}

export async function getCurrentlyConsuming(): Promise<MediaItem[]> {
  const repo = await getMediaRepository();
  const [watching, reading] = await Promise.all([
    repo.findAll({ status: "watching" }),
    repo.findAll({ status: "reading" }),
  ]);
  return [...watching, ...reading];
}

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

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const repo = await getMediaRepository();
  const allItems = await repo.findAll();

  let moviesHours = 0;
  let seriesHours = 0;
  let booksPages = 0;
  let booksHours = 0;
  
  let totalMovies = 0;
  let totalSeries = 0;
  let totalBooks = 0;

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
      let seriesMins = 0;
      if (item.season_progress && Object.values(item.season_progress).some(s => s.episodes)) {
        Object.values(item.season_progress).forEach((season: any) => {
          if (season.episodes) {
            Object.values(season.episodes).forEach((ep: any) => {
              if (ep.watched) {
                seriesMins += ep.runtime_minutes || item.runtime_minutes || 45;
              }
            });
          }
        });
      } else {
        // Fallback estimate if no episode data is available
        const epRuntime = item.runtime_minutes || 45;
        seriesMins = (item.episodes_seen || 0) * epRuntime;
      }
      seriesHours += seriesMins / 60;
    }
    if (item.type === "book") {
      booksPages += item.pages_read || 0;
      booksHours += (item.reading_time_minutes || 0) / 60;
    }

    // 2. Library Distribution
    if (item.type === "movie") totalMovies++;
    if (item.type === "series") totalSeries++;
    if (item.type === "book") totalBooks++;

    // 3. Status Distribution
    if (["watched", "read"].includes(item.status)) statusMap["Completed"]++;
    else if (["watching", "reading"].includes(item.status)) statusMap["In Progress"]++;
    else if (["want_to_watch", "want_to_read"].includes(item.status)) statusMap["Plan to Watch/Read"]++;
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
    ].filter(d => d.value > 0),
    statusDistribution: [
      { name: "Completed", value: statusMap["Completed"], fill: "var(--color-violet-400)" },
      { name: "In Progress", value: statusMap["In Progress"], fill: "var(--color-starlight-500)" },
      { name: "Plan to", value: statusMap["Plan to Watch/Read"], fill: "var(--color-lunar-500)" },
      { name: "Dropped/Hold", value: statusMap["Dropped / On Hold"], fill: "var(--color-lunar-800)" },
    ].filter(d => d.value > 0)
  };
}

export interface VaultWrappedData {
  year: number;
  totalFinished: number;
  moviesFinished: number;
  seriesFinished: number;
  booksFinished: number;
  moviesHours: number;
  seriesHours: number;
  booksPages: number;
  topGenres: { name: string; count: number }[];
  topItems: MediaItem[];
}

export async function getVaultWrappedStats(year: number): Promise<VaultWrappedData> {
  const repo = await getMediaRepository();
  const allItems = await repo.findAll();

  // For the sake of the portfolio presentation, we summarize all "completed" items.
  // In a real app with strict date_read columns, we would filter by `year`.
  const finishedItems = allItems.filter(item => ["watched", "read"].includes(item.status));

  let moviesFinished = 0;
  let seriesFinished = 0;
  let booksFinished = 0;
  
  let moviesHours = 0;
  let seriesHours = 0;
  let booksPages = 0;
  
  const genreCount: Record<string, number> = {};
  const topItems: MediaItem[] = [];

  finishedItems.forEach(item => {
    if (item.type === "movie") {
      moviesFinished++;
      moviesHours += (item.runtime_minutes || 120) / 60;
    }
    if (item.type === "series") {
      seriesFinished++;
      let seriesMins = 0;
      if (item.season_progress && Object.values(item.season_progress).some((s: any) => s.episodes)) {
        Object.values(item.season_progress).forEach((season: any) => {
          if (season.episodes) {
            Object.values(season.episodes).forEach((ep: any) => {
              if (ep.watched) {
                seriesMins += ep.runtime_minutes || item.runtime_minutes || 45;
              }
            });
          }
        });
      } else {
        const epRuntime = item.runtime_minutes || 45;
        seriesMins = (item.episodes_seen || 0) * epRuntime;
      }
      seriesHours += seriesMins / 60;
    }
    if (item.type === "book") {
      booksFinished++;
      booksPages += item.total_pages || item.pages_read || 300;
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
    moviesHours: Math.round(moviesHours),
    seriesHours: Math.round(seriesHours),
    booksPages,
    topGenres,
    topItems: topItems.slice(0, 6)
  };
}
