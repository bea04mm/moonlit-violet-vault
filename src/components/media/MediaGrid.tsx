// src/components/media/MediaGrid.tsx
// Responsive grid layout for media cards.
// RSC converted to Client Component for Drag & Drop
"use client";

import { useState, useEffect } from "react";
import type { MediaItem } from "@/lib/supabase/database.types";
import { MediaCard } from "./MediaCard";
import NightlightIcon from "@mui/icons-material/Nightlight";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableMediaCard({ item }: { item: MediaItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
    position: isDragging ? "relative" : "static",
    touchAction: "none", // Prevent scrolling while dragging on mobile
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* We add pointer-events-none to child while dragging so drops work cleanly */}
      <div style={{ pointerEvents: isDragging ? "none" : "auto", height: "100%" }}>
        <MediaCard item={item} />
      </div>
    </div>
  );
}

interface MediaGridProps {
  items: MediaItem[];
  emptyMessage?: string;
}

export function MediaGrid({
  items: initialItems,
  emptyMessage = "Nothing here yet. Start adding to my vault!",
}: MediaGridProps) {
  const [items, setItems] = useState(initialItems);

  // Sync state if props change from server
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement before drag starts, allows clicks to pass through
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        // TODO: In a real app, call an API to update sort_order in Supabase here
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4">
          <NightlightIcon sx={{ fontSize: 48, color: "var(--color-violet-500)", opacity: 0.5 }} />
        </div>
        <p
          className="text-sm max-w-xs"
          style={{ color: "var(--color-lunar-500)" }}
        >
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <SortableMediaCard key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
