/**
 * Authentication middleware for the Moonlit Violet Vault.
 * Named `proxy.ts` (not `middleware.ts`) per this version of Next.js conventions.
 *
 * On every request it:
 *  1. Validates required Supabase env vars are present.
 *  2. Creates a Supabase server client backed by request cookies.
 *  3. Calls `getUser()` to verify the session.
 *  4. Enforces the ALLOWED_EMAIL whitelist — only one user may access the vault.
 *  5. Redirects unauthenticated / unauthorised users to /login.
 *  6. Redirects already-logged-in users away from /login to the dashboard.
 * 
 * @packageDocumentation
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Array of route prefixes that bypass authentication and are publicly accessible.
 */
const PUBLIC_PATHS = ["/login", "/auth"];

/**
 * Proxy middleware for handling authentication and authorization.
 * Next.js 16+ uses "proxy.ts" instead of the deprecated "middleware.ts".
 * Protects all vault routes via Supabase session validation + email whitelist.
 */
export default async function proxy(request: NextRequest) {
  // If Supabase env vars are not configured yet, let through to login page
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  /**
   * The public Supabase anonymous key from environment variables.
   */
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const { pathname } = request.nextUrl;
  /**
   * Boolean flag indicating whether the current request path matches any configured public paths.
   */
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!supabaseUrl || !supabaseKey) {
    // Env not configured — allow login page, block everything else
    if (!isPublicPath) {
      // Redirect to login if trying to access protected routes without config
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  /**
   * The initial Next.js response that will be modified to include refreshed session cookies.
   */
  let supabaseResponse = NextResponse.next({ request });

  /**
   * The Supabase server client instance for interacting with auth and modifying cookies.
   */
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session — do NOT remove this call
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath) {
    /**
     * Constructed URL for redirecting unauthenticated users to the login screen.
     */
    // Block access to protected routes for unauthenticated users
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    // Enforce single-user access via email whitelist
    const allowedEmail = process.env.ALLOWED_EMAIL;
    if (allowedEmail && user.email !== allowedEmail) {
      // Sign out unauthorized users and redirect with an error param
      await supabase.auth.signOut();
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "unauthorized");
      const redirectRes = NextResponse.redirect(loginUrl);
      // Copy cookie-clearing headers from supabaseResponse to the redirect
      supabaseResponse.cookies.getAll().forEach((cookie) =>
        redirectRes.cookies.set(cookie.name, cookie.value, cookie)
      );
      return redirectRes;
    }

    // Already authenticated — redirect away from login page
    if (pathname === "/login") {
      // Send authenticated users to the dashboard
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
  }

  return supabaseResponse;
}

/**
 * Configuration object defining the route matcher rules for the proxy middleware.
 * Ensures the proxy ignores static assets, image requests, and internal Next.js files.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
