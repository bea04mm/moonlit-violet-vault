/**
 * Tabbed Dashboard component for organizing media items.
 * 
 * @packageDocumentation
 */
/* eslint-disable react-hooks/preserve-manual-memoization, @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import type { MediaItem, MediaType } from "@/lib/supabase/database.types";
import { MediaGrid } from "./MediaGrid";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Props interface for the TabbedDashboardProps.
 */
export interface TabbedDashboardProps {
  type: MediaType;
  items: MediaItem[];
  headerNode?: React.ReactNode;
}

export interface TabbedDashboardLoadingProps {
  headerNode: React.ReactNode;
  tabs: string[];
}

export function TabbedDashboardLoading({
  headerNode,
  tabs,
}: TabbedDashboardLoadingProps) {
  return (
    <div
      className="sticky top-23.25 md:top-16 z-30 pb-6 pt-4 border-b border-white/10"
      style={{
        background: "color-mix(in srgb, var(--color-lunar-950) 85%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
        paddingLeft: "calc(50vw - 50%)",
        paddingRight: "calc(50vw - 50%)",
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        {headerNode}
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-4">
          <div className="flex flex-nowrap gap-2">
            {tabs.map((tab) => (
              <div
                key={tab}
                className="h-10 w-28 shrink-0 animate-pulse rounded-full bg-lunar-900"
              />
            ))}
          </div>
          <div className="h-10 w-44 shrink-0 animate-pulse rounded-xl bg-lunar-900" />
        </div>
      </div>
    </div>
  );
}

/**
 * Configuration object for a dashboard filter tab.
 */
type TabConfig = {
  id: string;
  label: string;
  filterFn: (item: MediaItem) => boolean;
};

/**
 * Tabbed interface for filtering media lists by status.
 */
export function TabbedDashboard({ type, items, headerNode }: TabbedDashboardProps) {
  /**
   * Array of tab configuration objects defining filters and labels for the media dashboard.
   */
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
  } else if (type === "recipe") {
    tabs = [
      { id: "want_to_cook", label: "Want to Cook", filterFn: (item) => item.status === "want_to_cook" || item.status === "want_to_watch" },
      { id: "cooked", label: "Cooked", filterFn: (item) => item.status === "cooked" || item.status === "watched" },
      { id: "other", label: "Other", filterFn: (item) => ["dropped", "on_hold"].includes(item.status) },
    ];
  }

  // Filter out tabs that have 0 items (except the first two to keep UI consistent)
  const activeTabs = tabs.filter((tab, index) => {
    if (index < 2) return true;
    return items.some(tab.filterFn);
  });

  /**
   * Next.js hook for accessing the current URL search parameters.
   */
  const searchParams = useSearchParams();
  /**
   * Current URL pathname used to determine the active route or media type context.
   */
  const pathname = usePathname();

  /**
   * The currently selected tab ID extracted from the URL query string.
   */
  const urlTab = searchParams.get("tab");
  /**
   * The fallback tab ID to use if no valid tab is specified in the URL.
   */
  const defaultTabId = activeTabs.some(t => t.id === urlTab) ? urlTab! : activeTabs[0].id;

  const [activeTabId, setActiveTabId] = useState(defaultTabId);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date_added" | "title" | "release_year" | "user_rating">("date_added");

  useEffect(() => {
    const handlePopState = () => {
      const nextTab = new URLSearchParams(window.location.search).get("tab");
      if (nextTab && activeTabs.some((tab) => tab.id === nextTab)) {
        setActiveTabId(nextTab);
        setSelectedTags([]);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeTabs]);

  /**
   * Changes the active tab, updates the URL without a route transition, and returns to the page top.
   */
  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    setSelectedTags([]);
    /**
     * Mutable URLSearchParams instance used to construct the updated URL query string.
     */
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    window.history.replaceState(
      window.history.state,
      "",
      `${pathname}?${params.toString()}`
    );
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  /**
   * The currently active tab configuration object based on state or URL.
   */
  const activeTab = activeTabs.find((t) => t.id === activeTabId) || activeTabs[0];

  /**
   * Memoized array of media items filtered by the active tab and selected tags, and sorted by user preference.
   */
  const filteredItems = useMemo(() => {
    /**
     * Intermediate array holding the filtered media items before applying tags and sorting.
     */
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
      <div
        className={headerNode ? "sticky top-23.25 md:top-16 z-30 pb-6 pt-4 border-b border-white/10" : undefined}
        style={
          headerNode
            ? {
                background: "color-mix(in srgb, var(--color-lunar-950) 85%, transparent)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                marginLeft: "calc(50% - 50vw)",
                marginRight: "calc(50% - 50vw)",
                paddingLeft: "calc(50vw - 50%)",
                paddingRight: "calc(50vw - 50%)",
              }
            : undefined
        }
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          {headerNode}

          {/* Header Row: Tabs + Sort */}
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-4">
            {/* Tab Navigation */}
            <div className="flex flex-nowrap gap-2">
          {activeTabs.map((tab) => {
            const count = items.filter(tab.filterFn).length;
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-(--color-violet-500) text-white shadow-(--shadow-glow-sm)"
                    : "bg-(--color-lunar-900) text-lunar-400 hover:bg-lunar-800 hover:text-lunar-200"
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-lunar-800 text-lunar-500"}`}>
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
              className="shrink-0 bg-(--color-lunar-900) text-lunar-200 text-sm rounded-xl px-4 py-2 border border-lunar-800 focus:outline-none focus:border-(--color-violet-500) cursor-pointer"
            >
              <option value="date_added">Recently Added</option>
              <option value="title">Title (A-Z)</option>
              <option value="release_year">Release Year (Newest)</option>
              <option value="user_rating">My Rating (Highest)</option>
            </select>
          </div>
        </div>
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
                    ? "bg-[rgba(139,92,246,0.15)] text-violet-300 border-(--color-violet-500)"
                    : "bg-transparent text-lunar-400 border-lunar-800 hover:border-lunar-600"
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
