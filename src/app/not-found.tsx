/**
 * Custom 404 page — shown when Next.js cannot match any route.
 * Renders a themed "lost in the cosmos" message with a link back to the vault dashboard.
 * 
 * @packageDocumentation
 */
"use client";

import Link from "next/link";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import NightlightIcon from "@mui/icons-material/Nightlight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/**
 * Renders the 404 Not Found page component.
 * Displays a themed cosmic error message and provides a navigation link back to the home page.
 * 
 * @returns The JSX element representing the 404 error page.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden bg-lunar-950">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500 opacity-10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blossom-500 opacity-5 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-lunar-900 border border-lunar-800 mb-8 shadow-lg relative">
          <NightlightIcon sx={{ fontSize: 48, color: "#b470ff" }} />
          <div className="absolute -top-2 -right-2 text-blossom-400 animate-pulse">
            <AutoAwesomeIcon />
          </div>
        </div>

        <h1 className="text-6xl font-display font-bold text-gradient-violet mb-4" style={{ fontFamily: "var(--font-display)" }}>
          404
        </h1>
        
        <h2 className="text-xl font-semibold text-white mb-3">
          Lost in the Void
        </h2>
        
        <p className="text-lunar-400 mb-10 leading-relaxed text-sm">
          It looks like this page drifted away into the dark side of the moon. 
          Let&apos;s get you back to the vault.
        </p>

        <Link 
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-2xl transition-all hover:scale-105 shadow-sm"
        >
          <ArrowBackIcon fontSize="small" />
          Back to Vault
        </Link>
      </div>
    </div>
  );
}
