/**
 * Floating action button that returns the viewport to the top after scrolling.
 *
 * @packageDocumentation
 */
"use client";

import { useEffect, useState } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

/**
 * Shows a back-to-top button after the user has scrolled down the page.
 */
export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-24 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/30 bg-(--color-lunar-900) text-violet-300 text-sm shadow-[0_4px_14px_0_rgba(167,139,250,0.25)] transition-all hover:scale-110 hover:bg-violet-950 cursor-pointer ${
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={isVisible ? 0 : -1}
    >
      <KeyboardArrowUpIcon />
    </button>
  );
}
