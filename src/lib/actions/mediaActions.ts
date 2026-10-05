/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @module
 * 
 * Server Actions that form the main API boundary between client components and
 * the vault's backend (Supabase via the repository layer and external APIs).
 *
 * Actions here handle:
 *  - External media search (TMDB, Google Books, TheMealDB)
 *  - Adding, updating, and deleting vault items
 *  - Series season sync from TMDB
 *  - Book search helpers (Google Books + OpenLibrary fallback)
 *
 * All functions are marked "use server" so they run on the server only and
 * can safely access environment variables (API keys, DB credentials).
 */
"use server";

import { revalidatePath } from "next/cache";
import { getMediaRepository } from "@/lib/repositories/mediaRepository";
import type { MediaItem, MediaType, SeasonData } from "@/lib/supabase/database.types";
import type { TmdbMovieResponse, GoogleBooksItem, MealDbMeal, TmdbSeason, TmdbEpisode } from "@/types";

/**
 * Normalised search result returned by `searchExternalMedia`.
 * This is the shape passed to `addMediaToVault` to create a new vault item.
 */
export interface SearchResult {
  /**
   * TMDB numeric ID (as string) or Google Books volume ID.
   */
  externalId: string;
  type: MediaType;
  title: string;
  originalTitle?: string;
  coverUrl?: string;
  releaseYear?: number;
  synopsis?: string;
  genres?: string[];
  /**
   * Author name — books only.
   */
  author?: string;
  totalPages?: number;
  runtimeMinutes?: number;
  episodeCount?: number;
  seasonCount?: number;
}

/**
 * The API key for accessing The Movie Database (TMDB) services.
 */
const TMDB_API_KEY = process.env.TMDB_API_KEY;
/**
 * The API key for accessing Google Books API services.
 */
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

/**
 * Searches the appropriate external API for media matching the given query.
 * - Movies/Series → TMDB
 * - Books → Google Books (falls back to OpenLibrary if quota exceeded)
 * - Recipes → TheMealDB
 * @returns Up to 5 normalised `SearchResult` objects ready for display.
 */
export async function searchExternalMedia(
  query: string,
  type: MediaType
): Promise<SearchResult[]> {
  if (!query) return [];

  if (type === "movie" || type === "series") {
    if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY is missing from environment variables.");

    /**
     * The TMDB API endpoint dynamically selected based on the media type (movie or series).
     */
    const endpoint = type === "movie" ? "/search/movie" : "/search/tv";
    /**
     * The raw fetch response object from the TMDB API.
     */
    const res = await fetch(
      `https://api.themoviedb.org/3${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch from TMDB (Status: ${res.status}): ${errorText}`);
    }
    /**
     * The parsed JSON data payload containing the TMDB search results.
     */
    const data = await res.json();

    return (data.results || []).slice(0, 5).map((item: TmdbMovieResponse) => ({
      externalId: String(item.id),
      type,
      title: type === "movie" ? item.title : item.name,
      originalTitle: type === "movie" ? item.original_title : item.original_name,
      coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
      releaseYear: item.release_date
        ? parseInt(item.release_date.substring(0, 4))
        : item.first_air_date
        ? parseInt(item.first_air_date.substring(0, 4))
        : undefined,
      synopsis: item.overview || undefined,
    }));
  } else if (type === "book") {
    if (!GOOGLE_BOOKS_API_KEY) throw new Error("GOOGLE_BOOKS_API_KEY is missing from environment variables.");
    
    // Check if query is an ISBN (just numbers/dashes and length 10-13)
    const isIsbn = /^[\d-]{10,17}$/.test(query);
    /**
     * The constructed search query targeting either an ISBN or a general title search.
     */
    const searchQuery = isIsbn ? `isbn:${query.replace(/-/g, "")}` : encodeURIComponent(query);

    /**
     * The fetch response object from the Google Books API.
     */
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=5`
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch from Google Books (Status: ${res.status}): ${errorText}`);
    }
    /**
     * The parsed JSON data payload containing the Google Books search results.
     */
    const data = await res.json();

    return (data.items || []).map((item: GoogleBooksItem) => {
      const info = item.volumeInfo;
      let coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
      if (coverUrl) {
        coverUrl = coverUrl.replace("http://", "https://").replace("&edge=curl", "");
      }

      return {
        externalId: item.id,
        type: "book",
        title: info.title || "",
        coverUrl,
        releaseYear: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : undefined,
        synopsis: info.description || undefined,
        author: info.authors ? info.authors.join(", ") : undefined,
        totalPages: info.pageCount ? parseInt(String(info.pageCount)) : undefined,
      };
    });
  } else if (type === "recipe") {
    /**
     * The fetch response object from TheMealDB API.
     */
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Failed to fetch recipes from TheMealDB");
    /**
     * The parsed JSON data payload containing TheMealDB search results.
     */
    const data = await res.json();
    return (data.meals || []).slice(0, 5).map((meal: MealDbMeal) => {
      // Reconstruct ingredients and measurements from TheMealDB's flat numbered structure (1-20)
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
          ingredients.push(`${measure ? measure.trim() + " " : ""}${ingredient.trim()}`);
        }
      }
      
      // Split raw instruction text by line breaks to form an array of steps
      const instructions = meal.strInstructions 
        ? meal.strInstructions.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean)
        : [];

      return {
        externalId: meal.idMeal,
        type: "recipe",
        title: meal.strMeal,
        coverUrl: meal.strMealThumb,
        genres: [meal.strCategory, meal.strArea].filter((g): g is string => Boolean(g)),
        author: meal.strSource ? new URL(meal.strSource).hostname.replace("www.", "") : undefined,
        // Extended attributes for addMediaToVault
        _ingredients: ingredients,
        _instructions: instructions,
        _source_url: meal.strSource || meal.strYoutube,
      } as SearchResult & { _ingredients?: string[], _instructions?: string[], _source_url?: string };
    });
  }

  return [];
}

