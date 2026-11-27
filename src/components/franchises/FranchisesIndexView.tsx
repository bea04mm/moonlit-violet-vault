/**
 * Franchises Hub / Index View for the Moonlit Violet Vault.
 * Displays all available cinematic franchises with progress metrics, poster previews,
 * and dynamic creation, editing, and deletion.
 *
 * @packageDocumentation
 */
"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import HubIcon from "@mui/icons-material/Hub"
import AddIcon from "@mui/icons-material/Add"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import MovieIcon from "@mui/icons-material/Movie"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CloudDoneIcon from "@mui/icons-material/CloudDone"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import SearchIcon from "@mui/icons-material/Search"
import FormControl from "@mui/material/FormControl"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import { toast } from "sonner"
import { AddFranchiseModal } from "./AddFranchiseModal"
import { deleteFranchiseAction, type FranchiseSummary } from "@/lib/actions/franchiseAiActions"
import { PageHeader } from "@/components/layout/PageHeader"
import { VaultTooltip } from "@/components/ui/VaultTooltip"
import { usePersistedSort } from "@/lib/utils/usePersistedSort"

/** Sort modes available on the Franchises Hub. */
const FRANCHISE_SORT_OPTIONS = [
  "recent",
  "updated",
  "name_asc",
  "name_desc",
  "progress_desc",
  "titles_desc",
  "runtime_desc",
] as const
type FranchiseSortOption = (typeof FRANCHISE_SORT_OPTIONS)[number]

/**
 * View model representing a franchise card rendered on the Franchises Hub.
 */
export interface FranchiseCardData extends FranchiseSummary {
  /** Total titles in the franchise viewing checklist */
  totalCount: number
  /** Number of titles that have been added to the personal Vault */
  inVaultCount: number
  /** Number of titles marked as watched */
  watchedCount: number
  /** Cumulative runtime across all items in minutes */
  totalMinutes: number
  /** Previews of up to 4 cover poster URLs */
  sampleCovers: string[]
}

const toTimestamp = (iso?: string) => (iso ? Date.parse(iso) || 0 : 0)
const completionRatio = (f: FranchiseCardData) =>
  f.totalCount > 0 ? f.watchedCount / f.totalCount : 0

/**
 * Component props for {@link FranchisesIndexView}.
 */
interface FranchisesIndexViewProps {
  /** Initial server-loaded franchise cards */
  initialFranchises: FranchiseCardData[]
}

/**
 * Hub view rendering all available cinematic franchises with search, stats,
 * and management actions (custom universe creation and deletion).
 *
 * @param props - Component properties containing initial server-loaded franchise cards
 */
