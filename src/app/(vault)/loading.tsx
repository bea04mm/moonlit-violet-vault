import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

function SectionHeading({ children }: { children: string }) {
  return (
    <h2
      className="text-xs font-semibold uppercase tracking-widest mb-4"
      style={{ color: "var(--color-lunar-600)" }}
    >
      {children}
    </h2>
  );
}

export default function Loading() {
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-2">
          <AutoAwesomeIcon fontSize="large" sx={{ color: "var(--color-violet-400)" }} />
          <h1
            className="text-4xl font-display font-bold text-gradient-violet"
            style={{ fontFamily: "var(--font-display)" }}
          >
            My Vault
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--color-lunar-500)" }}>
          All movies, series, books, and recipes — beautifully organised.
        </p>
      </div>

      <section aria-label="Loading overview" className="mb-7">
        <SectionHeading>Overview</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="rounded-3xl min-h-45 animate-pulse bg-(--color-lunar-900)"
            />
          ))}
        </div>
      </section>

      <section aria-label="Loading favorites" className="mb-4">
        <SectionHeading>Favorites</SectionHeading>
        <div className="flex overflow-hidden px-[calc(7.5vw-1rem)] pb-4 sm:px-[calc((100%-26rem)/2)] md:px-0">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="mr-4 w-[85vw] sm:w-92 md:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)] h-40 sm:h-48 shrink-0"
            >
              <MediaCardSkeleton />
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Loading recently added">
        <SectionHeading>Recently Added</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <MediaCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
