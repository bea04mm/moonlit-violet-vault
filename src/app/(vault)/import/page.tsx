"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@mui/material";
import { importGoodreadsBatch } from "@/lib/actions/importActions";
import { extractTitlesFromImage } from "@/lib/actions/ocrActions";
import { toast } from "sonner";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

export default function ImportPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedTitles, setExtractedTitles] = useState<string[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractedTitles([]);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await extractTitlesFromImage(base64, file.type, "movie or book");
      
      if (res.success && res.titles) {
        setExtractedTitles(res.titles);
        toast.success(`Extracted ${res.titles.length} titles`);
      } else {
        toast.error(res.error || "Failed to extract titles");
      }
      setIsExtracting(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
      setIsExtracting(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        
        const items = rows.map((row) => {
          const rawRating = parseFloat(row["My Rating"] || "0");
          const userRating = rawRating > 0 ? rawRating * 2 : null;
          const yearRaw = parseInt(row["Original Publication Year"] || "0", 10);
          const releaseYear = yearRaw > 0 ? yearRaw : null;
          
          let status: "read" | "reading" | "want_to_read" = "want_to_read";
          const shelf = row["Exclusive Shelf"] || "";
          if (shelf === "read") status = "read";
          if (shelf === "currently-reading") status = "reading";
          
          const isbnRaw = String(row["ISBN13"] || row["ISBN"] || "").replace(/[^0-9X]/g, "");
          const isbn = isbnRaw.length > 0 ? isbnRaw : null;

          const totalPagesRaw = parseInt(row["Number of Pages"] || "0", 10);
          const totalPages = totalPagesRaw > 0 ? totalPagesRaw : null;
          const pagesRead = status === "read" && totalPages ? totalPages : 0;

          return {
            type: "book" as const,
            title: row["Title"]?.trim(),
            author: row["Author"]?.trim() || null,
            isbn,
            status,
            user_rating: userRating,
            release_year: releaseYear,
            total_pages: totalPages,
            pages_read: pagesRead,
            date_completed: row["Date Read"] || null,
            date_added: row["Date Added"] || null,
            ingestion_source: "goodreads_csv" as const,
          };
        }).filter(item => item.title);

        toast.info(`Found ${items.length} books in CSV. Importing in batches...`);

        const BATCH_SIZE = 10;
        let totalInserted = 0;

        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          const batch = items.slice(i, i + BATCH_SIZE);
          const res = await importGoodreadsBatch(batch);
          if (res.success && res.inserted) {
            totalInserted += res.inserted;
          }
          setProgress(Math.round(((i + batch.length) / items.length) * 100));
        }

        setIsUploading(false);
        toast.success(`Import complete! Inserted ${totalInserted} new books.`);
      },
      error: (err) => {
        console.error(err);
        toast.error("Failed to parse CSV");
        setIsUploading(false);
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <FileUploadIcon fontSize="large" sx={{ color: "var(--color-violet-400)" }} />
          <h1
            className="text-4xl font-display font-bold text-gradient-violet"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Import Data
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--color-lunar-500)" }}>
          Bring existing libraries into the Vault.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Screenshot OCR */}
        <div className="glass-card p-8 lg:p-12 rounded-3xl border-2 border-dashed border-[var(--color-lunar-800)] flex flex-col items-center justify-center gap-4 text-center hover:border-[var(--color-violet-500)] transition-colors bg-[var(--color-lunar-950)]/50">
          <div className="w-16 h-16 rounded-full bg-[var(--color-violet-500)]/10 flex items-center justify-center text-[var(--color-violet-400)] mb-2">
            <PhotoCameraIcon sx={{ fontSize: 32 }} />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-lunar-50)]">Screenshot OCR</h2>
          <p className="text-sm text-[var(--color-lunar-400)] max-w-sm">
            Drop an image from Instagram or Letterboxd. AI will extract the titles automatically.
          </p>
          
          <div className="mt-4">
            <Button 
              component="label"
              variant="contained" 
              disabled={isExtracting}
              sx={{ bgcolor: "var(--color-violet-600)", '&:hover': { bgcolor: "var(--color-violet-500)" }, color: "white", borderRadius: '999px', textTransform: 'none', px: 4, fontWeight: 'bold' }}
            >
              {isExtracting ? "Extracting..." : "Select Image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
          </div>
          
          {extractedTitles.length > 0 && (
            <div className="w-full max-w-xs mt-4 text-left">
              <p className="text-xs text-[var(--color-violet-400)] font-bold uppercase mb-2">Extracted Titles</p>
              <ul className="text-sm text-white bg-[var(--color-lunar-900)] p-3 rounded-xl border border-[var(--color-lunar-800)] max-h-32 overflow-y-auto">
                {extractedTitles.map((t, i) => (
                  <li key={i} className="mb-1 last:mb-0 border-b border-[var(--color-lunar-800)] last:border-0 pb-1 last:pb-0">{t}</li>
                ))}
              </ul>
              <p className="text-xs text-[var(--color-lunar-500)] mt-2 italic">Use the command palette (Ctrl+K) or search bars to add these to your vault.</p>
            </div>
          )}
        </div>

        {/* Goodreads CSV */}
        <div className="glass-card p-8 lg:p-12 rounded-3xl border-2 border-dashed border-[var(--color-lunar-800)] flex flex-col items-center justify-center gap-4 text-center hover:border-[var(--color-blossom-500)] transition-colors bg-[var(--color-lunar-950)]/50">
          <div className="w-16 h-16 rounded-full bg-[var(--color-blossom-500)]/10 flex items-center justify-center text-[var(--color-blossom-400)] mb-2">
            <FileUploadIcon sx={{ fontSize: 32 }} />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-lunar-50)]">Goodreads CSV</h2>
          <p className="text-sm text-[var(--color-lunar-400)] max-w-sm">
            Export the library from Goodreads and upload the CSV here to automatically sync your vault.
          </p>
          
          <div className="mt-4">
            <Button 
              component="label"
              variant="contained" 
              disabled={isUploading}
              sx={{ bgcolor: "var(--color-blossom-500)", '&:hover': { bgcolor: "var(--color-blossom-400)" }, color: "white", borderRadius: '999px', textTransform: 'none', px: 4, fontWeight: 'bold' }}
            >
              {isUploading ? `Importing... ${progress}%` : "Select CSV"}
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileUpload}
              />
            </Button>
          </div>
          
          {isUploading && (
            <div className="w-full max-w-xs mt-4 h-1.5 bg-[var(--color-lunar-900)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--color-blossom-500)] transition-all duration-300" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
