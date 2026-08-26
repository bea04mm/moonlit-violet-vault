// src/app/api/cron/sync-series/route.ts
import { NextResponse } from "next/server";
import { getMediaRepository } from "@/lib/repositories/mediaRepository";
import { syncSeriesSeasons } from "@/lib/actions/mediaActions";

// This route can be called via a Cron Job or from a client component
export async function GET(request: Request) {
  try {
    const repo = await getMediaRepository();
    
    // Fetch all series
    const series = await repo.findByType("series");
    
    let syncedCount = 0;
    const now = new Date();
    
    for (const item of series) {
      if (!item.tmdb_id) continue;
      
      // If it has never been synced, or last sync was > 24 hours ago
      let needsSync = true;
      if (item.last_synced_at) {
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
    
  } catch (error: any) {
    console.error("[Cron] Auto-sync failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
