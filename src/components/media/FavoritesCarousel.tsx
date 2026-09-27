"use client";

import React, { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { MediaCard } from "./MediaCard";
import type { MediaItem } from "@/lib/supabase/database.types";

export function FavoritesCarousel({ items }: { items: MediaItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", skipSnaps: false },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );
  
  const [isHovered, setIsHovered] = useState(false);

  // If we don't have enough items to fill a large desktop screen, Embla disables loop automatically.
  // We artificially duplicate the items until we have enough to force the infinite loop!
  const displayItems = [...items];
  if (items.length > 0) {
    while (displayItems.length < 10) {
      displayItems.push(...items);
    }
  }

  return (
    <div 
      className="overflow-hidden" 
      ref={emblaRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-4 pb-4">
        {displayItems.map((item, index) => (
          <div 
            key={`${item.id}-${index}`} 
            className="w-[85vw] sm:w-[350px] md:w-[400px] shrink-0"
          >
            <MediaCard item={item} disableGestures={true} />
          </div>
        ))}
      </div>
    </div>
  );
}
