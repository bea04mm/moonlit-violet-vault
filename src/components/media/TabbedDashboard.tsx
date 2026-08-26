// src/components/media/TabbedDashboard.tsx
"use client";

import { useState } from "react";
import type { MediaItem, MediaType } from "@/lib/supabase/database.types";
import { MediaGrid } from "./MediaGrid";

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

  const activeTab = activeTabs.find((t) => t.id === activeTabId) || activeTabs[0];
  let filteredItems = items.filter(activeTab.filterFn);

  // Extract tags from the current tab's items
  const availableTags = Array.from(new Set(filteredItems.flatMap((item) => item.tags || []))).sort();

  // Apply tag filter if any selected
  if (selectedTags.length > 0) {
    filteredItems = filteredItems.filter((item) =>
      selectedTags.every((t) => (item.tags || []).includes(t))
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-lunar-800)] pb-4">
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
      <div className="animate-fade-in" key={activeTabId}>
        <MediaGrid items={filteredItems} emptyMessage={`No items in "${activeTab.label}".`} />
      </div>
    </div>
  );
}
