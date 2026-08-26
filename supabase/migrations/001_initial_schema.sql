-- supabase/migrations/001_initial_schema.sql
-- Moonlit Violet Vault — Initial Database Schema
-- Apply via: Supabase Studio → SQL Editor, or supabase db push

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE media_type AS ENUM ('movie', 'series', 'book');

CREATE TYPE media_status AS ENUM (
  'watched',
  'watching',
  'want_to_watch',
  'read',
  'reading',
  'want_to_read',
  'dropped',
  'on_hold'
);

CREATE TYPE ingestion_source AS ENUM (
  'manual',
  'goodreads_csv',
  'ocr_screenshot',
  'api_enrichment'
);

-- ============================================================
-- CORE TABLE
-- ============================================================

CREATE TABLE media_items (
  id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  type             media_type    NOT NULL,
  title            TEXT          NOT NULL,
  original_title   TEXT,

  -- External IDs (for deduplication and enrichment)
  tmdb_id          INTEGER       UNIQUE,
  google_books_id  TEXT          UNIQUE,
  isbn             TEXT,

  -- Enriched metadata
  cover_url        TEXT,
  synopsis         TEXT,
  genres           TEXT[],
  release_year     SMALLINT,
  runtime_minutes  SMALLINT,
  season_count     SMALLINT,
  episode_count    SMALLINT,
  author           TEXT,
  director         TEXT,

  -- User personal state
  status           media_status  NOT NULL DEFAULT 'want_to_watch',
  user_rating      NUMERIC(3,1)  CHECK (user_rating >= 0 AND user_rating <= 10),
  user_notes       TEXT,
  date_added       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  date_completed   TIMESTAMPTZ,

  -- Pipeline audit trail
  ingestion_source ingestion_source NOT NULL DEFAULT 'manual',
  raw_source_data  JSONB,

  -- Timestamps (auto-managed)
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON media_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INDEXES — optimised for common query patterns
-- ============================================================

CREATE INDEX idx_media_items_type         ON media_items (type);
CREATE INDEX idx_media_items_status       ON media_items (status);
CREATE INDEX idx_media_items_release_year ON media_items (release_year DESC);
CREATE INDEX idx_media_items_user_rating  ON media_items (user_rating DESC NULLS LAST);
CREATE INDEX idx_media_items_date_added   ON media_items (date_added DESC);
CREATE INDEX idx_media_items_genres       ON media_items USING GIN (genres);
-- Full-text search on title and synopsis
CREATE INDEX idx_media_items_title_fts    ON media_items USING GIN (to_tsvector('english', title));

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

-- Single-user vault: allow all operations on all rows.
-- When adding multi-user support, replace with: USING (auth.uid() = owner_id)
CREATE POLICY "allow_all_authenticated"
  ON media_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
