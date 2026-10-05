/**
 * Supabase OAuth callback route.
 * 
 * @packageDocumentation
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Handles the OAuth callback from Supabase.
 * Exchanges the authorization code for a session and redirects to the appropriate URL.
 * @param request The incoming HTTP request containing the code and next URL parameters.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  /**
   * The OAuth authorization code returned by Supabase to exchange for a session.
   */
  const code = searchParams.get("code");
  /**
   * The unvalidated redirect path provided via the 'next' search parameter, defaulting to root.
   */
  const rawNext = searchParams.get("next") ?? "/";
  /**
   * The sanitized redirect path ensuring it's a relative path and not an external URL.
   */
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (code) {
    /**
     * A read-write interface to the incoming request cookies and outgoing response cookies.
     */
    const cookieStore = await cookies();
    /**
     * The Supabase server client configured with cookies for SSR operations.
     */
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
}
