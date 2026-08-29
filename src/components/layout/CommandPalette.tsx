"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Dialog, Slide } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MovieIcon from "@mui/icons-material/Movie";
import TvIcon from "@mui/icons-material/Tv";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BarChartIcon from "@mui/icons-material/BarChart";
import HomeIcon from "@mui/icons-material/Home";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { getAllMediaAction } from "@/lib/actions/mediaActions";
import type { MediaItem } from "@/lib/supabase/database.types";
import { getCoverPlaceholder } from "@/lib/utils/formatters";

type PaletteOption =
  | { type: "nav"; id: string; label: string; icon: React.ReactNode; path: string }
  | { type: "item"; id: string; item: MediaItem; path: string };

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  // Handle global hotkey
  useEffect(() => {
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
      setQuery("");
      
      const navPaths = ["/", "/movies", "/series", "/books", "/analytics"];
      const currentIndex = navPaths.indexOf(pathname);
      setSelectedIndex(currentIndex !== -1 ? currentIndex : 0);
    }
  }, [isOpen, items.length, pathname]);

  // Reset selection on query change
  useEffect(() => {
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
    const filtered = items.filter((item) => {
      const title = item.title.toLowerCase();
      return terms.every((term) => title.includes(term));
    });

    // Grouping: Sort so movies come first, then series, then books
    const movies = filtered.filter((i) => i.type === "movie");
    const series = filtered.filter((i) => i.type === "series");
    const books = filtered.filter((i) => i.type === "book");

    const mapItem = (item: MediaItem): PaletteOption => ({
      type: "item",
      id: item.id,
      item,
      path: `/${item.type === "series" ? "series" : item.type === "book" ? "books" : "movies"}/${item.id}`,
    });

    options = [
      ...movies.map(mapItem),
      ...series.map(mapItem),
      ...books.map(mapItem),
    ];
  }

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

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

  const renderItemsGroup = (type: MediaItem["type"], title: string) => {
    const groupItems = options.map((opt, idx) => ({ opt, idx })).filter((x) => x.opt.type === "item" && x.opt.item.type === type);
    if (groupItems.length === 0) return null;

    return (
      <div className="space-y-1 mt-4 first:mt-0" key={type}>
        <div className="px-3 py-1 text-xs font-semibold text-[var(--color-lunar-500)] uppercase tracking-wider flex items-center gap-2">
          {type === "movie" ? <MovieIcon fontSize="small" /> : type === "series" ? <TvIcon fontSize="small" /> : <MenuBookIcon fontSize="small" />}
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
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-xl placeholder-[var(--color-lunar-600)] text-white px-2 py-1"
          placeholder="Search my vault or jump to..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          onClick={() => setIsOpen(false)}
          className="shrink-0 ml-2 flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[var(--color-lunar-500)] bg-black/40 hover:bg-black/60 hover:text-[var(--color-lunar-300)] transition-colors px-2 py-1 rounded border border-white/5 cursor-pointer"
        >
          <span>ESC</span>
        </button>
      </div>

      <div className="p-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {!query && (
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-[var(--color-lunar-500)] uppercase tracking-wider">
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
          </div>
        )}

        {query && options.length === 0 && (
          <div className="px-4 py-12 text-center text-[var(--color-lunar-500)] flex flex-col items-center gap-3">
            <SearchIcon sx={{ fontSize: 48, opacity: 0.2 }} />
            <p>No results found for "{query}"</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}

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
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group text-left ${
        isSelected
          ? "bg-[rgba(139,92,246,0.15)] ring-1 ring-[var(--color-violet-500)]/30"
          : "hover:bg-[rgba(255,255,255,0.05)]"
      }`}
    >
      <div className="flex items-center gap-4">
        {coverUrl ? (
          <div className="relative w-10 h-14 rounded-md overflow-hidden shadow-sm flex-shrink-0 bg-black/20 border border-white/5">
            <Image src={coverUrl} alt={label} fill sizes="40px" className="object-cover" />
          </div>
        ) : icon ? (
          <div
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              isSelected ? "bg-[var(--color-violet-500)]/20 text-[var(--color-violet-400)]" : "bg-black/20 text-[var(--color-lunar-400)] group-hover:text-[var(--color-lunar-200)]"
            }`}
          >
            {icon}
          </div>
        ) : null}
        
        <div>
          <div className={`text-sm font-semibold transition-colors ${isSelected ? "text-white" : "text-[var(--color-lunar-100)]"}`}>
            {label}
          </div>
          {subtitle && (
            <div className={`text-xs transition-colors ${isSelected ? "text-[var(--color-violet-200)]/70" : "text-[var(--color-lunar-500)]"}`}>
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
