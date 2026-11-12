/**
 * Full-screen slideshow presentation mimicking Spotify Wrapped.
 * Powered by Framer Motion for slide transitions.
 *
 * @packageDocumentation
 */
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { VaultWrappedData } from "@/lib/services/mediaService"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import MovieIcon from "@mui/icons-material/Movie"
import TvIcon from "@mui/icons-material/Tv"
import StarIcon from "@mui/icons-material/Star"
import Image from "next/image"
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu"

/**
 * Props for the WrappedPresentation component.
 */
export interface Props {
  /**
   * VaultWrappedData object computed on the server for the requested year.
   */
  data: VaultWrappedData
}

/**
 * A full-screen interactive slideshow for "Vault Wrapped".
 * Handles keyboard navigation (Arrow keys, Enter, Space, Escape) internally.
 */
export function WrappedPresentation({ data }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0)

  /**
   * Advances the slideshow to the next slide, clamping to the final slide index.
   */
  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))
  /**
   * Returns the slideshow to the previous slide, clamping to the initial slide index (0).
   */
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0))

  useEffect(() => {
    /**
     * Handles keyboard events for navigation through the wrapped presentation.
     * Maps arrow keys, enter, and spacebar to next/prev actions, and Escape to closing the presentation.
     *
     * @param e - The keyboard event triggered by the user.
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") nextSlide()
      if (e.key === "ArrowLeft") prevSlide()
      if (e.key === "Enter") nextSlide()
      if (e.key === "Escape") window.history.back()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Collection of slides rendered in the presentation. Each slide contains unique
   * animations and statistics representing user data for the year.
   */
  const slides = [
    // Slide 0: Intro
    <div
      key="intro"
      className="relative z-30 my-auto flex h-auto flex-col items-center justify-center space-y-6 px-6 py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-surface border-border text-primary flex h-16 w-16 items-center justify-center rounded-xl border"
      >
        <span className="font-handwriting text-2xl select-none">vault</span>
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="font-display text-foreground text-4xl leading-tight font-semibold tracking-tight md:text-6xl"
      >
        {data.year} <br />
        <span className="text-primary font-normal">Vault Wrapped</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-muted max-w-md font-sans text-base sm:text-lg"
      >
        A curated review of the books, movies, series, and dishes that shaped your year.
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={nextSlide}
        className="bg-primary hover:bg-primary-hover text-primary-fg pointer-events-auto relative mt-4 flex cursor-pointer items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
      >
        Begin Review <PlayArrowIcon fontSize="small" />
      </motion.button>
    </div>,

    // Slide 1: Total Volume
    <div
      key="volume"
      className="my-auto flex h-auto flex-col items-center justify-center space-y-8 px-6 py-8 text-center"
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-foreground text-2xl font-semibold tracking-tight md:text-4xl"
      >
        Completed experiences this year: <br />
        <span className="text-primary mt-3 block font-mono text-5xl font-semibold md:text-7xl">
          {data.totalFinished}
        </span>
      </motion.h2>
      <div className="mt-6 flex w-full max-w-2xl flex-wrap justify-center gap-3 md:gap-4">
        {[
          { label: "Movies", count: data.moviesFinished, icon: <MovieIcon fontSize="small" /> },
          { label: "Series", count: data.seriesFinished, icon: <TvIcon fontSize="small" /> },
          { label: "Books", count: data.booksFinished, icon: <MenuBookIcon fontSize="small" /> },
          {
            label: "Recipes",
            count: data.recipesFinished,
            icon: <RestaurantMenuIcon fontSize="small" />,
          },
        ]
          .filter((i) => i.count > 0)
          .map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="bg-surface border-border flex min-w-28 flex-1 flex-col items-center rounded-xl border p-4 sm:p-5"
            >
              <div className="text-primary mb-1.5">{item.icon}</div>
              <div className="text-foreground font-mono text-2xl font-semibold">{item.count}</div>
              <div className="text-muted mt-0.5 font-mono text-xs tracking-wider uppercase">
                {item.label}
              </div>
            </motion.div>
          ))}
      </div>
    </div>,

    // Slide 2: Time Invested
    <div
      key="time"
      className="my-auto flex h-auto flex-col items-center justify-center space-y-8 px-6 py-8 text-center"
    >
      <motion.h2
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="font-display text-foreground text-2xl leading-tight font-semibold tracking-tight md:text-4xl"
      >
        Time dedicated to your catalog
      </motion.h2>

      <div className="relative z-30 w-full max-w-md space-y-3.5 text-left">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-surface border-border flex items-center gap-4 rounded-xl border p-4 sm:p-5"
        >
          <div className="bg-surface border-border text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
            <AccessTimeIcon fontSize="small" />
          </div>
          <div>
            <div className="text-foreground font-mono text-2xl font-semibold">
              {data.moviesHours + data.seriesHours}{" "}
              <span className="text-muted font-sans text-sm font-normal">hours</span>
            </div>
            <div className="text-muted mt-0.5 text-xs">Watched across movies & series</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-surface border-border flex items-center gap-4 rounded-xl border p-4 sm:p-5"
        >
          <div className="bg-surface border-border text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
            <MenuBookIcon fontSize="small" />
          </div>
          <div>
            <div className="text-foreground font-mono text-2xl font-semibold">
              {data.booksPages.toLocaleString()}{" "}
              <span className="text-muted font-sans text-sm font-normal">pages</span>
            </div>
            <div className="text-muted mt-0.5 text-xs">Read across literary discoveries</div>
          </div>
        </motion.div>
      </div>
    </div>,

    // Slide 3: Genres
    <div
      key="genres"
      className="my-auto flex h-auto flex-col items-center justify-center space-y-6 px-6 py-8 text-center"
    >
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-foreground text-2xl font-semibold tracking-tight md:text-4xl"
      >
        Top genres & categories
      </motion.h2>
      <div className="w-full max-w-sm space-y-2.5">
        {data.topGenres.length > 0 ? (
          data.topGenres.map((g, i) => (
            <motion.div
              key={g.name}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              className="bg-surface border-border relative flex items-center justify-between overflow-hidden rounded-lg border p-3 text-left"
            >
              <div
                className="bg-primary/10 absolute top-0 bottom-0 left-0"
                style={{ width: `${(g.count / data.topGenres[0].count) * 100}%` }}
              />
              <span className="text-foreground z-10 mr-2 flex-1 truncate text-xs font-medium">
                {g.name}
              </span>
              <span className="text-primary z-10 font-mono text-[11px] whitespace-nowrap">
                {g.count} titles
              </span>
            </motion.div>
          ))
        ) : (
          <p className="text-muted text-xs">Not enough data yet.</p>
        )}
      </div>
    </div>,

    // Slide 4: Top Items
    <div
      key="favorites"
      className="my-auto flex h-auto flex-col items-center justify-center space-y-5 px-4 py-8 text-center"
    >
      <motion.h2
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-foreground text-2xl leading-tight font-semibold tracking-tight md:text-4xl"
      >
        Top discoveries of the year
      </motion.h2>
      <p className="text-muted mx-auto max-w-sm text-xs">Highest rated selections.</p>

      <div className="mt-2 grid w-full max-w-xl grid-cols-3 gap-3">
        {data.topItems.length > 0 ? (
          data.topItems.slice(0, 3).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="border-border bg-surface group relative aspect-2/3 overflow-hidden rounded-xl border"
            >
              {item.cover_url ? (
                <Image
                  src={item.cover_url}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="bg-surface flex h-full w-full items-center justify-center p-3 text-center">
                  <span className="text-muted text-xs font-semibold">{item.title}</span>
                </div>
              )}
              <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/80 via-black/20 to-transparent p-2.5 text-left">
                <span className="truncate text-xs font-semibold text-white">{item.title}</span>
                {item.user_rating && (
                  <span className="text-primary mt-0.5 flex items-center gap-1 font-mono text-[11px]">
                    <StarIcon sx={{ fontSize: 12 }} /> {item.user_rating}/5
                  </span>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-muted col-span-full text-xs">Rate titles to highlight top picks.</p>
        )}
      </div>
    </div>,

    // Slide 5: Summary Card
    <div
      key="summary"
      className="my-auto flex h-auto flex-col items-center justify-center space-y-6 px-6 py-8 text-center"
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-display text-foreground text-2xl font-semibold tracking-tight md:text-3xl"
      >
        Your Year in Summary
      </motion.h2>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-surface border-border w-full max-w-xs rounded-xl border p-6 text-left shadow-lg sm:p-7"
      >
        <div className="border-border mb-5 flex items-baseline justify-between border-b pb-3">
          <span className="font-display text-foreground text-base font-semibold">
            Vault Wrapped
          </span>
          <span className="text-primary font-mono text-xs">{data.year}</span>
        </div>

        <div className="space-y-3">
          <div className="border-border-subtle flex items-baseline justify-between border-b pb-2">
            <span className="text-muted text-xs">Total Finished</span>
            <span className="text-foreground font-mono text-lg font-semibold">
              {data.totalFinished}
            </span>
          </div>
          <div className="border-border-subtle flex items-baseline justify-between border-b pb-2">
            <span className="text-muted text-xs">Screen Time</span>
            <span className="text-foreground font-mono text-base font-semibold">
              {data.moviesHours + data.seriesHours}h
            </span>
          </div>
          <div className="border-border-subtle flex items-baseline justify-between border-b pb-2">
            <span className="text-muted text-xs">Pages Read</span>
            <span className="text-foreground font-mono text-base font-semibold">
              {data.booksPages.toLocaleString()}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-muted text-xs">Top Genre</span>
            <span className="text-primary ml-3 truncate text-right text-xs font-semibold">
              {data.topGenres[0]?.name || "None"}
            </span>
          </div>
        </div>
      </motion.div>
    </div>,
  ]

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col overflow-hidden">
      {/* Progress Bars */}
      <div className="absolute top-4 right-4 left-4 z-50 flex gap-1.5">
        {slides.map((_, i) => (
          <div
            key={i}
            className="bg-surface border-border h-1 flex-1 overflow-hidden rounded-full border"
          >
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: i <= currentSlide ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>

      {/* Slides Container */}
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-x-hidden overflow-y-auto pt-12 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none flex min-h-full w-full flex-col justify-center"
          >
            {slides[currentSlide]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Areas (Left/Right Tap) */}
      <div className="absolute inset-0 z-20 flex pt-12">
        <button
          className="h-full flex-1 cursor-w-resize focus:outline-none focus-visible:bg-black/5 dark:focus-visible:bg-white/5"
          onClick={prevSlide}
          aria-label="Previous slide"
        />
        <button
          className="h-full flex-2 cursor-e-resize focus:outline-none focus-visible:bg-black/5 dark:focus-visible:bg-white/5"
          onClick={nextSlide}
          aria-label="Next slide"
        />
      </div>

      {/* Exit Button */}
      <button
        onClick={() => window.history.back()}
        className="text-muted hover:text-foreground bg-surface border-border hover:bg-surface-hover pointer-events-auto absolute top-7 right-6 z-50 cursor-pointer rounded border px-2.5 py-1 font-mono text-xs uppercase transition-colors"
      >
        Close (Esc)
      </button>
    </div>
  )
}
