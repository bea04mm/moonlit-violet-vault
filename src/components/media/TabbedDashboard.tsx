/**
 * Tabbed Dashboard component for organizing media items.
 *
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import type { MediaItem, MediaType } from "@/lib/supabase/database.types"
import { MediaGrid } from "./MediaGrid"
import { FormControl, Select, MenuItem } from "@mui/material"
import { PageHeader } from "@/components/layout/PageHeader"
import SyncIcon from "@mui/icons-material/Sync"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { syncAllSeriesAction, syncAllMoviesAction } from "@/lib/actions/mediaActions"
import { toast } from "sonner"
import { VaultTooltip } from "@/components/ui/VaultTooltip"

/**
 * Props interface for the TabbedDashboardProps.
 */
export interface TabbedDashboardProps {
  type: MediaType
  items: MediaItem[]
  title?: string
  accent?: string
  description?: string
  headerNode?: React.ReactNode
}

export interface TabbedDashboardLoadingProps {
  title?: string
  accent?: string
  description?: string
  headerNode?: React.ReactNode
  tabs: string[]
}

export function TabbedDashboardLoading({
  title,
  accent,
  description,
  headerNode,
  tabs,
}: TabbedDashboardLoadingProps) {
  const tabsSkeleton = (
    <div className="bg-surface border-border custom-scrollbar flex w-full max-w-full min-w-0 flex-nowrap items-center gap-1 overflow-x-auto rounded-xl border p-1 lg:w-auto">
      {tabs.map((tab) => (
        <div
          key={tab}
          className="h-8 w-24 shrink-0 animate-pulse rounded-lg border border-violet-500/20 bg-violet-950/40"
        />
      ))}
      <div className="bg-border mx-0.5 h-4 w-px shrink-0" />
      <div className="h-8 w-32 shrink-0 animate-pulse rounded-lg border border-violet-500/20 bg-violet-950/40" />
    </div>
  )

  if (title) {
    return (
      <PageHeader title={title} accent={accent} description={description}>
        {tabsSkeleton}
      </PageHeader>
    )
  }

  return (
    <div className="border-border mb-6 border-b pb-4">
      <div className="flex min-w-0 flex-col justify-between gap-4 lg:flex-row lg:items-end">
        {headerNode}
        <div className="flex w-full max-w-full min-w-0 items-center lg:w-auto">{tabsSkeleton}</div>
      </div>
    </div>
  )
}

/**
 * Configuration object for a dashboard filter tab.
 */
type TabConfig = {
  id: string
  label: string
  filterFn: (item: MediaItem) => boolean
}

/**
 * Tabbed interface for filtering media lists by status.
 */
