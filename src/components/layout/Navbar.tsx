/**
 * Sticky top navigation bar for the Moonlit Violet Vault.
 * Includes the vault logo, desktop nav links, mobile scrollable nav row,
 * a search button that opens the Command Palette (Ctrl+K), and the sign-out button.
 * Active route highlighting uses Next.js `usePathname`.
 * 
 * @packageDocumentation
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import MovieIcon from "@mui/icons-material/Movie";
import TvIcon from "@mui/icons-material/Tv";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import BarChartIcon from "@mui/icons-material/BarChart";
import NightlightIcon from "@mui/icons-material/Nightlight";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton } from "@mui/material";

/**
 * All primary navigation destinations in the vault.
 * Rendered as a horizontal list on desktop and a scrollable row on mobile.
 */
const NAV_LINKS = [
  { href: "/movies", label: "Movies", icon: <MovieIcon fontSize="small" /> },
  { href: "/series", label: "Series", icon: <TvIcon fontSize="small" /> },
  { href: "/books", label: "Books", icon: <MenuBookIcon fontSize="small" /> },
  { href: "/recipes", label: "Recipes", icon: <RestaurantMenuIcon fontSize="small" /> },
  { href: "/import", label: "Import", icon: <FileUploadIcon fontSize="small" /> },
  { href: "/analytics", label: "Analytics", icon: <BarChartIcon fontSize="small" /> },
];

/**
 * Top navigation bar — client component because it reads `usePathname`
 * for active link highlighting and dispatches keyboard events to open the
 * Command Palette from the search button.
 */
export function Navbar() {
  /**
   * The current active pathname from Next.js, used to highlight the active tab.
   */
  const pathname = usePathname();

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
    );
  };

  return (
    <header
      className="sticky top-0 z-40 border-b flex flex-col"
      style={{
        background: "color-mix(in srgb, var(--color-lunar-950) 85%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: "color-mix(in srgb, var(--color-violet-500) 12%, transparent)",
      }}
    >
      <nav className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center gap-4" aria-label="Main navigation">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-display font-bold text-lg hover:opacity-80 transition-opacity shrink min-w-0"
          style={{
            color: "var(--color-violet-300)",
            fontFamily: "var(--font-display)",
          }}
        >
          <NightlightIcon className="shrink-0" />
          <span className="truncate text-base sm:text-lg">Moonlit Violet Vault</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-violet-300 bg-(--color-violet-500)/10"
                      : "text-lunar-400 hover:text-violet-300 hover:bg-(--color-violet-500)/5"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          {/* Desktop Search Button */}
          <button
            onClick={triggerCommandPalette}
            className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sm text-lunar-500 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 group-hover:text-white transition-colors">
              <SearchIcon fontSize="small" />
              <span>Search vault...</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-bold border border-white/10">
              CTRL K
            </kbd>
          </button>

          {/* Mobile Search Icon */}
          <IconButton 
            onClick={triggerCommandPalette} 
            size="small" 
            sx={{ 
              color: "var(--color-lunar-300)",
              display: { xs: "inline-flex", sm: "none" }
            }}
          >
            <SearchIcon />
          </IconButton>

          <SignOutButton />
        </div>
      </nav>

      {/* Mobile Nav Links Row */}
      <div className="md:hidden border-t border-white/5 px-2 py-1.5 overflow-x-auto custom-scrollbar flex items-center justify-start gap-1">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? "text-violet-300 bg-(--color-violet-500)/10"
                  : "text-lunar-400 hover:text-violet-300 hover:bg-(--color-violet-500)/5"
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
