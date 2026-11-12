/**
 * Manual recipe creation form — client component with fields for
 * title, cover URL, ingredients (one per line), and instructions (one per line).
 * Submits via the createManualRecipe server action and redirects to the new recipe.
 *
 * @packageDocumentation
 */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createManualRecipe } from "@/lib/actions/mediaActions"
import { PageHeader } from "@/components/layout/PageHeader"

/**
 * Renders the form page for manually creating a new recipe in the vault.
 */
export default function NewRecipePage() {
  /**
   * Next.js router instance for navigating after form submission.
   */
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handles the form submission to create a new recipe, then redirects to the recipe detail page.
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const id = await createManualRecipe(formData)
      router.push(`/recipes/${id}`)
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : null) || "Failed to create recipe")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-6 py-2">
      <PageHeader
        title="Write a Recipe"
        accent="kitchen notes"
        description="Manually enter a recipe into your personal vault cookbook."
      />

      <form
        onSubmit={handleSubmit}
        className="bg-surface border-border space-y-5 rounded-xl border p-6 shadow-sm"
      >
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="title" className="text-foreground text-xs font-semibold">
            Recipe Title *
          </label>
          <input
            id="title"
            name="title"
            required
            type="text"
            placeholder="e.g., Rosemary Focaccia"
            className="bg-surface border-border hover:border-border-hover text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/35 w-full rounded-xl border px-3.5 py-2.5 text-[13px] transition-all focus:ring-2 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cover_url" className="text-foreground text-xs font-semibold">
            Photo URL (Optional)
          </label>
          <input
            id="cover_url"
            name="cover_url"
            type="url"
            placeholder="https://example.com/photo.jpg"
            className="bg-surface border-border hover:border-border-hover text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/35 w-full rounded-xl border px-3.5 py-2.5 text-[13px] transition-all focus:ring-2 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ingredients" className="text-foreground text-xs font-semibold">
            Ingredients (One per line)
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            rows={5}
            placeholder="500g bread flour&#10;400ml lukewarm water&#10;7g instant yeast&#10;10g salt&#10;Extra virgin olive oil"
            className="bg-surface border-border hover:border-border-hover text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/35 w-full resize-none rounded-xl border px-3.5 py-2.5 text-[13px] transition-all focus:ring-2 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="instructions" className="text-foreground text-xs font-semibold">
            Instructions (One step per line)
          </label>
          <textarea
            id="instructions"
            name="instructions"
            rows={7}
            placeholder="Combine flour, yeast, water, and salt into a wet dough.&#10;Perform stretch and folds every 30 minutes for 2 hours.&#10;Transfer to an oiled baking tray and dimple with fingers.&#10;Bake at 220°C for 25 minutes until golden."
            className="bg-surface border-border hover:border-border-hover text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/35 w-full resize-none rounded-xl border px-3.5 py-2.5 text-[13px] transition-all focus:ring-2 focus:outline-none"
          />
        </div>

        <div className="border-border flex justify-end gap-2.5 border-t pt-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-muted hover:text-foreground hover:bg-surface-elevated cursor-pointer rounded-lg px-4 py-2 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-fg cursor-pointer rounded-lg px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Recipe"}
          </button>
        </div>
      </form>
    </div>
  )
}
