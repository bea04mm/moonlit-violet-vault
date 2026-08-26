"""
data_pipeline/enrichment/google_books_client.py
================================================
Fetches book metadata from the Google Books API.

Requires: GOOGLE_BOOKS_API_KEY environment variable.
"""

import logging
import os
from typing import Any

import requests

logger = logging.getLogger("vault.pipeline.google_books")

BOOKS_BASE = "https://www.googleapis.com/books/v1"


class GoogleBooksClient:
    """Client for querying Google Books to enrich book entries."""

    def __init__(self) -> None:
        self.api_key = os.getenv("GOOGLE_BOOKS_API_KEY")
        if not self.api_key:
            raise EnvironmentError("GOOGLE_BOOKS_API_KEY is not set")
        self.session = requests.Session()

    def _get(self, endpoint: str, params: dict) -> dict:
        params["key"] = self.api_key
        response = self.session.get(f"{BOOKS_BASE}{endpoint}", params=params, timeout=10)
        response.raise_for_status()
        return response.json()

    def search(self, title: str, author: str | None = None) -> dict[str, Any] | None:
        """Search for a book and return an enriched vault item dict."""
        query = f'intitle:"{title}"'
        if author:
            query += f' inauthor:"{author}"'
        data = self._get("/volumes", {"q": query, "maxResults": 5, "langRestrict": "en"})
        items = data.get("items", [])
        if not items:
            logger.warning(f"Google Books: No results for '{title}'")
            return None

        return self._map_to_item(items[0])

    def search_by_isbn(self, isbn: str) -> dict[str, Any] | None:
        """Search by ISBN for precise lookup."""
        data = self._get("/volumes", {"q": f"isbn:{isbn}"})
        items = data.get("items", [])
        if not items:
            return None
        return self._map_to_item(items[0])

    def enrich(self, item: dict[str, Any]) -> dict[str, Any] | None:
        """Re-enrich an existing vault book item."""
        if item.get("google_books_id"):
            data = self._get(f"/volumes/{item['google_books_id']}", {})
            return self._map_to_item(data)
        if item.get("isbn"):
            return self.search_by_isbn(item["isbn"])
        return self.search(item["title"], item.get("author"))

    def _map_to_item(self, volume: dict) -> dict[str, Any]:
        info = volume.get("volumeInfo", {})
        images = info.get("imageLinks", {})
        # Prefer higher-res thumbnail
        cover = images.get("thumbnail") or images.get("smallThumbnail")
        # Upgrade to larger size by swapping zoom param
        if cover:
            cover = cover.replace("zoom=1", "zoom=3").replace("http://", "https://")

        authors = info.get("authors", [])
        categories = info.get("categories", [])

        year = None
        pub_date = info.get("publishedDate", "")
        if pub_date:
            try:
                year = int(pub_date[:4])
            except (ValueError, TypeError):
                pass

        isbn_13 = next(
            (id_["identifier"] for id_ in info.get("industryIdentifiers", []) if id_["type"] == "ISBN_13"),
            None,
        )

        return {
            "type": "book",
            "title": info.get("title", ""),
            "original_title": None,
            "google_books_id": volume.get("id"),
            "isbn": isbn_13,
            "cover_url": cover,
            "synopsis": info.get("description") or None,
            "author": ", ".join(authors) if authors else None,
            "release_year": year,
            "genres": categories or None,
            "ingestion_source": "api_enrichment",
            "raw_source_data": info,
        }
