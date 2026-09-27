"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Button } from "@mui/material";
import { importGoodreadsBatch } from "@/lib/actions/importActions";
import { extractTitlesFromImage } from "@/lib/actions/ocrActions";
import { toast } from "sonner";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function ImportPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading]);

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedTitles, setExtractedTitles] = useState<Array<{title: string, type: string, status?: string}>>([]);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingCSV, setIsDraggingCSV] = useState(false);

  const processImage = async (file: File) => {
    setIsExtracting(true);
    setExtractedTitles([]);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        
        if (base64.length > 4_000_000) {
          toast.error("Image is too large (max ~3MB). Please crop or compress it.");
          setIsExtracting(false);
          return;
        }

        const formData = new FormData();
        formData.append("image", base64);
        formData.append("mimeType", file.type);
        formData.append("mediaType", "movie, series, book, or recipe");

        const res = await extractTitlesFromImage(formData);
        
        if (res.success && res.titles) {
          // Initialize list with pending status
          const items = res.titles.map((t: any) => ({ 
            ...t,
            title: t.title || t, 
            type: t.type || "movie", 
            status: "pending" 
          }));
          setExtractedTitles(items);
          toast.success(`Extracted ${items.length} items. Ingesting...`);
          
          // Auto ingest sequentially
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            setExtractedTitles(prev => prev.map((p, idx) => idx === i ? { ...p, status: "loading" } : p));
            
            try {
              const { ingestExtractedTitle } = await import("@/lib/actions/ocrActions");
              const ingestRes = await ingestExtractedTitle(item);
              if (ingestRes.success) {
                setExtractedTitles(prev => prev.map((p, idx) => idx === i ? { ...p, status: "success" } : p));
              } else {
                setExtractedTitles(prev => prev.map((p, idx) => idx === i ? { ...p, status: "failed" } : p));
              }
            } catch (err) {
              setExtractedTitles(prev => prev.map((p, idx) => idx === i ? { ...p, status: "failed" } : p));
            }
          }
          toast.success("Ingestion complete!");
        } else {
          toast.error(res.error || "Failed to extract titles");
        }
      } catch (err: any) {
        toast.error("Server error: " + (err.message || "Unknown error"));
      } finally {
        setIsExtracting(false);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
      setIsExtracting(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const processCSV = (file: File) => {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCSV(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnterImage = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
  };

  const handleDragLeaveImage = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  const handleDragEnterCSV = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCSV(true);
  };

  const handleDragLeaveCSV = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCSV(false);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    
    if (isExtracting) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processImage(file);
    } else if (file) {
      toast.error("Please drop an image file");
    }
  };

  const handleCSVDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCSV(false);
    
    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      processCSV(file);
    } else if (file) {
      toast.error("Please drop a CSV file");
    }
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
        <div 
          className={`relative overflow-hidden glass-card p-8 lg:p-12 rounded-3xl border-2 flex flex-col items-center justify-center gap-4 text-center transition-all duration-300 ease-out bg-[var(--color-lunar-950)]/50
            ${isDraggingImage 
              ? "border-solid border-[var(--color-violet-400)] shadow-[0_0_40px_rgba(167,139,250,0.3)] bg-[var(--color-violet-900)]/20 scale-[1.03] -translate-y-2 z-10 [&>*]:pointer-events-none" 
              : "border-dashed border-[var(--color-lunar-800)] hover:border-[var(--color-violet-500)] hover:bg-[var(--color-lunar-900)]/40"
            }`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnterImage}
          onDragLeave={handleDragLeaveImage}
          onDrop={handleImageDrop}
        >
          {isDraggingImage && (
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-violet-500)]/10 to-transparent animate-pulse pointer-events-none" />
          )}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-[var(--color-violet-400)] mb-2 transition-all duration-300 ${isDraggingImage ? "bg-[var(--color-violet-500)]/30 scale-125" : "bg-[var(--color-violet-500)]/10"}`}>
            <PhotoCameraIcon sx={{ fontSize: 32 }} />
          </div>
          <h2 className={`text-xl font-bold transition-colors ${isDraggingImage ? "text-[var(--color-violet-300)]" : "text-[var(--color-lunar-50)]"}`}>Magic AI Scanner</h2>
          <p className="text-sm text-[var(--color-lunar-400)] max-w-sm">
            Drop a screenshot of a movie list, or a photo of a recipe book. AI will extract and save it automatically.
          </p>
          
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button 
              component="label"
              variant="contained" 
              disabled={isExtracting}
              sx={{ bgcolor: "var(--color-violet-600)", '&:hover': { bgcolor: "var(--color-violet-500)" }, color: "white", borderRadius: '999px', textTransform: 'none', px: 4, fontWeight: 'bold' }}
            >
              {isExtracting ? "Extracting..." : "Upload Image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            
            <Button 
              component="label"
              variant="outlined" 
              disabled={isExtracting}
              sx={{ 
                display: { xs: 'flex', md: 'none' }, // Only show on mobile
                borderColor: "var(--color-violet-600)", 
                color: "var(--color-violet-400)", 
                '&:hover': { borderColor: "var(--color-violet-400)", bgcolor: "rgba(167, 139, 250, 0.1)" }, 
                borderRadius: '999px', 
                minWidth: '48px', 
                width: '48px', 
                height: '48px', 
                p: 0 
              }}
              title="Take Photo"
              aria-label="Take Photo"
            >
              <PhotoCameraIcon />
              <input
                type="file"
                hidden
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
              />
            </Button>
          </div>
          
          {extractedTitles.length > 0 && (
            <div className="w-full max-w-xs mt-4 text-left">
              <p className="text-xs text-[var(--color-violet-400)] font-bold uppercase mb-2">Ingesting Titles</p>
              <ul className="text-sm text-white bg-[var(--color-lunar-900)] p-3 rounded-xl border border-[var(--color-lunar-800)] max-h-32 overflow-y-auto">
                {extractedTitles.map((t, i) => (
                  <li key={i} className="mb-2 last:mb-0 border-b border-[var(--color-lunar-800)] last:border-0 pb-2 last:pb-0 flex items-center justify-between">
                    <span className="truncate pr-2">{t.title}</span>
                    {t.status === "pending" && <span className="text-[var(--color-lunar-500)] text-xs">Waiting...</span>}
                    {t.status === "loading" && <span className="text-[var(--color-violet-400)] text-xs animate-pulse">Searching...</span>}
                    {t.status === "success" && <span className="text-green-400 text-xs font-bold">Added</span>}
                    {t.status === "failed" && <span className="text-red-400 text-xs font-bold">Failed</span>}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[var(--color-lunar-500)] mt-2 italic text-center">Items are automatically searched and saved to your vault.</p>
            </div>
          )}
        </div>

        {/* Goodreads CSV */}
        <div 
          className={`relative overflow-hidden glass-card p-8 lg:p-12 rounded-3xl border-2 flex flex-col items-center justify-center gap-4 text-center transition-all duration-300 ease-out bg-[var(--color-lunar-950)]/50
            ${isDraggingCSV 
              ? "border-solid border-[var(--color-blossom-400)] shadow-[0_0_40px_rgba(240,78,150,0.3)] bg-[var(--color-blossom-900)]/20 scale-[1.03] -translate-y-2 z-10 [&>*]:pointer-events-none" 
              : "border-dashed border-[var(--color-lunar-800)] hover:border-[var(--color-blossom-500)] hover:bg-[var(--color-lunar-900)]/40"
            }`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnterCSV}
          onDragLeave={handleDragLeaveCSV}
          onDrop={handleCSVDrop}
        >
          {isDraggingCSV && (
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-blossom-500)]/10 to-transparent animate-pulse pointer-events-none" />
          )}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-[var(--color-blossom-400)] mb-2 transition-all duration-300 ${isDraggingCSV ? "bg-[var(--color-blossom-500)]/30 scale-125" : "bg-[var(--color-blossom-500)]/10"}`}>
            <FileUploadIcon sx={{ fontSize: 32 }} />
          </div>
          <h2 className={`text-xl font-bold transition-colors ${isDraggingCSV ? "text-[var(--color-blossom-300)]" : "text-[var(--color-lunar-50)]"}`}>Goodreads CSV</h2>
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
            <div className="w-full max-w-xs mt-4 flex flex-col items-center gap-2">
              <div className="w-full h-1.5 bg-[var(--color-lunar-900)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--color-blossom-500)] transition-all duration-300" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-xs text-[var(--color-blossom-400)] flex items-center gap-1 mt-2 font-semibold">
                <WarningAmberIcon sx={{ fontSize: 14 }} /> Please keep this page open until finished.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
