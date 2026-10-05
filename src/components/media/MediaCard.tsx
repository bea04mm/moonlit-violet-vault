/* eslint-disable @typescript-eslint/no-explicit-any */
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
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MediaItem } from "@/lib/supabase/database.types";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  TYPE_LABELS,
} from "@/lib/constants";
import { Chip, IconButton, Button } from "@mui/material";
import { formatRating, getCoverPlaceholder } from "@/lib/utils/formatters";
import { useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { motion, useAnimation, type PanInfo } from "framer-motion";

/**
 * Material UI Star icon component for rendering rating stars.
 */
const StarIcon = dynamic(() => import("@mui/icons-material/Star"), { ssr: false });
/**
 * Material UI Check icon component indicating progress or completion.
 */
const CheckIcon = dynamic(() => import("@mui/icons-material/Check"), { ssr: false });
/**
 * Material UI Add icon component used for quick-add actions.
 */
const AddIcon = dynamic(() => import("@mui/icons-material/Add"), { ssr: false });
/**
 * Material UI New Releases icon component denoting unread or unwatched new episodes.
 */
const NewReleasesIcon = dynamic(() => import("@mui/icons-material/NewReleases"), { ssr: false });
/**
 * Material UI Calendar Month icon component showing upcoming release dates.
 */
const CalendarMonthIcon = dynamic(() => import("@mui/icons-material/CalendarMonth"), { ssr: false });
/**
 * Material UI Delete icon component for removing items.
 */
const DeleteIcon = dynamic(() => import("@mui/icons-material/Delete"), { ssr: false });
import { updateMediaProgress, deleteMediaFromVault } from "@/lib/actions/mediaActions";

/**
 * Props interface for the MediaCardProps.
 */
export interface MediaCardProps {
  item: MediaItem;
  disableGestures?: boolean;
  priority?: boolean;
}

/**
 * Reusable card for any media type — movies, series, books.
 * RSC: purely presentational, no client interactivity.
 */
export function MediaCard({ item, disableGestures = false, priority = false }: MediaCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  /**
   * Current URL pathname used to determine the active route or media type context.
   */
  const pathname = usePathname();
  /**
   * Boolean flag indicating whether the component is rendered on the main dashboard view.
   */
  const isDashboard = pathname === "/";
  
  /**
   * Target URL for navigating to the item's detail page.
   */
  const href = `/${item.type === "series" ? "series" : item.type === "book" ? "books" : item.type === "recipe" ? "recipes" : "movies"}/${item.id}`;
  /**
   * Resolved URL for the item's cover image, falling back to a placeholder if missing.
   */
  const coverSrc = item.cover_url ?? getCoverPlaceholder(item.title);
  
  /**
   * Boolean flag indicating if a watched series has newly released episodes available.
   */
  const hasNewEpisodes = item.type === "series" && item.status === "watched" && item.episode_count && item.episodes_seen < item.episode_count;
  /**
   * Boolean flag indicating if the item is a series currently being watched.
   */
  const isWatchingSeries = item.type === "series" && item.status === "watching";
  /**
   * Boolean flag indicating if the item is a watched series awaiting a new season return.
   */
  const isWaitingSeries = item.type === "series" && item.status === "watched" && item.tmdb_status === "Returning Series";

  /**
   * Current season number the user is watching.
   */
  let currentS = "";
  /**
   * Current episode number the user is about to watch or is currently watching.
   */
  let currentE = 0;
  /**
   * Number of episodes remaining in the current season.
   */
  let seasonLeft = 0;
  /**
   * Title of the current episode, if available in the metadata.
   */
  let currentEpTitle = "";

  if (isWatchingSeries && item.season_progress) {
    /**
     * Array of season numbers sorted numerically, excluding specials (season 0).
     */
    const sortedSeasons = Object.keys(item.season_progress)
      .filter(s => s !== "0") // ignore specials for quick action
      .sort((a, b) => parseInt(a) - parseInt(b));
    
    for (const s of sortedSeasons) {
      const data = item.season_progress[s];
      if (data.watched < data.total) {
        currentS = s;
        currentE = data.watched + 1;
        seasonLeft = data.total - data.watched;
        currentEpTitle = data.episodes?.[String(currentE)]?.title || "";
        break;
      }
    }
  }

  /**
   * Framer Motion animation controls used for managing swipe gesture states.
   */
  const controls = useAnimation();

  /**
   * Quick-action handler to increment the watched episode count for a series directly from the card.
   */
  const handleQuickAddEpisode = async (e: React.MouseEvent | any) => {
    e.preventDefault(); // Prevent navigating to detail page
    e.stopPropagation();
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const newCount = item.episodes_seen + 1;
      let newStatus = item.status;
      if (item.episode_count && newCount >= item.episode_count) {
        newStatus = "watched";
      }
      
      const newSeasonProgress = item.season_progress ? { ...item.season_progress } : null;
      if (newSeasonProgress && currentS) {
        newSeasonProgress[currentS] = {
          ...newSeasonProgress[currentS],
          watched: newSeasonProgress[currentS].watched + 1
        };
      }
      
      await updateMediaProgress(item.id, {
        episodes_seen: newCount,
        season_progress: newSeasonProgress,
        status: newStatus
      });
      // A small visual success cue could go here if we wanted
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update progress: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Swipe gesture end handler triggering delete on right-swipe or progress on left-swipe.
   */
  const handleDragEnd = async (e: any, info: PanInfo) => {
    /**
     * Horizontal swipe distance threshold required to trigger a gesture action.
     */
    const threshold = 80;
    
    if (info.offset.x > threshold) {
      // Swipe Right -> Delete
      controls.start({ x: 0 });
      handleDelete(e);
    } else if (info.offset.x < -threshold) {
      // Swipe Left -> Progress
      controls.start({ x: 0 });
      if (isWatchingSeries && currentS) {
        await handleQuickAddEpisode(e);
      } else if (item.status === "want_to_watch" || item.status === "want_to_read") {
        await updateMediaProgress(item.id, { status: item.type === "book" ? "reading" : "watching" });
        toast.success(`Started ${item.title}!`);
      }
    } else {
      controls.start({ x: 0 });
    }
  };

  /**
   * Prompts for confirmation and deletes the selected media item from the vault.
   */
  const handleDelete = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this item from the Vault?")) {
      setIsUpdating(true);
      try {
        await deleteMediaFromVault(item.id);
        toast.success("Item deleted");
      } catch (err: any) {
        toast.error("Failed to delete: " + err.message);
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden touch-pan-y group/container">
      {/* Background Actions (Revealed on Swipe) */}
      <div className="absolute inset-0 flex justify-between rounded-3xl bg-(--color-lunar-900)">
        {/* Left Action (Swipe Right) */}
        <div className="w-1/2 flex items-center justify-start pl-6">
          <div className="flex flex-col items-center justify-center text-red-500">
            <DeleteIcon />
            <span className="text-[10px] font-semibold mt-1">Delete</span>
          </div>
        </div>
        {/* Right Action (Swipe Left) */}
        <div className="w-1/2 flex items-center justify-end pr-6">
          <div className="flex flex-col items-center justify-center text-violet-400">
            <CheckIcon />
            <span className="text-[10px] font-semibold mt-1">Progress</span>
          </div>
        </div>
      </div>

      <motion.div
        drag={disableGestures ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={disableGestures ? undefined : handleDragEnd}
        animate={controls}
        className="w-full h-40 sm:h-48 relative z-10"
      >
        <Link
          href={href}
          className="group flex flex-row h-full rounded-3xl overflow-hidden border transition-all duration-300 focus-visible:outline-2 shadow-(--shadow-card) hover:shadow-(--shadow-card-hover) border-[color-mix(in_srgb,var(--color-violet-500)_15%,transparent)] hover:border-[color-mix(in_srgb,var(--color-violet-500)_35%,transparent)] bg-(--color-lunar-950)"
        >
      {/* Cover image */}
      <div className="relative w-28 sm:w-32 shrink-0 h-full overflow-hidden">
        <Image
          src={coverSrc}
          alt={`Cover for ${item.title}`}
          fill
          sizes="128px"
          unoptimized
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

      </div>

      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col gap-1 min-w-0">
        {/* Top badges for status & new episodes */}
        {(isDashboard || hasNewEpisodes || (isWaitingSeries && item.next_episode_air_date)) && (
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {isDashboard && (
              <Chip 
                label={TYPE_LABELS[item.type]} 
                size="small"
                className="text-violet-300 bg-(--color-violet-500)/10 border border-(--color-violet-500)/20 font-semibold"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            )}
            {isDashboard && (
              <Chip 
                label={STATUS_LABELS[item.status]} 
                size="small"
                className={`${STATUS_COLORS[item.status]} shadow-sm font-semibold`}
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            )}
            {hasNewEpisodes && (
              <Chip 
                icon={<NewReleasesIcon style={{ color: 'white', fontSize: 12 }} />}
                label="New Episodes"
                size="small"
                className="bg-red-500/90 text-white shadow-sm shadow-red-500/20 border-red-500 animate-pulse font-bold"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            )}
            {isWaitingSeries && item.next_episode_air_date && (
              <Chip 
                icon={<CalendarMonthIcon style={{ color: 'white', fontSize: 12 }} />}
                label={new Date(item.next_episode_air_date).toLocaleDateString()}
                size="small"
                className="bg-starlight-600/90 text-white shadow-sm border-starlight-500 font-bold"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            )}
          </div>
        )}

        {/* Title */}
        <h3
          className="font-semibold text-base leading-tight line-clamp-3"
          style={{ color: "var(--color-lunar-100)" }}
        >
          {item.title}
        </h3>

        {/* Author / Director */}
        {(item.author ?? item.director) && (
          <p
            className="text-xs"
            style={{ color: "var(--color-lunar-500)" }}
          >
            {item.author ?? item.director}
          </p>
        )}

        {/* Year, Runtime, Pages, Recipe details */}
        {(item.release_year || item.runtime_minutes || item.total_pages || item.type === "recipe") && (
          <p
            className="text-xs flex items-center gap-1.5 flex-wrap"
            style={{ color: "var(--color-lunar-500)" }}
          >
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
                  <span>
                    {item.ingredients.length} ingredients
                  </span>
                )}
                {Array.isArray(item.instructions) && item.instructions.length > 0 && (
                  <>
                    {Array.isArray(item.ingredients) && item.ingredients.length > 0 && <span className="opacity-50">•</span>}
                    <span>
                      {item.instructions.length} steps
                    </span>
                  </>
                )}
              </>
            )}
          </p>
        )}

        <div className="flex flex-col mt-auto gap-2 w-full overflow-hidden">
          {/* Synopsis Snippet */}
          {!(item.type === "series" && isWatchingSeries && !isDashboard) && item.synopsis && (
            <p className={`text-[11px] text-lunar-400 leading-relaxed ${item.type === "book" ? "line-clamp-3" : "line-clamp-3 sm:line-clamp-4"}`}>
              {item.synopsis.replace(/[*_#~`>]/g, "")}
            </p>
          )}

          {/* Recipe Ingredients Preview */}
          {item.type === "recipe" && !item.synopsis && Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
            <p className="text-[11px] text-lunar-400 line-clamp-3 sm:line-clamp-4 leading-relaxed italic">
              {item.ingredients.join(", ")}
            </p>
          )}

          {/* Quick Actions / Rating */}
          {((isWatchingSeries && !isDashboard) || item.user_rating !== null) && (
            <div className="flex items-center justify-between w-full">
            {isWatchingSeries && currentS && !isDashboard ? (
            <div className="flex w-full items-center justify-between bg-(--color-lunar-950) border border-lunar-800 p-3 rounded-xl">
              <div className="flex flex-col overflow-hidden flex-1 mr-2">
                <span className="text-lunar-100 text-sm font-bold leading-tight">
                  S{currentS.padStart(2, '0')} E{currentE.toString().padStart(2, '0')}
                </span>
                {currentEpTitle && (
                  <span className="text-xs text-lunar-300 leading-tight truncate w-full mt-0.5">
                    {currentEpTitle}
                  </span>
                )}
                <span className="text-[11px] text-lunar-500 leading-tight font-medium mt-1">
                  {seasonLeft} left in season
                </span>
              </div>
              <IconButton
                onClick={handleQuickAddEpisode}
                disabled={isUpdating}
                size="small"
                sx={{ 
                  bgcolor: "var(--color-violet-600)", 
                  color: "white", 
                  width: 36, 
                  height: 36,
                  '&:hover': { bgcolor: "var(--color-violet-500)" },
                  '&:active': { transform: 'scale(0.95)' }
                }}
                title="Mark episode as watched"
              >
                {isUpdating ? <span className="text-[10px]">...</span> : <CheckIcon fontSize="small" />}
              </IconButton>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {item.user_rating !== null && (
                <>
                  <StarIcon sx={{ color: "var(--color-starlight-400)", fontSize: 16 }} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--color-starlight-400)" }}
                  >
                    {formatRating(item.user_rating)}
                  </span>
                </>
              )}
            </div>
          )}
          {isWatchingSeries && !currentS && !isDashboard && (
            <Button
              onClick={handleQuickAddEpisode}
              disabled={isUpdating}
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              sx={{ 
                bgcolor: "var(--color-violet-600)", 
                color: "white", 
                fontSize: "10px",
                fontWeight: "bold",
                minWidth: 0,
                padding: "2px 8px",
                '&:hover': { bgcolor: "var(--color-violet-500)" }
              }}
              title="Watched +1 Episode"
            >
              {isUpdating ? "..." : "1 Ep"}
            </Button>
          )}
        </div>
        )}
        </div>
      </div>
    </Link>
  </motion.div>
</div>
  );
}