export function FranchisesIndexView({ initialFranchises }: FranchisesIndexViewProps) {
  const router = useRouter()
  const [franchises, setFranchises] = useState<FranchiseCardData[]>(() => {
    const map = new Map<string, FranchiseCardData>()
    initialFranchises.forEach((f) => map.set(f.id, f))
    return Array.from(map.values())
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = usePersistedSort(
    "vault-sort-franchises",
    "recent",
    FRANCHISE_SORT_OPTIONS
  )
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingFranchise, setEditingFranchise] = useState<FranchiseSummary | null>(null)

  // Filtered & sorted list
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const matches = q
      ? franchises.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.shortName.toLowerCase().includes(q) ||
            f.tagline.toLowerCase().includes(q)
        )
      : [...franchises]

    matches.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return toTimestamp(b.createdAt) - toTimestamp(a.createdAt)
        case "updated":
          return toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt)
        case "name_asc":
          return a.name.localeCompare(b.name)
        case "name_desc":
          return b.name.localeCompare(a.name)
        case "progress_desc":
          return (
            completionRatio(b) - completionRatio(a) ||
            b.watchedCount - a.watchedCount ||
            a.name.localeCompare(b.name)
          )
        case "titles_desc":
          return b.totalCount - a.totalCount || a.name.localeCompare(b.name)
        case "runtime_desc":
          return b.totalMinutes - a.totalMinutes || a.name.localeCompare(b.name)
      }
    })

    return matches
  }, [franchises, searchQuery, sortBy])

  // Aggregated totals
  const totalTitles = useMemo(
    () => franchises.reduce((acc, f) => acc + f.totalCount, 0),
    [franchises]
  )
  const totalInVault = useMemo(
    () => franchises.reduce((acc, f) => acc + f.inVaultCount, 0),
    [franchises]
  )
  const totalWatched = useMemo(
    () => franchises.reduce((acc, f) => acc + f.watchedCount, 0),
    [franchises]
  )
  const totalHours = useMemo(
    () => Math.round(franchises.reduce((acc, f) => acc + f.totalMinutes, 0) / 60),
    [franchises]
  )

  /**
   * Prompts the user and deletes a franchise from Supabase and client state.
   */
  const handleDelete = async (e: React.MouseEvent, f: FranchiseCardData) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Are you sure you want to delete the "${f.name}" franchise?`)) return

    const res = await deleteFranchiseAction(f.id)
    if (res.success) {
      toast.success(res.message)
      setFranchises((prev) => prev.filter((item) => item.id !== f.id))
      router.refresh()
    } else {
      toast.error(res.message || "Failed to delete franchise.")
    }
  }

  /**
   * Callback fired after creating or updating a franchise.
   */
  const handleModalSuccess = (saved: FranchiseSummary) => {
    if (editingFranchise) {
      setFranchises((prev) =>
        prev.map((item) => (item.id === saved.id ? { ...item, ...saved } : item))
      )
      setEditingFranchise(null)
      router.refresh()
      return
    }
    toast.success(`Created "${saved.name}"! Opening checklist...`)
    router.push(`/franchises/${saved.id}`)
  }

  return (
    <div className="animate-fade-in space-y-8 pb-16">
      {/* Standardized Header Section */}
      <PageHeader
        title="Franchises"
        accent="cinematic sagas"
        description="Curated chronological viewing checklists and master timelines for legendary cinematic universes."
        action={
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-fg inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <AddIcon sx={{ fontSize: 18 }} />
            <span>Add Franchise</span>
          </button>
        }
      />

      {/* Global Stats Ribbon */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="border-border bg-surface rounded-2xl border p-4 shadow-2xs">
          <div className="text-muted flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Universes</span>
            <HubIcon sx={{ fontSize: 16 }} className="text-primary" />
          </div>
          <div className="font-display text-foreground mt-1 text-2xl font-extrabold sm:text-3xl">
            {franchises.length}
          </div>
          <div className="text-muted mt-1 text-[11px] font-medium">Curated franchises</div>
        </div>

        <div className="border-border bg-surface rounded-2xl border p-4 shadow-2xs">
          <div className="text-muted flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Total Titles</span>
            <MovieIcon sx={{ fontSize: 16 }} className="text-violet-400" />
          </div>
          <div className="font-display text-foreground mt-1 text-2xl font-extrabold sm:text-3xl">
            {totalTitles}
          </div>
          <div className="text-muted mt-1 text-[11px] font-medium">
            Chronological checklist titles
          </div>
        </div>

        <div className="border-border bg-surface rounded-2xl border p-4 shadow-2xs">
          <div className="text-muted flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>In Vault</span>
            <CloudDoneIcon sx={{ fontSize: 16 }} className="text-emerald-400" />
          </div>
          <div className="font-display text-foreground mt-1 text-2xl font-extrabold sm:text-3xl">
            {totalInVault}
          </div>
          <div className="text-muted mt-1 text-[11px] font-medium">
            {totalTitles > 0 ? Math.round((totalInVault / totalTitles) * 100) : 0}% synced to Vault
          </div>
        </div>

        <div className="border-border bg-surface rounded-2xl border p-4 shadow-2xs">
          <div className="text-muted flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Completed</span>
            <CheckCircleIcon sx={{ fontSize: 16 }} className="text-amber-400" />
          </div>
          <div className="font-display text-foreground mt-1 text-2xl font-extrabold sm:text-3xl">
            {totalWatched}
          </div>
          <div className="text-muted mt-1 text-[11px] font-medium">
            {totalHours} hours total runtime
          </div>
        </div>
      </section>

      {/* Search & Sort Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon
            sx={{ fontSize: 18 }}
            className="text-muted pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter franchises by name, studio, or tagline..."
            className="bg-surface border-border text-foreground placeholder:text-muted/60 focus:border-primary/50 focus:ring-primary/20 w-full rounded-xl border py-2.5 pr-4 pl-10 text-xs font-medium shadow-2xs transition-all focus:ring-2 focus:outline-hidden"
          />
        </div>

        <FormControl
          size="small"
          className="bg-surface border-border shrink-0 rounded-xl border shadow-2xs"
        >
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as FranchiseSortOption)}
            inputProps={{ "aria-label": "Sort franchises" }}
            sx={{
              height: 36,
              fontSize: "0.75rem",
              fontWeight: 500,
              borderRadius: "0.75rem",
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
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
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
            <MenuItem value="recent">Recently Added</MenuItem>
            <MenuItem value="updated">Recently Updated</MenuItem>
            <MenuItem value="name_asc">Name (A–Z)</MenuItem>
            <MenuItem value="name_desc">Name (Z–A)</MenuItem>
            <MenuItem value="progress_desc">Completion (Highest)</MenuItem>
            <MenuItem value="titles_desc">Titles (Most)</MenuItem>
            <MenuItem value="runtime_desc">Runtime (Longest)</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Franchises Grid */}
      {filtered.length === 0 ? (
        <div className="border-border bg-surface/50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <HubIcon sx={{ fontSize: 40 }} className="text-muted/40 mb-3" />
          <h3 className="text-foreground text-sm font-semibold">No franchises found</h3>
          <p className="text-muted mt-1 max-w-sm text-xs">
            {searchQuery
              ? `No franchises matched "${searchQuery}". Clear your search or create a new franchise.`
              : "No franchises have been added yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => {
            const watchedPct =
              f.totalCount > 0 ? Math.round((f.watchedCount / f.totalCount) * 100) : 0

            return (
              <Link
                key={f.id}
                href={`/franchises/${f.id}`}
                className="group border-border bg-surface hover:border-primary/50 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Accent top stripe */}
                <div
                  className="absolute top-0 right-0 left-0 h-1.25 transition-all group-hover:h-1.5"
                  style={{ backgroundColor: f.accentColor }}
                />

                <div>
                  {/* Card Header */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase shadow-2xs"
                      style={{
                        backgroundColor: `${f.accentColor}20`,
                        color: f.accentColor,
                      }}
                    >
                      {f.shortName}
                    </span>

                    <div className="flex items-center gap-1">
                      <VaultTooltip label={`Edit ${f.shortName} franchise`}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setEditingFranchise({
                              id: f.id,
                              name: f.name,
                              shortName: f.shortName,
                              tagline: f.tagline,
                              accentColor: f.accentColor,
                            })
                          }}
                          className="text-muted hover:text-foreground hover:bg-surface-elevated cursor-pointer rounded-sm p-1 transition-colors"
                          aria-label={`Edit ${f.shortName} franchise`}
                        >
                          <EditIcon sx={{ fontSize: 15 }} />
                        </button>
                      </VaultTooltip>
                      <VaultTooltip label={`Delete ${f.shortName} franchise`}>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, f)}
                          className="text-muted cursor-pointer rounded-sm p-1 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          aria-label={`Delete ${f.shortName} franchise`}
                        >
                          <DeleteIcon sx={{ fontSize: 15 }} />
                        </button>
                      </VaultTooltip>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-foreground group-hover:text-primary font-display line-clamp-1 text-lg leading-snug font-bold transition-colors">
                    {f.name}
                  </h3>
                  <p className="text-muted mt-1.5 line-clamp-2 text-xs leading-relaxed">
                    {f.tagline ||
                      "Comprehensive chronological viewing order and timeline archives."}
                  </p>

                  {/* Thumbnail Poster Preview Strip */}
                  {f.sampleCovers && f.sampleCovers.length > 0 ? (
                    <div className="mt-4 flex items-center gap-1.5 overflow-hidden py-1">
                      {f.sampleCovers.slice(0, 4).map((cover, idx) => (
                        <img
                          key={idx}
                          src={cover}
                          alt=""
                          className="border-border/60 h-16 w-11 shrink-0 rounded-md border object-cover shadow-2xs transition-transform group-hover:scale-102"
                          loading="lazy"
                        />
                      ))}
                      {f.totalCount > 4 && (
                        <div className="border-border bg-surface-elevated/70 text-muted flex h-16 w-11 shrink-0 items-center justify-center rounded-md border border-dashed font-mono text-[10px]">
                          +{f.totalCount - 4}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-border/60 bg-surface-elevated/40 text-muted mt-4 flex h-16 items-center justify-center rounded-md border border-dashed font-mono text-[11px]">
                      {f.totalCount} chronological titles
                    </div>
                  )}
                </div>

                {/* Progress & Card Footer */}
                <div className="border-border/50 mt-5 space-y-3 border-t pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted font-medium">
                      {f.inVaultCount} of {f.totalCount} in Vault
                    </span>
                    <span className="text-foreground font-semibold">{watchedPct}% watched</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-surface-elevated border-border/40 h-1.5 w-full overflow-hidden rounded-full border">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${watchedPct}%`,
                        backgroundColor: f.accentColor,
                      }}
                    />
                  </div>

                  <div className="text-primary group-hover:text-primary-hover flex items-center justify-between pt-1 text-xs font-semibold">
                    <span className="text-muted inline-flex items-center gap-1 text-[11px]">
                      <AccessTimeIcon sx={{ fontSize: 13 }} />
                      {Math.round(f.totalMinutes / 60)} hrs
                    </span>
                    <span className="inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                      <span>View Checklist</span>
                      <ArrowForwardIcon sx={{ fontSize: 14 }} />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Add / Edit Franchise Modal */}
      {(isAddModalOpen || Boolean(editingFranchise)) && (
        <AddFranchiseModal
          key={editingFranchise?.id ?? "new"}
          isOpen
          editingFranchise={editingFranchise}
          onClose={() => {
            setIsAddModalOpen(false)
            setEditingFranchise(null)
          }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}
