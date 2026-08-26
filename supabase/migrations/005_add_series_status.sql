-- supabase/migrations/005_add_series_status.sql

ALTER TABLE public.media_items
ADD COLUMN tmdb_status VARCHAR(50) DEFAULT NULL,
ADD COLUMN next_episode_air_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
