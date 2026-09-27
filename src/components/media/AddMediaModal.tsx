// src/components/media/AddMediaModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { searchExternalMedia, addMediaToVault, getAllMediaAction, type SearchResult } from "@/lib/actions/mediaActions";
import type { MediaType, MediaItem } from "@/lib/supabase/database.types";
import { toast } from "sonner";

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMediaModal({ isOpen, onClose }: AddMediaModalProps) {
  const [type, setType] = useState<MediaType>("movie");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vaultItems, setVaultItems] = useState<MediaItem[]>([]);
  
  const router = useRouter();
  const pathname = usePathname();
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      if (pathname.includes("series")) setType("series");
      else if (pathname.includes("books")) setType("book");
      else if (pathname.includes("recipes")) setType("recipe");
      else setType("movie");

      setQuery("");
      setResults([]);
      setError(null);
      getAllMediaAction().then(setVaultItems);
    }
  }, [isOpen, pathname]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);
    
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchExternalMedia(query, type);
        setResults(data);
      } catch (err: any) {
        setError(err.message || "Failed to search.");
      } finally {
        setIsSearching(false);
      }
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, type]);

  async function handleAdd(result: SearchResult) {
    setIsAdding(result.externalId);
    setError(null);
    try {
      await addMediaToVault(result);
      toast.success(`${result.title} added to vault!`);
      onClose(); // Close on success
    } catch (err: any) {
      toast.error(err.message || "Failed to add to vault.");
    } finally {
      setIsAdding(null);
    }
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ position: "fixed" }}>
      <div 
        className="glass-card w-full max-w-2xl rounded-3xl flex flex-col max-h-[85vh] overflow-hidden"
        style={{ boxShadow: "var(--shadow-glow-md)" }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: "color-mix(in srgb, var(--color-violet-500) 15%, transparent)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-gradient-violet">Add to Vault</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Type Selector */}
          <div className="flex gap-2 p-1 rounded-xl bg-black/40 overflow-x-auto custom-scrollbar">
            {(["movie", "series", "book", "recipe"] as MediaType[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setQuery("");
                  setResults([]);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all min-w-[80px] ${
                  type === t ? "bg-[var(--color-violet-500)] text-white shadow-lg" : "text-[var(--color-lunar-400)] hover:text-white"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative mt-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search for a ${type}...`}
              className="w-full bg-black/40 border border-[color-mix(in_srgb,var(--color-violet-500)_30%,transparent)] rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--color-lunar-500)] focus:outline-none focus:border-[var(--color-violet-400)] transition-colors"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[var(--color-violet-500)] border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-2">
          {error && (
            <div className="m-4 p-3 rounded-xl bg-[color-mix(in_srgb,var(--color-blossom-500)_10%,transparent)] text-[var(--color-blossom-400)] text-sm text-center">
              {error}
            </div>
          )}

          {results.length === 0 && query.trim().length < 2 && type === "recipe" && !error && (
            <div className="p-8 text-center flex flex-col items-center gap-4 animate-fade-in">
              <span className="text-[var(--color-lunar-500)] text-sm">
                Have a family recipe? Skip the search.
              </span>
              <button
                onClick={() => {
                  onClose();
                  router.push("/recipes/new");
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--color-violet-600)] text-white hover:bg-[var(--color-violet-500)] transition-colors"
              >
                + Write Recipe Manually
              </button>
            </div>
          )}

          {results.length === 0 && query.trim().length >= 2 && !isSearching && !error && (
            <div className="p-8 text-center flex flex-col items-center gap-4">
              <span className="text-[var(--color-lunar-500)] text-sm">
                No results found for "{query}".
              </span>
              {type === "recipe" && (
                <button
                  onClick={() => {
                    onClose();
                    router.push("/recipes/new");
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Write Recipe Manually
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {results.map((result) => {
              const existingItem = vaultItems.find((item) => 
                (result.type === "book" && item.google_books_id === result.externalId) ||
                (result.type !== "book" && item.tmdb_id === parseInt(result.externalId))
              );
              
              return (
              <div 
                key={result.externalId} 
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group"
              >
                <div className="w-12 h-16 bg-[var(--color-lunar-900)] rounded-lg overflow-hidden relative shrink-0">
                  {result.coverUrl ? (
                    <Image src={result.coverUrl} alt={result.title} fill className="object-cover" unoptimized />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-xl opacity-30">
                      {type === "movie" ? "🎬" : type === "series" ? "📺" : type === "book" ? "📚" : "🍳"}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--color-lunar-100)] truncate">
                    {result.title}
                  </h3>
                  <div className="text-xs text-[var(--color-lunar-500)] mt-0.5 flex gap-2">
                    {result.releaseYear && <span>{result.releaseYear}</span>}
                    {result.author && <span className="truncate">{result.author}</span>}
                  </div>
                </div>

                {existingItem ? (
                  <button
                    onClick={() => {
                      onClose();
                      router.push(`/${existingItem.type === "series" ? "series" : existingItem.type === "book" ? "books" : existingItem.type === "recipe" ? "recipes" : "movies"}/${existingItem.id}`);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-violet-500)]/20 text-[var(--color-violet-300)] hover:bg-[var(--color-violet-500)] hover:text-white transition-colors border border-transparent hover:border-[var(--color-violet-400)]"
                  >
                    View in Vault
                  </button>
                ) : (
                  <button
                    onClick={() => handleAdd(result)}
                    disabled={isAdding === result.externalId}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-violet-500)] text-[var(--color-violet-300)] hover:bg-[var(--color-violet-500)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAdding === result.externalId ? "Adding..." : "+ Add"}
                  </button>
                )}
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
