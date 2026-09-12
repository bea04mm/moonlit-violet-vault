// src/components/media/AddMediaButton.tsx
"use client";

import { useState } from "react";
import { AddMediaModal } from "./AddMediaModal";
import AddIcon from "@mui/icons-material/Add";

export function AddMediaButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-violet-500)] text-white hover:bg-[var(--color-violet-400)] transition-transform hover:scale-110 shadow-[0_4px_14px_0_rgba(167,139,250,0.39)]"
        aria-label="Add Media"
        title="Add Media"
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </button>

      <AddMediaModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
