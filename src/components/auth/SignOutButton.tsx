// src/components/auth/SignOutButton.tsx
// Client component — needs 'use client' because it calls Supabase browser client
// and uses router.refresh() after sign-out.

"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      id="sign-out-btn"
      onClick={handleSignOut}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150"
      style={{ color: "var(--color-lunar-500)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.color =
          "var(--color-blossom-400)";
        (e.currentTarget as HTMLElement).style.background =
          "color-mix(in srgb, var(--color-blossom-500) 8%, transparent)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = "var(--color-lunar-500)";
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
      aria-label="Sign out"
    >
      <SignOutIcon />
      <span className="hidden md:block">Sign out</span>
    </button>
  );
}

function SignOutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
