// src/components/media/TabbedDashboard.tsx
"use client";

import { useState, useMemo } from "react";
import type { MediaItem, MediaType } from "@/lib/supabase/database.types";
import { MediaGrid } from "./MediaGrid";
import { motion, AnimatePresence } from "framer-motion";

interface TabbedDashboardProps {
  type: MediaType;
  items: MediaItem[];
}

type TabConfig = {
  id: string;
  label: string;
  filterFn: (item: MediaItem) => boolean;
};

export function TabbedDashboard({ type, items }: TabbedDashboardProps) {
  let tabs: TabConfig[] = [];

  if (type === "series") {
    tabs = [
      { id: "watching", label: "Watching", filterFn: (item) => item.status === "watching" },
      { id: "want_to_watch", label: "Want to Watch", filterFn: (item) => item.status === "want_to_watch" },
      { id: "waiting", label: "Waiting", filterFn: (item) => item.status === "watched" && item.tmdb_status === "Returning Series" },
      { id: "ended", label: "Ended", filterFn: (item) => item.status === "watched" && item.tmdb_status !== "Returning Series" },
      { id: "other", label: "Other", filterFn: (item) => ["dropped", "on_hold"].includes(item.status) },
    ];
  } else if (type === "movie") {
    tabs = [
      { id: "want_to_watch", label: "Want to Watch", filterFn: (item) => item.status === "want_to_watch" },
      { id: "watching", label: "Watching", filterFn: (item) => item.status === "watching" },
      { id: "watched", label: "Watched", filterFn: (item) => item.status === "watched" },
      { id: "other", label: "Other", filterFn: (item) => ["dropped", "on_hold"].includes(item.status) },
    ];
  } else if (type === "book") {
    tabs = [
      { id: "reading", label: "Reading", filterFn: (item) => item.status === "reading" },
      { id: "want_to_read", label: "Want to Read", filterFn: (item) => item.status === "want_to_read" },
      { id: "read", label: "Read", filterFn: (item) => item.status === "read" },
      { id: "other", label: "Other", filterFn: (item) => ["dropped", "on_hold"].includes(item.status) },
    ];
  }

  // Filter out tabs that have 0 items (except the first two to keep UI consistent)
  const activeTabs = tabs.filter((tab, index) => {
    if (index < 2) return true;
    return items.some(tab.filterFn);
  });

  const [activeTabId, setActiveTabId] = useState(activeTabs[0].id);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date_added" | "title" | "release_year" | "user_rating">("date_added");

  const activeTab = activeTabs.find((t) => t.id === activeTabId) || activeTabs[0];

  const filteredItems = useMemo(() => {
    let result = items.filter(activeTab.filterFn);

    if (selectedTags.length > 0) {
      result = result.filter((item) =>
        selectedTags.every((t) => (item.tags || []).includes(t))
      );
    }

    return result.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "release_year") return (b.release_year || 0) - (a.release_year || 0);
      if (sortBy === "user_rating") return (b.user_rating || 0) - (a.user_rating || 0);
      return new Date(b.date_added).getTime() - new Date(a.date_added).getTime(); // default: newest first
    });
  }, [items, activeTab, selectedTags, sortBy]);

  // Extract tags from the current tab's items (before filtering by tags)
  const availableTags = Array.from(new Set(items.filter(activeTab.filterFn).flatMap((item) => item.tags || []))).sort();

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header Row: Tabs + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-lunar-800)] pb-4">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {activeTabs.map((tab) => {
            const count = items.filter(tab.filterFn).length;
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setSelectedTags([]); // Clear tags on tab switch
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[var(--color-violet-500)] text-white shadow-[var(--shadow-glow-sm)] shadow-[var(--color-violet-500)]"
                    : "bg-[var(--color-lunar-900)] text-[var(--color-lunar-400)] hover:bg-[var(--color-lunar-800)] hover:text-[var(--color-lunar-200)]"
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-[var(--color-lunar-800)] text-[var(--color-lunar-500)]"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sorting Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-[var(--color-lunar-900)] text-[var(--color-lunar-200)] text-sm rounded-xl px-4 py-2 border border-[var(--color-lunar-800)] focus:outline-none focus:border-[var(--color-violet-500)] cursor-pointer"
        >
          <option value="date_added">Recently Added</option>
          <option value="title">Title (A-Z)</option>
          <option value="release_year">Release Year (Newest)</option>
          <option value="user_rating">My Rating (Highest)</option>
        </select>
      </div>

      {/* Tag Filters */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 animate-fade-in">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() =>
                  setSelectedTags((prev) =>
                    isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                  )
                }
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                  isSelected
                    ? "bg-[rgba(139,92,246,0.15)] text-[var(--color-violet-300)] border-[var(--color-violet-500)]"
                    : "bg-transparent text-[var(--color-lunar-400)] border-[var(--color-lunar-800)] hover:border-[var(--color-lunar-600)]"
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTabId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <MediaGrid items={filteredItems} emptyMessage={`No items in "${activeTab.label}".`} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
