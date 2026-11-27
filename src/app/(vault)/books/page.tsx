/**
 * Books gallery — server-fetched list rendered in a TabbedDashboard
 * with tabs for Reading, Want to Read, Read, and Other.
 *
 * @packageDocumentation
 */
import { Suspense } from "react"
import type { Metadata } from "next"
import { getMediaList } from "@/lib/services/mediaService"
import { TabbedDashboard, TabbedDashboardLoading } from "@/components/media/TabbedDashboard"

/**
 * Metadata configuration for the books gallery page.
 */
export const metadata: Metadata = {
  title: "Books",
  description: "Book collection in the vault.",
}

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
  })
  return (
    <TabbedDashboard
      type="book"
      items={books}
      title="Books"
      accent="reading room"
      description="Literary collection & reading progress."
    />
  )
}

/**
 * Renders the Books gallery page, wrapping the book list in a Suspense boundary with a skeleton fallback.
 */
export default function BooksPage() {
  return (
    <div className="animate-fade-in">
      <Suspense
        fallback={
          <TabbedDashboardLoading
            type="book"
            title="Books"
            accent="reading room"
            description="Literary collection & reading progress."
          />
        }
      >
        <BooksList />
      </Suspense>
    </div>
  )
}
