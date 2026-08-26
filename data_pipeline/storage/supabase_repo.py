"""
data_pipeline/storage/supabase_repo.py
=======================================
Supabase repository — single source of truth for all database operations
in the data pipeline. Uses the Supabase Python client.

Requires:
  SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.
  (Use the service_role key for backend pipeline access — never expose it to the frontend.)
"""

import logging
import os
from typing import Any

from supabase import create_client, Client

logger = logging.getLogger("vault.pipeline.supabase")

TABLE = "media_items"


class SupabaseRepository:
    """Data access layer for media_items in Supabase."""

    def __init__(self) -> None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        if not url or not key:
            raise EnvironmentError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"
            )
        self.client: Client = create_client(url, key)

    def upsert(self, item: dict[str, Any]) -> dict[str, Any]:
        """Insert or update a single media item. Deduplicates on tmdb_id / google_books_id."""
        # Remove None values to avoid overwriting existing data
        clean = {k: v for k, v in item.items() if v is not None}
        result = (
            self.client.table(TABLE)
            .upsert(clean, on_conflict="tmdb_id,google_books_id")
            .execute()
        )
        if result.data:
            logger.info(f"Upserted: {clean.get('title')}")
            return result.data[0]
        return {}

    def upsert_many(self, items: list[dict[str, Any]]) -> tuple[int, int]:
        """Batch upsert a list of media items. Returns (inserted_count, skipped_count)."""
        if not items:
            return 0, 0

        inserted = 0
        skipped = 0

        # Batch in groups of 50 to avoid request size limits
        batch_size = 50
        for i in range(0, len(items), batch_size):
            batch = items[i : i + batch_size]
            clean_batch = [
                {k: v for k, v in item.items() if v is not None} for item in batch
            ]
            result = (
                self.client.table(TABLE)
                .upsert(clean_batch, on_conflict="tmdb_id,google_books_id")
                .execute()
            )
            inserted += len(result.data or [])
            skipped += len(batch) - len(result.data or [])

        return inserted, skipped

    def find_by_id(self, item_id: str) -> dict[str, Any] | None:
        """Fetch a single item by its UUID."""
        result = (
            self.client.table(TABLE)
            .select("*")
            .eq("id", item_id)
            .single()
            .execute()
        )
        return result.data

    def update(self, item_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        """Update specific fields of an existing item."""
        clean = {k: v for k, v in updates.items() if v is not None}
        result = (
            self.client.table(TABLE)
            .update(clean)
            .eq("id", item_id)
            .execute()
        )
        if result.data:
            logger.info(f"Updated item {item_id}")
            return result.data[0]
        return {}
