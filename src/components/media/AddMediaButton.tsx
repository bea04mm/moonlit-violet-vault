/**
 * Floating action button (FAB) fixed to the bottom-right corner of every vault page.
 * Clicking it opens the AddMediaModal search overlay.
 * The button and modal are co-located here to share a single `isOpen` state.
 *
 * @packageDocumentation
 */
"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { AddMediaModal } from "./AddMediaModal"
import { VaultTooltip } from "@/components/ui/VaultTooltip"
import AddIcon from "@mui/icons-material/Add"

/**
 * Floating "+" button that launches the media search and add workflow.
 * Always visible on vault pages, positioned with `fixed` so it floats above content.
 */
export function AddMediaButton() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener("open-add-media", handleOpen)
    return () => window.removeEventListener("open-add-media", handleOpen)
  }, [])

  const isDetailPage = /^\/(movies|series|books|recipes)\/[^/]+/.test(pathname)

  return (
    <>
      {!isDetailPage && (
        <VaultTooltip label="Add Media" placement="left">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="bg-primary hover:bg-primary-hover shadow-primary/30 border-primary/40 fixed right-4 bottom-4 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border text-white shadow-xl transition-all hover:scale-105 active:scale-95 sm:right-6 sm:bottom-6 sm:h-14 sm:w-14"
            aria-label="Add Media"
          >
            <AddIcon
              sx={{ fontSize: { xs: 24, sm: 28 }, color: "#ffffff" }}
              className="text-white"
            />
          </button>
        </VaultTooltip>
      )}

      {isOpen && <AddMediaModal onClose={() => setIsOpen(false)} />}
    </>
  )
}
