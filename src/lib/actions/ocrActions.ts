/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @module
 * 
 * Server Actions for AI-powered media extraction from images.
 * Uses the Google Gemini Vision API to:
 *  - Recognise movie/series/book title lists from screenshots.
 *  - Extract full recipes (ingredients + instructions) from recipe photos.
 * Extracted items are then automatically ingested into the vault via the
 * existing `searchExternalMedia` / `addMediaToVault` pipeline.
 *
 * Called from the Import page's "Magic AI Scanner" section.
 */
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchExternalMedia, addMediaToVault } from "./mediaActions";
import type { MediaType, MediaItem } from "@/lib/supabase/database.types";

/**
 * System instruction sent to Gemini on every image analysis request.
 * Defines the expected output format (JSON array) and the two extraction modes:
 * media title lists and full recipe objects.
 */
const SYSTEM_PROMPT = `You are an AI assistant that extracts media titles and full recipes from images.
The user will show you a screenshot or a photo.
1. If it's a list of media (movies, series, books), extract their titles.
2. If it's a photo of a recipe (handwritten, printed, or a screenshot), extract the recipe.
Return ONLY a JSON array of objects.

For media titles:
[{"title": "Dune: Part Two", "type": "movie"}]
Valid types: "movie", "series", "book".

For full recipes:
[{"title": "Bacalhau à Brás", "type": "recipe", "ingredients": ["1 onion", "2 potatoes"], "instructions": ["Chop onion", "Fry potatoes"]}]

If no recognizable media or recipes are found, return an empty array: []`;

/**
 * Sends an image to Gemini Vision and returns a list of recognised media titles or recipes.
 * @param formData - Must contain `image` (base64 data URL), `mimeType`, and `mediaType`.
 * @returns `OcrResponse` with a `titles` array on success or an `error` string on failure.
 */
export async function extractTitlesFromImage(formData: FormData) {
  try {
    /**
     * The base64 encoded image string extracted from the form data.
     */
    const base64Image = formData.get("image") as string;
    /**
     * The MIME type of the uploaded image.
     */
    const mimeType = formData.get("mimeType") as string;
    /**
     * The Google API key for authenticating Gemini Vision requests.
     */
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("Missing GOOGLE_API_KEY in environment variables.");

    /**
     * The initialized Google Generative AI client.
     */
    const genAI = new GoogleGenerativeAI(apiKey);
    /**
     * The Gemini 2.0 Flash model configured with OCR-specific system instructions.
     */
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash", 
      systemInstruction: SYSTEM_PROMPT 
    });

    /**
     * The specific prompt instructing the model to extract and return JSON.
     */
    const userPrompt = `Extract all visible media titles or recipes from this image and return them as a JSON array.`;

    /**
     * The raw response result returned from the Gemini model.
     */
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: mimeType,
        },
      },
      userPrompt,
    ]);

    /**
     * The text payload extracted from the model's response.
     */
    const text = result.response.text();
    /**
     * The cleaned text with markdown code block formatting removed.
     */
    // Strip markdown formatting from the Gemini response to safely parse the raw JSON string
    const cleaned = text.replace(/```(?:json)?\s*|\s*```/g, "").trim();
    /**
     * The parsed JSON array of extracted titles or recipes.
     */
    let titles;
    try {
      titles = JSON.parse(cleaned);
    } catch (parseErr: any) {
      console.error("JSON Parse Error on Gemini output:", cleaned);
      return { success: false, error: "JSON Parse failed: " + parseErr.message, titles: [] };
    }
    
    if (Array.isArray(titles)) {
      // Force a flat structure to prevent Next.js Server Action nesting errors
      const safeTitles = titles.map((t: any) => ({
        title: String(t?.title || t || ""),
        type: String(t?.type || "movie"),
        ingredients: Array.isArray(t?.ingredients) ? t.ingredients.map(String) : undefined,
        instructions: Array.isArray(t?.instructions) ? t.instructions.map(String) : undefined,
      })).filter(t => t.title.trim().length > 0);
      
      return { success: true, titles: safeTitles };
    }
    return { success: false, error: "Response was not an array", titles: [] };
  } catch (error: any) {
    console.error("OCR Error:", error);
    return { success: false, error: error.message || "Failed to extract titles", titles: [] };
  }
}

/**
 * Takes a single extracted item (title + type) and ingests it into the vault.
 * - For recipes with ingredient/instruction data, creates the item directly.
 * - For movies/series/books, searches the appropriate external API and adds
 *   the best match automatically.
 */
export async function ingestExtractedTitle(item: any) {
  try {
    if (item.type === "recipe" && (item.ingredients?.length > 0 || item.instructions?.length > 0)) {
      // Use dynamic imports to bypass potential circular dependencies or top-level execution side-effects
      const { getMediaRepository } = await import("@/lib/repositories/mediaRepository");
      const { revalidatePath } = await import("next/cache");
      
      const repo = await getMediaRepository();
      const newItem: Partial<MediaItem> = {
        type: "recipe",
        title: item.title,
        ingredients: item.ingredients || [],
        instructions: item.instructions || [],
        status: "want_to_cook",
        ingestion_source: "ocr_screenshot"
      };
      const saved = await repo.insert(newItem);
      revalidatePath("/", "layout");
      return { success: true, match: { title: item.title, type: "recipe", externalId: saved.id } };
    }

    /**
     * The array of potential matches retrieved from external media APIs.
     */
    const results = await searchExternalMedia(item.title, item.type as MediaType);
    if (results && results.length > 0) {
      const bestMatch = results[0];
      await addMediaToVault(bestMatch);
      return { success: true, match: bestMatch };
    }
    return { success: false, error: "No matches found" };
  } catch (error: any) {
    console.error("Ingest Error:", error);
    return { success: false, error: error.message };
  }
}
