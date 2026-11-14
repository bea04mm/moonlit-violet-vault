/**
 * Vault-scoped error boundary (Next.js `error.tsx` convention).
 * Catches runtime errors inside the `(vault)` route group and shows a friendly
 * recovery UI with an error digest and a "Try again" button.
 * Logs the error to the console for debugging purposes.
 *
 * @packageDocumentation
 */
"use client"

import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined"
import RefreshIcon from "@mui/icons-material/Refresh"

/**
 * Error boundary for all vault routes — catches DB failures, network errors, etc.
 */
export default function VaultError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="animate-fade-in bg-background relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden p-6 text-center">
      <div className="relative z-10 flex max-w-sm flex-col items-center">
        <div className="bg-surface border-border mb-6 flex h-16 w-16 items-center justify-center rounded-xl border text-rose-500 shadow-xs dark:text-rose-400">
          <ErrorOutlinedIcon
            sx={{ fontSize: 32, color: "#f43f5e !important", fill: "#f43f5e !important" }}
          />
        </div>

        <div className="mb-2 flex items-baseline gap-2">
          <h1 className="font-display text-foreground text-4xl font-semibold tracking-tight">
            500
          </h1>
          <span className="font-handwriting text-accent text-lg select-none">system glitch</span>
        </div>

        <h2 className="text-foreground mb-2 text-sm font-semibold">Something went wrong</h2>

        <p className="text-muted mb-8 text-xs leading-relaxed">
          {error.digest
            ? `The vault ran into a hiccup (Error ID: ${error.digest}). Please try again.`
            : "An unexpected error occurred while loading this vault resource. Please try again."}
        </p>

        <button
          onClick={() => unstable_retry()}
          className="bg-primary flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90"
        >
          <RefreshIcon
            fontSize="small"
            className="text-white"
            sx={{ color: "#ffffff !important", fill: "#ffffff !important" }}
          />
          Try Again
        </button>
      </div>
    </div>
  )
}
