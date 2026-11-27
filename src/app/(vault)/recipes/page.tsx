/**
 * Recipes gallery — server-fetched list with tabs: Want to Cook, Cooked, Other.
 *
 * @packageDocumentation
 */
import { Suspense } from "react"
import type { Metadata } from "next"
import { getMediaList } from "@/lib/services/mediaService"
import { TabbedDashboard, TabbedDashboardLoading } from "@/components/media/TabbedDashboard"

/**
 * Metadata configuration for the recipes gallery page.
 */
export const metadata: Metadata = {
  title: "Recipes",
  description: "Recipe collection in the vault.",
}

/**
 * Server component that fetches the list of recipes and renders them in a TabbedDashboard.
 */
async function RecipesList() {
  /**
   * The complete list of recipes fetched from the media service.
   */
  const recipes = await getMediaList({
    type: "recipe",
    sortBy: "date_added",
    sortOrder: "desc",
  })
  return (
    <TabbedDashboard
      type="recipe"
      items={recipes}
      title="Recipes"
      accent="cookbook"
      description="Culinary collection & kitchen notes."
    />
  )
}

/**
 * Recipe gallery page — RSC, fetches and renders the recipe list server-side.
 */
export default function RecipesPage() {
  return (
    <div className="animate-fade-in">
      <Suspense
        fallback={
          <TabbedDashboardLoading
            type="recipe"
            title="Recipes"
            accent="cookbook"
            description="Culinary collection & kitchen notes."
          />
        }
      >
        <RecipesList />
      </Suspense>
    </div>
  )
}
