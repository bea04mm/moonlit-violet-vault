/**
 * Background cron and manual endpoint to synchronize TV series and movies data with TMDB.
 *
 * @packageDocumentation
 */
import { NextResponse } from "next/server"
import { syncAllSeriesAction, syncAllMoviesAction } from "@/lib/actions/mediaActions"

/**
 * Periodic GET handler invoked by Vercel Cron or client-side background triggers.
 * Verifies optional CRON_SECRET or same-origin internal headers, then synchronizes
 * active TV series episodes and vault movies against TMDB.
 *
 * @param request - Inbound HTTP Request
 * @returns JSON status report detailing sync outcome and counts
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get("authorization")
    const isInternal =
      request.headers.get("sec-fetch-site") === "same-origin" ||
      request.headers.get("x-internal-sync") === "true"
    if (!isInternal && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const [seriesResult, moviesResult] = await Promise.all([
    syncAllSeriesAction(false),
    syncAllMoviesAction(false),
  ])

  return NextResponse.json(
    { ...seriesResult, moviesUpdated: moviesResult.updatedCount },
    { status: seriesResult.success ? 200 : 500 }
  )
}

/**
 * On-demand POST handler for triggering a forced refresh of all series and movies
 * regardless of last-synced time.
 *
 * @returns JSON response with overall sync results
 */
export async function POST() {
  const [seriesResult, moviesResult] = await Promise.all([
    syncAllSeriesAction(true),
    syncAllMoviesAction(true),
  ])

  return NextResponse.json(
    { ...seriesResult, moviesUpdated: moviesResult.updatedCount },
    { status: seriesResult.success ? 200 : 500 }
  )
}
