/**
 * Public login page — the only page accessible without a valid session.
 * Renders the Google OAuth login button and displays error messages passed
 * via the `?error=` search parameter (e.g. "unauthorised_email").
 * Also shows a feature list to remind me what the vault can do.
 *
 * @packageDocumentation
 */
import type { Metadata } from "next"
import { LoginButton } from "@/components/auth/LoginButton"
import NightlightIcon from "@mui/icons-material/Nightlight"

/**
 * Metadata specifically for the login page, configuring title and description.
 */
export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to access the personal media vault.",
}

/**
 * Interface defining the properties expected by the LoginPage component.
 */
export interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

/**
 * Login page — the only publicly accessible route.
 * Presents a Google OAuth sign-in button with the vault aesthetic.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  /**
   * The resolved search parameters from the Next.js server-side page context.
   */
  const params = await searchParams
  /**
   * The optional error code passed in the query string if an authentication failure occurs.
   */
  const error = params.error

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo / title */}
        <div className="mb-8 text-center">
          <div className="text-primary mb-3 flex justify-center" aria-hidden="true">
            <NightlightIcon sx={{ fontSize: 38 }} />
          </div>
          <div className="mb-1 flex items-baseline justify-center gap-2">
            <h1 className="font-display text-foreground text-2xl font-semibold tracking-tight">
              Moonlit Violet Vault
            </h1>
            <span className="font-handwriting text-accent text-base select-none">
              private sanctuary
            </span>
          </div>
          <p className="text-muted text-xs">Personal media catalog & journal</p>
        </div>

        {/* Card */}
        <div className="bg-surface border-border flex flex-col gap-5 rounded-xl border p-6 shadow-xl sm:p-7">
          <div className="text-center">
            <h2 className="text-foreground mb-1 text-base font-semibold">Sign in to your Vault</h2>
            <p className="text-muted text-xs">Continue with an authorised Google account.</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-600 dark:text-red-400">
              {error === "unauthorized"
                ? "This Google account doesn't have access to the vault."
                : "Sign-in failed. Please try again."}
            </div>
          )}

          <LoginButton />

          <p className="text-muted text-center font-mono text-[11px]">
            Access is restricted to the vault owner.
          </p>
        </div>
      </div>
    </main>
  )
}
