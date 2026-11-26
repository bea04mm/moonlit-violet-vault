/**
 * Interactive sign-out button that clears the Supabase session.
 *
 * @packageDocumentation
 */
"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { VaultTooltip } from "@/components/ui/VaultTooltip"
import LogoutIcon from "@mui/icons-material/Logout"

/**
 * Client component — calls the Supabase browser client to sign out
 * and redirects to `/login`.
 */
export function SignOutButton({ collapsed = false }: { collapsed?: boolean }) {
  /**
   * Next.js App Router navigation instance.
   */
  const router = useRouter()

  /**
   * Signs the user out via Supabase and redirects them to the login page.
   */
  async function handleSignOut() {
    /**
     * Initialized Supabase client.
     */
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <VaultTooltip label="Sign out" enabled={collapsed} placement="right" desktopOnly>
      <button
        id="sign-out-btn"
        type="button"
        onClick={handleSignOut}
        className={`text-muted group flex h-9 cursor-pointer items-center rounded-lg border border-transparent text-[13px] font-medium transition-all hover:border-rose-500/25 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 ${
          collapsed
            ? "w-full gap-2.5 px-2.5 lg:mx-auto lg:w-9 lg:justify-center lg:px-0"
            : "w-full gap-2.5 px-2.5"
        }`}
        aria-label="Sign out"
      >
        <LogoutIcon
          sx={{ fontSize: 18 }}
          className="text-primary/75 shrink-0 transition-colors group-hover:text-rose-500 dark:group-hover:text-rose-400"
        />
        <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>Sign out</span>
      </button>
    </VaultTooltip>
  )
}
