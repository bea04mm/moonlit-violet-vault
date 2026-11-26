/**
 * Responsive vault navigation shell: sticky collapsible desktop sidebar + mobile slide-over drawer.
 * Houses primary library links, utility routes, Command Palette trigger, theme toggle, and sign-out.
 *
 * @packageDocumentation
 */
"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton } from "@/components/auth/SignOutButton"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { VaultTooltip } from "@/components/ui/VaultTooltip"
import MovieIcon from "@mui/icons-material/Movie"
import TvIcon from "@mui/icons-material/Tv"
import HubIcon from "@mui/icons-material/Hub"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import BarChartIcon from "@mui/icons-material/BarChart"
import NightlightIcon from "@mui/icons-material/Nightlight"
import SearchIcon from "@mui/icons-material/Search"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft"
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight"

const SIDEBAR_STORAGE_KEY = "vault-sidebar-collapsed"
const SIDEBAR_CHANGE_EVENT = "vault-sidebar-change"

const NAV_SECTIONS = [
  {
    label: "Vault",
    items: [
      { href: "/movies", label: "Movies", icon: MovieIcon },
      { href: "/series", label: "Series", icon: TvIcon },
      { href: "/franchises", label: "Franchises", icon: HubIcon },
      { href: "/books", label: "Books", icon: MenuBookIcon },
      { href: "/recipes", label: "Recipes", icon: RestaurantMenuIcon },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChartIcon },
      { href: "/import", label: "Import", icon: FileUploadIcon },
    ],
  },
] as const

function subscribeSidebar(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(SIDEBAR_CHANGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, onStoreChange)
  }
}

function getSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

function VaultBrand({
  collapsed = false,
  showTooltip = false,
  onClick,
}: {
  collapsed?: boolean
  showTooltip?: boolean
  onClick?: () => void
}) {
  return (
    <VaultTooltip label="Moonlit Violet Vault" enabled={showTooltip} placement="right" desktopOnly>
      <Link
        href="/"
        onClick={onClick}
        aria-label={collapsed ? "Moonlit Violet Vault" : undefined}
        className={`group flex items-center gap-2 transition-opacity hover:opacity-90 ${
          collapsed
            ? "lg:hover:bg-surface-elevated/70 min-w-0 lg:h-9 lg:w-9 lg:justify-center lg:rounded-lg"
            : "min-w-0"
        }`}
      >
        <NightlightIcon
          sx={{ fontSize: 20 }}
          className="text-primary shrink-0 transition-transform group-hover:-rotate-12"
        />
        <div className={`min-w-0 leading-tight ${collapsed ? "lg:hidden" : ""}`}>
          <span className="font-display text-foreground group-hover:text-primary block truncate text-[15px] font-semibold tracking-tight transition-colors">
            Moonlit Violet Vault
          </span>
          <span className="font-handwriting text-accent -mt-0.5 block -rotate-1 text-sm leading-none font-normal select-none">
            journal
          </span>
        </div>
      </Link>
    </VaultTooltip>
  )
}

/**
 * Collapsible desktop rail and mobile drawer navigation for all `(vault)` pages.
 */
