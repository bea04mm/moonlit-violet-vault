/**
 * Full detail view for a single vault item.
 *
 * @packageDocumentation
 */
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { MediaItem, MediaStatus, ReadingSession } from "@/lib/supabase/database.types"
import { Badge } from "@/components/ui/Badge"
import { STATUS_LABELS, STATUS_COLORS, TYPE_LABELS, TYPE_COLORS } from "@/lib/constants"
import {
  formatRating,
  getCoverPlaceholder,
  getOptimizedCoverUrl,
  formatSynopsis,
} from "@/lib/utils/formatters"
import Link from "next/link"
import { ProgressLogger } from "./ProgressLogger"
import { DeleteButton } from "./DeleteButton"
import { BookMatchFixer } from "./BookMatchFixer"
import { updateMediaProgress, refreshMovieMetadataAction } from "@/lib/actions/mediaActions"
import FavoriteIcon from "@mui/icons-material/Favorite"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import StarIcon from "@mui/icons-material/Star"
import SyncIcon from "@mui/icons-material/Sync"
import { useRouter } from "next/navigation"
import RateReviewIcon from "@mui/icons-material/RateReview"
import AutoStoriesIcon from "@mui/icons-material/AutoStories"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import { toast } from "sonner"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import ReactMarkdown from "react-markdown"

/**
 * Props interface for the MediaDetailProps.
 */
export interface MediaDetailProps {
  item: MediaItem
}

/**
 * Main detail view component for any media type.
 * Handles the Favourite toggle internally.
 */
