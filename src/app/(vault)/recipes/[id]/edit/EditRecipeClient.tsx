/**
 * Client component for editing an existing recipe.
 * Pre-fills the form from the existing item, splits ingredient/instruction
 * arrays by newlines, and calls updateMediaProgress on submit.
 *
 * @packageDocumentation
 */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateMediaProgress } from "@/lib/actions/mediaActions"
import type { MediaItem } from "@/lib/supabase/database.types"
import { PageHeader } from "@/components/layout/PageHeader"
import { toast } from "sonner"

/**
 * Client-side form for editing a recipe.
 */
export function EditRecipeClient({ item }: { item: MediaItem }) {
  /**
   * Next.js router instance for navigating after the recipe is updated.
   */
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handles the form submission by parsing inputs, updating the recipe, and redirecting.
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const title = formData.get("title") as string
      const cover_url = formData.get("cover_url") as string
      const ingredientsStr = formData.get("ingredients") as string
      const instructionsStr = formData.get("instructions") as string

      const ingredients = ingredientsStr
        ? ingredientsStr
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
      const instructions = instructionsStr
        ? instructionsStr
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : []

      await updateMediaProgress(item.id, {
        title,
        cover_url: cover_url || undefined,
        ingredients,
        instructions,
      })

      toast.success("Recipe updated!")
      router.push(`/recipes/${item.id}`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update recipe")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-6 py-2">
      <PageHeader
        title="Edit Recipe"
        accent="adjust ingredients"
        description={`Update ingredients, steps, or photo for ${item.title}.`}
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
            defaultValue={item.title}
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
            defaultValue={item.cover_url || ""}
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
            defaultValue={((item.ingredients as string[]) || []).join("\n")}
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
            defaultValue={((item.instructions as string[]) || []).join("\n")}
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
