/**
 * Application-wide constants shared between components, actions, and utilities.
 * Centralising labels and colours here means a single place to update wording or theming.
 * 
 * @packageDocumentation
 */

import type { MediaType, MediaStatus } from "@/lib/supabase/database.types";

/**
 * Human-readable display labels for every media status value.
 * Consumed by Badge chips, select dropdowns, and analytics charts.
 */
export const STATUS_LABELS: Record<MediaStatus, string> = {
  watched: "Watched",
  watching: "Watching",
  want_to_watch: "Want to Watch",
  read: "Read",
  reading: "Reading",
  want_to_read: "Want to Read",
  dropped: "Dropped",
  on_hold: "On Hold",
  want_to_cook: "Want to Cook",
  cooked: "Cooked",
};

/**
 * Tailwind CSS class strings for coloured status badge chips.
 * Each key corresponds to a `MediaStatus` value and maps to a
 * background / text / border colour combination matching the vault palette.
 */
export const STATUS_COLORS: Record<MediaStatus, string> = {
  watched: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  watching: "bg-blossom-500/20 text-blossom-300 border-blossom-500/30",
  want_to_watch: "bg-lunar-700/40 text-lunar-300 border-lunar-600/30",
  read: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  reading: "bg-blossom-500/20 text-blossom-300 border-blossom-500/30",
  want_to_read: "bg-lunar-700/40 text-lunar-300 border-lunar-600/30",
  dropped: "bg-starlight-600/20 text-starlight-400 border-starlight-600/30",
  on_hold: "bg-lunar-600/20 text-lunar-400 border-lunar-600/30",
  want_to_cook: "bg-lunar-700/40 text-lunar-300 border-lunar-600/30",
  cooked: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

/**
 * Human-readable display labels for every media type.
 * Used in dashboard type tabs, command palette groupings, and card badges.
 */
export const TYPE_LABELS: Record<MediaType, string> = {
  movie: "Movie",
  series: "Series",
  book: "Book",
  recipe: "Recipe",
};
