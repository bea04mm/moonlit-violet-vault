"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are a media title extractor. 
The user will show you a screenshot (from Instagram, social media, or a streaming platform).
Your task: extract ALL movie, TV series, or book titles visible in the image.
Return ONLY a JSON array of strings with the extracted titles, nothing else.
Example: ["Dune: Part Two", "The Bear", "Normal People"]
If no titles are found, return an empty array: []`;

export async function extractTitlesFromImage(base64Image: string, mimeType: string, mediaType: string = "movie") {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("Missing GOOGLE_API_KEY in environment variables.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash", 
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
    const titles = JSON.parse(cleaned);
    
    if (Array.isArray(titles)) {
      return { success: true, titles };
    }
    return { success: false, error: "Response was not an array", titles: [] };
  } catch (error: any) {
    console.error("OCR Error:", error);
    return { success: false, error: error.message || "Failed to extract titles", titles: [] };
  }
}