export function MediaDetail({ item }: MediaDetailProps) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const [activeTab, setActiveTab] = useState<"overview" | "progress">("overview")
  const [isFavorite, setIsFavorite] = useState<boolean>(item.is_favorite)
  const [currentStatus, setCurrentStatus] = useState<MediaStatus>(item.status)
  /**
   * Resolved URL for the item's cover image, falling back to a placeholder if missing.
   */
  const coverSrc = getOptimizedCoverUrl(item.cover_url) ?? getCoverPlaceholder(item.title)
  /**
   * Next.js router instance for handling client-side navigation.
   */
  const router = useRouter()

  const STATUS_CYCLES: Record<string, MediaStatus[]> = {
    movie: ["want_to_watch", "watched"],
    series: ["want_to_watch", "watching", "watched"],
    book: ["want_to_read", "reading", "read"],
    recipe: ["want_to_cook", "cooked"],
  }

  const handleCycleStatus = async () => {
    const cycle = STATUS_CYCLES[item.type] || ["want_to_watch", "watched"]
    const currentIndex = cycle.indexOf(currentStatus)
    const nextStatus = cycle[(currentIndex + 1) % cycle.length] || cycle[0]
    setCurrentStatus(nextStatus)
    try {
      await updateMediaProgress(item.id, { status: nextStatus })
      toast.success(`Status updated to ${STATUS_LABELS[nextStatus]}`)
    } catch {
      toast.error("Failed to update status")
      setCurrentStatus(currentStatus)
    }
  }

  const [isRefreshing, setIsRefreshing] = useState(false)

  /**
   * Refreshes metadata for this individual movie directly from TMDB,
   * pulling the latest director, genres, synopsis, and high-res poster artwork.
   */
  const handleRefreshMovie = async () => {
    setIsRefreshing(true)
    try {
      const res = await refreshMovieMetadataAction(item.id)
      if (res.success) {
        toast.success(res.message)
        router.refresh()
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update movie")
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <article className="animate-fade-in relative flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-2 pb-24 sm:px-6 md:pb-6 lg:py-4">
        {/* Unified Top Navigation & Action Toolbar */}
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="border-border bg-surface text-muted hover:text-foreground hover:bg-surface-elevated hover:border-primary/40 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-xs transition-all active:scale-95"
          >
            <span className="text-sm leading-none">←</span>
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            {item.type === "recipe" && (
              <Link
                href={`/recipes/${item.id}/edit`}
                className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <EditOutlinedIcon sx={{ fontSize: 14 }} />
                <span>Edit Recipe</span>
              </Link>
            )}
            <DeleteButton id={item.id} type={item.type} />
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="flex w-full flex-col items-start gap-8 md:flex-row lg:gap-16">
          {/* Left Column: Cover & Primary Item Actions */}
          <div className="flex w-full shrink-0 flex-col gap-5 md:w-1/3 lg:w-1/4">
            <div className="border-border bg-surface relative aspect-2/3 w-full overflow-hidden rounded-xl border shadow-md">
              <Image
                src={coverSrc}
                alt={`Cover for ${item.title}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                priority
                unoptimized
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <button
                type="button"
                onClick={handleCycleStatus}
                className="inline-flex cursor-pointer items-center transition-opacity hover:opacity-85 focus:outline-none"
                title="Click to cycle status"
              >
                <Badge className={STATUS_COLORS[currentStatus]}>
                  {STATUS_LABELS[currentStatus]}
                </Badge>
              </button>
              <Badge className={TYPE_COLORS[item.type]}>{TYPE_LABELS[item.type]}</Badge>
              {item.user_rating && (
                <Badge variant="glass" className="gap-1.5">
                  <StarIcon
                    sx={{ fontSize: 13 }}
                    className="text-primary shrink-0 -translate-y-[0.5px]"
                  />
                  <span className="text-primary font-mono">{formatRating(item.user_rating)}</span>
                </Badge>
              )}
            </div>

            <button
              type="button"
              onClick={async () => {
                const newFav = !isFavorite
                setIsFavorite(newFav)
                await updateMediaProgress(item.id, { is_favorite: newFav })
              }}
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold shadow-xs transition-all active:scale-95 ${
                isFavorite
                  ? "border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 dark:text-red-400"
                  : "bg-surface hover:bg-surface-elevated border-border hover:border-primary/40 text-foreground hover:text-primary"
              }`}
            >
              <div
                className={`flex items-center justify-center transition-transform ${isFavorite ? "scale-110" : ""}`}
              >
                {isFavorite ? (
                  <FavoriteIcon fontSize="small" className="text-red-500" />
                ) : (
                  <FavoriteBorderIcon
                    fontSize="small"
                    className="text-muted group-hover:text-primary transition-colors"
                  />
                )}
              </div>
              <span>{isFavorite ? "Favorited" : "Add to Favorites"}</span>
            </button>

            {item.type === "book" && <BookMatchFixer item={item} />}

            {item.type === "movie" && (
              <button
                type="button"
                onClick={handleRefreshMovie}
                disabled={isRefreshing}
                className="bg-surface hover:bg-surface-elevated border-border hover:border-primary/40 text-muted hover:text-foreground flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                title="Refresh director, genres, and artwork from TMDB"
              >
                <SyncIcon
                  sx={{ fontSize: 14 }}
                  className={isRefreshing ? "animate-spin text-primary" : "text-primary"}
                />
                <span>{isRefreshing ? "Updating..." : "Update from TMDB"}</span>
              </button>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex w-full flex-1 flex-col gap-6">
            <div>
              <h1 className="font-display text-gradient-violet mb-2 text-3xl leading-tight font-bold tracking-tight md:text-4xl lg:text-5xl">
                {item.title}
              </h1>

              {item.original_title && item.original_title !== item.title && (
                <h2 className="text-muted mb-4 text-lg italic">{item.original_title}</h2>
              )}

              <div className="text-muted flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                {item.release_year && (
                  <span className="bg-primary/10 border-primary/25 text-primary rounded-md border px-2.5 py-0.5 font-mono text-xs font-medium">
                    {item.release_year}
                  </span>
                )}
                {(item.author ?? item.director) && (
                  <span className="text-primary font-medium">
                    {item.type === "recipe"
                      ? "Source: "
                      : item.type === "book"
                        ? "By "
                        : "Directed by "}{" "}
                    {item.author ?? item.director}
                  </span>
                )}
              </div>
            </div>

            {/* Genres & Tags */}
            {((item.genres && item.genres.length > 0) || (item.tags && item.tags.length > 0)) && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {item.genres?.map((genre) => (
                  <span
                    key={genre}
                    className="bg-primary/10 border-primary/25 text-primary rounded-md border px-2.5 py-0.5 text-xs font-medium"
                  >
                    {genre}
                  </span>
                ))}
                {item.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="bg-surface-elevated border-border text-muted rounded-md border px-2.5 py-0.5 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Progress Display Grid - Always Visible */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {item.type === "book" && item.pages_read > 0 && (
                <div className="bg-surface border-border flex flex-col items-center justify-center rounded-xl border p-3.5 text-center">
                  <span className="text-primary mb-1 font-mono text-[10px] tracking-wider uppercase">
                    Pages Read
                  </span>
                  <span className="text-foreground text-xl font-bold">{item.pages_read}</span>
                  {item.total_pages && (
                    <span className="text-muted mt-0.5 text-[11px]">of {item.total_pages}</span>
                  )}
                </div>
              )}
              {item.type === "book" && item.reading_time_minutes > 0 && (
                <div className="bg-surface border-border flex flex-col items-center justify-center rounded-xl border p-3.5 text-center">
                  <span className="text-primary mb-1 font-mono text-[10px] tracking-wider uppercase">
                    Reading Time
                  </span>
                  <span className="text-foreground text-xl font-bold">
                    {item.reading_time_minutes}m
                  </span>
                </div>
              )}
              {item.type === "series" && (
                <>
                  <div className="bg-surface border-border flex flex-col items-center justify-center rounded-xl border p-3.5 text-center">
                    <span className="text-primary mb-1 font-mono text-[10px] tracking-wider uppercase">
                      Episodes
                    </span>
                    <span className="text-foreground text-xl font-bold">
                      {item.episodes_seen || 0}
                    </span>
                    {item.episode_count && (
                      <span className="text-muted mt-0.5 text-[11px]">of {item.episode_count}</span>
                    )}
                  </div>
                  {item.season_count && item.season_count > 0 && (
                    <div className="bg-surface border-border flex flex-col items-center justify-center rounded-xl border p-3.5 text-center">
                      <span className="text-primary mb-1 font-mono text-[10px] tracking-wider uppercase">
                        Seasons
                      </span>
                      <span className="text-foreground text-xl font-bold">{item.season_count}</span>
                    </div>
                  )}
                  {item.episode_count && item.episode_count > 0 && (
                    <div className="bg-surface border-border flex flex-col items-center justify-center rounded-xl border p-3.5 text-center">
                      <span className="text-primary mb-1 font-mono text-[10px] tracking-wider uppercase">
                        Progress
                      </span>
                      <span className="text-foreground text-xl font-bold">
                        {Math.round(((item.episodes_seen || 0) / item.episode_count) * 100)}%
                      </span>
                    </div>
                  )}
                </>
              )}
              {item.type === "movie" && item.runtime_minutes && (
                <div className="bg-surface border-border flex flex-col items-center justify-center rounded-xl border p-3.5 text-center">
                  <span className="text-primary mb-1 font-mono text-[10px] tracking-wider uppercase">
                    Runtime
                  </span>
                  <span className="text-foreground text-xl font-bold">{item.runtime_minutes}m</span>
                </div>
              )}
            </div>

            {/* Tabs Navigation */}
            <div className="border-border mt-6 flex gap-6 border-b">
              <button
                onClick={() => setActiveTab("overview")}
                className={`relative -mb-px cursor-pointer border-b-2 pb-3 text-xs font-semibold transition-all ${
                  activeTab === "overview"
                    ? "text-primary border-primary z-10 font-bold"
                    : "text-muted hover:text-foreground hover:border-primary/40 border-transparent"
                }`}
              >
                {item.type === "recipe" ? "Recipe Details" : "Overview & Review"}
              </button>
              {item.type !== "recipe" && (
                <button
                  onClick={() => setActiveTab("progress")}
                  className={`relative -mb-px cursor-pointer border-b-2 pb-3 text-xs font-semibold transition-all ${
                    activeTab === "progress"
                      ? "text-primary border-primary z-10 font-bold"
                      : "text-muted hover:text-foreground hover:border-primary/40 border-transparent"
                  }`}
                >
                  Log Progress
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {activeTab === "overview" && (
                <div className="animate-fade-in space-y-8">
                  {/* Synopsis */}
                  {item.synopsis && (
                    <div className="max-w-none">
                      <h3 className="text-primary mb-2 font-mono text-sm font-semibold tracking-wider uppercase">
                        Synopsis
                      </h3>
                      <div className="text-foreground/90 text-sm leading-relaxed md:text-base">
                        <ReactMarkdown
                          components={{
                            p: (props) => <p className="mb-4 last:mb-0" {...props} />,
                            strong: (props) => (
                              <strong className="text-foreground font-bold" {...props} />
                            ),
                            em: (props) => <em className="text-primary italic" {...props} />,
                            br: (props) => <br {...props} />,
                          }}
                        >
                          {formatSynopsis(item.synopsis)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Recipe Details */}
                  {item.type === "recipe" && (
                    <div className="space-y-6">
                      {item.ingredients && item.ingredients.length > 0 && (
                        <div className="max-w-none">
                          <h3 className="text-primary mb-2.5 font-mono text-sm font-semibold tracking-wider uppercase">
                            Ingredients
                          </h3>
                          <ul className="text-foreground/90 list-disc space-y-1.5 pl-5 text-sm md:text-base">
                            {item.ingredients.map((ing, i) => (
                              <li key={i}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.instructions && item.instructions.length > 0 && (
                        <div className="max-w-none">
                          <h3 className="text-primary mb-2.5 font-mono text-sm font-semibold tracking-wider uppercase">
                            Instructions
                          </h3>
                          <div className="text-foreground/90 space-y-3.5 text-sm leading-relaxed md:text-base">
                            {item.instructions.map((step, i) => (
                              <div key={i} className="flex gap-3">
                                <span className="text-primary shrink-0 font-mono text-sm font-bold">
                                  {i + 1}.
                                </span>
                                <p>{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* User Review / Notes */}
                  {item.user_notes && (
                    <div className="border-border bg-surface rounded-xl border p-4">
                      <h3 className="text-primary mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
                        <RateReviewIcon fontSize="small" className="text-primary" />
                        <span>Review</span>
                        <span className="font-handwriting text-accent ml-1 text-sm select-none">
                          personal notes
                        </span>
                      </h3>
                      <p className="text-foreground/90 text-sm leading-relaxed italic">
                        &ldquo;{item.user_notes}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Reading Journal Timeline */}
                  {item.type === "book" &&
                    item.reading_sessions &&
                    item.reading_sessions.length > 0 && (
                      <div className="pt-2">
                        <div className="mb-4 flex items-baseline gap-2">
                          <h3 className="font-display text-foreground flex items-center gap-2 text-lg font-semibold">
                            <AutoStoriesIcon fontSize="small" className="text-primary" /> Reading
                            Journal
                          </h3>
                          <span className="font-handwriting text-accent text-base select-none">
                            session notes
                          </span>
                        </div>
                        <div className="border-border relative ml-3 space-y-4 border-l">
                          {item.reading_sessions.map((session: ReadingSession, index: number) => (
                            <div key={session.id || index} className="relative pl-6">
                              <div className="bg-primary absolute top-3.5 -left-1.25 h-2.5 w-2.5 rounded-full" />
                              <div className="bg-surface border-border rounded-xl border p-3.5 shadow-sm">
                                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-3">
                                  <span className="text-foreground text-xs font-semibold capitalize">
                                    {new Date(session.date).toLocaleDateString("en-US", {
                                      weekday: "short",
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                  <div className="flex gap-1.5">
                                    {session.pages_read > 0 && (
                                      <Badge variant="glass" className="text-[11px]">
                                        +{session.pages_read} pages
                                      </Badge>
                                    )}
                                    {session.minutes > 0 && (
                                      <Badge
                                        variant="glass"
                                        className="flex items-center gap-1 text-[11px]"
                                      >
                                        <AccessTimeIcon
                                          sx={{ fontSize: 12 }}
                                          className="text-muted"
                                        />{" "}
                                        {session.minutes}m
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {session.notes && (
                                  <p className="text-muted font-handwriting mt-1 text-sm text-xs leading-relaxed italic">
                                    &ldquo;{session.notes}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* External Links */}
                  <div className="border-border flex flex-wrap gap-4 border-t pt-4">
                    {item.tmdb_id && (
                      <a
                        href={`https://www.themoviedb.org/${item.type === "movie" ? "movie" : "tv"}/${item.tmdb_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:text-accent flex items-center gap-1 text-xs font-medium transition-colors hover:underline"
                      >
                        View on TMDB{" "}
                        <OpenInNewIcon sx={{ fontSize: 13 }} className="text-primary" />
                      </a>
                    )}
                    {item.google_books_id && (
                      <a
                        href={`https://books.google.com/books?id=${item.google_books_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:text-accent flex items-center gap-1 text-xs font-medium transition-colors hover:underline"
                      >
                        View on Google Books{" "}
                        <OpenInNewIcon sx={{ fontSize: 13 }} className="text-primary" />
                      </a>
                    )}
                    {item.goodreads_id && (
                      <a
                        href={`https://www.goodreads.com/book/show/${item.goodreads_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:text-accent flex items-center gap-1 text-xs font-medium transition-colors hover:underline"
                      >
                        View on Goodreads{" "}
                        <OpenInNewIcon sx={{ fontSize: 13 }} className="text-primary" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "progress" && (
                <div className="animate-fade-in -mt-8">
                  {/* We apply a negative top margin because ProgressLogger has an mt-8 baked in, or we just let it be. */}
                  <ProgressLogger
                    item={item}
                    status={currentStatus}
                    onStatusChange={setCurrentStatus}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