export function Sidebar() {
  const pathname = usePathname()
  const collapsed = useSyncExternalStore(subscribeSidebar, getSidebarCollapsed, () => false)
  const [openAtPath, setOpenAtPath] = useState<string | null>(null)
  const mobileOpen = openAtPath === pathname

  useEffect(() => {
    if (!mobileOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenAtPath(null)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mobileOpen])

  const closeMobile = () => setOpenAtPath(null)

  const toggleCollapsed = () => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!collapsed))
      window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT))
    } catch {}
  }

  const openCommandPalette = () => {
    closeMobile()
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="border-border bg-background/90 sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b px-4 backdrop-blur-md lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => setOpenAtPath(pathname)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="vault-sidebar"
            className="bg-surface/70 hover:bg-surface border-border hover:border-primary/40 text-primary flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border shadow-2xs transition-all"
          >
            <MenuIcon sx={{ fontSize: 18 }} className="text-primary" />
          </button>

          <VaultBrand />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <VaultTooltip label="Search vault (Ctrl+K)" placement="bottom">
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Search vault"
              className="bg-surface/70 hover:bg-surface border-border hover:border-primary/40 text-primary flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border shadow-2xs transition-all"
            >
              <SearchIcon sx={{ fontSize: 17 }} className="text-primary" />
            </button>
          </VaultTooltip>
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        onClick={closeMobile}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-xs transition-opacity duration-200 lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Shared Sidebar (Mobile Slide-Over Drawer + Sticky Collapsible Desktop Rail) */}
      <aside
        id="vault-sidebar"
        aria-label="Vault navigation"
        className={`border-border bg-surface/95 lg:bg-surface/75 fixed top-0 bottom-0 left-0 z-40 flex h-dvh w-72 max-w-[85vw] shrink-0 flex-col border-r backdrop-blur-md transition-[transform,width] duration-200 ease-out lg:sticky lg:top-0 lg:bottom-auto lg:left-auto lg:z-30 lg:h-screen lg:max-w-none ${
          mobileOpen
            ? "visible translate-x-0 shadow-2xl"
            : "invisible -translate-x-full lg:visible lg:translate-x-0 lg:shadow-none"
        } ${collapsed ? "lg:w-16" : "lg:w-60"}`}
      >
        {/* Header: Brand & Toggle */}
        <div
          className={`border-border-subtle flex shrink-0 items-center border-b px-3 ${
            collapsed
              ? "h-14 justify-between gap-2 lg:h-auto lg:flex-col lg:justify-center lg:gap-2 lg:py-3"
              : "h-14 justify-between gap-2"
          }`}
        >
          <VaultBrand collapsed={collapsed} showTooltip={collapsed} onClick={closeMobile} />

          <VaultTooltip
            label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            placement="right"
            desktopOnly
          >
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              className="text-muted hover:text-primary hover:bg-surface-elevated/80 group hidden h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors lg:flex"
            >
              {collapsed ? (
                <KeyboardDoubleArrowRightIcon sx={{ fontSize: 17 }} className="text-primary" />
              ) : (
                <KeyboardDoubleArrowLeftIcon
                  sx={{ fontSize: 17 }}
                  className="text-muted group-hover:text-primary transition-colors"
                />
              )}
            </button>
          </VaultTooltip>

          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation menu"
            className="text-muted hover:text-primary hover:bg-surface-elevated/80 group flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors lg:hidden"
          >
            <CloseIcon
              sx={{ fontSize: 18 }}
              className="text-muted group-hover:text-primary transition-colors"
            />
          </button>
        </div>

        {/* Search Trigger */}
        <div className={`px-2.5 pt-3 pb-1 ${collapsed ? "lg:flex lg:justify-center lg:px-0" : ""}`}>
          <VaultTooltip
            label="Search vault (Ctrl+K)"
            enabled={collapsed}
            placement="right"
            desktopOnly
          >
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Search vault"
              className={`bg-background/60 hover:bg-surface-elevated border-border hover:border-primary/40 text-muted hover:text-foreground group flex h-9 cursor-pointer items-center rounded-lg border text-xs shadow-2xs transition-all ${
                collapsed
                  ? "w-full justify-between px-2.5 lg:w-9 lg:justify-center lg:px-0"
                  : "w-full justify-between px-2.5"
              }`}
            >
              <span className="flex items-center gap-2">
                <SearchIcon
                  sx={{ fontSize: 17 }}
                  className="text-primary group-hover:text-primary-hover shrink-0 transition-colors"
                />
                <span className={collapsed ? "lg:hidden" : ""}>Search vault...</span>
              </span>
              <kbd
                className={`bg-primary/10 text-primary border-primary/25 rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                  collapsed ? "lg:hidden" : ""
                }`}
              >
                CTRL K
              </kbd>
            </button>
          </VaultTooltip>
        </div>

        {/* Navigation Sections */}
        <nav
          aria-label="Main navigation"
          className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-2.5 py-3"
        >
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.label}>
              {idx > 0 && (
                <div
                  aria-hidden="true"
                  className={`bg-border-subtle mx-auto mb-3 hidden h-px w-6 ${
                    collapsed ? "lg:block" : ""
                  }`}
                />
              )}
              <p
                className={`text-muted/70 px-2.5 pb-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase ${
                  collapsed ? "lg:hidden" : ""
                }`}
              >
                {section.label}
              </p>
              <ul className="space-y-1" role="list">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <li key={item.href}>
                      <VaultTooltip
                        label={item.label}
                        enabled={collapsed}
                        placement="right"
                        desktopOnly
                      >
                        <Link
                          href={item.href}
                          onClick={closeMobile}
                          aria-current={isActive ? "page" : undefined}
                          aria-label={collapsed ? item.label : undefined}
                          className={`group flex h-9 items-center rounded-lg text-[13px] font-medium transition-all ${
                            collapsed
                              ? "gap-2.5 px-2.5 lg:mx-auto lg:w-9 lg:justify-center lg:px-0"
                              : "gap-2.5 px-2.5"
                          } ${
                            isActive
                              ? "text-primary bg-primary/12 border-primary/30 border shadow-2xs"
                              : "text-muted hover:text-foreground hover:bg-surface-elevated/70 border border-transparent"
                          }`}
                        >
                          <Icon
                            sx={{ fontSize: 18 }}
                            className={`shrink-0 transition-colors ${
                              isActive ? "text-primary" : "text-primary/75 group-hover:text-primary"
                            }`}
                          />
                          <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>
                            {item.label}
                          </span>
                        </Link>
                      </VaultTooltip>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="border-border-subtle flex shrink-0 flex-col gap-1 border-t px-2.5 py-2.5">
          <ThemeToggle variant="row" collapsed={collapsed} />
          <SignOutButton collapsed={collapsed} />
        </div>
      </aside>
    </>
  )
}
