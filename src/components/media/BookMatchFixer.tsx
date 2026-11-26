/**
 * Client component that lets me fix incorrect book metadata (wrong cover, wrong edition).
 * Provides two ways to update: paste a direct image URL, or re-search Google Books by
 * title/author/ISBN and pick the correct edition from the results.
 * Only renders for items with `type === "book"`.
 *
 * @packageDocumentation
 */
"use client"

import { useState } from "react"
import { VaultTooltip } from "@/components/ui/VaultTooltip"
import { useRouter } from "next/navigation"
import SearchIcon from "@mui/icons-material/Search"
import Image from "next/image"
import {
  updateMediaProgress,
  searchGoogleBooks,
  fetchBookDetails,
  refreshBookDetails,
} from "@/lib/actions/mediaActions"
import { toast } from "sonner"
import type { MediaItem } from "@/lib/supabase/database.types"
import type { GoogleBooksItem } from "@/types"

/**
 * Button + dialog that allows re-matching a book to the correct Google Books entry.
 * Shown on the book detail page below the cover image.
 */
export function BookMatchFixer({ item }: { item: MediaItem }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(item.title)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [results, setResults] = useState<GoogleBooksItem[]>([])
  const [customCover, setCustomCover] = useState("")

  /**
   * Refreshes high-res cover and details directly from the details endpoint.
   */
  const handleRefreshCover = async () => {
    setRefreshing(true)
    try {
      const res = await refreshBookDetails(item.id)
      if (res.success) {
        toast.success("High-res cover updated from details endpoint!")
        router.refresh()
        setOpen(false)
      } else {
        toast.error("Could not find matching book details. Please search below.")
      }
    } catch (e) {
      toast.error(`Refresh failed: ${e instanceof Error ? e.message : "Unknown error"}`)
    } finally {
      setRefreshing(false)
    }
  }

  /**
   * Initiates a search against the Google Books API using the provided query and updates the results list.
   */
  const handleSearch = async () => {
    if (!query) return
    setLoading(true)
    try {
      // Fetch matching books from Google Books API
      const items = await searchGoogleBooks(query)
      setResults(items)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      toast.error(`Failed to search: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Updates the media item's cover URL with a user-provided custom image URL.
   */
  const handleCustomCover = async () => {
    if (!customCover) return
    try {
      // Directly update the media item with the custom URL
      await updateMediaProgress(item.id, { cover_url: customCover })
      toast.success("Cover updated!")
      router.refresh()
      setOpen(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      toast.error(`Failed to update cover: ${msg}`)
    }
  }

  /**
   * Selects a book from the search results, merges its metadata with the current item, and saves the update.
   */
  const handleSelect = async (book: GoogleBooksItem) => {
    setLoading(true)
    try {
      const info = book.volumeInfo
      const fallbackQuery =
        `${info.title || item.title} ${info.authors?.join(" ") || item.author || ""}`.trim()
      const details = await fetchBookDetails(book.id, fallbackQuery)
      const coverUrl =
        details?.coverUrl ||
        info.imageLinks?.extraLarge ||
        info.imageLinks?.large ||
        info.imageLinks?.medium ||
        info.imageLinks?.thumbnail ||
        info.imageLinks?.smallThumbnail ||
        null
      const cleanCover = coverUrl
        ? coverUrl.replace("http://", "https://").replace("&edge=curl", "")
        : null

      await updateMediaProgress(item.id, {
        title: details?.title || info.title || item.title,
        cover_url: cleanCover || item.cover_url,
        synopsis: details?.synopsis || info.description || item.synopsis,
        genres: details?.genres || info.categories || item.genres,
        author: details?.author || (info.authors ? info.authors.join(", ") : item.author),
        release_year:
          details?.releaseYear ||
          (info.publishedDate ? parseInt(info.publishedDate) : item.release_year),
        total_pages:
          details?.totalPages || (info.pageCount ? Number(info.pageCount) : item.total_pages),
        google_books_id: book.id,
      })
      toast.success("Book metadata & high-res cover updated!")
      router.refresh()
      setOpen(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      toast.error(`Failed to update book: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  if (item.type !== "book") return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/25 hover:border-primary/50 shadow-card hover:shadow-card-hover mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-all hover:text-white"
      >
        <SearchIcon fontSize="small" className="opacity-80" />
        Edit Cover / Match
      </button>

      {open && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="bg-surface border-border flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border p-5 shadow-2xl">
            <div className="border-border mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-foreground text-sm font-semibold">Find Correct Book</h3>
              <VaultTooltip label="Close" placement="left">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-muted hover:text-foreground cursor-pointer rounded-md p-1 text-xs"
                  aria-label="Close dialog"
                >
                  ✕
                </button>
              </VaultTooltip>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={handleRefreshCover}
                disabled={refreshing}
                className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 mb-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {refreshing ? "Fetching Details..." : "Auto-fetch High-Res Cover from Details"}
              </button>

              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={customCover}
                  onChange={(e) => setCustomCover(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomCover()}
                  className="bg-surface border-border hover:border-border-hover text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/40 h-[38px] min-w-0 flex-1 rounded-xl border px-3.5 text-[13px] transition-all focus:ring-2 focus:outline-none"
                  placeholder="Paste a high-res image URL..."
                />
                <button
                  type="button"
                  onClick={handleCustomCover}
                  className="bg-primary text-primary-fg hover:bg-primary-hover shrink-0 cursor-pointer rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors"
                >
                  Update
                </button>
              </div>

              <div className="bg-border relative my-4 h-px w-full">
                <span className="bg-surface text-muted absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-[10px] font-semibold tracking-wider uppercase">
                  Or Search Web
                </span>
              </div>

              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-surface border-border hover:border-border-hover text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/40 h-[38px] min-w-0 flex-1 rounded-xl border px-3.5 text-[13px] transition-all focus:ring-2 focus:outline-none"
                  placeholder="Search by title, author, or ISBN..."
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="bg-primary text-primary-fg hover:bg-primary-hover shrink-0 cursor-pointer rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors"
                >
                  Search
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                </div>
              ) : (
                <div className="custom-scrollbar flex max-h-[45vh] flex-col gap-2 overflow-y-auto">
                  {results.map((r) => {
                    const info = r.volumeInfo
                    const cover = info.imageLinks?.smallThumbnail || info.imageLinks?.thumbnail
                    return (
                      <div
                        key={r.id}
                        onClick={() => handleSelect(r)}
                        className="border-border hover:border-primary hover:bg-surface-elevated flex cursor-pointer gap-3 rounded-xl border p-2.5 transition-colors"
                      >
                        <div className="bg-surface relative h-14 w-10 shrink-0 overflow-hidden rounded">
                          {cover && (
                            <Image
                              src={cover.replace("http://", "https://")}
                              alt="Cover"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-center overflow-hidden">
                          <h4 className="text-foreground truncate text-xs font-medium">
                            {info.title}
                          </h4>
                          <p className="text-muted truncate text-[11px]">
                            {info.authors?.join(", ") || "Unknown Author"}
                          </p>
                          {info.publishedDate && (
                            <p className="text-muted text-[10px]">{info.publishedDate}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {results.length === 0 && query && !loading && (
                    <p className="text-muted py-4 text-center text-xs">Search to see results.</p>
                  )}
                </div>
              )}
            </div>

            <div className="border-border mt-3 flex justify-end border-t pt-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground hover:bg-surface-elevated cursor-pointer rounded-xl px-3.5 py-2 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
