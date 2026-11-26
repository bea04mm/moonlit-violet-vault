/**
 * Modal dialog for creating new cinematic universes and viewing checklists.
 * Supports automated AI slate generation via Gemini 3.8 Flash as well as direct
 * Markdown checklist importing.
 *
 * @packageDocumentation
 */
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { VaultTooltip } from "@/components/ui/VaultTooltip"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import CloseIcon from "@mui/icons-material/Close"
import CheckIcon from "@mui/icons-material/Check"
import ContentPasteIcon from "@mui/icons-material/ContentPaste"
import MovieIcon from "@mui/icons-material/Movie"
import {
  generateFranchiseWithAIAction,
  createCustomFranchiseAction,
  FranchiseSummary,
} from "@/lib/actions/franchiseAiActions"

/**
 * Component props for {@link AddFranchiseModal}.
 */
interface AddFranchiseModalProps {
  /** Whether the modal dialog is visibly open */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
  /** Callback fired upon successful franchise creation */
  onSuccess: (newFranchise: FranchiseSummary) => void
}

/**
 * Quick-start preset franchises with curated titles and color themes.
 */
const PRESET_SUGGESTIONS = [
  { name: "Star Wars", color: "#E5B842", notes: "Complete chronological canon and legends saga" },
  { name: "Wizarding World", color: "#85144b", notes: "Harry Potter and Fantastic Beasts films" },
  {
    name: "Middle-earth",
    color: "#2ECC40",
    notes: "The Lord of the Rings and The Hobbit in chronological order",
  },
  {
    name: "James Bond 007",
    color: "#0074D9",
    notes: "EON Productions Bond films from Dr. No to No Time to Die",
  },
  {
    name: "Doctor Who",
    color: "#00BCD4",
    notes: "Modern revival series and specials from 2005 onwards",
  },
  { name: "MonsterVerse", color: "#9B59B6", notes: "Godzilla and Kong cinematic universe" },
  {
    name: "Alien & Predator",
    color: "#607D8B",
    notes: "Complete Alien and Predator chronological timeline",
  },
]

/**
 * Suggested accent colors for franchise badge branding.
 */
const COLOR_PALETTE = [
  "#E5B842", // Star Wars Gold
  "#85144b", // Wizarding Maroon
  "#2ECC40", // Middle-earth Emerald
  "#0074D9", // Bond Blue
  "#00BCD4", // Sci-Fi Cyan
  "#8B6CE8", // Violet
  "#E74C3C", // Sith Red
  "#E67E22", // Warm Amber
]

/**
 * Dialog component for adding custom cinematic franchises via Gemini AI generation
 * or raw Markdown checklist import.
 *
 * @param props - Component properties
 */
