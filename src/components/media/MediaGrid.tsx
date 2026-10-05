/**
 * Responsive grid that renders a list of MediaCard components with framer-motion
 * enter/exit animations. Displays an empty-state illustration when the list is empty.
 * Client component because Framer Motion's AnimatePresence requires a client context.
 * Syncs its internal state with incoming props to stay up-to-date after server revalidation.
 * 
 * @packageDocumentation
 */
"use client";

import { useState, useEffect } from "react";
import type { MediaItem } from "@/lib/supabase/database.types";
import { MediaCard } from "./MediaCard";
import NightlightIcon from "@mui/icons-material/Nightlight";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Props for the MediaGrid component.
 */
export interface MediaGridProps {
  items: MediaItem[];
  /**
   * Message shown when the filtered list is empty.
   */
  emptyMessage?: string;
}

/**
 * Responsive grid layout for media cards.
 * RSC converted to Client Component for Drag & Drop
 */
export function MediaGrid({
  items: initialItems,
  emptyMessage = "Nothing here yet. Start adding to my vault!",
}: MediaGridProps) {
  const [items, setItems] = useState(initialItems);

  // Sync state if props change from server
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4">
          <NightlightIcon sx={{ fontSize: 48, color: "var(--color-violet-500)", opacity: 0.5 }} />
        </div>
        <p
          className="text-sm max-w-xs"
          style={{ color: "var(--color-lunar-500)" }}
        >
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
  );
}
