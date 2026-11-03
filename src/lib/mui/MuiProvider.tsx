/* eslint-disable react-hooks/set-state-in-effect */
/**
 * Wraps the application with Material UI's ThemeProvider, CssBaseline, LocalizationProvider, and ThemeContext.
 * Manages light and dark theme mode, persisting the user's choice to localStorage.
 * Paper Craft Soft colors are the single consolidated default for badges and graphs.
 *
 * @packageDocumentation
 */
"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { darkTheme, lightTheme } from "./theme"

export type ThemeMode = "dark" | "light"

/**
 * Category color definitions for badges and analytics charts.
 */
export interface BadgeGraphCategoryColors {
  movie: string
  series: string
  book: string
  recipe: string
  completed: string
  inProgress: string
  plan: string
  onHold: string
  dropped: string
}

export interface BadgeGraphThemeConfig {
  dark: BadgeGraphCategoryColors
  light: BadgeGraphCategoryColors
}

/**
 * Consolidated Paper Craft Soft palette for badges and analytics distribution graphs.
 */
export const DEFAULT_BADGE_GRAPH_COLORS: BadgeGraphThemeConfig = {
  dark: {
    movie: "#c084fc", // Soft purple
    series: "#a5b4fc", // Soft indigo
    book: "#5eead4", // Soft teal
    recipe: "#fde047", // Soft yellow / amber
    completed: "#6ee7b7", // Soft mint green
    inProgress: "#f9a8d4", // Soft pink
    plan: "#7dd3fc", // Soft sky blue
    onHold: "#c084fc", // Soft lilac / orchid
    dropped: "#fda4af", // Soft rose
  },
  light: {
    movie: "#9333ea", // Paper craft purple
    series: "#4f46e5", // Paper craft indigo
    book: "#0d9488", // Paper craft teal
    recipe: "#ca8a04", // Paper craft amber
    completed: "#059669", // Paper craft emerald
    inProgress: "#db2777", // Paper craft berry
    plan: "#0284c7", // Paper craft sky
    onHold: "#6b21a8", // Paper craft plum
    dropped: "#e11d48", // Paper craft crimson
  },
}

export interface ThemeContextValue {
  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
  badgeGraphColors: BadgeGraphThemeConfig
  getCategoryColor: (category: string) => string
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
  badgeGraphColors: DEFAULT_BADGE_GRAPH_COLORS,
  getCategoryColor: () => "#c084fc",
})

/**
 * Hook to access current theme mode and category colors.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

/**
 * Global MUI provider — injects the vault colour theme and CSS reset.
 * Wrap the entire app with this so MUI dialogs, tooltips, and portals
 * all inherit the correct dark/light palette.
 */
export default function MuiProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark")

  const syncThemeToDocument = useCallback((mode: ThemeMode) => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    root.setAttribute("data-theme", mode)
    root.classList.remove("light", "dark")
    root.classList.add(mode)
    root.removeAttribute("style")
  }, [])

  // Initialize theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("vault-theme") as ThemeMode | null
      const initialTheme: ThemeMode =
        savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark"

      setThemeState(initialTheme)
      syncThemeToDocument(initialTheme)
    } catch {}
  }, [syncThemeToDocument])

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode)
    try {
      localStorage.setItem("vault-theme", mode)
    } catch {}
    syncThemeToDocument(mode)
  }

  const toggleTheme = () => {
    const nextMode: ThemeMode = theme === "dark" ? "light" : "dark"
    setTheme(nextMode)
  }

  /**
   * Resolves the active hex color for any given category string based on active theme mode (Paper Craft Soft).
   */
  const getCategoryColor = useCallback(
    (category: string): string => {
      const cat = category.toLowerCase().replace(/[^a-z]/g, "")
      const active = DEFAULT_BADGE_GRAPH_COLORS[theme]
      if (cat.includes("movie")) return active.movie
      if (cat.includes("series")) return active.series
      if (cat.includes("book")) return active.book
      if (cat.includes("recipe")) return active.recipe
      if (
        cat.includes("complete") ||
        (cat.includes("watch") && !cat.includes("plan")) ||
        (cat.includes("cook") && !cat.includes("plan"))
      )
        return active.completed
      if (cat.includes("progress") || cat.includes("ing")) return active.inProgress
      if (cat.includes("plan") || cat.includes("want")) return active.plan
      if (cat.includes("hold") || cat.includes("drop"))
        return cat.includes("drop") ? active.dropped : active.onHold
      return active.movie
    },
    [theme]
  )

  const activeMuiTheme = useMemo(() => {
    return theme === "light" ? lightTheme : darkTheme
  }, [theme])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        badgeGraphColors: DEFAULT_BADGE_GRAPH_COLORS,
        getCategoryColor,
      }}
    >
      <ThemeProvider theme={activeMuiTheme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
