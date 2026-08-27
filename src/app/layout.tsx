import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import MuiProvider from "@/lib/MuiProvider";
import { CommandPalette } from "@/components/layout/CommandPalette";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  title: {
    default: "Moonlit Violet Vault",
    template: "%s · Moonlit Violet Vault",
  },
  description:
    "A personal media vault for movies, TV series, and books — beautifully organised under moonlit violet skies.",
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
            <CommandPalette />
            {children}
          </MuiProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
