/**
 * Full detail view for a single vault item.
 * 
 * @packageDocumentation
 */
/* eslint-disable react/no-unescaped-entities, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { MediaItem, MediaStatus } from "@/lib/supabase/database.types";
import { Badge } from "@/components/ui/Badge";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  TYPE_LABELS,
} from "@/lib/constants";
import { formatRating, getCoverPlaceholder } from "@/lib/utils/formatters";
import Link from "next/link";
import { ProgressLogger } from "./ProgressLogger";
import { DeleteButton } from "./DeleteButton";
import { BookMatchFixer } from "./BookMatchFixer";
import { updateMediaProgress } from "@/lib/actions/mediaActions";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarIcon from "@mui/icons-material/Star";
import { useRouter } from "next/navigation";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ReactMarkdown from "react-markdown";

/**
 * Props interface for the MediaDetailProps.
 */
export interface MediaDetailProps {
  item: MediaItem;
}

/**
 * Main detail view component for any media type.
 * Handles the Favourite toggle internally.
 */
export function MediaDetail({ item }: MediaDetailProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [activeTab, setActiveTab] = useState<"overview" | "progress">("overview");
  const [isFavorite, setIsFavorite] = useState<boolean>(item.is_favorite);
  const [currentStatus, setCurrentStatus] = useState<MediaStatus>(item.status);
  /**
   * Resolved URL for the item's cover image, falling back to a placeholder if missing.
   */
  const coverSrc = item.cover_url ?? getCoverPlaceholder(item.title);
  /**
   * Next.js router instance for handling client-side navigation.
   */
  const router = useRouter();

  return (
    <article className="relative min-h-[calc(100vh-4rem)] flex flex-col animate-fade-in">


      {/* Main Content */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-2 lg:py-4 flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
        
        {/* Left Column: Cover */}
        <div className="w-full md:w-1/3 lg:w-1/4 shrink-0 flex flex-col gap-6">
          <div className="flex justify-between items-center md:hidden mb-4">
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-lunar-400 hover:text-white transition-colors w-fit cursor-pointer">
              ← Back
            </button>
            <DeleteButton id={item.id} type={item.type} />
          </div>
          
          <div 
            className="relative w-full aspect-2/3 rounded-3xl overflow-hidden border"
            style={{
              borderColor: "color-mix(in srgb, var(--color-violet-500) 25%, transparent)",
              boxShadow: "var(--shadow-glow-md)",
            }}
          >
            <Image
              src={coverSrc}
              alt={`Cover for ${item.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              priority
              unoptimized
            />
          </div>

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {item.type === "recipe" ? (
              <button
                onClick={async () => {
                  const newStatus = currentStatus === "cooked" ? "want_to_cook" : "cooked";
                  setCurrentStatus(newStatus);
                  await updateMediaProgress(item.id, { status: newStatus });
                }}
                className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
                title="Click to toggle status"
              >
                <Badge className={STATUS_COLORS[currentStatus]}>
                  {STATUS_LABELS[currentStatus]}
                </Badge>
              </button>
            ) : (
              <Badge className={STATUS_COLORS[currentStatus]}>
                {STATUS_LABELS[currentStatus]}
              </Badge>
            )}
            <Badge variant="violet" className="opacity-80">
              {TYPE_LABELS[item.type]}
            </Badge>
            {item.user_rating && (
              <Badge variant="glass" className="gap-1 flex items-center">
                <StarIcon sx={{ color: "var(--color-starlight-400)", fontSize: 16 }} />
                {formatRating(item.user_rating)}
              </Badge>
            )}
          </div>
          
          <button
            onClick={async () => {
              const newFav = !isFavorite;
              setIsFavorite(newFav);
              await updateMediaProgress(item.id, { is_favorite: newFav });
            }}
            className={`flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-2xl border transition-all shadow-(--shadow-card) font-semibold cursor-pointer ${
              isFavorite 
                ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" 
                : "bg-(--color-lunar-900) border-[color-mix(in_srgb,var(--color-violet-500)_20%,transparent)] text-lunar-300 hover:bg-[color-mix(in_srgb,var(--color-violet-500)_10%,transparent)]"
            }`}
          >
            <div className={`transition-transform flex items-center justify-center ${isFavorite ? "scale-110" : "opacity-70"}`}>
              {isFavorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </div>
            {isFavorite ? "Favorited" : "Add to Favorites"}
          </button>
          
          {item.type === "book" && <BookMatchFixer item={item} />}
        </div>

        {/* Right Column: Details */}
        <div className="flex-1 w-full flex flex-col gap-6">
          <div className="hidden md:flex justify-between items-center w-full">
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-lunar-400 hover:text-white transition-colors w-fit cursor-pointer">
              ← Back
            </button>
            <div className="flex items-center gap-4">
              {item.type === "recipe" && (
                <Link 
                  href={`/recipes/${item.id}/edit`}
                  className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Edit Recipe
                </Link>
              )}
              <DeleteButton id={item.id} type={item.type} />
            </div>
          </div>

          <div>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-2"
              style={{ color: "var(--color-lunar-50)" }}
            >
              {item.title}
            </h1>
            
            {(item.original_title && item.original_title !== item.title) && (
              <h2 className="text-xl italic text-lunar-500 mb-4">
                {item.original_title}
              </h2>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-lunar-400">
              {item.release_year && (
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  {item.release_year}
                </span>
              )}
              {(item.author ?? item.director) && (
                <span className="font-medium text-violet-300">
                  {item.type === "recipe" ? "Source: " : item.type === "book" ? "By " : "Directed by "} {item.author ?? item.director}
                </span>
              )}
            </div>
          </div>

          {/* Genres */}
          {item.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {item.genres.map((genre) => (
                <span 
                  key={genre}
                  className="text-xs px-2.5 py-1 rounded-md bg-lunar-800 text-lunar-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Progress Display Grid - Always Visible */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {item.type === "book" && item.pages_read > 0 && (
              <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-lunar-500 text-xs uppercase tracking-wider mb-1">Pages Read</span>
                <span className="text-2xl font-bold text-white">{item.pages_read}</span>
                {item.total_pages && <span className="text-xs text-lunar-500 mt-1">of {item.total_pages}</span>}
              </div>
            )}
            {item.type === "book" && item.reading_time_minutes > 0 && (
              <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-lunar-500 text-xs uppercase tracking-wider mb-1">Reading Time</span>
                <span className="text-2xl font-bold text-white">{item.reading_time_minutes}m</span>
              </div>
            )}
            {item.type === "series" && (
              <>
                <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-lunar-500 text-xs uppercase tracking-wider mb-1">Episodes</span>
                  <span className="text-2xl font-bold text-white">{item.episodes_seen || 0}</span>
                  {item.episode_count && <span className="text-xs text-lunar-500 mt-1">of {item.episode_count}</span>}
                </div>
                {item.season_count && item.season_count > 0 && (
                  <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-lunar-500 text-xs uppercase tracking-wider mb-1">Seasons</span>
                    <span className="text-2xl font-bold text-white">{item.season_count}</span>
                  </div>
                )}
                {item.episode_count && item.episode_count > 0 && (
                  <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-lunar-500 text-xs uppercase tracking-wider mb-1">Progress</span>
                    <span className="text-2xl font-bold text-white">
                      {Math.round(((item.episodes_seen || 0) / item.episode_count) * 100)}%
                    </span>
                  </div>
                )}
              </>
            )}
            {item.type === "movie" && item.runtime_minutes && (
              <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-lunar-500 text-xs uppercase tracking-wider mb-1">Runtime</span>
                <span className="text-2xl font-bold text-white">{item.runtime_minutes}m</span>
              </div>
            )}
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-6 border-b border-white/10 pb-4 mt-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`text-sm font-semibold pb-4 -mb-4 transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "text-violet-400 border-b-2 border-(--color-violet-500)"
                  : "text-lunar-500 hover:text-lunar-300"
              }`}
            >
              {item.type === "recipe" ? "Recipe Details" : "Overview & Review"}
            </button>
            {item.type !== "recipe" && (
              <button
                onClick={() => setActiveTab("progress")}
                className={`text-sm font-semibold pb-4 -mb-4 transition-all cursor-pointer ${
                  activeTab === "progress"
                    ? "text-violet-400 border-b-2 border-(--color-violet-500)"
                    : "text-lunar-500 hover:text-lunar-300"
                }`}
              >
                Log Progress
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "overview" && (
              <div className="animate-fade-in space-y-10">
                {/* Synopsis */}
                {item.synopsis && (
                  <div className="max-w-none">
                    <h3 className="text-lg font-semibold text-lunar-200 mb-2">Synopsis</h3>
                    <div className="text-lunar-400 leading-relaxed text-sm md:text-base">
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                          strong: ({node, ...props}) => <strong className="text-lunar-100 font-bold" {...props} />,
                          em: ({node, ...props}) => <em className="text-violet-300 italic" {...props} />,
                          br: ({node, ...props}) => <br {...props} />,
                        }}
                      >
                        {item.synopsis}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Recipe Details */}
                {item.type === "recipe" && (
                  <div className="space-y-8">
                    {item.ingredients && item.ingredients.length > 0 && (
                      <div className="max-w-none">
                        <h3 className="text-lg font-semibold text-lunar-200 mb-3">Ingredients</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-lunar-400 text-sm md:text-base">
                          {item.ingredients.map((ing, i) => (
                            <li key={i}>{ing}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.instructions && item.instructions.length > 0 && (
                      <div className="max-w-none">
                        <h3 className="text-lg font-semibold text-lunar-200 mb-3">Instructions</h3>
                        <div className="space-y-4 text-lunar-400 leading-relaxed text-sm md:text-base">
                          {item.instructions.map((step, i) => (
                            <div key={i} className="flex gap-4">
                              <span className="font-bold text-violet-400 shrink-0">{i + 1}.</span>
                              <p>{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Review / Notes */}
                {item.user_notes && (
                  <div className="p-5 rounded-2xl border border-[color-mix(in_srgb,var(--color-violet-500)_20%,transparent)] bg-(--color-violet-500)/5">
                    <h3 className="text-sm font-semibold text-violet-300 mb-2 flex items-center gap-2">
                      <RateReviewIcon fontSize="small" /> My Review
                    </h3>
                    <p className="text-sm text-lunar-300 leading-relaxed italic">
                      "{item.user_notes}"
                    </p>
                  </div>
                )}

                {/* Reading Journal Timeline */}
                {item.type === "book" && item.reading_sessions && item.reading_sessions.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-xl font-display font-bold text-lunar-100 mb-6 flex items-center gap-2">
                      <AutoStoriesIcon /> Reading Journal
                    </h3>
                    <div className="relative border-l-2 border-lunar-800 ml-3 space-y-6">
                      {item.reading_sessions.map((session: any, index: number) => (
                        <div key={session.id || index} className="relative pl-6">
                          <div className="absolute -left-1.25 top-4 w-2.5 h-2.5 rounded-full bg-(--color-violet-500) shadow-[0_0_10px_var(--color-violet-500)]" />
                          <div className="bg-(--color-lunar-900) border border-[color-mix(in_srgb,var(--color-violet-500)_15%,transparent)] rounded-2xl p-4 shadow-(--shadow-card)">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                              <span className="text-sm font-semibold text-lunar-200 capitalize">
                                {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                              <div className="flex gap-2">
                                {session.pages_read > 0 && (
                                  <Badge variant="glass" className="text-xs">
                                    +{session.pages_read} pages
                                  </Badge>
                                )}
                                {session.minutes > 0 && (
                                  <Badge variant="glass" className="text-xs flex items-center gap-1">
                                    <AccessTimeIcon sx={{ fontSize: 14 }} /> {session.minutes}m
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {session.notes && (
                              <p className="text-sm text-lunar-400 leading-relaxed italic mt-2">
                                "{session.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Links */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-lunar-800">
                  {item.tmdb_id && (
                    <a href={`https://www.themoviedb.org/${item.type === "movie" ? "movie" : "tv"}/${item.tmdb_id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-medium text-violet-400 hover:text-white transition-colors hover:underline">
                      View on TMDB <OpenInNewIcon sx={{ fontSize: 14 }} />
                    </a>
                  )}
                  {item.google_books_id && (
                    <a href={`https://books.google.com/books?id=${item.google_books_id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-medium text-violet-400 hover:text-white transition-colors hover:underline">
                      View on Google Books <OpenInNewIcon sx={{ fontSize: 14 }} />
                    </a>
                  )}
                  {item.goodreads_id && (
                    <a href={`https://www.goodreads.com/book/show/${item.goodreads_id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-medium text-violet-400 hover:text-white transition-colors hover:underline">
                      View on Goodreads <OpenInNewIcon sx={{ fontSize: 14 }} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {activeTab === "progress" && (
              <div className="animate-fade-in -mt-8">
                {/* We apply a negative top margin because ProgressLogger has an mt-8 baked in, or we just let it be. */}
                <ProgressLogger item={item} />
              </div>
            )}
          </div>

        </div>
      </div>
    </article>
  );
}

