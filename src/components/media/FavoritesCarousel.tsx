/**
 * Horizontal auto-scrolling carousel of favourite media items shown on the dashboard.
 * Uses the Embla Carousel library with the Autoplay plugin.
 * Items are duplicated in the `displayItems` array to ensure the infinite loop
 * is always visually seamless even when the vault has fewer than 10 favourites.
 * 
 * @packageDocumentation
 */
"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { MediaCard } from "./MediaCard";
import type { MediaItem } from "@/lib/supabase/database.types";

/**
 * Auto-playing carousel that loops through the user's favourite vault items.
 * @param items - The full list of favourites; duplicated internally if count < 10.
 */
export function FavoritesCarousel({ items }: { items: MediaItem[] }) {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: "start", skipSnaps: false },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

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
      className="overflow-hidden px-[calc(7.5vw-1rem)] sm:px-[calc((100%-26rem)/2)] md:px-0"
      ref={emblaRef}
    >
      <div className="flex pb-4">
        {displayItems.map((item, index) => (
          <div 
            key={`${item.id}-${index}`} 
            className="mr-4 w-[85vw] sm:w-92 md:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)] h-40 sm:h-48 shrink-0"
          >
            <MediaCard item={item} disableGestures={true} priority={index < 3} />
          </div>
        ))}
      </div>
    </div>
  );
}
