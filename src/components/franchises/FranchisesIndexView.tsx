/**
 * Franchises Hub / Index View for the Moonlit Violet Vault.
 * Displays all available cinematic franchises (Marvel, DC, Wizarding World, custom sagas)
 * with progress metrics, poster previews, and dynamic creation/deletion.
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
import MovieIcon from "@mui/icons-material/Movie"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CloudDoneIcon from "@mui/icons-material/CloudDone"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import SearchIcon from "@mui/icons-material/Search"
import { toast } from "sonner"
import { AddFranchiseModal } from "./AddFranchiseModal"
import { deleteCustomFranchiseAction } from "@/lib/actions/franchiseAiActions"
import { PageHeader } from "@/components/layout/PageHeader"

/**
 * View model representing a franchise card rendered on the Franchises Hub.
 */
export interface FranchiseCardData {
  /** Unique franchise slug identifier (e.g. 'marvel', 'dc', 'wizarding-world') */
  id: string
  /** Full official franchise title (e.g. 'Marvel Cinematic Universe') */
  name: string
  /** Concise badge label (e.g. 'MCU', 'DC Universe') */
  shortName: string
  /** High-level editorial tagline */
  tagline: string
  /** Hex color code used for styling badges and accents */
  accentColor: string
  /** Whether the franchise is user-created or part of built-in catalog */
  isCustom: boolean
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Filtered list
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return franchises
    const q = searchQuery.toLowerCase().trim()
    return franchises.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.shortName.toLowerCase().includes(q) ||
        f.tagline.toLowerCase().includes(q)
    )
  }, [franchises, searchQuery])

  // Aggregated totals
  const totalTitles = useMemo(() => franchises.reduce((acc, f) => acc + f.totalCount, 0), [franchises])
  const totalInVault = useMemo(() => franchises.reduce((acc, f) => acc + f.inVaultCount, 0), [franchises])
  const totalWatched = useMemo(() => franchises.reduce((acc, f) => acc + f.watchedCount, 0), [franchises])
  const totalHours = useMemo(
    () => Math.round(franchises.reduce((acc, f) => acc + f.totalMinutes, 0) / 60),
    [franchises]
  )

  /**
   * Prompts the user and deletes a custom franchise from Supabase and client state.
   */
  const handleDelete = async (e: React.MouseEvent, f: FranchiseCardData) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Are you sure you want to delete the "${f.name}" franchise?`)) return

    const res = await deleteCustomFranchiseAction(f.id)
    if (res.success) {
      toast.success(res.message)
      setFranchises((prev) => prev.filter((item) => item.id !== f.id))
    } else {
      toast.error(res.message || "Failed to delete franchise.")
    }
  }

  /**
   * Callback fired after creating a custom franchise, routing immediately to its checklist.
   */
  const handleCreated = (newFranchise: { id: string; name: string }) => {
    toast.success(`Created "${newFranchise.name}"! Opening checklist...`)
    router.push(`/franchises/${newFranchise.id}`)
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Standardized Header Section */}
      <PageHeader
        title="Franchises"
        accent="cinematic sagas"
        description="Curated chronological viewing checklists and master timelines for legendary cinematic universes."
        action={
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-fg inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
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
          <div className="text-muted mt-1 text-[11px] font-medium">Chronological checklist titles</div>
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

      {/* Search Bar */}
      <div className="relative">
        <SearchIcon
          sx={{ fontSize: 18 }}
          className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter franchises by name, studio, or tagline..."
          className="bg-surface border-border text-foreground placeholder:text-muted/60 focus:border-primary/50 focus:ring-primary/20 w-full rounded-xl border py-2.5 pr-4 pl-10 text-xs font-medium shadow-2xs transition-all focus:outline-hidden focus:ring-2"
        />
      </div>

      {/* Franchises Grid */}
      {filtered.length === 0 ? (
        <div className="border-border bg-surface/50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <HubIcon sx={{ fontSize: 40 }} className="text-muted/40 mb-3" />
          <h3 className="text-foreground font-semibold text-sm">No franchises found</h3>
          <p className="text-muted mt-1 text-xs max-w-sm">
            {searchQuery
              ? `No franchises matched "${searchQuery}". Clear your search or create a new franchise.`
              : "No franchises have been added yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => {
            const watchedPct = f.totalCount > 0 ? Math.round((f.watchedCount / f.totalCount) * 100) : 0

            return (
              <Link
                key={f.id}
                href={`/franchises/${f.id}`}
                className="group border-border bg-surface hover:border-primary/50 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Accent top stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.25 transition-all group-hover:h-1.5"
                  style={{ backgroundColor: f.accentColor }}
                />

                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase shadow-2xs"
                      style={{
                        backgroundColor: `${f.accentColor}20`,
                        color: f.accentColor,
                      }}
                    >
                      {f.shortName}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {f.isCustom ? (
                        <>
                          <span className="text-[10px] font-medium text-muted bg-surface-elevated border border-border px-1.5 py-0.5 rounded-sm">
                            Custom
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, f)}
                            className="text-muted hover:text-red-400 p-1 transition-colors rounded-sm hover:bg-red-500/10 cursor-pointer"
                            title={`Delete ${f.shortName} franchise`}
                          >
                            <DeleteIcon sx={{ fontSize: 15 }} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-medium text-muted bg-surface-elevated border border-border px-1.5 py-0.5 rounded-sm">
                          Canon
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-foreground group-hover:text-primary font-display text-lg font-bold leading-snug transition-colors line-clamp-1">
                    {f.name}
                  </h3>
                  <p className="text-muted mt-1.5 text-xs line-clamp-2 leading-relaxed">
                    {f.tagline || "Comprehensive chronological viewing order and timeline archives."}
                  </p>

                  {/* Thumbnail Poster Preview Strip */}
                  {f.sampleCovers && f.sampleCovers.length > 0 ? (
                    <div className="mt-4 flex items-center gap-1.5 overflow-hidden py-1">
                      {f.sampleCovers.slice(0, 4).map((cover, idx) => (
                        <img
                          key={idx}
                          src={cover}
                          alt=""
                          className="h-16 w-11 shrink-0 rounded-md border border-border/60 object-cover shadow-2xs transition-transform group-hover:scale-102"
                          loading="lazy"
                        />
                      ))}
                      {f.totalCount > 4 && (
                        <div className="h-16 w-11 shrink-0 rounded-md border border-dashed border-border bg-surface-elevated/70 flex items-center justify-center text-[10px] font-mono text-muted">
                          +{f.totalCount - 4}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 flex h-16 items-center justify-center rounded-md border border-dashed border-border/60 bg-surface-elevated/40 text-[11px] text-muted font-mono">
                      {f.totalCount} chronological titles
                    </div>
                  )}
                </div>

                {/* Progress & Card Footer */}
                <div className="mt-5 space-y-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted font-medium">
                      {f.inVaultCount} of {f.totalCount} in Vault
                    </span>
                    <span className="text-foreground font-semibold">
                      {watchedPct}% watched
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-surface-elevated h-1.5 w-full overflow-hidden rounded-full border border-border/40">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${watchedPct}%`,
                        backgroundColor: f.accentColor,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs font-semibold text-primary group-hover:text-primary-hover">
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                      <AccessTimeIcon sx={{ fontSize: 13 }} />
                      {Math.round(f.totalMinutes / 60)} hrs
                    </span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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

      {/* Add Franchise Modal */}
      {isAddModalOpen && (
        <AddFranchiseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleCreated}
        />
      )}
    </div>
  )
}
