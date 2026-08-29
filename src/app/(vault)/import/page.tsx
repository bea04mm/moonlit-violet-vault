"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@mui/material";
import { importGoodreadsBatch } from "@/lib/actions/importActions";
import { toast } from "sonner";
import FileUploadIcon from "@mui/icons-material/FileUpload";

export default function ImportPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

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

      <div className="glass-card p-12 lg:p-24 rounded-3xl border-2 border-dashed border-[var(--color-lunar-800)] flex flex-col items-center justify-center gap-4 text-center mt-8 hover:border-[var(--color-violet-500)] transition-colors bg-[var(--color-lunar-950)]/50">
        <div className="w-20 h-20 rounded-full bg-[var(--color-violet-500)]/10 flex items-center justify-center text-[var(--color-violet-400)] mb-4">
          <FileUploadIcon sx={{ fontSize: 40 }} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-lunar-50)]">Goodreads CSV</h2>
        <p className="text-[var(--color-lunar-400)] max-w-md">
          Export the library from Goodreads (My Books &gt; Import and export &gt; Export Library) and upload the CSV here.
        </p>
        
        <div className="mt-4">
          <Button 
            component="label"
            variant="contained" 
            disabled={isUploading}
            sx={{ bgcolor: "var(--color-violet-600)", '&:hover': { bgcolor: "var(--color-violet-500)" } }}
          >
            {isUploading ? `Importing... ${progress}%` : "Select CSV File"}
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
              className="h-full bg-[var(--color-violet-500)] transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
