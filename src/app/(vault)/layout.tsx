/**
 * Shared layout for all authenticated vault pages (the `(vault)` route group).
 * Renders: AutoSyncTrigger (background series sync), Navbar, main content area,
 * AddMediaButton (floating FAB), and the Sonner Toaster for notifications.
 * All pages inside `(vault)/` inherit this layout automatically.
 * 
 * @packageDocumentation
 */
import { Navbar } from "@/components/layout/Navbar";
import { AutoSyncTrigger } from "@/components/layout/AutoSyncTrigger";
import { AddMediaButton } from "@/components/media/AddMediaButton";
import { Toaster } from "sonner";

/**
 * Shared layout for all protected vault routes (dashboard, movies, series, books).
 * Uses a route group (vault) to share the navbar without it appearing on /login.
 */
export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AutoSyncTrigger />
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
      <AddMediaButton />
      <Toaster 
        theme="dark" 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: "color-mix(in srgb, var(--color-lunar-900) 80%, transparent)",
            backdropFilter: "blur(12px)",
            border: "1px solid color-mix(in srgb, var(--color-violet-500) 20%, transparent)",
            color: "var(--color-lunar-100)",
          },
        }} 
      />
    </div>
  );
}
