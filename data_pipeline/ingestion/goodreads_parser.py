"""
data_pipeline/ingestion/goodreads_parser.py
============================================
Parses Goodreads CSV library exports into vault media_item dicts.

Goodreads CSV columns (key ones):
  Title, Author, My Rating, Date Read, Date Added,
  Bookshelves, Exclusive Shelf, ISBN, ISBN13,
  Number of Pages, Original Publication Year
"""

import logging
import re
from pathlib import Path
from typing import Any

import pandas as pd

logger = logging.getLogger("vault.pipeline.goodreads")

# Map Goodreads exclusive_shelf values to vault media_status
SHELF_TO_STATUS: dict[str, str] = {
    "read": "read",
    "currently-reading": "reading",
    "to-read": "want_to_read",
}


class GoodreadsParser:
    """Parses a Goodreads CSV export file into vault-ready dicts."""

    def parse(self, csv_path: str | Path) -> list[dict[str, Any]]:
        csv_path = Path(csv_path)
        if not csv_path.exists():
            raise FileNotFoundError(f"CSV file not found: {csv_path}")

        logger.info(f"Reading Goodreads CSV: {csv_path}")
        df = pd.read_csv(csv_path, dtype=str).fillna("")

        items = []
        for _, row in df.iterrows():
            item = self._row_to_item(row)
            if item:
                items.append(item)

        logger.info(f"Parsed {len(items)} valid books")
        return items

    def _row_to_item(self, row: pd.Series) -> dict[str, Any] | None:
        title = row.get("Title", "").strip()
        if not title:
            return None

        shelf = row.get("Exclusive Shelf", "to-read").strip()
        status = SHELF_TO_STATUS.get(shelf, "want_to_read")

        # Parse rating (Goodreads 0–5 → vault 0–10)
        raw_rating = row.get("My Rating", "0").strip()
        try:
            gr_rating = float(raw_rating)
            user_rating = round(gr_rating * 2, 1) if gr_rating > 0 else None
        except ValueError:
            user_rating = None

        # Parse year
        year_raw = row.get("Original Publication Year", "").strip()
        try:
            release_year = int(float(year_raw)) if year_raw else None
        except ValueError:
            release_year = None

        # Parse ISBN
        isbn_raw = row.get("ISBN13", row.get("ISBN", "")).strip()
        isbn = re.sub(r"[^0-9X]", "", isbn_raw) or None

        # Parse date fields
        date_read = row.get("Date Read", "").strip() or None
        date_added = row.get("Date Added", "").strip() or None

        return {
            "type": "book",
            "title": title,
            "author": row.get("Author", "").strip() or None,
            "status": status,
            "user_rating": user_rating,
            "isbn": isbn,
            "release_year": release_year,
            "date_completed": date_read,
            "date_added": date_added,
            "ingestion_source": "goodreads_csv",
            "raw_source_data": row.to_dict(),
        }
