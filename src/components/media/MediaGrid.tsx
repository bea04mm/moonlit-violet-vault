/**
 * Responsive grid that renders a list of MediaCard components with framer-motion
 * enter/exit animations. Displays an empty-state illustration when the list is empty.
 * Client component because Framer Motion's AnimatePresence requires a client context.
 *
 * @packageDocumentation
 */
"use client"

import type { MediaItem } from "@/lib/supabase/database.types"
import { MediaCard } from "./MediaCard"
import NightlightIcon from "@mui/icons-material/Nightlight"
import { motion, AnimatePresence } from "framer-motion"

/**
 * Props for the MediaGrid component.
 */
export interface MediaGridProps {
  items: MediaItem[]
  /**
   * Message shown when the filtered list is empty.
   */
  emptyMessage?: string
}

/**
 * Responsive grid layout for media cards.
 */
export function MediaGrid({
  items,
  emptyMessage = "Nothing here yet. Start adding to vault!",
}: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4">
          <NightlightIcon sx={{ fontSize: 48 }} className="text-primary/60" />
        </div>
        <p className="text-muted max-w-xs text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <motion.div layout className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <MediaCard item={item} priority={index < 12} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