export function TabbedDashboard({
  type,
  items,
  title,
  accent,
  description,
  headerNode,
}: TabbedDashboardProps) {
  /**
   * Array of tab configuration objects defining filters and labels for the media dashboard.
   */
  let tabs: TabConfig[] = []

  if (type === "series") {
    tabs = [
      { id: "watching", label: "Watching", filterFn: (item) => item.status === "watching" },
      {
        id: "want_to_watch",
        label: "Want to Watch",
        filterFn: (item) => item.status === "want_to_watch",
      },
      {
        id: "waiting",
        label: "Waiting",
        filterFn: (item) => item.status === "watched" && item.tmdb_status === "Returning Series",
      },
      {
        id: "ended",
        label: "Ended",
        filterFn: (item) => item.status === "watched" && item.tmdb_status !== "Returning Series",
      },
      {
        id: "other",
        label: "Other",
        filterFn: (item) => ["dropped", "on_hold"].includes(item.status),
      },
    ]
  } else if (type === "movie") {
    tabs = [
      {
        id: "want_to_watch",
        label: "Want to Watch",
        filterFn: (item) => item.status === "want_to_watch",
      },
      { id: "watching", label: "Watching", filterFn: (item) => item.status === "watching" },
      { id: "watched", label: "Watched", filterFn: (item) => item.status === "watched" },
      {
        id: "other",
        label: "Other",
        filterFn: (item) => ["dropped", "on_hold"].includes(item.status),
      },
    ]
  } else if (type === "book") {
    tabs = [
      { id: "reading", label: "Reading", filterFn: (item) => item.status === "reading" },
      {
        id: "want_to_read",
        label: "Want to Read",
        filterFn: (item) => item.status === "want_to_read",
      },
      { id: "read", label: "Read", filterFn: (item) => item.status === "read" },
      {
        id: "other",
        label: "Other",
        filterFn: (item) => ["dropped", "on_hold"].includes(item.status),
      },
    ]
  } else if (type === "recipe") {
    tabs = [
      { id: "want_to_cook", label: "To Cook", filterFn: (item) => item.status === "want_to_cook" },
      { id: "cooked", label: "Cooked", filterFn: (item) => item.status === "cooked" },
    ]
  }

  // Filter out tabs that have 0 items (except the first two to keep UI consistent)
  const activeTabs = tabs
  /**
   * Next.js hook for accessing the current URL search parameters.
   */
  const searchParams = useSearchParams()
  /**
   * Current URL pathname used to determine the active route or media type context.
   */
  const pathname = usePathname()

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    /**
     * The currently selected tab ID extracted from the URL query string.
     */
    const tabParam = searchParams.get("tab")
    /**
     * The fallback tab ID to use if no valid tab is specified in the URL.
     */
    return activeTabs.some((t) => t.id === tabParam) ? (tabParam as string) : activeTabs[0]?.id
  })

  const [sortBy, setSortBy] = useState<"date_added" | "title" | "release_year" | "user_rating">(
    "date_added"
  )
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isTagsOpen, setIsTagsOpen] = useState(false)

  useEffect(() => {
    const handlePopState = () => {
      const currentTab = new URLSearchParams(window.location.search).get("tab")
      if (currentTab && activeTabs.some((t) => t.id === currentTab)) {
        setActiveTabId(currentTab)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [activeTabs])

  /**
   * Changes the active tab, updates the URL without a route transition, and returns to the page top.
   */
  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId)
    setSelectedTags([])
    /**
     * Mutable URLSearchParams instance used to construct the updated URL query string.
     */
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    window.history.replaceState(window.history.state, "", `${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: "auto" })
  }

  const [isSyncing, setIsSyncing] = useState(false)

  const handleSyncSeries = async () => {
    setIsSyncing(true)
    try {
      const res = await syncAllSeriesAction(true)
      if (res.success) {
        toast.success(res.message)
      } else {
        toast.error(res.message || "Failed to update series")
      }
    } catch (err: any) {
      toast.error("Failed to update series: " + (err?.message || "Unknown error"))
    } finally {
      setIsSyncing(false)
    }
  }

  /**
   * Triggers a batch metadata update across all movies in the vault via TMDB API.
   */
  const handleSyncMovies = async () => {
    setIsSyncing(true)
    try {
      const res = await syncAllMoviesAction(true)
      if (res.success) {
        toast.success(res.message)
      } else {
        toast.error(res.message || "Failed to update movies")
      }
    } catch (err: any) {
      toast.error("Failed to update movies: " + (err?.message || "Unknown error"))
    } finally {
      setIsSyncing(false)
    }
  }

  /**
   * The currently active tab configuration object based on state or URL.
   */
  const activeTab = activeTabs.find((t) => t.id === activeTabId) || activeTabs[0]

  /**
   * Memoized array of media items filtered by the active tab and selected tags, and sorted by user preference.
   */
  const filteredItems = useMemo(() => {
    /**
     * Intermediate array holding the filtered media items before applying tags and sorting.
     */
    let result = items.filter(activeTab.filterFn)

    if (selectedTags.length > 0) {
      result = result.filter((item) => {
        const itemTags = [...(item.tags || []), ...(item.genres || [])]
        return selectedTags.every((t) => itemTags.includes(t))
      })
    }

    return result.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title)
      if (sortBy === "release_year") return (b.release_year || 0) - (a.release_year || 0)
      if (sortBy === "user_rating") return (b.user_rating || 0) - (a.user_rating || 0)
      return new Date(b.date_added).getTime() - new Date(a.date_added).getTime()
    })
  }, [items, activeTab, selectedTags, sortBy])

  /**
   * Aggregates all unique user tags and TMDB genres present in the currently filtered tab's items.
   */
  const availableTags = useMemo(() => {
    const set = new Set<string>()
    items.filter(activeTab.filterFn).forEach((item) => {
      item.tags?.forEach((t) => t && set.add(t))
      item.genres?.forEach((g) => g && set.add(g))
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items, activeTab])

  const tabsControls = (
    <div className="bg-surface border-border custom-scrollbar flex w-full max-w-full min-w-0 flex-nowrap items-center gap-1 overflow-x-auto rounded-xl border p-1 lg:w-auto">
      {/* Tab Navigation */}
      {activeTabs.map((tab) => {
        const count = items.filter(tab.filterFn).length
        const isActive = activeTabId === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all sm:px-3 ${
              isActive
                ? "bg-primary/15 text-primary border-primary/35 border font-semibold shadow-xs"
                : "text-muted hover:text-foreground hover:bg-surface-elevated border border-transparent"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`py-0.2 rounded px-1.5 font-mono text-[10px] ${isActive ? "bg-primary/25 text-primary font-semibold" : "bg-primary/10 text-primary/80 border-primary/20 border"}`}
            >
              {count}
            </span>
          </button>
        )
      })}

      <div className="bg-border mx-0.5 h-4 w-px shrink-0" />

      {/* Tags Filter Toggle */}
      {availableTags.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setIsTagsOpen((prev) => !prev)}
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
              selectedTags.length > 0 || isTagsOpen
                ? "bg-primary/15 text-primary border-primary/35 border font-semibold shadow-xs"
                : "text-muted hover:text-foreground hover:bg-surface-elevated border border-transparent"
            }`}
          >
            <span>Tags</span>
            {selectedTags.length > 0 && (
              <span className="bg-primary/25 text-primary flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
                {selectedTags.length}
              </span>
            )}
            <KeyboardArrowDownIcon
              sx={{ fontSize: 15 }}
              className={`transition-transform duration-200 ${isTagsOpen ? "rotate-180" : ""}`}
            />
          </button>
          <div className="bg-border mx-0.5 h-4 w-px shrink-0" />
        </>
      )}

      {/* Sorting Dropdown */}
      <FormControl size="small" className="shrink-0">
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          displayEmpty
          sx={{
            height: 32,
            fontSize: "0.75rem",
            fontWeight: 500,
            borderRadius: "0.5rem",
            bgcolor: "transparent",
            color: "var(--color-foreground)",
            "&:hover": {
              color: "var(--color-primary)",
              bgcolor: "var(--color-surface-elevated)",
            },
            "&.Mui-focused": {
              color: "var(--color-primary)",
              bgcolor: "var(--color-surface-elevated)",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& .MuiSelect-select": {
              py: "6px",
              pl: 1.5,
              pr: "28px !important",
              display: "flex",
              alignItems: "center",
            },
            "& .MuiSvgIcon-root": {
              color: "var(--color-primary)",
              fontSize: "1.1rem",
              right: "6px",
            },
          }}
        >
          <MenuItem value="date_added">Recently Added</MenuItem>
          <MenuItem value="title">Title (A-Z)</MenuItem>
          <MenuItem value="release_year">Release Year (Newest)</MenuItem>
          <MenuItem value="user_rating">Rating (Highest)</MenuItem>
        </Select>
      </FormControl>

      {type === "series" && (
        <VaultTooltip
          label="Auto-update all series with TMDB seasons and episodes"
          enabled={!isSyncing}
          placement="bottom"
        >
          <button
            type="button"
            onClick={handleSyncSeries}
            disabled={isSyncing}
            className="border-border text-muted hover:text-foreground hover:bg-surface-elevated/80 flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all disabled:opacity-50"
          >
            <SyncIcon
              sx={{ fontSize: 14 }}
              className={isSyncing ? "text-primary animate-spin" : "text-primary"}
            />
            <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync Series"}</span>
          </button>
        </VaultTooltip>
      )}

      {type === "movie" && (
        <VaultTooltip
          label="Update all movies with TMDB metadata, directors, and posters"
          enabled={!isSyncing}
          placement="bottom"
        >
          <button
            type="button"
            onClick={handleSyncMovies}
            disabled={isSyncing}
            className="border-border text-muted hover:text-foreground hover:bg-surface-elevated/80 flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all disabled:opacity-50"
          >
            <SyncIcon
              sx={{ fontSize: 14 }}
              className={isSyncing ? "text-primary animate-spin" : "text-primary"}
            />
            <span className="hidden sm:inline">{isSyncing ? "Updating..." : "Update Movies"}</span>
          </button>
        </VaultTooltip>
      )}
    </div>
  )

  return (
    <div className="w-full">
      {title ? (
        <PageHeader title={title} accent={accent} description={description}>
          {tabsControls}
        </PageHeader>
      ) : headerNode ? (
        <div className="border-border mb-6 border-b pb-4">
          <div className="flex min-w-0 flex-col justify-between gap-4 lg:flex-row lg:items-end">
            {headerNode}
            <div className="flex w-full max-w-full min-w-0 items-center lg:w-auto">
              {tabsControls}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 w-full max-w-full min-w-0">{tabsControls}</div>
      )}

      {/* Expanded Tag Filters Tray */}
      {availableTags.length > 0 && isTagsOpen && (
        <div className="animate-fade-in border-border bg-surface/80 mb-6 flex flex-wrap items-center gap-1.5 rounded-xl border p-2.5 shadow-2xs">
          <span className="text-muted mr-1 font-mono text-[11px] font-semibold tracking-wider uppercase">
            Filter by tag:
          </span>
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() =>
                  setSelectedTags((prev) =>
                    isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                  )
                }
                className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-primary/20 text-primary border-primary/40 font-semibold shadow-2xs"
                    : "bg-surface text-muted border-border hover:border-primary hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            )
          })}
          {selectedTags.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedTags([])}
              className="text-muted hover:text-foreground ml-auto cursor-pointer text-xs underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Media Grid */}
      <MediaGrid
        items={filteredItems}
        emptyMessage={`No items found in ${activeTab.label.toLowerCase()}${
          selectedTags.length > 0 ? " with selected tags" : ""
        }.`}
      />
    </div>
  )
}
