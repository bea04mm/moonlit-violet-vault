/*
  Custom Franchises & Sagas Schema.
  Creates the franchises table for storing user-created cinematic universes and dynamic viewing checklists with RLS policies and auto-updated timestamps.
*/

CREATE TABLE IF NOT EXISTS public.franchises (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  short_name   TEXT NOT NULL,
  tagline      TEXT,
  accent_color TEXT DEFAULT '#8B6CE8',
  items        JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at trigger
CREATE TRIGGER set_franchises_updated_at
  BEFORE UPDATE ON public.franchises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated vault user
CREATE POLICY "allow_all_authenticated_franchises"
  ON public.franchises
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
