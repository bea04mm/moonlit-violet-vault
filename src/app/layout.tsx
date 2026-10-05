/**
 * Root layout — wraps every page in the application.
 * Loads three Google fonts via Next.js font optimisation:
 *  - Geist Sans (body text)
 *  - Geist Mono (code/numbers)
 *  - Bricolage Grotesque (display/heading font, exposed as --font-display CSS var)
 * Sets viewport metadata, injects the MUI dark theme, registers the ServiceWorker,
 * and mounts the global CommandPalette (Ctrl+K) at the very top level.
 * 
 * @packageDocumentation
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import MuiProvider from "@/lib/mui/MuiProvider";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import "./globals.css";

/**
 * Configuration for the Geist Sans font, used globally for body text.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Configuration for the Geist Mono font, used for code snippets and numbers.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Configuration for the Bricolage Grotesque font, serving as the display and heading font.
 */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

import type { Viewport } from "next";

/**
 * Viewport configuration including theme colors for mobile browsers.
 */
export const viewport: Viewport = {
  themeColor: "#0a0a0f",
};

/**
 * Global application metadata including titles, descriptions, and OpenGraph tags.
 */
export const metadata: Metadata = {
  title: {
    default: "Moonlit Violet Vault",
    template: "%s · Moonlit Violet Vault",
  },
  manifest: "/manifest.json",
  description:
    "A personal media vault for movies, TV series, books, and recipes — beautifully organised under moonlit violet skies.",
  keywords: ["media tracker", "movies", "books", "tv series", "personal vault"],
  authors: [{ name: "Moonlit Violet Vault" }],
  appleWebApp: {
    title: "Vault",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  openGraph: {
    title: "Moonlit Violet Vault",
    description: "My personal media sanctuary.",
    type: "website",
  },
};

/**
 * The root layout component of the Next.js application.
 * Wraps all pages in necessary providers, injects global fonts, and applies base styling.
 * 
 * @param props - Component properties.
 * @param props.children - The child components and pages to render within the layout.
 * @returns The HTML structure containing the styled layout and wrapped children.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppRouterCacheProvider>
          <MuiProvider>
            <ServiceWorkerRegister />
            <CommandPalette />
            {children}
          </MuiProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
