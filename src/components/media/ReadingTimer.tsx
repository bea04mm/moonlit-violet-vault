/**
 * @module
 *
 * Live stopwatch component for tracking reading sessions.
 * The start time is persisted in `localStorage` keyed by item ID so the timer
 * survives page refreshes and browser restarts. When stopped, the elapsed
 * minutes are passed back to the parent (ProgressLogger) via `onStop`.
 * Rounds up to at least 1 minute so very short sessions are still counted.
 */
"use client"

import { useState, useEffect } from "react"
import { VaultTooltip } from "@/components/ui/VaultTooltip"

/**
 * Props for ReadingTimer.
 */
export interface ReadingTimerProps {
  /**
   * UUID of the book being read — used as part of the localStorage key.
   */
  itemId: string
  /**
   * Called when the user stops the timer.
   * @param minutes - Elapsed reading time in whole minutes (minimum 1).
   */
  onStop: (minutes: number) => void
}

/**
 * Client component for the live reading timer.
 */
export function ReadingTimer({ itemId, onStop }: ReadingTimerProps) {
  /**
   * Unique localStorage key for persisting the active reading session timer across reloads.
   */
  const storageKey = `reading_timer_start_${itemId}`

  const [isRunning, setIsRunning] = useState(() => {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem(storageKey)
  })

  const [elapsedMs, setElapsedMs] = useState(() => {
    if (typeof window === "undefined") return 0
    const savedStart = localStorage.getItem(storageKey)
    return savedStart ? Math.max(0, Date.now() - parseInt(savedStart, 10)) : 0
  })

  // Tick the timer
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        const savedStart = localStorage.getItem(storageKey)
        if (savedStart) {
          const startTime = parseInt(savedStart, 10)
          setElapsedMs(Date.now() - startTime)
        }
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, storageKey])

  /**
   * Toggles the reading timer between running and stopped states, committing elapsed time when stopped.
   */
  const handleToggle = () => {
    if (isRunning) {
      // Stop the timer
      const savedStart = localStorage.getItem(storageKey)
      let finalMs = 0
      if (savedStart) {
        // Calculate total elapsed time since timer started
        finalMs = Date.now() - parseInt(savedStart, 10)
      }

      // Calculate minutes (minimum 1 minute if they ran it at all)
      let minutes = Math.floor(finalMs / 60000)
      if (minutes === 0 && finalMs > 0) minutes = 1

      // Clean up storage and reset state
      localStorage.removeItem(storageKey)
      setIsRunning(false)
      setElapsedMs(0)

      if (minutes > 0) {
        onStop(minutes)
      }
    } else {
      // Start the timer and persist start time
      localStorage.setItem(storageKey, Date.now().toString())
      setElapsedMs(0)
      setIsRunning(true)
    }
  }

  // Format MM:SS or HH:MM:SS
  const formatTime = (ms: number) => {
    /**
     * Total elapsed session time converted to seconds.
     */
    const totalSeconds = Math.floor(ms / 1000)
    /**
     * Calculated hours from the total elapsed seconds.
     */
    const hours = Math.floor(totalSeconds / 3600)
    /**
     * Calculated remaining minutes from the total elapsed seconds.
     */
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    /**
     * Calculated remaining seconds from the total elapsed seconds.
     */
    const seconds = totalSeconds % 60
    /**
     * Helper function to pad time numbers with a leading zero if below 10.
     */
    const pad = (n: number) => n.toString().padStart(2, "0")

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }
    return `${pad(minutes)}:${pad(seconds)}`
  }

  return (
    <div className="bg-surface border-border mb-4 flex items-center gap-3 rounded-xl border p-3">
      <VaultTooltip
        label={isRunning ? "Stop Reading Session" : "Start Reading Session"}
        placement="top"
      >
        <button
          type="button"
          onClick={handleToggle}
          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-xs transition-colors ${
            isRunning
              ? "border border-rose-500/40 bg-rose-500/20 text-rose-600 hover:bg-rose-500/30 dark:text-rose-300"
              : "bg-primary hover:bg-primary-hover text-primary-fg shadow-sm"
          }`}
          aria-label={isRunning ? "Stop Reading Session" : "Start Reading Session"}
        >
          {isRunning ? "⏹" : "▶"}
        </button>
      </VaultTooltip>

      <div className="flex flex-col">
        <span className="text-primary text-[10px] font-medium tracking-wider uppercase">
          {isRunning ? "Reading now..." : "Live Stopwatch"}
        </span>
        <span
          className={`font-mono text-base font-semibold ${isRunning ? "text-primary font-bold" : "text-foreground"}`}
        >
          {formatTime(elapsedMs)}
        </span>
      </div>

      {isRunning && (
        <div className="ml-auto flex h-3.5 items-end gap-1">
          {/* Simple animated equalizer/dots to indicate activity */}
          <span className="bg-primary w-1 animate-bounce rounded-full" style={{ height: "60%" }} />
          <span
            className="bg-primary w-1 animate-bounce rounded-full"
            style={{ height: "100%", animationDelay: "150ms" }}
          />
          <span
            className="bg-primary w-1 animate-bounce rounded-full"
            style={{ height: "40%", animationDelay: "300ms" }}
          />
        </div>
      )}
    </div>
  )
}
