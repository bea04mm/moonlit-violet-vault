/**
 * Recipes gallery — server-fetched list with tabs: Want to Cook, Cooked, Other.
 * 
 * @packageDocumentation
 */
import { Suspense } from "react";
import type { Metadata } from "next";
import { getMediaList } from "@/lib/services/mediaService";
import { TabbedDashboard } from "@/components/media/TabbedDashboard";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

/**
 * Metadata configuration for the recipes gallery page.
 */
export const metadata: Metadata = {
  title: "Recipes",
  description: "My recipe collection in the vault.",
};

/**
 * The header node displayed at the top of the recipes gallery.
 */
const headerNode = (
  <div className="pt-2">
    <div className="flex items-center gap-3 mb-2">
      <RestaurantMenuIcon fontSize="large" sx={{ color: "var(--color-violet-400)" }} />
      <h1
        className="text-4xl font-display font-bold text-gradient-violet"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Recipes
      </h1>
    </div>
    <p className="text-sm" style={{ color: "var(--color-lunar-500)" }}>
      Culinary collection.
    </p>
  </div>
);

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
  });
  return (
    <TabbedDashboard type="recipe" items={recipes} headerNode={headerNode} />
  );
}

/**
 * Recipe gallery page — RSC, fetches and renders the recipe list server-side.
 */
export default function RecipesPage() {
  return (
    <div className="animate-fade-in -mt-8">
      <Suspense
        fallback={
          <div>
            <div 
              className="sticky top-23.25 md:top-16 z-30 pb-6 pt-4 border-b border-white/10" 
              style={{
                background: "color-mix(in srgb, var(--color-lunar-950) 85%, transparent)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                marginLeft: "calc(50% - 50vw)",
                marginRight: "calc(50% - 50vw)",
                paddingLeft: "calc(50vw - 50%)",
                paddingRight: "calc(50vw - 50%)",
              }}
            >
              {headerNode}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
              {[...Array(6)].map((_, i) => (
                <MediaCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <RecipesList />
      </Suspense>
    </div>
  );
}
