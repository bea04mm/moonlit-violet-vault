/**
 * Modal dialog for creating or editing individual titles in a franchise viewing checklist.
 * Allows editing title, release date, year, type, era, and runtime.
 *
 * @packageDocumentation
 */
"use client"

import { useState, useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"
import MovieIcon from "@mui/icons-material/Movie"
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import { FranchiseVaultItem } from "@/lib/actions/franchiseAiActions"
import { FranchiseItem } from "@/data/franchises/franchiseData"

/**
 * Component props for {@link FranchiseItemEditorModal}.
 */
interface FranchiseItemEditorModalProps {
  /** Whether the modal is visibly open */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
  /** Callback to persist the new or updated franchise item */
  onSave: (item: Partial<FranchiseItem>) => Promise<void>
  /** Existing item being edited, or null/undefined when creating a new title */
  existingItem?: FranchiseVaultItem | null
  /** Available chronological eras in the current universe */
  availableEras: string[]
  /** Accent color for modal buttons and highlights */
  accentColor?: string
}

/**
 * Common media type presets for franchise checklist items.
 */
const COMMON_TYPES = [
  "Film",
  "Season 1",
  "Season 2",
  "Season 3",
  "Animated Series",
  "Animated Film",
  "Short / One-Shot",
  "Special",
]

/**
 * Dialog for adding a new title to a franchise checklist or editing an existing title's
 * metadata (title, release date, year, type, era, and runtime).
 *
 * @param props - Component properties
 */
export function FranchiseItemEditorModal({
  isOpen,
  onClose,
  onSave,
  existingItem,
  availableEras,
  accentColor = "#8B6CE8",
}: FranchiseItemEditorModalProps) {
  const isEditing = Boolean(existingItem)

  const [title, setTitle] = useState("")
  const [releaseDate, setReleaseDate] = useState("")
  const [year, setYear] = useState<number>(2026)
  const [type, setType] = useState("Film")
  const [era, setEra] = useState("")
  const [customEra, setCustomEra] = useState("")
  const [runtime, setRuntime] = useState<number>(120)
  const [isSaving, setIsSaving] = useState(false)

  // Filter out "all" from availableEras
  const validEras = availableEras.filter((e) => e !== "all")

  useEffect(() => {
    if (existingItem) {
      setTitle(existingItem.title || "")
      setReleaseDate(existingItem.releaseDate || "")
      setYear(existingItem.year || 2026)
      setType(existingItem.type || "Film")
      setEra(existingItem.era || validEras[0] || "Mainline Canon")
      setCustomEra("")
      setRuntime(existingItem.runtime || 120)
    } else {
      setTitle("")
      setReleaseDate("")
      setYear(new Date().getFullYear())
      setType("Film")
      setEra(validEras[0] || "Mainline Canon")
      setCustomEra("")
      setRuntime(120)
    }
  }, [existingItem, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const finalEra = era === "__custom__" ? customEra.trim() || "Mainline Canon" : era || "Mainline Canon"

    setIsSaving(true)
    try {
      await onSave({
        id: existingItem?.id,
        title: title.trim(),
        releaseDate: releaseDate.trim() || String(year),
        year: Number(year) || 2026,
        type: type.trim() || "Film",
        era: finalEra,
        runtime: Number(runtime) || 120,
        watched: existingItem?.watched ?? false,
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fade-in">
      <div className="border-border bg-surface w-full max-w-lg space-y-4 rounded-2xl border p-5 shadow-2xl sm:p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${accentColor}26`, color: accentColor }}
            >
              {isEditing ? <EditIcon sx={{ fontSize: 17 }} /> : <AddIcon sx={{ fontSize: 18 }} />}
            </div>
            <div>
              <h2 className="font-display text-foreground text-base font-bold sm:text-lg">
                {isEditing ? "Edit Checklist Title" : "Add Title to Checklist"}
              </h2>
              <p className="text-muted text-xs">
                {isEditing
                  ? "Update release date, era grouping, runtime or title details."
                  : "Add a new film, series season, or milestone to this viewing slate."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground rounded-lg p-1 transition-colors"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-muted font-semibold">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spider-Man: Beyond the Spider-Verse"
              className="bg-background border-border text-foreground placeholder:text-muted focus:border-primary w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
            />
          </div>

          {/* Release Date & Year */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-muted font-semibold">Release Date String</label>
              <input
                type="text"
                value={releaseDate}
                onChange={(e) => {
                  setReleaseDate(e.target.value)
                  const match = e.target.value.match(/\b(19\d{2}|20\d{2})\b/)
                  if (match) setYear(parseInt(match[1], 10))
                }}
                placeholder="e.g. July 24, 2026 or Sept 2026 – Nov 2026"
                className="bg-background border-border text-foreground placeholder:text-muted focus:border-primary w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-muted font-semibold">Release Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10) || 2026)}
                min={1930}
                max={2040}
                className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border px-3 py-2 text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Type Quick Selector */}
          <div className="space-y-1">
            <label className="text-muted font-semibold">Type</label>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {COMMON_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-lg border px-2 py-0.5 text-[11px] font-medium transition-all ${
                    type === t
                      ? "border-primary bg-primary/15 text-primary font-semibold"
                      : "border-border bg-background text-muted hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Or type custom (e.g. Season 4, Animated Special)"
              className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border px-3 py-1.5 text-xs focus:outline-none"
            />
          </div>

          {/* Era Selection */}
          <div className="space-y-1">
            <label className="text-muted font-semibold">Timeline Era / Phase Grouping</label>
            <select
              value={era}
              onChange={(e) => setEra(e.target.value)}
              className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
            >
              {validEras.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
              <option value="__custom__">+ Create New Era / Phase...</option>
            </select>

            {era === "__custom__" && (
              <input
                type="text"
                value={customEra}
                onChange={(e) => setCustomEra(e.target.value)}
                placeholder="Enter new era name (e.g. Phase 7: Secret Wars Aftermath)"
                className="bg-background border-border text-foreground focus:border-primary mt-1.5 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
              />
            )}
          </div>

          {/* Runtime */}
          <div className="space-y-1">
            <label className="text-muted font-semibold">Approximate Runtime (Minutes)</label>
            <input
              type="number"
              value={runtime}
              onChange={(e) => setRuntime(parseInt(e.target.value, 10) || 0)}
              min={1}
              max={1500}
              className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border px-3 py-2 text-xs focus:outline-none font-mono"
            />
          </div>

          {/* Actions */}
          <div className="border-border flex items-center justify-end gap-2 border-t pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="text-muted hover:bg-surface-elevated rounded-xl px-4 py-2 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-fg flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <MovieIcon sx={{ fontSize: 15 }} />
              <span>{isSaving ? "Saving..." : isEditing ? "Save Changes" : "Add to Checklist"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
