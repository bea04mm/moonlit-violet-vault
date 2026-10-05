/**
 * Shared formatting utilities — pure functions, no side effects.
 * 
 * @packageDocumentation
 */

/**
 * Formats a runtime in minutes as a human-readable string.
 * e.g. 142 → "2h 22m"
 */
export function formatRuntime(minutes: number | null): string {
  if (!minutes) return "—";
  /**
   * The computed hours component of the runtime.
   */
  const h = Math.floor(minutes / 60);
  /**
   * The computed remainder minutes of the runtime.
   */
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Formats a user rating (0–10) as a display string.
 * e.g. 8.5 → "8.5 / 10"
 */
export function formatRating(rating: number | null): string {
  if (rating === null || rating === undefined) return "Not rated";
  return `${rating.toFixed(1)} / 10`;
}

/**
 * Returns a star count (0–5) from a 0–10 rating for display purposes.
 */
export function ratingToStars(rating: number | null): number {
  if (rating === null) return 0;
  return Math.round(rating / 2);
}

/**
 * Formats an ISO date string as a locale-aware short date.
 * e.g. "2024-03-15T..." → "Mar 15, 2024"
 */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Truncates a string to maxLength characters, appending "…".
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Returns the two-letter language code for a given locale-style title
 * or returns a fallback cover placeholder URL when cover_url is null.
 */
export function getCoverPlaceholder(title: string): string {
  /**
   * The URL-encoded representation of the title used for placeholder image generation.
   */
  const encoded = encodeURIComponent(title);
  return `https://placehold.co/300x450/1e1833/c89aff?text=${encoded}&font=raleway`;
}
