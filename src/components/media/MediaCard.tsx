/**
 * @module
 *
 * Reusable horizontal card for any vault media type (movie, series, book, recipe).
 *
 * Features:
 *  - Swipe gestures (Framer Motion): swipe right → delete, swipe left → log progress.
 *  - Quick episode tick button for currently-watching series (shows next episode title).
 *  - Star rating display, synopsis snippet, and type/status badges.
 *  - Active-route detection: on the dashboard, type + status chips are shown.
 */
"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { MediaItem } from "@/lib/supabase/database.types"
import { STATUS_LABELS, STATUS_COLORS, TYPE_LABELS, TYPE_COLORS } from "@/lib/constants"
import {
  formatRating,
  getCoverPlaceholder,
  getOptimizedCoverUrl,
  formatSynopsis,
} from "@/lib/utils/formatters"
import { useState } from "react"
import { toast } from "sonner"
import { motion, useAnimation, type PanInfo } from "framer-motion"
import StarIcon from "@mui/icons-material/Star"
import CheckIcon from "@mui/icons-material/Check"
import AddIcon from "@mui/icons-material/Add"
import NewReleasesIcon from "@mui/icons-material/NewReleases"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import DeleteIcon from "@mui/icons-material/Delete"
import { updateMediaProgress, deleteMediaFromVault } from "@/lib/actions/mediaActions"

/**
 * Props interface for the MediaCardProps.
 */
export interface MediaCardProps {
  item: MediaItem
  disableGestures?: boolean
  priority?: boolean
}

/**
 * Reusable card for any media type — movies, series, books.
 */
