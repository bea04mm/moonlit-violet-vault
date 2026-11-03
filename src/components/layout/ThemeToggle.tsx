"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "@/lib/mui/MuiProvider"
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined"
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined"

const emptySubscribe = () => () => {}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!isMounted) {
    return <div className="h-8 w-8 rounded-lg" aria-hidden="true" />
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="bg-surface/70 hover:bg-surface border-border hover:border-primary/40 text-primary group flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border shadow-2xs transition-all"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <LightModeOutlinedIcon
          sx={{ fontSize: 17 }}
          className="text-primary group-hover:text-primary-hover transition-colors"
        />
      ) : (
        <DarkModeOutlinedIcon
          sx={{ fontSize: 17 }}
          className="text-primary group-hover:text-primary-hover transition-colors"
        />
      )}
    </button>
  )
}
