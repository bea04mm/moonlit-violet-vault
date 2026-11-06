/**
 * Keyboard-driven search and navigation overlay for the vault.
 * Triggered globally with Ctrl+K (or Cmd+K on Mac).
 *
 * Features:
 *  - Without a query: shows quick-navigation links to all main sections.
 *  - With a query: searches all vault items with fuzzy multi-term matching,
 *    grouped by type (Movies, Series, Books, Recipes).
 *  - Keyboard navigation: Arrow Up/Down to move selection, Enter to navigate.
 *  - Items already in the vault show a "View in Vault" button instead of adding.
 *
 * @packageDocumentation
 */
"use client"

import { useState, useEffect, useRef, useMemo, useCallback, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import SearchIcon from "@mui/icons-material/Search"
import MovieIcon from "@mui/icons-material/Movie"
import TvIcon from "@mui/icons-material/Tv"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu"
import BarChartIcon from "@mui/icons-material/BarChart"
import HomeIcon from "@mui/icons-material/Home"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined"
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined"
import { getAllMediaAction } from "@/lib/actions/mediaActions"
import type { MediaItem, MediaType } from "@/lib/supabase/database.types"
import { STATUS_LABELS, STATUS_COLORS, TYPE_LABELS, TYPE_COLORS } from "@/lib/constants"
import { triggerAddMedia } from "@/components/media/AddMediaModal"
import { useTheme } from "@/lib/mui/MuiProvider"

/**
 * A palette entry is either a navigation shortcut (no query) or a vault media item (with query).
 * The discriminated union lets TypeScript narrow the type safely in render functions.
 */
type PaletteOption =
  | { type: "nav"; id: string; label: string; icon: React.ReactNode; path: string }
  | { type: "item"; id: string; item: MediaItem; path: string }

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text
  const terms = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  if (!terms.length) return text

  const regex = new RegExp(`(${terms.join("|")})`, "gi")
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <span
        key={i}
        className="text-primary decoration-primary/50 font-semibold underline underline-offset-2"
      >
        {part}
      </span>
    ) : (
      part
    )
  )
}

function useAutoScroll(isSelected: boolean) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: "nearest" })
    }
  }, [isSelected])
  return ref
}

const emptySubscribe = () => () => {}

/**
 * Full-screen command palette dialog — opens on Ctrl+K and closes on Escape.
 * Fetches all vault items lazily on first open and caches them for the session.
 */
