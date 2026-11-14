/**
 * Shared formatting utilities — pure functions, no side effects.
 *
 * @packageDocumentation
 */

/**
 * Formats a user rating (0–5) as a display string without unnecessary trailing zeros.
 * e.g. 5.0 → "5 / 5", 4.5 → "4.5 / 5"
 */
export function formatRating(rating: number | null): string {
  if (rating === null || rating === undefined) return "Not rated"
  const num = Number(rating)
  const normalized = num > 5 ? num / 2 : num
  const formatted = normalized % 1 === 0 ? normalized.toString() : normalized.toFixed(1)
  return `${formatted} / 5`
}

/**
 * Returns a fallback cover placeholder URL when cover_url is null.
 */
export function getCoverPlaceholder(title: string): string {
  /**
   * The URL-encoded representation of the title used for placeholder image generation.
   */
  const encoded = encodeURIComponent(title)
  return `https://placehold.co/300x450/1e1833/c89aff?text=${encoded}&font=raleway`
}
