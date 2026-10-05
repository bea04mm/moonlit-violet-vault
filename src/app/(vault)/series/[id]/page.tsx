/**
 * Series detail page — same pattern as movies; validates type=series.
 * 
 * @packageDocumentation
 */
import { notFound } from "next/navigation";
import { getMediaItem } from "@/lib/services/mediaService";
import { MediaDetail } from "@/components/media/MediaDetail";
import type { Metadata } from "next";

/**
 * Properties for the SeriesDetailPage and generateMetadata functions, containing dynamic route parameters.
 */
export interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generates dynamic metadata for the series detail page by fetching the TV series' title and synopsis.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  /**
   * The media item fetched by its unique identifier.
   */
  const item = await getMediaItem(id);
  
  if (!item || item.type !== "series") {
    return { title: "Not Found · Moonlit Violet Vault" };
  }
  
  return {
    title: `${item.title} · Series · Moonlit Violet Vault`,
    description: item.synopsis ?? `Details about ${item.title}`,
  };
}

/**
 * Renders the Series detail page by fetching the item and displaying it using the MediaDetail component.
 */
export default async function SeriesDetailPage({ params }: PageProps) {
  const { id } = await params;
  /**
   * The media item fetched by its unique identifier.
   */
  const item = await getMediaItem(id);

  if (!item || item.type !== "series") {
    notFound();
  }

  return <MediaDetail item={item} />;
}
