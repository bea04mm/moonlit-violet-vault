-- supabase/migrations/008_add_recipes.sql

-- 1. Add new enum values (cannot be done inside a transaction easily in older PG versions, but Supabase supports it if done carefully, though adding enum values cannot be rolled back).
ALTER TYPE media_type ADD VALUE IF NOT EXISTS 'recipe';
ALTER TYPE media_status ADD VALUE IF NOT EXISTS 'cooked';
ALTER TYPE media_status ADD VALUE IF NOT EXISTS 'want_to_cook';

-- 2. Add recipe-specific columns to media_items
ALTER TABLE media_items 
  ADD COLUMN IF NOT EXISTS ingredients JSONB,
  ADD COLUMN IF NOT EXISTS instructions JSONB,
  ADD COLUMN IF NOT EXISTS recipe_yield TEXT,
  ADD COLUMN IF NOT EXISTS prep_time_minutes SMALLINT,
  ADD COLUMN IF NOT EXISTS cook_time_minutes SMALLINT;
