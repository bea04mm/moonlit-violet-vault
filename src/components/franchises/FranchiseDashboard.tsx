/**
 * Editorial Master Franchise Viewing Archives for the Moonlit Violet Vault.
 * Connected directly to the Vault database: movies appear in Movies (/movies) and series
 * appear in Series (/series), with Gemini AI slate assistant, live sync, and markdown export.
 *
 * @packageDocumentation
 */
"use client"

import { useState, useMemo, useTransition, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FranchiseItem, parseChecklistMarkdown } from "@/data/franchises/franchiseData"
import {
  FranchiseVaultItem,
  populateFranchiseToVaultAction,
  enrichAllFranchiseItemsAction,
  toggleVaultItemWatchedAction,
  addAiProjectToVaultAction,
  syncFranchiseWithAI,
  getFranchiseItemsWithVault,
  AiFranchiseSyncResult,
  searchTmdbForLinking,
  manuallyConnectFranchiseTmdbAction,
  disconnectFranchiseTmdbAction,
  deleteCustomFranchiseAction,
  saveFranchiseItemAction,
  deleteFranchiseItemAction,
  TmdbSearchResultItem,
  FranchiseSummary,
} from "@/lib/actions/franchiseAiActions"
import { FranchiseItemEditorModal } from "@/components/franchises/FranchiseItemEditorModal"
import type { MediaType } from "@/lib/supabase/database.types"
import { toast } from "sonner"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import SearchIcon from "@mui/icons-material/Search"
import TvIcon from "@mui/icons-material/Tv"
import MovieIcon from "@mui/icons-material/Movie"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import CloseIcon from "@mui/icons-material/Close"
import CheckIcon from "@mui/icons-material/Check"
import DownloadIcon from "@mui/icons-material/Download"
import LinkIcon from "@mui/icons-material/Link"
import LinkOffIcon from "@mui/icons-material/LinkOff"
import SortIcon from "@mui/icons-material/Sort"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { PageHeader } from "@/components/layout/PageHeader"
import { VaultTooltip } from "@/components/ui/VaultTooltip"

/**
 * Component props for {@link FranchiseDashboard}.
 */
interface FranchiseDashboardProps {
  /** Optional pre-loaded list of franchise summaries */
  initialFranchises?: FranchiseSummary[]
  /** Initial checklist items mapped by franchise ID */
  initialData: Record<string, FranchiseVaultItem[]>
  /** Pre-calculated vault possession counts mapped by franchise ID */
  initialInVaultCounts: Record<string, number>
  /** Initial selected universe identifier */
  initialUniverse?: string
}

/**
 * Formats a runtime in minutes into a clean human-readable duration (e.g. "2h 15m").
 *
 * @param minutes - Total minutes
 * @returns Formatted duration string or "N/A"
 */
function formatRuntime(minutes: number): string {
  if (!minutes) return "N/A"
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs === 0) return `${mins}m`
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

/**
 * Converts any release date string and year into a deterministic millisecond timestamp.
 * Guaranteed to return a valid numeric timestamp (never NaN) for strict, transitive sorting
 * that prevents server/client hydration mismatches.
 */
function parseReleaseDateTimestamp(releaseDate: string, year: number): number {
  if (!releaseDate || releaseDate.toLowerCase().includes("development")) {
    return new Date(year || 2099, 11, 31).getTime()
  }

  const lower = releaseDate.toLowerCase()
  if (lower.startsWith("early")) {
    return new Date(year || 2026, 2, 1).getTime()
  }
  if (lower.startsWith("mid") || lower.startsWith("summer")) {
    return new Date(year || 2026, 6, 1).getTime()
  }
  if (lower.startsWith("late") || lower.startsWith("fall")) {
    return new Date(year || 2026, 10, 1).getTime()
  }

  // Extract start date part before range separators (en-dash, em-dash, slash, plus)
  const startPart = releaseDate.split(/[–—\/\+]/)[0].trim()

  // 1. Direct standard date parse
  let parsed = Date.parse(startPart)
  if (!isNaN(parsed)) return parsed

  // 2. Normalize abbreviated/full month names
  const cleanMonth = startPart
    .replace(/^Sept\b/i, "Sep")
    .replace(/^March\b/i, "Mar")
    .replace(/^April\b/i, "Apr")
    .replace(/^June\b/i, "Jun")
    .replace(/^July\b/i, "Jul")

  parsed = Date.parse(cleanMonth)
  if (!isNaN(parsed)) return parsed

  // 3. Prefix day if format is e.g. "Jun 2018"
  parsed = Date.parse(`1 ${cleanMonth}`)
  if (!isNaN(parsed)) return parsed

  // 4. Year only format e.g. "2019"
  const yearMatch = startPart.match(/^\d{4}$/)
  if (yearMatch) {
    return new Date(parseInt(yearMatch[0], 10), 0, 1).getTime()
  }

  // 5. Deterministic mid-year fallback
  return new Date(year || 2026, 5, 15).getTime()
}

