// src/components/media/ReadingTimer.tsx
"use client";

import { useState, useEffect } from "react";

interface ReadingTimerProps {
  itemId: string;
  onStop: (minutes: number) => void;
}

export function ReadingTimer({ itemId, onStop }: ReadingTimerProps) {
  const storageKey = `reading_timer_start_${itemId}`;
  
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedStart = localStorage.getItem(storageKey);
    if (savedStart) {
      const startTime = parseInt(savedStart, 10);
      setElapsedMs(Date.now() - startTime);
      setIsRunning(true);
    }
  }, [storageKey]);

  // Tick the timer
  useEffect(() => {
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

  const handleToggle = () => {
    if (isRunning) {
      // Stop the timer
      const savedStart = localStorage.getItem(storageKey);
      let finalMs = 0;
      if (savedStart) {
        finalMs = Date.now() - parseInt(savedStart, 10);
      }
      
      // Calculate minutes (minimum 1 minute if they ran it at all)
      let minutes = Math.floor(finalMs / 60000);
      if (minutes === 0 && finalMs > 0) minutes = 1;
      
      localStorage.removeItem(storageKey);
      setIsRunning(false);
      setElapsedMs(0);
      
      if (minutes > 0) {
        onStop(minutes);
      }
    } else {
      // Start the timer
      localStorage.setItem(storageKey, Date.now().toString());
      setElapsedMs(0);
      setIsRunning(true);
    }
  };

  // Format MM:SS or HH:MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="flex items-center gap-4 bg-[var(--color-lunar-950)] border border-[var(--color-lunar-800)] p-3 rounded-xl mb-4">
      <button
        onClick={handleToggle}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
          isRunning 
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
            : "bg-[var(--color-violet-500)]/20 text-[var(--color-violet-300)] hover:bg-[var(--color-violet-500)]/40"
        }`}
        title={isRunning ? "Stop Reading Session" : "Start Reading Session"}
      >
        {isRunning ? "⏹" : "▶"}
      </button>
      
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wider text-[var(--color-lunar-500)] font-semibold">
          {isRunning ? "Reading now..." : "Live Stopwatch"}
        </span>
        <span className={`font-mono text-xl font-bold ${isRunning ? "text-white" : "text-[var(--color-lunar-600)]"}`}>
          {formatTime(elapsedMs)}
        </span>
      </div>
      
      {isRunning && (
        <div className="ml-auto flex gap-1 items-end h-4">
           {/* Simple animated equalizer/dots to indicate activity */}
           <span className="w-1 bg-[var(--color-violet-400)] rounded-full animate-bounce" style={{ height: "60%" }} />
           <span className="w-1 bg-[var(--color-violet-400)] rounded-full animate-bounce" style={{ height: "100%", animationDelay: "150ms" }} />
           <span className="w-1 bg-[var(--color-violet-400)] rounded-full animate-bounce" style={{ height: "40%", animationDelay: "300ms" }} />
        </div>
      )}
    </div>
  );
}
