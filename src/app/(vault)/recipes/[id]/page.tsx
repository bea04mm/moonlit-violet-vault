import { notFound } from "next/navigation";
import { getMediaItem } from "@/lib/services/mediaService";
import { MediaDetail } from "@/components/media/MediaDetail";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getMediaItem(id);
  
  if (!item || item.type !== "recipe") {
    return { title: "Not Found · Moonlit Violet Vault" };
  }
  
  return {
    title: `${item.title} · Recipe · Moonlit Violet Vault`,
    description: item.synopsis ?? `Details about ${item.title}`,
  };
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getMediaItem(id);

  if (!item || item.type !== "recipe") {
    notFound();
  }

  return <MediaDetail item={item} />;
}
