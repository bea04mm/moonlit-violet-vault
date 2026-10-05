/**
 * Books gallery — server-fetched list rendered in a TabbedDashboard
 * with tabs for Reading, Want to Read, Read, and Other.
 * 
 * @packageDocumentation
 */
import { Suspense } from "react";
import type { Metadata } from "next";
import { getMediaList } from "@/lib/services/mediaService";
import { TabbedDashboard } from "@/components/media/TabbedDashboard";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import MenuBookIcon from "@mui/icons-material/MenuBook";

/**
 * Metadata configuration for the books gallery page.
 */
export const metadata: Metadata = {
  title: "Books",
  description: "My book collection in the vault.",
};

/**
 * The header node displayed at the top of the books gallery.
 */
const headerNode = (
  <div className="pt-2">
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
      Literary collection.
    </p>
  </div>
);

/**
 * Server component that fetches the list of books and renders them in a TabbedDashboard.
 */
async function BooksList() {
  /**
   * The complete list of books fetched from the media service.
   */
  const books = await getMediaList({
    type: "book",
    sortBy: "date_added",
    sortOrder: "desc",
  });
  return (
    <TabbedDashboard type="book" items={books} headerNode={headerNode} />
  );
}

/**
 * Renders the Books gallery page, wrapping the book list in a Suspense boundary with a skeleton fallback.
 */
export default function BooksPage() {
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
        <BooksList />
      </Suspense>
    </div>
  );
}
