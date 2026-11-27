/**
 * Tabbed Dashboard component for organizing and filtering media items.
 *
 * @packageDocumentation
 */
"use client"

import { useState, useMemo } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import type { MediaItem, MediaType } from "@/lib/supabase/database.types"
import { MediaGrid } from "./MediaGrid"
import { FormControl, Select, MenuItem } from "@mui/material"
import { PageHeader } from "@/components/layout/PageHeader"
import SyncIcon from "@mui/icons-material/Sync"
import SearchIcon from "@mui/icons-material/Search"
import CloseIcon from "@mui/icons-material/Close"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { syncAllSeriesAction, syncAllMoviesAction } from "@/lib/actions/mediaActions"
import { parseCreators } from "@/lib/utils/formatters"
import { usePersistedSort } from "@/lib/utils/usePersistedSort"
import { toast } from "sonner"
import { VaultTooltip } from "@/components/ui/VaultTooltip"
import { MediaCardSkeleton, Skeleton } from "@/components/ui/Skeleton"

/**
 * Props interface for TabbedDashboard.
 */
export interface TabbedDashboardProps {
  type: MediaType
  items: MediaItem[]
  title?: string
  accent?: string
  description?: string
}

export interface TabbedDashboardLoadingProps {
  type: MediaType
  title?: string
  accent?: string
  description?: string
}

const SORT_OPTIONS = ["date_added", "title", "release_year", "user_rating"] as const
type SortOption = (typeof SORT_OPTIONS)[number]
type CreatorField = "author" | "director"
type FacetOption = { name: string; count: number }

type TabConfig = {
  id: string
  label: string
  filterFn: (item: MediaItem) => boolean
}

const TABS_BY_TYPE: Record<MediaType, TabConfig[]> = {
  series: [
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
      filterFn: (item) => item.status === "dropped" || item.status === "on_hold",
    },
  ],
  movie: [
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
      filterFn: (item) => item.status === "dropped" || item.status === "on_hold",
    },
  ],
  book: [
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
      filterFn: (item) => item.status === "dropped" || item.status === "on_hold",
    },
  ],
  recipe: [
    { id: "want_to_cook", label: "To Cook", filterFn: (item) => item.status === "want_to_cook" },
    { id: "cooked", label: "Cooked", filterFn: (item) => item.status === "cooked" },
  ],
}

const CREATOR_FILTER_CONFIG: Partial<
  Record<MediaType, { field: CreatorField; label: string; plural: string }>
> = {
  book: { field: "author", label: "Author", plural: "authors" },
  movie: { field: "director", label: "Director", plural: "directors" },
}

const SYNC_CONFIG: Partial<
  Record<
    MediaType,
    {
      label: string
      pendingLabel: string
      tooltip: string
      action: (forceAll: boolean) => Promise<{ success: boolean; message: string }>
    }
  >
> = {
  series: {
    label: "Sync Series",
    pendingLabel: "Syncing...",
    tooltip: "Auto-update all series with TMDB seasons and episodes",
    action: syncAllSeriesAction,
  },
  movie: {
    label: "Update Movies",
    pendingLabel: "Updating...",
    tooltip: "Update all movies with TMDB metadata, directors, and posters",
    action: syncAllMoviesAction,
  },
}

function readCreatorParams(params: Pick<URLSearchParams, "getAll">, field: CreatorField): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of params.getAll(field)) {
    const name = raw.trim()
    const key = name.toLowerCase()
    if (name && !seen.has(key)) {
      seen.add(key)
      result.push(name)
    }
  }
  return result
}

