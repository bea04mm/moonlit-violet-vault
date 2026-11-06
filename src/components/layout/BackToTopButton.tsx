/**
 * Floating action button that returns the viewport to the top after scrolling.
 *
 * @packageDocumentation
 */
"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"

/**
 * Shows a back-to-top button after the user has scrolled down the page.
 */
export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > 400)
    }

    updateVisibility()
    window.addEventListener("scroll", updateVisibility, { passive: true })
    return () => window.removeEventListener("scroll", updateVisibility)
  }, [])

  const isDetailPage = /^\/(movies|series|books|recipes)\/[^/]+/.test(pathname)

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed ${
        isDetailPage ? "right-5 bottom-5" : "right-4 bottom-18 sm:right-6 sm:bottom-23"
      } border-primary/25 bg-surface-elevated/95 text-primary hover:text-accent hover:border-primary/40 z-50 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border shadow-lg backdrop-blur-md transition-all active:scale-95 sm:h-9 sm:w-9 ${
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={isVisible ? 0 : -1}
    >
      <KeyboardArrowUpIcon fontSize="small" />
    </button>
  )
}
