/**
 * Creates a browser-side Supabase client for use inside Client Components.
 * This uses @supabase/ssr's `createBrowserClient` which correctly handles
 * cookie-based auth tokens in the browser without exposing the service key.
 *
 * Usage: import { createClient } from "@/lib/supabase/client"
 * Only use this in files marked "use client" — for server-side, use server.ts.
 * 
 * @packageDocumentation
 */
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Returns a Supabase client configured for the browser environment.
 * Re-creates the client on every call (stateless), but internally the SDK
 * caches the connection so this is safe to call multiple times.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
