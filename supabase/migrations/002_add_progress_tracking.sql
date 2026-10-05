/*
  Adds progress tracking columns to media_items. Specifically adds is_favorite, pages_read, total_pages, episodes_seen, and reading_time_minutes to support fine-grained progress logging.
*/

-- Add new columns for advanced tracking and logging
ALTER TABLE public.media_items
ADD COLUMN is_favorite BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN pages_read INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN total_pages INTEGER NULL,
ADD COLUMN episodes_seen INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN reading_time_minutes INTEGER DEFAULT 0 NOT NULL;

-- Note: user_notes (for reviews), runtime_minutes, season_count, episode_count, and user_rating 
-- already exist in the 001_initial_schema.sql file!