function collectFacetCounts(
  items: MediaItem[],
  getValues: (item: MediaItem) => string[],
  preserveSelected: string[] = []
): FacetOption[] {
  const map = new Map<string, FacetOption>()
  for (const item of items) {
    const itemSeen = new Set<string>()
    for (const raw of getValues(item)) {
      const name = raw.trim()
      const key = name.toLowerCase()
      if (!name || itemSeen.has(key)) continue
      itemSeen.add(key)
      const existing = map.get(key)
      if (existing) existing.count++
      else map.set(key, { name, count: 1 })
    }
  }
  for (const selected of preserveSelected) {
    const key = selected.toLowerCase()
    if (!map.has(key)) map.set(key, { name: selected, count: 0 })
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export function TabbedDashboardLoading({
  type,
  title,
  accent,
  description,
}: TabbedDashboardLoadingProps) {
  const tabs = TABS_BY_TYPE[type]
  const hasCreatorFilter = Boolean(CREATOR_FILTER_CONFIG[type])
  const hasSyncButton = Boolean(SYNC_CONFIG[type])

  const tabsSkeleton = (
    <div className="bg-surface border-border custom-scrollbar flex w-full max-w-full min-w-0 flex-nowrap items-center gap-1 overflow-x-auto rounded-xl border p-1 lg:w-auto">
      {tabs.map((tab) => (
        <Skeleton
          key={tab.id}
          className={`h-8 shrink-0 ${tab.label.length > 10 ? "w-28" : "w-20"}`}
        />
      ))}
      <div className="bg-border mx-0.5 h-4 w-px shrink-0" />
      <Skeleton className="h-8 w-18 shrink-0" />
      {hasCreatorFilter && <Skeleton className="h-8 w-22 shrink-0" />}
      <div className="bg-border mx-0.5 h-4 w-px shrink-0" />
      <Skeleton className="h-8 w-32 shrink-0" />
      {hasSyncButton && <Skeleton className="h-8 w-28 shrink-0" />}
    </div>
  )

  return (
    <div className="w-full" aria-label={`Loading ${type} gallery`}>
      {title ? (
        <PageHeader title={title} accent={accent} description={description}>
          {tabsSkeleton}
        </PageHeader>
      ) : (
        <div className="mb-6 w-full max-w-full min-w-0">{tabsSkeleton}</div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * Tabbed interface for filtering media lists by status, tags/genres, and author/director.
 */
export function TabbedDashboard({ type, items, title, accent, description }: TabbedDashboardProps) {
  const activeTabs = TABS_BY_TYPE[type]
  const creatorConfig = CREATOR_FILTER_CONFIG[type]
  const syncConfig = SYNC_CONFIG[type]

  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [sortBy, setSortBy] = usePersistedSort(`vault-sort-${type}`, "date_added", SORT_OPTIONS)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [openFilter, setOpenFilter] = useState<"tags" | "creator" | null>(null)
  const [filterQuery, setFilterQuery] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)

  const selectedCreators = useMemo(
    () => (creatorConfig ? readCreatorParams(searchParams, creatorConfig.field) : []),
    [searchParams, creatorConfig]
  )

  const selectedTagKeys = useMemo(
    () => new Set(selectedTags.map((t) => t.toLowerCase())),
    [selectedTags]
  )

  const selectedCreatorKeys = useMemo(
    () => new Set(selectedCreators.map((c) => c.toLowerCase())),
    [selectedCreators]
  )

  const activeTabId = useMemo(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam && activeTabs.some((t) => t.id === tabParam)) return tabParam

    if (creatorConfig && selectedCreatorKeys.size > 0) {
      const matchingTab = activeTabs.find((tab) =>
        items.some(
          (item) =>
            tab.filterFn(item) &&
            parseCreators(item[creatorConfig.field]).some((c) =>
              selectedCreatorKeys.has(c.toLowerCase())
            )
        )
      )
      if (matchingTab) return matchingTab.id
    }

    return activeTabs[0]?.id ?? ""
  }, [searchParams, activeTabs, creatorConfig, selectedCreatorKeys, items])

  const syncUrl = (nextTabId: string, nextCreators: string[]) => {
    const params = new URLSearchParams(window.location.search)
    params.set("tab", nextTabId)
    if (creatorConfig) {
      params.delete(creatorConfig.field)
      nextCreators.forEach((c) => params.append(creatorConfig.field, c))
    }
    const query = params.toString()
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname)
  }

  const handleTabChange = (tabId: string) => {
    setSelectedTags([])
    setFilterQuery("")
    syncUrl(tabId, selectedCreators)
    window.scrollTo({ top: 0, behavior: "auto" })
  }

  const toggleTag = (tag: string) => {
    const key = tag.toLowerCase()
    setSelectedTags((prev) =>
      prev.some((t) => t.toLowerCase() === key)
        ? prev.filter((t) => t.toLowerCase() !== key)
        : [...prev, tag]
    )
  }

  const toggleCreator = (name: string) => {
    const key = name.toLowerCase()
    const next = selectedCreatorKeys.has(key)
      ? selectedCreators.filter((c) => c.toLowerCase() !== key)
      : [...selectedCreators, name]
    syncUrl(activeTabId, next)
  }

  const clearCreators = () => {
    setFilterQuery("")
    syncUrl(activeTabId, [])
  }

  const clearAllFilters = () => {
    setSelectedTags([])
    setFilterQuery("")
    syncUrl(activeTabId, [])
  }

  const handleSync = async () => {
    if (!syncConfig) return
    setIsSyncing(true)
    try {
      const res = await syncConfig.action(true)
      if (res.success) {
        toast.success(res.message)
      } else {
        toast.error(res.message || `Failed to ${syncConfig.label.toLowerCase()}`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      toast.error(`Failed to ${syncConfig.label.toLowerCase()}: ${msg}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const activeTab = activeTabs.find((t) => t.id === activeTabId) || activeTabs[0]

  const tabItems = useMemo(() => items.filter(activeTab.filterFn), [items, activeTab])

  const availableTags = useMemo(
    () => collectFacetCounts(tabItems, (item) => [...(item.tags || []), ...(item.genres || [])]),
    [tabItems]
  )

  const availableCreators = useMemo(
    () =>
      creatorConfig
        ? collectFacetCounts(
            tabItems,
            (item) => parseCreators(item[creatorConfig.field]),
            selectedCreators
          )
        : [],
    [tabItems, creatorConfig, selectedCreators]
  )

  const filteredItems = useMemo(() => {
    let result = tabItems

    if (selectedTags.length > 0) {
      result = result.filter((item) => {
        const itemTagKeys = new Set(
          [...(item.tags || []), ...(item.genres || [])]
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        )
        return selectedTags.every((t) => itemTagKeys.has(t.toLowerCase()))
      })
    }

    if (creatorConfig && selectedCreatorKeys.size > 0) {
      result = result.filter((item) =>
        parseCreators(item[creatorConfig.field]).some((c) =>
          selectedCreatorKeys.has(c.toLowerCase())
        )
      )
    }

    return [...result].sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title)
      if (sortBy === "release_year") return (b.release_year || 0) - (a.release_year || 0)
      if (sortBy === "user_rating") return (b.user_rating || 0) - (a.user_rating || 0)
      return new Date(b.date_added).getTime() - new Date(a.date_added).getTime()
    })
  }, [tabItems, selectedTags, creatorConfig, selectedCreatorKeys, sortBy])

  const showTagsFilter = availableTags.length > 0 || selectedTags.length > 0
  const showCreatorFilter =
    Boolean(creatorConfig) && (availableCreators.length > 0 || selectedCreators.length > 0)

  const activeTray =
    openFilter === "tags" && showTagsFilter
      ? {
          label: "tag",
          plural: "tags",
          options: availableTags,
          selectedKeys: selectedTagKeys,
          onToggle: toggleTag,
          onClear: () => {
            setFilterQuery("")
            setSelectedTags([])
          },
        }
      : openFilter === "creator" && showCreatorFilter && creatorConfig
        ? {
            label: creatorConfig.label.toLowerCase(),
            plural: creatorConfig.plural,
            options: availableCreators,
            selectedKeys: selectedCreatorKeys,
            onToggle: toggleCreator,
            onClear: clearCreators,
          }
        : null

  const normalizedQuery = filterQuery.trim().toLowerCase()
  const visibleTrayOptions = activeTray
    ? normalizedQuery
      ? activeTray.options.filter((o) => o.name.toLowerCase().includes(normalizedQuery))
      : activeTray.options
    : []

  const filterToggles = [
    ...(showTagsFilter
      ? [
          {
            id: "tags" as const,
            label: "Tags",
            count: selectedTags.length,
            tooltip: "Filter by tags or genres",
          },
        ]
      : []),
    ...(showCreatorFilter && creatorConfig
      ? [
          {
            id: "creator" as const,
            label: creatorConfig.label,
            count: selectedCreators.length,
            tooltip: `Filter by ${creatorConfig.label.toLowerCase()}`,
          },
        ]
      : []),
  ]

  const activeChips = [
    ...selectedTags.map((tag) => ({
      key: `tag-${tag}`,
      label: `Tag: ${tag}`,
      onRemove: () => toggleTag(tag),
    })),
    ...(creatorConfig
      ? selectedCreators.map((creator) => ({
          key: `creator-${creator}`,
          label: `${creatorConfig.label}: ${creator}`,
          onRemove: () => toggleCreator(creator),
        }))
      : []),
  ]

  const hasActiveFilters = activeChips.length > 0

  const emptyParts: string[] = []
  if (selectedTags.length > 0) emptyParts.push("selected tags")
  if (creatorConfig && selectedCreators.length > 0) {
    emptyParts.push(`${creatorConfig.label.toLowerCase()} (${selectedCreators.join(", ")})`)
  }

  const pillClass = (isSelected: boolean) =>
    `inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
      isSelected
        ? "bg-primary/20 text-primary border-primary/40 font-semibold shadow-2xs"
        : "bg-surface text-muted border-border hover:border-primary hover:text-foreground"
    }`

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

      {/* Collapsible Filter Toggles (Tags, Author / Director) */}
      {filterToggles.length > 0 && (
        <>
          {filterToggles.map((toggle) => {
            const isOpen = openFilter === toggle.id
            const isHighlighted = toggle.count > 0 || isOpen
            return (
              <VaultTooltip key={toggle.id} label={toggle.tooltip} placement="bottom">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => {
                    setFilterQuery("")
                    setOpenFilter((prev) => (prev === toggle.id ? null : toggle.id))
                  }}
                  className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                    isHighlighted
                      ? "bg-primary/15 text-primary border-primary/35 border font-semibold shadow-xs"
                      : "text-muted hover:text-foreground hover:bg-surface-elevated border border-transparent"
                  }`}
                >
                  <span>{toggle.label}</span>
                  {toggle.count > 0 && (
                    <span className="bg-primary/25 text-primary flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
                      {toggle.count}
                    </span>
                  )}
                  <KeyboardArrowDownIcon
                    sx={{ fontSize: 15 }}
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </VaultTooltip>
            )
          })}
          <div className="bg-border mx-0.5 h-4 w-px shrink-0" />
        </>
      )}

      {/* Sorting Dropdown */}
      <FormControl size="small" className="shrink-0">
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
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

      {syncConfig && (
        <VaultTooltip label={syncConfig.tooltip} enabled={!isSyncing} placement="bottom">
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="border-border text-muted hover:text-foreground hover:bg-surface-elevated/80 flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all disabled:opacity-50"
          >
            <SyncIcon
              sx={{ fontSize: 14 }}
              className={isSyncing ? "text-primary animate-spin" : "text-primary"}
            />
            <span className="hidden sm:inline">
              {isSyncing ? syncConfig.pendingLabel : syncConfig.label}
            </span>
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
      ) : (
        <div className="mb-6 w-full max-w-full min-w-0">{tabsControls}</div>
      )}

      {/* Expanded Searchable Filter Tray (Tags or Author / Director) */}
      {activeTray && (
        <div className="animate-fade-in border-border bg-surface/80 mb-6 flex flex-col gap-2.5 rounded-xl border p-3 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted font-mono text-[11px] font-semibold tracking-wider uppercase">
              Filter by {activeTray.label}:
            </span>

            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <div className="relative flex-1 sm:w-56 sm:flex-initial">
                <SearchIcon
                  sx={{ fontSize: 15 }}
                  className="text-muted pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && visibleTrayOptions.length === 1) {
                      e.preventDefault()
                      activeTray.onToggle(visibleTrayOptions[0].name)
                    } else if (e.key === "Escape") {
                      if (filterQuery) setFilterQuery("")
                      else setOpenFilter(null)
                    }
                  }}
                  placeholder={`Search ${activeTray.plural}...`}
                  aria-label={`Search ${activeTray.plural}`}
                  className="bg-background border-border text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/25 h-7 w-full rounded-lg border pr-7 pl-8 text-xs transition-colors focus:ring-2 focus:outline-none"
                />
                {filterQuery && (
                  <button
                    type="button"
                    onClick={() => setFilterQuery("")}
                    aria-label={`Clear ${activeTray.label} search`}
                    className="text-muted hover:text-foreground absolute top-1/2 right-1.5 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded transition-colors"
                  >
                    <CloseIcon sx={{ fontSize: 13 }} className="text-current" />
                  </button>
                )}
              </div>

              {activeTray.selectedKeys.size > 0 && (
                <button
                  type="button"
                  onClick={activeTray.onClear}
                  className="border-border bg-surface hover:bg-surface-elevated text-muted hover:border-primary/40 hover:text-foreground inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors"
                >
                  <CloseIcon sx={{ fontSize: 13 }} className="text-current" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {visibleTrayOptions.length > 0 ? (
            <div className="custom-scrollbar flex max-h-44 flex-wrap items-center gap-1.5 overflow-y-auto">
              {visibleTrayOptions.map(({ name, count }) => {
                const isSelected = activeTray.selectedKeys.has(name.toLowerCase())
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => activeTray.onToggle(name)}
                    className={pillClass(isSelected)}
                  >
                    <span>{name}</span>
                    <span
                      className={`font-mono text-[10px] ${isSelected ? "text-primary" : "text-muted/70"}`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-muted py-1 text-xs">
              No {activeTray.plural} matching &ldquo;{filterQuery}&rdquo;.
            </p>
          )}
        </div>
      )}

      {/* Active Filter Chips when Tray is Collapsed */}
      {openFilter === null && hasActiveFilters && (
        <div className="animate-fade-in mb-5 flex flex-wrap items-center gap-1.5">
          <span className="text-muted mr-1 font-mono text-[11px] font-semibold tracking-wider uppercase">
            Active:
          </span>
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="bg-primary/15 text-primary border-primary/35 hover:bg-primary/25 inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors"
            >
              <span>{chip.label}</span>
              <CloseIcon sx={{ fontSize: 12 }} className="text-current" aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="border-border bg-surface hover:bg-surface-elevated text-muted hover:border-primary/40 hover:text-foreground inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors"
          >
            <CloseIcon sx={{ fontSize: 12 }} className="text-current" aria-hidden="true" />
            <span>Clear all</span>
          </button>
        </div>
      )}

      {/* Media Grid */}
      <MediaGrid
        items={filteredItems}
        emptyMessage={`No items found in ${activeTab.label.toLowerCase()}${
          emptyParts.length > 0 ? ` matching ${emptyParts.join(" and ")}` : ""
        }.`}
      />
    </div>
  )
}
