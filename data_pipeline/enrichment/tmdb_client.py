"""
data_pipeline/enrichment/tmdb_client.py
=========================================
Fetches movie and TV series metadata from The Movie Database (TMDB) API.

Requires: TMDB_API_KEY environment variable.
"""

import logging
import os
from typing import Any

import requests

logger = logging.getLogger("vault.pipeline.tmdb")

TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"


class TmdbClient:
    """Client for querying TMDB to enrich movies and series."""

    def __init__(self) -> None:
        self.api_key = os.getenv("TMDB_API_KEY")
        if not self.api_key:
            raise EnvironmentError("TMDB_API_KEY is not set")
        self.session = requests.Session()
        self.session.headers.update({"Accept": "application/json"})

    def _get(self, endpoint: str, params: dict) -> dict:
        params["api_key"] = self.api_key
        response = self.session.get(f"{TMDB_BASE}{endpoint}", params=params, timeout=10)
        response.raise_for_status()
        return response.json()

    def search(self, title: str, media_type: str = "movie") -> dict[str, Any] | None:
        """Search for a title and return an enriched vault item dict."""
        endpoint = "/search/movie" if media_type == "movie" else "/search/tv"
        data = self._get(endpoint, {"query": title, "language": "en-US", "page": 1})
        results = data.get("results", [])
        if not results:
            logger.warning(f"TMDB: No results for '{title}'")
            return None

        top = results[0]
        return self._map_to_item(top, media_type)

    def enrich(self, item: dict[str, Any]) -> dict[str, Any] | None:
        """Re-enrich an existing item using its tmdb_id or title."""
        if item.get("tmdb_id"):
            endpoint = f"/{'movie' if item['type'] == 'movie' else 'tv'}/{item['tmdb_id']}"
            data = self._get(endpoint, {"language": "en-US"})
            return self._map_details(data, item["type"])
        return self.search(item["title"], item["type"])

    def _map_to_item(self, result: dict, media_type: str) -> dict[str, Any]:
        poster = result.get("poster_path")
        title_key = "title" if media_type == "movie" else "name"
        date_key = "release_date" if media_type == "movie" else "first_air_date"
        year = None
        if result.get(date_key):
            try:
                year = int(result[date_key][:4])
            except (ValueError, TypeError):
                pass

        return {
            "type": media_type,
            "title": result.get(title_key, ""),
            "original_title": result.get("original_title") or result.get("original_name"),
            "tmdb_id": result.get("id"),
            "cover_url": f"{TMDB_IMAGE_BASE}{poster}" if poster else None,
            "synopsis": result.get("overview") or None,
            "release_year": year,
            "ingestion_source": "api_enrichment",
            "raw_source_data": result,
        }

    def _map_details(self, data: dict, media_type: str) -> dict[str, Any]:
        genres = [g["name"] for g in data.get("genres", [])]
        poster = data.get("poster_path")
        title_key = "title" if media_type == "movie" else "name"
        date_key = "release_date" if media_type == "movie" else "first_air_date"
        year = None
        if data.get(date_key):
            try:
                year = int(data[date_key][:4])
            except (ValueError, TypeError):
                pass

        item: dict[str, Any] = {
            "type": media_type,
            "title": data.get(title_key, ""),
            "original_title": data.get("original_title") or data.get("original_name"),
            "tmdb_id": data.get("id"),
            "cover_url": f"{TMDB_IMAGE_BASE}{poster}" if poster else None,
            "synopsis": data.get("overview") or None,
            "release_year": year,
            "genres": genres or None,
            "ingestion_source": "api_enrichment",
        }

        if media_type == "movie":
            item["runtime_minutes"] = data.get("runtime")
            directors = [
                c["name"]
                for c in data.get("credits", {}).get("crew", [])
                if c.get("job") == "Director"
            ]
            item["director"] = directors[0] if directors else None
        else:
            item["season_count"] = data.get("number_of_seasons")
            item["episode_count"] = data.get("number_of_episodes")

        return item
