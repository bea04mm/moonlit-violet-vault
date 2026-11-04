/**
 * Interactive sign-out button that clears the Supabase session.
 *
 * @packageDocumentation
 */
"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import LogoutIcon from "@mui/icons-material/Logout"

/**
 * Client component — needs 'use client' because it calls Supabase browser client
 * and uses router.refresh() after sign-out.
 */
export function SignOutButton() {
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
    <button
      id="sign-out-btn"
      onClick={handleSignOut}
      className="bg-surface/70 hover:bg-surface border-border text-primary group flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border shadow-2xs transition-all hover:border-rose-500/40 hover:text-rose-500"
      title="Sign out"
      aria-label="Sign out"
    >
      <LogoutIcon sx={{ fontSize: 17 }} className="transition-colors" />
    </button>
  )
}
