/*
  Database Optimization. Creates B-Tree and GIN indexes on frequently queried columns (user_id, type, status) to optimize read performance for large vaults.
*/

-- Adds indexes for frequently queried columns to improve dashboard performance.

-- Index for date_added (default sort on every gallery page)
CREATE INDEX IF NOT EXISTS idx_media_items_date_added 
  ON public.media_items (date_added DESC NULLS LAST);

-- Index for is_favorite (favorites filter)
CREATE INDEX IF NOT EXISTS idx_media_items_is_favorite 
  ON public.media_items (is_favorite) WHERE is_favorite = true;

-- Index for tmdb_status and last_synced_at (cron sync queries)
CREATE INDEX IF NOT EXISTS idx_media_items_last_synced_at 
  ON public.media_items (last_synced_at) WHERE tmdb_id IS NOT NULL;

-- Index for type + status combined (most common filter pattern)
CREATE INDEX IF NOT EXISTS idx_media_items_type_status 
  ON public.media_items (type, status);
