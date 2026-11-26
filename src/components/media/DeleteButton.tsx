/**
 * @module
 *
 * Delete button with a confirmation dialog for removing media items from the vault.
 * Uses a React Portal for the confirmation overlay so it always renders above everything else.
 * After a successful deletion the user is redirected to the dashboard ("/").
 */
"use client"

import { useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import { deleteMediaFromVault } from "@/lib/actions/mediaActions"
import type { MediaType } from "@/lib/supabase/database.types"
import { toast } from "sonner"
import { VaultTooltip } from "@/components/ui/VaultTooltip"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined"

/**
 * Props accepted by the DeleteButton component.
 */
export interface DeleteButtonProps {
  /**
   * UUID of the media item to delete.
   */
  id: string
  /**
   * Type of the item (used for contextual messaging).
   */
  type: MediaType
}

const emptySubscribe = () => () => {}

/**
 * Renders a "Delete Item" button that opens a portal confirmation dialog.
 * The `mounted` state guard avoids React hydration mismatches for the portal.
 */
export function DeleteButton({ id, type }: DeleteButtonProps) {
  /**
   * Next.js router instance for handling client-side navigation.
   */
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  // Avoid hydration mismatch for portals
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  /**
   * Prompts for confirmation and deletes the selected media item from the vault.
   */
  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteMediaFromVault(id)
      toast.success("Item deleted from vault.")
      router.push("/")
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete item.")
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <VaultTooltip label="Delete Item" enabled={!isDeleting} placement="top">
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={isDeleting}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 shadow-xs transition-all hover:bg-red-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400"
          aria-label="Delete Item"
        >
          <DeleteOutlineIcon
            className="text-red-500 dark:text-red-400"
            sx={{ fontSize: 14, color: "#ef4444 !important", fill: "#ef4444 !important" }}
          />
          <span>{isDeleting ? "Deleting..." : "Delete"}</span>
        </button>
      </VaultTooltip>

      {isMounted &&
        showConfirm &&
        createPortal(
          <div
            className="animate-fade-in fixed inset-0 z-150 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm dark:bg-black/80"
            style={{ position: "fixed" }}
          >
            <div className="bg-surface-elevated border-border flex w-full max-w-sm flex-col gap-4 rounded-xl border p-6 shadow-2xl">
              <h2 className="text-foreground text-base font-semibold tracking-tight">
                Delete {type}?
              </h2>
              <p className="text-muted text-xs leading-relaxed">
                Delete this {type} from the Vault? This action cannot be undone.
              </p>
              <div className="mt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="border-border bg-surface text-muted hover:text-foreground cursor-pointer rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="cursor-pointer rounded-lg border border-red-400/30 bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-red-950/50 transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
