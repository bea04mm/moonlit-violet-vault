/*
  Adds the last_synced_at timestamp column. This tracks when a media item (usually an ongoing TV series) was last updated from external APIs (like TMDB).
*/

ALTER TABLE public.media_items
ADD COLUMN last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
