/**
 * Analytics dashboard — fetches vault-wide data on the server and passes it
 * to AnalyticsCharts for rendering charts (library breakdown, status distribution,
 * time invested) and the Vault Wrapped launcher.
 * 
 * @packageDocumentation
 */
import { Suspense } from "react";
import type { Metadata } from "next";
import { getAnalyticsData } from "@/lib/services/mediaService";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import BarChartIcon from "@mui/icons-material/BarChart";

/**
 * Metadata configuration for the analytics dashboard page.
 */
export const metadata: Metadata = {
  title: "Analytics",
  description: "Visualize media consumption.",
};

/**
 * Server component that fetches vault-wide analytics data and renders the analytics charts.
 */
async function AnalyticsContent() {
  /**
   * Vault-wide analytics data fetched from the media service.
   */
  const data = await getAnalyticsData();
  return <AnalyticsCharts data={data} />;
}

/**
 * Fallback loading skeleton for the analytics dashboard, displaying animated placeholders.
 */
function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-3xl h-64 animate-pulse" style={{ background: "var(--color-lunar-900)" }} />
        ))}
      </div>
    </div>
  );
}

/**
 * Renders the Analytics dashboard page, displaying a header and wrapping the chart content in a Suspense boundary.
 */
export default function AnalyticsPage() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BarChartIcon fontSize="large" sx={{ color: "var(--color-violet-400)" }} />
          <h1
            className="text-4xl font-display font-bold text-gradient-violet"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Analytics
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--color-lunar-500)" }}>
          A deep dive into the library and consumption habits.
        </p>
      </div>

      <Suspense fallback={<AnalyticsLoading />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
