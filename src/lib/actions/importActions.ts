"use server";

import { getMediaRepository } from "@/lib/repositories/mediaRepository";
import type { MediaItem } from "@/lib/supabase/database.types";
import { revalidatePath } from "next/cache";
import { searchGoogleBooks } from "./mediaActions";

export async function importGoodreadsBatch(books: Partial<MediaItem>[]) {
  try {
    const repo = await getMediaRepository();
    const existingBooks = await repo.findByType("book");
    
    let inserted = 0;
    for (const book of books) {
      if (!book.title) continue;
      
      const cleanBookTitle = book.title.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();
      
      const duplicate = existingBooks.find((e) => {
        if (e.isbn && book.isbn && e.isbn === book.isbn) return true;
        const eTitle = e.title.toLowerCase();
        return eTitle === book.title?.toLowerCase() || eTitle === cleanBookTitle || book.title?.toLowerCase().includes(eTitle);
      });

      // Always enrich from Google Books, even if it exists, to get missing covers
      try {
        let items: any[] = [];
        
        // 1. Try ISBN first if available
        if (book.isbn) {
          items = await searchGoogleBooks(`isbn:${book.isbn}`);
        }

        // 2. If no ISBN or ISBN failed, fallback to Title + Author fuzzy search
        let cleanTitle = book.title.replace(/\s*\(.*?\)\s*/g, "").trim(); // Remove (Series #1) etc
        
        if (items.length === 0) {
          const queryStr = `${cleanTitle} ${book.author || ""}`.trim();
          items = await searchGoogleBooks(queryStr);
        }

        // 3. If still nothing, remove subtitles (everything after a colon ":") and try again with author
        if (items.length === 0 && cleanTitle.includes(":")) {
          const ultraCleanTitle = cleanTitle.split(":")[0].trim();
          const queryStr = `${ultraCleanTitle} ${book.author || ""}`.trim();
          items = await searchGoogleBooks(queryStr);
        }

        // 4. Last resort: Just the ultra clean title, no author
        if (items.length === 0) {
          const ultraCleanTitle = cleanTitle.split(":")[0].trim();
          items = await searchGoogleBooks(ultraCleanTitle);
        }

        // 5. Process the best result we found
        if (items && items.length > 0) {
          const info = items[0].volumeInfo;
          if (info) {
            let coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
            if (coverUrl) {
              coverUrl = coverUrl.replace("zoom=1", "zoom=3").replace("http://", "https://");
            }
            book.title = info.title || book.title;
            book.cover_url = coverUrl || duplicate?.cover_url;
            book.synopsis = info.description || book.synopsis || duplicate?.synopsis;
            book.genres = info.categories || book.genres || duplicate?.genres;
          }
        }
      } catch (enrichError) {
        console.error("Enrichment error for", book.title, enrichError);
      }

      if (!duplicate) {
        await repo.insert(book);
        inserted++;
      } else {
        // If it already exists, update it with the new cover/synopsis
        await repo.update(duplicate.id, book);
        inserted++; // Count updates as well for the progress bar
      }
    }

    revalidatePath("/books");
    revalidatePath("/");
    
    return { success: true, inserted };
  } catch (error: any) {
    console.error("Batch import error:", error);
    return { success: false, error: error.message };
  }
}
