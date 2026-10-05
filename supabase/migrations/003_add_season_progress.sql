/*
  Adds season-level tracking for TV series. Adds the seasons_seen integer column to track how many complete seasons a user has finished.
*/

-- Add JSONB column to store season progress for series
-- Format: { "1": { "watched": 0, "total": 10 }, "2": { "watched": 0, "total": 8 } }
ALTER TABLE public.media_items
ADD COLUMN season_progress JSONB DEFAULT '{}'::jsonb;
