/**
 * Background cron endpoint to synchronize TV series data with TMDB.
 * 
 * @packageDocumentation
 */
import { NextResponse } from "next/server";
import { getMediaRepository } from "@/lib/repositories/mediaRepository";
import { syncSeriesSeasons } from "@/lib/actions/mediaActions";

/**
 * GET handler for the cron job.
 * Validates the CRON_SECRET authorization header, fetches all series,
 * and triggers a sync for items that haven't been synced in 24 hours.
 * @param request The incoming HTTP request containing the auth header.
 */
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized triggering
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    /**
     * The Authorization header containing the bearer token holding the cron secret.
     */
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  try {
    /**
     * Media repository instance for accessing and managing media records.
     */
    const repo = await getMediaRepository();
    
    // Fetch all series
    const series = await repo.findByType("series");
    
    /**
     * Counter tracking the number of series that were successfully synced during this run.
     */
    let syncedCount = 0;
    /**
     * The current timestamp, used to calculate the time difference since the last sync.
     */
    const now = new Date();
    
    for (const item of series) {
      if (!item.tmdb_id) continue;
      
      // If it has never been synced, or last sync was > 24 hours ago
      let needsSync = true;
      if (item.last_synced_at) {
        // Calculate the elapsed time in hours to prevent rate limiting from TMDB and redundant operations
        const lastSync = new Date(item.last_synced_at);
        const diffHours = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
        if (diffHours < 24) {
          needsSync = false;
        }
      }
      
      if (needsSync) {
        // We use the existing action so all logic is centralized
        // Note: in a huge vault, doing this sequentially in a loop could hit serverless function timeouts.
        // For a personal vault, it is perfectly fine.
        await syncSeriesSeasons(item.id, item.tmdb_id);
        syncedCount++;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Checked ${series.length} series. Synced ${syncedCount} series that were outdated.`
    });
    
  } catch (error: unknown) {
    console.error("[Cron] Auto-sync failed:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
