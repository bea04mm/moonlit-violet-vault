-- supabase/migrations/004_add_last_synced_at.sql

ALTER TABLE public.media_items
ADD COLUMN last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
