/*
  Adds the reading_journal JSONB column. Stores an array of journal entries (dates and notes) for logging daily thoughts while reading a book.
*/

ALTER TABLE public.media_items
ADD COLUMN start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN reading_sessions JSONB DEFAULT '[]'::jsonb;

-- Force Supabase to refresh its API cache so the new columns are immediately available
NOTIFY pgrst, 'reload schema';
