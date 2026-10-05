/**
 * Manual recipe creation form — client component with fields for
 * title, cover URL, ingredients (one per line), and instructions (one per line).
 * Submits via the createManualRecipe server action and redirects to the new recipe.
 * 
 * @packageDocumentation
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createManualRecipe } from "@/lib/actions/mediaActions";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

/**
 * Renders the form page for manually creating a new recipe in the vault.
 */
export default function NewRecipePage() {
  /**
   * Next.js router instance for navigating after form submission.
   */
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles the form submission to create a new recipe, then redirects to the recipe detail page.
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const id = await createManualRecipe(formData);
      router.push(`/recipes/${id}`);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : null) || "Failed to create recipe");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in p-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <RestaurantMenuIcon fontSize="large" sx={{ color: "var(--color-violet-400)" }} />
          <h1 className="text-3xl font-display font-bold text-gradient-violet">
            Write a Recipe
          </h1>
        </div>
        <p className="text-sm text-lunar-500">
          Manually enter a recipe into the vault.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-black/40 p-6 rounded-2xl border border-white/5 shadow-(--shadow-card)">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-semibold text-lunar-200">
            Recipe Title *
          </label>
          <input
            id="title"
            name="title"
            required
            type="text"
            placeholder="e.g., Grandma's Apple Pie"
            className="w-full bg-black/40 border border-[color-mix(in_srgb,var(--color-violet-500)_30%,transparent)] rounded-xl px-4 py-3 text-sm text-white placeholder-lunar-500 focus:outline-none focus:border-violet-400 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="cover_url" className="text-sm font-semibold text-lunar-200">
            Photo URL (Optional)
          </label>
          <input
            id="cover_url"
            name="cover_url"
            type="url"
            placeholder="https://example.com/photo.jpg"
            className="w-full bg-black/40 border border-[color-mix(in_srgb,var(--color-violet-500)_30%,transparent)] rounded-xl px-4 py-3 text-sm text-white placeholder-lunar-500 focus:outline-none focus:border-violet-400 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="ingredients" className="text-sm font-semibold text-lunar-200">
            Ingredients (One per line)
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            rows={5}
            placeholder="2 cups flour\n1 cup sugar\n..."
            className="w-full bg-black/40 border border-[color-mix(in_srgb,var(--color-violet-500)_30%,transparent)] rounded-xl px-4 py-3 text-sm text-white placeholder-lunar-500 focus:outline-none focus:border-violet-400 transition-colors resize-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="instructions" className="text-sm font-semibold text-lunar-200">
            Instructions (One step per line)
          </label>
          <textarea
            id="instructions"
            name="instructions"
            rows={8}
            placeholder="Preheat oven to 350F.\nMix dry ingredients.\n..."
            className="w-full bg-black/40 border border-[color-mix(in_srgb,var(--color-violet-500)_30%,transparent)] rounded-xl px-4 py-3 text-sm text-white placeholder-lunar-500 focus:outline-none focus:border-violet-400 transition-colors resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-lunar-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-(--color-violet-500) transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Saving..." : "Save Recipe"}
          </button>
        </div>
      </form>
    </div>
  );
}
