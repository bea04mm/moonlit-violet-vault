/**
 * Custom 404 page — shown when Next.js cannot match any route.
 * Renders a themed "lost in the cosmos" message with a link back to the vault dashboard.
 *
 * @packageDocumentation
 */
"use client"

import Link from "next/link"
import NightlightIcon from "@mui/icons-material/Nightlight"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

/**
 * Renders the 404 Not Found page component.
 * Displays a themed cosmic error message and provides a navigation link back to the home page.
 *
 * @returns The JSX element representing the 404 error page.
 */
export default function NotFound() {
  return (
    <div className="animate-fade-in bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 text-center">
      <div className="relative z-10 flex max-w-sm flex-col items-center">
        <div className="bg-surface border-border text-primary mb-6 flex h-16 w-16 items-center justify-center rounded-xl border">
          <NightlightIcon sx={{ fontSize: 32 }} />
        </div>

        <div className="mb-2 flex items-baseline gap-2">
          <h1 className="font-display text-foreground text-4xl font-semibold tracking-tight">
            404
          </h1>
          <span className="font-handwriting text-accent text-lg select-none">lost page</span>
        </div>

        <h2 className="text-foreground mb-2 text-sm font-semibold">Item not found in vault</h2>

        <p className="text-muted mb-8 text-xs leading-relaxed">
          The requested page or record could not be found in your catalog.
        </p>

        <Link
          href="/"
          className="bg-primary text-primary-fg flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-all hover:opacity-90"
        >
          <ArrowBackIcon fontSize="small" />
          Back to Vault
        </Link>
      </div>
    </div>
  )
}