export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeType, setActiveType] = useState<MediaType | "all">("all")
  const [items, setItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  const { theme, toggleTheme } = useTheme()

  /**
   * The Next.js App Router navigator instance.
   */
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)

  const openPalette = useCallback(() => {
    setIsOpen(true)
    setQuery("")
    setActiveType("all")
    const navPaths = ["/", "/movies", "/series", "/books", "/recipes", "/import", "/analytics"]
    const currentIndex = navPaths.indexOf(pathname)
    setSelectedIndex(currentIndex !== -1 ? currentIndex : 0)
    if (items.length === 0) {
      setIsLoading(true)
      getAllMediaAction()
        .then(setItems)
        .finally(() => setIsLoading(false))
    }
  }, [items.length, pathname])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (isOpen) {
          setIsOpen(false)
        } else {
          openPalette()
        }
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, openPalette])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const filteredItems = useMemo(() => {
    if (!query.trim()) return []
    const terms = query.toLowerCase().trim().split(/\s+/)
    return items.filter((item) => {
      const text = [
        item.title,
        item.original_title,
        item.author,
        item.director,
        ...(item.genres ?? []),
        ...(item.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return terms.every((t) => text.includes(t))
    })
  }, [items, query])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: filteredItems.length,
      movie: 0,
      series: 0,
      book: 0,
      recipe: 0,
    }
    for (const item of filteredItems) {
      if (counts[item.type] !== undefined) counts[item.type]++
    }
    return counts
  }, [filteredItems])

  const displayItems = useMemo(() => {
    if (activeType === "all") return filteredItems
    return filteredItems.filter((i) => i.type === activeType)
  }, [filteredItems, activeType])

  const options: PaletteOption[] = useMemo(() => {
    const navItems: Extract<PaletteOption, { type: "nav" }>[] = [
      {
        type: "nav",
        id: "nav-home",
        label: "Dashboard",
        icon: <HomeIcon fontSize="small" className="text-primary" />,
        path: "/",
      },
      {
        type: "nav",
        id: "nav-movies",
        label: "Movies",
        icon: <MovieIcon fontSize="small" className="text-primary" />,
        path: "/movies",
      },
      {
        type: "nav",
        id: "nav-series",
        label: "Series",
        icon: <TvIcon fontSize="small" className="text-primary" />,
        path: "/series",
      },
      {
        type: "nav",
        id: "nav-books",
        label: "Books",
        icon: <MenuBookIcon fontSize="small" className="text-primary" />,
        path: "/books",
      },
      {
        type: "nav",
        id: "nav-recipes",
        label: "Recipes",
        icon: <RestaurantMenuIcon fontSize="small" className="text-primary" />,
        path: "/recipes",
      },
      {
        type: "nav",
        id: "nav-import",
        label: "Import Data",
        icon: <FileUploadIcon fontSize="small" className="text-primary" />,
        path: "/import",
      },
      {
        type: "nav",
        id: "nav-analytics",
        label: "Analytics",
        icon: <BarChartIcon fontSize="small" className="text-primary" />,
        path: "/analytics",
      },
      {
        type: "nav",
        id: "nav-theme",
        label: theme === "dark" ? "Switch to Warm Light Theme" : "Switch to Moonlit Night Theme",
        icon:
          theme === "dark" ? (
            <LightModeOutlinedIcon fontSize="small" className="text-primary" />
          ) : (
            <DarkModeOutlinedIcon fontSize="small" className="text-primary" />
          ),
        path: "#toggle-theme",
      },
    ]

    if (!query) return navItems

    const q = query.toLowerCase().trim()
    const matchingNav = navItems.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        (n.id === "nav-theme" &&
          ("theme".includes(q) || "mode".includes(q) || "dark".includes(q) || "light".includes(q)))
    )

    const itemOptions: PaletteOption[] = displayItems.map((item) => ({
      type: "item",
      id: item.id,
      item,
      path: `/${item.type === "series" ? "series" : item.type === "book" ? "books" : item.type === "recipe" ? "recipes" : "movies"}/${item.id}`,
    }))

    return [...matchingNav, ...itemOptions]
  }, [query, displayItems, theme])

  const handleNavigate = (path: string) => {
    setIsOpen(false)
    if (path === "#toggle-theme") {
      toggleTheme()
      return
    }
    router.push(path)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, Math.max(options.length - 1, 0)))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const selectedOption = options[selectedIndex]
      if (selectedOption) handleNavigate(selectedOption.path)
    }
  }

  if (!isOpen || !isMounted) return null

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false)
      }}
      className="animate-fade-in fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-4 dark:bg-black/75"
    >
      <div className="bg-surface border-border flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl">
        {/* Header */}
        <div className="border-border bg-surface border-b p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <h2 className="font-display text-foreground text-base font-semibold tracking-tight sm:text-lg">
                Search Vault
              </h2>
              <span className="font-handwriting text-accent text-sm select-none">quick search</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary bg-primary/10 border-primary/25 hidden rounded border px-1.5 py-0.5 font-mono text-[10px] select-none sm:inline-block">
                ESC
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-primary hover:bg-surface-elevated cursor-pointer rounded-md p-1 text-xs transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search vault by title, author, director, tag, genre..."
              className="bg-surface border-border hover:border-border-hover text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/40 w-full rounded-xl border py-2.5 pr-8 pl-9 text-sm transition-all focus:ring-2 focus:outline-none"
            />
            <SearchIcon
              className="text-muted absolute top-1/2 left-3 -translate-y-1/2"
              sx={{ fontSize: 18 }}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setActiveType("all")
                  setSelectedIndex(0)
                  inputRef.current?.focus()
                }}
                className="text-muted hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1 text-xs"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          {query.trim() && !isLoading && filteredItems.length > 0 && (
            <div className="border-border-subtle custom-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto border-t pt-2.5">
              {(["all", "movie", "series", "book", "recipe"] as const).map((t) => {
                const count = typeCounts[t]
                if (t !== "all" && count === 0) return null
                const isActive = activeType === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setActiveType(t)
                      setSelectedIndex(0)
                    }}
                    className={`shrink-0 cursor-pointer rounded-md border px-2.5 py-1 font-mono text-[11px] transition-all ${
                      isActive
                        ? "bg-primary text-primary-fg border-primary font-semibold shadow-xs"
                        : "bg-surface-elevated text-primary/80 hover:text-primary border-primary/25 hover:border-primary"
                    }`}
                  >
                    {t === "all" ? "All" : TYPE_LABELS[t]} ({count})
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Results Body */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-2">
          {!query && (
            <div className="text-muted px-3 py-1.5 font-mono text-[11px] font-semibold tracking-wider uppercase">
              Quick Navigation
            </div>
          )}

          {query && !isLoading && displayItems.length > 0 && (
            <div className="text-muted flex items-center justify-between px-3 py-1.5 font-mono text-[11px] font-semibold tracking-wider uppercase">
              <span>Vault Matches</span>
              <span className="text-[10px] font-normal lowercase">
                {displayItems.length} {displayItems.length === 1 ? "item" : "items"}
              </span>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col gap-2 p-3">
              <div className="text-muted animate-pulse px-1 font-mono text-[11px]">
                Loading vault collection...
              </div>
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="border-primary/20 bg-primary/5 flex animate-pulse items-center gap-3 rounded-lg border p-2.5"
                >
                  <div className="bg-primary/10 h-14 w-10 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-primary/10 h-3.5 w-1/3 rounded" />
                    <div className="bg-primary/10 h-2.5 w-1/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && query && displayItems.length === 0 && (
            <div className="animate-fade-in flex flex-col items-center justify-center px-4 py-12 text-center">
              <div className="bg-surface-elevated border-border text-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full border">
                <SearchIcon sx={{ fontSize: 22, opacity: 0.6 }} />
              </div>
              <p className="text-foreground mb-1 text-sm font-medium">No items found in vault</p>
              <p className="text-muted mb-4 max-w-xs text-xs">
                No vault items match &ldquo;{query}&rdquo;
                {activeType !== "all" ? ` under ${TYPE_LABELS[activeType]}` : ""}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  triggerAddMedia({ query, type: activeType !== "all" ? activeType : undefined })
                }}
                className="bg-primary text-primary-fg cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold shadow-sm transition-opacity hover:opacity-90"
              >
                + Search external media to add &ldquo;{query}&rdquo;
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {options.map((opt, idx) => {
              const isSelected = idx === selectedIndex
              if (opt.type === "nav") {
                return (
                  <PaletteNavAction
                    key={opt.id}
                    icon={opt.icon}
                    label={opt.label}
                    isSelected={isSelected}
                    onClick={() => handleNavigate(opt.path)}
                  />
                )
              }
              return (
                <PaletteItemAction
                  key={opt.item.id}
                  item={opt.item}
                  query={query}
                  isSelected={isSelected}
                  onClick={() => handleNavigate(opt.path)}
                />
              )
            })}
          </div>
        </div>

        {/* Footer Toolbar */}
        <div className="border-border bg-surface-elevated/40 text-muted flex items-center justify-between border-t px-4 py-2 font-mono text-[11px] select-none">
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1 sm:flex">
              <kbd className="bg-primary/10 text-primary border-primary/25 rounded border px-1.5 py-0.5 text-[10px]">
                ↑
              </kbd>
              <kbd className="bg-primary/10 text-primary border-primary/25 rounded border px-1.5 py-0.5 text-[10px]">
                ↓
              </kbd>
              <span className="ml-0.5 text-[10px]">navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-primary/10 text-primary border-primary/25 rounded border px-1.5 py-0.5 text-[10px]">
                ↵
              </kbd>
              <span className="ml-0.5 text-[10px]">open</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-primary/10 text-primary border-primary/25 rounded border px-1.5 py-0.5 text-[10px]">
                esc
              </kbd>
              <span className="ml-0.5 text-[10px]">close</span>
            </span>
          </div>
          <div className="text-[10px]">
            {query ? `${filteredItems.length} found` : "Moonlit Violet Vault"}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function PaletteNavAction({
  icon,
  label,
  isSelected,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  isSelected: boolean
  onClick: () => void
}) {
  const ref = useAutoScroll(isSelected)

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-center justify-between rounded-lg border p-2.5 text-left transition-colors ${
        isSelected
          ? "bg-surface-elevated border-primary/35"
          : "hover:bg-surface-elevated/70 border-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`border-border flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
            isSelected
              ? "bg-primary/20 text-primary"
              : "bg-surface-elevated text-primary group-hover:bg-surface group-hover:text-accent"
          }`}
        >
          {icon}
        </div>
        <span
          className={`text-xs font-medium transition-colors ${isSelected ? "text-primary font-semibold" : "text-foreground"}`}
        >
          {label}
        </span>
      </div>
      <span
        className={`font-mono text-[10px] transition-opacity ${isSelected ? "text-primary opacity-100" : "text-muted opacity-0 group-hover:opacity-100"}`}
      >
        ↵
      </span>
    </button>
  )
}

function PaletteItemAction({
  item,
  query,
  isSelected,
  onClick,
}: {
  item: MediaItem
  query: string
  isSelected: boolean
  onClick: () => void
}) {
  const ref = useAutoScroll(isSelected)

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-center justify-between rounded-lg border p-2.5 text-left transition-colors ${
        isSelected
          ? "bg-surface-elevated border-primary/40 shadow-xs"
          : "hover:bg-surface-elevated/70 border-transparent"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="bg-surface-elevated border-border relative flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border">
          {item.cover_url ? (
            <Image
              src={item.cover_url}
              alt={item.title}
              fill
              sizes="40px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-primary">
              {item.type === "series" ? (
                <TvIcon sx={{ fontSize: 20 }} />
              ) : item.type === "book" ? (
                <MenuBookIcon sx={{ fontSize: 20 }} />
              ) : item.type === "recipe" ? (
                <RestaurantMenuIcon sx={{ fontSize: 20 }} />
              ) : (
                <MovieIcon sx={{ fontSize: 20 }} />
              )}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={`truncate text-sm font-medium transition-colors ${
                isSelected
                  ? "text-primary font-semibold"
                  : "text-foreground group-hover:text-primary"
              }`}
            >
              {highlightMatch(item.title, query)}
            </h3>
            <span
              className={`inline-flex h-4 shrink-0 items-center justify-center rounded border px-1.5 text-[9px] leading-none font-semibold tracking-wider ${
                TYPE_COLORS[item.type] ?? "bg-primary/10 text-primary border-primary/20"
              }`}
            >
              {TYPE_LABELS[item.type]}
            </span>
            {item.is_favorite && (
              <span
                className="text-primary shrink-0 text-xs select-none dark:text-purple-400"
                title="Favorite"
              >
                ♥
              </span>
            )}
          </div>

          <div className="text-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px]">
            {item.release_year && <span>{item.release_year}</span>}
            {(item.author || item.director) && (
              <span className="max-w-[140px] truncate sm:max-w-[200px]">
                {item.author || item.director}
              </span>
            )}
            {item.status && (
              <>
                <span className="opacity-40">•</span>
                <span
                  className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] leading-none font-medium ${STATUS_COLORS[item.status]}`}
                >
                  {STATUS_LABELS[item.status]}
                </span>
              </>
            )}
            {item.user_rating != null && (
              <>
                <span className="opacity-40">•</span>
                <span className="text-primary text-[10px] font-semibold">★ {item.user_rating}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 pl-2">
        <span
          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] transition-all ${
            isSelected
              ? "bg-primary/10 text-primary border-primary/25 border opacity-100"
              : "text-muted opacity-0 group-hover:opacity-100"
          }`}
        >
          <span className="hidden sm:inline">Open</span>
          <span>↵</span>
        </span>
      </div>
    </button>
  )
}
