/**
 * Import page for adding bulk media via Goodreads CSV or AI Book Spine Scanner.
 *
 * @packageDocumentation
 */
"use client"

import { useState, useEffect } from "react"
import Papa from "papaparse"
import { importGoodreadsBatch } from "@/lib/actions/importActions"
import { extractTitlesFromImage } from "@/lib/actions/ocrActions"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"

/**
 * Renders the Import page, providing drag-and-drop zones and file upload inputs for
 * AI image spine scanning and Goodreads CSV imports.
 */
export default function ImportPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    /**
     * Prevents the user from accidentally leaving the page while an upload or import process is ongoing.
     */
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isUploading])

  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedTitles, setExtractedTitles] = useState<
    Array<{ title: string; type: string; status?: string }>
  >([])
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const [isDraggingCSV, setIsDraggingCSV] = useState(false)

  /**
   * Reads an uploaded image file, converts it to base64, and triggers the AI extraction process.
   */
  const processImage = async (file: File) => {
    setIsExtracting(true)
    setExtractedTitles([])

    /**
     * FileReader instance used to convert the selected image into a Data URL.
     */
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = reader.result as string

        if (base64.length > 4_000_000) {
          toast.error("Image is too large (max ~3MB). Please crop or compress it.")
          setIsExtracting(false)
          return
        }

        const formData = new FormData()
        formData.append("image", base64)
        formData.append("mimeType", file.type)
        formData.append("mediaType", "movie, series, book, or recipe")

        const res = await extractTitlesFromImage(formData)

        if (res.success && res.titles) {
          // Initialize list with pending status
          const items = res.titles.map((t) => ({
            ...t,
            title: t.title || "",
            type: t.type || "movie",
            status: "pending",
          }))
          setExtractedTitles(items)
          toast.success(`Extracted ${items.length} items. Ingesting...`)

          // Auto ingest sequentially
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            setExtractedTitles((prev) =>
              prev.map((p, idx) => (idx === i ? { ...p, status: "loading" } : p))
            )

            try {
              const { ingestExtractedTitle } = await import("@/lib/actions/ocrActions")
              const ingestRes = await ingestExtractedTitle(item)
              if (ingestRes.success) {
                setExtractedTitles((prev) =>
                  prev.map((p, idx) => (idx === i ? { ...p, status: "success" } : p))
                )
              } else {
                setExtractedTitles((prev) =>
                  prev.map((p, idx) => (idx === i ? { ...p, status: "failed" } : p))
                )
              }
            } catch {
              setExtractedTitles((prev) =>
                prev.map((p, idx) => (idx === i ? { ...p, status: "failed" } : p))
              )
            }
          }
          toast.success("Ingestion complete!")
        } else {
          toast.error(res.error || "Failed to extract titles")
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error"
        toast.error("Server error: " + errorMsg)
      } finally {
        setIsExtracting(false)
      }
    }
    reader.onerror = () => {
      toast.error("Failed to read image file")
      setIsExtracting(false)
    }
    reader.readAsDataURL(file)
  }

  /**
   * Handles the file input change event for image uploads.
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    /**
     * Declaration for file.
     */
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  /**
   * Parses and processes an uploaded Goodreads CSV file, importing valid books in batches.
   */
  const processCSV = (file: File) => {
    setIsUploading(true)
    setProgress(0)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as Record<string, string>[]

        const items = rows
          .map((row) => {
            const rawRating = parseFloat(row["My Rating"] || "0")
            const userRating = rawRating > 0 ? rawRating : undefined
            const yearRaw = parseInt(row["Original Publication Year"] || "0", 10)
            const releaseYear = yearRaw > 0 ? yearRaw : undefined

            let status: "read" | "reading" | "want_to_read" = "want_to_read"
            const shelf = row["Exclusive Shelf"] || ""
            if (shelf === "read") status = "read"
            if (shelf === "currently-reading") status = "reading"

            const isbnRaw = String(row["ISBN13"] || row["ISBN"] || "").replace(/[^0-9X]/g, "")
            const isbn = isbnRaw.length > 0 ? isbnRaw : undefined

            const totalPagesRaw = parseInt(row["Number of Pages"] || "0", 10)
            const totalPages = totalPagesRaw > 0 ? totalPagesRaw : undefined
            const pagesRead = status === "read" && totalPages ? totalPages : 0

            return {
              type: "book" as const,
              title: row["Title"]?.trim(),
              author: row["Author"]?.trim() || undefined,
              isbn,
              status,
              user_rating: userRating,
              release_year: releaseYear,
              total_pages: totalPages,
              pages_read: pagesRead,
              date_completed: row["Date Read"] || undefined,
              date_added: row["Date Added"] || undefined,
              ingestion_source: "goodreads_csv" as const,
            }
          })
          .filter((item) => item.title)

        toast.info(`Found ${items.length} books in CSV. Importing in batches...`)

        const BATCH_SIZE = 10
        let totalInserted = 0

        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          const batch = items.slice(i, i + BATCH_SIZE)
          const res = await importGoodreadsBatch(batch)
          if (res.success && res.inserted) {
            totalInserted += res.inserted
          }
          setProgress(Math.round(((i + batch.length) / items.length) * 100))
        }

        setIsUploading(false)
        toast.success(`Import complete! Inserted ${totalInserted} new books.`)
      },
      error: (err) => {
        console.error(err)
        toast.error("Failed to parse CSV")
        setIsUploading(false)
      },
    })
  }

  /**
   * Declaration for handleFileUpload.
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    /**
     * Declaration for file.
     */
    const file = e.target.files?.[0]
    if (file) processCSV(file)
  }

  /**
   * Declaration for handleDragOver.
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  /**
   * Declaration for handleDragEnterImage.
   */
  const handleDragEnterImage = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingImage(true)
  }

  /**
   * Declaration for handleDragLeaveImage.
   */
  const handleDragLeaveImage = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingImage(false)
  }

  /**
   * Declaration for handleDragEnterCSV.
   */
  const handleDragEnterCSV = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingCSV(true)
  }

  /**
   * Declaration for handleDragLeaveCSV.
   */
  const handleDragLeaveCSV = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingCSV(false)
  }

  /**
   * Declaration for handleImageDrop.
   */
  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingImage(false)

    if (isExtracting) return

    /**
     * Declaration for file.
     */
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      processImage(file)
    } else if (file) {
      toast.error("Please drop an image file")
    }
  }

  /**
   * Declaration for handleCSVDrop.
   */
  const handleCSVDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingCSV(false)

    if (isUploading) return

    /**
     * Declaration for file.
     */
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      processCSV(file)
    } else if (file) {
      toast.error("Please drop a CSV file")
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Import Data"
        accent="library sync"
        description="Bring existing book and media libraries into the Vault."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Screenshot OCR */}
        <div
          className={`bg-surface shadow-card hover:shadow-card-hover relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 p-6 text-center transition-all duration-300 sm:p-8 ${
            isDraggingImage
              ? "border-primary bg-primary/10 scale-[1.01] border-solid shadow-md"
              : "border-border hover:border-primary/60 hover:bg-surface-hover border-dashed"
          }`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnterImage}
          onDragLeave={handleDragLeaveImage}
          onDrop={handleImageDrop}
        >
          <div className="text-primary bg-primary/10 border-primary/20 mb-1 flex h-12 w-12 items-center justify-center rounded-xl border">
            <PhotoCameraIcon sx={{ fontSize: 24 }} />
          </div>
          <h2 className="text-foreground text-base font-semibold">Image Spine Scanner</h2>
          <p className="text-muted max-w-sm text-xs">
            Drop a screenshot of a movie list, or a photo of a bookshelf or recipe. Titles will be
            extracted and saved.
          </p>

          <div className="mt-3 flex items-center justify-center gap-2">
            <label
              className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all duration-200 select-none ${
                isExtracting
                  ? "bg-surface-elevated text-muted border-border cursor-not-allowed border opacity-60"
                  : "bg-primary hover:bg-primary-hover dark:text-primary-fg shadow-card hover:shadow-card-hover border-primary/30 border text-white active:scale-95"
              }`}
            >
              <PhotoCameraIcon sx={{ fontSize: 16, color: "#ffffff" }} className="text-white" />
              <span>{isExtracting ? "Extracting..." : "Upload Image"}</span>
              <input
                type="file"
                hidden
                accept="image/*"
                disabled={isExtracting}
                onChange={handleImageUpload}
              />
            </label>

            <label
              className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-xs font-semibold transition-all select-none md:hidden ${
                isExtracting
                  ? "bg-surface-elevated text-muted border-border cursor-not-allowed border opacity-60"
                  : "bg-surface hover:bg-surface-elevated border-border hover:border-primary/50 text-foreground hover:text-primary border shadow-xs active:scale-95"
              }`}
              title="Take Photo"
              aria-label="Take Photo"
            >
              <PhotoCameraIcon fontSize="small" className="text-primary" />
              <input
                type="file"
                hidden
                accept="image/*"
                capture="environment"
                disabled={isExtracting}
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {extractedTitles.length > 0 && (
            <div className="mt-3 w-full max-w-xs text-left">
              <p className="text-primary mb-1.5 font-mono text-[11px] font-semibold tracking-wider uppercase">
                Ingesting Titles
              </p>
              <ul className="text-foreground bg-surface-elevated border-border divide-border max-h-32 divide-y overflow-y-auto rounded-lg border p-2.5 text-xs">
                {extractedTitles.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0"
                  >
                    <span className="truncate pr-2">{t.title}</span>
                    {t.status === "pending" && (
                      <span className="text-muted text-[10px]">Waiting...</span>
                    )}
                    {t.status === "loading" && (
                      <span className="text-primary animate-pulse text-[10px]">Searching...</span>
                    )}
                    {t.status === "success" && (
                      <span className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400">
                        Added
                      </span>
                    )}
                    {t.status === "failed" && (
                      <span className="text-[10px] font-semibold text-rose-500 dark:text-rose-400">
                        Failed
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Goodreads CSV */}
        <div
          className={`bg-surface shadow-card hover:shadow-card-hover relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 p-6 text-center transition-all duration-300 sm:p-8 ${
            isDraggingCSV
              ? "border-primary bg-primary/10 scale-[1.01] border-solid shadow-md"
              : "border-border hover:border-primary/60 hover:bg-surface-hover border-dashed"
          }`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnterCSV}
          onDragLeave={handleDragLeaveCSV}
          onDrop={handleCSVDrop}
        >
          <div className="text-primary bg-primary/10 border-primary/20 mb-1 flex h-12 w-12 items-center justify-center rounded-xl border">
            <FileUploadIcon sx={{ fontSize: 24 }} />
          </div>
          <h2 className="text-foreground text-base font-semibold">Goodreads CSV</h2>
          <p className="text-muted max-w-sm text-xs">
            Export your library from Goodreads and upload the CSV here to automatically sync your
            reading vault.
          </p>

          <div className="mt-3">
            <label
              className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all duration-200 select-none ${
                isUploading
                  ? "bg-surface-elevated text-muted border-border cursor-not-allowed border opacity-60"
                  : "bg-primary hover:bg-primary-hover dark:text-primary-fg shadow-card hover:shadow-card-hover border-primary/30 border text-white active:scale-95"
              }`}
            >
              <FileUploadIcon sx={{ fontSize: 16, color: "#ffffff" }} className="text-white" />
              <span>{isUploading ? `Importing... ${progress}%` : "Select CSV"}</span>
              <input
                type="file"
                hidden
                accept=".csv"
                disabled={isUploading}
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {isUploading && (
            <div className="mt-3 flex w-full max-w-xs flex-col items-center gap-2">
              <div className="bg-surface-elevated border-border h-2 w-full overflow-hidden rounded-full border p-0.5">
                <div
                  className="bg-primary h-full rounded-full shadow-xs transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-muted mt-1 flex items-center gap-1.5 font-mono text-[11px]">
                <WarningAmberIcon
                  sx={{ fontSize: 13 }}
                  className="text-amber-500 dark:text-amber-400"
                />{" "}
                Keep this page open until finished.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
