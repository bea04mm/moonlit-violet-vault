import { notFound } from "next/navigation";
import { getMediaItem } from "@/lib/services/mediaService";
import { EditRecipeClient } from "./EditRecipeClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: PageProps) {
  const { id } = await params;
  const item = await getMediaItem(id);

  if (!item || item.type !== "recipe") {
    notFound();
  }

  return <EditRecipeClient item={item} />;
}
