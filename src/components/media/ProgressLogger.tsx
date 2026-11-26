/**
 * @module
 *
 * Progress tracking panel shown in the "Log Progress" tab of the media detail page.
 * All fields auto-save on blur or change (except the review textarea which requires
 * explicit "Save Notes" because the user may type for a while before wanting to save).
 *
 * Supported tracking per media type:
 *  - Movies: status, rating, runtime, review, tags, dates.
 *  - Series: status, rating, episode guide with per-episode watched toggles, review, tags, dates.
 *  - Books: status, rating, pages read, reading timer, session notes, review, tags, dates.
 *  - Recipes: status, rating, review, tags.
 */
"use client"

import { useState, useEffect } from "react"
import type { MediaItem, MediaStatus, SeasonData, EpisodeData } from "@/lib/supabase/database.types"
import { getAllVaultTagsAction, updateMediaProgress } from "@/lib/actions/mediaActions"
import { STATUS_LABELS } from "@/lib/constants"
import { ReadingTimer } from "./ReadingTimer"
import { toast } from "sonner"
import { VaultTooltip } from "@/components/ui/VaultTooltip"
import { FormControl, Select, MenuItem, Autocomplete, TextField } from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs from "dayjs"

/**
 * Props interface for the ProgressLoggerProps.
 */
export interface ProgressLoggerProps {
  item: MediaItem
  status?: MediaStatus
  onStatusChange?: (status: MediaStatus) => void
}

const DEFAULT_SUGGESTED_TAGS = [
  "Favorites",
  "Must Watch",
  "Must Read",
  "Cozy",
  "Sci-Fi",
  "Documentary",
  "Quick Read",
  "Classics",
]

const DATE_PICKER_SLOT_PROPS = {
  textField: {
    size: "small" as const,
    fullWidth: true,
    sx: {
      width: "100%",
      "& .MuiPickersInputBase-root, & .MuiPickersOutlinedInput-root, & .MuiInputBase-root": {
        height: 38,
        minHeight: 38,
        maxHeight: 38,
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "0.75rem",
        paddingLeft: "14px",
        paddingRight: "10px",
        paddingTop: 0,
        paddingBottom: 0,
        transition: "all 0.15s ease",
        fontFamily: "inherit",
        fontSize: "0.8125rem",
        color: "var(--color-foreground)",
        "&:hover": {
          borderColor: "var(--color-primary)",
        },
        "&.Mui-focused": {
          borderColor: "var(--color-primary)",
          boxShadow: "0 0 0 2px rgba(180, 112, 255, 0.35)",
        },
        "& fieldset, & .MuiPickersOutlinedInput-notchedOutline": {
          display: "none",
        },
      },
      "& .MuiPickersInputBase-sectionsContainer, & .MuiPickersSectionList-root": {
        padding: "0 !important",
        height: "100%",
        display: "flex",
        alignItems: "center",
        fontSize: "0.8125rem",
        color: "var(--color-foreground)",
        lineHeight: "38px",
      },
      "& .MuiPickersSectionList-sectionContent, & .MuiPickersInputBase-sectionContent": {
        fontFamily: "inherit",
        fontSize: "0.8125rem",
        fontWeight: 500,
        color: "var(--color-foreground)",
        outline: "none !important",
        border: "none !important",
        boxShadow: "none !important",
        padding: "1px 3px",
        borderRadius: "4px",
        "&:focus, &[data-selected='true']": {
          backgroundColor: "rgba(180, 112, 255, 0.25) !important",
          color: "var(--color-primary)",
          outline: "none !important",
        },
      },
      "& .MuiPickersInputBase-sectionAfter, & .MuiPickersInputBase-sectionBefore, & .MuiPickersSectionList-sectionSeparator":
        {
          color: "var(--color-muted)",
          fontSize: "0.8125rem",
          padding: "0 1px",
        },
      "& .MuiInputAdornment-root": {
        margin: "0 !important",
        marginLeft: "auto !important",
        padding: "0 !important",
      },
      "& .MuiIconButton-root, & .MuiIconButton-edgeEnd": {
        color: "var(--color-primary)",
        margin: "0 !important",
        marginRight: "0 !important",
        width: "26px !important",
        height: "26px !important",
        padding: "4px !important",
        "&:hover": {
          backgroundColor: "var(--color-surface-hover)",
        },
      },
      "& .MuiSvgIcon-root": {
        fontSize: "1rem",
      },
    },
  },
}

