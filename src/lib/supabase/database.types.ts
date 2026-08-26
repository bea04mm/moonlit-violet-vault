// src/lib/supabase/database.types.ts
// Type-safe database schema types — mirrors the Supabase media_items table.
// Re-generate with: npx supabase gen types typescript --project-id <your-project-id> > src/lib/supabase/database.types.ts

export type MediaType = "movie" | "series" | "book";

export type MediaStatus =
  | "watched"
  | "watching"
  | "want_to_watch"
  | "read"
  | "reading"
  | "want_to_read"
  | "dropped"
  | "on_hold";

export type IngestionSource =
  | "manual"
  | "goodreads_csv"
  | "ocr_screenshot"
  | "api_enrichment";

export interface ReadingSession {
  id: string;
  date: string;
  minutes: number;
  pages_read: number; // The delta of pages read during this session
  notes: string;
}

export interface EpisodeData {
  title: string;
  air_date: string | null;
  runtime_minutes: number | null;
  overview: string | null;
  watched: boolean;
}

export interface SeasonData {
  total: number;
  watched: number;
  episodes: Record<string, EpisodeData>; // Key is episode number (e.g., "1")
}

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  original_title: string | null;
  tmdb_id: number | null;
  google_books_id: string | null;
  goodreads_id: string | null;
  isbn: string | null;
  cover_url: string | null;
  synopsis: string | null;
  genres: string[] | null;
  release_year: number | null;
  runtime_minutes: number | null;
  season_count: number | null;
  episode_count: number | null;
  author: string | null;
  director: string | null;
  status: MediaStatus;
  user_rating: number | null;
  user_notes: string | null;
  is_favorite: boolean;
  pages_read: number;
  total_pages: number | null;
  episodes_seen: number;
  season_progress: Record<string, SeasonData> | null;
  reading_time_minutes: number;
  date_added: string;
  date_completed: string | null;
  last_synced_at: string;
  tmdb_status: string | null;
  next_episode_air_date: string | null;
  start_date: string | null;
  reading_sessions: ReadingSession[] | null;
  ingestion_source: IngestionSource;
  raw_source_data: Record<string, unknown> | null;
  tags: string[] | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

// Supabase Database type shape for createClient generics
export interface Database {
  public: {
    Tables: {
      media_items: {
        Row: MediaItem;
        Insert: Omit<MediaItem, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Omit<MediaItem, "id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      media_type: MediaType;
      media_status: MediaStatus;
      ingestion_source: IngestionSource;
    };
  };
}
