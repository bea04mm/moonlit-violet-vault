// src/components/media/MediaGrid.tsx
// Responsive grid layout for media cards.
// RSC converted to Client Component for Drag & Drop
"use client";

import { useState, useEffect } from "react";
import type { MediaItem } from "@/lib/supabase/database.types";
import { MediaCard } from "./MediaCard";
import NightlightIcon from "@mui/icons-material/Nightlight";
import { motion, AnimatePresence } from "framer-motion";

interface MediaGridProps {
  items: MediaItem[];
  emptyMessage?: string;
}

export function MediaGrid({
  items: initialItems,
  emptyMessage = "Nothing here yet. Start adding to my vault!",
}: MediaGridProps) {
  const [items, setItems] = useState(initialItems);

  // Sync state if props change from server
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

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
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <MediaCard item={item} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
