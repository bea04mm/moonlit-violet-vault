"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { VaultWrappedData } from "@/lib/services/mediaService";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MovieIcon from "@mui/icons-material/Movie";
import TvIcon from "@mui/icons-material/Tv";
import StarIcon from "@mui/icons-material/Star";
import Image from "next/image";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

interface Props {
  data: VaultWrappedData;
}

export function WrappedPresentation({ data }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") window.history.back();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const slides = [
    // Slide 0: Intro
    <div key="intro" className="flex flex-col items-center justify-center h-auto my-auto py-8 text-center space-y-6 px-6 relative z-30">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-24 h-24 rounded-full bg-[var(--color-violet-500)]/20 flex items-center justify-center text-[var(--color-violet-300)] shadow-[0_0_60px_rgba(157,77,255,0.4)]"
      >
        <AutoAwesomeIcon sx={{ fontSize: 48 }} />
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-5xl md:text-7xl font-display font-bold text-gradient-violet leading-tight"
      >
        Your {data.year} <br/> Vault Wrapped
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xl text-[var(--color-lunar-300)]"
      >
        Let&apos;s look back at the worlds you explored.
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        onClick={nextSlide}
        className="relative mt-8 px-8 py-4 rounded-full bg-[var(--color-violet-600)] hover:bg-[var(--color-violet-500)] text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(157,77,255,0.3)] flex items-center gap-2 pointer-events-auto"
      >
        Start <PlayArrowIcon />
      </motion.button>
    </div>,

    // Slide 1: Total Volume
    <div key="volume" className="flex flex-col items-center justify-center h-auto my-auto py-8 text-center space-y-12 px-6">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-5xl font-display font-bold text-[var(--color-lunar-50)]"
      >
        This year, you escaped reality <br/>
        <span className="text-gradient-violet text-6xl md:text-8xl block mt-4">{data.totalFinished}</span> times.
      </motion.h2>
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 w-full max-w-3xl">
        {[
          { label: "Movies", count: data.moviesFinished, icon: <MovieIcon fontSize="large" />, color: "var(--color-violet-400)" },
          { label: "Series", count: data.seriesFinished, icon: <TvIcon fontSize="large" />, color: "var(--color-starlight-400)" },
          { label: "Books", count: data.booksFinished, icon: <MenuBookIcon fontSize="large" />, color: "var(--color-lunar-300)" },
          { label: "Recipes", count: data.recipesFinished, icon: <RestaurantMenuIcon fontSize="large" />, color: "var(--color-blossom-500)" },
        ].filter(i => i.count > 0).map((item, i) => (
          <motion.div 
            key={item.label}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 + (i * 0.2), type: "spring" }}
            className="glass-card p-6 rounded-3xl border border-[var(--color-lunar-800)] flex flex-col items-center flex-1 min-w-[120px]"
          >
            <div style={{ color: item.color }} className="mb-2">{item.icon}</div>
            <div className="text-3xl font-bold text-white">{item.count}</div>
            <div className="text-sm text-[var(--color-lunar-500)] uppercase tracking-wider font-semibold">{item.label}</div>
          </motion.div>
        ))}
      </div>
    </div>,

    // Slide 2: Time Invested
    <div key="time" className="flex flex-col items-center justify-center h-auto my-auto py-8 text-center space-y-10 px-6">
      <motion.h2 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-3xl md:text-5xl font-display font-bold text-[var(--color-lunar-50)] leading-tight"
      >
        That&apos;s a lot of time <br/> spent in other worlds.
      </motion.h2>
      
      <div className="w-full max-w-lg space-y-6 text-left relative z-30">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-3xl border border-[var(--color-violet-500)]/30 bg-[var(--color-violet-500)]/5 flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--color-violet-500)]/20 flex items-center justify-center text-[var(--color-violet-400)] shrink-0">
            <AccessTimeIcon fontSize="large" />
          </div>
          <div>
            <div className="text-4xl font-bold text-white">{data.moviesHours + data.seriesHours} <span className="text-xl text-[var(--color-lunar-400)] font-normal">hours</span></div>
            <div className="text-sm text-[var(--color-violet-300)] mt-1">Watching movies & series</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 rounded-3xl border border-[var(--color-starlight-500)]/30 bg-[var(--color-starlight-500)]/5 flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--color-starlight-500)]/20 flex items-center justify-center text-[var(--color-starlight-400)] shrink-0">
            <MenuBookIcon fontSize="large" />
          </div>
          <div>
            <div className="text-4xl font-bold text-white">{data.booksPages.toLocaleString()} <span className="text-xl text-[var(--color-lunar-400)] font-normal">pages</span></div>
            <div className="text-sm text-[var(--color-starlight-300)] mt-1">Read across all books</div>
          </div>
        </motion.div>
      </div>
    </div>,

    // Slide 3: Genres
    <div key="genres" className="flex flex-col items-center justify-center h-auto my-auto py-8 text-center space-y-10 px-6">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-5xl font-display font-bold text-[var(--color-lunar-50)]"
      >
        Your vibe was definitely...
      </motion.h2>
      <div className="w-full max-w-md space-y-4">
        {data.topGenres.length > 0 ? data.topGenres.map((g, i) => (
          <motion.div 
            key={g.name}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ delay: 0.3 + (i * 0.15), duration: 0.6 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-lunar-800)]/50 border border-[var(--color-lunar-800)] relative overflow-hidden"
          >
            <div 
              className="absolute left-0 top-0 bottom-0 bg-[var(--color-violet-500)]/20" 
              style={{ width: `${(g.count / data.topGenres[0].count) * 100}%` }}
            />
            <span className="text-lg font-bold text-white z-10 truncate mr-3 flex-1 text-left">{g.name}</span>
            <span className="text-sm font-semibold text-[var(--color-violet-300)] z-10 whitespace-nowrap">{g.count} titles</span>
          </motion.div>
        )) : (
          <p className="text-[var(--color-lunar-400)]">Not enough data yet. Read or watch more!</p>
        )}
      </div>
    </div>,

    // Slide 4: Top Items
    <div key="favorites" className="flex flex-col items-center justify-center h-auto my-auto py-8 text-center space-y-6 px-4">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-5xl font-display font-bold text-[var(--color-lunar-50)] leading-tight"
      >
        The absolute best of the year.
      </motion.h2>
      <p className="text-[var(--color-lunar-400)] text-sm max-w-sm mx-auto">Your highest rated discoveries.</p>
      
      <div className="grid grid-cols-3 gap-3 md:gap-6 mt-4 max-w-2xl w-full">
        {data.topItems.length > 0 ? data.topItems.slice(0, 3).map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="aspect-[2/3] rounded-2xl overflow-hidden relative shadow-lg group"
          >
            {item.cover_url ? (
              <Image src={item.cover_url} alt={item.title} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-[var(--color-lunar-800)] flex items-center justify-center p-4 text-center">
                <span className="text-sm font-bold opacity-50">{item.title}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 opacity-100">
              <span className="text-white font-bold text-sm truncate">{item.title}</span>
              {item.user_rating && (
                <span className="text-[var(--color-starlight-400)] text-xs font-bold flex items-center gap-1 mt-1">
                  <StarIcon sx={{ fontSize: 14 }} /> {item.user_rating}/5
                </span>
              )}
            </div>
          </motion.div>
        )) : (
          <p className="text-[var(--color-lunar-400)] col-span-full">Rate some titles to see your top picks!</p>
        )}
      </div>
    </div>,

    // Slide 5: Summary Card
    <div key="summary" className="flex flex-col items-center justify-center h-auto my-auto py-8 text-center space-y-8 px-6">
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-display font-bold text-white"
      >
        Ready for next year?
      </motion.h2>
      
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-8 rounded-[2rem] border-2 border-[var(--color-violet-500)] max-w-sm w-full bg-gradient-to-b from-[var(--color-violet-900)]/40 to-[var(--color-lunar-950)] text-left shadow-[0_0_50px_rgba(157,77,255,0.2)]"
      >
        <div className="flex items-center gap-2 mb-6 text-[var(--color-violet-300)]">
          <AutoAwesomeIcon /> <span className="font-bold tracking-widest uppercase text-sm">Vault Wrapped {data.year}</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-[var(--color-lunar-800)] pb-2">
            <span className="text-[var(--color-lunar-400)] text-sm uppercase">Total Escapes</span>
            <span className="text-2xl font-bold text-white">{data.totalFinished}</span>
          </div>
          <div className="flex justify-between items-end border-b border-[var(--color-lunar-800)] pb-2">
            <span className="text-[var(--color-lunar-400)] text-sm uppercase">Screen Time</span>
            <span className="text-xl font-bold text-white">{data.moviesHours + data.seriesHours}h</span>
          </div>
          <div className="flex justify-between items-end border-b border-[var(--color-lunar-800)] pb-2">
            <span className="text-[var(--color-lunar-400)] text-sm uppercase">Pages Read</span>
            <span className="text-xl font-bold text-white">{data.booksPages.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-end pt-2">
            <span className="text-[var(--color-lunar-400)] text-sm uppercase whitespace-nowrap">Top Vibe</span>
            <span className="text-lg font-bold text-[var(--color-violet-400)] truncate ml-4 text-right">{data.topGenres[0]?.name || "Unknown"}</span>
          </div>
        </div>
      </motion.div>
    </div>
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-lunar-950)] flex flex-col overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-violet-500)]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[var(--color-starlight-500)]/10 blur-[150px] rounded-full" />
      </div>

      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 z-50 flex gap-2">
        {slides.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 bg-[var(--color-lunar-800)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--color-violet-400)] transition-all duration-300"
              style={{ width: i <= currentSlide ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Slides Container */}
      <div className="flex-1 relative z-10 flex items-center justify-center overflow-y-auto overflow-x-hidden pt-12 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="w-full min-h-full pointer-events-none flex flex-col justify-center"
          >
            {slides[currentSlide]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Areas (Left/Right Tap) */}
      <div className="absolute inset-0 z-20 flex pt-12">
        <button className="flex-1 h-full cursor-w-resize focus:outline-none focus-visible:bg-white/5" onClick={prevSlide} aria-label="Previous slide" />
        <button className="flex-[2] h-full cursor-e-resize focus:outline-none focus-visible:bg-white/5" onClick={nextSlide} aria-label="Next slide" />
      </div>

      {/* Exit Button */}
      <button 
        onClick={() => window.history.back()}
        className="absolute top-8 right-6 z-50 text-[var(--color-lunar-400)] hover:text-white font-bold tracking-wider text-sm uppercase cursor-pointer pointer-events-auto"
      >
        Close
      </button>
    </div>
  );
}
