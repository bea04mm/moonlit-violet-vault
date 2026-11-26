/**
 * Dark / light theme toggle button supporting compact icon mode and full sidebar row mode.
 *
 * @packageDocumentation
 */
"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "@/lib/mui/MuiProvider"
import { VaultTooltip } from "@/components/ui/VaultTooltip"
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined"
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined"

const emptySubscribe = () => () => {}

/**
 * Toggles between Dark Craft and Warm Paper Craft Light theme modes.
 */
export function ThemeToggle({
  variant = "icon",
  collapsed = false,
}: {
  variant?: "icon" | "row"
  collapsed?: boolean
}) {
  const { theme, toggleTheme } = useTheme()
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const isRow = variant === "row"

  if (!isMounted) {
    return (
      <div
        className={
          isRow
            ? `h-9 rounded-lg ${collapsed ? "w-full lg:mx-auto lg:w-9" : "w-full"}`
            : "h-8 w-8 rounded-lg"
        }
        aria-hidden="true"
      />
    )
  }

  const isDark = theme === "dark"
  const label = isDark ? "Light mode" : "Dark mode"
  const actionLabel = isDark ? "Switch to light mode" : "Switch to dark mode"
  const Icon = isDark ? LightModeOutlinedIcon : DarkModeOutlinedIcon

  if (isRow) {
    return (
      <VaultTooltip label={label} enabled={collapsed} placement="right" desktopOnly>
        <button
          onClick={toggleTheme}
          type="button"
          aria-label={actionLabel}
          className={`text-muted hover:text-foreground hover:bg-surface-elevated/70 group flex h-9 cursor-pointer items-center rounded-lg border border-transparent text-[13px] font-medium transition-all ${
            collapsed
              ? "w-full gap-2.5 px-2.5 lg:mx-auto lg:w-9 lg:justify-center lg:px-0"
              : "w-full gap-2.5 px-2.5"
          }`}
        >
          <Icon
            sx={{ fontSize: 18 }}
            className="text-primary/75 group-hover:text-primary shrink-0 transition-colors"
          />
          <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>{label}</span>
        </button>
      </VaultTooltip>
    )
  }

  return (
    <VaultTooltip label={actionLabel} placement="bottom">
      <button
        onClick={toggleTheme}
        type="button"
        className="bg-surface/70 hover:bg-surface border-border hover:border-primary/40 text-primary group flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border shadow-2xs transition-all"
        aria-label={actionLabel}
      >
        <Icon
          sx={{ fontSize: 17 }}
          className="text-primary group-hover:text-primary-hover transition-colors"
        />
      </button>
    </VaultTooltip>
  )
}