export function AddFranchiseModal({ isOpen, onClose, onSuccess }: AddFranchiseModalProps) {
  const [tab, setTab] = useState<"ai" | "markdown">("ai")
  const [name, setName] = useState("")
  const [shortName, setShortName] = useState("")
  const [accentColor, setAccentColor] = useState("#E5B842")
  const [notes, setNotes] = useState("")
  const [markdownText, setMarkdownText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSelectPreset = (preset: (typeof PRESET_SUGGESTIONS)[0]) => {
    setName(preset.name)
    setShortName(preset.name.slice(0, 14))
    setAccentColor(preset.color)
    setNotes(preset.notes)
  }

  const handleGenerateAI = async () => {
    if (!name.trim()) {
      toast.error("Please enter a franchise name.")
      return
    }

    setIsLoading(true)
    try {
      const res = await generateFranchiseWithAIAction({
        name: name.trim(),
        notes: notes.trim() || undefined,
        accentColor,
      })

      if (res.success && res.franchise) {
        toast.success(res.message)
        onSuccess(res.franchise)
        onClose()
      } else {
        toast.error(res.message || "Failed to generate franchise")
      }
    } catch {
      toast.error("An error occurred during AI generation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportMarkdown = async () => {
    if (!name.trim()) {
      toast.error("Please provide a franchise name.")
      return
    }
    if (!markdownText.trim()) {
      toast.error("Please paste your Markdown checklist.")
      return
    }

    setIsLoading(true)
    try {
      const res = await createCustomFranchiseAction({
        name: name.trim(),
        shortName: shortName.trim() || name.trim().slice(0, 14),
        accentColor,
        markdown: markdownText,
      })

      if (res.success && res.franchise) {
        toast.success(res.message)
        onSuccess(res.franchise)
        onClose()
      } else {
        toast.error(res.message || "Failed to create franchise")
      }
    } catch {
      toast.error("Failed to parse and import markdown")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="border-border bg-surface max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl border p-5 shadow-2xl sm:p-6">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${accentColor}26`, color: accentColor }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
            </div>
            <div>
              <h2 className="font-display text-foreground text-base font-bold sm:text-lg">
                Add New Franchise
              </h2>
              <p className="text-muted text-xs">
                Create a viewing checklist with AI research or paste Markdown.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground rounded-lg p-1 transition-colors"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-background border-border flex rounded-xl border p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab("ai")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
              tab === "ai"
                ? "bg-primary text-primary-fg shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            <AutoAwesomeIcon sx={{ fontSize: 14 }} />
            <span>Generate with Gemini AI</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("markdown")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
              tab === "markdown"
                ? "bg-primary text-primary-fg shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            <ContentPasteIcon sx={{ fontSize: 14 }} />
            <span>Paste Markdown Checklist</span>
          </button>
        </div>

        {/* Quick Presets (AI Tab) */}
        {tab === "ai" && (
          <div className="space-y-1.5">
            <label className="text-muted text-[11px] font-semibold tracking-wider uppercase">
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SUGGESTIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                    name === preset.name
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-background text-muted hover:text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Common Inputs: Name & Color */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-muted text-xs font-semibold">Franchise Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!shortName) setShortName(e.target.value.slice(0, 14))
              }}
              placeholder="e.g. Star Wars, Harry Potter"
              className="bg-background border-border text-foreground placeholder:text-muted focus:border-primary w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-muted text-xs font-semibold">Tab Label (Short Name)</label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="e.g. Star Wars"
              maxLength={16}
              className="bg-background border-border text-foreground placeholder:text-muted focus:border-primary w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-1.5">
          <label className="text-muted text-xs font-semibold">Accent Color</label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border transition-transform hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: c,
                    borderColor: accentColor === c ? "#ffffff" : "transparent",
                  }}
                >
                  {accentColor === c && (
                    <CheckIcon sx={{ fontSize: 14 }} className="text-white drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>
            <VaultTooltip label="Custom Hex Color">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-7 w-8 cursor-pointer rounded-md border-0 bg-transparent p-0"
                aria-label="Custom Hex Color"
              />
            </VaultTooltip>
          </div>
        </div>

        {/* Tab 1: AI Scope Notes */}
        {tab === "ai" && (
          <div className="space-y-1">
            <label className="text-muted text-xs font-semibold">
              Curator Notes / Scope (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Include all theatrical releases, Disney+ shows, and canonical spin-offs in chronological timeline order"
              className="bg-background border-border text-foreground placeholder:text-muted focus:border-primary w-full resize-none rounded-xl border p-2.5 text-xs focus:outline-none"
            />
          </div>
        )}

        {/* Tab 2: Markdown Text */}
        {tab === "markdown" && (
          <div className="space-y-1">
            <label className="text-muted text-xs font-semibold">Markdown Viewing Checklist</label>
            <textarea
              rows={7}
              value={markdownText}
              onChange={(e) => setMarkdownText(e.target.value)}
              placeholder={`## Original Trilogy\n- [ ] **A New Hope** *(Film | May 25, 1977)*\n- [ ] **The Empire Strikes Back** *(Film | May 21, 1980)*`}
              className="bg-background border-border text-foreground placeholder:text-muted focus:border-primary w-full resize-none rounded-xl border p-3 font-mono text-xs focus:outline-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="border-border flex items-center justify-end gap-2 border-t pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-muted hover:bg-surface-elevated rounded-xl px-4 py-2 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          {tab === "ai" ? (
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={isLoading || !name.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-fg flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <AutoAwesomeIcon sx={{ fontSize: 15 }} className={isLoading ? "animate-spin" : ""} />
              <span>{isLoading ? "Generating with Gemini..." : "Generate & Add Franchise"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleImportMarkdown}
              disabled={isLoading || !name.trim() || !markdownText.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-fg flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <MovieIcon sx={{ fontSize: 15 }} />
              <span>{isLoading ? "Importing..." : "Parse & Add Franchise"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
