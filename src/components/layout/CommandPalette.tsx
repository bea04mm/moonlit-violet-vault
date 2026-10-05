/**
 * Keyboard-driven search and navigation overlay for the vault.
 * Triggered globally with Ctrl+K (or Cmd+K on Mac).
 *
 * Features:
 *  - Without a query: shows quick-navigation links to all main sections.
 *  - With a query: searches all vault items with fuzzy multi-term matching,
 *    grouped by type (Movies, Series, Books, Recipes).
 *  - Keyboard navigation: Arrow Up/Down to move selection, Enter to navigate.
 *  - Items already in the vault show a "View in Vault" button instead of adding.
 * 
 * @packageDocumentation
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Dialog } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MovieIcon from "@mui/icons-material/Movie";
import TvIcon from "@mui/icons-material/Tv";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import BarChartIcon from "@mui/icons-material/BarChart";
import HomeIcon from "@mui/icons-material/Home";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { getAllMediaAction } from "@/lib/actions/mediaActions";
import type { MediaItem } from "@/lib/supabase/database.types";
import { getCoverPlaceholder } from "@/lib/utils/formatters";

/**
 * A palette entry is either a navigation shortcut (no query) or a vault media item (with query).
 * The discriminated union lets TypeScript narrow the type safely in render functions.
 */
type PaletteOption =
  | { type: "nav"; id: string; label: string; icon: React.ReactNode; path: string }
  | { type: "item"; id: string; item: MediaItem; path: string };

/**
 * Full-screen command palette dialog — opens on Ctrl+K and closes on Escape.
 * Fetches all vault items lazily on first open and caches them for the session.
 */
