"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

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

export async function extractTitlesFromImage(formData: FormData) {
  try {
    const base64Image = formData.get("image") as string;
    const mimeType = formData.get("mimeType") as string;
    const mediaType = (formData.get("mediaType") as string) || "movie";
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("Missing GOOGLE_API_KEY in environment variables.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.6-flash", 
      systemInstruction: SYSTEM_PROMPT 
    });

    const userPrompt = `Extract all visible media titles or recipes from this image and return them as a JSON array.`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: mimeType,
        },
      },
      userPrompt,
    ]);

    const text = result.response.text();
    const cleaned = text.replace(/```(?:json)?\s*|\s*```/g, "").trim();
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

import { searchExternalMedia, addMediaToVault } from "./mediaActions";
import type { MediaType, MediaItem } from "@/lib/supabase/database.types";

export async function ingestExtractedTitle(item: any) {
  try {
    if (item.type === "recipe" && (item.ingredients?.length > 0 || item.instructions?.length > 0)) {
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
