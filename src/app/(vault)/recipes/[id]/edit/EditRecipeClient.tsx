"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMediaProgress } from "@/lib/actions/mediaActions";
import type { MediaItem } from "@/lib/supabase/database.types";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { toast } from "sonner";

export function EditRecipeClient({ item }: { item: MediaItem }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const cover_url = formData.get("cover_url") as string;
      const ingredientsStr = formData.get("ingredients") as string;
      const instructionsStr = formData.get("instructions") as string;
      
      const ingredients = ingredientsStr ? ingredientsStr.split('\n').map(s => s.trim()).filter(Boolean) : [];
      const instructions = instructionsStr ? instructionsStr.split('\n').map(s => s.trim()).filter(Boolean) : [];

      await updateMediaProgress(item.id, {
        title,
        cover_url: cover_url || undefined,
        ingredients,
        instructions
      });
      
      toast.success("Recipe updated!");
      router.push(`/recipes/${item.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update recipe");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in p-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <RestaurantMenuIcon fontSize="large" sx={{ color: "var(--color-violet-400)" }} />
          <h1 className="text-3xl font-display font-bold text-gradient-violet">
            Edit Recipe
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-black/40 p-6 rounded-2xl border border-white/5 shadow-[var(--shadow-card)]">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-semibold text-[var(--color-lunar-200)]">
            Recipe Title *
          </label>
          <input
            id="title"
            name="title"
            required
            type="text"
            defaultValue={item.title}
            className="w-full bg-black/40 border border-[color-mix(in_srgb,var(--color-violet-500)_30%,transparent)] rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--color-lunar-500)] focus:outline-none focus:border-[var(--color-violet-400)] transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="cover_url" className="text-sm font-semibold text-[var(--color-lunar-200)]">
            Photo URL (Optional)
          </label>
          <input
            id="cover_url"
            name="cover_url"
            type="url"
            defaultValue={item.cover_url || ""}
            className="w-full bg-black/40 border border-[color-mix(in_srgb,var(--color-violet-500)_30%,transparent)] rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--color-lunar-500)] focus:outline-none focus:border-[var(--color-violet-400)] transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="ingredients" className="text-sm font-semibold text-[var(--color-lunar-200)]">
            Ingredients (One per line)
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            rows={5}
            defaultValue={(item.ingredients as string[] || []).join("\n")}
            className="w-full bg-black/40 border border-[color-mix(in_srgb,var(--color-violet-500)_30%,transparent)] rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--color-lunar-500)] focus:outline-none focus:border-[var(--color-violet-400)] transition-colors resize-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="instructions" className="text-sm font-semibold text-[var(--color-lunar-200)]">
            Instructions (One step per line)
          </label>
          <textarea
            id="instructions"
            name="instructions"
            rows={8}
            defaultValue={(item.instructions as string[] || []).join("\n")}
            className="w-full bg-black/40 border border-[color-mix(in_srgb,var(--color-violet-500)_30%,transparent)] rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--color-lunar-500)] focus:outline-none focus:border-[var(--color-violet-400)] transition-colors resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-lunar-300)] hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-violet-600)] text-white hover:bg-[var(--color-violet-500)] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Recipe"}
          </button>
        </div>
      </form>
    </div>
  );
}
