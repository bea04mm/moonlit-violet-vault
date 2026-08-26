// src/components/media/DeleteButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { deleteMediaFromVault } from "@/lib/actions/mediaActions";
import type { MediaType } from "@/lib/supabase/database.types";
import { toast } from "sonner";
import { Button } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

interface DeleteButtonProps {
  id: string;
  type: MediaType;
}

export function DeleteButton({ id, type }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch for portals
  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteMediaFromVault(id, type);
      toast.success("Item deleted from vault.");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete item.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        color="error"
        startIcon={<DeleteOutlineIcon />}
        sx={{ ml: { xs: 0, md: 'auto' }, width: { xs: '100%', md: 'auto' } }}
      >
        {isDeleting ? "Deleting..." : "Delete Item"}
      </Button>

      {mounted && showConfirm && createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ position: "fixed" }}>
          <div 
            className="glass-card w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4"
            style={{ boxShadow: "var(--shadow-glow-sm)", borderColor: "color-mix(in srgb, var(--color-violet-500) 15%, transparent)" }}
          >
            <h2 className="text-lg font-bold text-white">Delete Item?</h2>
            <p className="text-sm text-[var(--color-lunar-200)]">
              Delete this item from the Vault? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <Button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                sx={{ color: "var(--color-lunar-300)", '&:hover': { bgcolor: "rgba(255,255,255,0.05)", color: "white" } }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="contained"
                color="error"
                disableElevation
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
