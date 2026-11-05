/**
 * Shared layout for all authenticated vault pages (the `(vault)` route group).
 * Renders: AutoSyncTrigger (background series sync), Navbar, main content area,
 * AddMediaButton (floating FAB), and the Sonner Toaster for notifications.
 * All pages inside `(vault)/` inherit this layout automatically.
 *
 * @packageDocumentation
 */
import { Navbar } from "@/components/layout/Navbar"
import { AutoSyncTrigger } from "@/components/layout/AutoSyncTrigger"
import { BackToTopButton } from "@/components/layout/BackToTopButton"
import { AddMediaButton } from "@/components/media/AddMediaButton"
import { Toaster } from "sonner"

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <AutoSyncTrigger />
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-4 pb-28 sm:px-6 sm:py-8">
        {children}
      </main>
      <BackToTopButton />
      <AddMediaButton />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
            borderRadius: "0.75rem",
          },
        }}
      />
    </div>
  )
}
