/**
 * Sticky top navigation bar for the Moonlit Violet Vault.
 * Includes the vault logo, desktop nav links, mobile scrollable nav row,
 * a search button that opens the Command Palette (Ctrl+K), theme toggle, and the sign-out button.
 * Active route highlighting uses Next.js `usePathname`.
 *
 * @packageDocumentation
 */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton } from "@/components/auth/SignOutButton"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import MovieIcon from "@mui/icons-material/Movie"
import TvIcon from "@mui/icons-material/Tv"
import HubIcon from "@mui/icons-material/Hub"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import BarChartIcon from "@mui/icons-material/BarChart"
import NightlightIcon from "@mui/icons-material/Nightlight"
import SearchIcon from "@mui/icons-material/Search"

/**
 * All primary navigation destinations in the vault.
 * Rendered as a horizontal list on desktop and a scrollable row on mobile.
 * All icons use the unified primary violet vault theme.
 */
const NAV_LINKS = [
  { href: "/movies", label: "Movies", icon: <MovieIcon sx={{ fontSize: 17 }} /> },
  { href: "/series", label: "Series", icon: <TvIcon sx={{ fontSize: 17 }} /> },
  { href: "/franchises", label: "Franchises", icon: <HubIcon sx={{ fontSize: 17 }} /> },
  { href: "/books", label: "Books", icon: <MenuBookIcon sx={{ fontSize: 17 }} /> },
  { href: "/recipes", label: "Recipes", icon: <RestaurantMenuIcon sx={{ fontSize: 17 }} /> },
  { href: "/import", label: "Import", icon: <FileUploadIcon sx={{ fontSize: 17 }} /> },
  { href: "/analytics", label: "Analytics", icon: <BarChartIcon sx={{ fontSize: 17 }} /> },
]

/**
 * Top navigation bar — client component because it reads `usePathname`
 * for active link highlighting and dispatches keyboard events to open the
 * Command Palette from the search button.
 */
export function Navbar() {
  /**
   * The current active pathname from Next.js, used to highlight the active tab.
   */
  const pathname = usePathname()

  /**
   * Programmatically dispatches a simulated Ctrl+K event to trigger the command palette overlay.
   */
  const triggerCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
      })
    )
  }

  return (
    <header className="border-border bg-background/90 sticky top-0 z-40 flex flex-col border-b backdrop-blur-md">
      <nav
        className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4 sm:px-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 transition-opacity hover:opacity-90"
        >
          <NightlightIcon
            sx={{ fontSize: 20 }}
            className="text-primary shrink-0 transition-transform group-hover:-rotate-12"
          />
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-foreground group-hover:text-primary text-base font-semibold tracking-tight transition-colors sm:text-lg">
              Moonlit Violet Vault
            </span>
            <span className="font-handwriting text-accent hidden -rotate-2 text-sm font-normal select-none xl:inline">
              journal
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="ml-2 hidden items-center gap-1 lg:flex xl:ml-4 xl:gap-1.5" role="list">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  className={`group flex h-8 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all xl:gap-2 xl:px-3 xl:py-1.5 xl:text-[13px] ${
                    isActive
                      ? "text-primary bg-primary/12 border-primary/30 border font-medium shadow-2xs"
                      : "text-muted hover:text-foreground hover:bg-surface-elevated/70 border border-transparent"
                  }`}
                >
                  <span
                    className={`shrink-0 transition-colors ${isActive ? "text-primary" : "text-primary/75 group-hover:text-primary"}`}
                  >
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Right Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Desktop Search Button */}
          <button
            onClick={triggerCommandPalette}
            className="bg-surface/70 hover:bg-surface border-border hover:border-primary/40 text-muted hover:text-foreground group hidden h-8 cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 text-xs shadow-2xs transition-all lg:flex xl:px-3 xl:text-[13px]"
          >
            <div className="flex items-center gap-1.5">
              <SearchIcon
                sx={{ fontSize: 17 }}
                className="text-primary group-hover:text-primary-hover transition-colors"
              />
              <span className="hidden xl:inline">Search vault...</span>
            </div>
            <kbd className="bg-primary/10 text-primary border-primary/25 hidden items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] xl:inline-flex">
              CTRL K
            </kbd>
          </button>

          {/* Mobile Search Icon */}
          <button
            type="button"
            onClick={triggerCommandPalette}
            aria-label="Search vault"
            className="bg-surface/70 border-border text-primary hover:text-primary-hover hover:border-primary/40 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border shadow-2xs transition-all lg:hidden"
          >
            <SearchIcon sx={{ fontSize: 17 }} />
          </button>

          <ThemeToggle />
          <SignOutButton />
        </div>
      </nav>

      {/* Mobile Nav Links Row */}
      <div className="border-border-subtle custom-scrollbar flex items-center justify-start gap-1 overflow-x-auto border-t px-2 py-1.5 lg:hidden">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1 text-[12px] font-medium transition-all ${
                isActive
                  ? "text-primary bg-primary/12 border-primary/30 border"
                  : "text-muted hover:text-foreground border border-transparent"
              }`}
            >
              <span className={`shrink-0 ${isActive ? "text-primary" : "text-primary/75"}`}>
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          )
        })}
      </div>
    </header>
  )
}
