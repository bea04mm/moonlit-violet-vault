/**
 * A tiny reusable pill-shaped badge component for status indicators, genres, etc.
 *
 * @packageDocumentation
 */
import type { ReactNode } from "react"

/**
 * The properties available to customize a Badge element.
 */
export interface BadgeProps {
  children: ReactNode
  className?: string
  variant?: "default" | "violet" | "blossom" | "starlight" | "muted" | "glass"
}

/**
 * Tailwind classes mapped to specific visual variants.
 */
const VARIANT_STYLES: Record<string, string> = {
  default: "bg-primary/20 text-primary border-primary/35",
  violet: "bg-primary/25 text-primary border-primary/40",
  blossom: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30",
  starlight: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  muted: "bg-primary/10 text-primary border-primary/25",
  glass: "bg-surface/90 text-foreground border border-border backdrop-blur-sm",
}

/**
 * Primitive badge component — used for status labels, genres, media types.
 */
export function Badge({ children, className = "", variant }: BadgeProps) {
  const variantClass = variant ? VARIANT_STYLES[variant] : className ? "" : VARIANT_STYLES.default
  return (
    <span
      className={`inline-flex h-6 items-center justify-center rounded-md border px-2.5 text-xs leading-none font-semibold shadow-xs ${variantClass} ${className}`}
    >
      {children}
    </span>
  )
}
