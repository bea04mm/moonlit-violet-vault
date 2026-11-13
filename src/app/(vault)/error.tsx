/**
 * Vault-scoped error boundary (Next.js `error.tsx` convention).
 * Catches runtime errors inside the `(vault)` route group and shows a friendly
 * recovery UI with an error digest and a "Try again" button.
 * Logs the error to the console for debugging purposes.
 *
 * @packageDocumentation
 */
"use client"

import { useEffect } from "react"
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
  useEffect(() => {
    console.error("[VaultError]", error)
  }, [error])

  return (
    <div className="animate-fade-in flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10">
        <ErrorOutlinedIcon sx={{ fontSize: 24 }} className="text-rose-500" />
      </div>
      <div className="space-y-1">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted max-w-sm text-xs">
          {error.digest
            ? `Error ID: ${error.digest}`
            : "An unexpected error occurred while loading."}
        </p>
      </div>
      <button
        onClick={() => unstable_retry()}
        className="bg-surface-elevated border-border text-foreground hover:bg-surface hover:border-primary hover:text-primary flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-colors"
      >
        <RefreshIcon fontSize="small" />
        Try again
      </button>
    </div>
  )
}
