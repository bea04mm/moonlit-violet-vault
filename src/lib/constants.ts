/**
 * Application-wide constants shared between components, actions, and utilities.
 * Centralising labels and colours here means a single place to update wording or theming.
 *
 * @packageDocumentation
 */

import type { MediaType, MediaStatus } from "@/lib/supabase/database.types"

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
}

/**
 * Tailwind CSS class strings for coloured status badge chips.
 * Each key corresponds to a `MediaStatus` value and maps to a
 * background / text / border colour combination matching the vault palette
 * with verified high contrast in both dark and light modes.
 */
export const STATUS_COLORS: Record<MediaStatus, string> = {
  watched: "badge-status-completed",
  read: "badge-status-completed",
  cooked: "badge-status-completed",
  watching: "badge-status-in-progress",
  reading: "badge-status-in-progress",
  want_to_watch: "badge-status-plan",
  want_to_read: "badge-status-plan",
  want_to_cook: "badge-status-plan",
  on_hold: "badge-status-on-hold",
  dropped: "badge-status-dropped",
}

/**
 * Dynamic theme CSS class strings for media type badges (Movie, Series, Book, Recipe).
 * Connected to custom-tunable CSS variables in both light and dark modes.
 */
export const TYPE_COLORS: Record<MediaType, string> = {
  movie: "badge-type-movie",
  series: "badge-type-series",
  book: "badge-type-book",
  recipe: "badge-type-recipe",
}

/**
 * Human-readable display labels for every media type.
 * Used in dashboard type tabs, command palette groupings, and card badges.
 */
export const TYPE_LABELS: Record<MediaType, string> = {
  movie: "Movie",
  series: "Series",
  book: "Book",
  recipe: "Recipe",
}
