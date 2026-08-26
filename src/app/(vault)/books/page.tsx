// src/app/(vault)/books/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { getMediaList } from "@/lib/services/mediaService";
import { TabbedDashboard } from "@/components/media/TabbedDashboard";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import MenuBookIcon from "@mui/icons-material/MenuBook";

export const metadata: Metadata = {
  title: "Books",
  description: "My book collection in the vault.",
};

async function BooksList() {
  const books = await getMediaList({
    type: "book",
    sortBy: "date_added",
    sortOrder: "desc",
  });
  return (
    <TabbedDashboard type="book" items={books} />
  );
}

export default function BooksPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <MenuBookIcon fontSize="large" sx={{ color: "var(--color-violet-400)" }} />
          <h1
            className="text-4xl font-display font-bold text-gradient-violet"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Books
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--color-lunar-500)" }}>
          All the worlds you&apos;ve lived through.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <BooksList />
      </Suspense>
    </div>
  );
}
