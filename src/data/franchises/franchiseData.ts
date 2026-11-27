/**
 * Franchise checklist item types and markdown parser for the Moonlit Violet Vault.
 *
 * @packageDocumentation
 */

/**
 * Represents a single title (movie, series season, animated film, or special)
 * in a franchise's chronological viewing checklist.
 */
export interface FranchiseItem {
  /** Unique identifier for the item (e.g. "mcu-001", "dc-042"). */
  id: string
  /** Official title of the film, series season, or release. */
  title: string
  /** Human-readable release date string (e.g. "May 2, 2008"). */
  releaseDate: string
  /** Calendar year of release used for sorting and era determination. */
  year: number
  /** Media type format (e.g. "Film", "Season 1", "Animated Series"). */
  type: string
  /** Timeline phase, era, or sub-universe grouping (e.g. "Phase 1: Avengers Assembled"). */
  era: string
  /** Approximate runtime in minutes. */
  runtime: number
  /** Whether the user has marked this item as watched. */
  watched: boolean
  /** Whether this title is an unreleased upcoming project. */
  isUpcoming?: boolean
  /** Remote URL for the official poster artwork cached from TMDB. */
  coverUrl?: string | null
  /** The Movie Database (TMDB) numeric identifier for linking and metadata sync. */
  tmdbId?: number | null
}

/**
 * Parses markdown checklist text formatted according to Moonlit Violet Vault's
 * viewing checklist syntax:
 *
 * `## Major Era Heading`
 * `### Sub-Phase or Multiverse Era`
 * `- [ ] **Title** *(Type | Release Date)*`
 *
 * @param markdown - Raw markdown checklist string.
 * @param universeId - Identifier prefix to generate unique title IDs.
 * @returns Array of structured `FranchiseItem` objects ready for checklist display.
 */
export function parseChecklistMarkdown(markdown: string, universeId: string): FranchiseItem[] {
  const lines = markdown.split("\n")
  const results: FranchiseItem[] = []
  let majorEra = ""
  let currentEra = "General"
  let counter = 1

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith("## ")) {
      majorEra = line.replace(/^##\s+/, "").replace(/^[^\w\s]+\s+/, "").trim()
      currentEra = majorEra
      continue
    }

    if (line.startsWith("### ")) {
      const subEra = line.replace(/^###\s+/, "").replace(/^[^\w\s]+\s+/, "").trim()
      currentEra = majorEra ? `${majorEra} — ${subEra}` : subEra
      continue
    }

    const match = line.match(/^-\s+\[([ xX])\]\s+\*\*(.+?)\*\*\s+\*\((.+?)\)\*/)
    if (match) {
      const isChecked = match[1].toLowerCase() === "x"
      const title = match[2].trim()
      const meta = match[3].trim()

      const parts = meta.split("|").map((p) => p.trim())
      let type = parts[0] || "Film"
      let releaseDate = parts[1] || ""

      if (!releaseDate && parts.length === 1 && /^\d{4}/.test(parts[0])) {
        releaseDate = parts[0]
        type = "Film"
      }

      let year = 2026
      const yearMatch = (releaseDate + " " + meta).match(/\b(19\d{2}|20\d{2})\b/)
      if (yearMatch) {
        year = parseInt(yearMatch[1], 10)
      } else if (releaseDate.toLowerCase().includes("in development") || meta.toLowerCase().includes("in development")) {
        year = 2028
      }

      const isUpcoming = year >= 2026 || releaseDate.toLowerCase().includes("in development")
      const id = `${universeId}-${counter.toString().padStart(3, "0")}`
      counter++

      let runtime = 120
      const lowerType = type.toLowerCase()
      if (lowerType.includes("short")) {
        runtime = 15
      } else if (lowerType.includes("series") || lowerType.includes("season") || lowerType.includes("show")) {
        runtime = 300
      }

      results.push({
        id,
        title,
        releaseDate,
        year,
        type,
        era: currentEra,
        runtime,
        watched: isChecked,
        isUpcoming,
      })
    }
  }

  return results
}
