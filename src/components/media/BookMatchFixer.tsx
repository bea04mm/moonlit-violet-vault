"use client";

import { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";
import { updateMediaProgress, searchGoogleBooks } from "@/lib/actions/mediaActions";
import { toast } from "sonner";

export function BookMatchFixer({ item }: { item: any }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(item.title);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [customCover, setCustomCover] = useState("");

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const items = await searchGoogleBooks(query);
      setResults(items);
    } catch (e) {
      toast.error("Failed to search Google Books");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomCover = async () => {
    if (!customCover) return;
    try {
      await updateMediaProgress(item.id, { cover_url: customCover });
      toast.success("Cover updated!");
      setOpen(false);
    } catch (e) {
      toast.error("Failed to update cover");
    }
  };

  const handleSelect = async (book: any) => {
    const info = book.volumeInfo;
    let coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
    if (coverUrl) {
      coverUrl = coverUrl.replace("http://", "https://").replace("&edge=curl", "");
    }

    try {
      await updateMediaProgress(item.id, {
        title: info.title || item.title,
        cover_url: coverUrl || item.cover_url,
        synopsis: info.description || item.synopsis,
        genres: info.categories || item.genres,
        author: info.authors ? info.authors.join(", ") : item.author,
        release_year: info.publishedDate ? parseInt(info.publishedDate) : item.release_year,
        total_pages: info.pageCount || item.total_pages,
      });
      toast.success("Book metadata updated!");
      setOpen(false);
    } catch (e) {
      toast.error("Failed to update book");
    }
  };

  if (item.type !== "book") return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-2xl border transition-all shadow-sm font-semibold bg-lunar-900 border-lunar-800 text-lunar-400 hover:bg-violet-900/30 hover:text-violet-300 hover:border-violet-500/50"
      >
        <SearchIcon fontSize="small" className="opacity-70" />
        Edit Cover / Match
      </button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="sm" 
        fullWidth 
        sx={{ 
          '& .MuiDialog-paper': { 
            backgroundColor: "#110e1f",
            backgroundImage: "none",
            color: "white", 
            borderRadius: '16px', 
            border: "1px solid #302850"
          } 
        }}
      >
        <DialogTitle>Find Correct Book</DialogTitle>
        <DialogContent>
          <div className="flex gap-2 mt-2 mb-6">
            <input
              type="text"
              value={customCover}
              onChange={(e) => setCustomCover(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomCover()}
              className="flex-1 min-w-0 bg-transparent border border-lunar-700 rounded-lg px-3 py-2 text-sm text-white placeholder-lunar-500 focus:outline-none focus:border-violet-500"
              placeholder="Paste a high-res image URL..."
            />
            <button 
              onClick={handleCustomCover} 
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
            >
              Update
            </button>
          </div>
          
          <div className="h-px bg-white/10 w-full mb-6 relative">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-lunar-950 px-2 text-xs text-lunar-500 font-semibold uppercase">Or Search Web</span>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 min-w-0 bg-transparent border border-lunar-700 rounded-lg px-3 py-2 text-sm text-white placeholder-lunar-500 focus:outline-none focus:border-violet-500"
              placeholder="Search by title, author, or ISBN..."
            />
            <button 
              onClick={handleSearch} 
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
            >
              Search
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><CircularProgress size={24} sx={{ color: "#9d4dff" }} /></div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2">
              {results.map((r) => {
                const info = r.volumeInfo;
                const cover = info.imageLinks?.smallThumbnail || info.imageLinks?.thumbnail;
                return (
                  <div key={r.id} onClick={() => handleSelect(r)} className="flex gap-4 p-3 rounded-xl border border-lunar-800 hover:border-violet-500 cursor-pointer transition-colors hover:bg-lunar-900">
                    <div className="w-12 h-16 relative shrink-0 bg-lunar-900 rounded overflow-hidden">
                      {cover && <Image src={cover.replace("http://", "https://")} alt="Cover" fill className="object-cover" unoptimized />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center overflow-hidden">
                      <h4 className="font-semibold text-sm truncate">{info.title}</h4>
                      <p className="text-xs text-lunar-400 truncate">{info.authors?.join(", ") || "Unknown Author"}</p>
                      {info.publishedDate && <p className="text-xs text-lunar-500">{info.publishedDate}</p>}
                    </div>
                  </div>
                );
              })}
              {results.length === 0 && query && !loading && (
                <p className="text-center text-lunar-500 py-4">Search to see results.</p>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#9d8cd9" }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
