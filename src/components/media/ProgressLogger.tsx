"use client";

import { useState } from "react";
import type { MediaItem, MediaStatus, SeasonData } from "@/lib/supabase/database.types";
import { updateMediaProgress } from "@/lib/actions/mediaActions";
import { STATUS_LABELS } from "@/lib/constants";
import { ReadingTimer } from "./ReadingTimer";
import { toast } from "sonner";
import { Autocomplete, TextField, Chip } from "@mui/material";

interface ProgressLoggerProps {
  item: MediaItem;
}

export function ProgressLogger({ item }: ProgressLoggerProps) {
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  
  // Local state for edits
  const [status, setStatus] = useState<MediaStatus>(item.status);
  const [rating, setRating] = useState<number>(item.user_rating || 0);
  const [review, setReview] = useState<string>(item.user_notes || "");
  const [tags, setTags] = useState<string[]>(item.tags || []);
  
  // Progress state
  const [pagesRead, setPagesRead] = useState<number>(item.pages_read || 0);
  const [totalPages, setTotalPages] = useState<number>(item.total_pages || 0);
  const [readingTime, setReadingTime] = useState<number>(item.reading_time_minutes || 0);
  const [sessionMinutes, setSessionMinutes] = useState<number>(0);
  
  const [episodesSeen, setEpisodesSeen] = useState<number>(item.episodes_seen || 0);
  const [episodeCount, setEpisodeCount] = useState<number>(item.episode_count || 0);
  const [seasonProgress, setSeasonProgress] = useState<Record<string, SeasonData>>((item.season_progress as Record<string, SeasonData>) || {});

  const [runtimeMinutes, setRuntimeMinutes] = useState<number>(item.runtime_minutes || 0);

  // Journal State
  const [startDate, setStartDate] = useState<string>(item.start_date ? item.start_date.substring(0, 10) : "");
  const [endDate, setEndDate] = useState<string>(item.date_completed ? item.date_completed.substring(0, 10) : "");
  const [sessionNotes, setSessionNotes] = useState<string>("");

  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);

  const hasUnsavedNotes = review !== (item.user_notes || "") || sessionNotes.trim() !== "" || sessionMinutes > 0;

  // --- Auto-Save Helpers ---
  async function commitUpdate(updates: Partial<MediaItem>) {
    try {
      await updateMediaProgress(item.id, updates);
    } catch (error) {
      console.error("Failed to auto-save:", error);
      toast.error("Failed to auto-save progress.");
    }
  }

  const toggleEpisode = (seasonNum: string, epNum: string) => {
    const sData = seasonProgress[seasonNum];
    if (!sData || !sData.episodes) return;
    
    const epData = sData.episodes[epNum];
    if (!epData) return;

    const newWatchedState = !epData.watched;
    const newWatchedCount = sData.watched + (newWatchedState ? 1 : -1);

    const newSeasonData = {
      ...sData,
      watched: newWatchedCount,
      episodes: {
        ...sData.episodes,
        [epNum]: { ...epData, watched: newWatchedState }
      }
    };

    const newSeasonProgress = {
      ...seasonProgress,
      [seasonNum]: newSeasonData
    };

    setSeasonProgress(newSeasonProgress);

    const finalEpisodesSeen = Object.values(newSeasonProgress).reduce((acc, curr) => acc + curr.watched, 0);
    const finalEpisodeCount = Object.values(newSeasonProgress).reduce((acc, curr) => acc + curr.total, 0);
    
    let newStatus = status;
    if (finalEpisodeCount > 0 && finalEpisodesSeen >= finalEpisodeCount) {
      newStatus = "watched";
      setStatus("watched");
    }

    setEpisodesSeen(finalEpisodesSeen);

    commitUpdate({
      season_progress: newSeasonProgress as Record<string, any>,
      episodes_seen: finalEpisodesSeen,
      status: newStatus
    });
  };

  const handleAddPages = async (newPages: number, newTotal: number) => {
    let newStatus = status;
    if (newTotal > 0 && newPages >= newTotal) {
      newStatus = "read";
      setStatus("read");
    }
    await commitUpdate({ pages_read: newPages, total_pages: newTotal > 0 ? newTotal : null, status: newStatus });
  };

  // --- Manual Save for Text Notes ---
  async function handleSaveNotes() {
    setIsSavingNotes(true);
    try {
      let newReadingSessions = item.reading_sessions || [];
      if (item.type === "book" && (sessionMinutes > 0 || sessionNotes.trim() !== "")) {
        const pagesDelta = Math.max(0, pagesRead - (item.pages_read || 0));
        newReadingSessions = [
          ...newReadingSessions,
          {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            minutes: sessionMinutes,
            pages_read: pagesDelta,
            notes: sessionNotes.trim()
          }
        ];
      }

      await updateMediaProgress(item.id, {
        user_notes: review.trim() === "" ? null : review.trim(),
        reading_time_minutes: readingTime + sessionMinutes,
        reading_sessions: newReadingSessions.length > 0 ? newReadingSessions : null,
      });
      
      if (sessionMinutes > 0) setReadingTime(prev => prev + sessionMinutes);
      setSessionMinutes(0);
      setSessionNotes("");
      toast.success("Notes saved successfully!");
    } catch (error) {
      toast.error("Failed to save notes. Please try again.");
    } finally {
      setIsSavingNotes(false);
    }
  }

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => {
              setRating(star);
              commitUpdate({ user_rating: star });
            }}
            className={`text-2xl transition-transform hover:scale-110 ${rating >= star ? "text-[var(--color-starlight-400)]" : "text-[var(--color-lunar-700)]"}`}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <button 
            onClick={() => { setRating(0); commitUpdate({ user_rating: null }); }} 
            className="text-xs text-[var(--color-lunar-500)] ml-2 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6">

      {/* Global: Status & Rating */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-lunar-500)] mb-1 uppercase tracking-wider">Status</label>
          <select 
            value={status} 
            onChange={(e) => {
              const val = e.target.value as MediaStatus;
              setStatus(val);
              commitUpdate({ status: val });
            }}
            className="w-full bg-[var(--color-lunar-950)] border border-[var(--color-lunar-800)] rounded-xl px-3 py-2 text-sm text-[var(--color-lunar-200)] focus:outline-none focus:border-[var(--color-violet-500)]"
          >
            {Object.entries(STATUS_LABELS)
              .filter(([val]) => {
                if (item.type === "book") return ["read", "reading", "want_to_read", "dropped", "on_hold"].includes(val);
                return ["watched", "watching", "want_to_watch", "dropped", "on_hold"].includes(val);
              })
              .map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-lunar-500)] mb-1 uppercase tracking-wider">Rating</label>
          {renderStars()}
        </div>
      </div>

      {/* Global: Tags */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-lunar-500)] mb-1 uppercase tracking-wider">Collections / Tags</label>
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={tags}
          onChange={(_, newValue) => {
            setTags(newValue);
            commitUpdate({ tags: newValue });
          }}
          sx={{
            "& .MuiChip-root": {
              color: "var(--color-violet-300)",
              borderColor: "var(--color-violet-500)",
              bgcolor: "rgba(139, 92, 246, 0.1)",
              border: "1px solid",
              "& .MuiChip-deleteIcon": {
                color: "var(--color-violet-400)",
              },
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Add tags..."
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "var(--color-lunar-200)",
                  bgcolor: "var(--color-lunar-950)",
                  borderRadius: "12px",
                  "& fieldset": { borderColor: "var(--color-lunar-800)" },
                  "&:hover fieldset": { borderColor: "var(--color-violet-500)" },
                  "&.Mui-focused fieldset": { borderColor: "var(--color-violet-400)" },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "var(--color-lunar-500)",
                  opacity: 1,
                },
              }}
            />
          )}
        />
      </div>

      {/* Global: Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-lunar-500)] mb-1 uppercase tracking-wider">Start Date</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            onBlur={(e) => commitUpdate({ start_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className="w-full bg-[var(--color-lunar-950)] border border-[var(--color-lunar-800)] rounded-xl px-3 py-2 text-sm text-[var(--color-lunar-200)] focus:outline-none focus:border-[var(--color-violet-500)] style-color-scheme-dark" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-lunar-500)] mb-1 uppercase tracking-wider">End Date</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            onBlur={(e) => commitUpdate({ date_completed: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className="w-full bg-[var(--color-lunar-950)] border border-[var(--color-lunar-800)] rounded-xl px-3 py-2 text-sm text-[var(--color-lunar-200)] focus:outline-none focus:border-[var(--color-violet-500)] style-color-scheme-dark" 
          />
        </div>
      </div>

      {/* Type-Specific Logging */}
      {item.type === "book" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--color-lunar-200)]">Pages Read</span>
            <span className="text-sm text-[var(--color-lunar-400)]">{pagesRead} / {totalPages || "?"}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--color-lunar-500)] mb-1">Current Page</label>
              <input 
                type="number" min="0" value={pagesRead} 
                onChange={(e) => setPagesRead(Number(e.target.value))} 
                onBlur={(e) => handleAddPages(Number(e.target.value), totalPages)}
                className="w-full bg-[var(--color-lunar-950)] border border-[var(--color-lunar-800)] rounded-lg px-3 py-2 text-sm text-white" 
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-lunar-500)] mb-1">Total Pages</label>
              <input 
                type="number" min="0" value={totalPages} 
                onChange={(e) => setTotalPages(Number(e.target.value))} 
                onBlur={(e) => handleAddPages(pagesRead, Number(e.target.value))}
                className="w-full bg-[var(--color-lunar-950)] border border-[var(--color-lunar-800)] rounded-lg px-3 py-2 text-sm text-white" 
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/5">
             <ReadingTimer 
               itemId={item.id} 
               onStop={(mins) => setSessionMinutes(prev => prev + mins)} 
             />

             <label className="block text-xs text-[var(--color-lunar-500)] mb-1 mt-4">Or add manual Session Duration (Minutes)</label>
             <div className="flex gap-2">
               <input type="number" min="0" placeholder="+ Add minutes" value={sessionMinutes || ""} onChange={(e) => setSessionMinutes(Number(e.target.value))} className="flex-1 bg-[var(--color-lunar-950)] border border-[var(--color-lunar-800)] rounded-lg px-3 py-2 text-sm text-white" />
               <span className="flex items-center text-xs text-[var(--color-lunar-500)]">Total: {readingTime + sessionMinutes}m</span>
             </div>
             
             <label className="block text-xs text-[var(--color-lunar-500)] mt-3 mb-1">Session Notes</label>
             <textarea rows={2} placeholder="Write a quick note for this reading session..." value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} className="w-full bg-[var(--color-lunar-950)] border border-[var(--color-lunar-800)] rounded-lg px-3 py-2 text-sm text-white resize-none" />
          </div>
        </div>
      )}

      {item.type === "series" && Object.keys(seasonProgress).length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
            <span className="text-sm font-semibold text-[var(--color-lunar-200)] flex items-center gap-2">
              Episode Guide
            </span>
            <span className="text-sm text-[var(--color-lunar-400)]">
              {Object.values(seasonProgress).reduce((acc, curr) => acc + Object.values(curr.episodes || {}).filter((ep: any) => ep.watched).length, 0)} / {Object.values(seasonProgress).reduce((acc, curr) => acc + Object.keys(curr.episodes || {}).length, 0)}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {Object.entries(seasonProgress).map(([seasonNumber, data]) => {
              const isExpanded = expandedSeason === seasonNumber;
              const hasDetailedEpisodes = data.episodes && Object.keys(data.episodes).length > 0;
              
              return (
                <div key={seasonNumber} className="flex flex-col rounded-xl bg-[var(--color-lunar-950)] overflow-hidden border border-white/5">
                  <div 
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedSeason(isExpanded ? null : seasonNumber)}
                  >
                    <span className="text-sm font-semibold text-[var(--color-lunar-200)]">
                      {seasonNumber === "0" ? "Specials" : `Season ${seasonNumber}`}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[var(--color-lunar-400)] bg-black/40 px-2 py-1 rounded-md">
                        {Object.values(data.episodes || {}).filter((ep: any) => ep.watched).length} / {Object.keys(data.episodes || {}).length}
                      </span>
                      <span className="text-[var(--color-lunar-500)] text-xs">
                        {isExpanded ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>
                  
                  {isExpanded && hasDetailedEpisodes && (
                    <div className="flex flex-col border-t border-white/5 divide-y divide-white/5 bg-black/20">
                      {Object.entries(data.episodes)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([epNum, ep]) => (
                        <div key={epNum} className={`p-3 flex gap-3 hover:bg-white/5 transition-colors ${ep.watched ? "opacity-60" : ""}`}>
                          
                          {/* Checkbox */}
                          <div className="pt-1">
                            <button
                              onClick={() => toggleEpisode(seasonNumber, epNum)}
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                ep.watched 
                                  ? "bg-[var(--color-violet-500)] border-[var(--color-violet-500)] text-white" 
                                  : "border-[var(--color-lunar-600)] hover:border-[var(--color-violet-400)]"
                              }`}
                            >
                              {ep.watched && <span className="text-xs">✓</span>}
                            </button>
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h4 className={`text-sm font-semibold truncate ${ep.watched ? "line-through text-[var(--color-lunar-500)]" : "text-[var(--color-lunar-200)]"}`}>
                                {epNum}. {ep.title}
                              </h4>
                              <div className="flex flex-col items-end shrink-0 gap-1">
                                {ep.runtime_minutes && (
                                  <span className="text-[10px] bg-[var(--color-lunar-800)] px-1.5 py-0.5 rounded text-[var(--color-lunar-400)]">
                                    {ep.runtime_minutes}m
                                  </span>
                                )}
                                {ep.air_date && (
                                  <span className="text-[10px] text-[var(--color-lunar-600)]">
                                    {ep.air_date}
                                  </span>
                                )}
                              </div>
                            </div>
                            {ep.overview && (
                              <p className="text-xs text-[var(--color-lunar-500)] line-clamp-2 leading-relaxed">
                                {ep.overview}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {isExpanded && !hasDetailedEpisodes && (
                     <div className="p-4 text-center text-xs text-[var(--color-lunar-500)]">
                        Detailed episode data is not available for this season.
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legacy Fallback if series has no seasonProgress */}
      {item.type === "series" && Object.keys(seasonProgress).length === 0 && (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--color-lunar-200)]">Episodes Watched</span>
            <span className="text-sm text-[var(--color-lunar-400)]">{episodesSeen} / {episodeCount || "?"}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--color-lunar-500)] mb-1">Watched</label>
              <input 
                type="number" min="0" value={episodesSeen} 
                onChange={(e) => setEpisodesSeen(Number(e.target.value))} 
                onBlur={(e) => commitUpdate({ episodes_seen: Number(e.target.value) })}
                className="w-full bg-[var(--color-lunar-950)] border border-[var(--color-lunar-800)] rounded-lg px-3 py-2 text-sm text-white" 
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-lunar-500)] mb-1">Total Episodes</label>
              <input 
                type="number" min="0" value={episodeCount} 
                onChange={(e) => setEpisodeCount(Number(e.target.value))} 
                onBlur={(e) => commitUpdate({ episode_count: Number(e.target.value) })}
                className="w-full bg-[var(--color-lunar-950)] border border-[var(--color-lunar-800)] rounded-lg px-3 py-2 text-sm text-white" 
              />
            </div>
          </div>
        </div>
      )}

      {(item.type === "movie" || item.type === "series") && (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div>
            <label className="block text-xs text-[var(--color-lunar-500)] mb-1">
              {item.type === "movie" ? "Runtime (Minutes)" : "Avg. Episode Runtime (Minutes)"}
            </label>
            <input 
              type="number" min="0" value={runtimeMinutes} 
              onChange={(e) => setRuntimeMinutes(Number(e.target.value))} 
              onBlur={(e) => commitUpdate({ runtime_minutes: Number(e.target.value) })}
              className="w-full bg-[var(--color-lunar-950)] border border-[var(--color-lunar-800)] rounded-lg px-3 py-2 text-sm text-white" 
            />
          </div>
        </div>
      )}

      {/* Global: Review Textbox */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-lunar-500)] mb-1 uppercase tracking-wider">Review / Critique</label>
        <textarea 
          rows={4}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write thoughts here..."
          className="w-full bg-[var(--color-lunar-950)] border border-[var(--color-lunar-800)] rounded-xl px-4 py-3 text-sm text-[var(--color-lunar-200)] focus:outline-none focus:border-[var(--color-violet-500)] resize-none"
        />
      </div>

      {/* Conditional Footer Button for Notes */}
      {hasUnsavedNotes && (
        <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-white/5 animate-fade-in">
          <button 
            onClick={handleSaveNotes}
            disabled={isSavingNotes}
            className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold bg-[var(--color-violet-600)] text-white hover:bg-[var(--color-violet-500)] transition-colors disabled:opacity-50"
          >
            {isSavingNotes ? "Saving..." : "Save Notes"}
          </button>
        </div>
      )}
    </div>
  );
}