/**
 * Fetches detailed episode data for each season of a TV series from TMDB.
 * Preserves existing watched state from `existingProgress` so we never lose
 * the user's progress when re-syncing.
 * @param tmdbId - The TMDB series ID.
 * @param existingProgress - The current season_progress JSON from the DB (may be null).
 * @param seasonsList - The seasons array from the TMDB series details response.
 */
async function fetchTmdbSeasonProgress(
  tmdbId: string | number,
  existingProgress: Record<string, SeasonData> | null = null,
  seasonsList: TmdbSeason[]
): Promise<Record<string, SeasonData>> {
  /**
   * The new progress object to be populated and returned, initialized with existing progress.
   */
  const newProgress: Record<string, SeasonData> = existingProgress ? { ...existingProgress } : {};

  /**
   * Array of Promises fetching detailed data for each season concurrently.
   */
  const seasonPromises = seasonsList
    .filter((s: TmdbSeason) => s.episode_count > 0)
    .map(async (s: TmdbSeason) => {
      const sNum = s.season_number.toString();
      const seasonRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${s.season_number}?api_key=${TMDB_API_KEY}`);
      
      if (seasonRes.ok) {
        const seasonData = await seasonRes.json();
         
        const episodes: Record<string, any> = {};
        let watchedCount = 0;
        
        if (seasonData.episodes) {
          seasonData.episodes.forEach((ep: TmdbEpisode) => {
            const epNum = ep.episode_number.toString();
            const wasWatched = newProgress[sNum]?.episodes?.[epNum]?.watched || false;
            if (wasWatched) watchedCount++;
            
            episodes[epNum] = {
              title: ep.name,
              air_date: ep.air_date,
              runtime_minutes: ep.runtime || null,
              overview: ep.overview,
              watched: wasWatched,
            };
          });
        }
        
        return {
          seasonNumber: sNum,
          data: {
            total: s.episode_count,
            watched: watchedCount,
            episodes
          }
        };
      }
      return null;
    });

  /**
   * Results from the concurrent season data fetches, containing season details and episodes.
   */
  const resolvedSeasons = await Promise.all(seasonPromises);
  resolvedSeasons.forEach(rs => {
    if (rs) newProgress[rs.seasonNumber] = rs.data as SeasonData;
  });

  return newProgress;
}

/**
 * Adds a search result to the vault as a new `media_items` row.
 * For movies and series, fetches deep details from TMDB (runtime, seasons, episodes)
 * before inserting. New items default to "want_to_watch / want_to_read / want_to_cook".
 * Calls `revalidatePath` to refresh the entire layout after insertion.
 */
export async function addMediaToVault(result: SearchResult): Promise<void> {
  /**
   * The repository instance used to insert the new media item.
   */
  const repo = await getMediaRepository();
  
  // Fetch deep details for TMDB items (runtime, episodes, seasons)
  let runtimeMinutes = result.runtimeMinutes;
  /**
   * Total number of episodes in the series.
   */
  let episodeCount = result.episodeCount;
  /**
   * Total number of seasons in the series.
   */
  let seasonCount = result.seasonCount;
  /**
   * Detailed progress structure representing seasons and episodes for series.
   */
  let seasonProgress: Record<string, SeasonData> | null = null;
  /**
   * Current status of the media on TMDB (e.g. "Returning Series", "Ended").
   */
  let tmdbStatus: string | null = null;
  /**
   * Air date of the next episode if the series is ongoing.
   */
  let nextEpisodeAirDate: string | null = null;

  if (result.type === "movie" || result.type === "series") {
    /**
     * The TMDB API endpoint dynamically selected to fetch deep details.
     */
    const endpoint = result.type === "movie" ? `/movie/${result.externalId}` : `/tv/${result.externalId}`;
    /**
     * The fetch response object from the TMDB detailed item request.
     */
    const tmdbRes = await fetch(`https://api.themoviedb.org/3${endpoint}?api_key=${TMDB_API_KEY}`);
    
    if (tmdbRes.ok) {
      const details = await tmdbRes.json();
      if (result.type === "movie") {
        runtimeMinutes = details.runtime;
        tmdbStatus = details.status;
      } else {
        episodeCount = details.number_of_episodes;
        seasonCount = details.number_of_seasons;
        tmdbStatus = details.status;
        nextEpisodeAirDate = details.next_episode_to_air?.air_date || null;
        
        if (details.episode_run_time && details.episode_run_time.length > 0) {
          runtimeMinutes = details.episode_run_time[0];
        }
        
        if (details.seasons && Array.isArray(details.seasons)) {
          seasonProgress = await fetchTmdbSeasonProgress(result.externalId, null, details.seasons);
        }
      }
    }
  }

  /**
   * The new media item object to be inserted into the database.
   */
  const newItem: Partial<MediaItem> = {
    type: result.type,
    title: result.title,
    original_title: result.originalTitle,
    cover_url: result.coverUrl,
    release_year: result.releaseYear,
    synopsis: result.synopsis,
    author: result.author,
    total_pages: result.totalPages,
    runtime_minutes: runtimeMinutes,
    episode_count: episodeCount,
    season_count: seasonCount,
    season_progress: seasonProgress,
    tmdb_status: tmdbStatus,
    next_episode_air_date: nextEpisodeAirDate,
    status: result.type === "book" ? "want_to_read" : result.type === "recipe" ? "want_to_cook" : "want_to_watch",
    ingestion_source: "api_enrichment",
    ingredients: (result as any)._ingredients || null,
    instructions: (result as any)._instructions || null,
    // Link external IDs
    ...(result.type === "book" ? { google_books_id: result.externalId } : result.type === "recipe" ? { raw_source_data: { the_meal_db_id: result.externalId } } : { tmdb_id: parseInt(result.externalId) }),
  };

  await repo.insert(newItem);

  // Revalidate UI so the new item appears instantly
  revalidatePath("/", "layout");
}

/**
 * Creates a new recipe item with manually entered ingredients and instructions.
 * Parses the multi-line textarea values into arrays (one item per line).
 * @returns The UUID of the newly created recipe item.
 */
export async function createManualRecipe(formData: FormData): Promise<string> {
  /**
   * The repository instance used to save the new manual recipe.
   */
  const repo = await getMediaRepository();
  
  /**
   * Extracted recipe title from the form data.
   */
  const title = formData.get("title") as string;
  /**
   * Optional cover URL for the recipe.
   */
  const coverUrl = formData.get("cover_url") as string;
  /**
   * Raw multi-line string containing ingredients.
   */
  const ingredientsStr = formData.get("ingredients") as string;
  /**
   * Raw multi-line string containing instructions.
   */
  const instructionsStr = formData.get("instructions") as string;
  
  if (!title) throw new Error("Title is required");

  /**
   * Array of trimmed ingredient strings.
   */
  const ingredients = ingredientsStr ? ingredientsStr.split('\n').map(s => s.trim()).filter(Boolean) : [];
  /**
   * Array of trimmed instruction strings.
   */
  const instructions = instructionsStr ? instructionsStr.split('\n').map(s => s.trim()).filter(Boolean) : [];

  /**
   * The new recipe object structured for insertion.
   */
  const newItem: Partial<MediaItem> = {
    type: "recipe",
    title: title,
    cover_url: coverUrl || undefined,
    ingredients,
    instructions,
    status: "want_to_cook",
    ingestion_source: "manual",
  };

  /**
   * The saved media item record returned by the database.
   */
  const saved = await repo.insert(newItem);
  revalidatePath("/", "layout");
  return saved.id;
}

/**
 * Updates fields on an existing vault item and persists them to the database.
 * Auto-fills `start_date` when status changes to "reading"/"watching" and
 * auto-fills `date_completed` when status changes to "read"/"watched" —
 * only if those dates are not already set.
 * @param id - UUID of the media item to update.
 * @param updates - Partial fields to overwrite (undefined values are stripped).
 */
export async function updateMediaProgress(
  id: string,
  updates: Partial<MediaItem>
): Promise<void> {
  /**
   * The repository instance used to fetch and update the media item.
   */
  const repo = await getMediaRepository();
  
  // Clean up unknown undefined values
  const cleanedUpdates = Object.fromEntries(
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  );

  /**
   * The current media item state before updates are applied.
   */
  const currentItem = await repo.findById(id);
  
  if (currentItem) {
    // Auto-fill start date
    if (
      (cleanedUpdates.status === "reading" || cleanedUpdates.status === "watching") &&
      !currentItem.start_date &&
      !cleanedUpdates.start_date
    ) {
      cleanedUpdates.start_date = new Date().toISOString();
    }
    
    // Auto-fill completed date
    if (
      (cleanedUpdates.status === "read" || cleanedUpdates.status === "watched") &&
      !currentItem.date_completed &&
      !cleanedUpdates.date_completed
    ) {
      cleanedUpdates.date_completed = new Date().toISOString();
    }
  }

  await repo.update(id, cleanedUpdates);

  // Revalidate everything so the UI instantly shows the new stats
  revalidatePath("/", "layout");
}

/**
 * Permanently removes an item from the vault and revalidates all cached pages.
 */
export async function deleteMediaFromVault(id: string): Promise<void> {
  /**
   * The repository instance used to delete the media item.
   */
  const repo = await getMediaRepository();
  await repo.delete(id);
  
  revalidatePath("/", "layout");
}

/**
 * Fetches all media items for the command palette.
 */
export async function getAllMediaAction(): Promise<MediaItem[]> {
  /**
   * The repository instance used to retrieve all media items.
   */
  const repo = await getMediaRepository();
  return repo.findAll();
}

/**
 * Syncs TV series seasons and episodes from TMDB.
 */
export async function syncSeriesSeasons(id: string, tmdbId: number): Promise<void> {
  /**
   * The repository instance used to fetch and update the series.
   */
  const repo = await getMediaRepository();
  /**
   * The current media item state being synced.
   */
  const currentItem = await repo.findById(id);
  
  if (!currentItem || currentItem.type !== "series") return;

  /**
   * The raw fetch response object from the TMDB series details endpoint.
   */
  const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`);
  if (!res.ok) throw new Error("Failed to sync with TMDB.");
  
  /**
   * The parsed JSON data payload containing the TMDB series details.
   */
  const details = await res.json();
  /**
   * Total number of episodes available for the series.
   */
  const newEpisodeCount = details.number_of_episodes;
  /**
   * Total number of seasons available for the series.
   */
  const newSeasonCount = details.number_of_seasons;
  /**
   * Current status of the series on TMDB (e.g. "Returning Series", "Ended").
   */
  const tmdbStatus = details.status;
  /**
   * Air date of the next episode if the series is ongoing.
   */
  const nextEpisodeAirDate = details.next_episode_to_air?.air_date || null;
  
  /**
   * Average runtime of episodes in minutes.
   */
  let newRuntimeMinutes = currentItem.runtime_minutes;
  if (details.episode_run_time && details.episode_run_time.length > 0) {
    newRuntimeMinutes = details.episode_run_time[0];
  }
  
  // Merge existing progress with new seasons
  let newSeasonProgress: Record<string, SeasonData> = 
    currentItem.season_progress ? { ...(currentItem.season_progress as Record<string, SeasonData>) } : {};

  if (details.seasons && Array.isArray(details.seasons)) {
    newSeasonProgress = await fetchTmdbSeasonProgress(tmdbId, newSeasonProgress, details.seasons);
  }

  await repo.update(id, {
    episode_count: newEpisodeCount,
    season_count: newSeasonCount,
    season_progress: newSeasonProgress,
    tmdb_status: tmdbStatus,
    next_episode_air_date: nextEpisodeAirDate,
    runtime_minutes: newRuntimeMinutes,
    last_synced_at: new Date().toISOString(),
  });

  revalidatePath("/", "layout");
}

/**
 * Searches the OpenLibrary API for book metadata as a fallback when Google Books fails.
 */
async function searchOpenLibrary(query: string) {
  try {
    /**
     * The fetch response object from the OpenLibrary search API.
     */
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`, { cache: 'no-store' });
    /**
     * The parsed JSON data payload containing the OpenLibrary search results.
     */
    const data = await res.json();
    if (!data.docs) return [];
    
    // Fetch full descriptions in parallel from the Works API
    const docsWithDesc = await Promise.all(data.docs.map(async (doc: any) => {
      let description = doc.first_sentence ? doc.first_sentence[0] : "";
      try {
        if (doc.key) {
          const workRes = await fetch(`https://openlibrary.org${doc.key}.json`, { cache: 'no-store' });
          if (workRes.ok) {
            const workData = await workRes.json();
            if (workData.description) {
              description = typeof workData.description === 'string' 
                ? workData.description 
                : workData.description.value || description;
            }
          }
        }
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      } catch (e) {
        // ignore errors for individual description fetches
      }
      return { ...doc, full_description: description };
    }));

    // Map OpenLibrary to Google Books format for seamless UI integration
    return docsWithDesc.map((doc: any) => ({
      id: doc.key,
      volumeInfo: {
        title: doc.title,
        authors: doc.author_name,
        publishedDate: doc.first_publish_year?.toString(),
        description: doc.full_description,
        categories: doc.subject?.slice(0, 3) || [],
        pageCount: doc.number_of_pages_median,
        imageLinks: doc.cover_i ? {
          thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
          smallThumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        } : null
      }
    }));
  } catch (err) {
    console.error("OpenLibrary fallback failed", err);
    return [];
  }
}

/**
 * Searches Google Books for book metadata.
 */
export async function searchGoogleBooks(query: string) {
  try {
    /**
     * The API key for accessing Google Books API services.
     */
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    /**
     * The constructed URL for the Google Books API request.
     */
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10${apiKey ? `&key=${apiKey}` : ""}`;
    /**
     * The fetch response object from the Google Books API.
     */
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.warn("Google Books API quota exceeded or failed. Falling back to OpenLibrary...");
      return await searchOpenLibrary(query);
    }
    /**
     * The parsed JSON data payload containing the Google Books search results.
     */
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.warn("Failed to search Google Books, trying OpenLibrary...", error);
    return await searchOpenLibrary(query);
  }
}
