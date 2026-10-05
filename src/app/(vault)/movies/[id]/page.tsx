/**
 * Movie detail page — fetches the item by UUID, validates type=movie,
 * generates dynamic metadata (title = movie title), renders MediaDetail.
 * 
 * @packageDocumentation
 */
import { notFound } from "next/navigation";
import { getMediaItem } from "@/lib/services/mediaService";
import { MediaDetail } from "@/components/media/MediaDetail";
import type { Metadata } from "next";

/**
 * Properties for the MovieDetailPage and generateMetadata functions, containing dynamic route parameters.
 */
export interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generates dynamic metadata for the movie detail page by fetching the movie's title and synopsis.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  /**
   * The media item fetched by its unique identifier.
   */
  const item = await getMediaItem(id);
  
  if (!item || item.type !== "movie") {
    return { title: "Not Found · Moonlit Violet Vault" };
  }
  
  return {
    title: `${item.title} · Movie · Moonlit Violet Vault`,
    description: item.synopsis ?? `Details about ${item.title}`,
  };
}

/**
 * Renders the Movie detail page by fetching the item and displaying it using the MediaDetail component.
 */
export default async function MovieDetailPage({ params }: PageProps) {
  const { id } = await params;
  /**
   * The media item fetched by its unique identifier.
   */
  const item = await getMediaItem(id);

  if (!item || item.type !== "movie") {
    notFound();
  }

  return <MediaDetail item={item} />;
}
