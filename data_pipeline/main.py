"""
data_pipeline/main.py
=====================
Moonlit Violet Vault — Data Pipeline CLI Orchestrator

Usage:
  python main.py goodreads --file path/to/library.csv
  python main.py ocr --image path/to/screenshot.jpg --type movie
  python main.py enrich --id <uuid> --type movie

Environment:
  Copy .env.example to .env and fill in your API keys before running.
"""

import argparse
import sys
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("vault.pipeline")


def cmd_goodreads(args: argparse.Namespace) -> None:
    """Import books from a Goodreads CSV export."""
    from ingestion.goodreads_parser import GoodreadsParser
    from storage.supabase_repo import SupabaseRepository

    logger.info(f"Importing Goodreads CSV: {args.file}")
    parser = GoodreadsParser()
    items = parser.parse(args.file)
    logger.info(f"Parsed {len(items)} books from CSV")

    repo = SupabaseRepository()
    inserted, skipped = repo.upsert_many(items)
    logger.info(f"Done — inserted: {inserted}, skipped (duplicates): {skipped}")


def cmd_ocr(args: argparse.Namespace) -> None:
    """Extract media title from a screenshot using a VLM."""
    from ingestion.ocr_extractor import OcrExtractor
    from enrichment.tmdb_client import TmdbClient
    from enrichment.google_books_client import GoogleBooksClient
    from storage.supabase_repo import SupabaseRepository

    logger.info(f"Running OCR on: {args.image} (type={args.type})")
    extractor = OcrExtractor()
    title = extractor.extract_title(args.image, media_type=args.type)
    logger.info(f"Extracted title: '{title}'")

    # Enrich the extracted title
    media_item = None
    if args.type in ("movie", "series"):
        client = TmdbClient()
        media_item = client.search(title, media_type=args.type)
    elif args.type == "book":
        client = GoogleBooksClient()
        media_item = client.search(title)

    if media_item:
        repo = SupabaseRepository()
        repo.upsert(media_item)
        logger.info(f"Saved '{media_item.get('title')}' to vault")
    else:
        logger.warning(f"No enrichment data found for '{title}'")


def cmd_enrich(args: argparse.Namespace) -> None:
    """Re-enrich an existing vault item by its ID."""
    from storage.supabase_repo import SupabaseRepository
    from enrichment.tmdb_client import TmdbClient
    from enrichment.google_books_client import GoogleBooksClient

    repo = SupabaseRepository()
    item = repo.find_by_id(args.id)
    if not item:
        logger.error(f"No item found with id: {args.id}")
        sys.exit(1)

    logger.info(f"Re-enriching: {item['title']} (type={item['type']})")
    if item["type"] in ("movie", "series"):
        enriched = TmdbClient().enrich(item)
    else:
        enriched = GoogleBooksClient().enrich(item)

    if enriched:
        repo.update(args.id, enriched)
        logger.info("Enrichment complete")
    else:
        logger.warning("No enrichment data returned")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="vault-pipeline",
        description="Moonlit Violet Vault — data ingestion and enrichment pipeline",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # goodreads subcommand
    gr = subparsers.add_parser("goodreads", help="Import from Goodreads CSV export")
    gr.add_argument("--file", required=True, help="Path to the Goodreads library.csv")
    gr.set_defaults(func=cmd_goodreads)

    # ocr subcommand
    ocr = subparsers.add_parser("ocr", help="Extract title from a screenshot")
    ocr.add_argument("--image", required=True, help="Path to the screenshot image")
    ocr.add_argument(
        "--type",
        required=True,
        choices=["movie", "series", "book"],
        help="Expected media type",
    )
    ocr.set_defaults(func=cmd_ocr)

    # enrich subcommand
    enrich = subparsers.add_parser("enrich", help="Re-enrich an existing vault item")
    enrich.add_argument("--id", required=True, help="UUID of the vault item")
    enrich.set_defaults(func=cmd_enrich)

    return parser


if __name__ == "__main__":
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)