export function FranchiseDashboard({
  initialFranchises,
  initialData,
  initialInVaultCounts,
  initialUniverse,
}: FranchiseDashboardProps) {
  const router = useRouter()
  const [franchises, setFranchises] = useState<FranchiseSummary[]>(() => {
    if (initialFranchises && initialFranchises.length > 0) {
      const map = new Map<string, FranchiseSummary>()
      initialFranchises.forEach((f) => map.set(f.id, f))
      return Array.from(map.values())
    }
    return [
      {
        id: "marvel",
        name: "Marvel Cinematic Universe & Multiverse",
        shortName: "Marvel",
        tagline: "From Iron Man to the Multiverse Saga, SSU, Fox X-Men and classic animation.",
        accentColor: "#8B6CE8",
      },
      {
        id: "dc",
        name: "DC Universe & Multiverse Chronicles",
        shortName: "DC",
        tagline: "From James Gunn's DCU to Elseworlds, DCEU, Arrowverse and DCAU classics.",
        accentColor: "#7579E7",
      },
    ]
  })
  const [universe, setUniverse] = useState<string>(initialUniverse || "marvel")
  const [items, setItems] = useState<Record<string, FranchiseVaultItem[]>>(initialData)
  const [inVaultCounts, setInVaultCounts] = useState<Record<string, number>>(initialInVaultCounts)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "watched" | "unwatched" | "upcoming">(
    "all"
  )
  const [selectedEra, setSelectedEra] = useState<string>("all")
  const [isErasOpen, setIsErasOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"year-asc" | "year-desc" | "catalog">("year-asc")
  const [linkingItem, setLinkingItem] = useState<FranchiseVaultItem | null>(null)
  const [isAddTitleOpen, setIsAddTitleOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FranchiseVaultItem | null>(null)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiResult, setAiResult] = useState<AiFranchiseSyncResult | null>(null)
  const [customMarkdown, setCustomMarkdown] = useState("")
  const [aiTab, setAiTab] = useState<"ai" | "markdown">("ai")
  const [isPending, startTransition] = useTransition()

  const currentFranchise = franchises.find((f) => f.id === universe) ||
    franchises[0] || {
      id: universe,
      name: universe,
      shortName: universe,
      tagline: "",
      accentColor: "#8B6CE8",
      isCustom: false,
    }
  const currentList = items[universe] || []
  const currentInVaultCount = inVaultCounts[universe] || 0
  const isMarvel = universe === "marvel"
  const brandColor = currentFranchise?.accentColor || (isMarvel ? "#8B6CE8" : "#7579E7")

  // Handle custom franchise deletion
  const handleDeleteCustomFranchise = (id: string) => {
    if (!confirm(`Are you sure you want to delete the "${currentFranchise.shortName}" franchise?`))
      return

    startTransition(async () => {
      const res = await deleteCustomFranchiseAction(id)
      if (res.success) {
        toast.success(res.message)
        router.push("/franchises")
      } else {
        toast.error(res.message)
      }
    })
  }

  // Save (add or edit) a title in the current checklist
  const handleSaveTitle = async (saved: Partial<FranchiseItem>) => {
    const res = await saveFranchiseItemAction({
      universe,
      item: {
        id: saved.id,
        title: saved.title || "Untitled",
        releaseDate: saved.releaseDate || "2026",
        year: saved.year || 2026,
        type: saved.type || "Film",
        era: saved.era || "Mainline Canon",
        runtime: saved.runtime || 120,
        watched: saved.watched ?? false,
      },
    })

    if (res.success && res.savedItem) {
      toast.success(res.message)
      const refreshed = await getFranchiseItemsWithVault(universe)
      setItems((prev) => ({ ...prev, [universe]: refreshed.items }))
      setInVaultCounts((prev) => ({ ...prev, [universe]: refreshed.inVaultCount }))
    } else {
      toast.error(res.message || "Failed to save title.")
    }
  }

  // Delete an individual title from the current checklist
  const handleDeleteTitle = (item: FranchiseVaultItem) => {
    if (!confirm(`Are you sure you want to remove "${item.title}" from this checklist?`)) return

    startTransition(async () => {
      const res = await deleteFranchiseItemAction({
        universe,
        itemId: item.id,
      })

      if (res.success) {
        toast.success(res.message)
        const refreshed = await getFranchiseItemsWithVault(universe)
        setItems((prev) => ({ ...prev, [universe]: refreshed.items }))
        setInVaultCounts((prev) => ({ ...prev, [universe]: refreshed.inVaultCount }))
      } else {
        toast.error(res.message || "Failed to delete title.")
      }
    })
  }

  // Populate franchise titles into the Vault (movies into /movies, series into /series)
  const handlePopulateToVault = () => {
    startTransition(async () => {
      const res = await populateFranchiseToVaultAction(universe)
      if (res.success) {
        toast.success(res.message)
        // Refresh items with updated vault IDs
        const refreshed = await getFranchiseItemsWithVault(universe)
        setItems((prev) => ({ ...prev, [universe]: refreshed.items }))
        setInVaultCounts((prev) => ({ ...prev, [universe]: refreshed.inVaultCount }))
      } else {
        toast.error(res.message)
      }
    })
  }

  // Enrich franchise titles with real TMDB posters, metadata, and episode logs
  const handleEnrichTmdb = () => {
    startTransition(async () => {
      const res = await enrichAllFranchiseItemsAction(universe)
      if (res.success) {
        toast.success(res.message)
        const refreshed = await getFranchiseItemsWithVault(universe)
        setItems((prev) => ({ ...prev, [universe]: refreshed.items }))
        setInVaultCounts((prev) => ({ ...prev, [universe]: refreshed.inVaultCount }))
      } else {
        toast.error(res.message)
      }
    })
  }

  // Toggle watched status (updates the database item if in vault)
  const toggleItemWatched = (item: FranchiseVaultItem) => {
    const newWatched = !item.watched

    // Optimistic UI update
    setItems((prev) => {
      const updatedList = prev[universe].map((i) =>
        i.id === item.id ? { ...i, watched: newWatched } : i
      )
      return { ...prev, [universe]: updatedList }
    })

    if (item.inVault && item.vaultId) {
      startTransition(async () => {
        const res = await toggleVaultItemWatchedAction(
          item.vaultId!,
          newWatched,
          item.vaultType,
          item.seasonNumber
        )
        if (!res.success) {
          toast.error("Failed to update vault status")
          // Revert optimistic update
          setItems((prev) => {
            const reverted = prev[universe].map((i) =>
              i.id === item.id ? { ...i, watched: item.watched } : i
            )
            return { ...prev, [universe]: reverted }
          })
        }
      })
    }
  }

  // Reset watch progress
  const handleResetProgress = () => {
    if (confirm(`Reset all watch progress for ${universe.toUpperCase()} titles?`)) {
      setItems((prev) => {
        const updatedList = prev[universe].map((i) => ({ ...i, watched: false }))
        return { ...prev, [universe]: updatedList }
      })
      toast.success(`Reset ${universe.toUpperCase()} progress`)
    }
  }

  // AI Sync Worker Trigger
  const handleRunAiSync = () => {
    setIsAiModalOpen(true)
    startTransition(async () => {
      const titles = currentList.map((i) => i.title)
      const result = await syncFranchiseWithAI(universe, titles)
      setAiResult(result)
    })
  }

  // Add AI Discovered Titles directly to Vault & Checklist
  const handleApplyAiAdditions = () => {
    if (!aiResult?.newItems || aiResult.newItems.length === 0) return

    startTransition(async () => {
      let addedToVault = 0
      for (const newItem of aiResult.newItems) {
        const res = await addAiProjectToVaultAction({
          title: newItem.title,
          releaseDate: newItem.releaseDate,
          year: newItem.year,
          type: newItem.type,
          era: newItem.era,
          runtime: newItem.runtime || 120,
          universe,
        })
        if (res.success) addedToVault++
      }

      const refreshed = await getFranchiseItemsWithVault(universe)
      setItems((prev) => ({ ...prev, [universe]: refreshed.items }))
      setInVaultCounts((prev) => ({ ...prev, [universe]: refreshed.inVaultCount }))

      toast.success(
        `Added ${addedToVault} new projects directly to your Vault (Movies in /movies, Series in /series)!`
      )
      setIsAiModalOpen(false)
    })
  }

  // Apply AI Date Adjustments
  const handleApplyAiDateUpdates = () => {
    if (!aiResult?.dateUpdates || aiResult.dateUpdates.length === 0) return

    setItems((prev) => {
      const updatesMap = new Map(aiResult.dateUpdates.map((u) => [u.title.toLowerCase().trim(), u]))
      let count = 0

      const updated = prev[universe].map((item) => {
        const match = updatesMap.get(item.title.toLowerCase().trim())
        if (match) {
          count++
          return {
            ...item,
            releaseDate: match.newReleaseDate,
            year: match.newYear,
            isUpcoming: match.newYear >= 2026,
          }
        }
        return item
      })

      toast.success(`Updated release dates for ${count} titles!`)
      setIsAiModalOpen(false)
      return { ...prev, [universe]: updated }
    })
  }

  // Parse and apply custom Markdown checklist
  const handleApplyCustomMarkdown = () => {
    if (!customMarkdown.trim()) return
    const parsed = parseChecklistMarkdown(customMarkdown, universe)
    if (parsed.length === 0) {
      toast.error("Could not find any checklist items in the provided Markdown.")
      return
    }

    setItems((prev) => ({
      ...prev,
      [universe]: parsed.map((p) => ({
        ...p,
        inVault: false,
        vaultType: p.type.toLowerCase().includes("series") ? "series" : "movie",
      })),
    }))
    toast.success(`Loaded ${parsed.length} titles from custom Markdown checklist!`)
    setIsAiModalOpen(false)
  }

  // Stats Calculations
  const stats = useMemo(() => {
    const total = currentList.length
    const watchedItems = currentList.filter((i) => i.watched)
    const watchedCount = watchedItems.length
    const remaining = total - watchedCount
    const totalMinutes = watchedItems.reduce((acc, curr) => acc + (curr.runtime || 0), 0)
    const percent = total > 0 ? Math.round((watchedCount / total) * 100) : 0

    return { total, watchedCount, remaining, totalMinutes, percent }
  }, [currentList])

  // Era list for filter pills
  const availableEras = useMemo(() => {
    return ["all", ...Array.from(new Set(currentList.map((i) => i.era)))]
  }, [currentList])

  // Filtered and Sorted Items for Continuous Flat List
  const filteredItems = useMemo(() => {
    const currentYear = 2026

    const list = currentList.filter((item) => {
      const isItemUpcoming = item.isUpcoming || item.year >= currentYear

      if (statusFilter === "watched" && !item.watched) return false
      if (statusFilter === "unwatched" && (item.watched || isItemUpcoming)) return false
      if (statusFilter === "upcoming" && !isItemUpcoming) return false

      if (selectedEra !== "all" && item.era !== selectedEra) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const titleMatch = item.title.toLowerCase().includes(q)
        const eraMatch = item.era.toLowerCase().includes(q)
        const dateMatch = item.releaseDate.toLowerCase().includes(q)
        const typeMatch = item.type.toLowerCase().includes(q)
        return titleMatch || eraMatch || dateMatch || typeMatch
      }

      return true
    })

    if (sortBy === "year-asc") {
      return [...list].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        const tsA = parseReleaseDateTimestamp(a.releaseDate, a.year)
        const tsB = parseReleaseDateTimestamp(b.releaseDate, b.year)
        if (tsA !== tsB) return tsA - tsB
        return a.id.localeCompare(b.id)
      })
    } else if (sortBy === "year-desc") {
      return [...list].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        const tsA = parseReleaseDateTimestamp(a.releaseDate, a.year)
        const tsB = parseReleaseDateTimestamp(b.releaseDate, b.year)
        if (tsA !== tsB) return tsB - tsA
        return b.id.localeCompare(a.id)
      })
    }

    return list
  }, [currentList, statusFilter, selectedEra, searchQuery, sortBy])

  // Formatted Markdown Export Text
  const exportMarkdownText = useMemo(() => {
    let md = `# Comprehensive ${currentFranchise?.name || universe} Viewing Checklist\n`
    md += `*Exported from Moonlit Violet Vault on ${new Date().toISOString().split("T")[0]}*\n\n`
    md += `**Progress:** ${stats.watchedCount} / ${stats.total} titles completed (${stats.percent}%)\n\n`

    let currentEra = ""
    currentList.forEach((item) => {
      if (item.era !== currentEra) {
        currentEra = item.era
        md += `\n---\n\n## ${currentEra}\n\n`
      }
      const check = item.watched ? "[x]" : "[ ]"
      md += `- ${check} **${item.title}** *(${item.type} | ${item.releaseDate})*\n`
    })

    return md
  }, [universe, currentList, stats, currentFranchise])

  const copyMarkdown = () => {
    navigator.clipboard.writeText(exportMarkdownText)
    toast.success("Checklist copied to clipboard as Markdown!")
  }

  const allConnected = currentInVaultCount === currentList.length

  return (
    <div className="space-y-6 pb-16">
      {/* Back to Franchises Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/franchises"
          className="text-muted hover:text-foreground group border-border bg-surface/70 hover:bg-surface inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors"
        >
          <ArrowBackIcon
            sx={{ fontSize: 16 }}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          <span>All Franchises</span>
        </Link>

        {currentFranchise.isCustom && (
          <VaultTooltip label={`Delete ${currentFranchise.shortName} franchise`} placement="bottom">
            <button
              type="button"
              onClick={() => handleDeleteCustomFranchise(currentFranchise.id)}
              className="text-muted border-border/70 inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs transition-colors hover:border-red-500/30 hover:text-red-400"
            >
              <DeleteIcon sx={{ fontSize: 15 }} />
              <span>Delete Franchise</span>
            </button>
          </VaultTooltip>
        )}
      </div>

      {/* Standardized Header Section */}
      <PageHeader
        title={currentFranchise.name}
        accent={currentFranchise.shortName.toLowerCase()}
        description={
          currentFranchise.tagline ||
          `Master chronological viewing guide for ${currentFranchise.name}.`
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {/* Enrich via TMDB API */}
            <VaultTooltip
              label="Enrich titles with official TMDB posters, cast, runtimes, and episodes"
              enabled={!isPending}
              placement="bottom"
            >
              <button
                onClick={handleEnrichTmdb}
                disabled={isPending}
                className="border-border bg-surface-elevated/70 text-foreground hover:border-primary/40 flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all hover:bg-violet-500/10 active:scale-95 disabled:opacity-50"
              >
                <AutoAwesomeIcon sx={{ fontSize: 15 }} className="text-[#8B6CE8]" />
                <span>{isPending ? "Enriching..." : "Enrich via TMDB"}</span>
              </button>
            </VaultTooltip>

            {/* Populate to Vault */}
            {!allConnected && (
              <button
                onClick={handlePopulateToVault}
                disabled={isPending}
                className="bg-primary hover:bg-primary/90 text-primary-fg flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <CloudUploadIcon sx={{ fontSize: 15 }} />
                <span>{isPending ? "Connecting..." : `Populate to Vault`}</span>
              </button>
            )}

            {/* AI Sync Button */}
            <VaultTooltip
              label="Connect with Gemini AI worker to check for new releases and calendar changes"
              enabled={!isPending}
              placement="bottom"
            >
              <button
                onClick={handleRunAiSync}
                disabled={isPending}
                className="border-border bg-surface-elevated/70 text-foreground hover:border-primary/40 flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all hover:bg-violet-500/10 active:scale-95 disabled:opacity-50"
              >
                <AutoAwesomeIcon sx={{ fontSize: 15 }} className="text-[#8B6CE8]" />
                <span>AI Slate Sync</span>
              </button>
            </VaultTooltip>

            {/* Export Markdown Button */}
            <VaultTooltip
              label="Export checklist to Markdown for Obsidian / VS Code"
              placement="bottom"
            >
              <button
                onClick={() => setIsExportOpen(true)}
                className="border-border text-muted hover:text-foreground hover:bg-surface-elevated flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors"
              >
                <DownloadIcon sx={{ fontSize: 15 }} />
                <span>Export MD</span>
              </button>
            </VaultTooltip>
          </div>
        }
      />

      {/* 4-Card Stats Dashboard */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {/* Card 1: Total Titles */}
        <div className="border-border bg-surface rounded-2xl border p-4 shadow-2xs">
          <div className="text-muted flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Total Titles</span>
            <MovieIcon sx={{ fontSize: 16, color: brandColor }} />
          </div>
          <div className="font-display text-foreground mt-1 text-2xl font-extrabold sm:text-3xl">
            {stats.total}
          </div>
          <div className="text-muted mt-1 text-[11px] font-medium">
            {currentInVaultCount} in Vault database
          </div>
        </div>

        {/* Card 2: Completed */}
        <div className="border-border bg-surface rounded-2xl border p-4 shadow-2xs">
          <div className="text-muted flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Completed</span>
            <CheckIcon sx={{ fontSize: 16, color: "#9B72CF" }} />
          </div>
          <div className="font-display mt-1 text-2xl font-extrabold text-[#9B72CF] sm:text-3xl">
            {stats.watchedCount}
          </div>
          <div className="text-muted mt-1 text-[11px] font-medium">{stats.remaining} remaining</div>
        </div>

        {/* Card 3: Watch Time */}
        <div className="border-border bg-surface rounded-2xl border p-4 shadow-2xs">
          <div className="text-muted flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Watch Time</span>
            <TvIcon sx={{ fontSize: 16, color: brandColor }} />
          </div>
          <div className="font-display text-foreground mt-1 text-xl font-bold sm:text-2xl">
            {formatRuntime(stats.totalMinutes)}
          </div>
          <div className="text-muted mt-1 text-[11px] font-medium">Logged viewing duration</div>
        </div>

        {/* Card 4: Completion % */}
        <div className="border-border bg-surface flex flex-col justify-between rounded-2xl border p-4 shadow-2xs">
          <div>
            <div className="text-muted flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
              <span>Completion</span>
              <span className="font-bold" style={{ color: brandColor }}>
                {stats.percent}%
              </span>
            </div>
            <div className="font-display text-foreground mt-1 text-2xl font-extrabold sm:text-3xl">
              {stats.percent}%
            </div>
          </div>
          <div className="bg-background border-border mt-3 h-2 w-full overflow-hidden rounded-full border">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${stats.percent}%`,
                background: isMarvel
                  ? "linear-gradient(90deg, #8B6CE8 0%, #9B72CF 100%)"
                  : "linear-gradient(90deg, #7579E7 0%, #9B72CF 100%)",
              }}
            />
          </div>
        </div>
      </section>

      {/* Controls & Filter Bar */}
      <section className="border-border bg-surface space-y-4 rounded-2xl border p-4 shadow-2xs">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="relative w-full sm:w-80">
            <SearchIcon
              sx={{ fontSize: 18 }}
              className="text-muted absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles, eras, release dates..."
              className="bg-background border-border text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/25 h-9 w-full rounded-xl border pr-4 pl-9 text-xs transition-all focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
            <div className="bg-background border-border flex items-center rounded-xl border p-1 text-xs font-semibold">
              {(["all", "watched", "unwatched", "upcoming"] as const).map((status) => {
                const isActive = statusFilter === status
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-lg px-2.5 py-1 text-xs capitalize transition-all ${
                      isActive
                        ? "bg-surface text-foreground border-border border font-bold shadow-2xs"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {status}
                  </button>
                )
              })}
            </div>

            <VaultTooltip label="Reset current checklist">
              <button
                onClick={handleResetProgress}
                className="text-muted flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors hover:text-rose-400"
              >
                <RestartAltIcon sx={{ fontSize: 16 }} />
                <span className="hidden md:inline">Reset</span>
              </button>
            </VaultTooltip>
          </div>
        </div>

        {/* Sort Order Selector & Add Title Action */}
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted flex items-center gap-1 font-mono text-[11px] font-semibold tracking-wider uppercase">
              <SortIcon sx={{ fontSize: 14 }} />
              Sort Order:
            </span>
            <div className="bg-background border-border flex items-center rounded-xl border p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSortBy("year-asc")}
                className={`rounded-lg px-2.5 py-1 text-xs transition-all ${
                  sortBy === "year-asc"
                    ? "bg-surface text-foreground border-border border font-bold shadow-2xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Year (Oldest &uarr;)
              </button>
              <button
                type="button"
                onClick={() => setSortBy("year-desc")}
                className={`rounded-lg px-2.5 py-1 text-xs transition-all ${
                  sortBy === "year-desc"
                    ? "bg-surface text-foreground border-border border font-bold shadow-2xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Year (Newest &darr;)
              </button>
              <button
                type="button"
                onClick={() => setSortBy("catalog")}
                className={`rounded-lg px-2.5 py-1 text-xs transition-all ${
                  sortBy === "catalog"
                    ? "bg-surface text-foreground border-border border font-bold shadow-2xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Checklist Order
              </button>
            </div>

            {/* Era Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsErasOpen((prev) => !prev)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedEra !== "all" || isErasOpen
                  ? "bg-surface text-foreground border-border font-bold shadow-2xs"
                  : "bg-background border-border text-muted hover:text-foreground hover:border-primary/40"
              }`}
            >
              <span className="font-mono text-[11px] tracking-wider uppercase">Era Filter</span>
              {selectedEra !== "all" && (
                <span
                  className="rounded-full px-2 py-0.5 font-mono text-[10px] font-bold"
                  style={{
                    backgroundColor: `${brandColor}26`,
                    color: brandColor,
                  }}
                >
                  {selectedEra.includes(" — ") ? selectedEra.split(" — ")[1] : selectedEra}
                </span>
              )}
              <KeyboardArrowDownIcon
                sx={{ fontSize: 16 }}
                className={`transition-transform duration-200 ${isErasOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* + Add Title Button */}
          <VaultTooltip label="Add a new film, series season, or milestone to this checklist">
            <button
              type="button"
              onClick={() => {
                setEditingItem(null)
                setIsAddTitleOpen(true)
              }}
              className="bg-primary hover:bg-primary/90 text-primary-fg ml-auto flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all active:scale-95 sm:ml-0"
            >
              <AddIcon sx={{ fontSize: 15 }} />
              <span>Add Title</span>
            </button>
          </VaultTooltip>
        </div>

        {/* Era Filter Drawer (revealed only when toggled open) */}
        {isErasOpen && (
          <div className="animate-fade-in border-border space-y-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-muted font-mono text-[11px] font-semibold tracking-wider uppercase">
                Filter Era / Sub-Universe
              </span>
              {selectedEra !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedEra("all")}
                  className="text-muted hover:text-foreground cursor-pointer text-[11px] transition-colors"
                >
                  Reset to All Eras
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {availableEras.map((era) => {
                const isSelected = selectedEra === era
                const label =
                  era === "all" ? "All Eras" : era.includes(" — ") ? era.split(" — ")[1] : era
                return (
                  <button
                    key={era}
                    onClick={() => setSelectedEra(era)}
                    title={era}
                    className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? "font-semibold text-white shadow-xs"
                        : "bg-background border-border text-muted hover:text-foreground"
                    }`}
                    style={
                      isSelected ? { backgroundColor: brandColor, borderColor: brandColor } : {}
                    }
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* Continuous Flat Checklist View */}
      <section className="border-border bg-surface overflow-hidden rounded-2xl border shadow-2xs">
        {/* Table Header Bar */}
        <div className="border-border bg-background/70 text-muted flex items-center justify-between border-b px-4 py-3 font-mono text-xs font-semibold tracking-wider uppercase sm:px-5">
          <div className="flex items-center gap-3">
            <span className="w-6 text-center">#</span>
            <span>Title & Details</span>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <span className="hidden sm:inline">TMDB Match</span>
            <span className="hidden md:inline">Vault Location</span>
            <span className="hidden sm:inline">Runtime</span>
            <span>Watched</span>
            <span>Actions</span>
          </div>
        </div>

        {/* Item Rows */}
        <div className="divide-border divide-y">
          {filteredItems.map((item, idx) => {
            const isUpcoming = item.isUpcoming || item.year >= 2026
            const isSeries = item.vaultType === "series"
            const vaultHref =
              item.inVault && item.vaultId
                ? `/${isSeries ? "series" : "movies"}/${item.vaultId}`
                : null

            return (
              <div
                key={item.id}
                className="hover:bg-surface-elevated/40 flex items-center justify-between px-4 py-3.5 transition-colors sm:px-5"
              >
                {/* Left: Index + Poster + Title + Metadata Badges */}
                <div className="flex min-w-0 items-start gap-3.5 pr-3 sm:items-center">
                  <span className="text-muted/60 mt-0.5 w-6 shrink-0 text-center font-mono text-xs sm:mt-0">
                    {(idx + 1).toString().padStart(2, "0")}
                  </span>

                  {item.coverUrl && (
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="border-border/50 hidden h-11 w-7.5 shrink-0 rounded-sm border object-cover shadow-2xs sm:block"
                      loading="lazy"
                    />
                  )}

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {vaultHref ? (
                        <VaultTooltip label={`View in Vault (${isSeries ? "Series" : "Movies"})`}>
                          <Link
                            href={vaultHref}
                            className={`hover:text-primary flex items-center gap-1.5 text-xs tracking-tight transition-colors sm:text-sm ${
                              item.watched
                                ? "text-muted font-medium"
                                : "text-foreground font-semibold"
                            }`}
                          >
                            <span>{item.title}</span>
                            <OpenInNewIcon
                              sx={{ fontSize: 13 }}
                              className="text-muted/60 hover:text-primary"
                            />
                          </Link>
                        </VaultTooltip>
                      ) : (
                        <span
                          className={`text-xs tracking-tight transition-colors sm:text-sm ${
                            item.watched
                              ? "text-muted font-medium"
                              : "text-foreground font-semibold"
                          }`}
                        >
                          {item.title}
                        </span>
                      )}

                      {/* Upcoming Mauve Badge */}
                      {isUpcoming && (
                        <span className="rounded-full border border-[#945398]/30 bg-[#945398]/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#945398] uppercase">
                          Upcoming
                        </span>
                      )}
                    </div>

                    {/* Sub-row: Era, Release Date, Type, Vault Link */}
                    <div className="text-muted flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span
                        className="bg-background border-border rounded-md border px-2 py-0.5 font-medium"
                        title={item.era}
                      >
                        {item.era.includes(" — ") ? item.era.split(" — ")[1] : item.era}
                      </span>
                      <span>&bull;</span>
                      <span className="font-mono">{item.releaseDate}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        {isSeries ? (
                          <TvIcon sx={{ fontSize: 13 }} className="text-primary/70" />
                        ) : (
                          <MovieIcon sx={{ fontSize: 13 }} className="text-primary/70" />
                        )}
                        <span>{item.type}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: TMDB Matcher, Vault Badge, Runtime & Interactive Checkbox */}
                <div className="flex shrink-0 items-center gap-2.5 sm:gap-5">
                  {/* TMDB Linker Button */}
                  <VaultTooltip
                    label={
                      item.tmdbId
                        ? `Connected to TMDB #${item.tmdbId} (Click to re-match or disconnect)`
                        : "Click to connect to TMDB"
                    }
                  >
                    <button
                      type="button"
                      onClick={() => setLinkingItem(item)}
                      className={`flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold transition-all ${
                        item.tmdbId
                          ? "border-border bg-background text-muted hover:border-primary/50 hover:text-foreground"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                      }`}
                    >
                      <LinkIcon sx={{ fontSize: 13 }} />
                      <span className="hidden sm:inline">
                        {item.tmdbId ? `#${item.tmdbId}` : "Connect TMDB"}
                      </span>
                      <span className="sm:hidden">{item.tmdbId ? "TMDB" : "Link"}</span>
                    </button>
                  </VaultTooltip>

                  {/* Vault Tab Link Badge */}
                  <div className="hidden md:block">
                    {vaultHref ? (
                      <Link
                        href={vaultHref}
                        className="bg-primary/10 text-primary border-primary/25 hover:bg-primary/20 flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium transition-colors"
                      >
                        <span>{isSeries ? "In Series" : "In Movies"}</span>
                      </Link>
                    ) : (
                      <span className="text-muted/60 font-mono text-[10px]">Pending Sync</span>
                    )}
                  </div>

                  <span className="text-muted hidden font-mono text-xs sm:inline">
                    {formatRuntime(item.runtime)}
                  </span>

                  <VaultTooltip
                    label={
                      item.watched
                        ? "Mark as unwatched (updates Vault database)"
                        : "Mark as watched (updates Vault database)"
                    }
                    placement="left"
                  >
                    <button
                      onClick={() => toggleItemWatched(item)}
                      className="border-border hover:border-primary flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border-2 transition-all active:scale-90"
                      style={{
                        backgroundColor: item.watched ? "#9B72CF" : "transparent",
                        borderColor: item.watched ? "#9B72CF" : "var(--color-border)",
                      }}
                      aria-label={
                        item.watched
                          ? "Mark as unwatched (updates Vault database)"
                          : "Mark as watched (updates Vault database)"
                      }
                    >
                      {item.watched && <CheckIcon sx={{ fontSize: 15 }} className="text-white" />}
                    </button>
                  </VaultTooltip>

                  {/* Row Actions: Edit & Delete */}
                  <div className="border-border/60 flex items-center gap-0.5 pl-1 sm:border-l">
                    <VaultTooltip label={`Edit "${item.title}" details`}>
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="text-muted hover:text-foreground hover:bg-surface-elevated flex h-6 w-6 items-center justify-center rounded-md transition-colors"
                        aria-label={`Edit "${item.title}" details`}
                      >
                        <EditIcon sx={{ fontSize: 13 }} />
                      </button>
                    </VaultTooltip>
                    <VaultTooltip label={`Remove "${item.title}" from checklist`}>
                      <button
                        type="button"
                        onClick={() => handleDeleteTitle(item)}
                        className="text-muted flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Remove "${item.title}" from checklist`}
                      >
                        <DeleteIcon sx={{ fontSize: 13 }} />
                      </button>
                    </VaultTooltip>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="py-16 text-center">
            <MovieIcon sx={{ fontSize: 36 }} className="text-muted/40 mx-auto mb-2" />
            <p className="font-display text-foreground text-sm font-semibold">
              No matching titles found
            </p>
            <p className="text-muted mt-1 text-xs">
              Try adjusting your search query or status filter pills.
            </p>
          </div>
        )}
      </section>

      {/* AI Slate Sync Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="border-border bg-surface w-full max-w-2xl space-y-4 rounded-2xl border p-5 shadow-2xl sm:p-6">
            <div className="border-border flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <AutoAwesomeIcon sx={{ fontSize: 20 }} className="text-[#8B6CE8]" />
                <h3 className="font-display text-foreground text-base font-bold sm:text-lg">
                  AI Slate Assistant & Vault Sync
                </h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-muted hover:text-foreground text-lg"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="border-border flex gap-2 border-b pb-2 text-xs font-semibold">
              <button
                onClick={() => setAiTab("ai")}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  aiTab === "ai" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground"
                }`}
              >
                Gemini Slate Updates
              </button>
              <button
                onClick={() => setAiTab("markdown")}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  aiTab === "markdown"
                    ? "bg-primary/20 text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Import / Paste Markdown
              </button>
            </div>

            {aiTab === "ai" ? (
              <div className="space-y-4 text-xs">
                {isPending ? (
                  <div className="flex flex-col items-center justify-center space-y-3 py-10">
                    <AutoAwesomeIcon
                      sx={{ fontSize: 32 }}
                      className="animate-spin text-[#8B6CE8]"
                    />
                    <p className="text-muted text-xs">
                      Checking official {universe.toUpperCase()} calendar with Gemini AI...
                    </p>
                  </div>
                ) : aiResult ? (
                  <div className="space-y-4">
                    <div className="border-primary/20 bg-primary/10 text-foreground/90 rounded-xl border p-3.5 leading-relaxed">
                      <span className="text-primary font-semibold">Summary: </span>
                      {aiResult.summary}
                    </div>

                    {/* Discovered New Items */}
                    {aiResult.newItems.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                          Newly Announced Titles
                        </div>
                        <div className="space-y-2">
                          {aiResult.newItems.map((n, i) => (
                            <div
                              key={i}
                              className="border-border bg-background flex items-center justify-between rounded-xl border p-2.5"
                            >
                              <div>
                                <span className="text-foreground font-semibold">{n.title}</span>
                                <span className="text-muted ml-2 font-mono">({n.releaseDate})</span>
                                <span className="text-primary ml-2 font-mono">[{n.type}]</span>
                                <p className="text-muted mt-0.5 text-[11px]">{n.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleApplyAiAdditions}
                          disabled={isPending}
                          className="bg-primary hover:bg-primary/90 text-primary-fg rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                        >
                          Add {aiResult.newItems.length} Titles to Vault (Movies & Series)
                        </button>
                      </div>
                    )}

                    {/* Discovered Date Adjustments */}
                    {aiResult.dateUpdates.length > 0 && (
                      <div className="border-border space-y-2 border-t pt-2">
                        <div className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                          Calendar Date Confirmations
                        </div>
                        <div className="space-y-2">
                          {aiResult.dateUpdates.map((d, i) => (
                            <div
                              key={i}
                              className="border-border bg-background flex items-center justify-between rounded-xl border p-2.5"
                            >
                              <div>
                                <span className="text-foreground font-semibold">{d.title}</span>
                                <span className="text-primary ml-2 font-mono">
                                  → {d.newReleaseDate}
                                </span>
                                <p className="text-muted mt-0.5 text-[11px]">{d.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleApplyAiDateUpdates}
                          className="border-border bg-surface-elevated text-foreground hover:border-primary/50 rounded-xl border px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all"
                        >
                          Apply {aiResult.dateUpdates.length} Date Adjustments
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted py-6 text-center">
                    Click below to query Gemini AI for latest release shifts.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted text-xs">
                  Paste updated Markdown checklist text formatted with headers and bullet items
                  (e.g. <code>- [ ] **Title** *(Type | Date)*</code>).
                </p>
                <textarea
                  rows={8}
                  value={customMarkdown}
                  onChange={(e) => setCustomMarkdown(e.target.value)}
                  placeholder="Paste Markdown checklist here..."
                  className="bg-background border-border text-foreground placeholder:text-muted focus:border-primary w-full resize-none rounded-xl border p-3 font-mono text-xs focus:outline-none"
                />
                <button
                  onClick={handleApplyCustomMarkdown}
                  className="bg-primary text-primary-fg rounded-xl px-4 py-2 text-xs font-semibold shadow-xs"
                >
                  Parse & Replace Active Checklist
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Markdown Export Modal */}
      {isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="border-border bg-surface w-full max-w-2xl space-y-4 rounded-2xl border p-5 shadow-2xl sm:p-6">
            <div className="border-border flex items-center justify-between border-b pb-3">
              <h3 className="font-display text-foreground text-base font-bold sm:text-lg">
                Export to VS Code / Obsidian Markdown
              </h3>
              <button
                onClick={() => setIsExportOpen(false)}
                className="text-muted hover:text-foreground text-lg"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <p className="text-muted text-xs">
              This formatted checklist includes your completed progress marks (<code>[x]</code> and{" "}
              <code>[ ]</code>). Copy and paste directly into your notes.
            </p>

            <textarea
              readOnly
              rows={10}
              value={exportMarkdownText}
              className="bg-background border-border text-foreground w-full resize-none rounded-xl border p-3 font-mono text-xs focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsExportOpen(false)}
                className="text-muted hover:bg-surface-elevated rounded-xl px-4 py-2 text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={copyMarkdown}
                className="bg-primary hover:bg-primary/90 text-primary-fg flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all"
              >
                <ContentCopyIcon sx={{ fontSize: 14 }} />
                <span>Copy Markdown</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TMDB Linker Modal */}
      {linkingItem && (
        <TmdbLinkerModal
          item={linkingItem}
          universe={universe}
          onClose={() => setLinkingItem(null)}
          onSuccess={(updated) => {
            setItems((prev) => {
              const list = prev[universe].map((i) =>
                i.id === linkingItem.id ? { ...i, ...updated } : i
              )
              return { ...prev, [universe]: list }
            })
            if (updated.inVault && !linkingItem.inVault) {
              setInVaultCounts((prev) => ({
                ...prev,
                [universe]: (prev[universe] || 0) + 1,
              }))
            }
          }}
        />
      )}

      {/* Add / Edit Individual Title Modal */}
      <FranchiseItemEditorModal
        isOpen={isAddTitleOpen || Boolean(editingItem)}
        onClose={() => {
          setIsAddTitleOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSaveTitle}
        existingItem={editingItem}
        availableEras={availableEras}
        accentColor={brandColor}
      />
    </div>
  )
}

interface TmdbLinkerModalProps {
  item: FranchiseVaultItem
  universe: string
  onClose: () => void
  onSuccess: (updated: Partial<FranchiseVaultItem>) => void
}

function TmdbLinkerModal({ item, universe, onClose, onSuccess }: TmdbLinkerModalProps) {
  const initialTitle = item.title.replace(/\s*\(Season \d+\)/i, "").trim()
  const initialSeason = (() => {
    const m = item.title.match(/\(Season (\d+)\)/i)
    return m ? parseInt(m[1]) : undefined
  })()

  const [query, setQuery] = useState(initialTitle)
  const [mediaType, setMediaType] = useState<MediaType>(item.vaultType)
  const [seasonNumber, setSeasonNumber] = useState<number | undefined>(initialSeason)
  const [results, setResults] = useState<TmdbSearchResultItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsSearching(true)
    try {
      const res = await searchTmdbForLinking(query, mediaType)
      setResults(res)
    } catch {
      toast.error("Failed to query TMDB")
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    handleSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConnect = async (selected: TmdbSearchResultItem) => {
    setIsConnecting(true)
    try {
      const res = await manuallyConnectFranchiseTmdbAction({
        universe,
        franchiseTitle: item.title,
        franchiseEra: item.era,
        mediaType,
        tmdbId: selected.id,
        seasonNumber,
        vaultId: item.vaultId,
      })

      if (res.success) {
        toast.success(res.message)
        onSuccess({
          inVault: true,
          vaultId: res.vaultId,
          tmdbId: selected.id,
          coverUrl: res.coverUrl,
          runtime: res.runtime || item.runtime,
        })
        onClose()
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect TMDB item")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!item.vaultId) return
    setIsDisconnecting(true)
    try {
      const res = await disconnectFranchiseTmdbAction(item.vaultId)
      if (res.success) {
        toast.success(res.message)
        onSuccess({ tmdbId: null, coverUrl: null })
        onClose()
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to disconnect")
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="bg-surface border-border flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border shadow-2xl">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-4 sm:p-5">
          <div>
            <h2 className="font-display text-foreground text-base font-bold sm:text-lg">
              Connect to TMDB
            </h2>
            <p className="text-muted text-xs">
              Match{" "}
              <span className="text-primary font-mono font-semibold">
                &ldquo;{item.title}&rdquo;
              </span>{" "}
              ({item.year}) to the correct TMDB entry.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 overflow-y-auto p-4 sm:p-5">
          {/* Current Connected Info */}
          {item.tmdbId ? (
            <div className="bg-primary/10 border-primary/25 flex items-center justify-between rounded-xl border p-3 text-xs">
              <div className="flex items-center gap-3">
                {item.coverUrl && (
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="border-border h-12 w-8 rounded-sm border object-cover shadow-2xs"
                  />
                )}
                <div>
                  <div className="text-foreground font-semibold">Currently Connected</div>
                  <div className="text-muted font-mono text-[11px]">TMDB ID: #{item.tmdbId}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
              >
                <LinkOffIcon sx={{ fontSize: 15 }} />
                <span>{isDisconnecting ? "Unlinking..." : "Disconnect"}</span>
              </button>
            </div>
          ) : (
            <div className="bg-surface-elevated/60 border-border text-muted rounded-xl border p-3 text-xs">
              Not currently linked to TMDB. Search below to connect the official title and artwork.
            </div>
          )}

          {/* Search Controls */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Toggle */}
              <div className="bg-background border-border flex items-center rounded-xl border p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMediaType("movie")}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    mediaType === "movie"
                      ? "bg-surface text-foreground border-border border font-bold shadow-2xs"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Movie
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType("series")}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    mediaType === "series"
                      ? "bg-surface text-foreground border-border border font-bold shadow-2xs"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  TV Series
                </button>
              </div>

              {/* Optional Season input if Series */}
              {mediaType === "series" && (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted text-xs">Season #:</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={seasonNumber ?? ""}
                    onChange={(e) =>
                      setSeasonNumber(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    placeholder="All"
                    className="bg-background border-border text-foreground focus:ring-primary h-8 w-16 rounded-xl border px-2 text-center text-xs focus:ring-1 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Query Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSearch()
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <SearchIcon
                  sx={{ fontSize: 18 }}
                  className="text-muted absolute top-1/2 left-3 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter title (e.g. Blade, Daredevil) or exact TMDB ID..."
                  className="bg-background border-border text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/25 h-10 w-full rounded-xl border pr-4 pl-9 text-xs transition-all focus:ring-2 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="bg-primary hover:bg-primary/90 text-primary-fg flex items-center gap-1.5 rounded-xl px-4 text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
              >
                <SearchIcon sx={{ fontSize: 16 }} />
                <span>{isSearching ? "Searching..." : "Search"}</span>
              </button>
            </form>
          </div>

          {/* Results List */}
          <div className="space-y-2">
            <div className="text-muted font-mono text-[11px] font-semibold tracking-wider uppercase">
              Search Results {results.length > 0 && `(${results.length})`}
            </div>

            {isSearching ? (
              <div className="text-muted flex items-center justify-center py-8 text-xs">
                Searching TMDB catalog...
              </div>
            ) : results.length === 0 ? (
              <div className="bg-background border-border text-muted rounded-xl border p-6 text-center text-xs">
                No matching TMDB items found. Try typing a different search term or enter the exact
                numeric TMDB ID from themoviedb.org.
              </div>
            ) : (
              <div className="divide-border border-border bg-background max-h-72 divide-y overflow-y-auto rounded-xl border">
                {results.map((res) => (
                  <div
                    key={res.id}
                    className="hover:bg-surface-elevated/40 flex items-center justify-between gap-3 p-3 transition-colors"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {res.coverUrl ? (
                        <img
                          src={res.coverUrl}
                          alt={res.title}
                          className="border-border h-13 w-9 shrink-0 rounded-sm border object-cover shadow-2xs"
                        />
                      ) : (
                        <div className="bg-surface border-border text-muted/60 flex h-13 w-9 shrink-0 items-center justify-center rounded-sm border font-mono text-[10px]">
                          NO ART
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground truncate text-xs font-semibold">
                            {res.title}
                          </span>
                          {res.year && (
                            <span className="text-muted font-mono text-[11px]">({res.year})</span>
                          )}
                          <span className="bg-surface-elevated text-muted border-border py-0.2 rounded-md border px-1.5 font-mono text-[10px]">
                            #{res.id}
                          </span>
                        </div>
                        {res.overview && (
                          <p className="text-muted mt-0.5 line-clamp-2 text-[11px]">
                            {res.overview}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConnect(res)}
                      disabled={isConnecting}
                      className="bg-primary hover:bg-primary/90 text-primary-fg flex shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                      <CheckIcon sx={{ fontSize: 14 }} />
                      <span>{isConnecting ? "Connecting..." : "Connect"}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-border bg-background/50 flex justify-end rounded-b-2xl border-t p-3 sm:p-4">
          <button
            onClick={onClose}
            className="border-border text-foreground hover:bg-surface-elevated rounded-xl border px-4 py-1.5 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
