// src/components/media/MediaCard.tsx
"use client";
// Reusable card for any media type — movies, series, books.
// RSC: purely presentational, no client interactivity.

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
import StarIcon from "@mui/icons-material/Star";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion, useAnimation, type PanInfo } from "framer-motion";
import { updateMediaProgress, deleteMediaFromVault } from "@/lib/actions/mediaActions";

interface MediaCardProps {
  item: MediaItem;
}

export function MediaCard({ item }: MediaCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname === "/";
  
  const href = `/${item.type === "series" ? "series" : item.type === "book" ? "books" : "movies"}/${item.id}`;
  const coverSrc = item.cover_url ?? getCoverPlaceholder(item.title);
  
  const hasNewEpisodes = item.type === "series" && item.status === "watched" && item.episode_count && item.episodes_seen < item.episode_count;
  const isWatchingSeries = item.type === "series" && item.status === "watching";
  const isWaitingSeries = item.type === "series" && item.status === "watched" && item.tmdb_status === "Returning Series";

  let currentS = "";
  let currentE = 0;
  let seasonLeft = 0;

  if (isWatchingSeries && item.season_progress) {
    const sortedSeasons = Object.keys(item.season_progress)
      .filter(s => s !== "0") // ignore specials for quick action
      .sort((a, b) => parseInt(a) - parseInt(b));
    
    for (const s of sortedSeasons) {
      const data = item.season_progress[s];
      if (data.watched < data.total) {
        currentS = s;
        currentE = data.watched + 1;
        seasonLeft = data.total - data.watched;
        break;
      }
    }
  }

  const controls = useAnimation();

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
      
      let newSeasonProgress = item.season_progress ? { ...item.season_progress } : null;
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

  const handleDragEnd = async (e: any, info: PanInfo) => {
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

  const handleDelete = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this item from the Vault?")) {
      setIsUpdating(true);
      try {
        await deleteMediaFromVault(item.id, item.type);
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
      <div className="absolute inset-0 flex justify-between rounded-3xl bg-[var(--color-lunar-900)]">
        {/* Left Action (Swipe Right) */}
        <div className="w-1/2 flex items-center justify-start pl-6">
          <div className="flex flex-col items-center justify-center text-red-500">
            <DeleteIcon />
            <span className="text-[10px] font-semibold mt-1">Delete</span>
          </div>
        </div>
        {/* Right Action (Swipe Left) */}
        <div className="w-1/2 flex items-center justify-end pr-6">
          <div className="flex flex-col items-center justify-center text-[var(--color-violet-400)]">
            <CheckIcon />
            <span className="text-[10px] font-semibold mt-1">Progress</span>
          </div>
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="w-full h-full relative z-10"
      >
        <Link
          href={href}
          className="group flex flex-row h-full rounded-3xl overflow-hidden border transition-all duration-300 focus-visible:outline-2 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] border-[color-mix(in_srgb,var(--color-violet-500)_15%,transparent)] hover:border-[color-mix(in_srgb,var(--color-violet-500)_35%,transparent)] bg-[var(--color-lunar-950)]"
        >
      {/* Cover image */}
      <div className="relative w-28 sm:w-32 shrink-0 aspect-[2/3] overflow-hidden">
        <Image
          src={coverSrc}
          alt={`Cover for ${item.title}`}
          fill
          sizes="128px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
          }}
        />

        {/* Top overlay gradient to ensure badges are readable on light/white covers */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/70 to-transparent z-0 pointer-events-none" />

        {/* Top-left: Media type badge */}
        <div className="absolute top-2 left-2 z-10">
          <Chip 
            label={TYPE_LABELS[item.type]} 
            size="small"
            className="text-[var(--color-violet-300)] bg-[var(--color-violet-500)]/10 border border-[var(--color-violet-500)]/20 shadow-md backdrop-blur-sm bg-black/40 font-semibold"
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col justify-center gap-1">
        {/* Top badges for status & new episodes */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Chip 
            label={STATUS_LABELS[item.status]} 
            size="small"
            className={`${STATUS_COLORS[item.status]} shadow-sm font-semibold`}
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
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
              className="bg-[var(--color-starlight-600)]/90 text-white shadow-sm border-[var(--color-starlight-500)] font-bold"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          )}
        </div>

        {/* Title */}
        <h3
          className="font-semibold text-base leading-tight line-clamp-2"
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

        {/* Year */}
        {item.release_year && (
          <p
            className="text-xs"
            style={{ color: "var(--color-lunar-600)" }}
          >
            {item.release_year}
          </p>
        )}

        {/* Quick Actions / Rating */}
        {(isWatchingSeries && !isDashboard) || item.user_rating !== null ? (
          <div className="pt-2 flex items-center justify-between w-full mt-auto">
            {isWatchingSeries && currentS && !isDashboard ? (
            <div className="flex w-full items-center justify-between bg-[var(--color-lunar-950)] border border-[var(--color-lunar-800)] p-2 rounded-xl">
              <div className="flex flex-col">
                <span className="text-[var(--color-lunar-100)] text-xs font-bold leading-tight">
                  S{currentS.padStart(2, '0')} E{currentE.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] text-[var(--color-lunar-400)] leading-tight font-medium mt-0.5">
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
                  width: 28, 
                  height: 28,
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
        ) : null}
      </div>
    </Link>
  </motion.div>
</div>
  );
}
