/**
 * @module
 *
 * Search-and-add modal overlay for adding new media to the vault.
 * Renders via a React Portal so it sits above all other page content.
 *
 * Features:
 *  - Media type selector tabs (Movie / Series / Book / Recipe).
 *  - Debounced live search (1 s delay) against the appropriate external API.
 *  - Duplicate detection: items already in the vault show "View in Vault" instead of "Add".
 *  - Recipe fallback: a shortcut to the manual recipe creation form.
 *  - Pre-selects the media type based on the current URL path.
 */
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  searchExternalMedia,
  addMediaToVault,
  getAllMediaAction,
  type SearchResult,
} from "@/lib/actions/mediaActions"
import type { MediaType, MediaItem } from "@/lib/supabase/database.types"
import { toast } from "sonner"
import { VaultTooltip } from "@/components/ui/VaultTooltip"

/**
 * Props for the AddMediaModal component.
 */
export interface AddMediaModalProps {
  onClose: () => void
}

let pendingAddMedia: { query?: string; type?: MediaType } | null = null

export function triggerAddMedia(options?: { query?: string; type?: MediaType }) {
  pendingAddMedia = options ?? null
  window.dispatchEvent(new CustomEvent("open-add-media"))
}

/**
 * Modal dialog for searching external APIs and adding media to the vault.
 * Uses a React Portal to escape any overflow-hidden parent containers.
 * The `mounted` guard prevents SSR hydration mismatches for the portal.
 */
export function AddMediaModal({ onClose }: AddMediaModalProps) {
  /**
   * Next.js router instance for handling client-side navigation.
   */
  const router = useRouter()
  /**
   * Current URL pathname used to determine the active route or media type context.
   */
  const pathname = usePathname()

  const [type, setType] = useState<MediaType>(() => {
    if (pendingAddMedia?.type) return pendingAddMedia.type
    if (pathname.includes("series")) return "series"
    if (pathname.includes("books")) return "book"
    if (pathname.includes("recipes")) return "recipe"
    return "movie"
  })

  const [query, setQuery] = useState(() => pendingAddMedia?.query ?? "")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [vaultItems, setVaultItems] = useState<MediaItem[]>([])

  // Reset state when opened & handle escape key
  useEffect(() => {
    pendingAddMedia = null
    getAllMediaAction().then(setVaultItems)

    /**
     * Keyboard event handler for the Escape key to close the modal.
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) return

    const timer = setTimeout(async () => {
      setIsSearching(true)
      setError(null)
      try {
        const data = await searchExternalMedia(query, type)
        setResults(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to search media.")
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query, type])

  const hasValidQuery = query.trim().length >= 2
  const visibleResults = hasValidQuery ? results : []
  const activeSearching = hasValidQuery && isSearching

  /**
   * Adds the selected external media result to the local vault, displaying
   * appropriate toast notifications on success or error.
   */
  async function handleAdd(result: SearchResult) {
    setIsAdding(result.externalId)
    setError(null)
    try {
      await addMediaToVault(result)
      toast.success(`${result.title} added to vault!`)
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add to vault.")
    } finally {
      setIsAdding(null)
    }
  }

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="animate-fade-in fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/70"
    >
      <div className="bg-surface border-border flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl">
        {/* Header */}
        <div className="border-border border-b p-5">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <h2 className="font-display text-foreground text-lg font-semibold tracking-tight">
                Add to Vault
              </h2>
              <span className="font-handwriting text-accent text-sm select-none">quick search</span>
            </div>
            <VaultTooltip label="Close (Esc)" placement="left">
              <button
                type="button"
                onClick={onClose}
                className="text-muted hover:text-primary hover:bg-surface-elevated cursor-pointer rounded-lg p-1.5 text-xs transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </VaultTooltip>
          </div>

          {/* Type Selector */}
          <div className="bg-surface-elevated border-border custom-scrollbar flex gap-1.5 overflow-x-auto rounded-xl border p-1">
            {(["movie", "series", "book", "recipe"] as MediaType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t)
                  setQuery("")
                  setResults([])
                }}
                className={`min-w-16 flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  type === t
                    ? "bg-primary text-primary-fg font-semibold shadow-xs"
                    : "text-muted hover:text-foreground border border-transparent"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative mt-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search for a ${type}...`}
              className="bg-surface border-border hover:border-border-hover text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/40 h-[38px] w-full rounded-xl border px-3.5 text-[13px] transition-all focus:ring-2 focus:outline-none"
            />
            {activeSearching && (
              <div className="border-primary absolute top-1/2 right-3.5 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-t-transparent" />
            )}
          </div>
        </div>

        {/* Results Body */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-2">
          {error && (
            <div className="m-3 rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-center text-xs text-red-500">
              {error}
            </div>
          )}

          {visibleResults.length === 0 && !hasValidQuery && type === "recipe" && !error && (
            <div className="animate-fade-in flex flex-col items-center gap-3 p-8 text-center">
              <span className="text-muted text-xs">Have a family recipe? Skip the search.</span>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  router.push("/recipes/new")
                }}
                className="bg-primary text-primary-fg cursor-pointer rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs transition-opacity hover:opacity-90"
              >
                + Write Recipe Manually
              </button>
            </div>
          )}

          {visibleResults.length === 0 && hasValidQuery && !activeSearching && !error && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <span className="text-muted text-xs">
                No results found for &ldquo;{query}&rdquo;.
              </span>
              {type === "recipe" && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    router.push("/recipes/new")
                  }}
                  className="bg-surface-elevated border-border text-foreground hover:border-primary hover:text-primary cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors"
                >
                  Write Recipe Manually
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            {visibleResults.map((result) => {
              const existingItem = vaultItems.find(
                (item) =>
                  (result.type === "book" && item.google_books_id === result.externalId) ||
                  (result.type !== "book" && item.tmdb_id === parseInt(result.externalId))
              )

              return (
                <div
                  key={result.externalId}
                  className="hover:bg-surface-elevated group flex items-center gap-3 rounded-xl p-2.5 transition-colors"
                >
                  <div className="bg-surface-elevated border-border relative h-14 w-10 shrink-0 overflow-hidden rounded-md border">
                    {result.coverUrl ? (
                      <Image
                        src={result.coverUrl}
                        alt={result.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-lg opacity-30">
                        {type === "movie"
                          ? "🎬"
                          : type === "series"
                            ? "📺"
                            : type === "book"
                              ? "📚"
                              : "🍳"}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground group-hover:text-primary truncate text-xs font-semibold transition-colors">
                      {result.title}
                    </h3>
                    <div className="text-muted mt-0.5 flex gap-2 font-mono text-[11px]">
                      {result.releaseYear && <span>{result.releaseYear}</span>}
                      {result.author && <span className="truncate">{result.author}</span>}
                    </div>
                  </div>

                  {existingItem ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        router.push(
                          `/${
                            existingItem.type === "series"
                              ? "series"
                              : existingItem.type === "book"
                                ? "books"
                                : existingItem.type === "recipe"
                                  ? "recipes"
                                  : "movies"
                          }/${existingItem.id}`
                        )
                      }}
                      className="bg-surface-elevated text-muted hover:text-primary hover:border-primary border-border shrink-0 cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
                    >
                      View in Vault
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAdd(result)}
                      disabled={isAdding === result.externalId}
                      className="bg-primary text-primary-fg shrink-0 cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xs transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isAdding === result.externalId ? "Adding..." : "+ Add"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
