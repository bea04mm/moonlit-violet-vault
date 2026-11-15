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

/**
 * Optimizes a cover image URL (especially for Google Books and OpenLibrary)
 * ensuring HTTPS, removing curl effects, and requesting higher resolution.
 */
export function getOptimizedCoverUrl(url: string | null | undefined): string | null {
  if (!url) return null
  let optimized = url.replace("http://", "https://").replace("&edge=curl", "")
  if (optimized.includes("books.google.com")) {
    optimized = optimized.replace(/zoom=[15]/, "zoom=2")
  } else if (optimized.includes("covers.openlibrary.org")) {
    optimized = optimized.replace(/-[SM]\.jpg$/, "-L.jpg")
  }
  return optimized
}

/**
 * Cleans and converts raw HTML descriptions (e.g. from Google Books) into clean Markdown.
 */
export function formatSynopsis(text: string | null | undefined): string {
  if (!text) return ""
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(b|strong)>/gi, "**")
    .replace(/<\/?(i|em)>/gi, "*")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
