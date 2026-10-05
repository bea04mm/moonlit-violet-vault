/**
 * Creates a server-side Supabase client for React Server Components and Route Handlers.
 * Uses @supabase/ssr's `createServerClient` which reads/writes session cookies via
 * Next.js's `cookies()` helper — the correct approach for App Router server code.
 *
 * Usage: import { createClient } from "@/lib/supabase/server"
 * Never use this in 'use client' files — for browser use, use client.ts instead.
 * 
 * @packageDocumentation
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Returns an async Supabase client configured for the server environment.
 * Must be awaited because Next.js `cookies()` is now async in the App Router.
 *
 * The `setAll` cookie handler silently ignores errors when called from a
 * Server Component (where response headers are already committed). Cookies
 * can only be written in middleware and route handlers.
 */
export async function createClient() {
  /**
   * The cookie store instance representing the request's cookies.
   */
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — cookies can only be
            // set in middleware or route handlers. Ignore in RSC context.
          }
        },
      },
    }
  );
}
