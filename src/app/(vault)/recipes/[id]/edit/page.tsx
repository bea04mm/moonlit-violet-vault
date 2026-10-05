/**
 * Edit recipe server page — fetches the existing recipe item and passes it
 * to EditRecipeClient for rendering the pre-filled edit form.
 * 
 * @packageDocumentation
 */
import { notFound } from "next/navigation";
import { getMediaItem } from "@/lib/services/mediaService";
import { EditRecipeClient } from "./EditRecipeClient";

/**
 * Properties for the EditRecipePage, containing the dynamic route parameters.
 */
export interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Renders the Edit Recipe page by fetching the item to pre-fill the EditRecipeClient form.
 */
export default async function EditRecipePage({ params }: PageProps) {
  const { id } = await params;
  /**
   * The recipe item to edit, fetched by its unique identifier.
   */
  const item = await getMediaItem(id);

  if (!item || item.type !== "recipe") {
    notFound();
  }

  return <EditRecipeClient item={item} />;
}
