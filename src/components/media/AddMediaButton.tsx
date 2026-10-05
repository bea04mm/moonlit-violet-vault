/**
 * Floating action button (FAB) fixed to the bottom-right corner of every vault page.
 * Clicking it opens the AddMediaModal search overlay.
 * The button and modal are co-located here to share a single `isOpen` state.
 * 
 * @packageDocumentation
 */
"use client";

import { useState } from "react";
import { AddMediaModal } from "./AddMediaModal";
import AddIcon from "@mui/icons-material/Add";

/**
 * Floating "+" button that launches the media search and add workflow.
 * Always visible on vault pages, positioned with `fixed` so it floats above content.
 */
export function AddMediaButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-(--color-violet-500) text-white hover:bg-violet-400 transition-transform hover:scale-110 shadow-[0_4px_14px_0_rgba(167,139,250,0.39)] cursor-pointer"
        aria-label="Add Media"
        title="Add Media"
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </button>

      <AddMediaModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
