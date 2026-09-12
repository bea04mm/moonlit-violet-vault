"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are a media title extractor. 
The user will show you a screenshot (from Instagram, social media, or a streaming platform).
Your task: extract ALL movie, TV series, or book titles visible in the image.
Return ONLY a JSON array of objects with the extracted titles and their guessed type.
Valid types are EXACTLY: "movie", "series", or "book".
Example: [{"title": "Dune: Part Two", "type": "movie"}, {"title": "The Bear", "type": "series"}, {"title": "Normal People", "type": "book"}]
If no titles are found, return an empty array: []`;

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

    const userPrompt = `This screenshot likely contains ${mediaType} titles. Extract all visible media titles and return them as a JSON array.`;

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
        type: String(t?.type || "movie")
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
import type { MediaType } from "@/lib/supabase/database.types";

export async function ingestExtractedTitle(title: string, type: MediaType) {
  try {
    const results = await searchExternalMedia(title, type);
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
