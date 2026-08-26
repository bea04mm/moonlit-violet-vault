"""
data_pipeline/ingestion/ocr_extractor.py
=========================================
Extracts media titles from screenshots using Google Gemini Vision (default)
or OpenAI GPT-4o Vision as a fallback.

Configure via environment variables:
  VLM_PROVIDER=gemini (default) | openai
  GOOGLE_API_KEY=...
  OPENAI_API_KEY=...
"""

import base64
import logging
import os
from pathlib import Path

logger = logging.getLogger("vault.pipeline.ocr")

SYSTEM_PROMPT = """You are a media title extractor. 
The user will show you a screenshot (from Instagram, social media, or a streaming platform).
Your task: extract ALL movie, TV series, or book titles visible in the image.
Return ONLY a JSON array of strings with the extracted titles, nothing else.
Example: ["Dune: Part Two", "The Bear", "Normal People"]
If no titles are found, return an empty array: []"""


class OcrExtractor:
    """Extracts media titles from images using a Vision-Language Model."""

    def __init__(self) -> None:
        self.provider = os.getenv("VLM_PROVIDER", "gemini").lower()
        logger.info(f"OCR provider: {self.provider}")

    def extract_title(self, image_path: str | Path, media_type: str = "movie") -> str:
        """
        Extract the most likely single title from an image.
        For multi-title extraction, use extract_all_titles().
        """
        titles = self.extract_all_titles(image_path, media_type)
        if not titles:
            raise ValueError(f"No media titles found in: {image_path}")
        return titles[0]

    def extract_all_titles(
        self, image_path: str | Path, media_type: str = "movie"
    ) -> list[str]:
        """Extract all media titles visible in the image."""
        image_path = Path(image_path)
        if not image_path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        image_b64 = self._encode_image(image_path)

        if self.provider == "gemini":
            return self._extract_with_gemini(image_b64, image_path.suffix, media_type)
        elif self.provider == "openai":
            return self._extract_with_openai(image_b64, image_path.suffix, media_type)
        else:
            raise ValueError(f"Unknown VLM provider: {self.provider}")

    def _encode_image(self, path: Path) -> str:
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")

    def _user_prompt(self, media_type: str) -> str:
        return (
            f"This screenshot likely contains {media_type} titles. "
            "Extract all visible media titles and return them as a JSON array."
        )

    def _parse_response(self, text: str) -> list[str]:
        """Parse JSON array from VLM response, tolerating markdown fences."""
        import json
        import re

        # Strip markdown code fences if present
        cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", text.strip())
        try:
            result = json.loads(cleaned)
            if isinstance(result, list):
                return [str(t).strip() for t in result if t]
        except json.JSONDecodeError:
            logger.warning(f"Could not parse VLM response as JSON: {text!r}")
        return []

    def _extract_with_gemini(
        self, image_b64: str, suffix: str, media_type: str
    ) -> list[str]:
        import google.generativeai as genai

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise EnvironmentError("GOOGLE_API_KEY is not set")

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=SYSTEM_PROMPT,
        )

        mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
        mime = mime_map.get(suffix.lower(), "image/jpeg")

        response = model.generate_content(
            [
                {"mime_type": mime, "data": image_b64},
                self._user_prompt(media_type),
            ]
        )
        return self._parse_response(response.text)

    def _extract_with_openai(
        self, image_b64: str, suffix: str, media_type: str
    ) -> list[str]:
        from openai import OpenAI

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise EnvironmentError("OPENAI_API_KEY is not set")

        client = OpenAI(api_key=api_key)
        mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
        mime = mime_map.get(suffix.lower(), "image/jpeg")

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime};base64,{image_b64}"},
                        },
                        {"type": "text", "text": self._user_prompt(media_type)},
                    ],
                },
            ],
            max_tokens=512,
        )
        return self._parse_response(response.choices[0].message.content or "")
