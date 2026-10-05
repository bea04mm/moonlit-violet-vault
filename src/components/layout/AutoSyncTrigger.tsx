/**
 * Invisible background component that automatically keeps TV series data
 * up-to-date without the user having to do anything manually.
 * Mounted once inside VaultLayout; renders nothing to the DOM.
 * 
 * @packageDocumentation
 */
"use client";

import { useEffect, useRef } from "react";

/**
 * Fires a single request to the cron sync endpoint 3 seconds after the page loads.
 * The delay prevents this background task from competing with the initial page render.
 * A ref guard ensures the fetch happens at most once per navigation, even in React
 * Strict Mode where effects run twice in development.
 */
export function AutoSyncTrigger() {
  /**
   * Ref used to track if the sync request has already been initiated.
   */
  const hasTriggered = useRef(false);

  useEffect(() => {
    // Only run once per page load to avoid spamming the API in strict mode
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    // Wait a few seconds so it doesn't block initial page load performance
    const timer = setTimeout(() => {
      fetch("/api/cron/sync-series")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.message.includes("Synced") && !data.message.includes("Synced 0")) {
            console.log("[AutoSync]", data.message);
            // Optionally, we could trigger a router.refresh() here if we wanted to auto-update the UI,
            // but Next.js Server Actions usually revalidate on the server side anyway.
          }
        })
        .catch(err => console.error("[AutoSync] Failed:", err));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return null; // Invisible component — no DOM output
}
