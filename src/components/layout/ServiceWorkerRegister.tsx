/**
 * Invisible client component that registers the PWA service worker on mount.
 * Only runs in production to avoid cache-related headaches during local development.
 * Renders nothing — its sole purpose is the registration side effect.
 * 
 * @packageDocumentation
 */
"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (`/sw.js`) once the page has fully loaded.
 * Skipped entirely in development mode so hot-reloading works without stale cache issues.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register the Service Worker in production (Vercel)!
    // This avoids irritating cache errors while developing locally (npm run dev).
    if (process.env.NODE_ENV === "production" && typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.error("Service Worker registration failed: ", err);
        });
      });
    }
  }, []);

  return null;
}