export function MediaCard({ item, disableGestures = false, priority = false }: MediaCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const pathname = usePathname()
  const isDashboard = pathname === "/"

  const href = `/${item.type === "series" ? "series" : item.type === "book" ? "books" : item.type === "recipe" ? "recipes" : "movies"}/${item.id}`
  const coverSrc = getOptimizedCoverUrl(item.cover_url) ?? getCoverPlaceholder(item.title)

  const hasNewEpisodes =
    item.type === "series" &&
    item.status === "watched" &&
    item.episode_count &&
    item.episodes_seen < item.episode_count
  const isWatchingSeries = item.type === "series" && item.status === "watching"
  const isWaitingSeries =
    item.type === "series" && item.status === "watched" && item.tmdb_status === "Returning Series"
  const hasRating = item.user_rating !== null && item.user_rating !== undefined

  let currentS = ""
  let currentE = 0
  let seasonLeft = 0
  let currentEpTitle = ""

  if (isWatchingSeries && item.season_progress) {
    const sortedSeasons = Object.keys(item.season_progress)
      .filter((s) => s !== "0")
      .sort((a, b) => parseInt(a) - parseInt(b))

    for (const s of sortedSeasons) {
      const data = item.season_progress[s]
      if (data.watched < data.total) {
        currentS = s
        currentE = data.watched + 1
        seasonLeft = data.total - data.watched
        currentEpTitle = data.episodes?.[String(currentE)]?.title || ""
        break
      }
    }
  }

  const controls = useAnimation()

  const handleQuickAddEpisode = async (e?: React.SyntheticEvent | Event) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (isUpdating) return

    setIsUpdating(true)
    try {
      const newCount = item.episodes_seen + 1
      let newStatus = item.status
      if (item.episode_count && newCount >= item.episode_count) {
        newStatus = "watched"
      }

      const newSeasonProgress = item.season_progress ? { ...item.season_progress } : null
      if (newSeasonProgress && currentS) {
        newSeasonProgress[currentS] = {
          ...newSeasonProgress[currentS],
          watched: newSeasonProgress[currentS].watched + 1,
        }
      }

      await updateMediaProgress(item.id, {
        episodes_seen: newCount,
        season_progress: newSeasonProgress,
        status: newStatus,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      toast.error("Failed to update progress: " + msg)
    } finally {
      setIsUpdating(false)
    }
  }

  /**
   * Prompts for confirmation and deletes the selected media item from the vault.
   */
  const handleDelete = async (e?: React.SyntheticEvent | Event) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (confirm("Delete this item from the Vault?")) {
      setIsUpdating(true)
      try {
        await deleteMediaFromVault(item.id)
        toast.success("Item deleted")
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        toast.error("Failed to delete: " + msg)
        setIsUpdating(false)
      }
    }
  }

  /**
   * Swipe gesture end handler triggering delete on right-swipe or progress on left-swipe.
   */
  const handleDragEnd = async (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    /**
     * Horizontal swipe distance threshold required to trigger a gesture action.
     */
    const threshold = 80

    if (info.offset.x > threshold) {
      // Swipe Right -> Delete
      controls.start({ x: 0 })
      handleDelete(e)
    } else if (info.offset.x < -threshold) {
      // Swipe Left -> Progress
      controls.start({ x: 0 })
      if (isWatchingSeries && currentS) {
        await handleQuickAddEpisode(e)
      } else if (item.status === "want_to_watch" || item.status === "want_to_read") {
        await updateMediaProgress(item.id, {
          status: item.type === "book" ? "reading" : "watching",
        })
        toast.success(`Started ${item.title}!`)
      }
    } else {
      controls.start({ x: 0 })
    }
  }

  return (
    <div className="group/container shadow-card hover:shadow-card-hover relative touch-pan-y rounded-xl transition-all duration-300 ease-out hover:-translate-y-1">
      {/* Background Actions (Revealed on Swipe) */}
      <div className="bg-surface-elevated absolute inset-0 flex justify-between overflow-hidden rounded-xl">
        <div className="flex w-1/2 items-center justify-start pl-6">
          <div className="flex flex-col items-center justify-center text-red-500">
            <DeleteIcon />
            <span className="mt-1 text-[10px] font-semibold">Delete</span>
          </div>
        </div>
        <div className="flex w-1/2 items-center justify-end pr-6">
          <div className="text-primary flex flex-col items-center justify-center">
            <CheckIcon />
            <span className="mt-1 text-[10px] font-semibold">Progress</span>
          </div>
        </div>
      </div>

      <motion.div
        drag={disableGestures ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={disableGestures ? undefined : handleDragEnd}
        animate={controls}
        className="relative z-10 h-40 w-full sm:h-48"
      >
        <Link
          href={href}
          className="media-card-link group border-border hover:border-primary group-hover/container:border-primary bg-surface hover:bg-surface-hover group-hover/container:bg-surface-hover focus:border-primary focus-visible:border-primary flex h-full flex-row overflow-hidden rounded-xl border transition-all duration-300 ease-out focus:outline-none focus-visible:outline-none"
        >
          {/* Cover image */}
          <div className="relative h-full w-28 shrink-0 overflow-hidden sm:w-32">
            <Image
              src={coverSrc}
              alt={`Cover for ${item.title}`}
              fill
              sizes="128px"
              unoptimized
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105 group-hover/container:scale-105"
            />
          </div>

          {/* Card body */}
          <div className="flex min-w-0 flex-1 flex-col gap-1 p-3 sm:p-4">
            {/* Top badges for status & new episodes */}
            {(isDashboard || hasNewEpisodes || (isWaitingSeries && item.next_episode_air_date)) && (
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                {isDashboard && (
                  <span
                    className={`inline-flex h-5 items-center justify-center rounded-md border px-2 text-[10px] leading-none font-semibold shadow-sm ${TYPE_COLORS[item.type]}`}
                  >
                    <span className="translate-y-[0.5px]">{TYPE_LABELS[item.type]}</span>
                  </span>
                )}
                {isDashboard && (
                  <span
                    className={`inline-flex h-5 items-center justify-center rounded-md border px-2 text-[10px] leading-none font-semibold shadow-sm ${STATUS_COLORS[item.status]}`}
                  >
                    <span className="translate-y-[0.5px]">{STATUS_LABELS[item.status]}</span>
                  </span>
                )}
                {hasNewEpisodes && (
                  <span className="inline-flex h-5 animate-pulse items-center justify-center gap-1 rounded-md border border-red-500 bg-red-500/90 px-2 text-[10px] leading-none font-bold text-white shadow-sm shadow-red-500/20">
                    <NewReleasesIcon style={{ color: "white", fontSize: 11 }} />
                    <span className="translate-y-[0.5px]">New Episodes</span>
                  </span>
                )}
                {isWaitingSeries && item.next_episode_air_date && (
                  <span className="inline-flex h-5 items-center justify-center gap-1 rounded-md border border-amber-500 bg-amber-600/90 px-2 text-[10px] leading-none font-bold text-white shadow-sm">
                    <CalendarMonthIcon style={{ color: "white", fontSize: 11 }} />
                    <span className="translate-y-[0.5px]">
                      {new Date(item.next_episode_air_date).toLocaleDateString()}
                    </span>
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h3 className="font-display text-foreground group-hover:text-primary group-hover/container:text-primary line-clamp-2 text-sm leading-tight font-semibold transition-colors sm:text-base">
              {item.title}
            </h3>

            {/* Author / Director */}
            {(item.author ?? item.director) && (
              <p className="text-muted text-xs">{item.author ?? item.director}</p>
            )}

            {/* Year, Runtime, Pages, Recipe details */}
            {(item.release_year ||
              item.runtime_minutes ||
              item.total_pages ||
              item.type === "recipe") && (
              <p className="text-muted flex flex-wrap items-center gap-1.5 font-mono text-xs">
                {item.release_year && <span>{item.release_year}</span>}

                {item.type === "movie" && item.runtime_minutes && (
                  <>
                    {item.release_year && <span className="opacity-50">•</span>}
                    <span>
                      {Math.floor(item.runtime_minutes / 60)}h {item.runtime_minutes % 60}m
                    </span>
                  </>
                )}

                {item.type === "book" && item.total_pages && (
                  <>
                    {item.release_year && <span className="opacity-50">•</span>}
                    <span>
                      {item.status === "want_to_read"
                        ? `${item.total_pages} pg`
                        : `${item.pages_read || 0} / ${item.total_pages} pg`}
                    </span>
                  </>
                )}

                {item.type === "recipe" && (
                  <>
                    {Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
                      <span>{item.ingredients.length} ingredients</span>
                    )}
                    {Array.isArray(item.instructions) && item.instructions.length > 0 && (
                      <>
                        {Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
                          <span className="opacity-50">•</span>
                        )}
                        <span>{item.instructions.length} steps</span>
                      </>
                    )}
                  </>
                )}
              </p>
            )}

            <div className="mt-auto flex w-full flex-col gap-2 overflow-hidden">
              {/* Synopsis Snippet */}
              {!(item.type === "series" && isWatchingSeries && !isDashboard) && item.synopsis && (
                <p
                  className={`text-muted text-[11px] leading-relaxed ${
                    isDashboard
                      ? item.type === "book"
                        ? hasRating
                          ? "line-clamp-1 sm:line-clamp-2"
                          : "line-clamp-2 sm:line-clamp-3"
                        : hasRating
                          ? "line-clamp-2 sm:line-clamp-3"
                          : "line-clamp-3 sm:line-clamp-4"
                      : item.type === "book"
                        ? hasRating
                          ? "line-clamp-2 sm:line-clamp-3"
                          : "line-clamp-3 sm:line-clamp-4"
                        : hasRating
                          ? "line-clamp-3 sm:line-clamp-4"
                          : "line-clamp-4 sm:line-clamp-5"
                  }`}
                >
                  {formatSynopsis(item.synopsis).replace(/[*_#~`>]/g, "")}
                </p>
              )}

              {/* Recipe Ingredients Preview */}
              {item.type === "recipe" &&
                !item.synopsis &&
                Array.isArray(item.ingredients) &&
                item.ingredients.length > 0 && (
                  <p
                    className={`text-muted text-[11px] leading-relaxed italic ${
                      isDashboard
                        ? hasRating
                          ? "line-clamp-1 sm:line-clamp-2"
                          : "line-clamp-2 sm:line-clamp-3"
                        : hasRating
                          ? "line-clamp-2 sm:line-clamp-4"
                          : "line-clamp-3 sm:line-clamp-5"
                    }`}
                  >
                    {item.ingredients.join(", ")}
                  </p>
                )}

              {/* Quick Actions / Rating */}
              {((isWatchingSeries && !isDashboard) || hasRating) && (
                <div className="flex w-full items-center justify-between">
                  {isWatchingSeries && currentS && !isDashboard ? (
                    <div className="bg-primary/10 border-primary/25 flex w-full items-center justify-between rounded-xl border p-2.5 shadow-xs sm:p-3">
                      <div className="mr-2 flex flex-1 flex-col overflow-hidden">
                        <span className="text-foreground font-mono text-sm leading-tight font-bold">
                          <span className="text-primary font-semibold">
                            S{currentS.padStart(2, "0")} E{currentE.toString().padStart(2, "0")}
                          </span>
                        </span>
                        {currentEpTitle && (
                          <span className="text-muted mt-0.5 w-full truncate text-xs leading-tight">
                            {currentEpTitle}
                          </span>
                        )}
                        <span className="text-primary/80 mt-1 text-[11px] leading-tight font-medium">
                          {seasonLeft} left in season
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleQuickAddEpisode}
                        disabled={isUpdating}
                        className="bg-primary hover:bg-primary-hover shadow-primary/30 border-primary/40 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border text-white shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Mark episode as watched"
                        aria-label="Mark episode as watched"
                      >
                        {isUpdating ? (
                          <span className="text-[10px] font-bold">...</span>
                        ) : (
                          <CheckIcon
                            sx={{ fontSize: 18, color: "#ffffff" }}
                            className="text-white"
                          />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {hasRating && (
                        <>
                          <StarIcon sx={{ fontSize: 16 }} className="text-primary" />
                          <span className="text-primary text-xs font-semibold">
                            {formatRating(item.user_rating)}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {isWatchingSeries && !currentS && !isDashboard && (
                    <button
                      type="button"
                      onClick={handleQuickAddEpisode}
                      disabled={isUpdating}
                      className="bg-primary hover:bg-primary-hover shadow-primary/30 border-primary/40 flex cursor-pointer items-center justify-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Watched +1 Episode"
                    >
                      <AddIcon sx={{ fontSize: 16, color: "#ffffff" }} className="text-white" />
                      <span>{isUpdating ? "..." : "1 Ep"}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  )
}