/**
 * Interactive panel for logging progress on a media item.
 * Auto-saves most fields on change/blur.
 */
export function ProgressLogger({
  item,
  status: controlledStatus,
  onStatusChange,
}: ProgressLoggerProps) {
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [localStatus, setLocalStatus] = useState<MediaStatus>(item.status)
  const status = controlledStatus ?? localStatus

  const updateStatus = (newStatus: MediaStatus) => {
    setLocalStatus(newStatus)
    onStatusChange?.(newStatus)
  }

  // Local state for edits
  const [rating, setRating] = useState<number>(item.user_rating || 0)
  const [review, setReview] = useState<string>(item.user_notes || "")
  const [tags, setTags] = useState<string[]>(item.tags || [])
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_SUGGESTED_TAGS)

  useEffect(() => {
    getAllVaultTagsAction()
      .then((existingTags) => {
        if (existingTags.length > 0) {
          const merged = Array.from(new Set([...existingTags, ...DEFAULT_SUGGESTED_TAGS]))
          setAvailableTags(merged)
        }
      })
      .catch(() => {})
  }, [])

  // Progress state
  const [pagesRead, setPagesRead] = useState<number>(item.pages_read || 0)
  const [totalPages, setTotalPages] = useState<number>(item.total_pages || 0)
  const [readingTime, setReadingTime] = useState<number>(item.reading_time_minutes || 0)
  const [sessionMinutes, setSessionMinutes] = useState<number>(0)

  const [episodesSeen, setEpisodesSeen] = useState<number>(item.episodes_seen || 0)
  const [episodeCount, setEpisodeCount] = useState<number>(item.episode_count || 0)
  const [seasonProgress, setSeasonProgress] = useState<Record<string, SeasonData>>(
    (item.season_progress as Record<string, SeasonData>) || {}
  )
  const [runtimeMinutes, setRuntimeMinutes] = useState<number>(item.runtime_minutes || 0)

  // Journal State
  const [startDate, setStartDate] = useState<string>(
    item.start_date ? item.start_date.substring(0, 10) : ""
  )
  const [endDate, setEndDate] = useState<string>(
    item.date_completed ? item.date_completed.substring(0, 10) : ""
  )
  const [sessionNotes, setSessionNotes] = useState<string>("")
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null)

  /**
   * Boolean flag indicating whether there are unsaved local edits to the review, session notes, or timer.
   */
  const hasUnsavedNotes =
    review !== (item.user_notes || "") || sessionNotes.trim() !== "" || sessionMinutes > 0

  // --- Auto-Save Helpers ---
  async function commitUpdate(updates: Partial<MediaItem>) {
    try {
      await updateMediaProgress(item.id, updates)
    } catch (error) {
      console.error("Failed to auto-save:", error)
      toast.error("Failed to auto-save progress.")
    }
  }

  /**
   * Toggles the watched status of a specific episode and recalculates total season progress and media status.
   */
  const toggleEpisode = (seasonNum: string, epNum: string) => {
    /**
     * Current progress data for the selected season.
     */
    const sData = seasonProgress[seasonNum]
    if (!sData || !sData.episodes) return

    /**
     * Detailed metadata and watched status for the specific episode.
     */
    const epData = sData.episodes[epNum]
    if (!epData) return

    /**
     * The toggled boolean watched state for the target episode.
     */
    const newWatchedState = !epData.watched
    /**
     * The updated count of watched episodes in the current season.
     */
    const newWatchedCount = sData.watched + (newWatchedState ? 1 : -1)

    /**
     * The cloned and updated season data object incorporating the episode toggle.
     */
    const newSeasonData: SeasonData = {
      ...sData,
      watched: newWatchedCount,
      episodes: {
        ...sData.episodes,
        [epNum]: { ...epData, watched: newWatchedState },
      },
    }

    /**
     * The cloned and updated overall season progress object for the series.
     */
    const newSeasonProgress = {
      ...seasonProgress,
      [seasonNum]: newSeasonData,
    }

    setSeasonProgress(newSeasonProgress)

    /**
     * Recalculated total number of episodes watched across all seasons.
     */
    const finalEpisodesSeen = Object.values(newSeasonProgress).reduce(
      (acc, curr) => acc + curr.watched,
      0
    )
    /**
     * Recalculated total number of episodes available across all seasons.
     */
    const finalEpisodeCount = Object.values(newSeasonProgress).reduce(
      (acc, curr) => acc + curr.total,
      0
    )

    /**
     * Calculated new media status, updated to 'watched' if all available episodes are completed.
     */
    let newStatus = status
    if (finalEpisodeCount > 0 && finalEpisodesSeen >= finalEpisodeCount) {
      newStatus = "watched"
      updateStatus("watched")
    }

    setEpisodesSeen(finalEpisodesSeen)
    commitUpdate({
      season_progress: newSeasonProgress,
      episodes_seen: finalEpisodesSeen,
      status: newStatus,
    })
  }

  const toggleAllEpisodes = (seasonNum: string, markWatched: boolean) => {
    const sData = seasonProgress[seasonNum]
    if (!sData || !sData.episodes) return

    const updatedEpisodes: Record<string, EpisodeData> = {}
    let watchedCount = 0

    Object.entries(sData.episodes).forEach(([epNum, ep]) => {
      updatedEpisodes[epNum] = {
        ...ep,
        watched: markWatched,
      }
      if (markWatched) watchedCount++
    })

    const newSeasonData: SeasonData = {
      ...sData,
      watched: watchedCount,
      episodes: updatedEpisodes,
    }

    const newSeasonProgress = {
      ...seasonProgress,
      [seasonNum]: newSeasonData,
    }

    setSeasonProgress(newSeasonProgress)

    const finalEpisodesSeen = Object.values(newSeasonProgress).reduce(
      (acc, curr) => acc + curr.watched,
      0
    )
    const finalEpisodeCount = Object.values(newSeasonProgress).reduce(
      (acc, curr) => acc + curr.total,
      0
    )

    let newStatus = status
    if (finalEpisodeCount > 0 && finalEpisodesSeen >= finalEpisodeCount) {
      newStatus = "watched"
      updateStatus("watched")
    }

    setEpisodesSeen(finalEpisodesSeen)
    commitUpdate({
      season_progress: newSeasonProgress,
      episodes_seen: finalEpisodesSeen,
      status: newStatus,
    })
  }

  /**
   * Updates the logged pages read and automatically sets the status to 'read' if the total is reached.
   */
  const handleAddPages = async (newPages: number, newTotal: number) => {
    /**
     * Calculated new media status, updated to 'read' if all pages are completed.
     */
    let newStatus = status
    if (newTotal > 0 && newPages >= newTotal) {
      newStatus = "read"
      updateStatus("read")
    }
    await commitUpdate({
      pages_read: newPages,
      total_pages: newTotal > 0 ? newTotal : null,
      status: newStatus,
    })
  }

  // --- Manual Save for Text Notes ---
  async function handleSaveNotes() {
    setIsSavingNotes(true)
    try {
      let newReadingSessions = item.reading_sessions || []
      if (item.type === "book" && (sessionMinutes > 0 || sessionNotes.trim() !== "")) {
        const pagesDelta = Math.max(0, pagesRead - (item.pages_read || 0))
        newReadingSessions = [
          ...newReadingSessions,
          {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            minutes: sessionMinutes,
            pages_read: pagesDelta,
            notes: sessionNotes.trim(),
          },
        ]
      }

      await updateMediaProgress(item.id, {
        user_notes: review.trim() === "" ? null : review.trim(),
        reading_time_minutes: readingTime + sessionMinutes,
        reading_sessions: newReadingSessions.length > 0 ? newReadingSessions : null,
      })

      if (sessionMinutes > 0) setReadingTime((prev) => prev + sessionMinutes)
      setSessionMinutes(0)
      setSessionNotes("")
      toast.success("Notes saved successfully!")
    } catch {
      toast.error("Failed to save notes. Please try again.")
    } finally {
      setIsSavingNotes(false)
    }
  }

  /**
   * Renders an interactive 5-star rating component for the media item.
   */
  const renderStars = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => {
            setRating(star)
            commitUpdate({ user_rating: star })
          }}
          className={`cursor-pointer border-0 text-xl shadow-none transition-colors outline-none ${
            rating >= star ? "text-primary" : "text-muted/30 hover:text-primary/70"
          }`}
        >
          ★
        </button>
      ))}
      {rating > 0 && (
        <button
          type="button"
          onClick={() => {
            setRating(0)
            commitUpdate({ user_rating: null })
          }}
          className="text-muted hover:text-foreground ml-2 cursor-pointer border-0 text-[11px] shadow-none outline-none"
        >
          Clear
        </button>
      )}
    </div>
  )

  return (
    <div className="flex w-full flex-col gap-5">
      {/* Global: Status & Rating */}
      <div className="grid grid-cols-2 gap-3.5">
        <div>
          <label className="text-muted mb-1 block text-[11px] font-medium tracking-wider uppercase">
            Status
          </label>
          <FormControl size="small" fullWidth>
            <Select
              value={status}
              onChange={(e) => {
                const val = e.target.value as MediaStatus
                updateStatus(val)
                commitUpdate({ status: val })
              }}
              sx={{
                height: 38,
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.75rem",
                color: "var(--color-foreground)",
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused": {
                  borderColor: "var(--color-primary)",
                  boxShadow: "0 0 0 2px rgba(180, 112, 255, 0.35)",
                },
                "& fieldset": {
                  display: "none",
                },
                "& .MuiSelect-select": {
                  paddingLeft: "14px",
                  paddingRight: "32px",
                  fontSize: "0.8125rem",
                  color: "var(--color-foreground)",
                },
                "& .MuiSelect-icon": {
                  color: "var(--color-primary)",
                  right: 8,
                },
              }}
            >
              {Object.entries(STATUS_LABELS)
                .filter(([val]) => {
                  if (item.type === "book")
                    return ["read", "reading", "want_to_read", "dropped", "on_hold"].includes(val)
                  return ["watched", "watching", "want_to_watch", "dropped", "on_hold"].includes(
                    val
                  )
                })
                .map(([val, label]) => (
                  <MenuItem key={val} value={val}>
                    {label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </div>
        <div>
          <label className="text-muted mb-1 block text-[11px] font-medium tracking-wider uppercase">
            Rating
          </label>
          <div className="pt-1.5">{renderStars()}</div>
        </div>
      </div>

      {/* Global: Tags */}
      <div>
        <label className="text-muted mb-1 block text-[11px] font-medium tracking-wider uppercase">
          Collections / Tags
        </label>
        <Autocomplete
          multiple
          freeSolo
          disableClearable
          options={availableTags}
          value={tags}
          onChange={(_, newValue) => {
            setTags(newValue as string[])
            commitUpdate({ tags: newValue as string[] })
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={tags.length === 0 ? "Add tags (type or choose)..." : ""}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiInputBase-root": {
                  minHeight: 38,
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.75rem",
                  padding: "4px 10px !important",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: "var(--color-primary)",
                  },
                  "&.Mui-focused": {
                    borderColor: "var(--color-primary)",
                    boxShadow: "0 0 0 2px rgba(180, 112, 255, 0.35)",
                  },
                  "& fieldset": {
                    display: "none",
                  },
                },
                "& .MuiInputBase-input": {
                  border: "none !important",
                  outline: "none !important",
                  boxShadow: "none !important",
                  fontSize: "0.8125rem",
                  color: "var(--color-foreground)",
                  padding: "2px 4px !important",
                },
                "& .MuiChip-root": {
                  backgroundColor: "rgba(180, 112, 255, 0.15)",
                  color: "var(--color-primary)",
                  borderColor: "rgba(180, 112, 255, 0.3)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  height: 24,
                  "& .MuiChip-deleteIcon": {
                    color: "var(--color-primary)",
                    "&:hover": {
                      color: "var(--color-primary-hover, #d8b4fe)",
                    },
                  },
                },
              }}
            />
          )}
        />
      </div>

      {/* Global: Dates */}
      <div className="grid grid-cols-2 gap-3.5">
        <div>
          <label className="text-muted mb-1 block text-[11px] font-medium tracking-wider uppercase">
            Start Date
          </label>
          <DatePicker
            value={startDate && dayjs(startDate).isValid() ? dayjs(startDate) : null}
            onChange={(newValue) => {
              const val = newValue && newValue.isValid() ? newValue.format("YYYY-MM-DD") : ""
              setStartDate(val)
              commitUpdate({ start_date: val ? new Date(val).toISOString() : null })
            }}
            slotProps={DATE_PICKER_SLOT_PROPS}
          />
        </div>
        <div>
          <label className="text-muted mb-1 block text-[11px] font-medium tracking-wider uppercase">
            End Date
          </label>
          <DatePicker
            value={endDate && dayjs(endDate).isValid() ? dayjs(endDate) : null}
            onChange={(newValue) => {
              const val = newValue && newValue.isValid() ? newValue.format("YYYY-MM-DD") : ""
              setEndDate(val)
              commitUpdate({ date_completed: val ? new Date(val).toISOString() : null })
            }}
            slotProps={DATE_PICKER_SLOT_PROPS}
          />
        </div>
      </div>

      {/* Type-Specific Logging */}
      {/* Type-Specific: Book */}
      {item.type === "book" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-foreground text-xs font-medium">Pages Read</span>
            <span className="text-muted font-mono text-xs">
              {pagesRead} / {totalPages || "?"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-muted mb-1 block text-[11px] font-medium tracking-wider uppercase">
                Current Page
              </label>
              <input
                type="number"
                min="0"
                value={pagesRead}
                onChange={(e) => setPagesRead(Number(e.target.value))}
                onBlur={(e) => handleAddPages(Number(e.target.value), totalPages)}
                className="bg-surface border-border hover:border-primary/50 focus:border-primary focus:ring-primary/35 text-foreground placeholder:text-muted h-[38px] w-full rounded-xl border px-3.5 font-mono text-[13px] transition-all focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-muted mb-1 block text-[11px] font-medium tracking-wider uppercase">
                Total Pages
              </label>
              <input
                type="number"
                min="0"
                value={totalPages}
                onChange={(e) => setTotalPages(Number(e.target.value))}
                onBlur={(e) => handleAddPages(pagesRead, Number(e.target.value))}
                className="bg-surface border-border hover:border-primary/50 focus:border-primary focus:ring-primary/35 text-foreground placeholder:text-muted h-[38px] w-full rounded-xl border px-3.5 font-mono text-[13px] transition-all focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="border-border border-t pt-4">
            <ReadingTimer
              itemId={item.id}
              onStop={(mins) => setSessionMinutes((prev) => prev + mins)}
            />
            <label className="text-muted mt-3 mb-1 block text-[11px] font-medium tracking-wider uppercase">
              Or add manual Session Duration (Minutes)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="+ Add minutes"
                value={sessionMinutes || ""}
                onChange={(e) => setSessionMinutes(Number(e.target.value))}
                className="bg-surface border-border hover:border-primary/50 focus:border-primary focus:ring-primary/35 text-foreground placeholder:text-muted h-[38px] flex-1 rounded-xl border px-3.5 font-mono text-[13px] transition-all focus:ring-2 focus:outline-none"
              />
              <span className="text-muted font-mono text-xs whitespace-nowrap">
                Total: {readingTime + sessionMinutes}m
              </span>
            </div>

            <label className="text-muted mt-3 mb-1 block text-[11px] font-medium tracking-wider uppercase">
              Session Notes
            </label>
            <textarea
              rows={2}
              placeholder="Write a quick note for this reading session..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="bg-surface border-border hover:border-primary/50 focus:border-primary focus:ring-primary/35 text-foreground placeholder:text-muted w-full resize-none rounded-xl border px-3.5 py-2 text-[13px] transition-all focus:ring-2 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Type-Specific: Series */}
      {item.type === "series" && Object.keys(seasonProgress).length > 0 && (
        <div className="border-border space-y-4 border-t pt-4">
          <div className="border-border mb-2 flex items-center justify-between border-b pb-2">
            <label className="text-muted mb-1 block text-[11px] font-medium tracking-wider uppercase">
              Episode Guide
            </label>
            <span className="text-muted font-mono text-xs">
              {Object.values(seasonProgress).reduce(
                (acc, curr) =>
                  acc + Object.values(curr.episodes || {}).filter((ep) => ep.watched).length,
                0
              )}{" "}
              /{" "}
              {Object.values(seasonProgress).reduce(
                (acc, curr) => acc + Object.keys(curr.episodes || {}).length,
                0
              )}
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {Object.entries(seasonProgress).map(([seasonNumber, data]) => {
              const isExpanded = expandedSeason === seasonNumber
              const hasDetailedEpisodes = data.episodes && Object.keys(data.episodes).length > 0
              const totalEpisodesInSeason = Object.keys(data.episodes || {}).length
              const watchedEpisodesInSeason = Object.values(data.episodes || {}).filter(
                (ep) => ep.watched
              ).length
              const allSeasonWatched =
                totalEpisodesInSeason > 0 && watchedEpisodesInSeason === totalEpisodesInSeason

              return (
                <div
                  key={seasonNumber}
                  className="bg-surface border-border flex flex-col overflow-hidden rounded-xl border"
                >
                  <div
                    className="hover:bg-surface-elevated flex cursor-pointer items-center justify-between p-3 transition-colors"
                    onClick={() => setExpandedSeason(isExpanded ? null : seasonNumber)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-foreground text-xs font-semibold">
                        {seasonNumber === "0" ? "Specials" : `Season ${seasonNumber}`}
                      </span>
                      {hasDetailedEpisodes && (
                        <VaultTooltip
                          label={
                            allSeasonWatched
                              ? "Unmark all episodes in this season"
                              : "Mark all episodes in this season as watched"
                          }
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleAllEpisodes(seasonNumber, !allSeasonWatched)
                            }}
                            className={`cursor-pointer rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-all ${
                              allSeasonWatched
                                ? "bg-primary text-primary-fg border-primary shadow-xs"
                                : "bg-surface-elevated text-muted hover:text-primary hover:border-primary border-border"
                            }`}
                          >
                            {allSeasonWatched ? "✓ All Watched" : "Select All"}
                          </button>
                        </VaultTooltip>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted bg-surface-elevated border-border rounded border px-2 py-0.5 font-mono text-[11px]">
                        {watchedEpisodesInSeason} / {totalEpisodesInSeason}
                      </span>
                      <span className="text-muted text-[10px]">{isExpanded ? "▼" : "▶"}</span>
                    </div>
                  </div>

                  {isExpanded && hasDetailedEpisodes && (
                    <div className="border-border divide-border bg-surface-elevated/40 flex flex-col divide-y border-t">
                      {Object.entries(data.episodes)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([epNum, ep]: [string, EpisodeData]) => (
                          <div
                            key={epNum}
                            className={`hover:bg-surface-elevated flex cursor-pointer gap-2.5 p-2.5 transition-colors ${
                              ep.watched ? "opacity-55" : ""
                            }`}
                          >
                            {/* Checkbox */}
                            <div className="pt-0.5">
                              <button
                                type="button"
                                onClick={() => toggleEpisode(seasonNumber, epNum)}
                                className={`focus:ring-primary focus:ring-offset-surface flex h-4 w-4 cursor-pointer items-center justify-center rounded border transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none ${
                                  ep.watched
                                    ? "bg-primary border-primary text-primary-fg shadow-xs"
                                    : "bg-surface-elevated border-border hover:border-primary hover:bg-primary/10"
                                }`}
                              >
                                {ep.watched && <span className="text-[10px] leading-none">✓</span>}
                              </button>
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <div className="mb-0.5 flex items-start justify-between gap-2">
                                <h4
                                  className={`truncate text-xs font-medium ${
                                    ep.watched ? "text-muted line-through" : "text-foreground"
                                  }`}
                                >
                                  {epNum}. {ep.title}
                                </h4>
                                <div className="flex shrink-0 flex-col items-end gap-0.5">
                                  {ep.runtime_minutes && (
                                    <span className="text-muted font-mono text-[10px]">
                                      {ep.runtime_minutes}m
                                    </span>
                                  )}
                                  {ep.air_date && (
                                    <span className="text-muted text-[10px]">{ep.air_date}</span>
                                  )}
                                </div>
                              </div>
                              {ep.overview && (
                                <p className="text-muted line-clamp-2 text-[11px] leading-relaxed">
                                  {ep.overview}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                  {isExpanded && !hasDetailedEpisodes && (
                    <div className="text-muted p-3 text-center text-xs">
                      Detailed episode data is not available for this season.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legacy Fallback if series has no seasonProgress */}
      {item.type === "series" && Object.keys(seasonProgress).length === 0 && (
        <div className="border-border space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-foreground text-xs font-medium">Episodes Watched</span>
            <span className="text-muted font-mono text-xs">
              {episodesSeen} / {episodeCount || "?"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-muted mb-1 block text-[11px] font-medium tracking-wider uppercase">
                Watched
              </label>
              <input
                type="number"
                min="0"
                value={episodesSeen}
                onChange={(e) => setEpisodesSeen(Number(e.target.value))}
                onBlur={(e) => commitUpdate({ episodes_seen: Number(e.target.value) })}
                className="bg-surface border-border hover:border-primary/50 focus:border-primary focus:ring-primary/35 text-foreground placeholder:text-muted h-[38px] w-full rounded-xl border px-3.5 font-mono text-[13px] transition-all focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-muted mb-1 block text-[11px] font-medium tracking-wider uppercase">
                Total Episodes
              </label>
              <input
                type="number"
                min="0"
                value={episodeCount}
                onChange={(e) => setEpisodeCount(Number(e.target.value))}
                onBlur={(e) => commitUpdate({ episode_count: Number(e.target.value) })}
                className="bg-surface border-border hover:border-primary/50 focus:border-primary focus:ring-primary/35 text-foreground placeholder:text-muted h-[38px] w-full rounded-xl border px-3.5 font-mono text-[13px] transition-all focus:ring-2 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {(item.type === "movie" || item.type === "series") && (
        <div className="border-border space-y-4 border-t pt-4">
          <div>
            <label className="text-muted mb-1 block text-[11px] font-medium tracking-wider uppercase">
              {item.type === "movie" ? "Runtime (Minutes)" : "Avg. Episode Runtime (Minutes)"}
            </label>
            <input
              type="number"
              min="0"
              value={runtimeMinutes}
              onChange={(e) => setRuntimeMinutes(Number(e.target.value))}
              onBlur={(e) => commitUpdate({ runtime_minutes: Number(e.target.value) })}
              className="bg-surface border-border hover:border-primary/50 focus:border-primary focus:ring-primary/35 text-foreground placeholder:text-muted h-[38px] w-full rounded-xl border px-3.5 font-mono text-[13px] transition-all focus:ring-2 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Global: Review Textbox */}
      <div>
        <label className="text-muted mb-1 block text-[11px] font-medium tracking-wider uppercase">
          Review / Critique
        </label>
        <textarea
          rows={4}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write thoughts here..."
          className="bg-surface border-border hover:border-primary/50 focus:border-primary focus:ring-primary/35 text-foreground placeholder:text-muted w-full resize-none rounded-xl border px-3.5 py-2.5 text-[13px] transition-all focus:ring-2 focus:outline-none"
        />
      </div>

      {/* Conditional Footer Button for Notes */}
      {hasUnsavedNotes && (
        <div className="border-border animate-fade-in flex justify-end gap-3 border-t pt-3">
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={isSavingNotes}
            className="bg-primary hover:bg-primary-hover text-primary-fg shadow-primary/30 w-full cursor-pointer rounded-xl px-5 py-2.5 text-xs font-semibold shadow-md transition-colors disabled:opacity-50 sm:w-auto"
          >
            {isSavingNotes ? "Saving..." : "Save Notes"}
          </button>
        </div>
      )}
    </div>
  )
}
