/**
 * Analytics dashboard — fetches vault-wide data on the server and passes it
 * to AnalyticsCharts for rendering charts (library breakdown, status distribution,
 * time invested) and the Vault Wrapped launcher.
 *
 * @packageDocumentation
 */
import { Suspense } from "react"
import type { Metadata } from "next"
import { getAnalyticsData } from "@/lib/services/mediaService"
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts"
import { PageHeader } from "@/components/layout/PageHeader"

/**
 * Metadata configuration for the analytics dashboard page.
 */
export const metadata: Metadata = {
  title: "Analytics",
  description: "Visualize media consumption.",
}

/**
 * Server component that fetches vault-wide analytics data and renders the analytics charts.
 */
async function AnalyticsContent() {
  /**
   * Vault-wide analytics data fetched from the media service.
   */
  const data = await getAnalyticsData()
  return <AnalyticsCharts data={data} />
}

/**
 * Fallback loading skeleton for the analytics dashboard, displaying animated placeholders.
 */
function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface border-border h-64 animate-pulse rounded-xl border" />
        ))}
      </div>
    </div>
  )
}

/**
 * Renders the Analytics dashboard page, displaying a header and wrapping the chart content in a Suspense boundary.
 */
export default function AnalyticsPage() {
  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Analytics"
        accent="insights & habits"
        description="A deep dive into your library distribution and time invested."
      />

      <Suspense fallback={<AnalyticsLoading />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  )
}
