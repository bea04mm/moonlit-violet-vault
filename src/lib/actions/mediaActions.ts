// src/lib/actions/mediaActions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getMediaRepository } from "@/lib/repositories/mediaRepository";
import type { MediaItem, MediaType, SeasonData } from "@/lib/supabase/database.types";

export interface SearchResult {
  externalId: string; // TMDB ID or Google Books ID
  type: MediaType;
  title: string;
  originalTitle?: string;
  coverUrl?: string;
  releaseYear?: number;
  synopsis?: string;
  genres?: string[];
  author?: string; // Books only
  totalPages?: number;
  runtimeMinutes?: number;
  episodeCount?: number;
  seasonCount?: number;
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

export async function searchExternalMedia(
  query: string,
  type: MediaType
): Promise<SearchResult[]> {
  if (!query) return [];

  if (type === "movie" || type === "series") {
    if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY is missing from environment variables.");

    const endpoint = type === "movie" ? "/search/movie" : "/search/tv";
    const res = await fetch(
      `https://api.themoviedb.org/3${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch from TMDB (Status: ${res.status}): ${errorText}`);
    }
    const data = await res.json();

    return (data.results || []).slice(0, 5).map((item: any) => ({
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
    const searchQuery = isIsbn ? `isbn:${query.replace(/-/g, "")}` : encodeURIComponent(query);

    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=5`
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch from Google Books (Status: ${res.status}): ${errorText}`);
    }
    const data = await res.json();

    return (data.items || []).map((item: any) => {
      const info = item.volumeInfo;
      let coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
      if (coverUrl) {
        coverUrl = coverUrl.replace("http://", "https://").replace("&edge=curl", "");
      }

      return {
        externalId: item.id,
        type: "book",
        title: info.title,
        coverUrl,
        releaseYear: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : undefined,
        synopsis: info.description || undefined,
        author: info.authors ? info.authors.join(", ") : undefined,
        totalPages: info.pageCount ? parseInt(info.pageCount) : undefined,
      };
    });
  } else if (type === "recipe") {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Failed to fetch recipes from TheMealDB");
    const data = await res.json();
    return (data.meals || []).slice(0, 5).map((meal: any) => {
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
          ingredients.push(`${measure ? measure.trim() + " " : ""}${ingredient.trim()}`);
        }
      }
      const instructions = meal.strInstructions 
        ? meal.strInstructions.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean)
        : [];

      return {
        externalId: meal.idMeal,
        type: "recipe",
        title: meal.strMeal,
        coverUrl: meal.strMealThumb,
        genres: [meal.strCategory, meal.strArea].filter(Boolean),
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

export async function addMediaToVault(result: SearchResult): Promise<void> {
  const repo = await getMediaRepository();
  
  // Fetch deep details for TMDB items (runtime, episodes, seasons)
  let runtimeMinutes = result.runtimeMinutes;
  let episodeCount = result.episodeCount;
  let seasonCount = result.seasonCount;
  let seasonProgress: Record<string, SeasonData> | null = null;
  let tmdbStatus: string | null = null;
  let nextEpisodeAirDate: string | null = null;

  if (result.type === "movie" || result.type === "series") {
    const endpoint = result.type === "movie" ? `/movie/${result.externalId}` : `/tv/${result.externalId}`;
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
          seasonProgress = {};
          
          const seasonPromises = details.seasons
            .filter((s: any) => s.episode_count > 0)
            .map(async (s: any) => {
              const sNum = s.season_number.toString();
              const seasonRes = await fetch(`https://api.themoviedb.org/3/tv/${result.externalId}/season/${s.season_number}?api_key=${TMDB_API_KEY}`);
              if (seasonRes.ok) {
                const seasonData = await seasonRes.json();
                const episodes: Record<string, any> = {};
                if (seasonData.episodes) {
                  seasonData.episodes.forEach((ep: any) => {
                    episodes[ep.episode_number.toString()] = {
                      title: ep.name,
                      air_date: ep.air_date,
                      runtime_minutes: ep.runtime || null,
                      overview: ep.overview,
                      watched: false,
                    };
                  });
                }
                return {
                  seasonNumber: sNum,
                  data: {
                    total: s.episode_count,
                    watched: 0,
                    episodes
                  }
                };
              }
              return null;
            });
            
          const resolvedSeasons = await Promise.all(seasonPromises);
          resolvedSeasons.forEach(rs => {
            if (rs) seasonProgress![rs.seasonNumber] = rs.data as SeasonData;
          });
        }
      }
    }
  }

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

export async function createManualRecipe(formData: FormData): Promise<string> {
  const repo = await getMediaRepository();
  
  const title = formData.get("title") as string;
  const coverUrl = formData.get("cover_url") as string;
  const ingredientsStr = formData.get("ingredients") as string;
  const instructionsStr = formData.get("instructions") as string;
  
  if (!title) throw new Error("Title is required");

  const ingredients = ingredientsStr ? ingredientsStr.split('\n').map(s => s.trim()).filter(Boolean) : [];
  const instructions = instructionsStr ? instructionsStr.split('\n').map(s => s.trim()).filter(Boolean) : [];

  const newItem: Partial<MediaItem> = {
    type: "recipe",
    title: title,
    cover_url: coverUrl || undefined,
    ingredients,
    instructions,
    status: "want_to_cook",
    ingestion_source: "manual",
  };

  const saved = await repo.insert(newItem);
  revalidatePath("/", "layout");
  return saved.id;
}

export async function updateMediaProgress(
  id: string,
  updates: Partial<MediaItem>
): Promise<void> {
  const repo = await getMediaRepository();
  
  // Clean up any undefined values
  const cleanedUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  );

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

export async function deleteMediaFromVault(id: string, type: MediaType): Promise<void> {
  const repo = await getMediaRepository();
  await repo.delete(id);
  
  revalidatePath("/", "layout");
}

export async function getAllMediaAction(): Promise<MediaItem[]> {
  const repo = await getMediaRepository();
  return repo.findAll();
}

export async function syncSeriesSeasons(id: string, tmdbId: number): Promise<void> {
  const repo = await getMediaRepository();
  const currentItem = await repo.findById(id);
  
  if (!currentItem || currentItem.type !== "series") return;

  const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`);
  if (!res.ok) throw new Error("Failed to sync with TMDB.");
  
  const details = await res.json();
  const newEpisodeCount = details.number_of_episodes;
  const newSeasonCount = details.number_of_seasons;
  const tmdbStatus = details.status;
  const nextEpisodeAirDate = details.next_episode_to_air?.air_date || null;
  
  let newRuntimeMinutes = currentItem.runtime_minutes;
  if (details.episode_run_time && details.episode_run_time.length > 0) {
    newRuntimeMinutes = details.episode_run_time[0];
  }
  
  // Merge existing progress with new seasons
  let newSeasonProgress: Record<string, SeasonData> = 
    currentItem.season_progress ? { ...(currentItem.season_progress as Record<string, SeasonData>) } : {};

  if (details.seasons && Array.isArray(details.seasons)) {
    const seasonPromises = details.seasons
      .filter((s: any) => s.episode_count > 0)
      .map(async (s: any) => {
        const sNum = s.season_number.toString();
        const seasonRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${s.season_number}?api_key=${TMDB_API_KEY}`);
        
        if (seasonRes.ok) {
           const seasonData = await seasonRes.json();
           const episodes: Record<string, any> = {};
           let watchedCount = 0;
           
           if (seasonData.episodes) {
             seasonData.episodes.forEach((ep: any) => {
               const epNum = ep.episode_number.toString();
               const wasWatched = newSeasonProgress[sNum]?.episodes?.[epNum]?.watched || false;
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

    const resolvedSeasons = await Promise.all(seasonPromises);
    resolvedSeasons.forEach(rs => {
      if (rs) newSeasonProgress[rs.seasonNumber] = rs.data as SeasonData;
    });
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

async function searchOpenLibrary(query: string) {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`, { cache: 'no-store' });
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

export async function searchGoogleBooks(query: string) {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10${apiKey ? `&key=${apiKey}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.warn("Google Books API quota exceeded or failed. Falling back to OpenLibrary...");
      return await searchOpenLibrary(query);
    }
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.warn("Failed to search Google Books, trying OpenLibrary...", error);
    return await searchOpenLibrary(query);
  }
}
