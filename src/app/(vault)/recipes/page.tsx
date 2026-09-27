// src/app/(vault)/recipes/page.tsx
// Recipes gallery page — RSC, fetches and renders recipe list server-side.

import { Suspense } from "react";
import type { Metadata } from "next";
import { getMediaList } from "@/lib/services/mediaService";
import { TabbedDashboard } from "@/components/media/TabbedDashboard";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

export const metadata: Metadata = {
  title: "Recipes",
  description: "My recipe collection in the vault.",
};

async function RecipesList() {
  const recipes = await getMediaList({
    type: "recipe",
    sortBy: "date_added",
    sortOrder: "desc",
  });
  return (
    <TabbedDashboard type="recipe" items={recipes} />
  );
}

export default function RecipesPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
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

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <RecipesList />
      </Suspense>
    </div>
  );
}
