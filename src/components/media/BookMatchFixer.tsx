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

  const handleSelect = async (book: any) => {
    const info = book.volumeInfo;
    let coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
    if (coverUrl) {
      coverUrl = coverUrl.replace("zoom=1", "zoom=3").replace("http://", "https://");
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
      <Button
        onClick={() => setOpen(true)}
        variant="outlined"
        size="small"
        startIcon={<SearchIcon />}
        sx={{
          color: "var(--color-lunar-400)",
          borderColor: "var(--color-lunar-700)",
          textTransform: "none",
          '&:hover': {
            borderColor: "var(--color-violet-500)",
            color: "var(--color-violet-400)",
          }
        }}
      >
        Fix Match
      </Button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="sm" 
        fullWidth 
        sx={{ 
          '& .MuiDialog-paper': { 
            backgroundColor: "var(--color-lunar-950)", 
            color: "white", 
            borderRadius: '16px', 
            border: "1px solid var(--color-lunar-800)" 
          } 
        }}
      >
        <DialogTitle>Find Correct Book</DialogTitle>
        <DialogContent>
          <div className="flex gap-2 mt-2 mb-4">
            <TextField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              fullWidth
              size="small"
              placeholder="Search by title, author, or ISBN..."
              sx={{ input: { color: "white" }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: "var(--color-lunar-700)" }, '&:hover fieldset': { borderColor: "var(--color-violet-500)" } } }}
            />
            <Button onClick={handleSearch} variant="contained" sx={{ bgcolor: "var(--color-violet-600)", '&:hover': { bgcolor: "var(--color-violet-500)" } }}>
              Search
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><CircularProgress size={24} sx={{ color: "var(--color-violet-500)" }} /></div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2">
              {results.map((r) => {
                const info = r.volumeInfo;
                const cover = info.imageLinks?.smallThumbnail || info.imageLinks?.thumbnail;
                return (
                  <div key={r.id} onClick={() => handleSelect(r)} className="flex gap-4 p-3 rounded-xl border border-[var(--color-lunar-800)] hover:border-[var(--color-violet-500)] cursor-pointer transition-colors hover:bg-[var(--color-lunar-900)]">
                    <div className="w-12 h-16 relative shrink-0 bg-[var(--color-lunar-900)] rounded overflow-hidden">
                      {cover && <Image src={cover.replace("http://", "https://")} alt="Cover" fill className="object-cover" unoptimized />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center overflow-hidden">
                      <h4 className="font-semibold text-sm truncate">{info.title}</h4>
                      <p className="text-xs text-[var(--color-lunar-400)] truncate">{info.authors?.join(", ") || "Unknown Author"}</p>
                      {info.publishedDate && <p className="text-xs text-[var(--color-lunar-500)]">{info.publishedDate}</p>}
                    </div>
                  </div>
                );
              })}
              {results.length === 0 && query && !loading && (
                <p className="text-center text-[var(--color-lunar-500)] py-4">Search to see results.</p>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "var(--color-lunar-400)" }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
