/* eslint-disable react-hooks/set-state-in-effect */
/**
 * @module
 * 
 * Live stopwatch component for tracking reading sessions.
 * The start time is persisted in `localStorage` keyed by item ID so the timer
 * survives page refreshes and browser restarts. When stopped, the elapsed
 * minutes are passed back to the parent (ProgressLogger) via `onStop`.
 * Rounds up to at least 1 minute so very short sessions are still counted.
 */
"use client";

import { useState, useEffect } from "react";

/**
 * Props for ReadingTimer.
 */
/**
 * Props interface for the ReadingTimerProps.
 */
export interface ReadingTimerProps {
  /**
   * UUID of the book being read — used as part of the localStorage key.
   */
  itemId: string;
  /**
   * Called when the user stops the timer.
   * @param minutes - Elapsed reading time in whole minutes (minimum 1).
   */
  onStop: (minutes: number) => void;
}

/**
 * Client component for the live reading timer.
 */
export function ReadingTimer({ itemId, onStop }: ReadingTimerProps) {
  /**
   * Unique localStorage key for persisting the active reading session timer across reloads.
   */
  const storageKey = `reading_timer_start_${itemId}`;
  
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Initialize from localStorage on mount
  useEffect(() => {
    /**
     * The timestamp indicating when the reading session timer was originally started.
     */
    const savedStart = localStorage.getItem(storageKey);
    if (savedStart) {
      const startTime = parseInt(savedStart, 10);
      setElapsedMs(Date.now() - startTime);
      setIsRunning(true);
    }
  }, [storageKey]);

  // Tick the timer
  useEffect(() => {
    /**
     * Reference to the setInterval timer used to update the elapsed reading time.
     */
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        const savedStart = localStorage.getItem(storageKey);
        if (savedStart) {
          const startTime = parseInt(savedStart, 10);
          setElapsedMs(Date.now() - startTime);
        }
      }, 1000); // update every second
    }

    return () => clearInterval(interval);
  }, [isRunning, storageKey]);

  /**
   * Toggles the reading timer between running and stopped states, committing elapsed time when stopped.
   */
  const handleToggle = () => {
    if (isRunning) {
      // Stop the timer
      const savedStart = localStorage.getItem(storageKey);
      let finalMs = 0;
      if (savedStart) {
        // Calculate total elapsed time since timer started
        finalMs = Date.now() - parseInt(savedStart, 10);
      }
      
      // Calculate minutes (minimum 1 minute if they ran it at all)
      let minutes = Math.floor(finalMs / 60000);
      if (minutes === 0 && finalMs > 0) minutes = 1;
      
      // Clean up storage and reset state
      localStorage.removeItem(storageKey);
      setIsRunning(false);
      setElapsedMs(0);
      
      if (minutes > 0) {
        onStop(minutes);
      }
    } else {
      // Start the timer and persist start time
      localStorage.setItem(storageKey, Date.now().toString());
      setElapsedMs(0);
      setIsRunning(true);
    }
  };

  // Format MM:SS or HH:MM:SS
  const formatTime = (ms: number) => {
    /**
     * Total elapsed session time converted to seconds.
     */
    const totalSeconds = Math.floor(ms / 1000);
    /**
     * Calculated hours from the total elapsed seconds.
     */
    const hours = Math.floor(totalSeconds / 3600);
    /**
     * Calculated remaining minutes from the total elapsed seconds.
     */
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    /**
     * Calculated remaining seconds from the total elapsed seconds.
     */
    const seconds = totalSeconds % 60;

    /**
     * Helper function to pad time numbers with a leading zero if below 10.
     */
    const pad = (n: number) => n.toString().padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="flex items-center gap-4 bg-(--color-lunar-950) border border-lunar-800 p-3 rounded-xl mb-4">
      <button
        onClick={handleToggle}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
          isRunning 
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
            : "bg-(--color-violet-500)/20 text-violet-300 hover:bg-(--color-violet-500)/40"
        }`}
        title={isRunning ? "Stop Reading Session" : "Start Reading Session"}
      >
        {isRunning ? "⏹" : "▶"}
      </button>
      
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wider text-lunar-500 font-semibold">
          {isRunning ? "Reading now..." : "Live Stopwatch"}
        </span>
        <span className={`font-mono text-xl font-bold ${isRunning ? "text-white" : "text-lunar-600"}`}>
          {formatTime(elapsedMs)}
        </span>
      </div>
      
      {isRunning && (
        <div className="ml-auto flex gap-1 items-end h-4">
           {/* Simple animated equalizer/dots to indicate activity */}
           <span className="w-1 bg-violet-400 rounded-full animate-bounce" style={{ height: "60%" }} />
           <span className="w-1 bg-violet-400 rounded-full animate-bounce" style={{ height: "100%", animationDelay: "150ms" }} />
           <span className="w-1 bg-violet-400 rounded-full animate-bounce" style={{ height: "40%", animationDelay: "300ms" }} />
        </div>
      )}
    </div>
  );
}
