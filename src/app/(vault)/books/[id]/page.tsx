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
  
  if (!item || item.type !== "book") {
    return { title: "Not Found · Moonlit Violet Vault" };
  }
  
  return {
    title: `${item.title} · Book · Moonlit Violet Vault`,
    description: item.synopsis ?? `Details about ${item.title}`,
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getMediaItem(id);

  if (!item || item.type !== "book") {
    notFound();
  }

  return <MediaDetail item={item} />;
}
