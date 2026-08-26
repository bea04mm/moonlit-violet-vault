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
        className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-violet-500)] text-white hover:bg-[var(--color-violet-400)] transition-colors shadow-lg"
        style={{ boxShadow: "var(--shadow-glow-sm)" }}
        aria-label="Add Media"
        title="Add Media"
      >
        <AddIcon />
      </button>

      <AddMediaModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
