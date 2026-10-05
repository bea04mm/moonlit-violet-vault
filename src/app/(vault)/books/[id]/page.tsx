/**
 * Book detail page — same pattern as movies; validates type=book,
 * which also enables the BookMatchFixer and reading journal in MediaDetail.
 * 
 * @packageDocumentation
 */
import { notFound } from "next/navigation";
import { getMediaItem } from "@/lib/services/mediaService";
import { MediaDetail } from "@/components/media/MediaDetail";
import type { Metadata } from "next";
/**
 * Properties for the BookDetailPage and generateMetadata functions, containing the dynamic route parameters.
 */
export interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generates dynamic metadata for the book detail page by fetching the book's title and synopsis.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  /**
   * The media item fetched by its unique identifier.
   */
  const item = await getMediaItem(id);
  
  if (!item || item.type !== "book") {
    return { title: "Not Found · Moonlit Violet Vault" };
  }
  
  return {
    title: `${item.title} · Book · Moonlit Violet Vault`,
    description: item.synopsis ?? `Details about ${item.title}`,
  };
}

/**
 * Renders the Book detail page by fetching the item and displaying it using the MediaDetail component.
 */
export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  /**
   * The media item fetched by its unique identifier.
   */
  const item = await getMediaItem(id);

  if (!item || item.type !== "book") {
    notFound();
  }

  return <MediaDetail item={item} />;
}