export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  /**
   * The Next.js App Router navigator instance.
   */
  const router = useRouter();
  /**
   * The current active pathname from Next.js, used to highlight the active tab.
   */
  const pathname = usePathname();

  // Handle global hotkey
  useEffect(() => {
    /**
     * Toggles the palette visibility when the Ctrl+K hotkey is pressed.
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch items on open and reset state
  useEffect(() => {
    if (isOpen) {
      if (items.length === 0) getAllMediaAction().then(setItems);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      
      const navPaths = ["/", "/movies", "/series", "/books", "/analytics"];
      const currentIndex = navPaths.indexOf(pathname);
       
      setSelectedIndex(currentIndex !== -1 ? currentIndex : 0);
    }
  }, [isOpen, items.length, pathname]);

  // Reset selection on query change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [query]);

  // Build options
  let options: PaletteOption[] = [];

  if (!query) {
    options = [
      { type: "nav", id: "nav-home", label: "Dashboard", icon: <HomeIcon />, path: "/" },
      { type: "nav", id: "nav-movies", label: "Movies", icon: <MovieIcon />, path: "/movies" },
      { type: "nav", id: "nav-series", label: "Series", icon: <TvIcon />, path: "/series" },
      { type: "nav", id: "nav-books", label: "Books", icon: <MenuBookIcon />, path: "/books" },
      { type: "nav", id: "nav-import", label: "Import Data", icon: <FileUploadIcon />, path: "/import" },
      { type: "nav", id: "nav-analytics", label: "Analytics", icon: <BarChartIcon />, path: "/analytics" },
    ];
  } else {
    // Fuzzy search: split query by space and check if all terms are in title
    const terms = query.toLowerCase().trim().split(/\s+/);
    /**
     * The subset of media items that match the user's fuzzy search terms.
     */
    const filtered = items.filter((item) => {
      const searchableText = [
        item.title,
        item.original_title,
        item.author,
        item.director
      ].filter(Boolean).join(" ").toLowerCase();
      
      return terms.every((term) => searchableText.includes(term));
    });

    // Grouping: Sort so movies come first, then series, then books
    const movies = filtered.filter((i) => i.type === "movie");
    /**
     * Filtered search results matching the "series" media type.
     */
    const series = filtered.filter((i) => i.type === "series");
    /**
     * Filtered search results matching the "book" media type.
     */
    const books = filtered.filter((i) => i.type === "book");
    /**
     * Filtered search results matching the "recipe" media type.
     */
    const recipes = filtered.filter((i) => i.type === "recipe");

    /**
     * Transforms a raw MediaItem into a standardized PaletteOption format
     * for rendering in the command palette list.
     */
    const mapItem = (item: MediaItem): PaletteOption => ({
      type: "item",
      id: item.id,
      item,
      path: `/${item.type === "series" ? "series" : item.type === "book" ? "books" : item.type === "recipe" ? "recipes" : "movies"}/${item.id}`,
    });

    options = [
      ...movies.map(mapItem),
      ...series.map(mapItem),
      ...books.map(mapItem),
      ...recipes.map(mapItem),
    ];
  }

  /**
   * Closes the palette and navigates the user to the provided path.
   *
   * @param path - The application path to route to.
   */
  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  /**
   * Handles keyboard navigation within the command palette.
   * Allows users to scroll through options using arrow keys and select with Enter.
   *
   * @param e - The keyboard event from the input element.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedOption = options[selectedIndex];
      if (selectedOption) {
        handleNavigate(selectedOption.path);
      }
    }
  };

  // Group helpers for rendering
  const renderNav = () => {
    return options.map((opt, idx) => {
      if (opt.type !== "nav") return null;
      return (
        <PaletteAction
          key={opt.id}
          icon={opt.icon}
          label={opt.label}
          isSelected={idx === selectedIndex}
          onClick={() => handleNavigate(opt.path)}
        />
      );
    });
  };

  /**
   * Renders a categorized group of palette items based on their media type.
   *
   * @param type - The media type used to filter options.
   * @param title - The display name for the group section.
   * @returns The React nodes for the grouped options, or null if empty.
   */
  const renderItemsGroup = (type: MediaItem["type"], title: string) => {
    /**
     * Filters palette options to only include items matching the specified type.
     */
    const groupItems = options.map((opt, idx) => ({ opt, idx })).filter((x) => x.opt.type === "item" && x.opt.item.type === type);
    if (groupItems.length === 0) return null;

    return (
      <div className="space-y-1 mt-4 first:mt-0" key={type}>
        <div className="px-3 py-1 text-xs font-semibold text-lunar-500 uppercase tracking-wider flex items-center gap-2">
          {type === "movie" ? <MovieIcon fontSize="small" /> : type === "series" ? <TvIcon fontSize="small" /> : type === "book" ? <MenuBookIcon fontSize="small" /> : <RestaurantMenuIcon fontSize="small" />}
          {title}
        </div>
        {groupItems.map(({ opt, idx }) => {
          if (opt.type !== "item") return null;
          const { item } = opt;
          return (
            <PaletteAction
              key={item.id}
              coverUrl={item.cover_url || getCoverPlaceholder(item.title)}
              label={item.title}
              subtitle={item.release_year?.toString() || item.status}
              isSelected={idx === selectedIndex}
              onClick={() => handleNavigate(opt.path)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          background: "rgba(17, 14, 31, 0.9)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          color: "var(--color-lunar-200)",
          m: 2,
          position: "absolute",
          top: "10vh",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
        },
      }}
    >
      <div className="flex items-center px-4 py-4 border-b border-[rgba(255,255,255,0.08)] bg-black/20">
        <SearchIcon sx={{ color: "var(--color-violet-400)", mr: 1.5 }} />
        <input
          autoFocus
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-xl placeholder-lunar-600 text-white px-2 py-1"
          placeholder="Search my vault or jump to..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          onClick={() => setIsOpen(false)}
          className="shrink-0 ml-2 flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-lunar-500 bg-black/40 hover:bg-black/60 hover:text-lunar-300 transition-colors px-2 py-1 rounded border border-white/5 cursor-pointer"
        >
          <span>ESC</span>
        </button>
      </div>

      <div className="p-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {!query && (
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-lunar-500 uppercase tracking-wider">
              Navigation
            </div>
            {renderNav()}
          </div>
        )}

        {query && options.length > 0 && (
          <div>
            {renderItemsGroup("movie", "Movies")}
            {renderItemsGroup("series", "TV Series")}
            {renderItemsGroup("book", "Books")}
            {renderItemsGroup("recipe", "Recipes")}
          </div>
        )}

        {query && options.length === 0 && (
          <div className="px-4 py-12 text-center text-lunar-500 flex flex-col items-center gap-3">
            <SearchIcon sx={{ fontSize: 48, opacity: 0.2 }} />
            <p>No results found for &quot;{query}&quot;</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}

/**
 * An individual interactive row inside the Command Palette.
 * Represents either a generic navigation action or a specific media item.
 *
 * @param props - Properties for rendering the action.
 * @param props.icon - An optional Material UI icon to display.
 * @param props.coverUrl - An optional image URL to display as a thumbnail.
 * @param props.label - The primary text label for the action.
 * @param props.subtitle - Secondary text, often a release year or status.
 * @param props.onClick - Handler triggered when the action is clicked.
 * @param props.isSelected - True if this action is currently focused via keyboard navigation.
 */
function PaletteAction({
  icon,
  coverUrl,
  label,
  subtitle,
  onClick,
  isSelected,
}: {
  icon?: React.ReactNode;
  coverUrl?: string;
  label: string;
  subtitle?: string;
  onClick: () => void;
  isSelected: boolean;
}) {
  /**
   * Reference to the underlying button element, used to scroll the option into view.
   */
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: "nearest" });
    }
  }, [isSelected]);

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group text-left cursor-pointer ${
        isSelected
          ? "bg-[rgba(139,92,246,0.15)] ring-1 ring-(--color-violet-500)/30"
          : "hover:bg-[rgba(255,255,255,0.05)]"
      }`}
    >
      <div className="flex items-center gap-4">
        {coverUrl ? (
          <div className="relative w-10 h-14 rounded-md overflow-hidden shadow-sm shrink-0 bg-black/20 border border-white/5">
            <Image src={coverUrl} alt={label} fill sizes="40px" className="object-cover" unoptimized />
          </div>
        ) : icon ? (
          <div
            className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              isSelected ? "bg-(--color-violet-500)/20 text-violet-400" : "bg-black/20 text-lunar-400 group-hover:text-lunar-200"
            }`}
          >
            {icon}
          </div>
        ) : null}
        
        <div>
          <div className={`text-sm font-semibold transition-colors ${isSelected ? "text-white" : "text-lunar-100"}`}>
            {label}
          </div>
          {subtitle && (
            <div className={`text-xs transition-colors ${isSelected ? "text-violet-200/70" : "text-lunar-500"}`}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <div className={`transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isSelected ? "var(--color-violet-400)" : "var(--color-lunar-500)"} strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </button>
  );
}
